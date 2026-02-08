import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../db/connection';
import { validate, validateLogin, validateRegister } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import nodemailer from 'nodemailer';

const router = express.Router();

// Ensure JWT_SECRET is a string
const JWT_SECRET: string = (process.env.JWT_SECRET || 'your-secret-key-change-in-production') as string;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Register
router.post('/register', validate(validateRegister), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return next(new AppError('User with this email already exists', 409));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with trial subscription (3 days)
    const result = await pool.query(
      `INSERT INTO users (
        email, password_hash, name, subscription_status, trial_start_date, subscription_end_date
      ) VALUES ($1, $2, $3, 'free', NULL, NULL) 
      RETURNING id, email, name, subscription_status, subscription_end_date, created_at`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];

    // Create default settings
    await pool.query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [user.id]
    );

    // Generate token
    const signOptions: SignOptions = {
      // @ts-ignore
      expiresIn: JWT_EXPIRES_IN,
    };
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.subscription_status },
      JWT_SECRET,
      signOptions
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscription_status,
        subscriptionEndDate: user.subscription_end_date,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Verify Code (Redeem Premium)
router.post('/verify-code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      console.log('Verify failed: Missing code or userId', { code, userId });
      return next(new AppError('Code and User ID are required', 400));
    }

    // Check code
    const codeResult = await pool.query(
      'SELECT * FROM redemption_codes WHERE code = $1 AND is_used = false',
      [code]
    );

    if (codeResult.rows.length === 0) {
      console.log('Verify failed: Invalid or used code', code);
      return next(new AppError('Invalid or used code', 400));
    }

    const redemptionCode = codeResult.rows[0];

    // Update user to PRO
    const userResult = await pool.query(
      `UPDATE users 
       SET subscription_status = 'pro', subscription_end_date = NOW() + INTERVAL '30 days' 
       WHERE id = $1 
       RETURNING id, subscription_status, subscription_end_date`,
      [userId]
    );

    // Mark code as used
    await pool.query(
      'UPDATE redemption_codes SET is_used = true, used_by = $1, used_at = NOW() WHERE id = $2',
      [userId, redemptionCode.id]
    );

    res.json({
      success: true,
      user: {
        subscriptionStatus: 'pro',
        subscriptionEndDate: userResult.rows[0].subscription_end_date
      }
    });

  } catch (error) {
    next(error);
  }
});

// Generate Code (Admin only)
router.post('/generate-code', authenticateToken, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In production, check for admin role/email here

    // Generate a random 8-character code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Insert into DB
    const result = await pool.query(
      'INSERT INTO redemption_codes (code) VALUES ($1) RETURNING code',
      [code]
    );

    res.json({
      success: true,
      code: result.rows[0].code
    });

  } catch (error) {
    next(error);
  }
});

// Payment Notification
router.post('/payment-notify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, username, paymentMethod, transactionId } = req.body;

    // TODO: Move email config to environment variables
    // For now, we mock the success if no SMTP is configured, or try to send if ENV is present.
    // Assuming the user will configure SMTP later.

    if (!process.env.SMTP_HOST) {
      console.log('Mock Email sent to admin:', { userId, username, paymentMethod });
      return res.json({ success: true, message: 'Notification received (Mock Mode)' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"KyatFlow System" <system@kyatflow.com>',
      to: process.env.ADMIN_EMAIL || 'admin@kyatflow.com', // User's email
      subject: `New Payment: ${username}`,
      text: `User ${username} (ID: ${userId}) claims to have paid via ${paymentMethod}.\nPlease verify and send them a code.`,
      html: `<p>User <b>${username}</b> (ID: ${userId}) claims to have paid via <b>${paymentMethod}</b>.</p><p>Please verify and send them a code.</p>`,
    });

    res.json({ success: true, message: 'Notification sent' });

  } catch (error) {
    console.error('Email error:', error);
    // Don't block the UI flow even if email fails
    res.json({ success: true, message: 'Notification logged' });
  }
});

// Login (Updated to return subscription info)
router.post('/login', validate(validateLogin), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, name, subscription_status, subscription_end_date FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Invalid email or password', 401));
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate token
    const signOptions: SignOptions = {
      // @ts-ignore
      expiresIn: JWT_EXPIRES_IN,
    };
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      signOptions
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscription_status,
        subscriptionEndDate: user.subscription_end_date,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user (Updated)
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const result = await pool.query(
      'SELECT id, email, name, avatar, created_at, subscription_status, subscription_end_date FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      user: {
        ...result.rows[0],
        subscriptionStatus: result.rows[0].subscription_status,
        subscriptionEndDate: result.rows[0].subscription_end_date
      }
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
});

// Start Trial
router.post('/start-trial', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const check = await pool.query('SELECT subscription_status FROM users WHERE id = $1', [userId]);
    if (check.rows.length === 0) return next(new AppError('User not found', 404));

    // Only allow if status is 'free' (or 'expired' if you want to allow re-trial, but typically not)
    if (check.rows[0].subscription_status !== 'free') {
      return next(new AppError('Trial already started or active subscription exists', 400));
    }

    const result = await pool.query(
      `UPDATE users 
       SET subscription_status = 'trial', 
           trial_start_date = NOW(), 
           subscription_end_date = NOW() + INTERVAL '3 days' 
       WHERE id = $1 
       RETURNING subscription_status, subscription_end_date`,
      [userId]
    );

    res.json({
      success: true, user: {
        subscriptionStatus: result.rows[0].subscription_status,
        subscriptionEndDate: result.rows[0].subscription_end_date
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Get All Users
router.get('/admin/users', authenticateToken, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic protection: check header secret or assume frontend handles it for now (MVP)
    // Production: Verify JWT role === 'admin'
    console.log('Admin users requested by:', (req as any).user?.email);
    const result = await pool.query(
      `SELECT id, email, name, subscription_status, subscription_end_date, created_at 
       FROM users ORDER BY created_at DESC LIMIT 100`
    );
    console.log(`Found ${result.rows.length} users`);
    res.json({ success: true, users: result.rows });
  } catch (error) {
    next(error);
  }
});

// Admin: Manually Update Status
router.post('/admin/update-status', authenticateToken, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, status, days } = req.body;

    if (!['free', 'trial', 'pro', 'expired'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    let query = `UPDATE users SET subscription_status = $1`;
    const params = [status];

    if (status === 'pro' || status === 'trial') {
      if (days) {
        query += `, subscription_end_date = NOW() + INTERVAL '${Number(days)} days'`;
      } else {
        // Default 30 days for pro manual add if not specified
        query += `, subscription_end_date = NOW() + INTERVAL '30 days'`;
      }
    } else {
      query += `, subscription_end_date = NULL`;
    }

    query += ` WHERE id = $2 RETURNING id, subscription_status, subscription_end_date`;
    params.push(userId);

    const result = await pool.query(query, params);

    res.json({ success: true, user: result.rows[0] });

  } catch (error) {
    next(error);
  }
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required', 400));

    // Find user
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Security: Don't reveal if user exists. Just return success.
      return res.json({ success: true, message: 'If account exists, email sent.' });
    }
    const user = result.rows[0];

    // Generate Token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save to DB
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );

    // Send Email
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465, // True for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3555'}/reset-password?token=${resetToken}`;

      await transporter.sendMail({
        from: `"KyatFlow Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
                <p>You requested a password reset.</p>
                <p>Click the link below to verify and reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link expires in 1 hour.</p>
                <p>If you did not request this, please ignore it.</p>
            `,
      });
      console.log(`Reset email sent to ${email}`);
    } else {
      console.log(`Mock Reset URL: http://localhost:3555/reset-password?token=${resetToken}`);
    }

    res.json({ success: true, message: 'If account exists, email sent.' });
  } catch (error) {
    next(error);
  }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return next(new AppError('Token and Password required', 400));

    if (newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    // Find user by token and expiry
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Invalid or expired token', 400));
    }
    const user = result.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, reset_token = NULL, reset_expires = NULL 
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    res.json({ success: true, message: 'Password reset successful. Please login.' });

  } catch (error) {
    next(error);
  }
});

export default router;

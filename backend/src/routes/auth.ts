import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../db/connection';
import { validate, validateLogin, validateRegister } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// Ensure JWT_SECRET is a string
const JWT_SECRET: string = (process.env.JWT_SECRET || 'your-secret-key-change-in-production') as string;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Register
router.post('/register', validate(validateRegister), async (req, res, next) => {
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

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
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
      // @ts-ignore - StringValue type is not exported but string values work correctly at runtime
      expiresIn: JWT_EXPIRES_IN,
    };
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
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
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate(validateLogin), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, name FROM users WHERE email = $1',
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
      // @ts-ignore - StringValue type is not exported but string values work correctly at runtime
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
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const result = await pool.query(
      'SELECT id, email, name, avatar, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
});

export default router;


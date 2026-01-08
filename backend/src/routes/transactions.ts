import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate, validateTransaction } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all transactions
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    
    // Optional query parameters
    const { startDate, endDate, type, category, partyId } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    const params: any[] = [userId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (partyId) {
      paramCount++;
      query += ` AND party_id = $${paramCount}`;
      params.push(partyId);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount),
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction by ID
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Transaction not found', 404));
    }

    const transaction = result.rows[0];
    res.json({
      success: true,
      data: {
        ...transaction,
        amount: parseFloat(transaction.amount),
        date: transaction.date,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create transaction
router.post('/', validate(validateTransaction), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { date, amount, type, category, paymentMethod, notes, receiptUrl, partyId } = req.body;

    // Verify party belongs to user if partyId is provided
    if (partyId) {
      const partyCheck = await pool.query(
        'SELECT id FROM parties WHERE id = $1 AND user_id = $2',
        [partyId, userId]
      );

      if (partyCheck.rows.length === 0) {
        return next(new AppError('Party not found', 404));
      }
    }

    // Insert transaction
    const result = await pool.query(
      `INSERT INTO transactions 
       (user_id, date, amount, type, category, payment_method, notes, receipt_url, party_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, date, amount, type, category, paymentMethod, notes || null, receiptUrl || null, partyId || null]
    );

    const transaction = result.rows[0];

    // Update party balance if partyId is provided
    if (partyId) {
      const balanceAdjustment = type === 'income' ? amount : -amount;
      await pool.query(
        'UPDATE parties SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [balanceAdjustment, partyId]
      );
    }

    res.status(201).json({
      success: true,
      data: {
        ...transaction,
        amount: parseFloat(transaction.amount),
        date: transaction.date,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update transaction
router.put('/:id', validate(validateTransaction), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { date, amount, type, category, paymentMethod, notes, receiptUrl, partyId } = req.body;

    // Get old transaction
    const oldResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (oldResult.rows.length === 0) {
      return next(new AppError('Transaction not found', 404));
    }

    const oldTransaction = oldResult.rows[0];

    // Revert old party balance if it had a party
    if (oldTransaction.party_id) {
      const oldBalanceAdjustment = oldTransaction.type === 'income' 
        ? -oldTransaction.amount 
        : oldTransaction.amount;
      await pool.query(
        'UPDATE parties SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [oldBalanceAdjustment, oldTransaction.party_id]
      );
    }

    // Verify new party belongs to user if partyId is provided
    if (partyId) {
      const partyCheck = await pool.query(
        'SELECT id FROM parties WHERE id = $1 AND user_id = $2',
        [partyId, userId]
      );

      if (partyCheck.rows.length === 0) {
        return next(new AppError('Party not found', 404));
      }
    }

    // Update transaction
    const result = await pool.query(
      `UPDATE transactions 
       SET date = $1, amount = $2, type = $3, category = $4, 
           payment_method = $5, notes = $6, receipt_url = $7, party_id = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [date, amount, type, category, paymentMethod, notes || null, receiptUrl || null, partyId || null, id, userId]
    );

    const transaction = result.rows[0];

    // Update new party balance if partyId is provided
    if (partyId) {
      const balanceAdjustment = type === 'income' ? amount : -amount;
      await pool.query(
        'UPDATE parties SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [balanceAdjustment, partyId]
      );
    }

    res.json({
      success: true,
      data: {
        ...transaction,
        amount: parseFloat(transaction.amount),
        date: transaction.date,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete transaction
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Get transaction
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Transaction not found', 404));
    }

    const transaction = result.rows[0];

    // Revert party balance if it had a party
    if (transaction.party_id) {
      const balanceAdjustment = transaction.type === 'income' 
        ? -transaction.amount 
        : transaction.amount;
      await pool.query(
        'UPDATE parties SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [balanceAdjustment, transaction.party_id]
      );
    }

    // Delete transaction
    await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;


import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate, validateParty } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all parties
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { type } = req.query;

    let query = 'SELECT * FROM parties WHERE user_id = $1';
    const params: any[] = [userId];

    if (type) {
      query += ' AND type = $2';
      params.push(type);
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        balance: parseFloat(row.balance),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Get party by ID
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM parties WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Party not found', 404));
    }

    const party = result.rows[0];
    res.json({
      success: true,
      data: {
        ...party,
        balance: parseFloat(party.balance),
        createdAt: party.created_at,
        updatedAt: party.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create party
router.post('/', validate(validateParty), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { name, phone, type, balance } = req.body;

    const result = await pool.query(
      `INSERT INTO parties (user_id, name, phone, type, balance)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, phone || null, type, balance || 0]
    );

    const party = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        ...party,
        balance: parseFloat(party.balance),
        createdAt: party.created_at,
        updatedAt: party.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update party
router.put('/:id', validate(validateParty), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, phone, type } = req.body;

    // Check if party exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM parties WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return next(new AppError('Party not found', 404));
    }

    // Update party (balance is managed through transactions)
    const result = await pool.query(
      `UPDATE parties 
       SET name = $1, phone = $2, type = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, phone || null, type, id, userId]
    );

    const party = result.rows[0];

    res.json({
      success: true,
      data: {
        ...party,
        balance: parseFloat(party.balance),
        createdAt: party.created_at,
        updatedAt: party.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete party
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if party has associated transactions
    const transactionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM transactions WHERE party_id = $1',
      [id]
    );

    if (parseInt(transactionsResult.rows[0].count) > 0) {
      return next(new AppError('Cannot delete party with associated transactions', 400));
    }

    // Check if party exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM parties WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return next(new AppError('Party not found', 404));
    }

    // Delete party
    await pool.query(
      'DELETE FROM parties WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Party deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get party transactions
router.get('/:id/transactions', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if party belongs to user
    const partyCheck = await pool.query(
      'SELECT id FROM parties WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (partyCheck.rows.length === 0) {
      return next(new AppError('Party not found', 404));
    }

    // Get transactions
    const result = await pool.query(
      'SELECT * FROM transactions WHERE party_id = $1 AND user_id = $2 ORDER BY date DESC',
      [id, userId]
    );

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

export default router;


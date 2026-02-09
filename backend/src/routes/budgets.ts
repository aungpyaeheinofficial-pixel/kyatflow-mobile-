
import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Get User Budgets
router.get('/', async (req, res, next) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.userId!;
        const result = await pool.query('SELECT * FROM budgets WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            // Return defaults if no budget set
            res.json({
                success: true,
                data: {
                    daily_limit: 0,
                    weekly_limit: 0,
                    monthly_limit: 0,
                    yearly_limit: 0
                }
            });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

// Update/Set Budgets
router.post('/', async (req, res, next) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.userId!;
        const { daily_limit, weekly_limit, monthly_limit, yearly_limit } = req.body;

        // Upsert logic
        const existing = await pool.query('SELECT user_id FROM budgets WHERE user_id = $1', [userId]);

        let result;
        if (existing.rows.length > 0) {
            result = await pool.query(
                `UPDATE budgets 
                 SET daily_limit = $1, weekly_limit = $2, monthly_limit = $3, yearly_limit = $4, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $5
                 RETURNING *`,
                [daily_limit || 0, weekly_limit || 0, monthly_limit || 0, yearly_limit || 0, userId]
            );
        } else {
            result = await pool.query(
                `INSERT INTO budgets (user_id, daily_limit, weekly_limit, monthly_limit, yearly_limit)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [userId, daily_limit || 0, weekly_limit || 0, monthly_limit || 0, yearly_limit || 0]
            );
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

export default router;

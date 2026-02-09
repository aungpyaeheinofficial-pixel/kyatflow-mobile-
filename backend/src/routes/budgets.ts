
import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get budget settings
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.body; // extracted by middleware
        const result = await pool.query('SELECT * FROM budgets WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.json({
                daily_limit: 0,
                weekly_limit: 0,
                monthly_limit: 0,
                yearly_limit: 0
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update budget settings
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userId, daily_limit, weekly_limit, monthly_limit, yearly_limit } = req.body;

        // Upsert budget
        const result = await pool.query(
            `INSERT INTO budgets (user_id, daily_limit, weekly_limit, monthly_limit, yearly_limit, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         daily_limit = EXCLUDED.daily_limit,
         weekly_limit = EXCLUDED.weekly_limit,
         monthly_limit = EXCLUDED.monthly_limit,
         yearly_limit = EXCLUDED.yearly_limit,
         updated_at = NOW()
       RETURNING *`,
            [userId, daily_limit || 0, weekly_limit || 0, monthly_limit || 0, yearly_limit || 0]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating budgets:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;

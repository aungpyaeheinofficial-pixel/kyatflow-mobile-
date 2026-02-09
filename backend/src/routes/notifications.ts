
import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Get Unread Notifications
router.get('/', async (req: AuthRequest, res, next) => {
    try {
        const userId = req.userId!;
        const result = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [userId]
        );
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        next(error);
    }
});

// Mark as Read
router.put('/:id/read', async (req: AuthRequest, res, next) => {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        await pool.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export default router;

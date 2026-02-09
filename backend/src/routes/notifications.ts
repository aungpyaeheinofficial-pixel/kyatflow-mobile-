
import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get unread notifications (limit 50 recent)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        // Fetch unread first, then recent read ones if needed
        const result = await pool.query(
            `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY is_read ASC, created_at DESC 
       LIMIT 50`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error marking notification read:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper to create notification (internal use, but maybe exposed for testing)
// We'll keep it internal to logic for now.

export default router;

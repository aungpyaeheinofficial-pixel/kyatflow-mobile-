import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get dashboard stats
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: any[] = [userId];
    let paramCount = 1;

    if (startDate || endDate) {
      dateFilter = ' AND date BETWEEN $' + (++paramCount) + ' AND $' + (++paramCount);
      params.push(startDate || new Date(0).toISOString());
      params.push(endDate || new Date().toISOString());
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = ' AND date >= $' + (++paramCount);
      params.push(thirtyDaysAgo.toISOString());
    }

    // Get total income
    const incomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = $1 AND type = 'income' ${dateFilter}`,
      params
    );

    // Get total expense
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE user_id = $1 AND type = 'expense' ${dateFilter}`,
      params
    );

    // Get total receivables (customers with positive balance)
    const receivablesResult = await pool.query(
      `SELECT COALESCE(SUM(balance), 0) as total 
       FROM parties 
       WHERE user_id = $1 AND type = 'customer' AND balance > 0`,
      [userId]
    );

    // Get total payables (suppliers with negative balance)
    const payablesResult = await pool.query(
      `SELECT COALESCE(SUM(ABS(balance)), 0) as total 
       FROM parties 
       WHERE user_id = $1 AND type = 'supplier' AND balance < 0`,
      [userId]
    );

    // Calculate total balance from transactions
    const balanceResult = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as total
       FROM transactions 
       WHERE user_id = $1`,
      [userId]
    );

    const totalIncome = parseFloat(incomeResult.rows[0].total);
    const totalExpense = parseFloat(expenseResult.rows[0].total);
    const receivables = parseFloat(receivablesResult.rows[0].total);
    const payables = parseFloat(payablesResult.rows[0].total);
    const totalBalance = parseFloat(balanceResult.rows[0].total);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netCashFlow: totalIncome - totalExpense,
        receivables,
        payables,
        totalBalance,
        pendingPayments: receivables + payables,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get category breakdown
router.get('/category-breakdown', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { type, startDate, endDate } = req.query;

    if (!type || (type !== 'income' && type !== 'expense')) {
      return res.status(400).json({ error: 'Type must be income or expense' });
    }

    let dateFilter = '';
    const params: any[] = [userId, type];
    let paramCount = 2;

    if (startDate || endDate) {
      dateFilter = ' AND date BETWEEN $' + (++paramCount) + ' AND $' + (++paramCount);
      params.push(startDate || new Date(0).toISOString());
      params.push(endDate || new Date().toISOString());
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = ' AND date >= $' + (++paramCount);
      params.push(thirtyDaysAgo.toISOString());
    }

    const result = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE user_id = $1 AND type = $2 ${dateFilter}
       GROUP BY category
       ORDER BY total DESC`,
      params
    );

    // Calculate total for percentage
    const total = result.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);

    const breakdown = result.rows.map(row => ({
      category: row.category,
      amount: parseFloat(row.total),
      count: parseInt(row.count),
      percentage: total > 0 ? Math.round((parseFloat(row.total) / total) * 100) : 0,
    }));

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
});

// Get daily cash flow
router.get('/daily-cashflow', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: any[] = [userId];
    let paramCount = 1;

    if (startDate || endDate) {
      dateFilter = ' AND date BETWEEN $' + (++paramCount) + ' AND $' + (++paramCount);
      params.push(startDate || new Date(0).toISOString());
      params.push(endDate || new Date().toISOString());
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = ' AND date >= $' + (++paramCount);
      params.push(thirtyDaysAgo.toISOString());
    }

    const result = await pool.query(
      `SELECT 
         DATE(date) as date,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = $1 ${dateFilter}
       GROUP BY DATE(date)
       ORDER BY DATE(date) ASC`,
      params
    );

    const dailyData = result.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      income: parseFloat(row.income),
      expense: parseFloat(row.expense),
      net: parseFloat(row.income) - parseFloat(row.expense),
    }));

    res.json({
      success: true,
      data: dailyData,
    });
  } catch (error) {
    next(error);
  }
});

// Get payment method breakdown
router.get('/payment-method-breakdown', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: any[] = [userId];
    let paramCount = 1;

    if (startDate || endDate) {
      dateFilter = ' AND date BETWEEN $' + (++paramCount) + ' AND $' + (++paramCount);
      params.push(startDate || new Date(0).toISOString());
      params.push(endDate || new Date().toISOString());
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = ' AND date >= $' + (++paramCount);
      params.push(thirtyDaysAgo.toISOString());
    }

    const result = await pool.query(
      `SELECT payment_method, 
         SUM(amount) as total, 
         COUNT(*) as count,
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE user_id = $1 ${dateFilter}
       GROUP BY payment_method
       ORDER BY total DESC`,
      params
    );

    const breakdown = result.rows.map(row => ({
      paymentMethod: row.payment_method,
      total: parseFloat(row.total),
      income: parseFloat(row.income),
      expense: parseFloat(row.expense),
      count: parseInt(row.count),
    }));

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


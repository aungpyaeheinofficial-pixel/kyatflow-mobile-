
import pool from './connection';

const migrate = async () => {
  try {
    console.log('Starting migration v4 (Budgets & Notifications)...');

    // 1. Create Budgets Table
    // Stores user-defined limits for different periods
    await pool.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        daily_limit DECIMAL(15, 2),
        weekly_limit DECIMAL(15, 2),
        monthly_limit DECIMAL(15, 2),
        yearly_limit DECIMAL(15, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created/Verified budgets table');

    // 2. Create Notifications Table
    // Stores alerts for exceeding budgets or other events
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created/Verified notifications table');

    // Index for faster notification retrieval
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);`);

    console.log('Migration v4 completed successfully');
  } catch (error) {
    console.error('Migration v4 failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

migrate();

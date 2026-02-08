
import pool from './connection';

const migrate = async () => {
    try {
        console.log('Starting migration v2...');

        // 1. Drop the old constraint
        // Note: The name might vary. If this fails on the server, you might need to find the exact constraint name.
        // Usually postgres names it table_column_check
        await pool.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_subscription_status_check;
    `);

        // 2. Add the new constraint including 'free'
        await pool.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_subscription_status_check 
      CHECK (subscription_status IN ('free', 'trial', 'pro', 'expired'));
    `);

        // 3. Update default value
        await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN subscription_status SET DEFAULT 'free';
    `);

        console.log('Migration v2 completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();

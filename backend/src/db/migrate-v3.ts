
import pool from './connection';

const migrate = async () => {
    try {
        console.log('Starting migration v3 (Reset Password Columns)...');

        // Add reset_token
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL;
    `);

        // Add reset_expires
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP NULL;
    `);

        // Add index on reset_token for faster lookup
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
    `);

        console.log('Migration v3 completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrate();

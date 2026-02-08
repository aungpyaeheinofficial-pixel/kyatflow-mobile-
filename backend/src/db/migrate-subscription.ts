
import pool from './connection';

async function migrateSubscription() {
    const client = await pool.connect();

    try {
        console.log('Starting subscription migration...');

        // Add columns if they don't exist
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_status') THEN
          ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'pro', 'expired'));
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='trial_start_date') THEN
          ALTER TABLE users ADD COLUMN trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_end_date') THEN
          ALTER TABLE users ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE;
        END IF;
      END
      $$;
    `);

        // Set trial end date for existing users (3 days from now if not set)
        await client.query(`
      UPDATE users 
      SET subscription_end_date = trial_start_date + INTERVAL '3 days' 
      WHERE subscription_end_date IS NULL AND subscription_status = 'trial';
    `);

        // Create redemption_codes table
        await client.query(`
      CREATE TABLE IF NOT EXISTS redemption_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT false,
        used_by UUID REFERENCES users(id),
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Insert some initial codes for testing
        await client.query(`
      INSERT INTO redemption_codes (code) VALUES 
      ('TRIAL-PRO-1'),
      ('TRIAL-PRO-2'),
      ('KYATFLOW-2024')
      ON CONFLICT (code) DO NOTHING;
    `);

        console.log('✅ Subscription migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    migrateSubscription()
        .then(() => {
            console.log('Migration process finished.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration process failed:', error);
            process.exit(1);
        });
}

export default migrateSubscription;

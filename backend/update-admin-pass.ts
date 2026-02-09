
import pool from './src/db/connection';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@kyatflow.com';
const NEW_PASSWORD = 'f+>2P5=6J+=N';

async function updateAdminPassword() {
    try {
        console.log('🔒 Updating Admin Password...');

        const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);

        // Check if admin exists
        const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [ADMIN_EMAIL]);

        if (checkUser.rows.length === 0) {
            console.log('⚠️ Admin user not found. Creating one...');
            await pool.query(
                `INSERT INTO users (email, password_hash, name, subscription_status)
         VALUES ($1, $2, 'Admin', 'pro')`,
                [ADMIN_EMAIL, passwordHash]
            );
            console.log('✅ Admin user created.');
        } else {
            await pool.query(
                'UPDATE users SET password_hash = $1 WHERE email = $2',
                [passwordHash, ADMIN_EMAIL]
            );
            console.log('✅ Admin password updated.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating password:', error);
        process.exit(1);
    }
}

updateAdminPassword();

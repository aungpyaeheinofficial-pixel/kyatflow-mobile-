import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.DB_PASSWORD) {
  console.error('❌ Error: DB_PASSWORD is not set in .env file');
  console.error('Please set DB_PASSWORD in backend/.env file');
  process.exit(1);
}

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kyatflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD as string, // Explicitly cast to string
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;


import { Pool } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool;

export async function connectDatabase(): Promise<void> {
  try {
    // Temporairement désactiver la connexion à la base de données
    logger.info('Database connection skipped (development mode)');
    return;

    /*
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'smart_city',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Tester la connexion
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('Database connected successfully');
    */
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}

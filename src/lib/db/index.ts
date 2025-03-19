// src/lib/db/index.ts
import { Pool, PoolClient, QueryResult as PgQueryResult } from 'pg';

// Determine DATABASE_URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create a singleton pool instance
const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log pool events for debugging
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Custom query result type
export type QueryResult<T> = {
  rows: T[];
  rowCount: number;
};

// Type for transaction callback function
export type TransactionFunction<T> = (client: PoolClient) => Promise<T>;

/**
 * Execute a query against the database
 */
export async function query<T>(
  text: string, 
  params: any[] = []
): Promise<QueryResult<T>> {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries for performance optimization
    if (duration > 500) {
      console.warn(`Slow query (${duration}ms): ${text}`);
    }
    
    return { 
      rows: result.rows as T[], 
      rowCount: result.rowCount 
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute queries within a transaction
 */
export async function transaction<T>(
  fn: TransactionFunction<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error, rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Gracefully close the pool (for tests or shutdown)
 */
export async function closePool(): Promise<void> {
  await pool.end();
}
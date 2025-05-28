// test-db-connection.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crm'
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
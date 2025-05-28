// setup-crm-database.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crm'
});

async function setupDatabase() {
  try {
    console.log('🚀 Setting up CRM database schema...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'src/lib/db/migrations/001_initial.sql'), 
      'utf8'
    );
    
    // Execute the migration
    await pool.query(migrationSQL);
    console.log('✅ Database schema created successfully!');
    
    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
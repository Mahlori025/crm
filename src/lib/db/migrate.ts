// src/lib/db/migrate.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Get all migration files
    const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ensure files are run in order
    
    for (const filename of migrationFiles) {
      // Check if migration has already been run
      const result = await pool.query(
        'SELECT * FROM migrations WHERE filename = $1',
        [filename]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ Migration ${filename} already executed, skipping...`);
        continue;
      }
      
      // Read and run migration
      console.log(`📝 Running migration: ${filename}`);
      const migrationPath = join(migrationsDir, filename);
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      
      await pool.query(migrationSQL);
      
      // Record migration
      await pool.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );
      
      console.log(`✅ Migration ${filename} completed successfully!`);
    }
    
    console.log('✅ All migrations completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
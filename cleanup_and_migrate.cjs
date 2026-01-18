const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function cleanupAndMigrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Drop existing tables if they exist
    console.log('🧹 Cleaning up existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS coaching_logs CASCADE;
      DROP TABLE IF EXISTS daily_tracking CASCADE;
      DROP TABLE IF EXISTS meals CASCADE;
      DROP TABLE IF EXISTS user_profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('✅ Existing tables dropped');
    
    // Read and execute the migration file
    console.log('📝 Running migrations...');
    const migrationSQL = fs.readFileSync('./drizzle/0000_simple_quentin_quire.sql', 'utf8');
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('🎉 Database is ready! You can now start the app with: pnpm dev');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanupAndMigrate();

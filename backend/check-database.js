require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkDatabase() {
  try {
    console.log('=== DATABASE CONNECTION INFO ===');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_DATABASE}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log('================================\n');
    
    // Check current database
    const dbResult = await pool.query('SELECT current_database(), current_schema()');
    console.log('Currently connected to:');
    console.log(`Database: ${dbResult.rows[0].current_database}`);
    console.log(`Schema: ${dbResult.rows[0].current_schema}\n`);
    
    // List all tables in the current database
    const tablesResult = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('=== TABLES IN DATABASE ===');
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found in the public schema!');
    } else {
      console.table(tablesResult.rows);
    }
    
    // Check if notifications table exists
    const notifCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);
    
    console.log(`\n✓ Notifications table exists: ${notifCheck.rows[0].exists}`);
    
    if (notifCheck.rows[0].exists) {
      const count = await pool.query('SELECT COUNT(*) FROM notifications');
      console.log(`✓ Number of notifications: ${count.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();

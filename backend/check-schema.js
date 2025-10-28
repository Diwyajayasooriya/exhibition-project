require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkSchema() {
  try {
    console.log('Checking notifications table structure...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Notifications table columns:');
    console.table(result.rows);
    
    // Also check if there are any notifications
    const countResult = await pool.query('SELECT COUNT(*) FROM notifications');
    console.log(`\nTotal notifications in table: ${countResult.rows[0].count}`);
    
    // Show a sample notification
    const sampleResult = await pool.query('SELECT * FROM notifications LIMIT 1');
    if (sampleResult.rows.length > 0) {
      console.log('\nSample notification:');
      console.log(sampleResult.rows[0]);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();

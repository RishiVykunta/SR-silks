const { Client } = require('pg');
require('dotenv').config();

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Tables in database:');
    res.rows.forEach(row => console.log('- ' + row.table_name));
    
    // Check users table columns
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log('\nColumns in "users" table:');
    columns.rows.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`));

  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await client.end();
  }
}

checkTables();

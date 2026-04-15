const { Client } = require('pg');
require('dotenv').config();

async function listUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT email FROM users LIMIT 10;');
    console.log('Registered Users:');
    res.rows.forEach(row => console.log('- ' + row.email));
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
  }
}

listUsers();

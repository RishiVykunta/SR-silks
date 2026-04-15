const { Client } = require('pg');
require('dotenv').config();

async function verifyAllUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database. Verifying all users...');
    const res = await client.query('UPDATE users SET is_verified = TRUE WHERE is_verified = FALSE');
    console.log(`Successfully verified ${res.rowCount} users.`);
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await client.end();
  }
}

verifyAllUsers();

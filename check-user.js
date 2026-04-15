const { Client } = require('pg');
require('dotenv').config();

async function getOTP() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT verification_code FROM users WHERE email = $1', ['arasavillirishi0@gmail.com']);
    if (res.rows.length > 0) {
      console.log('OTP for arasavillirishi0@gmail.com:', res.rows[0].verification_code);
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await client.end();
  }
}

getOTP();

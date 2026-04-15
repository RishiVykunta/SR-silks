const { Client } = require('pg');
require('dotenv').config();

async function addMissingColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database. Adding missing columns to "users" table...');

    const queries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP'
    ];

    for (const queryStr of queries) {
      try {
        await client.query(queryStr);
        console.log(`Success: ${queryStr}`);
      } catch (e) {
        console.error(`Error adding column: ${e.message}`);
      }
    }

    console.log('\nMigration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

addMissingColumns();

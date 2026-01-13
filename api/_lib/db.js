const { Pool } = require('pg');

// Create a connection pool for serverless functions
// Connection pooling is handled automatically by pg in serverless environments
let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// Query helper function
async function query(text, params) {
  const pool = getPool();
  return await pool.query(text, params);
}

// Get a client for transactions
async function getClient() {
  const pool = getPool();
  return await pool.connect();
}

module.exports = {
  query,
  getClient,
  getPool
};

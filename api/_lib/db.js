const { Pool } = require('pg');

// Create a connection pool for serverless functions
// Connection pooling is handled automatically by pg in serverless environments
let pool = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Neon requires SSL connections, so always enable SSL
    // Check if DATABASE_URL contains 'neon' or 'sslmode=require'
    const requiresSSL = process.env.DATABASE_URL.includes('neon.tech') || 
                       process.env.DATABASE_URL.includes('sslmode=require') ||
                       process.env.NODE_ENV === 'production';
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: requiresSSL ? { rejectUnauthorized: false } : false,
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout for serverless cold starts
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

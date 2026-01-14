const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody } = require('../_lib/request');

module.exports = async (req, res) => {
  // Handle CORS
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, password } = parseBody(req);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Find user (case-insensitive)
    const result = await query('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          error: 'Server configuration error',
          message: 'JWT_SECRET environment variable is not set'
        })
      };
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('connect')) {
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please check DATABASE_URL environment variable.'
        })
      };
    }
    
    // Check if table doesn't exist
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          error: 'Database not initialized',
          message: 'Database tables do not exist. Please initialize the database first by calling /api/init-db'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: 'Login failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during login'
      })
    };
  }
};

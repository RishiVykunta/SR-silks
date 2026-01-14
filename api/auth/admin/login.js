const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../_lib/db');
const { corsHeaders, handleCors } = require('../../_lib/cors');
const { parseBody } = require('../../_lib/request');

module.exports = async (req, res) => {
  // Log request for debugging
  console.log('Admin login request:', {
    method: req.method,
    url: req.url,
    path: req.path,
    headers: req.headers
  });

  // Handle CORS
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: 'Method not allowed',
        received: req.method,
        expected: 'POST'
      })
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

    // Find admin (case-insensitive)
    const result = await query('SELECT * FROM admins WHERE LOWER(TRIM(email)) = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      console.error(`Admin login failed: No admin found with email ${normalizedEmail}`);
      return {
        statusCode: 401,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    const admin = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      console.error(`Admin login failed: Invalid password for email ${normalizedEmail}`);
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
    const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    console.log(`Admin login successful: ${admin.email}`);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        message: 'Admin login successful',
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name
        }
      })
    };
  } catch (error) {
    console.error('Admin login error:', error);
    console.error('Error stack:', error.stack);
    
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
          message: 'Database tables do not exist. Please initialize the database first by calling /api/init-db',
          details: error.message
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: 'Login failed',
        message: error.message || 'An error occurred during login',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

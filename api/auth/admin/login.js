const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../_lib/db');
const { corsHeaders, handleCors } = require('../../_lib/cors');
const { parseBody } = require('../../_lib/request');

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
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Login failed' })
    };
  }
};

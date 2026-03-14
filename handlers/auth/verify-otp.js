const jwt = require('jsonwebtoken');
const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody } = require('../_lib/request');

module.exports = async (req, res) => {
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
    const { email, code } = parseBody(req);

    if (!email || !code) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Email and verification code are required' })
      };
    }

    // Check user and code
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND verification_code = $2',
      [email, code]
    );

    if (userResult.rows.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Invalid verification code' })
      };
    }

    const user = userResult.rows[0];

    // Update user: set verified and clear code
    await query(
      'UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = $1',
      [user.id]
    );

    // Generate token
    if (!process.env.JWT_SECRET) {
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'JWT_SECRET not configured' })
      };
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        message: 'Email verified successfully',
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
    console.error('OTP verification error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Verification failed' })
    };
  }
};

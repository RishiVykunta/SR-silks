const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody } = require('../_lib/request');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const { idToken } = parseBody(req);

    if (!idToken) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'ID Token is required' })
      };
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name } = payload;

    // Check if user exists with this googleId or email
    let userResult = await query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);
    let user;

    if (userResult.rows.length === 0) {
      // Create new user (automatically verified if from Google)
      const registerResult = await query(
        'INSERT INTO users (email, password, first_name, last_name, google_id, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [email, 'GOOGLE_AUTH_NO_PASSWORD', given_name, family_name, googleId, true]
      );
      user = registerResult.rows[0];
    } else {
      user = userResult.rows[0];
      // Update googleId if not present (linked account)
      if (!user.google_id) {
        await query('UPDATE users SET google_id = $1, is_verified = TRUE WHERE id = $2', [googleId, user.id]);
      }
    }

    // Generate JWT
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
        message: 'Google login successful',
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
    console.error('Google auth error:', error);
    return {
      statusCode: 401,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Google authentication failed' })
    };
  }
};

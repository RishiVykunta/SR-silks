const bcrypt = require('bcryptjs');
const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody, getQuery } = require('../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  // GET: Verify token validity
  if (req.method === 'GET') {
    try {
      const queryParams = getQuery(req);
      const { token } = queryParams;

      if (!token) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Reset token is required' })
        };
      }

      // Check if token exists and is not expired
      const userResult = await query(
        'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [token]
      );

      if (userResult.rows.length === 0) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Invalid or expired reset token' })
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          valid: true,
          message: 'Token is valid'
        })
      };
    } catch (error) {
      console.error('Reset password token verification error:', error);
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Failed to verify reset token' })
      };
    }
  }

  // POST: Reset password
  if (req.method === 'POST') {
    try {
      const { token, password } = parseBody(req);

      if (!token || !password) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Token and password are required' })
        };
      }

      if (password.length < 6) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Password must be at least 6 characters long' })
        };
      }

      // Check if token exists and is not expired
      const userResult = await query(
        'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [token]
      );

      if (userResult.rows.length === 0) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Invalid or expired reset token' })
        };
      }

      const userId = userResult.rows[0].id;

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      await query(
        'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW() WHERE id = $2',
        [hashedPassword, userId]
      );

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          message: 'Password has been reset successfully. You can now login with your new password.'
        })
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Failed to reset password' })
      };
    }
  }

  return {
    statusCode: 405,
    headers: corsHeaders(),
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

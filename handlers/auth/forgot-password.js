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
    const { email } = parseBody(req);
    
    if (!email) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Check if user exists
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    
    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          message: 'If an account with that email exists, password reset instructions have been sent.'
        })
      };
    }

    // Generate a simple reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database (you'll need to add reset_token and reset_token_expiry columns)
    // For now, we'll just log it. In production, you should:
    // 1. Add reset_token and reset_token_expiry columns to users table
    // 2. Store the token: await query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3', [resetToken, resetTokenExpiry, email]);
    // 3. Send email with reset link using a service like SendGrid, AWS SES, or Nodemailer

    console.log('Password reset requested for:', email);
    console.log('Reset token (for development):', resetToken);
    console.log('Reset link would be:', `${process.env.FRONTEND_URL || 'https://sr-silks.vercel.app'}/reset-password?token=${resetToken}`);

    // TODO: Send email with reset link
    // Example using a service:
    // await sendEmail({
    //   to: email,
    //   subject: 'Password Reset Instructions',
    //   html: `Click here to reset your password: ${resetLink}`
    // });

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        message: 'If an account with that email exists, password reset instructions have been sent to your email.'
      })
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to process password reset request' })
    };
  }
};

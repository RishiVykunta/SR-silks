const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody } = require('../_lib/request');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Check if user exists and is not already verified
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const user = userResult.rows[0];
    if (user.is_verified) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'User is already verified' })
      };
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update code in database
    await query(
      'UPDATE users SET verification_code = $1 WHERE id = $2',
      [verificationCode, user.id]
    );

    // Send verification email
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'SR Silks <noreply@sr-silks.com>',
          to: email,
          subject: 'Your New Verification Code - SR Silks',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #D4AF37;">Verification Code</h2>
              <p>Your new verification code is:</p>
              <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                ${verificationCode}
              </div>
              <p>This code will expire in 24 hours.</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'Verification code resent successfully' })
    };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to resend verification code' })
    };
  }
};

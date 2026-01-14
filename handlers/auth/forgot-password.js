const crypto = require('crypto');
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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userResult = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    
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

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, resetTokenExpiry, normalizedEmail]
    );

    // Create reset link
    const frontendUrl = process.env.FRONTEND_URL || 'https://sr-silks.vercel.app';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email with reset link
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'SR Silks <noreply@sr-silks.com>',
          to: normalizedEmail,
          subject: 'Password Reset Instructions - SR Silks',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #D4AF37;">Password Reset Request</h2>
              <p>Hello,</p>
              <p>You requested to reset your password for your SR Silks account. Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetLink}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
              <p style="color: #999; font-size: 12px;">Best regards,<br>SR Silks Team</p>
            </div>
          `
        });
      } else {
        // Fallback: log the reset link if Resend is not configured
        console.log('RESEND_API_KEY not set. Reset link for', normalizedEmail, ':', resetLink);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails - still return success for security
    }

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

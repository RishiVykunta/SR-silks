const bcrypt = require('bcryptjs');
const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody } = require('../_lib/request');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { email, password, first_name, last_name, phone } = parseBody(req);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'User already exists' })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user (unverified)
    const result = await query(
      'INSERT INTO users (email, password, first_name, last_name, phone, is_verified, verification_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, first_name, last_name',
      [email, hashedPassword, first_name || null, last_name || null, phone || null, false, verificationCode]
    );

    const user = result.rows[0];

    // Send verification email
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'SR Silks <noreply@sr-silks.com>',
          to: email,
          subject: 'Verify Your Email - SR Silks',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #D4AF37; text-align: center;">Welcome to SR Silks!</h2>
              <p>Thank you for registering. Please use the following verification code to complete your signup:</p>
              <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 5px;">
                ${verificationCode}
              </div>
              <p>This code will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">Best regards,<br>SR Silks Team</p>
            </div>
          `
        });
      } else {
        console.log('RESEND_API_KEY not set. Verification code for', email, ':', verificationCode);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // We still proceed, but the user might need to resend OTP
    }

    return {
      statusCode: 201,
      headers: corsHeaders(),
      body: JSON.stringify({
        message: 'Registration successful. Please verify your email with the code sent.',
        email: user.email,
        requiresVerification: true
      })
    };
  } catch (error) {
    console.error('Registration error:', error);
    
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
    
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: 'Registration failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred during registration'
      })
    };
  }
};


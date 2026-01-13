const jwt = require('jsonwebtoken');
const { query } = require('./db');

// Authenticate user middleware for serverless functions
async function authenticate(req) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return { error: { status: 401, message: 'No token provided' } };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return { error: { status: 401, message: 'User not found' } };
    }

    return { user: result.rows[0] };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return { error: { status: 401, message: 'Invalid token' } };
    }
    if (error.name === 'TokenExpiredError') {
      return { error: { status: 401, message: 'Token expired' } };
    }
    return { error: { status: 500, message: 'Authentication error' } };
  }
}

// Authenticate admin middleware for serverless functions
async function authenticateAdmin(req) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return { error: { status: 401, message: 'No token provided' } };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await query('SELECT id, email, name FROM admins WHERE id = $1', [decoded.adminId]);
    
    if (result.rows.length === 0) {
      return { error: { status: 401, message: 'Admin not found' } };
    }

    return { admin: result.rows[0] };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return { error: { status: 401, message: 'Invalid token' } };
    }
    if (error.name === 'TokenExpiredError') {
      return { error: { status: 401, message: 'Token expired' } };
    }
    return { error: { status: 500, message: 'Authentication error' } };
  }
}

module.exports = {
  authenticate,
  authenticateAdmin
};

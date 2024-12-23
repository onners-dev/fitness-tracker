const jwt = require('jsonwebtoken');
const pool = require('../db');

const authorization = (req, res, next) => {
  // Log full request details
  console.group('🔐 Authorization Middleware');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);

  // Skip authorization for specific public routes
  const publicRoutes = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/verify-code', 
    '/api/auth/resend-verification'
  ];

  if (publicRoutes.some(route => req.path.startsWith(route))) {
    console.log('Public route, skipping authorization');
    console.groupEnd();
    return next();
  }

  // Extract token from multiple possible sources
  const authHeader = 
    req.headers.authorization || 
    req.headers.Authorization || 
    req.get('Authorization');

  console.log('Authorization Header Raw:', authHeader);

  // Extract token, handling different formats
  const token = authHeader ? 
    authHeader.replace(/^Bearer\s+/i, '').trim() : 
    null;

  console.log('Extracted Token:', token ? 'Present' : 'Missing');

  // Check if no token
  if (!token) {
    console.warn('❌ No token found');
    console.groupEnd();
    return res.status(401).json({ 
      message: 'No token, authorization denied',
      details: 'Token not found in headers'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: '1d'
    });

    console.log('Token Decoded Details:', JSON.stringify(decoded, null, 2));

    // Ensure user_id is always set
    const userId = decoded.user_id;

    if (!userId) {
      console.warn('❌ No user_id found in token');
      return res.status(401).json({ 
        message: 'Invalid token: missing user identifier',
        details: 'No user_id found in token payload'
      });
    }

    // Add user from payload
    req.user = {
      user_id: userId,
      email: decoded.email,
      email_verified: decoded.email_verified,
      is_admin: decoded.is_admin
    };

    console.log('✅ Authorization Successful with User:', JSON.stringify(req.user, null, 2));
    console.groupEnd();

    next();
  } catch (err) {
    console.group('🚨 Token Verification Error');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.groupEnd();

    // Handle specific JWT errors
    switch (err.name) {
      case 'JsonWebTokenError':
        return res.status(401).json({ 
          message: 'Invalid token',
          error: err.message
        });

      case 'TokenExpiredError':
        return res.status(401).json({ 
          message: 'Token expired',
          error: err.message
        });

      case 'NotBeforeError':
        return res.status(401).json({
          message: 'Token not active',
          error: err.message
        });

      default:
        return res.status(401).json({ 
          message: 'Authentication failed',
          error: err.message 
        });
    }
  }
};

// Modify the checkAdminAccess to be more defensive
const checkAdminAccess = async (req, res, next) => {
  console.group('🛡️ Admin Access Check');
  
  try {
    // Log the entire request object for debugging
    console.log('Request Details:', {
      path: req.path,
      method: req.method,
      user: req.user  // Log the user object to see what's available
    });

    // Ensure user object exists and is populated
    if (!req.user) {
      console.warn('❌ No user found in request');
      console.groupEnd();
      return res.status(403).json({ 
        message: 'Authentication required',
        details: 'No user object in request'
      });
    }

    // More verbose logging of admin status
    console.log('Admin Check Details:', {
      tokenAdminStatus: req.user.is_admin,
      userEmail: req.user.email
    });

    // Flexible admin status check
    const isAdmin = 
      req.user.is_admin === true || 
      req.user.is_admin === 't' || 
      req.user.is_admin === 'true';

    if (isAdmin) {
      console.log('✅ Admin access granted via token');
      console.groupEnd();
      return next();
    }

    // Fallback: Database admin check
    console.log('Performing database admin check');
    const adminCheck = await pool.query(
      'SELECT is_admin FROM users WHERE user_id = $1', 
      [req.user.user_id]
    );

    if (adminCheck.rows.length === 0) {
      console.warn('❌ No user found in database');
      console.groupEnd();
      return res.status(403).json({ 
        message: 'User not found',
        details: 'No matching user in database'
      });
    }

    const isDbAdmin = 
      adminCheck.rows[0].is_admin === true || 
      adminCheck.rows[0].is_admin === 't';

    if (!isDbAdmin) {
      console.warn('❌ Non-admin access attempt');
      console.groupEnd();
      return res.status(403).json({ 
        message: 'Admin access required',
        details: 'User is not an admin in database'
      });
    }

    console.log('✅ Admin access granted');
    console.groupEnd();
    next();
  } catch (error) {
    console.error('🚨 Admin Access Check Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.groupEnd();
    
    res.status(500).json({ 
      message: 'Authorization error', 
      error: error.message 
    });
  }
};

// Modify the exports
module.exports = authorization;
authorization.checkAdminAccess = checkAdminAccess;

const jwt = require('jsonwebtoken');
const pool = require('../db');

module.exports = (req, res, next) => {
  // Log full request details
  console.group('🔐 Authorization Middleware');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Full Headers:', JSON.stringify(req.headers, null, 2));

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
      // Optional: add additional verification options
      algorithms: ['HS256'], // Specify allowed algorithms
      maxAge: '1d' // Token expiration
    });

    console.log('Token Decoded Successfully:', {
      user_id: decoded.user_id,
      email: decoded.email,
      email_verified: decoded.email_verified
    });

    // Add user from payload
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      email_verified: decoded.email_verified
    };

    console.log('✅ Authorization Successful');
    console.groupEnd();

    next();
  } catch (err) {
    console.group('🚨 Token Verification Error');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Full Error:', err);
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
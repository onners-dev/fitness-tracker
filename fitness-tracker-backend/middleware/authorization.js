const jwt = require('jsonwebtoken');
const pool = require('../db');

module.exports = (req, res, next) => {
    // Extract token from multiple possible sources
    const authHeader = 
      req.headers.authorization || 
      req.headers.Authorization || 
      req.get('Authorization');
  
    console.log('Authorization Header:', authHeader);
  
    // Extract token, handling different formats
    const token = authHeader ? 
      authHeader.replace(/^Bearer\s+/i, '').trim() : 
      null;
  
    console.log('Extracted Token:', token ? 'Present' : 'Missing');
  
    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        details: 'Token not found in headers'
      });
    }
  
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      console.log('Token Decoded:', {
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
  
      next();
    } catch (err) {
      console.error('Token Verification Error:', {
        name: err.name,
        message: err.message
      });
  
      // Handle specific JWT errors
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          error: err.message
        });
      }
  
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired',
          error: err.message
        });
      }
  
      res.status(401).json({ 
        message: 'Authentication failed',
        error: err.message 
      });
    }
  };
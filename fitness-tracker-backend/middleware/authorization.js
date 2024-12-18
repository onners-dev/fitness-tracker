const jwt = require('jsonwebtoken');
const pool = require('../db');

module.exports = (req, res, next) => {
    // Log full headers for debugging
    console.log('📋 Full Request Headers:', req.headers);

    // Get token from header, handling different potential formats
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    console.log('🔍 Authorization Header:', authHeader);

    // Extract token, handling different possible formats
    const token = authHeader ? 
        authHeader.replace(/^Bearer\s+/i, '').trim() : 
        null;

    console.log('🔐 Extracted Token:', token ? 'Present' : 'Missing');

    // Check if no token
    if (!token) {
        console.warn('❌ No token, authorization denied');
        return res.status(401).json({ 
            message: 'No token, authorization denied',
            details: 'Token not found in headers'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('✅ Token Decoded:', {
            user_id: decoded.user_id,
            email: decoded.email,
        });

        // Add user from payload
        req.user = {
            id: decoded.user_id,
            email: decoded.email
        };

        next();
    } catch (err) {
        console.error('🚨 Token Verification Error:', {
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
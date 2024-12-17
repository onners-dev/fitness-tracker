const jwt = require('jsonwebtoken');
const pool = require('../db');

module.exports = async (req, res, next) => {
    try {
        console.log('FULL Authorization Middleware');
        console.log('Full request headers:', req.headers);
        console.log('Authorization header:', req.header('Authorization'));
        
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token found');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        console.log('JWT Secret:', process.env.JWT_SECRET ? 'Available' : 'NOT AVAILABLE');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Decoded token full details:', decoded);

        // Find user by email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [decoded.email]);
        const user = userResult.rows[0];

        if (!user) {
            console.log('No user found for the email');
            return res.status(401).json({ message: 'User not found' });
        }

        // Set req.user with comprehensive user information
        req.user = { 
            id: user.user_id, 
            email: user.email,
            email_verified: user.email_verified === 't'
        };
        
        console.log('Authorized user:', req.user);
        
        next();
    } catch (err) {
        console.error('FULL auth middleware error:', err);
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        
        res.status(500).json({ 
            message: 'Server error during authorization',
            errorName: err.name,
            errorMessage: err.message 
        });
    }
};

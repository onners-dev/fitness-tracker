// middleware/authorization.js
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        console.log('Full headers:', req.headers);
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Decoded token:', decoded);

        // Check for both userId and user_id
        const userId = decoded.userId || decoded.user_id;
        
        if (!userId) {
            console.log('No user ID found in token');
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Set req.user.id to the user ID
        req.user = { id: userId };
        
        console.log('Authorized user:', req.user);
        
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        
        res.status(500).json({ message: 'Server error during authorization' });
    }
};

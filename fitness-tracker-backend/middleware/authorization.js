const jwt = require('jsonwebtoken');

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

        // Check for both userId and user_id
        const userId = decoded.userId || decoded.user_id || decoded.id;
        
        if (!userId) {
            console.log('No user ID found in token');
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Set req.user.id to the user ID
        req.user = { id: userId };
        
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

// Auth middleware to get user from token
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Your user model

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authorization denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
        req.user = { userId: decoded.userId }; // Attach user ID to request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalid or expired.' });
    }
};

module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Protects routes by verifying JWT token from Authorization header
 * 
 * Usage: Add this middleware to any route that requires authentication
 * Example: router.get('/profile', authMiddleware, getUserProfile);
 */
const authMiddleware = async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
            }

            next(); // Continue to the next middleware/controller
        } catch (error) {
            console.error('Token verification error:', error.message);

            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token',
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired',
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route',
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Authorization denied.',
        });
    }
};

module.exports = authMiddleware;

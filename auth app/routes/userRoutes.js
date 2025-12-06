const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * User Routes
 * All routes are protected with authMiddleware
 */

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;

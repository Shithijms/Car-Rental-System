const express = require('express');
const { body } = require('express-validator');
const {
    register,
    login,
    getProfile,
    updateProfile,
    logout
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Register route
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    handleValidationErrors,
    register
);

// Login route
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    handleValidationErrors,
    login
);

// Logout route
router.post('/logout', auth, logout);

// Get profile route
router.get('/profile', auth, getProfile);

// Update profile route
router.put(
    '/profile',
    auth,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please provide a valid email')
    ],
    handleValidationErrors,
    updateProfile
);

module.exports = router;
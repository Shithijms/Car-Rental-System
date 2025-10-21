const express = require('express');
const { body } = require('express-validator');
const {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { auth, ownerAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public route
router.get('/', getAllCategories);

// Protected routes (owner only)
router.post(
    '/',
    auth,
    ownerAuth,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('daily_rate').isFloat({ min: 0 }).withMessage('Valid daily rate is required')
    ],
    handleValidationErrors,
    createCategory
);

router.put(
    '/:id',
    auth,
    ownerAuth,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('daily_rate').isFloat({ min: 0 }).withMessage('Valid daily rate is required')
    ],
    handleValidationErrors,
    updateCategory
);

router.delete('/:id', auth, ownerAuth, deleteCategory);

module.exports = router;
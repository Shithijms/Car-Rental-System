const express = require('express');
const { body } = require('express-validator');
const {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
    uploadCarImage,
    updateCarAvailability,
    getAllCarsWithExtras ,
    getAllCarRelatedData,
    upload
} = require('../controllers/carController');
const { auth, ownerAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getAllCars);
router.get('/:id', getCarById);

// Protected routes (owner only)
router.post(
    '/',
    auth,
    ownerAuth,
    [
        body('category_id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
        body('branch_id').isInt({ min: 1 }).withMessage('Valid branch ID is required'),
        body('brand').notEmpty().withMessage('Brand is required'),
        body('model').notEmpty().withMessage('Model is required'),
        body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
        body('license_plate').notEmpty().withMessage('License plate is required')
    ],
    handleValidationErrors,
    createCar
);

router.put(
    '/:id',
    auth,
    ownerAuth,
    updateCar
);

router.delete('/:id', auth, ownerAuth, deleteCar);

router.patch(
    '/:id/availability',
    auth,
    ownerAuth,
    [
        body('status').isIn(['available', 'maintenance', 'unavailable']).withMessage('Valid status is required')
    ],
    handleValidationErrors,
    updateCarAvailability
);

router.post(
    '/:id/upload-image',
    auth,
    ownerAuth,
    upload.single('image'),
    uploadCarImage
);

router.get('/all-data', getAllCarsWithExtras);

router.get('/all-data', getAllCarRelatedData);

module.exports = router;
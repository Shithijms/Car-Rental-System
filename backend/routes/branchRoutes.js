const express = require('express');
const {
    getAllBranches,
    getBranchById,
    getBranchReport
} = require('../controllers/branchController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllBranches);
router.get('/:id', getBranchById);

// Protected route for branch report
router.get('/:id/report', auth, getBranchReport);

module.exports = router;
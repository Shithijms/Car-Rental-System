const express = require('express');
const {
    getOwnerStats,
    getBranchStats
} = require('../controllers/dashboardController');
const { auth, ownerAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/owner/stats', auth, ownerAuth, getOwnerStats);
router.get('/branch/:branch_id/stats', auth, ownerAuth, getBranchStats);

module.exports = router;
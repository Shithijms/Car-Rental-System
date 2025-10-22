// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById
} = require('../controllers/customerController');

// GET /api/customers
router.get('/', getAllCustomers);

// GET /api/customers/:id
router.get('/:id', getCustomerById);

module.exports = router;

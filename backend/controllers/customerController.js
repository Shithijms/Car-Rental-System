const { pool } = require('../config/database');

// Get all customers
const getAllCustomers = async (req, res, next) => {
  try {
    const [customers] = await pool.execute(
      `SELECT id, name, email, phone, address, driver_license, date_of_birth, created_at
       FROM customers
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

// Get a customer by ID
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [customers] = await pool.execute(
      `SELECT id, name, email, phone, address, driver_license, date_of_birth, created_at
       FROM customers
       WHERE id = ?`,
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: customers[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById
};

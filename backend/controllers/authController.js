const { pool } = require('../config/database');
const { hashPassword, comparePassword, validateEmail } = require('../utils/helpers');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, address, driver_license, date_of_birth } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM customers WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const [result] = await pool.execute(
            `INSERT INTO customers (name, email, password, phone, address, driver_license, date_of_birth) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, phone, address, driver_license, date_of_birth]
        );

        // Generate token
        const token = generateToken({
            id: result.insertId,
            email: email,
            name: name
        });

        // Get user data (excluding password)
        const [users] = await pool.execute(
            'SELECT id, name, email, phone, address, driver_license, date_of_birth, created_at FROM customers WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const [users] = await pool.execute(
            'SELECT * FROM customers WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name
        });

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, name, email, phone, address, driver_license, date_of_birth, created_at FROM customers WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address, driver_license, date_of_birth } = req.body;
        const userId = req.user.id;

        const [result] = await pool.execute(
            `UPDATE customers 
       SET name = ?, phone = ?, address = ?, driver_license = ?, date_of_birth = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
            [name, phone, address, driver_license, date_of_birth, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get updated user
        const [users] = await pool.execute(
            'SELECT id, name, email, phone, address, driver_license, date_of_birth, created_at FROM customers WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return success as JWT is stateless
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout
};
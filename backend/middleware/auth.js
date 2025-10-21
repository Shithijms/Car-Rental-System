const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists
        const [users] = await pool.execute(
            'SELECT id, name, email, role FROM customers WHERE id = ? AND email = ?',
            [decoded.id, decoded.email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

const ownerAuth = async (req, res, next) => {
    try {
        // For this implementation, we'll consider any authenticated user as owner
        // In a real system, you'd have proper role management
        await auth(req, res, () => {
            // Check if user has owner privileges (you can implement proper role check here)
            if (!req.user) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Owner privileges required.'
                });
            }
            next();
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Access denied. Owner privileges required.'
        });
    }
};

module.exports = { auth, ownerAuth };
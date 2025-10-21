const { pool } = require('../config/database');

const validateDiscountCode = async (req, res, next) => {
    try {
        const { code, rental_days = 1 } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Discount code is required'
            });
        }

        const [discounts] = await pool.execute(
            `SELECT * FROM discount_codes 
       WHERE code = ? 
       AND is_active = TRUE 
       AND valid_from <= CURDATE() 
       AND valid_until >= CURDATE()
       AND (usage_limit IS NULL OR times_used < usage_limit)
       AND min_rental_days <= ?`,
            [code, rental_days]
        );

        if (discounts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired discount code'
            });
        }

        const discount = discounts[0];

        res.json({
            success: true,
            data: discount,
            message: 'Discount code is valid'
        });
    } catch (error) {
        next(error);
    }
};

const getAllDiscounts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, active_only } = req.query;

        let query = `
      SELECT * FROM discount_codes 
      WHERE 1=1
    `;
        const params = [];

        if (active_only === 'true') {
            query += ' AND is_active = TRUE AND valid_until >= CURDATE()';
        }

        query += ' ORDER BY created_at DESC';

        // Apply pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [discounts] = await pool.execute(query, params);

        // Count total
        const countQuery = `SELECT COUNT(*) as total FROM discount_codes ${active_only === 'true' ? 'WHERE is_active = TRUE AND valid_until >= CURDATE()' : ''}`;
        const [countResult] = await pool.execute(countQuery);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: discounts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const createDiscount = async (req, res, next) => {
    try {
        const {
            code,
            discount_type = 'percentage',
            discount_value,
            min_rental_days = 1,
            max_discount_amount,
            valid_from,
            valid_until,
            usage_limit = 1,
            is_active = true
        } = req.body;

        // Validation
        if (!code || !discount_value || !valid_from || !valid_until) {
            return res.status(400).json({
                success: false,
                message: 'Code, discount value, valid from, and valid until are required'
            });
        }

        // Check if code already exists
        const [existingCodes] = await pool.execute(
            'SELECT id FROM discount_codes WHERE code = ?',
            [code]
        );

        if (existingCodes.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Discount code already exists'
            });
        }

        // Validate dates
        const validFrom = new Date(valid_from);
        const validUntil = new Date(valid_until);
        const today = new Date();

        if (validFrom < today) {
            return res.status(400).json({
                success: false,
                message: 'Valid from date cannot be in the past'
            });
        }

        if (validUntil <= validFrom) {
            return res.status(400).json({
                success: false,
                message: 'Valid until date must be after valid from date'
            });
        }

        // Validate discount value
        if (discount_type === 'percentage' && (discount_value <= 0 || discount_value > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount must be between 1 and 100'
            });
        }

        if (discount_type === 'fixed' && discount_value <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Fixed discount must be greater than 0'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO discount_codes (
        code, discount_type, discount_value, min_rental_days, 
        max_discount_amount, valid_from, valid_until, usage_limit, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                code,
                discount_type,
                discount_value,
                min_rental_days,
                max_discount_amount,
                valid_from,
                valid_until,
                usage_limit,
                is_active
            ]
        );

        const [discounts] = await pool.execute(
            'SELECT * FROM discount_codes WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Discount code created successfully',
            data: discounts[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM discount_codes WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Discount code not found'
            });
        }

        res.json({
            success: true,
            message: 'Discount code deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateDiscountCode,
    getAllDiscounts,
    createDiscount,
    deleteDiscount
};
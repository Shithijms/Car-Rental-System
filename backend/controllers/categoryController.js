const { pool } = require('../config/database');

const getAllCategories = async (req, res, next) => {
    try {
        const [categories] = await pool.execute(`
      SELECT cc.*, COUNT(c.id) as car_count
      FROM car_categories cc
      LEFT JOIN cars c ON cc.id = c.category_id AND c.status = 'available'
      GROUP BY cc.id
      ORDER BY cc.name
    `);

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const { name, daily_rate, weekly_rate, monthly_rate, description } = req.body;

        if (!name || !daily_rate) {
            return res.status(400).json({
                success: false,
                message: 'Name and daily rate are required'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO car_categories (name, daily_rate, weekly_rate, monthly_rate, description) 
       VALUES (?, ?, ?, ?, ?)`,
            [name, daily_rate, weekly_rate, monthly_rate, description]
        );

        const [categories] = await pool.execute(
            'SELECT * FROM car_categories WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: categories[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, daily_rate, weekly_rate, monthly_rate, description } = req.body;

        // Check if category exists
        const [existingCategories] = await pool.execute(
            'SELECT id FROM car_categories WHERE id = ?',
            [id]
        );

        if (existingCategories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const [result] = await pool.execute(
            `UPDATE car_categories 
       SET name = ?, daily_rate = ?, weekly_rate = ?, monthly_rate = ?, description = ? 
       WHERE id = ?`,
            [name, daily_rate, weekly_rate, monthly_rate, description, id]
        );

        const [categories] = await pool.execute(
            'SELECT * FROM car_categories WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: categories[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if category has cars
        const [cars] = await pool.execute(
            'SELECT id FROM cars WHERE category_id = ?',
            [id]
        );

        if (cars.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category that has cars assigned to it'
            });
        }

        const [result] = await pool.execute(
            'DELETE FROM car_categories WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
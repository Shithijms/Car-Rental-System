const { pool } = require('../config/database');

const getAllBranches = async (req, res, next) => {
    try {
        const [branches] = await pool.execute(`
      SELECT 
        b.*,
        COUNT(DISTINCT c.id) as total_cars,
        COUNT(DISTINCT CASE WHEN c.status = 'available' THEN c.id END) as available_cars,
        e.name as manager_name
      FROM branches b
      LEFT JOIN cars c ON b.id = c.branch_id
      LEFT JOIN employees e ON b.manager_id = e.id
      GROUP BY b.id
      ORDER BY b.name
    `);

        res.json({
            success: true,
            data: branches
        });
    } catch (error) {
        next(error);
    }
};

const getBranchById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [branches] = await pool.execute(
            `SELECT 
        b.*,
        e.name as manager_name,
        e.email as manager_email,
        e.phone as manager_phone
      FROM branches b
      LEFT JOIN employees e ON b.manager_id = e.id
      WHERE b.id = ?`,
            [id]
        );

        if (branches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }

        // Get available cars at this branch
        const [availableCars] = await pool.execute(
            `SELECT 
        c.*,
        cc.name as category_name,
        cc.daily_rate
      FROM cars c
      JOIN car_categories cc ON c.category_id = cc.id
      WHERE c.branch_id = ? AND c.status = 'available'
      ORDER BY c.created_at DESC
      LIMIT 10`,
            [id]
        );

        const branch = branches[0];
        branch.available_cars = availableCars;

        res.json({
            success: true,
            data: branch
        });
    } catch (error) {
        next(error);
    }
};

const getBranchReport = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify branch exists
        const [branches] = await pool.execute(
            'SELECT id, name FROM branches WHERE id = ?',
            [id]
        );

        if (branches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }

        // Use the stored procedure to get branch report
        const [reportData] = await pool.execute('CALL sp_get_branch_report(?)', [id]);

        // The stored procedure returns multiple result sets
        const totalStats = reportData[0][0];
        const monthlyRevenue = reportData[1];
        const carUtilization = reportData[2];

        res.json({
            success: true,
            data: {
                branch: branches[0],
                total_stats: totalStats,
                monthly_revenue: monthlyRevenue,
                car_utilization: carUtilization
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBranches,
    getBranchById,
    getBranchReport
};
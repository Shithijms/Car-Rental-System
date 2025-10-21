const { pool } = require('../config/database');

const getOwnerStats = async (req, res, next) => {
    try {
        // For now, we'll show all data since we don't have proper owner/employee system
        // In a real system, you'd filter by the owner's branch or company

        // Get basic statistics
        const [totalCars] = await pool.execute('SELECT COUNT(*) as count FROM cars');
        const [totalBookings] = await pool.execute('SELECT COUNT(*) as count FROM rentals');
        const [pendingBookings] = await pool.execute('SELECT COUNT(*) as count FROM rentals WHERE status = "pending"');
        const [completedBookings] = await pool.execute('SELECT COUNT(*) as count FROM rentals WHERE status = "completed"');

        // Get monthly revenue (last 6 months)
        const [monthlyRevenue] = await pool.execute(`
            SELECT 
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                SUM(final_amount) as revenue,
                COUNT(*) as booking_count
            FROM rentals 
            WHERE status = 'completed' 
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(created_at), MONTH(created_at)
            ORDER BY year DESC, month DESC
        `);

        // Get recent bookings (last 10)
        const [recentBookings] = await pool.execute(`
            SELECT 
                r.*,
                c.brand,
                c.model,
                c.image_url,
                cat.name as category_name,
                cust.name as customer_name,
                b.name as branch_name
            FROM rentals r
            JOIN cars c ON r.car_id = c.id
            JOIN car_categories cat ON c.category_id = cat.id
            JOIN customers cust ON r.customer_id = cust.id
            JOIN branches b ON r.branch_id = b.id
            ORDER BY r.created_at DESC
            LIMIT 10
        `);

        // Get car status distribution
        const [carStatus] = await pool.execute(`
            SELECT 
                status,
                COUNT(*) as count
            FROM cars 
            GROUP BY status
        `);

        // Get rental status distribution
        const [rentalStatus] = await pool.execute(`
            SELECT 
                status,
                COUNT(*) as count
            FROM rentals 
            GROUP BY status
        `);

        // Calculate total revenue
        const [totalRevenueResult] = await pool.execute(`
            SELECT SUM(final_amount) as total_revenue 
            FROM rentals 
            WHERE status = 'completed'
        `);

        const stats = {
            total_cars: totalCars[0].count,
            total_bookings: totalBookings[0].count,
            pending_bookings: pendingBookings[0].count,
            completed_bookings: completedBookings[0].count,
            total_revenue: totalRevenueResult[0].total_revenue || 0,
            monthly_revenue: monthlyRevenue,
            recent_bookings: recentBookings,
            car_status_distribution: carStatus,
            rental_status_distribution: rentalStatus
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching owner stats:', error);
        next(error);
    }
};

const getBranchStats = async (req, res, next) => {
    try {
        const { branch_id } = req.params;

        // Verify branch exists
        const [branches] = await pool.execute(
            'SELECT id, name FROM branches WHERE id = ?',
            [branch_id]
        );

        if (branches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }

        const branch = branches[0];

        // Get branch-specific statistics using the stored procedure
        const [branchStats] = await pool.execute('CALL sp_get_branch_report(?)', [branch_id]);

        // The stored procedure returns multiple result sets
        const totalStats = branchStats[0][0];
        const monthlyRevenue = branchStats[1];
        const carUtilization = branchStats[2];

        res.json({
            success: true,
            data: {
                branch_info: branch,
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
    getOwnerStats,
    getBranchStats
};
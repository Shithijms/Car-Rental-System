const { pool } = require('../config/database');

const submitReview = async (req, res, next) => {
    try {
        const { rental_id, car_id, rating, comment } = req.body;
        const customer_id = req.user.id;

        // Validation
        if (!rental_id || !car_id || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Rental ID, car ID, and rating are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if rental exists and belongs to customer
        const [rentals] = await pool.execute(
            `SELECT r.* 
       FROM rentals r 
       WHERE r.id = ? AND r.customer_id = ? AND r.status = 'completed'`,
            [rental_id, customer_id]
        );

        if (rentals.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rental not found or not completed'
            });
        }

        // Check if review already exists for this rental
        const [existingReviews] = await pool.execute(
            'SELECT id FROM customer_reviews WHERE rental_id = ?',
            [rental_id]
        );

        if (existingReviews.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Review already submitted for this rental'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO customer_reviews (rental_id, car_id, customer_id, rating, comment) 
       VALUES (?, ?, ?, ?, ?)`,
            [rental_id, car_id, customer_id, rating, comment]
        );

        // Get the created review with customer name
        const [reviews] = await pool.execute(
            `SELECT 
        cr.*,
        c.name as customer_name
      FROM customer_reviews cr
      JOIN customers c ON cr.customer_id = c.id
      WHERE cr.id = ?`,
            [result.insertId]
        );

        // Update car average rating (optional - you might want to calculate this on the fly)
        await updateCarAverageRating(car_id);

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: reviews[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateCarAverageRating = async (car_id) => {
    try {
        const [ratingStats] = await pool.execute(
            `SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as review_count
      FROM customer_reviews 
      WHERE car_id = ?`,
            [car_id]
        );

        // You can store this in a car_ratings table or calculate on the fly
        // For now, we'll just log it
        console.log(`Car ${car_id} - Average Rating: ${ratingStats[0].avg_rating}, Reviews: ${ratingStats[0].review_count}`);
    } catch (error) {
        console.error('Error updating car average rating:', error);
    }
};

const getCarReviews = async (req, res, next) => {
    try {
        const { carId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Get reviews
        const [reviews] = await pool.execute(
            `SELECT 
        cr.*,
        c.name as customer_name,
        DATE_FORMAT(cr.review_date, '%Y-%m-%d') as review_date_formatted
      FROM customer_reviews cr
      JOIN customers c ON cr.customer_id = c.id
      WHERE cr.car_id = ?
      ORDER BY cr.review_date DESC
      LIMIT ? OFFSET ?`,
            [carId, parseInt(limit), (page - 1) * limit]
        );

        // Get rating statistics
        const [stats] = await pool.execute(
            `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM customer_reviews 
      WHERE car_id = ?`,
            [carId]
        );

        // Count total reviews for pagination
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM customer_reviews WHERE car_id = ?',
            [carId]
        );
        const total = countResult[0].total;

        res.json({
            success: true,
            data: reviews,
            statistics: stats[0],
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

const getMyReviews = async (req, res, next) => {
    try {
        const customer_id = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const [reviews] = await pool.execute(
            `SELECT 
        cr.*,
        c.brand,
        c.model,
        c.image_url,
        cat.name as category_name,
        r.start_date,
        r.end_date
      FROM customer_reviews cr
      JOIN cars c ON cr.car_id = c.id
      JOIN car_categories cat ON c.category_id = cat.id
      JOIN rentals r ON cr.rental_id = r.id
      WHERE cr.customer_id = ?
      ORDER BY cr.review_date DESC
      LIMIT ? OFFSET ?`,
            [customer_id, parseInt(limit), (page - 1) * limit]
        );

        // Count total
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM customer_reviews WHERE customer_id = ?',
            [customer_id]
        );
        const total = countResult[0].total;

        res.json({
            success: true,
            data: reviews,
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

module.exports = {
    submitReview,
    getCarReviews,
    getMyReviews
};
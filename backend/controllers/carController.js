const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

const getAllCars = async (req, res, next) => {
    try {
        const {
            category,
            branch,
            minPrice,
            maxPrice,
            status = 'available',
            page = 1,
            limit = 12,
            search
        } = req.query;

        let query = `
            SELECT
                c.*,
                cc.name as category_name,
                cc.daily_rate,
                b.name as branch_name,
                b.address as branch_address
            FROM cars c
                     JOIN car_categories cc ON c.category_id = cc.id
                     JOIN branches b ON c.branch_id = b.id
            WHERE 1=1
        `;
        const params = [];

        // Apply filters
        if (category) {
            query += ' AND c.category_id = ?';
            params.push(category);
        }

        if (branch) {
            query += ' AND c.branch_id = ?';
            params.push(branch);
        }

        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }

        if (minPrice) {
            query += ' AND cc.daily_rate >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND cc.daily_rate <= ?';
            params.push(maxPrice);
        }

        if (search) {
            query += ' AND (c.brand LIKE ? OR c.model LIKE ? OR cc.name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Count total records for pagination
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
        const [countResult] = await pool.execute(countQuery, [...params]);
        const total = countResult[0].total;
        console.log('SQL Query:', query);
        console.log('Params:', params);

        // Apply pagination (inline numbers; some MySQL setups reject bound params for LIMIT/OFFSET)
        const pageNum = Number.parseInt(page, 10) || 1;
        const limitNum = Number.parseInt(limit, 10) || 12;
        const offset = (pageNum - 1) * limitNum;
        query += ` ORDER BY c.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

        const [cars] = await pool.execute(query, params);

        res.json({
            success: true,
            data: cars,
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

const getCarById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [cars] = await pool.execute(
            `SELECT
                 c.*,
                 cc.name as category_name,
                 cc.daily_rate,
                 cc.weekly_rate,
                 cc.monthly_rate,
                 cc.description as category_description,
                 b.name as branch_name,
                 b.address as branch_address,
                 b.phone as branch_phone,
                 b.email as branch_email
             FROM cars c
                      JOIN car_categories cc ON c.category_id = cc.id
                      JOIN branches b ON c.branch_id = b.id
             WHERE c.id = ?`,
            [id]
        );

        if (cars.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Get reviews for this car
        const [reviews] = await pool.execute(
            `SELECT
                 cr.*,
                 c.name as customer_name
             FROM customer_reviews cr
                      JOIN customers c ON cr.customer_id = c.id
             WHERE cr.car_id = ?
             ORDER BY cr.review_date DESC
                 LIMIT 10`,
            [id]
        );

        const car = cars[0];
        car.reviews = reviews;

        res.json({
            success: true,
            data: car
        });
    } catch (error) {
        next(error);
    }
};

const createCar = async (req, res, next) => {
    try {
        const {
            category_id,
            branch_id,
            brand,
            model,
            year,
            color,
            license_plate,
            vin,
            mileage,
            features
        } = req.body;
        
        // ✅ Ensure no undefined values
        const carVin = vin || null;
        const carMileage = mileage ? Number(mileage) : 0;
        const carFeatures = features ? JSON.stringify(features) : JSON.stringify({});
        const carColor = color || null;
        

        // Validation
        if (!category_id || !branch_id || !brand || !model || !year || !license_plate) {
            return res.status(400).json({
                success: false,
                message: 'Category, branch, brand, model, year, and license plate are required'
            });
        }

        // Check if license plate already exists
        const [existingCars] = await pool.execute(
            'SELECT id FROM cars WHERE license_plate = ?',
            [license_plate]
        );

        if (existingCars.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Car with this license plate already exists'
            });
        }

        // Parse features if it's a string
        let featuresJson = features;
        if (typeof features === 'string') {
            try {
                featuresJson = JSON.parse(features);
            } catch (e) {
                featuresJson = {};
            }
        }

        const [result] = await pool.execute(
            `INSERT INTO cars (
                category_id, branch_id, brand, model, year, color,
                license_plate, vin, mileage, features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id,
                branch_id,
                brand,
                model,
                year,
                carColor,
                license_plate,
                carVin,
                carMileage,
                carFeatures
            ]
        );
        
       

        // Get the created car
        const [cars] = await pool.execute(
            `SELECT
                 c.*,
                 cc.name as category_name,
                 cc.daily_rate,
                 b.name as branch_name
             FROM cars c
                      JOIN car_categories cc ON c.category_id = cc.id
                      JOIN branches b ON c.branch_id = b.id
             WHERE c.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Car created successfully',
            data: cars[0]
        });
    } catch (error) {
        console.error("❌ Error submitting car:", error.response?.data);
        console.error("❌ Validator errors:", error.response?.data?.errors);
    
        next(error);
    }
};

const updateCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            category_id,
            branch_id,
            brand,
            model,
            year,
            color,
            license_plate,
            vin,
            mileage,
            status,
            features
        } = req.body;

        // Check if car exists
        const [existingCars] = await pool.execute('SELECT id FROM cars WHERE id = ?', [id]);
        if (existingCars.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Check if license plate is being used by another car
        if (license_plate) {
            const [licenseCheck] = await pool.execute(
                'SELECT id FROM cars WHERE license_plate = ? AND id != ?',
                [license_plate, id]
            );
            if (licenseCheck.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'License plate already in use by another car'
                });
            }
        }

        // Build update query dynamically
        const updateFields = [];
        const updateParams = [];

        const fields = {
            category_id, branch_id, brand, model, year, color,
            license_plate, vin, mileage, status, features
        };

        Object.keys(fields).forEach(key => {
            if (fields[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                if (key === 'features' && typeof fields[key] === 'object') {
                    updateParams.push(JSON.stringify(fields[key]));
                } else {
                    updateParams.push(fields[key]);
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateParams.push(id);

        const [result] = await pool.execute(
            `UPDATE cars SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            updateParams
        );

        // Get updated car
        const [cars] = await pool.execute(
            `SELECT
                 c.*,
                 cc.name as category_name,
                 cc.daily_rate,
                 b.name as branch_name
             FROM cars c
                      JOIN car_categories cc ON c.category_id = cc.id
                      JOIN branches b ON c.branch_id = b.id
             WHERE c.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Car updated successfully',
            data: cars[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteCar = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if car has active rentals (confirmed or active)
        const [activeRentals] = await pool.execute(
            'SELECT id FROM rentals WHERE car_id = ? AND status IN ("confirmed", "active")',
            [id]
        );

        if (activeRentals.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete car with active rentals'
            });
        }

        // Delete any pending rentals for this car
        await pool.execute(
            'DELETE FROM rentals WHERE car_id = ? AND status = "pending"',
            [id]
        );

        // Delete associated reviews
        await pool.execute('DELETE FROM customer_reviews WHERE car_id = ?', [id]);

        // Delete associated maintenance records
        await pool.execute('DELETE FROM maintenance_records WHERE car_id = ?', [id]);

        // Now, delete the car
        const [result] = await pool.execute('DELETE FROM cars WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        res.json({
            success: true,
            message: 'Car and all associated records deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};


const uploadCarImage = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        // Update car with image URL
        const [result] = await pool.execute(
            'UPDATE cars SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [imageUrl, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateCarAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['available', 'maintenance', 'unavailable'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (available, maintenance, unavailable)'
            });
        }

        // Check if car has active rentals (confirmed or active)
        if (status === 'maintenance' || status === 'unavailable') {
            const [activeRentals] = await pool.execute(
                'SELECT id FROM rentals WHERE car_id = ? AND status IN ("confirmed", "active")',
                [id]
            );

            if (activeRentals.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot change status to ${status} when car has active rentals.`
                });
            }
        }

        const [result] = await pool.execute(
            'UPDATE cars SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }

        res.json({
            success: true,
            message: `Car status updated to ${status}`
        });
    } catch (error) {
        next(error);
    }
};


const getAllCarsWithExtras = async (req, res) => {
    try {
        // Replace with your actual DB logic
        const cars = await db.Car.findAll();             // SELECT * FROM cars
        const categories = await db.CarCategory.findAll(); // SELECT * FROM car_categories
        const branches = await db.Branch.findAll();        // SELECT * FROM branches

        res.json({
            cars,
            categories,
            branches
        });
    } catch (error) {
        console.error('Error fetching all data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getAllCarRelatedData = async (req, res, next) => {
    try {
        // Fetch all cars with category and branch info
        const [cars] = await pool.execute(`
            SELECT
                c.*,
                cat.name AS category_name,
                cat.daily_rate,
                b.name AS branch_name
            FROM cars c
                     JOIN car_categories cat ON c.category_id = cat.id
                     JOIN branches b ON c.branch_id = b.id
            ORDER BY c.created_at DESC
        `);

        // Fetch all categories
        const [categories] = await pool.execute(`
            SELECT id, name, daily_rate FROM car_categories ORDER BY name
        `);

        // Fetch all branches
        const [branches] = await pool.execute(`
            SELECT id, name FROM branches ORDER BY name
        `);

        res.json({
            success: true,
            data: {
                cars,
                categories,
                branches,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
    uploadCarImage,
    updateCarAvailability,
    getAllCarsWithExtras,
    getAllCarRelatedData,
    upload
};
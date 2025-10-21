const { pool } = require('./database');
const fs = require('fs');
const path = require('path');

const setupDatabase = async () => {
    try {
        console.log('Setting up car rental database...');

        // Read and execute schema
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        const statements = schema.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await pool.execute(statement + ';');
            }
        }
        console.log('Database schema created successfully');

        // Read and execute stored procedures
        const proceduresPath = path.join(__dirname, '../../database/procedures.sql');
        const procedures = fs.readFileSync(proceduresPath, 'utf8');

        const procedureStatements = procedures.split('DELIMITER $$').filter(stmt => stmt.trim());

        for (const statement of procedureStatements) {
            if (statement.trim() && !statement.includes('DELIMITER ;')) {
                await pool.execute('DELIMITER $$' + statement + 'DELIMITER ;');
            }
        }
        console.log('Stored procedures created successfully');

        // Read and execute triggers
        const triggersPath = path.join(__dirname, '../../database/triggers.sql');
        const triggers = fs.readFileSync(triggersPath, 'utf8');

        const triggerStatements = triggers.split('DELIMITER $$').filter(stmt => stmt.trim());

        for (const statement of triggerStatements) {
            if (statement.trim() && !statement.includes('DELIMITER ;')) {
                await pool.execute('DELIMITER $$' + statement + 'DELIMITER ;');
            }
        }
        console.log('✅ Database triggers created successfully');

        // Read and execute views
        const viewsPath = path.join(__dirname, '../../database/views.sql');
        const views = fs.readFileSync(viewsPath, 'utf8');

        const viewStatements = views.split(';').filter(stmt => stmt.trim());

        for (const statement of viewStatements) {
            if (statement.trim()) {
                await pool.execute(statement + ';');
            }
        }
        console.log('✅ Database views created successfully');

        // Insert seed data
        await insertSeedData();

        console.log('🎉 Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
};

const insertSeedData = async () => {
    try {
        console.log('📥 Inserting seed data...');

        // Insert branches
        await pool.execute(`
      INSERT INTO branches (name, address, phone, email) VALUES 
      ('Downtown Branch', '123 Main Street, Downtown City', '+1-555-0101', 'downtown@carrental.com'),
      ('Airport Branch', '456 Airport Road, Near Terminal 2', '+1-555-0102', 'airport@carrental.com'),
      ('Northside Branch', '789 North Avenue, North District', '+1-555-0103', 'northside@carrental.com')
    `);

        // Insert car categories
        await pool.execute(`
      INSERT INTO car_categories (name, daily_rate, weekly_rate, monthly_rate, description) VALUES 
      ('Economy', 35.00, 210.00, 800.00, 'Fuel-efficient compact cars perfect for city driving'),
      ('Compact', 45.00, 270.00, 1000.00, 'Comfortable mid-size cars with great features'),
      ('SUV', 65.00, 390.00, 1500.00, 'Spacious SUVs for family trips and outdoor adventures'),
      ('Luxury', 120.00, 720.00, 2800.00, 'Premium luxury vehicles for special occasions'),
      ('Sports', ninety.00, 540.00, 2100.00, 'High-performance sports cars for enthusiasts')
    `);

        // Insert sample cars based on the frontend dummy data
        await pool.execute(`
      INSERT INTO cars (category_id, branch_id, brand, model, year, color, license_plate, vin, mileage, status, features) VALUES 
      (1, 1, 'Toyota', 'Corolla', 2022, 'White', 'ABC123', '1HGCM82633A123456', 15000, 'available', '{"seats": 5, "bags": 2, "transmission": "Automatic", "ac": true, "fuel": "Gasoline"}'),
      (2, 1, 'Honda', 'Civic', 2023, 'Silver', 'DEF456', '2HGCM82633A654321', 8000, 'available', '{"seats": 5, "bags": 2, "transmission": "Automatic", "ac": true, "fuel": "Gasoline"}'),
      (3, 2, 'Toyota', 'RAV4', 2023, 'Black', 'GHI789', '3HGCM82633A987654', 12000, 'available', '{"seats": 5, "bags": 3, "transmission": "Automatic", "ac": true, "fuel": "Hybrid"}'),
      (4, 1, 'BMW', '5 Series', 2023, 'Blue', 'JKL012', 'WBA5E5C58ED795123', 5000, 'available', '{"seats": 5, "bags": 2, "transmission": "Automatic", "ac": true, "fuel": "Gasoline"}'),
      (5, 3, 'Porsche', '911', 2023, 'Red', 'MNO345', 'WP0AB2A79FS123456', 3000, 'available', '{"seats": 2, "bags": 2, "transmission": "Manual", "ac": true, "fuel": "Gasoline"}'),
      (1, 2, 'Hyundai', 'Elantra', 2022, 'Gray', 'PQR678', 'KMHTC6ADXNU123456', 18000, 'available', '{"seats": 5, "bags": 2, "transmission": "Automatic", "ac": true, "fuel": "Gasoline"}'),
      (2, 3, 'Mazda', 'Mazda3', 2023, 'Red', 'STU901', 'JM1BPADLXNU654321', 9000, 'available', '{"seats": 5, "bags": 2, "transmission": "Automatic", "ac": true, "fuel": "Gasoline"}'),
      (3, 1, 'Ford', 'Escape', 2023, 'White', 'VWX234', '1FMCU9GDXPUA12345', 11000, 'available', '{"seats": 5, "bags": 3, "transmission": "Automatic", "ac": true, "fuel": "Gasoline"}')
    `);

        // Insert discount codes
        await pool.execute(`
      INSERT INTO discount_codes (code, discount_type, discount_value, min_rental_days, max_discount_amount, valid_from, valid_until, usage_limit) VALUES 
      ('WELCOME10', 'percentage', 10, 1, 50.00, '2024-01-01', '2024-12-31', 100),
      ('SUMMER25', 'percentage', 25, 3, 100.00, '2024-06-01', '2024-08-31', 50),
      ('WEEKLY50', 'fixed', 50.00, 7, 50.00, '2024-01-01', '2024-12-31', NULL),
      ('FIRSTTIME', 'percentage', 15, 2, 75.00, '2024-01-01', '2024-12-31', 1)
    `);

        console.log('Seed data inserted successfully');
    } catch (error) {
        console.error('Error inserting seed data:', error);
        throw error;
    }
};

setupDatabase();
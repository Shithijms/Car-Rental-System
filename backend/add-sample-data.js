const { pool } = require('./config/database');

const addSampleData = async () => {
    try {
        console.log('Adding sample data for dashboard testing...');
        
        // Add sample customers
        await pool.execute(`
            INSERT IGNORE INTO customers (name, email, password, phone, address, driver_license, date_of_birth) VALUES 
            ('John Doe', 'john@example.com', '$2b$10$example', '+1-555-0001', '123 Main St', 'DL123456', '1990-01-15'),
            ('Jane Smith', 'jane@example.com', '$2b$10$example', '+1-555-0002', '456 Oak Ave', 'DL789012', '1985-05-20'),
            ('Bob Johnson', 'bob@example.com', '$2b$10$example', '+1-555-0003', '789 Pine Rd', 'DL345678', '1992-08-10')
        `);
        
        // Add sample rentals
        await pool.execute(`
            INSERT IGNORE INTO rentals (customer_id, car_id, branch_id, start_date, end_date, total_days, daily_rate, total_amount, discount_amount, final_amount, status, created_at) VALUES 
            (1, 1, 1, '2024-01-15', '2024-01-17', 2, 35.00, 70.00, 0, 70.00, 'completed', '2024-01-10'),
            (2, 2, 1, '2024-01-20', '2024-01-22', 2, 45.00, 90.00, 10.00, 80.00, 'completed', '2024-01-15'),
            (3, 3, 2, '2024-01-25', '2024-01-28', 3, 65.00, 195.00, 0, 195.00, 'active', '2024-01-20'),
            (1, 4, 1, '2024-02-01', '2024-02-03', 2, 120.00, 240.00, 0, 240.00, 'pending', '2024-01-28'),
            (2, 5, 3, '2024-02-05', '2024-02-07', 2, 90.00, 180.00, 20.00, 160.00, 'confirmed', '2024-02-01')
        `);
        
        // Add sample payments
        await pool.execute(`
            INSERT IGNORE INTO payments (rental_id, amount, payment_method, payment_status, payment_date) VALUES 
            (1, 70.00, 'credit_card', 'completed', '2024-01-10'),
            (2, 80.00, 'credit_card', 'completed', '2024-01-15'),
            (3, 195.00, 'credit_card', 'completed', '2024-01-20'),
            (4, 240.00, 'credit_card', 'pending', NULL),
            (5, 160.00, 'credit_card', 'completed', '2024-02-01')
        `);
        
        console.log('✅ Sample data added successfully!');
        
    } catch (error) {
        console.error('❌ Error adding sample data:', error);
    } finally {
        process.exit(0);
    }
};

addSampleData();


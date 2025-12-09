-- Create database
CREATE DATABASE IF NOT EXISTS car_rental_system;
USE car_rental_system;

-- Branches table
CREATE TABLE branches (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(100) NOT NULL,
                          address TEXT NOT NULL,
                          phone VARCHAR(20),
                          email VARCHAR(100),
                          manager_id INT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE employees (
                           id INT PRIMARY KEY AUTO_INCREMENT,
                           branch_id INT NOT NULL,
                           name VARCHAR(100) NOT NULL,
                           email VARCHAR(100) UNIQUE NOT NULL,
                           password VARCHAR(255) NOT NULL,
                           role ENUM('manager', 'staff') DEFAULT 'staff',
                           phone VARCHAR(20),
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Customers table
CREATE TABLE customers (
                           id INT PRIMARY KEY AUTO_INCREMENT,
                           name VARCHAR(100) NOT NULL,
                           email VARCHAR(100) UNIQUE NOT NULL,
                           password VARCHAR(255) NOT NULL,
                           phone VARCHAR(20),
                           address TEXT,
                           driver_license VARCHAR(50),
                           date_of_birth DATE,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Car categories table
CREATE TABLE car_categories (
                                id INT PRIMARY KEY AUTO_INCREMENT,
                                name VARCHAR(50) NOT NULL,
                                daily_rate DECIMAL(10,2) NOT NULL,
                                weekly_rate DECIMAL(10,2),
                                monthly_rate DECIMAL(10,2),
                                description TEXT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars table
CREATE TABLE cars (
                      id INT PRIMARY KEY AUTO_INCREMENT,
                      category_id INT NOT NULL,
                      branch_id INT NOT NULL,
                      brand VARCHAR(50) NOT NULL,
                      model VARCHAR(50) NOT NULL,
                      year INT NOT NULL,
                      color VARCHAR(30),
                      license_plate VARCHAR(20) UNIQUE NOT NULL,
                      vin VARCHAR(50) UNIQUE,
                      mileage INT DEFAULT 0,
                      status ENUM('available', 'rented', 'maintenance', 'unavailable') DEFAULT 'available',
                      image_url VARCHAR(255),
                      features JSON,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      FOREIGN KEY (category_id) REFERENCES car_categories(id),
                      FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Rentals table
CREATE TABLE rentals (
                         id INT PRIMARY KEY AUTO_INCREMENT,
                         customer_id INT NOT NULL,
                         car_id INT NOT NULL,
                         branch_id INT NOT NULL,
                         start_date DATE NOT NULL,
                         end_date DATE NOT NULL,
                         actual_end_date DATE,
                         total_days INT NOT NULL,
                         daily_rate DECIMAL(10,2) NOT NULL,
                         total_amount DECIMAL(10,2) NOT NULL,
                         discount_amount DECIMAL(10,2) DEFAULT 0,
                         final_amount DECIMAL(10,2) NOT NULL,
                         status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
                         start_mileage INT,
                         end_mileage INT,
                         discount_code VARCHAR(50),
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         FOREIGN KEY (customer_id) REFERENCES customers(id),
                         FOREIGN KEY (car_id) REFERENCES cars(id),
                         FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Payments table
CREATE TABLE payments (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          rental_id INT NOT NULL,
                          amount DECIMAL(10,2) NOT NULL,
                          payment_method ENUM('credit_card', 'debit_card', 'cash', 'online') DEFAULT 'credit_card',
                          payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
                          transaction_id VARCHAR(100),
                          payment_date TIMESTAMP NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
);

-- Maintenance records table
CREATE TABLE maintenance_records (
                                     id INT PRIMARY KEY AUTO_INCREMENT,
                                     car_id INT NOT NULL,
                                     branch_id INT NOT NULL,
                                     service_type VARCHAR(100) NOT NULL,
                                     description TEXT,
                                     cost DECIMAL(10,2),
                                     mileage INT,
                                     maintenance_date DATE NOT NULL,
                                     completed_date DATE,
                                     status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY (car_id) REFERENCES cars(id),
                                     FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Discount codes table
CREATE TABLE discount_codes (
                                id INT PRIMARY KEY AUTO_INCREMENT,
                                code VARCHAR(50) UNIQUE NOT NULL,
                                discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
                                discount_value DECIMAL(10,2) NOT NULL,
                                min_rental_days INT DEFAULT 1,
                                max_discount_amount DECIMAL(10,2),
                                valid_from DATE NOT NULL,
                                valid_until DATE NOT NULL,
                                usage_limit INT DEFAULT 1,
                                times_used INT DEFAULT 0,
                                is_active BOOLEAN DEFAULT TRUE,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create indexes for better performance
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_category ON cars(category_id);
CREATE INDEX idx_cars_branch ON cars(branch_id);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_customer ON rentals(customer_id);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active, valid_until);
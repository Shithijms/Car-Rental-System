-- Stored Procedure: Create Rental
DELIMITER $$
CREATE PROCEDURE sp_create_rental(
    IN p_customer_id INT,
    IN p_car_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_discount_code VARCHAR(50)
)
BEGIN
    DECLARE v_daily_rate DECIMAL(10,2);
    DECLARE v_total_days INT;
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_discount_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_final_amount DECIMAL(10,2);
    DECLARE v_branch_id INT;
    DECLARE v_discount_value DECIMAL(10,2);
    DECLARE v_discount_type ENUM('percentage', 'fixed');
    DECLARE v_max_discount DECIMAL(10,2);
    DECLARE v_car_status VARCHAR(20);
    DECLARE v_rental_count INT;

    -- Check if car is available
SELECT status, branch_id INTO v_car_status, v_branch_id
FROM cars WHERE id = p_car_id;

IF v_car_status != 'available' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Car is not available for rental';
END IF;

    -- Check for overlapping rentals
SELECT COUNT(*) INTO v_rental_count
FROM rentals
WHERE car_id = p_car_id
  AND status IN ('confirmed', 'active')
  AND (
    (start_date BETWEEN p_start_date AND p_end_date) OR
    (end_date BETWEEN p_start_date AND p_end_date) OR
    (p_start_date BETWEEN start_date AND end_date)
    );

IF v_rental_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Car is already booked for selected dates';
END IF;

    -- Get daily rate
SELECT cc.daily_rate INTO v_daily_rate
FROM cars c
         JOIN car_categories cc ON c.category_id = cc.id
WHERE c.id = p_car_id;

-- Calculate total days and amount
SET v_total_days = DATEDIFF(p_end_date, p_start_date);
    SET v_total_amount = v_daily_rate * v_total_days;
    SET v_final_amount = v_total_amount;

    -- Apply discount if provided
    IF p_discount_code IS NOT NULL THEN
SELECT discount_value, discount_type, max_discount_amount
INTO v_discount_value, v_discount_type, v_max_discount
FROM discount_codes
WHERE code = p_discount_code
  AND is_active = TRUE
  AND valid_from <= CURDATE()
  AND valid_until >= CURDATE()
  AND (usage_limit IS NULL OR times_used < usage_limit);

IF v_discount_value IS NOT NULL THEN
            IF v_discount_type = 'percentage' THEN
                SET v_discount_amount = (v_total_amount * v_discount_value / 100);
                IF v_max_discount IS NOT NULL AND v_discount_amount > v_max_discount THEN
                    SET v_discount_amount = v_max_discount;
END IF;
ELSE
                SET v_discount_amount = LEAST(v_discount_value, v_total_amount);
END IF;

            SET v_final_amount = v_total_amount - v_discount_amount;

            -- Update discount code usage
UPDATE discount_codes
SET times_used = times_used + 1
WHERE code = p_discount_code;
END IF;
END IF;

    -- Create rental record
INSERT INTO rentals (
    customer_id, car_id, branch_id, start_date, end_date,
    total_days, daily_rate, total_amount, discount_amount,
    final_amount, discount_code, status
) VALUES (
             p_customer_id, p_car_id, v_branch_id, p_start_date, p_end_date,
             v_total_days, v_daily_rate, v_total_amount, v_discount_amount,
             v_final_amount, p_discount_code, 'pending'
         );

-- Return the created rental ID
SELECT LAST_INSERT_ID() as rental_id;
END$$
DELIMITER ;

-- Stored Procedure: Return Car
DELIMITER $$
CREATE PROCEDURE sp_return_car(
    IN p_rental_id INT,
    IN p_end_mileage INT
)
BEGIN
    DECLARE v_car_id INT;
    DECLARE v_start_mileage INT;
    DECLARE v_daily_rate DECIMAL(10,2);
    DECLARE v_extra_days INT;
    DECLARE v_extra_charges DECIMAL(10,2) DEFAULT 0;
    DECLARE v_original_amount DECIMAL(10,2);

    -- Get rental details
SELECT car_id, start_mileage, daily_rate, final_amount
INTO v_car_id, v_start_mileage, v_daily_rate, v_original_amount
FROM rentals
WHERE id = p_rental_id AND status = 'active';

IF v_car_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rental not found or not active';
END IF;

    -- Calculate extra days if any
    SET v_extra_days = DATEDIFF(CURDATE(), end_date);
    IF v_extra_days > 0 THEN
        SET v_extra_charges = v_extra_days * v_daily_rate;
END IF;

    -- Update rental record
UPDATE rentals
SET status = 'completed',
    actual_end_date = CURDATE(),
    end_mileage = p_end_mileage,
    final_amount = final_amount + v_extra_charges
WHERE id = p_rental_id;

-- Update car status and mileage
UPDATE cars
SET status = 'available',
    mileage = p_end_mileage
WHERE id = v_car_id;

-- Update payment if extra charges
IF v_extra_charges > 0 THEN
UPDATE payments
SET amount = amount + v_extra_charges
WHERE rental_id = p_rental_id;
END IF;

SELECT 'Car returned successfully' as message;
END$$
DELIMITER ;

-- Stored Procedure: Branch Report
DELIMITER $$
CREATE PROCEDURE sp_get_branch_report(IN p_branch_id INT)
BEGIN
    -- Total rentals
SELECT COUNT(*) as total_rentals,
       SUM(final_amount) as total_revenue,
       AVG(final_amount) as avg_rental_value
FROM rentals
WHERE branch_id = p_branch_id
  AND status = 'completed';

-- Monthly revenue
SELECT YEAR(created_at) as year,
    MONTH(created_at) as month,
    COUNT(*) as rental_count,
    SUM(final_amount) as monthly_revenue
FROM rentals
WHERE branch_id = p_branch_id
  AND status = 'completed'
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year DESC, month DESC
    LIMIT 6;

-- Car utilization
SELECT c.id, c.brand, c.model, c.status,
       COUNT(r.id) as rental_count,
       SUM(r.final_amount) as revenue_generated
FROM cars c
         LEFT JOIN rentals r ON c.id = r.car_id AND r.status = 'completed'
WHERE c.branch_id = p_branch_id
GROUP BY c.id
ORDER BY revenue_generated DESC;
END$$
DELIMITER ;
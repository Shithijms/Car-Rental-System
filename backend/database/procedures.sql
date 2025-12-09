-- Stored Procedure: Create Rental (Simplified - No Discount Codes)
DELIMITER $$
CREATE PROCEDURE sp_create_rental(
    IN p_customer_id INT,
    IN p_car_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    DECLARE v_daily_rate DECIMAL(10,2);
    DECLARE v_total_days INT;
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_final_amount DECIMAL(10,2);
    DECLARE v_branch_id INT;
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

    -- Create rental record
    INSERT INTO rentals (
        customer_id, car_id, branch_id, start_date, end_date,
        total_days, daily_rate, total_amount, discount_amount,
        final_amount, status
    ) VALUES (
        p_customer_id, p_car_id, v_branch_id, p_start_date, p_end_date,
        v_total_days, v_daily_rate, v_total_amount, 0,
        v_final_amount, 'pending'
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

-- Stored Procedure: Process Payment
DELIMITER $$
CREATE PROCEDURE sp_process_payment(
    IN p_rental_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_payment_method VARCHAR(50),
    IN p_transaction_id VARCHAR(100)
)
BEGIN
    DECLARE v_rental_status VARCHAR(20);
    DECLARE v_final_amount DECIMAL(10,2);

    -- Get rental details
    SELECT status, final_amount INTO v_rental_status, v_final_amount
    FROM rentals
    WHERE id = p_rental_id;

    IF v_rental_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rental not found';
    END IF;

    IF v_rental_status NOT IN ('pending', 'confirmed') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment can only be processed for pending or confirmed rentals';
    END IF;

    -- Verify payment amount matches rental amount
    IF p_amount != v_final_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment amount does not match rental amount';
    END IF;

    -- Create payment record
    INSERT INTO payments (
        rental_id, amount, payment_method, payment_status,
        transaction_id, payment_date
    ) VALUES (
        p_rental_id, p_amount, p_payment_method, 'completed',
        p_transaction_id, NOW()
    );

    -- Update rental status to confirmed if it was pending
    IF v_rental_status = 'pending' THEN
        UPDATE rentals
        SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
        WHERE id = p_rental_id;
    END IF;

    SELECT LAST_INSERT_ID() as payment_id, 'Payment processed successfully' as message;
END$$
DELIMITER ;

-- Stored Procedure: Refund Payment
DELIMITER $$
CREATE PROCEDURE sp_refund_payment(
    IN p_payment_id INT,
    IN p_reason TEXT
)
BEGIN
    DECLARE v_payment_status VARCHAR(20);
    DECLARE v_rental_id INT;
    DECLARE v_rental_status VARCHAR(20);

    -- Get payment details
    SELECT payment_status, rental_id INTO v_payment_status, v_rental_id
    FROM payments
    WHERE id = p_payment_id;

    IF v_payment_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment not found';
    END IF;

    IF v_payment_status = 'refunded' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment has already been refunded';
    END IF;

    IF v_payment_status != 'completed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only completed payments can be refunded';
    END IF;

    -- Get rental status
    SELECT status INTO v_rental_status
    FROM rentals
    WHERE id = v_rental_id;

    -- Update payment status to refunded
    UPDATE payments
    SET payment_status = 'refunded'
    WHERE id = p_payment_id;

    -- Update rental status to cancelled if not already completed
    IF v_rental_status != 'completed' THEN
        UPDATE rentals
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = v_rental_id;
    END IF;

    SELECT 'Refund processed successfully' as message;
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
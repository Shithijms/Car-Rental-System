-- Trigger: Update car status when rental is confirmed
DELIMITER $$
CREATE TRIGGER car_rented_trigger
    AFTER UPDATE ON rentals
    FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE cars SET status = 'rented' WHERE id = NEW.car_id;

    -- Create initial payment record
    INSERT INTO payments (rental_id, amount, payment_status)
    VALUES (NEW.id, NEW.final_amount, 'pending');
END IF;
END$$
DELIMITER ;

-- Trigger: Update car status when rental is completed
DELIMITER $$
CREATE TRIGGER car_available_trigger
    AFTER UPDATE ON rentals
    FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE cars SET status = 'available' WHERE id = NEW.car_id;

    -- Update payment status to completed
    UPDATE payments
    SET payment_status = 'completed',
        payment_date = NOW()
    WHERE rental_id = NEW.id AND payment_status = 'pending';
END IF;
END$$
DELIMITER ;
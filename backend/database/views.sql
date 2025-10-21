-- Available cars view
CREATE VIEW available_cars_view AS
SELECT
    c.*,
    cc.name as category_name,
    cc.daily_rate,
    b.name as branch_name,
    b.address as branch_address
FROM cars c
         JOIN car_categories cc ON c.category_id = cc.id
         JOIN branches b ON c.branch_id = b.id
WHERE c.status = 'available';

-- Branch performance view
CREATE VIEW branch_performance_view AS
SELECT
    b.id,
    b.name as branch_name,
    COUNT(r.id) as total_rentals,
    SUM(r.final_amount) as total_revenue,
    AVG(r.final_amount) as avg_rental_value,
    COUNT(DISTINCT c.id) as total_cars,
    SUM(CASE WHEN c.status = 'available' THEN 1 ELSE 0 END) as available_cars
FROM branches b
         LEFT JOIN cars c ON b.id = c.branch_id
         LEFT JOIN rentals r ON c.id = r.car_id AND r.status = 'completed'
GROUP BY b.id, b.name;

-- Customer rental history view
CREATE VIEW customer_rental_history_view AS
SELECT
    r.*,
    c.brand,
    c.model,
    c.image_url,
    cat.name as category_name,
    b.name as branch_name,
    pay.payment_status,
    pay.amount as paid_amount
FROM rentals r
         JOIN cars c ON r.car_id = c.id
         JOIN car_categories cat ON c.category_id = cat.id
         JOIN branches b ON r.branch_id = b.id
         LEFT JOIN payments pay ON r.id = pay.rental_id
ORDER BY r.created_at DESC;
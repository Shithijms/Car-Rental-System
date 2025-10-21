const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const calculateRentalAmount = (dailyRate, startDate, endDate, discount = 0) => {
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = dailyRate * days;
    const discountAmount = (discount / 100) * totalAmount;
    const finalAmount = totalAmount - discountAmount;

    return {
        days,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2))
    };
};

const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

module.exports = {
    hashPassword,
    comparePassword,
    validateEmail,
    calculateRentalAmount,
    formatDate
};
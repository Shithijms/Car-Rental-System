import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rentalsAPI, discountsAPI } from '../services/api';

const Booking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    const [car, setCar] = useState(null);
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        discount_code: ''
    });
    const [discountInfo, setDiscountInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get car from location state or redirect
     useEffect(() => {
    //     if (!isAuthenticated) {
    //         navigate('/login', { state: { from: location } });
    //         return;
    //     }
            const user = {
                name: "Dev User",
                email: "dev@example.com",
                phone: "1234567890",
                driver_license: "D1234567"
            };

        if (location.state?.car) {
            setCar(location.state.car);

            // Set default dates (tomorrow to day after tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);

            setFormData(prev => ({
                ...prev,
                start_date: tomorrow.toISOString().split('T')[0],
                end_date: dayAfter.toISOString().split('T')[0]
            }));
        } else {
            navigate('/cars');
        }
    }, [location, navigate, isAuthenticated]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear discount when dates change
        if (['start_date', 'end_date'].includes(name) && discountInfo) {
            setDiscountInfo(null);
        }
    };

    const validateDates = () => {
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            setError('Start date cannot be in the past');
            return false;
        }

        if (end <= start) {
            setError('End date must be after start date');
            return false;
        }

        return true;
    };

    const applyDiscount = async () => {
        if (!formData.discount_code) {
            setError('Please enter a discount code');
            return;
        }

        try {
            const days = Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24));
            const response = await discountsAPI.validate(formData.discount_code, days);
            setDiscountInfo(response.data.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid discount code');
            setDiscountInfo(null);
        }
    };

    const calculateTotal = () => {
        if (!car) return 0;

        const days = Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24));
        let total = car.daily_rate * days;

        if (discountInfo) {
            if (discountInfo.discount_type === 'percentage') {
                total = total - (total * discountInfo.discount_value / 100);
            } else {
                total = total - discountInfo.discount_value;
            }
        }

        return Math.max(total, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateDates()) {
            return;
        }

        setLoading(true);
        try {
            const rentalData = {
                car_id: car.id,
                start_date: formData.start_date,
                end_date: formData.end_date,
                discount_code: formData.discount_code || null
            };

            const response = await rentalsAPI.create(rentalData);

            // Redirect to payment page with rental details
            navigate('/payment', {
                state: {
                    rental: response.data.data,
                    car: car
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    if (!car) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    const days = Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24));
    const subtotal = car.daily_rate * days;
    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Complete Your Booking</h1>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Car Summary */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Car Details</h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={car.image_url || '/api/placeholder/100/80'}
                                            alt={`${car.brand} ${car.model}`}
                                            className="w-20 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {car.brand} {car.model}
                                            </h3>
                                            <p className="text-gray-600">{car.category_name}</p>
                                            <p className="text-gray-600">{car.branch_name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Form */}
                                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pickup Date
                                            </label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={formData.start_date}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Return Date
                                            </label>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={formData.end_date}
                                                onChange={handleInputChange}
                                                min={formData.start_date}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Discount Code
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                name="discount_code"
                                                value={formData.discount_code}
                                                onChange={handleInputChange}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter discount code"
                                            />
                                            <button
                                                type="button"
                                                onClick={applyDiscount}
                                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Processing...' : 'Continue to Payment'}
                                    </button>
                                </form>
                            </div>

                            {/* Price Summary */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Price Summary</h2>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Daily Rate</span>
                                            <span>${car.daily_rate}/day</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Rental Period</span>
                                            <span>{days} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>

                                        {discountInfo && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount ({discountInfo.code})</span>
                                                <span>
                          -$
                                                    {discountInfo.discount_type === 'percentage'
                                                        ? (subtotal * discountInfo.discount_value / 100).toFixed(2)
                                                        : discountInfo.discount_value.toFixed(2)}
                        </span>
                                            </div>
                                        )}

                                        <div className="border-t pt-3">
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span>Total</span>
                                                <span>${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Information */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-3">Renter Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p><strong>Name:</strong> {user?.name}</p>
                                        <p><strong>Email:</strong> {user?.email}</p>
                                        <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
                                        <p><strong>Driver's License:</strong> {user?.driver_license}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
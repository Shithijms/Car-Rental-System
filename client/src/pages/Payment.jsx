import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentsAPI } from '../services/api';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [rental, setRental] = useState(null);
    const [car, setCar] = useState(null);
    const [paymentData, setPaymentData] = useState({
        payment_method: 'credit_card',
        card_number: '',
        expiry_date: '',
        cvv: '',
        name_on_card: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (location.state?.rental && location.state?.car) {
            setRental(location.state.rental);
            setCar(location.state.car);
        } else {
            navigate('/cars');
        }
    }, [location, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rental) {
            setError('No rental information found');
            return;
        }

        setLoading(true);
        try {
            const paymentPayload = {
                rental_id: rental.id,
                payment_method: paymentData.payment_method,
                transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };

            await paymentsAPI.process(paymentPayload);

            navigate('/my-bookings', {
                state: { message: 'Booking confirmed successfully! You can view your booking details in My Bookings.' }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Payment processing failed');
        } finally {
            setLoading(false);
        }
    };

    if (!rental || !car) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Payment Form */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Method
                                        </label>
                                        <select
                                            name="payment_method"
                                            value={paymentData.payment_method}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="credit_card">Credit Card</option>
                                            <option value="debit_card">Debit Card</option>
                                            <option value="online">Online Payment</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            name="card_number"
                                            value={paymentData.card_number}
                                            onChange={handleInputChange}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                name="expiry_date"
                                                value={paymentData.expiry_date}
                                                onChange={handleInputChange}
                                                placeholder="MM/YY"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={paymentData.cvv}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name on Card
                                        </label>
                                        <input
                                            type="text"
                                            name="name_on_card"
                                            value={paymentData.name_on_card}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Processing Payment...' : `Pay $${rental.final_amount}`}
                                    </button>
                                </form>
                            </div>

                            {/* Order Summary */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="flex items-center space-x-4 mb-4">
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
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Rental Period</span>
                                            <span>
                        {new Date(rental.start_date).toLocaleDateString()} -
                                                {new Date(rental.end_date).toLocaleDateString()}
                      </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Duration</span>
                                            <span>{rental.total_days} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Daily Rate</span>
                                            <span>${rental.daily_rate}/day</span>
                                        </div>
                                        {rental.discount_amount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>-${rental.discount_amount}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between font-semibold">
                                                <span>Total Amount</span>
                                                <span>${rental.final_amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Booking Information</h3>
                                    <p className="text-blue-800 text-sm">
                                        Your booking will be confirmed once payment is processed successfully.
                                        You can view your booking details in the "My Bookings" section.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
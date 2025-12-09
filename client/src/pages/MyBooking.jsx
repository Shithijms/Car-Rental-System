import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rentalsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyBooking = () => {
    const user = { id: 1, name: "Dev User" }; // temporary
    // const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        status: '',
    });

    useEffect(() => {
        fetchBookings();
    }, [filters]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.status) {
                params.status = filters.status;
            }

            const response = await rentalsAPI.getMyBookings(params);
            setBookings(response.data.data);
        } catch (err) {
            setError('Failed to fetch bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await rentalsAPI.updateStatus(bookingId, 'cancelled');
            // Refresh bookings list
            fetchBookings();
        } catch (err) {
            setError('Failed to cancel booking');
            console.error('Error cancelling booking:', err);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading your bookings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                            <p className="text-gray-600 mt-2">Manage your car rental bookings</p>
                        </div>
                        <Link
                            to="/payment-history"
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            View Payment History
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ status: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                            onClick={() => setFilters({ status: '' })}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Bookings List */}
                <div className="space-y-6">
                    {bookings.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-500 text-lg mb-4">No bookings found</p>
                            <Link
                                to="/cars"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Browse Cars
                            </Link>
                        </div>
                    ) : (
                        bookings.map(booking => (
                            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start space-x-4">
                                            <img
                                                src={booking.image_url || '/api/placeholder/150/100'}
                                                alt={`${booking.brand} ${booking.model}`}
                                                className="w-24 h-16 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.src = '/api/placeholder/150/100';
                                                }}
                                            />
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {booking.brand} {booking.model}
                                                </h3>
                                                <p className="text-gray-600">{booking.category_name}</p>
                                                <p className="text-gray-600">{booking.branch_name}</p>
                                                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                                                    <span>Pickup: {formatDate(booking.start_date)}</span>
                                                    <span>Return: {formatDate(booking.end_date)}</span>
                                                    <span>{booking.total_days} days</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 lg:mt-0 lg:text-right">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    ${booking.final_amount}
                                                </span>
                                            </div>
                                            {booking.payment_status && (
                                                <div className="mt-1 text-sm text-gray-600">
                                                    Payment: {booking.payment_status}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <Link
                                            to={`/booking/${booking.id}`}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            View Details
                                        </Link>

                                        {booking.status === 'completed' && !booking.review_submitted && (
                                            <Link
                                                to={`/review/${booking.id}`}
                                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                Write Review
                                            </Link>
                                        )}

                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}

                                        {booking.payment_status === 'pending' && (
                                            <Link
                                                to={`/payment/${booking.id}`}
                                                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                                            >
                                                Complete Payment
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBooking;
import React, { useState, useEffect } from 'react';
import { rentalsAPI } from '../../services/api';

const ManageBookings = () => {
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

            const response = await rentalsAPI.getOwnerBookings(params);
            setBookings(response.data.data);
        } catch (err) {
            setError('Failed to fetch bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await rentalsAPI.updateStatus(bookingId, newStatus);
            fetchBookings(); // Refresh the list
        } catch (err) {
            setError('Failed to update booking status');
        }
    };

    const handleReturnCar = async (bookingId, endMileage) => {
        try {
            await rentalsAPI.returnCar(bookingId, endMileage);
            fetchBookings(); // Refresh the list
        } catch (err) {
            setError('Failed to process car return');
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const getStatusActions = (booking) => {
        switch (booking.status) {
            case 'pending':
                return (
                    <>
                        <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                            Cancel
                        </button>
                    </>
                );
            case 'confirmed':
                return (
                    <button
                        onClick={() => handleStatusChange(booking.id, 'active')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                        Mark as Active
                    </button>
                );
            case 'active':
                return (
                    <button
                        onClick={() => {
                            const endMileage = prompt('Enter end mileage:');
                            if (endMileage && !isNaN(endMileage)) {
                                handleReturnCar(booking.id, parseInt(endMileage));
                            }
                        }}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                        Return Car
                    </button>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading bookings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
                    <p className="text-gray-600 mt-2">Manage all rental bookings</p>
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
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            All Bookings ({bookings.length})
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Booking
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dates
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img
                                                src={booking.image_url || '/api/placeholder/60/40'}
                                                alt={`${booking.brand} ${booking.model}`}
                                                className="w-12 h-8 object-cover rounded mr-3"
                                                onError={(e) => {
                                                    e.target.src = '/api/placeholder/60/40';
                                                }}
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {booking.brand} {booking.model}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booking.category_name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{booking.customer_name}</div>
                                        <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.total_days} days
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(booking.final_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                          )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {getStatusActions(booking)}
                                            <button
                                                onClick={() => {
                                                    // View details - you can implement a modal or separate page
                                                    alert(`Booking ID: ${booking.id}\nStatus: ${booking.status}\nAmount: ${formatCurrency(booking.final_amount)}`);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {bookings.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No bookings found</p>
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-sm font-medium text-gray-500">Pending</div>
                        <div className="text-2xl font-semibold text-yellow-600">
                            {bookings.filter(b => b.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-sm font-medium text-gray-500">Confirmed</div>
                        <div className="text-2xl font-semibold text-blue-600">
                            {bookings.filter(b => b.status === 'confirmed').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-sm font-medium text-gray-500">Active</div>
                        <div className="text-2xl font-semibold text-green-600">
                            {bookings.filter(b => b.status === 'active').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-sm font-medium text-gray-500">Completed</div>
                        <div className="text-2xl font-semibold text-gray-600">
                            {bookings.filter(b => b.status === 'completed').length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageBookings;
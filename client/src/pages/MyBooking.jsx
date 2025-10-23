// import React, { useState, useEffect } from 'react'
// import { dummyMyBookingsData, assets } from '../assets/assets'
// import Title from '../components/Title'
//
// const MyBooking = () => {
//   const [bookings, setBookings] = useState([])
//   const currency = import.meta.env.VITE_CURRENCY || '₹'
//
//   const fetchBookings = async () => {
//     setBookings(dummyMyBookingsData)
//   }
//
//   useEffect(() => {
//     fetchBookings()
//   }, [])
//
//   return (
//     <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>
//       <Title
//         title='My Bookings'
//         subtitle='View and manage all your car bookings'
//         align="left"
//       />
//
//       <div>
//         {bookings.map((booking, index) => (
//           <div key={booking._id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12'>
//             {/* Car Image + Info */}
//             <div className='md:col-span-1'>
//               <div className='rounded-md overflow-hidden mb-3'>
//                 <img src={booking.car.image} alt="" className='w-full h-auto aspect-video object-cover' />
//               </div>
//               <p className='text-lg font-medium mt-2'>{booking.car.brand} {booking.car.model}</p>
//               <p className='text-gray-500'>{booking.car.year} • {booking.car.category} • {booking.car.location}</p>
//             </div>
//             {/* Booking Details */}
//             <div className='flex items-center gap-2'>
//               <p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1}</p>
//               <p className={`px-3 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-400/15 text-green-600' : 'bg-red-400/15 text-red-600'}`}>{booking.status}</p>
//             </div>
//             <div className='flex items-start gap-2 mt-3'>
//               <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1' />
//               <div>
//                 <p className='text-gray-500'>Rental Period</p>
//                 <p>{booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}</p>
//               </div>
//             </div>
//             <div className='flex items-start gap-2 mt-3'>
//               <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1' />
//               <div>
//                 <p className='text-gray-500'>Pick Up location</p>
//                 <p>{booking.car.location}</p>
//               </div>
//             </div>
//             {/* Price Details */}
//             <div className='md:col-span-1 flex flex-col justify-between gap-6'>
//               <div className='text-sm text-gray-500 text-right'>
//                 <p>Total Price</p>
//                 <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
//                 <p>Booked on {booking.createdAt.split('T')[0]}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
//
// export default MyBooking
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
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-600 mt-2">Manage your car rental bookings</p>
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
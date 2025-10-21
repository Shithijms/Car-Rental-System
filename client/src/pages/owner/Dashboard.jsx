import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, rentalsAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, bookingsResponse] = await Promise.all([
        dashboardAPI.getOwnerStats(),
        rentalsAPI.getOwnerBookings({ limit: 5 })
      ]);

      setStats(statsResponse.data.data);
      setRecentBookings(bookingsResponse.data.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading dashboard...</div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your car rental business</p>
          </div>

          {/* Error Message */}
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
          )}

          {/* Stats Grid */}
          {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">C</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Cars</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.total_cars}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">B</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.total_bookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">P</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Bookings</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pending_bookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">$</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(stats.total_revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* Charts and Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Car Status Distribution */}
            {stats?.car_status_distribution && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Car Status</h3>
                  <div className="space-y-3">
                    {stats.car_status_distribution.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <span className="capitalize">{item.status}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(item.count / stats.total_cars) * 100}%`,
                                  }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{item.count}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}

            {/* Rental Status Distribution */}
            {stats?.rental_status_distribution && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                  <div className="space-y-3">
                    {stats.rental_status_distribution.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <span className="capitalize">{item.status}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${(item.count / stats.total_bookings) * 100}%`,
                                  }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{item.count}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                <Link
                    to="/owner/bookings"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="overflow-hidden">
              {recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent bookings</p>
                  </div>
              ) : (
                  <div className="divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                        <div key={booking.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                  src={booking.image_url || '/api/placeholder/60/40'}
                                  alt={`${booking.brand} ${booking.model}`}
                                  className="w-12 h-8 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = '/api/placeholder/60/40';
                                  }}
                              />
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {booking.brand} {booking.model}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {booking.customer_name} • {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(booking.final_amount)}
                        </span>
                              <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                      booking.status
                                  )}`}
                              >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
                to="/owner/cars"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🚗</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Cars</h3>
                  <p className="text-gray-500">Add, edit, or remove cars from your fleet</p>
                </div>
              </div>
            </Link>

            <Link
                to="/owner/bookings"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📋</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Bookings</h3>
                  <p className="text-gray-500">View and manage all rental bookings</p>
                </div>
              </div>
            </Link>

            <Link
                to="/cars"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">➕</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Car</h3>
                  <p className="text-gray-500">Add a new car to your rental fleet</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
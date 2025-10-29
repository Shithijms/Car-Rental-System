import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { carsAPI } from '../../services/api';

const ManageCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Only status update and delete actions on this page

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
          setLoading(true);
          
          const response = await axios.get('http://localhost:5000/api/cars/all-data');
      
          if (response.data.success) {
            setCars(response.data.data.cars);
          } else {
            setError('Failed to fetch data');
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to fetch data');
        } finally {
          setLoading(false);
        }
      };
      

    // No add/edit handlers

    const handleDelete = async (carId) => {
        if (!window.confirm('Are you sure you want to delete this car?')) {
            return;
        }

        try {
            await carsAPI.delete(carId);
            fetchData(); // Refresh the list
        } catch (err) {
            setError('Failed to delete car');
        }
    };

    const handleStatusChange = async (carId, newStatus) => {
        try {
            await carsAPI.updateAvailability(carId, newStatus);
            fetchData(); // Refresh the list
        } catch (err) {
            setError('Failed to update car status');
        }
    };

    // No cancel form

    const getStatusColor = (status) => {
        const colors = {
            available: 'bg-green-100 text-green-800',
            rented: 'bg-red-100 text-red-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
            unavailable: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading cars...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manage Cars</h1>
                            <p className="text-gray-600 mt-2">Update status or delete cars</p>
                        </div>
                        {/* Add car action removed on this page */}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Add/Edit form removed on this page */}

                {/* Cars List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Car Fleet ({cars.length} cars)
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Car
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Daily Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {cars.map((car) => (
                                <tr key={car.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={car.image_url || '/api/placeholder/60/40'}
                                                alt={`${car.brand} ${car.model}`}
                                                className="w-12 h-8 object-cover rounded mr-3"
                                                onError={(e) => {
                                                    e.target.src = '/api/placeholder/60/40';
                                                }}
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {car.brand} {car.model}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {car.year} • {car.color}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {car.category_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {car.branch_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={car.status}
                                            onChange={(e) => handleStatusChange(car.id, e.target.value)}
                                            className={`text-sm font-medium rounded-full px-3 py-1 ${getStatusColor(car.status)} border-0 focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="available">Available</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="unavailable">Unavailable</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${car.daily_rate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {/* Edit action removed */}
                                            <button
                                                onClick={() => handleDelete(car.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                            <Link
                                                to={`/car/${car.id}`}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {cars.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No cars found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCars;
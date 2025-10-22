import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { carsAPI, categoriesAPI, branchesAPI } from '../../services/api';

const ManageCars = () => {
    const [cars, setCars] = useState([]);
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        license_plate: '',
        vin: '',
        mileage: 0,
        category_id: '',
        branch_id: '',
        features: {
            seats: 5,
            bags: 2,
            transmission: 'Automatic',
            ac: true,
            fuel: 'Gasoline',
        },
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
          setLoading(true);
          
          const response = await axios.get('http://localhost:5000/api/cars/all-data');
      
          if (response.data.success) {
            setCars(response.data.data.cars);
            setCategories(response.data.data.categories);
            setBranches(response.data.data.branches);
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
      

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('features.')) {
            const featureName = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                features: {
                    ...prev.features,
                    [featureName]: type === 'checkbox' ? checked : value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseInt(value) : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingCar) {
                await carsAPI.update(editingCar.id, formData);
            } else {
                await carsAPI.create(formData);
            }

            setShowAddForm(false);
            setEditingCar(null);
            setFormData({
                brand: '',
                model: '',
                year: new Date().getFullYear(),
                color: '',
                license_plate: '',
                vin: '',
                mileage: 0,
                category_id: '',
                branch_id: '',
                features: {
                    seats: 5,
                    bags: 2,
                    transmission: 'Automatic',
                    ac: true,
                    fuel: 'Gasoline',
                },
            });

            fetchData(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save car');
        }
    };

    const handleEdit = (car) => {
        setEditingCar(car);
        setFormData({
            brand: car.brand,
            model: car.model,
            year: car.year,
            color: car.color,
            license_plate: car.license_plate,
            vin: car.vin || '',
            mileage: car.mileage,
            category_id: car.category_id,
            branch_id: car.branch_id,
            features: car.features || {
                seats: 5,
                bags: 2,
                transmission: 'Automatic',
                ac: true,
                fuel: 'Gasoline',
            },
        });
        setShowAddForm(true);
    };

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

    const cancelForm = () => {
        setShowAddForm(false);
        setEditingCar(null);
        setFormData({
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            color: '',
            license_plate: '',
            vin: '',
            mileage: 0,
            category_id: '',
            branch_id: '',
            features: {
                seats: 5,
                bags: 2,
                transmission: 'Automatic',
                ac: true,
                fuel: 'Gasoline',
            },
        });
    };

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
                            <p className="text-gray-600 mt-2">Manage your car rental fleet</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Add New Car
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Add/Edit Car Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingCar ? 'Edit Car' : 'Add New Car'}
                        </h2>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    required
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    License Plate
                                </label>
                                <input
                                    type="text"
                                    name="license_plate"
                                    value={formData.license_plate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    VIN
                                </label>
                                <input
                                    type="text"
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mileage
                                </label>
                                <input
                                    type="number"
                                    name="mileage"
                                    value={formData.mileage}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name} (${category.daily_rate}/day)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Branch
                                </label>
                                <select
                                    name="branch_id"
                                    value={formData.branch_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Features */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Seats
                                        </label>
                                        <input
                                            type="number"
                                            name="features.seats"
                                            value={formData.features.seats}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="8"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bags
                                        </label>
                                        <input
                                            type="number"
                                            name="features.bags"
                                            value={formData.features.bags}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="6"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Transmission
                                        </label>
                                        <select
                                            name="features.transmission"
                                            value={formData.features.transmission}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Automatic">Automatic</option>
                                            <option value="Manual">Manual</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fuel Type
                                        </label>
                                        <select
                                            name="features.fuel"
                                            value={formData.features.fuel}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Gasoline">Gasoline</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="features.ac"
                                            checked={formData.features.ac}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-900">Air Conditioning</span>
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={cancelForm}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {editingCar ? 'Update Car' : 'Add Car'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                                            <button
                                                onClick={() => handleEdit(car)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
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
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Add Your First Car
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCars;
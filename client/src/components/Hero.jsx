import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { branchesAPI, categoriesAPI } from '../services/api';

const Hero = () => {
    const [searchData, setSearchData] = useState({
        pickupLocation: '',
        pickupDate: '',
        returnDate: '',
        category: '',
    });
    const [branches, setBranches] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();

        // Set default dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        setSearchData(prev => ({
            ...prev,
            pickupDate: today.toISOString().split('T')[0],
            returnDate: tomorrow.toISOString().split('T')[0],
        }));
    }, []);

    

const fetchData = async () => {
  try {
    const [branchesRes, categoriesRes] = await Promise.all([
      axios.get('http://localhost:5000/api/branches/'),
      axios.get('http://localhost:5000/api/categories/'),
    ]);

    setBranches(branchesRes.data.data);
    setCategories(categoriesRes.data.data);
  } catch (error) {
    console.error('Error fetching hero data:', error);
  } finally {
    setLoading(false);
  }
};

    const handleSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (searchData.pickupLocation) {
            params.append('branch', searchData.pickupLocation);
        }
        if (searchData.category) {
            params.append('category', searchData.category);
        }
        if (searchData.pickupDate) {
            params.append('startDate', searchData.pickupDate);
        }
        if (searchData.returnDate) {
            params.append('endDate', searchData.returnDate);
        }

        navigate(`/cars?${params.toString()}`);
    };

    const handleInputChange = (e) => {
        setSearchData({
            ...searchData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="relative bg-gray-900">
            <div className="absolute inset-0">
                <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Car rental hero"
                />
                <div className="absolute inset-0 bg-gray-900 mix-blend-multiply opacity-60"></div>
            </div>

            <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Find Your Perfect
                    <br />
                    Rental Car
                </h1>
                <p className="mt-6 text-xl text-gray-300 max-w-3xl">
                    Discover the best car rental deals with our wide selection of vehicles.
                    From economy cars to luxury vehicles, we have the perfect ride for your journey.
                </p>

                {/* Search Form */}
                <div className="mt-12 bg-white rounded-lg shadow-lg p-6 max-w-4xl">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Pickup Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pickup Location
                            </label>
                            <select
                                name="pickupLocation"
                                value={searchData.pickupLocation}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Any Location</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Car Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Car Type
                            </label>
                            <select
                                name="category"
                                value={searchData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Any Type</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Pickup Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pickup Date
                            </label>
                            <input
                                type="date"
                                name="pickupDate"
                                value={searchData.pickupDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Return Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Return Date
                            </label>
                            <input
                                type="date"
                                name="returnDate"
                                value={searchData.returnDate}
                                onChange={handleInputChange}
                                min={searchData.pickupDate}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Search Button */}
                        <div className="md:col-span-2 lg:col-span-4">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
                            >
                                Search Cars
                            </button>
                        </div>
                    </form>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">100+</div>
                        <div className="text-gray-300">Vehicles Available</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">24/7</div>
                        <div className="text-gray-300">Customer Support</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">5+</div>
                        <div className="text-gray-300">Branch Locations</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
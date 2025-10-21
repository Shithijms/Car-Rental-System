import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { carsAPI, categoriesAPI } from '../services/api';

const Home = () => {
    const [featuredCars, setFeaturedCars] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            const [carsResponse, categoriesResponse] = await Promise.all([
                carsAPI.getAll({ limit: 6, status: 'available' }),
                categoriesAPI.getAll(),
            ]);

            setFeaturedCars(carsResponse.data.data);
            setCategories(categoriesResponse.data.data);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <Hero />

            {/* Featured Cars Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Featured Cars
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Discover our most popular rental cars
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-xl">Loading featured cars...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredCars.map((car) => (
                                <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="relative h-48">
                                        <img
                                            src={car.image_url || '/api/placeholder/400/250'}
                                            alt={`${car.brand} ${car.model}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/api/placeholder/400/250';
                                            }}
                                        />
                                        <div className="absolute top-2 right-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Available
                      </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {car.brand} {car.model}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3">{car.category_name}</p>
                                        <p className="text-gray-600 text-sm mb-4">{car.branch_name}</p>

                                        <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        ${car.daily_rate}
                          <span className="text-sm font-normal text-gray-600">/day</span>
                      </span>
                                        </div>

                                        <Link
                                            to={`/car/${car.id}`}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && featuredCars.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No cars available at the moment.</p>
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link
                            to="/cars"
                            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
                        >
                            View All Cars
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Car Categories
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Choose from our wide range of vehicle categories
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🚗</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {category.description}
                                </p>
                                <div className="text-2xl font-bold text-blue-600">
                                    ${category.daily_rate}
                                    <span className="text-sm font-normal text-gray-600">/day</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Why Choose Us
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⭐</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Best Prices
                            </h3>
                            <p className="text-gray-600">
                                Competitive pricing with no hidden fees. Get the best value for your money.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🔧</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Well Maintained
                            </h3>
                            <p className="text-gray-600">
                                All our vehicles are regularly serviced and maintained for your safety.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📞</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                24/7 Support
                            </h3>
                            <p className="text-gray-600">
                                Round-the-clock customer support to assist you whenever you need help.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
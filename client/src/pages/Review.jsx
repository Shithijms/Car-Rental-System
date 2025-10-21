import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentalsAPI, reviewsAPI } from '../services/api';

const Review = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [rental, setRental] = useState(null);
    const [review, setReview] = useState({
        rating: 5,
        comment: '',
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRentalDetails();
    }, [id]);

    const fetchRentalDetails = async () => {
        try {
            const response = await rentalsAPI.getById(id);
            setRental(response.data.data);
        } catch (err) {
            setError('Failed to fetch rental details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rental) return;

        setSubmitting(true);
        try {
            await reviewsAPI.submit({
                rental_id: rental.id,
                car_id: rental.car_id,
                rating: review.rating,
                comment: review.comment,
            });

            navigate('/my-bookings', {
                state: { message: 'Review submitted successfully!' }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!rental) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Rental not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Write a Review</h1>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        {/* Rental Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={rental.image_url || '/api/placeholder/100/80'}
                                    alt={`${rental.brand} ${rental.model}`}
                                    className="w-20 h-16 object-cover rounded"
                                    onError={(e) => {
                                        e.target.src = '/api/placeholder/100/80';
                                    }}
                                />
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {rental.brand} {rental.model}
                                    </h3>
                                    <p className="text-gray-600">{rental.category_name}</p>
                                    <p className="text-gray-600">
                                        {new Date(rental.start_date).toLocaleDateString()} -
                                        {new Date(rental.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Review Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    How would you rate your experience?
                                </label>
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                                            className="text-3xl focus:outline-none"
                                        >
                                            {star <= review.rating ? '⭐' : '☆'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    value={review.comment}
                                    onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Share your experience with this car..."
                                    maxLength={500}
                                />
                                <div className="text-right text-sm text-gray-500 mt-1">
                                    {review.comment.length}/500
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/my-bookings')}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Review;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import MyBooking from './pages/MyBooking';
import Login from './pages/Login';
import Dashboard from './pages/owner/Dashboard';
import ManageCars from './pages/owner/ManageCars';
import ManageBookings from './pages/owner/ManageBookings';
import './index.css';
import Register from "./pages/Register.jsx";
import Payment from "./pages/Payment.jsx";
import Booking from "./pages/Booking.jsx";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/car/:id" element={<CarDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/payment" element={<Payment />} />
              {/* Customer Routes */}
              <Route path="/my-bookings" element={<MyBooking />} />

              {/* Owner Routes */}
              <Route path="/owner/dashboard" element={<Dashboard />} />
              <Route path="/owner/cars" element={<ManageCars />} />
              <Route path="/owner/bookings" element={<ManageBookings />} />

              {/* 404 Route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Go Home
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
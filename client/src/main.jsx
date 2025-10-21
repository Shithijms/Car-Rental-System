import React from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {AuthProvider} from "./context/AuthContext.jsx";
import {BookingProvider} from "./context/BookingContext.jsx";

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BookingProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </BookingProvider>
        </AuthProvider>
    </React.StrictMode>
)

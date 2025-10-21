import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
    error: null,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'AUTH_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case 'REGISTER_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case 'AUTH_FAIL':
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };
        case 'UPDATE_PROFILE':
            const updatedUser = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return {
                ...state,
                user: updatedUser,
                error: null,
            };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is authenticated on app start
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authAPI.getProfile();
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            token,
                            user: response.data.user,
                        },
                    });
                } catch (error) {
                    dispatch({ type: 'AUTH_FAIL', payload: 'Session expired. Please login again.' });
                }
            } else {
                dispatch({ type: 'AUTH_FAIL', payload: null });
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            dispatch({ type: 'AUTH_START' });
            const response = await authAPI.login(credentials);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    token: response.data.token,
                    user: response.data.user,
                },
            });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            dispatch({ type: 'AUTH_FAIL', payload: message });
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            dispatch({ type: 'AUTH_START' });
            const response = await authAPI.register(userData);
            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: {
                    token: response.data.token,
                    user: response.data.user,
                },
            });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            dispatch({ type: 'AUTH_FAIL', payload: message });
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const updateProfile = async (userData) => {
        try {
            const response = await authAPI.updateProfile(userData);
            dispatch({
                type: 'UPDATE_PROFILE',
                payload: response.data.user,
            });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            return { success: false, error: message };
        }
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
import React, { createContext, useContext, useReducer } from 'react';

const BookingContext = createContext();

const initialState = {
    selectedCar: null,
    pickupDate: null,
    returnDate: null,
    pickupLocation: null,
    returnLocation: null,
    discountCode: null,
    discountInfo: null,
    rentalDetails: null,
    step: 1, // 1: Select car, 2: Booking details, 3: Payment
};

const bookingReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CAR':
            return {
                ...state,
                selectedCar: action.payload,
                step: 2,
            };
        case 'SET_DATES':
            return {
                ...state,
                pickupDate: action.payload.pickupDate,
                returnDate: action.payload.returnDate,
            };
        case 'SET_LOCATIONS':
            return {
                ...state,
                pickupLocation: action.payload.pickupLocation,
                returnLocation: action.payload.returnLocation,
            };
        case 'SET_DISCOUNT':
            return {
                ...state,
                discountCode: action.payload.code,
                discountInfo: action.payload.info,
            };
        case 'SET_RENTAL_DETAILS':
            return {
                ...state,
                rentalDetails: action.payload,
                step: 3,
            };
        case 'CLEAR_DISCOUNT':
            return {
                ...state,
                discountCode: null,
                discountInfo: null,
            };
        case 'NEXT_STEP':
            return {
                ...state,
                step: state.step + 1,
            };
        case 'PREV_STEP':
            return {
                ...state,
                step: state.step - 1,
            };
        case 'RESET_BOOKING':
            return initialState;
        default:
            return state;
    }
};

export const BookingProvider = ({ children }) => {
    const [state, dispatch] = useReducer(bookingReducer, initialState);

    const setCar = (car) => {
        dispatch({ type: 'SET_CAR', payload: car });
    };

    const setDates = (pickupDate, returnDate) => {
        dispatch({
            type: 'SET_DATES',
            payload: { pickupDate, returnDate },
        });
    };

    const setLocations = (pickupLocation, returnLocation) => {
        dispatch({
            type: 'SET_LOCATIONS',
            payload: { pickupLocation, returnLocation },
        });
    };

    const setDiscount = (code, info) => {
        dispatch({
            type: 'SET_DISCOUNT',
            payload: { code, info },
        });
    };

    const clearDiscount = () => {
        dispatch({ type: 'CLEAR_DISCOUNT' });
    };

    const setRentalDetails = (details) => {
        dispatch({
            type: 'SET_RENTAL_DETAILS',
            payload: details,
        });
    };

    const nextStep = () => {
        dispatch({ type: 'NEXT_STEP' });
    };

    const prevStep = () => {
        dispatch({ type: 'PREV_STEP' });
    };

    const resetBooking = () => {
        dispatch({ type: 'RESET_BOOKING' });
    };

    const value = {
        ...state,
        setCar,
        setDates,
        setLocations,
        setDiscount,
        clearDiscount,
        setRentalDetails,
        nextStep,
        prevStep,
        resetBooking,
    };

    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    // The useAuth hook provides the user state and loading status
    const { user, loading } = useAuth();
    console.log("Protected Route Check:", { user, loading });
    // If still checking authentication status, show a loading indicator
    if (loading) {
        return <div>Checking authentication status...</div>;
    }

    // If a user is found, render the protected child routes (e.g., Dashboard)
    // Outlet is used by React Router v6 for nested routes
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedin, userData, loading } = useContext(AppContent);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 dark:bg-zinc-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!isLoggedin) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
        return <Navigate to="/" replace />; // Or unauthorized page
    }

    return children;
};

export default ProtectedRoute;

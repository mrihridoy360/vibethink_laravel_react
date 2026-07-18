import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium font-sans">লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login page and save the current location we were trying to access
        return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    }

    if (user.role !== 'admin') {
        // Redirect to home page if the user is logged in but not an admin
        return <Navigate to="/" replace />;
    }

    return children;
}

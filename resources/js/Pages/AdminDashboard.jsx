import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { HelpCircle } from 'lucide-react';

// Tab components
import AdminOverview from './Admin/AdminOverview';
import AdminCourses from './Admin/AdminCourses';
import AdminUsers from './Admin/AdminUsers';
import AdminEnrollments from './Admin/AdminEnrollments';
import AdminPayments from './Admin/AdminPayments';
import AdminTickets from './Admin/AdminTickets';
import AdminCategories from './Admin/AdminCategories';
import AdminLayout from '../Components/AdminLayout';

// ── Coming Soon Placeholder ───────────────────────────────────
function AdminComingSoon({ menuItem }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[420px] text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-60 scale-150" />
                <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl shadow-sm">
                    <HelpCircle className="h-14 w-14 text-blue-400" />
                </div>
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">শীঘ্রই আসছে</h3>
            <p className="text-sm text-gray-400 max-w-xs mb-6">এই ফিচারটি শীঘ্রই যোগ করা হবে।</p>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/25">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                শীঘ্রই আসছে
            </span>
        </div>
    );
}

// ── Main AdminDashboard ───────────────────────────────────────
export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { tab } = useParams();
    const activeTab = tab || 'dashboard';

    const handleTabChange = (key) => {
        navigate(key === 'dashboard' ? '/admin' : `/admin/${key}`);
    };

    const activeTabs = ['dashboard', 'courses', 'users', 'enrollments', 'payments', 'tickets', 'categories'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f4f6fc]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    return (
        <AdminLayout activeTab={activeTab}>
            {activeTab === 'dashboard' && <AdminOverview onTabChange={handleTabChange} />}
            {activeTab === 'courses' && <AdminCourses />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'enrollments' && <AdminEnrollments />}
            {activeTab === 'payments' && <AdminPayments />}
            {activeTab === 'tickets' && <AdminTickets />}
            {activeTab === 'categories' && <AdminCategories />}

            {/* Coming Soon tabs */}
            {!activeTabs.includes(activeTab) && (
                <AdminComingSoon menuItem={activeTab} />
            )}
        </AdminLayout>
    );
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import CourseDetail from './Pages/CourseDetail';
import LearnPlayer from './Pages/LearnPlayer';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import AdminDashboard from './Pages/AdminDashboard';

function AppLayout() {
    const location = useLocation();

    // Hide standard navbar/footer on classroom/learning interface, dashboard, or admin
    const hideLayout = location.pathname.includes('/learn')
        || location.pathname.startsWith('/dashboard')
        || location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            {!hideLayout && <Navbar />}
            <main className="flex-grow">
                <Routes>
                    <Route path="/"                        element={<Home />} />
                    <Route path="/courses/:slug"           element={<CourseDetail />} />
                    <Route path="/courses/:slug/learn"     element={<LearnPlayer />} />
                    <Route path="/login"                   element={<Login />} />
                    <Route path="/register"                element={<Register />} />
                    <Route path="/dashboard"               element={<Dashboard />} />
                    <Route path="/dashboard/:tab"          element={<Dashboard />} />
                    <Route path="/admin"                   element={<AdminDashboard />} />
                </Routes>
            </main>
            {!hideLayout && <Footer />}
        </div>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <AppLayout />
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
    );
}

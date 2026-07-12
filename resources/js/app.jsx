import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';
import { SiteSettingsProvider, useSiteSettings } from './Contexts/SiteSettingsContext';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import Courses from './Pages/Courses';
import CourseDetail from './Pages/CourseDetail';
import LearnPlayer from './Pages/LearnPlayer';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import AdminDashboard from './Pages/AdminDashboard';
import AdminCourseCreate from './Pages/Admin/AdminCourseCreate';
import AdminCourseEdit from './Pages/Admin/AdminCourseEdit';
import Blog from './Pages/Blog';
import BlogDetail from './Pages/BlogDetail';
import Bundles from './Pages/Bundles';
import Workshops from './Pages/Workshops';
import Ebooks from './Pages/Ebooks';
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentFailed from './Pages/PaymentFailed';
import { initMetaPixel } from './Utils/metaPixel';
import ScrollToTop from './Components/ScrollToTop';

function AppLayout() {
    const location = useLocation();
    const { getSetting } = useSiteSettings();

    // Dynamically initialize Pixel and track PageView on every route change
    useEffect(() => {
        const metaPixelId = getSetting('meta_pixel_id');
        const trackingEnabled = getSetting('meta_tracking_enabled', '1');

        if (trackingEnabled === '1' && metaPixelId) {
            initMetaPixel(metaPixelId);
            if (window.fbq) {
                window.fbq('track', 'PageView');
            }
        }
    }, [location.pathname, location.search, getSetting]);

    // Hide standard navbar/footer on classroom/learning interface, dashboard, or admin
    const hideLayout = location.pathname.includes('/learn')
        || location.pathname.startsWith('/dashboard')
        || location.pathname.startsWith('/admin');

    return (
        <div className={`flex flex-col min-h-screen ${!hideLayout ? 'bg-[#f8fafc] text-slate-800 font-sans' : ''}`}>
            {!hideLayout && <Navbar />}
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:slug" element={<CourseDetail />} />
                    <Route path="/courses/:slug/learn" element={<LearnPlayer />} />
                    <Route path="/bundles" element={<Bundles />} />
                    <Route path="/workshops" element={<Workshops />} />
                    <Route path="/ebooks" element={<Ebooks />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/failed" element={<PaymentFailed />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/:tab" element={<Dashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/courses/create" element={<AdminCourseCreate />} />
                    <Route path="/admin/courses/:id/edit" element={<AdminCourseEdit />} />
                    <Route path="/admin/:tab" element={<AdminDashboard />} />
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
                <ScrollToTop />
                <AuthProvider>
                    <SiteSettingsProvider>
                        <AppLayout />
                    </SiteSettingsProvider>
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
    );
}

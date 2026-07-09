import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import {
    LayoutDashboard, BookOpen, FileText, Tag, Users, ShoppingCart,
    CreditCard, Cpu, Gift, Megaphone, Package, Star, Wrench,
    ShoppingBag, GitBranch, BookMarked, MessageSquare, Ticket,
    Mail, AlertTriangle, Globe, Puzzle, HelpCircle, Settings,
    HeadphonesIcon, MessageCircleQuestion, LogOut, Bell, Home,
    Moon, Search, ChevronDown, ChevronRight, Menu, X, Shield
} from 'lucide-react';

// Tab components
import AdminOverview    from './Admin/AdminOverview';
import AdminCourses     from './Admin/AdminCourses';
import AdminUsers       from './Admin/AdminUsers';
import AdminEnrollments from './Admin/AdminEnrollments';
import AdminPayments    from './Admin/AdminPayments';
import AdminTickets     from './Admin/AdminTickets';

// ── Sidebar menu config ───────────────────────────────────────
const MAIN_MENU = [
    { key: 'dashboard',    label: 'ড্যাশবোর্ড',        icon: LayoutDashboard,          active: true },
    { key: 'courses',      label: 'কোর্সসমূহ',          icon: BookOpen,                 active: true },
    { key: 'assignments',  label: 'এসাইনমেন্ট',          icon: FileText,                 active: false },
    { key: 'categories',   label: 'ক্যাটাগরি',           icon: Tag,                      active: false },
    { key: 'users',        label: 'ব্যবহারকারী',          icon: Users,                    active: true },
    { key: 'enrollments',  label: 'এনরোলমেন্ট',          icon: ShoppingCart,             active: true },
    { key: 'payments',     label: 'পেমেন্ট',             icon: CreditCard,               active: true },
    { key: 'gateway',      label: 'গেটওয়ে',              icon: Cpu,                      active: false },
    { key: 'coupons',      label: 'কুপন',                icon: Gift,                     active: false },
    { key: 'announcements',label: 'ঘোষণা',               icon: Megaphone,                active: false },
    { key: 'giftmgmt',     label: 'গিফট ম্যানেজমেন্ট',   icon: Package,                  active: false },
    { key: 'social_review',label: 'সোশ্যাল রিভিউ',       icon: Star,                     active: false },
    { key: 'tools',        label: 'টুলস',                icon: Wrench,                   active: false },
    { key: 'products',     label: 'পণ্য',                icon: ShoppingBag,              active: false },
    { key: 'referral',     label: 'রেফারেল',              icon: GitBranch,                active: false },
    { key: 'blog',         label: 'ব্লগ',                icon: BookMarked,               active: false },
    { key: 'reviews',      label: 'রিভিউ',               icon: MessageSquare,            active: false },
    { key: 'tickets',      label: 'সাপোর্ট টিকেট',       icon: Ticket,                   active: true },
    { key: 'email_tpl',    label: 'ইমেইল টেমপ্লেট',      icon: Mail,                     active: false },
    { key: 'error_log',    label: 'এরর লগ',              icon: AlertTriangle,            active: false },
];

const BOTTOM_MENU = [
    { key: 'pages',        label: 'পেজ',                 icon: Globe,                    active: false },
    { key: 'modules',      label: 'মডিউল',               icon: Puzzle,                   active: false },
    { key: 'help',         label: 'সাহায্য',              icon: HelpCircle,               active: false },
    { key: 'settings',     label: 'সেটিংস',              icon: Settings,                 active: false },
    { key: 'support',      label: 'সাপোর্ট',              icon: HeadphonesIcon,           active: false },
    { key: 'faq',          label: 'প্রশ্নাবলী',            icon: MessageCircleQuestion,    active: false },
];

const PAGE_TITLES = {
    dashboard:    'ড্যাশবোর্ড',
    courses:      'কোর্সসমূহ',
    users:        'ব্যবহারকারী',
    enrollments:  'এনরোলমেন্ট',
    payments:     'পেমেন্ট',
    tickets:      'সাপোর্ট টিকেট',
};

// ── Coming Soon Placeholder ───────────────────────────────────
function AdminComingSoon({ menuItem }) {
    const cfg = [...MAIN_MENU, ...BOTTOM_MENU].find(m => m.key === menuItem);
    const Icon = cfg?.icon || HelpCircle;
    return (
        <div className="flex flex-col items-center justify-center min-h-[420px] text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-60 scale-150" />
                <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl shadow-sm">
                    <Icon className="h-14 w-14 text-blue-400" />
                </div>
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">{cfg?.label || 'শীঘ্রই আসছে'}</h3>
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
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'admin') { navigate('/dashboard'); return; }
    }, [user, loading, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const activeTabs = ['dashboard', 'courses', 'users', 'enrollments', 'payments', 'tickets'];

    // ── Sidebar nav item ──────────────────────────────────────
    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
            <button
                onClick={() => setActiveTab(item.key)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative ${
                    isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span className="flex-grow text-left">{item.label}</span>}
                {!sidebarCollapsed && !item.active && (
                    <span className="text-[8px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0">Soon</span>
                )}
            </button>
        );
    };

    // Auth still loading — show spinner instead of redirecting
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
        <div className="flex h-screen overflow-hidden bg-[#f4f6fc] font-sans text-gray-800">

            {/* ── Sidebar ──────────────────────────────────── */}
            <aside className={`bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
                {/* Brand */}
                <div className={`h-16 flex items-center justify-between px-4 shrink-0`}>
                    {!sidebarCollapsed && (
                        <Link to="/" className="text-xl font-extrabold tracking-tight">
                            <span className="text-blue-600">Vibe</span><span className="text-gray-900">Think</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(p => !p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
                    >
                        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-grow overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
                    {/* Main Menu */}
                    <div>
                        {!sidebarCollapsed && (
                            <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">মেনু</span>
                        )}
                        <div className="space-y-0.5">
                            {MAIN_MENU.map(item => <NavItem key={item.key} item={item} />)}
                        </div>
                    </div>

                    {/* Bottom Menu */}
                    <div>
                        {!sidebarCollapsed && (
                            <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">সিস্টেম</span>
                        )}
                        <div className="space-y-0.5">
                            {BOTTOM_MENU.map(item => <NavItem key={item.key} item={item} />)}
                        </div>
                    </div>
                </div>

                {/* User footer */}
                <div className={`p-3 ${sidebarCollapsed ? 'flex justify-center' : 'flex items-center justify-between gap-2'}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 shrink-0"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </aside>

            {/* ── Main Area ─────────────────────────────────── */}
            <div className="flex-grow flex flex-col min-w-0">

                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        {PAGE_TITLES[activeTab] || 'অ্যাডমিন ড্যাশবোর্ড'}
                    </h1>

                    <div className="flex items-center gap-5">
                        {/* Search */}
                        <div className="relative w-64 hidden lg:block">
                            <input type="text" placeholder="অনুসন্ধান..."
                                className="w-full bg-gray-50 border border-gray-200 text-sm px-4 pl-10 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 transition-all" />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-2 text-gray-400">
                            <button className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full" />
                            </button>
                            <Link to="/" className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                <Home className="h-5 w-5" />
                            </Link>
                            <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors" title="Student Dashboard">
                                <Users className="h-5 w-5" />
                            </Link>
                            <button className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                <Moon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-500/20">
                                {user?.name?.slice(0, 2)?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-grow overflow-y-auto p-6">
                    <div className="max-w-7xl w-full mx-auto">
                        {activeTab === 'dashboard'   && <AdminOverview onTabChange={setActiveTab} />}
                        {activeTab === 'courses'     && <AdminCourses />}
                        {activeTab === 'users'       && <AdminUsers />}
                        {activeTab === 'enrollments' && <AdminEnrollments />}
                        {activeTab === 'payments'    && <AdminPayments />}
                        {activeTab === 'tickets'     && <AdminTickets />}

                        {/* Coming Soon tabs */}
                        {![...activeTabs].includes(activeTab) && (
                            <AdminComingSoon menuItem={activeTab} />
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="h-12 bg-white border-t border-gray-200 px-6 flex items-center justify-between text-[10px] text-gray-400 shrink-0">
                    <p>&copy; {new Date().getFullYear()} VibeThink Academy. সর্বস্বত্ব সংরক্ষিত.</p>
                    <p className="flex items-center gap-1"><Shield className="h-3 w-3 text-blue-400" /> Admin Panel v1.0</p>
                </footer>
            </div>
        </div>
    );
}

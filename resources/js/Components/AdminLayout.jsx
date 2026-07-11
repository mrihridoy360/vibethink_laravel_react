import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import {
    LayoutDashboard, BookOpen, FileText, Tag, Users, ShoppingCart,
    CreditCard, Cpu, Gift, Megaphone, Package, Star, Wrench,
    ShoppingBag, GitBranch, BookMarked, MessageSquare, Ticket,
    Mail, AlertTriangle, Globe, Puzzle, HelpCircle, Settings,
    HeadphonesIcon, MessageCircleQuestion, LogOut, Bell, Home,
    Moon, Search, ChevronDown, ChevronRight, Shield
} from 'lucide-react';

const MAIN_MENU = [
    { key: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, active: true, path: '/admin' },
    { key: 'courses', label: 'কোর্সসমূহ', icon: BookOpen, active: true, path: '/admin/courses' },
    { key: 'assignments', label: 'এসাইনমেন্ট', icon: FileText, active: true, path: '/admin/assignments' },
    { key: 'categories', label: 'ক্যাটাগরি', icon: Tag, active: true, path: '/admin/categories' },
    { key: 'users', label: 'ব্যবহারকারী', icon: Users, active: true, path: '/admin/users' },
    { key: 'enrollments', label: 'এনরোলমেন্ট', icon: ShoppingCart, active: true, path: '/admin/enrollments' },
    { key: 'payments', label: 'পেমেন্ট', icon: CreditCard, active: true, path: '/admin/payments' },
    { key: 'gateway', label: 'গেটওয়ে', icon: Cpu, active: true, path: '/admin/gateway' },
    { key: 'coupons', label: 'কুপন', icon: Gift, active: true, path: '/admin/coupons' },
    { key: 'announcements', label: 'ঘোষণা', icon: Megaphone, active: true, path: '/admin/announcements' },
    { key: 'giftmgmt', label: 'গিফট ম্যানেজমেন্ট', icon: Package, active: true, path: '/admin/giftmgmt' },
    { key: 'social_review', label: 'সোশ্যাল রিভিউ', icon: Star, active: true, path: '/admin/social_review' },
    { key: 'tools', label: 'টুলস', icon: Wrench, active: true, path: '/admin/tools' },
    { key: 'products', label: 'পণ্য', icon: ShoppingBag, active: true, path: '/admin/products' },
    { key: 'referral', label: 'রেফারেল', icon: GitBranch, active: true, path: '/admin/referral' },
    { key: 'blog', label: 'ব্লগ', icon: BookMarked, active: true, path: '/admin/blog' },
    { key: 'reviews', label: 'রিভিউ', icon: MessageSquare, active: true, path: '/admin/reviews' },
    { key: 'tickets', label: 'সাপোর্ট টিকেট', icon: Ticket, active: true, path: '/admin/tickets' },
    { key: 'email_tpl', label: 'ইমেইল টেমপ্লেট', icon: Mail, active: true, path: '/admin/email_tpl' },
    { key: 'error_logs', label: 'এরর লগ', icon: AlertTriangle, active: true, path: '/admin/error_logs' },
];

const BOTTOM_MENU = [
    { key: 'pages', label: 'পেজ', icon: Globe, active: true, path: '/admin/pages' },
    { key: 'modules', label: 'মডিউল', icon: Puzzle, active: true, path: '/admin/modules' },
    { key: 'help', label: 'সাহায্য', icon: HelpCircle, active: true, path: '/admin/help' },
    { key: 'settings', label: 'সেটিংস', icon: Settings, active: true, path: '/admin/settings' },
    { key: 'support', label: 'সাপোর্ট', icon: HeadphonesIcon, active: true, path: '/admin/support' },
    { key: 'faq', label: 'প্রশ্নাবলী', icon: MessageCircleQuestion, active: true, path: '/admin/faq' },
];

const PAGE_TITLES = {
    dashboard: 'ড্যাশবোর্ড',
    courses: 'কোর্সসমূহ',
    assignments: 'এসাইনমেন্ট',
    categories: 'ক্যাটাগরি',
    users: 'ব্যবহারকারী',
    enrollments: 'এনরোলমেন্ট',
    payments: 'পেমেন্ট',
    tickets: 'সাপোর্ট টিকেট',
    social_review: 'সোশ্যাল রিভিউ',
    tools: 'টুলস ম্যানেজমেন্ট',
    products: 'পণ্য ও অর্ডার ম্যানেজমেন্ট',
    referral: 'রেফারেল ও এফিলিয়েট',
    blog: 'ব্লগ ও কন্টেন্ট ম্যানেজমেন্ট',
    reviews: 'কোর্স রিভিউ ম্যানেজমেন্ট',
    settings: 'সাইট সেটিংস',
    modules: 'মডিউল ম্যানেজমেন্ট',
    email_tpl: 'ইমেইল টেমপ্লেট',
    pages: 'পেজ ম্যানেজমেন্ট',
    help: 'সাহায্য ও গাইড সেন্টার',
    support: 'সাপোর্ট টিকেট',
    faq: 'প্রশ্নাবলী (FAQ) সেটিংস',
};

export default function AdminLayout({ children, activeTab, headerContent }) {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
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

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
            <Link
                to={item.path}
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
            </Link>
        );
    };

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
            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
                {/* Brand Logo */}
                <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-gray-100">
                    {!sidebarCollapsed && (
                        <Link to="/" className="text-xl font-extrabold tracking-tight">
                            <span className="text-blue-600">Vibe</span><span className="text-gray-900">Think</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(p => !p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0 cursor-pointer"
                    >
                        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-grow overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
                    <div>
                        {!sidebarCollapsed && (
                            <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">মেনু</span>
                        )}
                        <div className="space-y-0.5">
                            {MAIN_MENU.map(item => <NavItem key={item.key} item={item} />)}
                        </div>
                    </div>
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
                <div className={`p-3 border-t border-gray-100 ${sidebarCollapsed ? 'flex justify-center' : 'flex items-center justify-between gap-2'}`}>
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
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 shrink-0 cursor-pointer"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-grow flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        {headerContent || PAGE_TITLES[activeTab] || 'অ্যাডমিন ড্যাশবোর্ড'}
                    </h1>

                    <div className="flex items-center gap-5">
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
                        {children}
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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import {
    LayoutDashboard, BookOpen, Bell, Gift, Star, Wrench, ShoppingBag,
    Award, CreditCard, Users, Wallet, MessageSquare, Ticket, Settings,
    ShieldAlert, LogOut, Search, Home as HomeIcon, BarChart2, Moon,
    BookOpenCheck, CheckCircle2, Clock, PlayCircle, GraduationCap
} from 'lucide-react';

// Tab page components
import EnrolledCourses from './Dashboard/EnrolledCourses';
import Notice          from './Dashboard/Notice';
import GiftBox         from './Dashboard/GiftBox';
import Tools           from './Dashboard/Tools';
import Certificates    from './Dashboard/Certificates';
import Billing         from './Dashboard/Billing';
import Referral        from './Dashboard/Referral';
import WalletPage      from './Dashboard/Wallet';
import SupportGroup    from './Dashboard/SupportGroup';
import SupportTickets  from './Dashboard/SupportTickets';
import SettingsPage    from './Dashboard/Settings';

// ── Sidebar nav config ───────────────────────────────────────
const MENU_ITEMS = [
    { key: 'dashboard',       label: 'ড্যাশবোর্ড',           icon: LayoutDashboard },
    { key: 'enrolled',        label: 'ইনরোলড কোর্স',         icon: BookOpen },
    { key: 'notice',          label: 'নোটিশ',                icon: Bell },
    { key: 'giftbox',         label: 'গিফট বক্স',            icon: Gift },
    { key: 'review',          label: 'রিভিউ এবং আর্ন করুন', icon: Star },
    { key: 'tools',           label: 'প্রয়োজনীয় টুলস',      icon: Wrench },
    { key: 'products',        label: 'পণ্য',                  icon: ShoppingBag },
    { key: 'certificates',    label: 'সার্টিফিকেট',           icon: Award },
    { key: 'billing',         label: 'বিলিং',                 icon: CreditCard },
    { key: 'referral',        label: 'রেফারেল',               icon: Users },
    { key: 'wallet',          label: 'ওয়ালেট',               icon: Wallet },
];

const SERVICE_ITEMS = [
    { key: 'support_group',   label: 'সাপোর্ট গ্রুপ',         icon: MessageSquare },
    { key: 'support_tickets', label: 'সাপোর্ট টিকেট',         icon: Ticket },
    { key: 'settings',        label: 'সেটিংস',                icon: Settings },
];

// ── Tab page titles ─────────────────────────────────────────
const PAGE_TITLES = {
    dashboard:       'ওভারভিউ',
    enrolled:        'ইনরোলড কোর্স',
    notice:          'নোটিশ',
    giftbox:         'গিফট বক্স',
    review:          'রিভিউ এবং আর্ন করুন',
    tools:           'প্রয়োজনীয় টুলস',
    products:        'পণ্য',
    certificates:    'সার্টিফিকেট',
    billing:         'বিলিং',
    referral:        'রেফারেল',
    wallet:          'ওয়ালেট',
    support_group:   'সাপোর্ট গ্রুপ',
    support_tickets: 'সাপোর্ট টিকেট',
    settings:        'সেটিংস',
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && PAGE_TITLES[tabParam]) {
            setActiveTab(tabParam);
        }

        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/dashboard-data');
                if (response.data.success) setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f4f6fc]">
                <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500 ml-4 font-medium">ড্যাশবোর্ড লোড হচ্ছে...</span>
            </div>
        );
    }

    const stats = data?.stats || { enrolled_count: 0, active_count: 0, completed_count: 0, pending_count: 0 };
    const enrollments = data?.enrollments || [];
    const ongoingEnrollment = enrollments.find(e => e.progress > 0 && e.progress < 100);

    // ── Sidebar Link ────────────────────────────────────────
    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
            <button
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
            </button>
        );
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f4f6fc] text-gray-800 font-sans">

            {/* ── Sidebar ─────────────────────────────────── */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                {/* Brand */}
                <div className="h-16 px-6 flex items-center shrink-0">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold tracking-tight text-blue-600">
                            Vibe<span className="text-gray-900">Think</span>
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <div className="flex-grow overflow-y-auto no-scrollbar px-4 py-4 space-y-6">
                    {/* Menu */}
                    <div>
                        <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                            মেনু
                        </span>
                        <div className="space-y-1">
                            {MENU_ITEMS.map(item => <NavItem key={item.key} item={item} />)}
                        </div>
                    </div>

                    {/* Service */}
                    <div>
                        <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                            সার্ভিস
                        </span>
                        <div className="space-y-1">
                            {SERVICE_ITEMS.map(item => <NavItem key={item.key} item={item} />)}
                        </div>
                    </div>

                    {/* Admin (conditional) */}
                    {user?.role === 'admin' && (
                        <div>
                            <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                                ADMIN
                            </span>
                            <div className="space-y-1">
                                <Link
                                    to="/admin"
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <ShieldAlert className="h-5 w-5 shrink-0" />
                                    <span>এডমিন প্যানেল</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* User footer */}
                <div className="p-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 shrink-0"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </aside>

            {/* ── Main Area ───────────────────────────────── */}
            <div className="flex-grow flex flex-col min-w-0">

                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">{PAGE_TITLES[activeTab] || 'ড্যাশবোর্ড'}</h2>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="relative w-64 hidden md:block">
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="w-full bg-gray-50 border border-gray-200 text-sm px-4 pl-10 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-700 transition-all"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-3 text-gray-400">
                            <button className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full" />
                            </button>
                            <Link to="/" className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                <HomeIcon className="h-5 w-5" />
                            </Link>
                            <button className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors">
                                <Moon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm uppercase shadow-md shadow-orange-500/20">
                                {user.name.slice(0, 2)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-grow overflow-y-auto p-8">
                    <div className="max-w-6xl w-full mx-auto">

                        {/* ── Dashboard Overview ─────────────────────── */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6">
                                {/* Welcome */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/40 rounded-full blur-3xl -z-10" />
                                    <h2 className="text-lg font-bold text-gray-900">স্বাগতম, {user.name.split(' ')[0]}! 👋</h2>
                                    <p className="text-xs text-gray-400 mt-1 font-light">আজই নতুন কিছু শিখতে শুরু করুন!</p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'ইনরোলড কোর্স', value: stats.enrolled_count, icon: BookOpen, color: 'blue', tab: 'enrolled' },
                                        { label: 'চলমান', value: stats.active_count, icon: CheckCircle2, color: 'green', tab: 'enrolled' },
                                        { label: 'সার্টিফিকেট', value: stats.completed_count, icon: Award, color: 'yellow', tab: 'certificates' },
                                        { label: 'অপেক্ষমাণ', value: stats.pending_count, icon: Clock, color: 'purple', tab: 'enrolled' },
                                    ].map(({ label, value, icon: Icon, color, tab }) => (
                                        <button
                                            key={label}
                                            onClick={() => setActiveTab(tab)}
                                            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-500/20 transition-all group text-left"
                                        >
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
                                                <span className="text-2xl font-extrabold text-gray-900 mt-1.5 block">{value}</span>
                                            </div>
                                            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Continue Learning */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <PlayCircle className="h-4 w-4 text-blue-500" /> পড়া চালিয়ে যান
                                        </h3>
                                        {ongoingEnrollment && (
                                            <button
                                                onClick={() => setActiveTab('enrolled')}
                                                className="text-[10px] font-bold text-blue-500 hover:text-blue-600"
                                            >
                                                সবগুলো দেখুন &gt;
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-8 flex flex-col items-center justify-center text-center min-h-[220px]">
                                        {ongoingEnrollment ? (
                                            <div className="w-full flex flex-col md:flex-row items-center gap-6 text-left">
                                                <div className="relative aspect-video w-full md:w-48 bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                                    {ongoingEnrollment.thumbnail ? (
                                                        <img
                                                            src={ongoingEnrollment.thumbnail.startsWith('http') ? ongoingEnrollment.thumbnail : `/storage/${ongoingEnrollment.thumbnail}`}
                                                            alt={ongoingEnrollment.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                                            <BookOpen className="h-8 w-8 text-blue-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow w-full">
                                                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">{ongoingEnrollment.instructor_name}</span>
                                                    <h4 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{ongoingEnrollment.title}</h4>
                                                    <p className="text-[11px] text-gray-400 mt-1">{ongoingEnrollment.completed_lessons_count}/{ongoingEnrollment.total_lessons_count} টি লেসন সম্পন্ন</p>
                                                    <div className="flex items-center gap-3 mt-4">
                                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${ongoingEnrollment.progress}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-blue-500">{ongoingEnrollment.progress}%</span>
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/courses/${ongoingEnrollment.slug}/learn`}
                                                    className="px-5 py-3 rounded-xl text-xs font-bold shrink-0 shadow-md shadow-blue-500/10 flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                >
                                                    <PlayCircle className="h-4 w-4" /> পড়া চালিয়ে যান
                                                </Link>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-gray-50 rounded-full mb-3 text-gray-400 border border-gray-100">
                                                    <GraduationCap className="h-8 w-8" />
                                                </div>
                                                <h4 className="text-xs font-bold text-gray-800">কোনো চলমান কোর্স নেই</h4>
                                                <p className="text-[10px] text-gray-400 mt-1 max-w-xs font-light">আপনার শেখার যাত্রা শুরু করতে নিচের বাটনটি চাপুন!</p>
                                                <Link to="/" className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/15">
                                                    <BookOpen className="h-3.5 w-3.5" /> কোর্স ব্রাউজ করুন
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Quick enrolled list */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <BookOpen className="h-4 w-4 text-blue-500" /> আমার এনরোল করা কোর্স
                                        </h3>
                                        <button onClick={() => setActiveTab('enrolled')} className="text-[10px] font-bold text-blue-500 hover:text-blue-600">
                                            সবগুলো দেখুন &gt;
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {enrollments.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {enrollments.slice(0, 4).map((item) => (
                                                    <div key={item.id} className="p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-blue-500/20 transition-all group relative">
                                                        <div className="relative aspect-video w-32 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                                            {item.thumbnail ? (
                                                                <img
                                                                    src={item.thumbnail.startsWith('http') ? item.thumbnail : `/storage/${item.thumbnail}`}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                                    <BookOpen className="h-6 w-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow min-w-0 pr-4">
                                                            <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                                            <span className="text-[10px] text-gray-400 block mt-0.5">{item.instructor_name}</span>
                                                            <span className="text-[10px] text-gray-400 block mt-0.5">{item.completed_lessons_count}/{item.total_lessons_count} টি লেসন</span>
                                                            <div className="flex items-center gap-2 mt-3.5">
                                                                <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100">
                                                                    <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }} />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">{item.progress}%</span>
                                                            </div>
                                                        </div>
                                                        <Link to={`/courses/${item.slug}/learn`} className="absolute inset-0 z-10 rounded-xl" aria-label="Study course" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 italic text-gray-400 text-xs">
                                                আপনি কোনো কোর্সে এনরোল করেননি
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Other Tab Pages ─────────────────────── */}
                        {activeTab === 'enrolled'        && <EnrolledCourses />}
                        {activeTab === 'notice'          && <Notice />}
                        {activeTab === 'giftbox'         && <GiftBox />}
                        {activeTab === 'tools'           && <Tools />}
                        {activeTab === 'certificates'    && <Certificates />}
                        {activeTab === 'billing'         && <Billing />}
                        {activeTab === 'referral'        && <Referral />}
                        {activeTab === 'wallet'          && <WalletPage />}
                        {activeTab === 'support_group'   && <SupportGroup />}
                        {activeTab === 'support_tickets' && <SupportTickets />}
                        {activeTab === 'settings'        && <SettingsPage />}

                        {/* ── Coming Soon Pages ─────────────────── */}
                        {['review', 'products'].includes(activeTab) && (
                            <ComingSoon tab={activeTab} />
                        )}

                    </div>
                </main>

                {/* Footer */}
                <footer className="h-14 bg-white border-t border-gray-200 px-8 flex items-center justify-between text-[10px] text-gray-400 shrink-0">
                    <p>&copy; {new Date().getFullYear()} Vibe Think Academy. সর্বস্বত্ব সংরক্ষিত.</p>
                    <p>তৈরি করেছে ❤️ Md. Hridoy</p>
                </footer>
            </div>
        </div>
    );
}

// ── Coming Soon placeholder ──────────────────────────────────
const COMING_SOON_CONFIG = {
    notice:    { icon: Bell,        title: 'নোটিশ',                  desc: 'গুরুত্বপূর্ণ নোটিশ ও আপডেট এখানে দেখতে পাবেন।' },
    giftbox:   { icon: Gift,        title: 'গিফট বক্স',              desc: 'বিশেষ অফার ও উপহার এখানে থাকবে।' },
    review:    { icon: Star,        title: 'রিভিউ এবং আর্ন করুন',   desc: 'কোর্স রিভিউ করুন এবং পুরস্কার অর্জন করুন।' },
    tools:     { icon: Wrench,      title: 'প্রয়োজনীয় টুলস',       desc: 'আপনার কাজে লাগবে এমন সব টুলস এখানে পাবেন।' },
    products:  { icon: ShoppingBag, title: 'পণ্য',                   desc: 'ডিজিটাল ও ফিজিক্যাল পণ্য কিনুন।' },
};

function ComingSoon({ tab }) {
    const cfg = COMING_SOON_CONFIG[tab] || { icon: Star, title: 'শীঘ্রই আসছে', desc: '' };
    const Icon = cfg.icon;
    return (
        <div className="flex flex-col items-center justify-center min-h-[420px] text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-60 scale-150" />
                <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl shadow-sm">
                    <Icon className="h-14 w-14 text-blue-400" />
                </div>
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">{cfg.title}</h3>
            <p className="text-sm text-gray-400 max-w-xs mb-6">{cfg.desc}</p>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/25">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                শীঘ্রই আসছে
            </span>
        </div>
    );
}

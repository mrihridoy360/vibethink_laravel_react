import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import {
    LayoutDashboard, BookOpen, Bell, Gift, Star, Wrench, ShoppingBag,
    Award, CreditCard, Users, Wallet, MessageSquare, Ticket, Settings,
    ShieldAlert, LogOut, Search, Home as HomeIcon, BarChart2, Moon,
    BookOpenCheck, CheckCircle2, Clock, PlayCircle, GraduationCap,
    ChevronLeft, ChevronRight, MoreVertical, Menu, ChevronDown, Shield
} from 'lucide-react';

// Tab page components
import EnrolledCourses from './Dashboard/EnrolledCourses';
import Notice from './Dashboard/Notice';
import GiftBox from './Dashboard/GiftBox';
import Tools from './Dashboard/Tools';
import Certificates from './Dashboard/Certificates';
import Billing from './Dashboard/Billing';
import Referral from './Dashboard/Referral';
import WalletPage from './Dashboard/Wallet';
import SupportGroup from './Dashboard/SupportGroup';
import SupportTickets from './Dashboard/SupportTickets';
import SettingsPage from './Dashboard/Settings';
import Review from './Dashboard/Review';
import Products from './Dashboard/Products';
import Loader from '../Components/Loader';
import Sidebar from '../Components/Sidebar';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';

// ── Tab page titles ─────────────────────────────────────────
const PAGE_TITLES = {
    dashboard: 'ওভারভিউ',
    enrolled: 'ইনরোলড কোর্স',
    notice: 'নোটিশ',
    giftbox: 'গিফট বক্স',
    review: 'রিভিউ এবং আর্ন করুন',
    tools: 'প্রয়োজনীয় টুলস',
    products: 'পণ্য',
    certificates: 'সার্টিফিকেট',
    billing: 'বিলিং',
    affiliate: 'এফিলিয়েট',
    referral: 'এফিলিয়েট',
    wallet: 'ওয়ালেট',
    support_group: 'সাপোর্ট গ্রুপ',
    support_tickets: 'সাপোর্ট টিকেট',
    settings: 'সেটিংস',
};

export default function Dashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    // Close header dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const { tab } = useParams();
    const activeTab = (tab && PAGE_TITLES[tab]) ? (tab === 'referral' ? 'affiliate' : tab) : 'dashboard';

    const { settings } = useSiteSettings();
    const siteLogo = settings?.appearance?.site_logo || null;
    const siteFavicon = settings?.appearance?.site_favicon || null;
    const siteName = settings?.general?.site_name || 'VibeThink';

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/login');
            return;
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
    }, [user, authLoading, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (authLoading) {
        return <Loader text="ড্যাশবোর্ড লোড হচ্ছে..." />;
    }

    const stats = data?.stats || { enrolled_count: 0, active_count: 0, completed_count: 0, pending_count: 0 };
    const enrollments = data?.enrollments || [];
    const ongoingEnrollment = enrollments.find(e => e.progress > 0 && e.progress < 100);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f4f6fc] text-gray-800 font-sans">
            {/* ── Reusable Sidebar ───────────────────────────── */}
            <Sidebar activeTab={activeTab} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

            {/* ── Main Area ───────────────────────────────── */}
            <div className="flex-grow flex flex-col min-w-0">

                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors md:hidden cursor-pointer border-none bg-transparent"
                            title="Open Sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h2 className="text-base md:text-xl font-bold text-gray-900">{PAGE_TITLES[activeTab] || 'ড্যাশবোর্ড'}</h2>
                    </div>

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

                        {/* Notifications Bell */}
                        <div className="flex items-center gap-3 text-gray-400">
                            <button className="p-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors relative cursor-pointer border-none bg-transparent">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full" />
                            </button>
                        </div>

                        {/* User Profile (Public Navbar style) */}
                        {(() => {
                            const avatarUrl = user?.avatar
                                ? (user.avatar.startsWith('http') || user.avatar.startsWith('data:')
                                    ? user.avatar
                                    : `/storage/${user.avatar.replace(/^\/?storage\//, '')}`)
                                : null;

                            return (
                                <div className="relative" ref={profileDropdownRef}>
                                    {/* Profile Dropdown Trigger */}
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center gap-2 p-1 rounded-full bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200/50 focus:outline-none cursor-pointer border-none"
                                    >
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={user.name} className="h-8.5 w-8.5 rounded-full object-cover border theme-primary-border-light" />
                                        ) : (
                                            <div className="h-8.5 w-8.5 rounded-full theme-primary-bg-light theme-primary-text flex items-center justify-center font-bold text-xs uppercase border theme-primary-border-light">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <span className="text-xs text-slate-700 font-bold pr-1 pl-0.5 hidden lg:inline">{user.name}</span>
                                        <ChevronDown className={`h-3.5 w-3.5 text-slate-450 mr-1 transition-transform duration-250 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu Box */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 py-2 animate-fadeIn text-slate-800">
                                            <div className="px-4 py-2.5 border-b border-slate-100 mb-1 flex items-center gap-3">
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover border theme-primary-border-light shrink-0" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full theme-primary-bg-light theme-primary-text flex items-center justify-center font-bold text-sm uppercase border theme-primary-border-light shrink-0">
                                                        {user.name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed In As</p>
                                                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                    {user.role === 'admin' && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-650 border border-red-100 rounded-md text-[10px] font-bold">
                                                            অ্যাডমিন
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <Link
                                                to="/"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 theme-primary-text-hover transition-colors"
                                            >
                                                <HomeIcon className="h-4 w-4 text-slate-400" />
                                                হোম পেজ
                                            </Link>

                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 theme-primary-text-hover transition-colors"
                                                >
                                                    <Shield className="h-4 w-4 text-slate-400" />
                                                    এডমিন প্যানেল
                                                </Link>
                                            )}

                                            <Link
                                                to="/dashboard"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 theme-primary-text-hover transition-colors"
                                            >
                                                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                                ড্যাশবোর্ড
                                            </Link>

                                            <Link
                                                to="/dashboard/enrolled"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 theme-primary-text-hover transition-colors"
                                            >
                                                <BookOpenCheck className="h-4 w-4 text-slate-400" />
                                                ইনরোলড কোর্সসমূহ
                                            </Link>

                                            <Link
                                                to="/dashboard/settings"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 theme-primary-text-hover transition-colors"
                                            >
                                                <Settings className="h-4 w-4 text-slate-400" />
                                                প্রোফাইল সেটিংস
                                            </Link>

                                            <div className="border-t border-slate-100 my-1.5" />

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer border-none bg-transparent"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                লগআউট
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-grow overflow-y-auto p-4 sm:p-6 md:p-8">
                    {loading ? (
                        <Loader text="ড্যাশবোর্ড লোড হচ্ছে..." />
                    ) : (
                        <div className="max-w-6xl w-full mx-auto">

                            {/* ── Dashboard Overview ─────────────────────── */}
                            {activeTab === 'dashboard' && (
                                <div className="space-y-6">
                                    {/* Welcome */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/40 rounded-full blur-3xl -z-10" />
                                        <h2 className="text-lg font-bold text-gray-900">স্বাগতম, {user.name.split(' ')[0]}! 👋</h2>
                                        <p className="text-sm text-gray-400 mt-1 font-light">আজই নতুন কিছু শিখতে শুরু করুন!</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
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
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                                <PlayCircle className="h-4 w-4 text-blue-500" /> পড়া চালিয়ে যান
                                            </h3>
                                            {ongoingEnrollment && (
                                                <button
                                                    onClick={() => setActiveTab('enrolled')}
                                                    className="text-[11px] font-bold text-blue-500 hover:text-blue-600"
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
                                                        <span className="text-[11px] text-blue-500 font-bold uppercase tracking-wider">{ongoingEnrollment.instructor_name}</span>
                                                        <h4 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{ongoingEnrollment.title}</h4>
                                                        <p className="text-xs text-gray-400 mt-1">{ongoingEnrollment.completed_lessons_count}/{ongoingEnrollment.total_lessons_count} টি লেসন সম্পন্ন</p>
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${ongoingEnrollment.progress}%` }} />
                                                            </div>
                                                            <span className="text-sm font-bold text-blue-500">{ongoingEnrollment.progress}%</span>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/courses/${ongoingEnrollment.slug}/learn`}
                                                        className="px-5 py-3 rounded-xl text-sm font-bold shrink-0 shadow-md shadow-blue-500/10 flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                    >
                                                        <PlayCircle className="h-4 w-4" /> পড়া চালিয়ে যান
                                                    </Link>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-gray-50 rounded-full mb-3 text-gray-400 border border-gray-100">
                                                        <GraduationCap className="h-8 w-8" />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-gray-800">কোনো চলমান কোর্স নেই</h4>
                                                    <p className="text-[11px] text-gray-400 mt-1 max-w-xs font-light">আপনার শেখার যাত্রা শুরু করতে নিচের বাটনটি চাপুন!</p>
                                                    <Link to="/" className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/15">
                                                        <BookOpen className="h-3.5 w-3.5" /> কোর্স ব্রাউজ করুন
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick enrolled list */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                                <BookOpen className="h-4 w-4 text-blue-500" /> আমার এনরোল করা কোর্স
                                            </h3>
                                            <button onClick={() => setActiveTab('enrolled')} className="text-[11px] font-bold text-blue-500 hover:text-blue-600">
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
                                                                <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                                                <span className="text-[11px] text-gray-400 block mt-0.5">{item.instructor_name}</span>
                                                                <span className="text-[11px] text-gray-400 block mt-0.5">{item.completed_lessons_count}/{item.total_lessons_count} টি লেসন</span>
                                                                <div className="flex items-center gap-2 mt-3.5">
                                                                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100">
                                                                        <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }} />
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">{item.progress}%</span>
                                                                </div>
                                                            </div>
                                                            <Link to={`/courses/${item.slug}/learn`} className="absolute inset-0 z-10 rounded-xl" aria-label="Study course" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 italic text-gray-400 text-sm">
                                                    আপনি কোনো কোর্সে এনরোল করেননি
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Other Tab Pages ─────────────────────── */}
                            {activeTab === 'enrolled' && <EnrolledCourses />}
                            {activeTab === 'notice' && <Notice />}
                            {activeTab === 'giftbox' && <GiftBox />}
                            {activeTab === 'review' && <Review />}
                            {activeTab === 'tools' && <Tools />}
                            {activeTab === 'products' && <Products />}
                            {activeTab === 'certificates' && <Certificates />}
                            {activeTab === 'billing' && <Billing />}
                            {(activeTab === 'affiliate' || activeTab === 'referral') && <Referral />}
                            {activeTab === 'wallet' && <WalletPage />}
                            {activeTab === 'support_group' && <SupportGroup />}
                            {activeTab === 'support_tickets' && <SupportTickets />}
                            {activeTab === 'settings' && <SettingsPage />}

                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="h-14 bg-white border-t border-gray-200 px-8 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
                    <p>&copy; {new Date().getFullYear()} Vibe Think Academy. সর্বস্বত্ব সংরক্ষিত.</p>
                    <p>তৈরি করেছে ❤️ Md. Hridoy</p>
                </footer>
            </div>
        </div>
    );
}

// ── Coming Soon placeholder ──────────────────────────────────
const COMING_SOON_CONFIG = {
    notice: { icon: Bell, title: 'নোটিশ', desc: 'গুরুত্বপূর্ণ নোটিশ ও আপডেট এখানে দেখতে পাবেন।' },
    giftbox: { icon: Gift, title: 'গিফট বক্স', desc: 'বিশেষ অফার ও উপহার এখানে থাকবে।' },
    review: { icon: Star, title: 'রিভিউ এবং আর্ন করুন', desc: 'কোর্স রিভিউ করুন এবং পুরস্কার অর্জন করুন।' },
    tools: { icon: Wrench, title: 'প্রয়োজনীয় টুলস', desc: 'আপনার কাজে লাগবে এমন সব টুলস এখানে পাবেন।' },
    products: { icon: ShoppingBag, title: 'পণ্য', desc: 'ডিজিটাল ও ফিজিক্যাল পণ্য কিনুন।' },
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
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/25">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                শীঘ্রই আসছে
            </span>
        </div>
    );
}

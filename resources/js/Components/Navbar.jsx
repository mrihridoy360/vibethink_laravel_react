import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import {
    GraduationCap, LogOut, User, BookOpen, LogIn, LayoutDashboard,
    ChevronDown, Settings, Shield, BookOpenCheck, Search, Sun, Moon, Menu, X, ArrowRight
} from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading: authLoading } = useAuth();
    const { settings } = useSiteSettings();
    const siteName = settings?.general?.site_name || 'VibeThink';
    const navLogo = settings?.appearance?.site_logo || null;
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [activeTab, setActiveTab] = useState('হোম');

    // Theme toggle state (visual switch)
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const dropdownRef = useRef(null);

    // Sync search input value with URL changes
    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
    }, [searchParams]);

    // Handle theme toggle
    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Track active navigation tab based on location path
    useEffect(() => {
        const path = location.pathname;

        if (path === '/') {
            setActiveTab('হোম');
        } else if (path.startsWith('/courses')) {
            setActiveTab('কোর্স');
        } else if (path.startsWith('/bundles')) {
            setActiveTab('বান্ডেল');
        } else if (path.startsWith('/workshops')) {
            setActiveTab('ওয়ার্কশপ');
        } else if (path.startsWith('/ebooks')) {
            setActiveTab('ই-বুক');
        } else if (path.startsWith('/blog')) {
            setActiveTab('ব্লগ');
        } else {
            setActiveTab('');
        }
    }, [location]);

    // Handle logout
    const handleLogout = async () => {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        await logout();
        navigate('/login');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate('/courses');
        }
        setMobileMenuOpen(false);
    };

    const isFeatureEnabled = (key, defaultValue = '0') => {
        const val = settings?.features?.[key];
        if (val === undefined || val === null) {
            return defaultValue === '1';
        }
        return val === '1' || val === 1 || val === true;
    };

    const navLinks = [
        { name: 'হোম', path: '/' },
        { name: 'কোর্স', path: '/courses' },
        ...(isFeatureEnabled('feature_bundles', '0') ? [{ name: 'বান্ডেল', path: '/bundles' }] : []),
        ...(isFeatureEnabled('feature_workshops', '0') ? [{ name: 'ওয়ার্কশপ', path: '/workshops' }] : []),
        ...(isFeatureEnabled('feature_ebooks', '0') ? [{ name: 'ই-বুক', path: '/ebooks' }] : []),
        ...(isFeatureEnabled('feature_blog', '1') ? [{ name: 'ব্লগ', path: '/blog' }] : []),
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-white border-t-[0px] border-[#4E6178] border-b border-slate-100 shadow-sm transition-all duration-300 py-3 px-4 md:py-3.5 md:px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
                    {/* Left Section: Logo & Search */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
                        {/* Logo Wrapper */}
                        <Link to="/" className="flex items-center shrink-0">
                            {navLogo ? (
                                <img
                                    src={navLogo}
                                    alt={siteName}
                                    className="h-8 md:h-9 max-w-[120px] md:max-w-[160px] object-contain"
                                />
                            ) : (
                                <>
                                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg theme-primary-bg flex items-center justify-center font-black text-white text-lg md:text-xl shadow-sm">
                                        {siteName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight ml-2">
                                        {siteName}
                                    </span>
                                </>
                            )}
                        </Link>

                        {/* Desktop Search Bar (Hidden on Mobile) */}
                        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72 lg:w-80">
                            <input
                                type="text"
                                placeholder="Search.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 border-none text-slate-800 text-xs font-semibold pl-5 pr-12 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 transition-all duration-300"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-8.5 h-8.5 rounded-full theme-primary-bg hover:brightness-95 flex items-center justify-center text-white shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer border-none"
                            >
                                <Search className="w-4 h-4 stroke-[2.5]" />
                            </button>
                        </form>
                    </div>

                    {/* Center Section: Navigation Links Pill (Desktop only) */}
                    <div className="hidden lg:block">
                        <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-full p-1.5 flex items-center gap-1 shadow-sm">
                            {navLinks.map((link) => {
                                const isActive = activeTab === link.name;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`relative px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${isActive
                                            ? 'theme-primary-bg text-white shadow-md scale-[1.03]'
                                            : 'text-[#495057] theme-primary-text-hover'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Section: Theme switcher & Auth action */}
                    <div className="hidden md:flex items-center gap-5">
                        {/* Auth Status & Navigation Action */}
                        {authLoading ? (
                            <div className="h-11 w-full rounded-full bg-slate-100 animate-pulse" />
                        ) : user ? (
                            <div className="relative" ref={dropdownRef}>
                                {/* Profile Dropdown Trigger */}
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200/50 focus:outline-none cursor-pointer"
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-8.5 w-8.5 rounded-full object-cover border theme-primary-border-light" />
                                    ) : (
                                        <div className="h-8.5 w-8.5 rounded-full theme-primary-bg-light theme-primary-text flex items-center justify-center font-bold text-xs uppercase border theme-primary-border-light">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-xs text-slate-700 font-bold pr-1 pl-0.5 hidden lg:inline">{user.name}</span>
                                    <ChevronDown className={`h-3.5 w-3.5 text-slate-450 mr-1 transition-transform duration-250 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu Box */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl z-[100] py-2 animate-fadeIn text-slate-800">
                                        <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed In As</p>
                                            <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            {user.role === 'admin' && (
                                                <span className="inline-block mt-1.5 px-2 py-0.5 bg-red-50 text-red-650 border border-red-100 rounded-md text-[10px] font-bold">
                                                    অ্যাডমিন
                                                </span>
                                            )}
                                        </div>

                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 theme-primary-text-hover transition-colors"
                                            >
                                                <Shield className="h-4 w-4 text-slate-400" />
                                                এডমিন প্যানেল
                                            </Link>
                                        )}

                                        <Link
                                            to="/dashboard"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 theme-primary-text-hover transition-colors"
                                        >
                                            <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                            ড্যাশবোর্ড
                                        </Link>

                                        <Link
                                            to="/dashboard/enrolled"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 theme-primary-text-hover transition-colors"
                                        >
                                            <BookOpenCheck className="h-4 w-4 text-slate-400" />
                                            ইনরোলড কোর্সসমূহ
                                        </Link>

                                        <Link
                                            to="/dashboard/settings"
                                            onClick={() => setDropdownOpen(false)}
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
                        ) : (
                            <Link
                                to="/login"
                                className="theme-primary-bg text-white rounded-full font-bold px-6 py-2.5 text-xs flex items-center gap-2 hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                সাইন আপ/ লগইন <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </Link>
                        )}
                    </div>

                    {/* Mobile View Toggles (Hidden on Desktop) */}
                    <div className="flex md:hidden items-center gap-3">
                        {/* Hamburger Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-1 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Panel - Transformed to fixed scrollable overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-x-0 top-[60px] bottom-0 z-40 bg-white flex flex-col gap-4 p-6 overflow-y-auto animate-fadeIn md:hidden">

                        {/* Mobile Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F1F3F5] border-none text-slate-800 text-xs font-semibold pl-5 pr-12 py-3.5 rounded-full focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8.5 h-8.5 rounded-full theme-primary-bg flex items-center justify-center text-white"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </form>

                        {/* Mobile Links */}
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const isActive = activeTab === link.name;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                                            ? 'theme-primary-bg-light theme-primary-text'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile Auth Button */}
                        <div className="pt-2 border-t border-slate-100">
                            {authLoading ? (
                                <div className="h-9 w-32 rounded-full bg-slate-100 animate-pulse" />
                            ) : user ? (
                                <div className="flex flex-col gap-2">
                                    <div className="px-4 py-2 bg-slate-50 rounded-xl mb-1">
                                        <p className="text-xs font-bold text-slate-800">{user.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                                        >
                                            <Shield className="h-4 w-4" />
                                            এডমিন প্যানেল
                                        </Link>
                                    )}
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        ড্যাশবোর্ড
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left rounded-lg border-none bg-transparent cursor-pointer"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        লগআউট
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="theme-primary-bg text-white rounded-full font-bold py-3 text-xs flex items-center justify-center gap-2 hover:brightness-95"
                                >
                                    সাইন আপ/ লগইন <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <div className="h-[60px] md:h-[76px] w-full" />
        </>
    );
}

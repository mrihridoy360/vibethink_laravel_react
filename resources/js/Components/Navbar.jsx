import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import {
    GraduationCap, LogOut, User, BookOpen, LogIn, LayoutDashboard,
    ChevronDown, Settings, Shield, BookOpenCheck, Search, Sun, Moon, Menu, X, ArrowRight
} from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [activeTab, setActiveTab] = useState('হোম');
    
    // Theme toggle state (default to light mode, persist in localStorage)
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

    // Apply dark class on mount/toggle
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Handle logout
    const handleLogout = async () => {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        await logout();
        navigate('/login');
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

    // Track active navigation tab based on location hash
    useEffect(() => {
        const hash = location.hash;
        const path = location.pathname;
        
        if (path === '/') {
            if (hash === '#courses') setActiveTab('কোর্স');
            else if (hash === '#bundles') setActiveTab('বান্ডেল');
            else if (hash === '#workshops') setActiveTab('ওয়ার্কশপ');
            else if (hash === '#ebooks') setActiveTab('ই-বুক');
            else if (hash === '#blog') setActiveTab('ব্লগ');
            else setActiveTab('হোম');
        } else {
            setActiveTab('');
        }
    }, [location]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        } else {
            navigate('/');
        }
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { name: 'হোম', path: '/' },
        { name: 'কোর্স', path: '/#courses' },
        { name: 'বান্ডেল', path: '/#bundles' },
        { name: 'ওয়ার্কশপ', path: '/#workshops' },
        { name: 'ই-বুক', path: '/#ebooks' },
        { name: 'ব্লগ', path: '/#blog' },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 shadow-sm transition-all duration-300 py-3.5 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                {/* Left Section: Logo & Search */}
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    {/* Logo Wrapper */}
                    <Link to="/" className="flex items-center shrink-0">
                        {/* BD Map Globe Icon */}
                        <div className="relative w-10 h-10 rounded-full bg-[#FF5A00] flex items-center justify-center overflow-hidden shadow-sm hover:scale-105 transition-transform duration-300 shrink-0">
                            {/* Stylized Bangladesh Map in grid/dots format inside circle */}
                            <svg viewBox="0 0 100 100" className="w-8 h-8 text-white">
                                <circle cx="50" cy="18" r="2.5" className="fill-white animate-pulse" />
                                <circle cx="45" cy="25" r="2.5" className="fill-white" />
                                <circle cx="53" cy="25" r="2.5" className="fill-white" />
                                <circle cx="40" cy="33" r="2.5" className="fill-white" />
                                <circle cx="48" cy="33" r="2.5" className="fill-white" />
                                <circle cx="56" cy="33" r="2.5" className="fill-white" />
                                <circle cx="64" cy="33" r="2.5" className="fill-white" />
                                <circle cx="36" cy="41" r="2.5" className="fill-white" />
                                <circle cx="44" cy="41" r="2.5" className="fill-white" />
                                <circle cx="52" cy="41" r="2.5" className="fill-white" />
                                <circle cx="60" cy="41" r="2.5" className="fill-white" />
                                <circle cx="68" cy="41" r="2.5" className="fill-white animate-pulse" />
                                <circle cx="76" cy="41" r="2.5" className="fill-white" />
                                <circle cx="33" cy="49" r="2.5" className="fill-white" />
                                <circle cx="41" cy="49" r="2.5" className="fill-white" />
                                <circle cx="49" cy="49" r="2.5" className="fill-white" />
                                <circle cx="57" cy="49" r="2.5" className="fill-white" />
                                <circle cx="65" cy="49" r="2.5" className="fill-white" />
                                <circle cx="73" cy="49" r="2.5" className="fill-white" />
                                <circle cx="37" cy="57" r="2.5" className="fill-white" />
                                <circle cx="45" cy="57" r="2.5" className="fill-white" />
                                <circle cx="53" cy="57" r="2.5" className="fill-white" />
                                <circle cx="61" cy="57" r="2.5" className="fill-white" />
                                <circle cx="69" cy="57" r="2.5" className="fill-white" />
                                <circle cx="42" cy="65" r="2.5" className="fill-white" />
                                <circle cx="50" cy="65" r="2.5" className="fill-white" />
                                <circle cx="58" cy="65" r="2.5" className="fill-white" />
                                <circle cx="66" cy="65" r="2.5" className="fill-white" />
                                <circle cx="47" cy="73" r="2.5" className="fill-white" />
                                <circle cx="55" cy="73" r="2.5" className="fill-white" />
                                <circle cx="70" cy="73" r="2.5" className="fill-white" />
                                <circle cx="74" cy="79" r="2.5" className="fill-white" />
                                <circle cx="78" cy="85" r="2.5" className="fill-white animate-pulse" />
                                <circle cx="82" cy="91" r="2.5" className="fill-white" />
                                
                                <line x1="50" y1="18" x2="45" y2="25" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="50" y1="18" x2="53" y2="25" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="45" y1="25" x2="40" y2="33" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="45" y1="25" x2="48" y2="33" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="53" y1="25" x2="56" y2="33" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="56" y1="33" x2="64" y2="33" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="48" y1="33" x2="52" y2="41" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="56" y1="33" x2="60" y2="41" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="64" y1="33" x2="68" y2="41" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="68" y1="41" x2="76" y2="41" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="44" y1="41" x2="41" y2="49" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="52" y1="41" x2="49" y2="49" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="60" y1="41" x2="57" y2="49" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="68" y1="41" x2="73" y2="49" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="49" y1="49" x2="53" y2="57" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="57" y1="49" x2="61" y2="57" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="65" y1="49" x2="69" y2="57" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="53" y1="57" x2="50" y2="65" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="61" y1="57" x2="58" y2="65" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="69" y1="57" x2="66" y2="65" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="50" y1="65" x2="47" y2="73" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="58" y1="65" x2="55" y2="73" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="66" y1="65" x2="70" y2="73" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="70" y1="73" x2="74" y2="79" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="74" y1="79" x2="78" y2="85" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                                <line x1="78" y1="85" x2="82" y2="91" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                            </svg>
                        </div>
                        
                        {/* Gray vertical separator line */}
                        <div className="h-8 w-[1.5px] bg-slate-200 dark:bg-slate-700 mx-3.5"></div>
                        
                        {/* "Learning VibeThink" logo text */}
                        <div className="flex flex-col justify-center leading-none">
                            <div className="flex items-end font-bold text-2xl tracking-tight select-none">
                                <span className="text-[#0D6EFD]">Learn</span>
                                <span className="text-[#0D6EFD]">in</span>
                                <span className="text-[#FF5A00] relative flex items-center">
                                    g
                                    {/* Cap icon above g */}
                                    <span className="absolute -top-[7.5px] -right-[4.5px] text-[#FF5A00] rotate-[12deg]">
                                        <svg className="w-3.5 h-3.5 fill-[#FF5A00]" viewBox="0 0 24 24">
                                            <path d="M12 2L1 7l11 5 9-4.09V14.5c0 1.5-2.5 2.5-6 2.5s-6-1-6-2.5V8H7v6.5C7 17.5 10 20 14 20s7-2.5 7-5.5V8.82L23 7 12 2z"/>
                                        </svg>
                                    </span>
                                </span>
                            </div>
                            <div className="mt-0.5">
                                <span className="bg-[#FF5A00] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-[0.2em] leading-none inline-block">
                                    VIBETHINK LMS
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Search Bar (Hidden on Mobile) */}
                    <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72 lg:w-80">
                        <input
                            type="text"
                            placeholder="Search.."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F1F3F5] dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 text-xs font-semibold pl-5 pr-12 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-[#6C757D] dark:placeholder-slate-400 transition-all duration-300"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-8.5 h-8.5 rounded-full bg-[#0074D9] hover:bg-blue-700 flex items-center justify-center text-white shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer border-none"
                        >
                            <Search className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </form>
                </div>

                {/* Center Section: Navigation Links Pill (Desktop only) */}
                <div className="hidden lg:block">
                    <div className="bg-[#F8F9FA] dark:bg-slate-800/80 border border-[#E9ECEF] dark:border-slate-700/80 rounded-full p-1.5 flex items-center gap-1 shadow-sm">
                        {navLinks.map((link) => {
                            const isActive = activeTab === link.name;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                                        isActive
                                            ? 'bg-[#0074D9] text-white shadow-md shadow-blue-500/30 scale-[1.03]'
                                            : 'text-[#495057] dark:text-slate-300 hover:text-[#0074D9] dark:hover:text-white'
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
                    {/* Theme Switch Toggle Switch */}
                    <div
                        onClick={toggleTheme}
                        className={`w-14 h-7.5 rounded-full flex items-center p-0.5 cursor-pointer transition-all duration-300 select-none relative ${
                            isDark ? 'bg-slate-700' : 'bg-[#DCE6F5]'
                        }`}
                    >
                        <div
                            className={`w-6.5 h-6.5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 transform ${
                                isDark ? 'translate-x-6.5' : 'translate-x-0'
                            }`}
                        >
                            {isDark ? (
                                <Moon className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                            ) : (
                                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-spin-slow" />
                            )}
                        </div>
                    </div>

                    {/* Auth Status & Navigation Action */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            {/* Profile Dropdown Trigger */}
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 p-1 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-slate-700 focus:outline-none cursor-pointer"
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-8.5 w-8.5 rounded-full object-cover border border-[#FF5A00]/25" />
                                ) : (
                                    <div className="h-8.5 w-8.5 rounded-full bg-[#FF5A00]/10 text-[#FF5A00] flex items-center justify-center font-bold text-xs uppercase border border-[#FF5A00]/25">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <span className="text-xs text-slate-700 dark:text-slate-250 font-bold pr-1 pl-0.5 hidden lg:inline">{user.name}</span>
                                <ChevronDown className={`h-3.5 w-3.5 text-slate-450 mr-1 transition-transform duration-250 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu Box */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-750 rounded-2xl shadow-xl z-[100] py-2 animate-fadeIn">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-750 mb-1">
                                        <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Signed In As</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-150 truncate mt-0.5">{user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                        {user.role === 'admin' && (
                                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-md text-[10px] font-bold">
                                                অ্যাডমিন
                                            </span>
                                        )}
                                    </div>

                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0074D9] dark:hover:text-white transition-colors"
                                        >
                                            <Shield className="h-4 w-4 text-slate-400" />
                                            এডমিন প্যানেল
                                        </Link>
                                    )}

                                    <Link
                                        to="/dashboard"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0074D9] dark:hover:text-white transition-colors"
                                    >
                                        <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                        ড্যাশবোর্ড
                                    </Link>

                                    <Link
                                        to="/dashboard/enrolled"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0074D9] dark:hover:text-white transition-colors"
                                    >
                                        <BookOpenCheck className="h-4 w-4 text-slate-400" />
                                        ইনরোলড কোর্সসমূহ
                                    </Link>

                                    <Link
                                        to="/dashboard/settings"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0074D9] dark:hover:text-white transition-colors"
                                    >
                                        <Settings className="h-4 w-4 text-slate-400" />
                                        প্রোফাইল সেটিংস
                                    </Link>

                                    <div className="border-t border-slate-100 dark:border-slate-750 my-1.5" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer border-none bg-transparent"
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
                            className="bg-[#FF5A00] text-white rounded-full font-bold px-6 py-2.5 text-xs flex items-center gap-2 hover:bg-[#E04F00] shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            সাইন আপ/ লগইন <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                    )}
                </div>

                {/* Mobile View Toggles (Hidden on Desktop) */}
                <div className="flex md:hidden items-center gap-3">
                    {/* Theme Switch for Mobile */}
                    <div
                        onClick={toggleTheme}
                        className={`w-12 h-6.5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors duration-300 ${
                            isDark ? 'bg-slate-700' : 'bg-[#DCE6F5]'
                        }`}
                    >
                        <div
                            className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300 transform ${
                                isDark ? 'translate-x-5.5' : 'translate-x-0'
                            }`}
                        >
                            {isDark ? (
                                <Moon className="w-3 h-3 text-indigo-500" />
                            ) : (
                                <Sun className="w-3 h-3 text-amber-500" />
                            )}
                        </div>
                    </div>

                    {/* Hamburger Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Panel */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 animate-fadeIn">
                    
                    {/* Mobile Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search.."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F1F3F5] dark:bg-slate-850 border-none text-slate-800 dark:text-slate-200 text-xs font-semibold pl-5 pr-12 py-3.5 rounded-full focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8.5 h-8.5 rounded-full bg-[#0074D9] flex items-center justify-center text-white"
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
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        isActive
                                            ? 'bg-[#0074D9]/10 text-[#0074D9] dark:bg-blue-500/10 dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-855'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Auth Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        {user ? (
                            <div className="flex flex-col gap-2">
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 rounded-xl mb-1">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                </div>
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                                    >
                                        <Shield className="h-4 w-4" />
                                        এডমিন প্যানেল
                                    </Link>
                                )}
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    ড্যাশবোর্ড
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left rounded-lg border-none bg-transparent cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4" />
                                    লগআউট
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="bg-[#FF5A00] text-white rounded-full font-bold py-3 text-xs flex items-center justify-center gap-2 hover:bg-[#E04F00]"
                            >
                                সাইন আপ/ লগইন <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

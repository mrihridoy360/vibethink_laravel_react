import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import {
    GraduationCap, LogOut, User, BookOpen, LogIn, LayoutDashboard,
    ChevronDown, Settings, Shield, BookOpenCheck
} from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        setDropdownOpen(false);
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

    return (
        <nav className="sticky top-0 z-50 w-full px-6 py-4 transition-all duration-300 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-sm shadow-slate-100/40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors">
                        Vibe<span className="text-purple-600">Think</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
                        <BookOpen className="h-4 w-4" /> Courses
                    </Link>

                    {user ? (
                        <div className="relative pl-4 border-l border-slate-200" ref={dropdownRef}>
                            {/* Profile Trigger Button */}
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-50 transition-all focus:outline-none cursor-pointer"
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full border border-purple-500/30 object-cover" />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <span className="text-sm text-slate-700 font-semibold hidden md:inline">{user.name}</span>
                                <ChevronDown className={`h-4 w-4 text-slate-450 transition-transform duration-250 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl z-[100] py-2.5 animate-fadeIn">
                                    {/* User info info card */}
                                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                        <p className="text-xs text-gray-450 font-bold uppercase tracking-wider">Signed In As</p>
                                        <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        {user.role === 'admin' && (
                                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-red-50 text-red-650 border border-red-100 rounded-md text-[10px] font-bold">
                                                অ্যাডমিন
                                            </span>
                                        )}
                                    </div>

                                    {/* Items */}
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-650 transition-colors"
                                        >
                                            <Shield className="h-4 w-4 text-slate-450" />
                                            এডমিন প্যানেল
                                        </Link>
                                    )}

                                    <Link
                                        to="/dashboard"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-655 transition-colors"
                                    >
                                        <LayoutDashboard className="h-4 w-4 text-slate-450" />
                                        ড্যাশবোর্ড
                                    </Link>

                                    <Link
                                        to="/dashboard/enrolled"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-655 transition-colors"
                                    >
                                        <BookOpenCheck className="h-4 w-4 text-slate-450" />
                                        ইনরোলড কোর্সসমূহ
                                    </Link>

                                    <Link
                                        to="/dashboard/settings"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-655 transition-colors"
                                        >
                                        <Settings className="h-4 w-4 text-slate-450" />
                                        প্রোফাইল সেটিংস
                                    </Link>

                                    {/* Divider */}
                                    <div className="border-t border-slate-100 my-1.5" />

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer border-none"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        লগআউট
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5">
                                <LogIn className="h-4 w-4" /> Login
                            </Link>
                            <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-100 transition-all">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { GraduationCap, LogOut, User, BookOpen, LogIn, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 w-full px-6 py-4 transition-all duration-300 bg-[#0b0f19]/70 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-400 transition-colors">
                        Vibe<span className="text-purple-500">Think</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
                        <BookOpen className="h-4 w-4" /> Courses
                    </Link>

                    {user && (
                        <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors">
                            <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                    )}

                    {user ? (
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            <div className="flex items-center gap-2">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full border border-purple-500/30 object-cover" />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <span className="text-sm text-gray-200 font-medium hidden md:inline">{user.name}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-1.5">
                                <LogIn className="h-4 w-4" /> Login
                            </Link>
                            <Link to="/register" className="glass-btn-primary px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-purple-500/10">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

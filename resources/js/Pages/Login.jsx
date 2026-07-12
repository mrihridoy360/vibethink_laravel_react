import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await login(email, password, remember);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.message || 'Incorrect credentials');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto px-4 sm:px-6 py-10 sm:py-20 flex flex-col justify-center min-h-[85vh]">
            <div className="bg-white border border-slate-200/80 shadow-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-full blur-2xl -z-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl -z-10" />

                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl shadow-lg mb-4">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                    <p className="text-sm text-slate-500 mt-1.5 font-normal">Sign in to your VibeThink account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-purple-605 focus:ring-2 focus:ring-purple-600/10 text-slate-800 bg-white"
                                placeholder="name@example.com"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-purple-605 focus:ring-2 focus:ring-purple-600/10 text-slate-800 bg-white"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="w-4.5 h-4.5 accent-purple-600 rounded border-slate-200 text-purple-605 focus:ring-purple-600/10"
                            />
                            <span>লগইন সেশন মনে রাখুন (Remember login)</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
                    >
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Switch link */}
                <div className="text-center mt-6 text-xs text-slate-400 font-medium">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-600 hover:text-purple-800 font-semibold">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
}

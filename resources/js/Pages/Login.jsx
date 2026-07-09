import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await login(email, password);
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
        <div className="max-w-md w-full mx-auto px-6 py-20 flex flex-col justify-center min-h-[80vh]">
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl -z-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -z-10" />

                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl shadow-lg mb-4">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-sm text-gray-400 mt-1.5 font-light">Sign in to your VibeThink account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                                placeholder="name@example.com"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="glass-btn-primary w-full py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/15"
                    >
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Switch link */}
                <div className="text-center mt-6 text-xs text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
}

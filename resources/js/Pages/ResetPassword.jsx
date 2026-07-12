import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import { GraduationCap, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
    const { settings } = useSiteSettings();
    const siteFavicon = settings?.appearance?.site_favicon || null;
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const [email, setEmail] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            const res = await axios.post('/api/auth/reset-password', {
                email,
                token: params.get('token'),
                password,
                password_confirmation: passwordConfirmation,
            });
            if (res.data.success) {
                setSuccess(res.data.message || 'পাসওয়ার্ড রিসেট সফল হয়েছে।');
                setTimeout(() => navigate('/login', { replace: true }), 1500);
            } else {
                setError(res.data.message || 'কিছু সমস্যা হয়েছে।');
            }
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError(err.response?.data?.message || 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।');
            }
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
                    <div className="mb-4 flex justify-center">
                        {siteFavicon ? (
                            <img src={siteFavicon} alt="Site" className="h-12 w-12 object-contain" />
                        ) : (
                            <GraduationCap className="h-10 w-10 theme-primary-text" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">নতুন পাসওয়ার্ড সেট করুন</h2>
                    <p className="text-sm text-slate-500 mt-1.5 font-normal">আপনার নতুন পাসওয়ার্ড দিন</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs flex items-start gap-2">
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-600/10 text-slate-800 bg-white transition-all ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-purple-605'}`}
                                placeholder="name@example.com"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.email && <span className="text-[10px] text-red-600 mt-1 block">{errors.email[0]}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full pl-11 pr-11 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-600/10 text-slate-800 bg-white transition-all ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-purple-605'}`}
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <span className="text-[10px] text-red-600 mt-1 block">{errors.password[0]}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                required
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="w-full pl-11 pr-11 py-2.5 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-purple-605 focus:ring-2 focus:ring-purple-600/10 text-slate-800 bg-white"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                tabIndex={-1}
                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl font-bold text-sm theme-primary-bg hover:brightness-95 text-white shadow-sm transition-all"
                    >
                        {submitting ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড রিসেট করুন'}
                    </button>
                </form>

                {/* Switch link */}
                <div className="text-center mt-6 text-xs text-slate-400 font-medium">
                    মনে আছে?{' '}
                    <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold">
                        লগইন করুন
                    </Link>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import { GraduationCap, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
    const { settings } = useSiteSettings();
    const siteFavicon = settings?.appearance?.site_favicon || null;
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});
        setSuccess('');
        setSubmitting(true);
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            if (res.data.success) {
                setSuccess(res.data.message || 'রিসেট লিংক পাঠানো হয়েছে।');
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
                    <h2 className="text-2xl font-bold text-slate-900">পাসওয়ার্ড ভুলে গেছেন?</h2>
                    <p className="text-sm text-slate-500 mt-1.5 font-normal">আপনার ইমেইল দিন, আমরা রিসেট লিংক পাঠাবো।</p>
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
                                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-600/10 text-slate-800 bg-white ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-purple-605'}`}
                                placeholder="name@example.com"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.email && <span className="text-[10px] text-red-600 mt-1 block">{errors.email[0]}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl font-bold text-sm theme-primary-bg hover:brightness-95 text-white shadow-sm transition-all"
                    >
                        {submitting ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
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

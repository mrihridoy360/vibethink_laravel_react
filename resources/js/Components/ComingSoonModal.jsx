import React, { useState, useEffect } from 'react';
import { X, Sparkles, CalendarDays, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import axios from 'axios';

export default function ComingSoonModal({ isOpen, course, onClose }) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setName(user?.name || '');
            setEmail(user?.email || '');
            setSuccess(false);
            setError('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            setError('অনুগ্রহ করে নাম এবং ইমেইল দুটোই পূরণ করুন।');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`/api/courses/${course.id}/interest`, {
                name,
                email
            });
            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
            {/* Modal Body */}
            <div 
                className="bg-white rounded-[2rem] shadow-2xl border border-slate-100/80 w-full max-w-md overflow-hidden relative flex flex-col p-6 text-center transform transition-all duration-300 scale-100 animate-scaleIn animate-duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all border-none cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {success ? (
                    <div className="py-8 px-2 space-y-5 flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>নিবন্ধন সফল হয়েছে!</h3>
                            <p className="text-slate-550 text-sm leading-relaxed max-w-xs mx-auto" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                ধন্যবাদ! <strong>{course?.title}</strong> কোর্সটি লাইভ হওয়ার সাথে সাথেই আপনাকে <strong>{email}</strong> ইমেইলে নোটিফিকেশন পাঠিয়ে দেওয়া হবে।
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-black text-white font-extrabold text-sm rounded-2xl transition-all cursor-pointer border-none"
                            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                        >
                            ঠিক আছে, ধন্যবাদ
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Decorative Icon */}
                        <div className="mx-auto mt-2 mb-4 relative flex items-center justify-center">
                            <div className="w-16 h-16 bg-purple-55 bg-purple-50 rounded-full flex items-center justify-center text-purple-650">
                                <CalendarDays className="w-8 h-8 stroke-[1.5]" />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-sm">
                                <Sparkles className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2 px-2 mb-5">
                            <span className="inline-block px-3 py-1 bg-purple-50 border border-purple-100 text-purple-600 rounded-full text-[10px] font-black tracking-wider uppercase font-mono">
                                Coming Soon • শীঘ্রই আসছে
                            </span>
                            <h3 className="text-xl font-extrabold text-slate-900 leading-tight" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                {course?.title || 'কোর্সটি শীঘ্রই আসছে!'}
                            </h3>
                            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                আমরা কোর্সটির কন্টেন্ট ও প্রজেক্ট নিয়ে কাজ করছি। লাইভ হওয়ার সাথে সাথে ইমেইল নোটিফিকেশন পেতে আপনার নাম ও মেইল দিয়ে আগ্রহ প্রকাশ করে রাখুন।
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-3.5 text-left px-2">
                            {error && (
                                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-650 font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs text-slate-500 font-bold mb-1.5 pl-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>আপনার নাম</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="যেমন: সাকিব হাসান"
                                    className="w-full px-4 py-3 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-550/10 focus:border-purple-500 bg-slate-50/50"
                                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-500 font-bold mb-1.5 pl-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>ইমেইল এড্রেস</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="যেমন: sakib@example.com"
                                    className="w-full px-4 py-3 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-550/10 focus:border-purple-500 bg-slate-50/50"
                                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 py-3.5 px-6 theme-primary-bg hover:brightness-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[var(--primary-color)]/15 flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60"
                                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" /> সাবমিট হচ্ছে...
                                    </>
                                ) : (
                                    'আগ্রহ প্রকাশ করুন'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

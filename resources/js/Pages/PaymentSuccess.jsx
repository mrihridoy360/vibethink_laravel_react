import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Play, BookOpen, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { trackPixelEvent } from '../Utils/metaPixel';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const courseSlug = searchParams.get('slug') || '';
    const trxId = searchParams.get('trx') || 'N/A';
    const amountParam = searchParams.get('amount');
    const parsedAmount = amountParam ? parseFloat(amountParam) : null;

    useEffect(() => {
        if (courseSlug && trxId !== 'N/A') {
            axios.get(`/api/courses/${courseSlug}`)
                .then(response => {
                    if (response.data.success) {
                        const course = response.data.course;
                        const value = (parsedAmount !== null && !isNaN(parsedAmount))
                            ? parsedAmount
                            : (parseFloat(course.discount_price > 0 ? course.discount_price : course.price) || 0);
                        trackPixelEvent('Purchase', {
                            content_name: course.title,
                            content_ids: [course.id],
                            content_type: 'product',
                            value: value,
                            currency: 'BDT'
                        }, { eventId: trxId });
                    }
                })
                .catch(err => console.error('Error tracking purchase event:', err));
        }
    }, [courseSlug, trxId, parsedAmount]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-200/30 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-pink-200/30 rounded-full blur-[100px] -z-10" />

            {/* Glassmorphic Card */}
            <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[32px] text-center shadow-xl flex flex-col items-center">
                
                {/* Success Icon */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-green-200/40 rounded-full blur-xl scale-125 animate-pulse" />
                    <div className="relative w-20 h-20 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-10 w-10 animate-bounce" />
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                    পেমেন্ট সফল হয়েছে!
                </h1>
                <p className="text-slate-505 text-slate-500 text-sm font-normal mb-8 max-w-xs">
                    আপনার পেমেন্টটি সফলভাবে সম্পন্ন হয়েছে এবং কোর্সে ইনরোল নিশ্চিত করা হয়েছে।
                </p>

                {/* Details Section */}
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                        <span>লেনদেন আইডি (TrxID)</span>
                        <span className="text-slate-800 font-semibold select-all">{trxId}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                        <span>গেটওয়ে</span>
                        <span className="text-slate-800 font-semibold">ZiniPay</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                        <span>পেমেন্ট স্ট্যাটাস</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-green-50 border border-green-100 text-green-700 font-semibold">
                            COMPLETED
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
                    {courseSlug ? (
                        <Link
                            to={`/courses/${courseSlug}/learn`}
                            className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/10 transition-all text-sm group"
                        >
                            <Play className="h-4 w-4 fill-white" />
                            ক্লাসরুমে প্রবেশ করুন
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ) : (
                        <Link
                            to="/dashboard"
                            className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/10 transition-all text-sm"
                        >
                            <BookOpen className="h-4 w-4" />
                            ড্যাশবোর্ডে যান
                        </Link>
                    )}

                    <Link
                        to="/dashboard?tab=billing"
                        className="w-full py-4 rounded-2xl font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200/50 text-slate-700 hover:text-slate-800 flex items-center justify-center gap-2 transition-all text-xs"
                    >
                        ইনভয়েস ও হিস্ট্রি দেখুন
                    </Link>
                </div>
            </div>
        </div>
    );
}

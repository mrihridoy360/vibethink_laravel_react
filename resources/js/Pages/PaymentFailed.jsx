import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function PaymentFailed() {
    const [searchParams] = useSearchParams();
    const errorMsg = searchParams.get('error') || 'পেমেন্ট প্রসেসিং ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-red-200/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-amber-200/20 rounded-full blur-[100px] -z-10" />

            {/* Glassmorphic Card */}
            <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[32px] text-center shadow-xl flex flex-col items-center">
                
                {/* Warning Icon */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-200/40 rounded-full blur-xl scale-125 animate-pulse" />
                    <div className="relative w-20 h-20 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-red-500">
                        <AlertCircle className="h-10 w-10 animate-bounce" />
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                    পেমেন্ট ব্যর্থ হয়েছে!
                </h1>
                <p className="text-slate-600 text-sm font-normal mb-8 max-w-xs leading-relaxed">
                    {decodeURIComponent(errorMsg)}
                </p>

                {/* Info Note */}
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left text-slate-500 text-xs leading-relaxed">
                    পেমেন্ট সংক্রান্ত কোনো সমস্যা হলে বা আপনার অ্যাকাউন্ট থেকে টাকা কেটে নেওয়া হলে অনুগ্রহ করে সাপোর্ট টিকেট ওপেন করুন অথবা এডমিনের সাথে যোগাযোগ করুন।
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-red-650 to-red-600 hover:from-red-700 hover:to-red-700 bg-red-600 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/10 transition-all text-sm group"
                    >
                        <RotateCcw className="h-4 w-4 group-hover:-rotate-45 transition-transform" />
                        আবার চেষ্টা করুন
                    </button>

                    <Link
                        to="/"
                        className="w-full py-4 rounded-2xl font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200/50 text-slate-700 hover:text-slate-800 flex items-center justify-center gap-2 transition-all text-xs"
                    >
                        <Home className="h-4 w-4" />
                        হোম পেজে ফিরে যান
                    </Link>
                </div>
            </div>
        </div>
    );
}

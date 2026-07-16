import React, { useEffect } from 'react';
import { X, Sparkles, Clock, CalendarDays } from 'lucide-react';

export default function ComingSoonModal({ isOpen, course, onClose }) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
            {/* Modal Body */}
            <div 
                className="bg-white rounded-[2rem] shadow-2xl border border-slate-100/80 w-full max-w-md overflow-hidden relative flex flex-col p-6 text-center transform transition-all duration-300 scale-100 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all border-none cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Decorative Icon */}
                <div className="mx-auto mt-4 mb-5 relative flex items-center justify-center">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 animate-pulse">
                        <CalendarDays className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-sm">
                        <Sparkles className="w-4 h-4" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3 px-2">
                    <span className="inline-block px-3 py-1 bg-purple-50 border border-purple-100 text-purple-600 rounded-full text-[11px] font-bold tracking-wider uppercase font-mono">
                        Coming Soon • শীঘ্রই আসছে
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                        {course?.title || 'কোর্সটি শীঘ্রই আসছে!'}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal pt-1">
                        আমরা এই কোর্সটির কারিকুলাম, ক্লাস মেটেরিয়াল এবং প্রজেক্ট ডিজাইন নিয়ে দারুণভাবে কাজ করে যাচ্ছি। খুব শীঘ্রই কোর্সটি সবার জন্য উন্মুক্ত করা হবে!
                    </p>
                </div>

                {/* Action button */}
                <div className="mt-8 pt-2">
                    <button 
                        onClick={onClose}
                        className="w-full py-3.5 px-6 theme-primary-bg hover:brightness-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-600/15 hover:shadow-purple-600/25 transition-all cursor-pointer border-none"
                    >
                        ঠিক আছে, ধন্যবাদ
                    </button>
                </div>
            </div>
        </div>
    );
}

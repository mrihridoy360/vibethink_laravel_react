import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Layers, CheckCircle2, ChevronRight, ArrowRight, ShieldCheck, Sparkles, BookOpen, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';

export default function Bundles() {
    const { user } = useAuth();
    const { settings } = useSiteSettings();
    const isEnabled = settings?.features?.feature_bundles === '1' || settings?.features?.feature_bundles === 1 || settings?.features?.feature_bundles === true;
    
    if (!isEnabled) {
        return (
            <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 border border-red-150 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">মডিউলটি উপলব্ধ নয়</h2>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    বান্ডেল মডিউলটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
                </p>
                <Link to="/" className="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    হোমপেজে ফিরে যান
                </Link>
            </div>
        );
    }

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBundle, setSelectedBundle] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingName, setBookingName] = useState('');
    const [bookingPhone, setBookingPhone] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('/api/courses');
                if (response.data.success) {
                    setCourses(response.data.courses);
                }
            } catch (err) {
                console.error('Error fetching courses for bundles:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Create 2 premium mock bundles using real course references
    const bundles = [
        {
            id: 'b1',
            title: 'AI Coding & Development Master Bundle',
            slug: 'ai-coding-development-bundle',
            tagline: 'কমপ্লিট AI চালিত সফটওয়্যার ডেভেলপমেন্ট ও অটোমেশন প্যাকেজ',
            description: 'এই বান্ডেলটি তাদের জন্য যারা AI প্রযুক্তি ব্যবহার করে দ্রুত কোডিং শিখতে চান এবং নিজেদের কাজের গতি দ্বিগুণ করতে চান। আমাদের ২টি মূল প্রোগ্রামিং কোর্স এই একটি বান্ডেলে পাবেন সাশ্রয়ী মূল্যে।',
            badge: 'সর্বোত্তম বিক্রিত',
            price: 7500,
            regularPrice: 12000,
            coursesIncluded: courses.map(c => c.id), // Includes all courses
            features: [
                'সকল লাইভ সেশন ও রেকর্ডিং অ্যাক্সেস',
                'লাইফটাইম কোর্স অ্যাক্সেস ও আপডেট',
                'ডেডিকেটেড প্রাইভেট সাপোর্ট গ্রুপ',
                '২টি প্রফেশনাল সার্টিফিকেট',
                'রিয়েল-ওয়ার্ল্ড ১০+ প্রজেক্টস'
            ],
            colorTheme: 'from-blue-600 to-indigo-650',
            bgTint: 'bg-blue-50/50 border-blue-100/30',
            glowColor: 'bg-blue-100/60'
        },
        {
            id: 'b2',
            title: 'Full Stack & Automation Bundle',
            slug: 'full-stack-automation-bundle',
            tagline: 'লারাভেল রিয়্যাক্ট এবং ইউটিউব অটোমেশন গাইড',
            description: 'আধুনিক ওয়েব ডেভেলপমেন্ট ও কন্টেন্ট ক্রিয়েশন অটোমেশনের এক অনন্য সমন্বয়। নিজের ওয়েব সাইট তৈরি ও ইউটিউব চ্যানেলকে অটোমেট করে প্যাসিভ ইনকাম শুরু করার কমপ্লিট সল্যুশন।',
            badge: 'জনপ্রিয়',
            price: 5500,
            regularPrice: 9000,
            coursesIncluded: courses.slice(0, 1).map(c => c.id), // First course only
            features: [
                'লারাভেল ও রিয়্যাক্ট প্রজেক্ট গাইড',
                'ইউটিউব প্রমোশন ও অপটিমাইজেশন সিক্রেটস',
                'প্রিমিয়াম রিসোর্স ও টেমপ্লেট লাইব্রেরি',
                'সাপ্তাহিক ওয়ান-টু-ওয়ান গাইডেন্স সেশন',
                'ক্যারিয়ার পোর্টফোলিও রিভিউ'
            ],
            colorTheme: 'from-indigo-600 to-purple-650',
            bgTint: 'bg-indigo-50/50 border-indigo-100/30',
            glowColor: 'bg-indigo-100/40'
        }
    ];

    const handleCheckout = (bundle) => {
        setSelectedBundle(bundle);
        setBookingSuccess(false);
        if (user) {
            setBookingName(user.name);
        }
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            const ticketData = {
                title: `Bundle Purchase Request: ${selectedBundle.title}`,
                category: 'Billing & Payments',
                message: `Hello Support,\n\nI want to purchase the "${selectedBundle.title}" at the bundle price of ৳${selectedBundle.price}.\n\nDetails:\nName: ${bookingName}\nPhone: ${bookingPhone}\nNotes: ${bookingNotes || 'None'}\n\nPlease guide me on the payment process.`,
                priority: 'high'
            };

            const response = await axios.post('/api/support-tickets', ticketData);
            if (response.data.success) {
                setBookingSuccess(true);
                setTimeout(() => {
                    setSelectedBundle(null);
                    setBookingSuccess(false);
                }, 3500);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'বুকিং অনুরোধ সম্পন্ন করতে একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
            {/* Header Banner */}
            <div className="text-center relative overflow-hidden py-10 md:py-16 px-4 rounded-3xl bg-blue-50/50 border border-blue-100/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl -z-10" />
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
                    প্রিমিয়াম <span className="bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent">কোর্স বান্ডেলসমূহ</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-6 md:mb-8 font-normal px-2">
                    একাধিক কোর্স একসাথে কিনে সাশ্রয় করুন আকর্ষণীয় মূল্যছাড়। প্রফেশনাল ক্যারিয়ার গঠনে আমাদের প্রি-কম্পাইলড কম্বো প্যাকসমূহ।
                </p>
            </div>

            {/* Bundles Catalog */}
            <div className="space-y-10">
                <div className="flex items-center gap-2">
                    <Layers className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-slate-800">উপলব্ধ প্যাকেজসমূহ</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {bundles.map((bundle) => {
                        const savings = bundle.regularPrice - bundle.price;
                        return (
                            <div key={bundle.id} className="relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                                
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r ${bundle.colorTheme} text-white`}>
                                            {bundle.badge}
                                        </span>
                                        <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                                            ৳{savings} সেভ করুন
                                        </span>
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 leading-snug">
                                        {bundle.title}
                                    </h3>
                                    <p className="text-xs text-blue-600 font-bold mb-4">{bundle.tagline}</p>
                                    <p className="text-slate-500 text-xs md:text-sm font-normal leading-relaxed mb-6">
                                        {bundle.description}
                                    </p>

                                    {/* Courses included indicator */}
                                    <div className="border-t border-b border-slate-100 py-4 mb-6">
                                        <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                                            <BookOpen className="w-4 h-4 text-blue-600" /> বান্ডেলের অন্তর্ভুক্ত কোর্সসমূহ:
                                        </h4>
                                        <div className="space-y-2">
                                            {loading ? (
                                                <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
                                            ) : courses.length > 0 ? (
                                                courses.filter(c => bundle.coursesIncluded.includes(c.id)).map(course => (
                                                    <Link key={course.id} to={`/courses/${course.slug}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-150 hover:border-blue-300 hover:bg-blue-50/20 transition-all text-xs font-bold text-slate-700 group/course">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        <span className="flex-1 line-clamp-1">{course.title}</span>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/course:translate-x-0.5 transition-transform" />
                                                    </Link>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-400">বান্ডেলের রিসোর্স লোড হচ্ছে...</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features Checklist */}
                                    <div className="space-y-2.5 mb-8">
                                        {bundle.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-semibold">
                                                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing and CTA */}
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
                                    <div>
                                        <p className="text-[10px] text-slate-440 line-through">নিয়মিত মূল্য ৳{bundle.regularPrice}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-slate-900">৳{bundle.price}</span>
                                            <span className="text-[10px] text-slate-450 font-bold bg-slate-100 px-2 py-0.5 rounded">এককালীন পেমেন্ট</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleCheckout(bundle)}
                                        className="px-5 py-3 rounded-full bg-[#0074D9] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer border-none"
                                    >
                                        বান্ডেল কিনুন <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Booking / Checkout Dialog Modal */}
            {selectedBundle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-scaleIn">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-650 px-6 py-6 text-white relative">
                            <h3 className="text-lg font-extrabold">বুকিং এবং পেমেন্ট রিকোয়েস্ট</h3>
                            <p className="text-xs opacity-85 mt-1">{selectedBundle.title}</p>
                            <button 
                                onClick={() => setSelectedBundle(null)} 
                                className="absolute top-4 right-4 text-white hover:opacity-80 p-1 bg-white/10 rounded-full border-none cursor-pointer"
                            >
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {bookingSuccess ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-12 h-12 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h4 className="text-base font-bold text-slate-800">অনুরোধ সফলভাবে পাঠানো হয়েছে!</h4>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                    পেমেন্ট সম্পন্ন করার জন্য আমাদের প্রতিনিধি খুব শীঘ্রই আপনার ইমেইল অথবা মোবাইল নাম্বারে যোগাযোগ করবেন। (সাপোর্ট টিকিট চেক করুন)
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submitBooking} className="p-6 space-y-4">
                                <div className="bg-blue-50 border border-blue-150 rounded-2xl p-4 flex gap-3 text-blue-700 text-xs font-semibold">
                                    <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 animate-pulse" />
                                    <div>
                                        <p className="font-bold">বান্ডেল অফার সুবিধা</p>
                                        <p className="opacity-90 mt-0.5">আমাদের কোর্স বান্ডেলটি কিনলে আপনি আলাদা প্রতিটি কোর্সের চেয়ে সাশ্রয়ী মূল্যে ফুল লাইফটাইম অ্যাক্সেস পাবেন।</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">আপনার নাম <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="আপনার নাম লিখুন"
                                        value={bookingName}
                                        onChange={e => setBookingName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">মোবাইল নাম্বার (হোয়াটসঅ্যাপ) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="tel" 
                                        required 
                                        placeholder="01XXXXXXXXX"
                                        value={bookingPhone}
                                        onChange={e => setBookingPhone(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">বিশেষ নোট (যদি থাকে)</label>
                                    <textarea 
                                        placeholder="আপনার মেসেজ বা পেমেন্ট সংক্রান্ত তথ্য"
                                        value={bookingNotes}
                                        onChange={e => setBookingNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-800 resize-none"
                                    />
                                </div>

                                {!user && (
                                    <div className="flex gap-2 p-3 bg-amber-50 border border-amber-150 rounded-xl text-amber-800 text-[10px] font-bold">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>রিকোয়েস্ট সাবমিট করতে প্রথমে সাইন ইন করতে হবে।</span>
                                    </div>
                                )}

                                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                    <div className="text-left">
                                        <span className="text-[10px] text-slate-450 block font-bold">মোট দেয় পরিমাণ</span>
                                        <span className="text-base font-black text-slate-800">৳{selectedBundle.price}</span>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={!user}
                                        className={`px-5 py-3 rounded-xl font-bold text-xs text-white border-none cursor-pointer flex items-center gap-1 shadow transition-all ${user ? 'bg-gradient-to-r from-blue-600 to-indigo-650 hover:brightness-105 shadow-blue-500/20 active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed'}`}
                                    >
                                        রিকোয়েস্ট সাবমিট করুন <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

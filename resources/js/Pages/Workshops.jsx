import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Users, ArrowRight, Check, AlertCircle, Heart, Star, Sparkles, Send, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import { useSEO } from '../Utils/seo';

export default function Workshops() {
    useSEO({
        title: 'লাইভ ওয়ার্কশপ সমূহ',
        description: 'ইন্ডাস্ট্রি এক্সপার্টদের সাথে সরাসরি লাইভ সেশনে অংশ নিয়ে হাতে-কলমে প্র্যাক্টিক্যাল কাজ শিখুন।'
    });
    const { user } = useAuth();
    const { settings } = useSiteSettings();
    const isEnabled = settings?.features?.feature_workshops === '1' || settings?.features?.feature_workshops === 1 || settings?.features?.feature_workshops === true;
    
    if (!isEnabled) {
        return (
            <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 border border-red-150 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">মডিউলটি উপলব্ধ নয়</h2>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    ওয়ার্কশপ মডিউলটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
                </p>
                <Link to="/" className="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    হোমপেজে ফিরে যান
                </Link>
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingName, setBookingName] = useState('');
    const [bookingPhone, setBookingPhone] = useState('');
    const [bookingEmail, setBookingEmail] = useState('');
    
    // Countdown Timer state
    const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 45, seconds: 20 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                } else {
                    clearInterval(interval);
                    return prev;
                }
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const workshops = [
        {
            id: 'w1',
            title: 'AI coding - AI-পাওয়ার্ড Software Development Workshop',
            type: 'upcoming',
            tag: 'লাইভ বুটক্যাম্প',
            date: '২০ জুলাই, ২০২৬',
            time: 'রাত ০৮:০০ - ১০:৩০',
            duration: '২.৫ ঘণ্টা',
            platform: 'Zoom Live',
            instructor: 'Expert AI Developer',
            price: 500,
            regularPrice: 1500,
            seatsLeft: 12,
            topics: [
                'AI এজেন্টস ও প্রম্পট ইঞ্জিনিয়ারিং এর বেসিকস',
                'Cursor / VS Code AI এর অ্যাডভান্সড ব্যবহারের কৌশল',
                'কোড জেনারেশন, ডিবাগিং ও টেস্টিং এ AI এর ইন্টিগ্রেশন',
                'AI দিয়ে ১ ঘণ্টায় কমপ্লিট ওয়েব অ্যাপ বিল্ড করার প্রজেক্ট'
            ],
            colorTheme: 'from-orange-500 to-amber-600',
            bgLight: 'bg-orange-50/50 border-orange-100/30'
        },
        {
            id: 'w2',
            title: 'Next-Gen Fullstack React 19 & Laravel 11 Live Crash Course',
            type: 'upcoming',
            tag: 'ইনটেনসিভ মাস্টারক্লাস',
            date: '২৮ জুলাই, ২০২৬',
            time: 'রাত ০৯:০০ - ১১:৩০',
            duration: '২.৫ ঘণ্টা',
            platform: 'Google Meet',
            instructor: 'Lead Software Architect',
            price: 0, // Free
            regularPrice: 1000,
            seatsLeft: 45,
            topics: [
                'React 19 Server Actions ও নতুন হুকস',
                'Laravel 11 মিনিমালিস্ট আর্কিটেকচার ও API হ্যান্ডলিং',
                'SPA রাউটিং সিকিউরিটি ও JWT অথেনটিকেশন',
                'রিয়েল-টাইম ডেটা স্ট্রিমিং ও নোটিফিকেশন গাইড'
            ],
            colorTheme: 'from-amber-500 to-yellow-600',
            bgLight: 'bg-amber-50/50 border-amber-100/30'
        },
        {
            id: 'w3',
            title: 'Figma to Code React Component Layouts',
            type: 'recorded',
            tag: 'রেকর্ডেড ওয়ার্কশপ',
            date: '১০ জুন, ২০২৬ (রেকর্ডেড)',
            time: '৩ ঘণ্টার সম্পূর্ণ রেকর্ড',
            duration: '৩ ঘণ্টা',
            platform: 'LMS Player',
            instructor: 'Senior UI/UX & Frontend Engineer',
            price: 300,
            regularPrice: 800,
            seatsLeft: null,
            topics: [
                'ফিফমা লেআউট ও গ্রিড রুলস এনালাইসিস',
                'টেইলউইন্ড সিএসএস দিয়ে রেসপন্সিভ গ্লাস মরফিজম ডিজাইন',
                'কম্পোনেন্ট রি-ইউজেবিলিটি ও অ্যানিমেশন ইন্টিগ্রেশন',
                'রিসোর্স ফাইলস ও গিটহাব সোর্স কোড ডাউনলোড'
            ],
            colorTheme: 'from-slate-700 to-slate-905',
            bgLight: 'bg-slate-50 border-slate-100'
        }
    ];

    const handleReserve = (workshop) => {
        setSelectedWorkshop(workshop);
        setBookingSuccess(false);
        if (user) {
            setBookingName(user.name);
            setBookingEmail(user.email);
        }
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            const ticketData = {
                title: `Workshop Seat Booking: ${selectedWorkshop.title}`,
                category: 'Course / Class Access',
                message: `Hello Support,\n\nI want to register for the workshop "${selectedWorkshop.title}" scheduled for ${selectedWorkshop.date}.\n\nDetails:\nName: ${bookingName}\nEmail: ${bookingEmail}\nPhone: ${bookingPhone}\nPrice: ৳${selectedWorkshop.price}\n\nPlease send me the joining instructions.`,
                priority: 'medium'
            };

            const response = await axios.post('/api/support-tickets', ticketData);
            if (response.data.success) {
                setBookingSuccess(true);
                setTimeout(() => {
                    setSelectedWorkshop(null);
                    setBookingSuccess(false);
                }, 3500);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'বুকিং অনুরোধ সম্পন্ন করতে একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
        }
    };

    const filteredWorkshops = workshops.filter(w => w.type === activeTab);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
            {/* Header Banner */}
            <div className="text-center relative overflow-hidden py-10 md:py-16 px-4 rounded-3xl bg-orange-50/50 border border-orange-100/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-100/50 rounded-full blur-3xl -z-10" />
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
                    লাইভ ইন্টারেক্টিভ <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">ওয়ার্কশপসমূহ</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-6 md:mb-8 font-normal px-2">
                    ইন্ডাস্ট্রি বিশেষজ্ঞদের সাথে সরাসরি সেশনে যুক্ত হয়ে জটিল বিষয়গুলো শিখুন লাইভ প্রজেক্ট সল্ভিংয়ের মাধ্যমে।
                </p>
            </div>

            {/* Countdown / Urgent Notice banner */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-650 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
                
                <div className="space-y-2 text-center lg:text-left relative z-10">
                    <span className="bg-white/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">পরবর্তী লাইভ ওয়ার্কশপ</span>
                    <h3 className="text-lg md:text-xl font-bold max-w-lg">AI coding - AI-পাওয়ার্ড Software Development</h3>
                    <p className="text-xs text-orange-100 flex items-center justify-center lg:justify-start gap-1">
                        <Calendar className="w-3.5 h-3.5" /> ২০ জুলাই, ২০২৬ • <Clock className="w-3.5 h-3.5" /> রাত ০৮:০০ টা
                    </p>
                </div>

                {/* Countdown Grid */}
                <div className="flex gap-3 text-center relative z-10 font-sans">
                    {[
                        { val: timeLeft.days, label: 'Days' },
                        { val: timeLeft.hours, label: 'Hours' },
                        { val: timeLeft.minutes, label: 'Mins' },
                        { val: timeLeft.seconds, label: 'Secs' }
                    ].map((unit, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 w-16 md:w-20 shadow-sm">
                            <span className="text-lg md:text-2xl font-black block tracking-tight">{unit.val.toString().padStart(2, '0')}</span>
                            <span className="text-[9px] md:text-[10px] uppercase font-bold text-orange-100 tracking-wider block mt-0.5">{unit.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tab switchers */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'upcoming' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        আসন্ন লাইভ ওয়ার্কশপ ({workshops.filter(w => w.type === 'upcoming').length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('recorded')}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'recorded' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        রেকর্ডেড সেশন ({workshops.filter(w => w.type === 'recorded').length})
                    </button>
                </div>
            </div>

            {/* Workshops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredWorkshops.map(workshop => (
                    <div key={workshop.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
                        <div>
                            {/* Card Top */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wider uppercase text-white bg-gradient-to-r ${workshop.colorTheme}`}>
                                    {workshop.tag}
                                </span>
                                {workshop.seatsLeft !== null && (
                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                        মাত্র {workshop.seatsLeft} সিট বাকি!
                                    </span>
                                )}
                            </div>

                            <h3 className="text-base font-bold text-slate-800 mb-4 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
                                {workshop.title}
                            </h3>

                            {/* Info Table */}
                            <div className="space-y-2 border-t border-b border-slate-100 py-3 mb-4 text-xs font-semibold text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                    <span>{workshop.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    <span>{workshop.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-orange-500" />
                                    <span>মাধ্যম: <span className="text-slate-800 font-bold">{workshop.platform}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-orange-500" />
                                    <span>মেন্টর: <span className="text-slate-800 font-bold">{workshop.instructor}</span></span>
                                </div>
                            </div>

                            {/* Agenda Topics */}
                            <div className="space-y-2.5 mb-6">
                                <h4 className="text-xs font-bold text-slate-700">ওয়ার্কশপ এজেন্ডা:</h4>
                                {workshop.topics.map((topic, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-500 leading-relaxed font-semibold">
                                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card Bottom / Action */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                            <div>
                                {workshop.price > 0 ? (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-black text-slate-900">৳{workshop.price}</span>
                                        <span className="text-[10px] text-slate-400 line-through">৳{workshop.regularPrice}</span>
                                    </div>
                                ) : (
                                    <span className="text-base font-extrabold text-green-600">সম্পূর্ণ ফ্রি</span>
                                )}
                            </div>

                            <button 
                                onClick={() => handleReserve(workshop)}
                                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1 group/btn shadow transition-all duration-300 border-none cursor-pointer"
                            >
                                {workshop.price > 0 ? 'সিট বুক করুন' : 'ফ্রি জয়েন করুন'} 
                                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reservation Modal Box */}
            {selectedWorkshop && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-scaleIn">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-6 text-white relative">
                            <h3 className="text-lg font-extrabold">স্লট ও সিট বুকিং ফর্ম</h3>
                            <p className="text-xs opacity-85 mt-1">{selectedWorkshop.title}</p>
                            <button 
                                onClick={() => setSelectedWorkshop(null)} 
                                className="absolute top-4 right-4 text-white hover:opacity-80 p-1 bg-white/10 rounded-full border-none cursor-pointer"
                            >
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {bookingSuccess ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-12 h-12 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="w-6 h-6 stroke-[3]" />
                                </div>
                                <h4 className="text-base font-bold text-slate-800">বুকিং অনুরোধ সফল হয়েছে!</h4>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                    সেশন জয়েনিং লিংক এবং পেমেন্ট ভেরিফিকেশন কোড খুব শীঘ্রই আপনার মেইলে পাঠানো হবে। (আপনার ড্যাশবোর্ড সাপোর্ট টিকিট দেখুন)
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submitBooking} className="p-6 space-y-4">
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 text-orange-800 text-xs font-semibold">
                                    <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-orange-600 animate-pulse" />
                                    <div>
                                        <p className="font-bold">সরাসরি প্রশ্ন করার সুযোগ</p>
                                        <p className="opacity-90 mt-0.5">ওয়ার্কশপ চলাকালীন মেন্টরদের সাথে সরাসরি লাইভ প্রশ্ন ও উত্তর পর্বে অংশগ্রহণ করতে পারবেন।</p>
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
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-xs font-semibold text-slate-800"
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
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-xs font-semibold text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">ইমেইল ঠিকানা <span className="text-red-500">*</span></label>
                                    <input 
                                        type="email" 
                                        required 
                                        placeholder="yourname@gmail.com"
                                        value={bookingEmail}
                                        onChange={e => setBookingEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-xs font-semibold text-slate-800"
                                    />
                                </div>

                                {!user && (
                                    <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[10px] font-bold">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>ওয়ার্কশপে অংশ নিতে অনুগ্রহ করে প্রথমে সাইন ইন করুন।</span>
                                    </div>
                                )}

                                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                    <div className="text-left">
                                        <span className="text-[10px] text-slate-450 block font-bold">মোট দেয় পরিমাণ</span>
                                        <span className="text-base font-black text-slate-800">
                                            {selectedWorkshop.price > 0 ? `৳${selectedWorkshop.price}` : 'ফ্রি'}
                                        </span>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={!user}
                                        className={`px-5 py-3 rounded-xl font-bold text-xs text-white border-none cursor-pointer flex items-center gap-1 shadow transition-all ${user ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-105 shadow-orange-500/20 active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed'}`}
                                    >
                                        সিট নিশ্চিত করুন <Send className="w-4 h-4" />
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

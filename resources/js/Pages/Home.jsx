import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../Components/CourseCard';
import BlogCard from '../Components/BlogCard';
import ComingSoonModal from '../Components/ComingSoonModal';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import {
    Search, BookOpen, Clock, Tag, ArrowRight, HelpCircle, ChevronDown,
    ChevronUp, FileText, Brain, TrendingUp, Briefcase, Globe, Sparkles,
    Award, UserCheck, ShieldCheck, Headphones, Rocket, Trophy
} from 'lucide-react';

const whyLearnAiItems = [
    {
        id: '01',
        title: 'ভবিষ্যতের স্কিল',
        desc: 'AI আজকের সবচেয়ে demanding skill। এখনই শুরু করলে আপনি early adopter হিসেবে এগিয়ে থাকবেন।',
        icon: Brain
    },
    {
        id: '02',
        title: 'ক্যারিয়ার গ্রোথ',
        desc: 'AI জানা professional-দের salary ও opportunity অন্যদের তুলনায় অনেক বেশি।',
        icon: TrendingUp
    },
    {
        id: '03',
        title: 'নতুন ব্যবসার সুযোগ',
        desc: 'AI দিয়ে কম খরচে ও দ্রুত নিজের startup, agency বা freelancing business দাঁড় করানো যায়।',
        icon: Briefcase
    },
    {
        id: '04',
        title: '১০x দ্রুত কাজ',
        desc: 'যে কাজ আগে দিনে হতো, AI দিয়ে তা ঘণ্টায় শেষ — productivity বহুণুণ বাড়ান।',
        icon: Clock
    },
    {
        id: '05',
        title: 'গ্লোবাল মার্কেটে এন্ট্রি',
        desc: 'AI tools দিয়ে international client ও marketplace-এ সহজে কাজ করার সুযোগ পাবেন।',
        icon: Globe
    },
    {
        id: '06',
        title: 'সৃজনশীলতা বৃদ্ধি',
        desc: 'AI আপনার creativity-কে boost দেয় — content, design, code সব কিছুতে নতুন মাত্রা যোগ করে।',
        icon: Sparkles
    }
];

const whyChooseUsItems = [
    {
        id: '01',
        title: 'ইন্ডাস্ট্রি-গ্রেড কন্টেন্ট',
        desc: 'প্রতিটি কোর্স ডিজাইন করা হয়েছে রিয়েল ইন্ডাস্ট্রির স্ট্যান্ডার্ড অনুযায়ী, যাতে আপনি practical skill অর্জন করতে পারেন।',
        icon: Award
    },
    {
        id: '02',
        title: 'এক্সপার্ট ইন্সট্রাক্টর',
        desc: 'অভিজ্ঞ professional-দের কাছ থেকে সরাসরি শিখুন, যারা নিজেরা ফিল্ডে কাজ করছেন।',
        icon: UserCheck
    },
    {
        id: '03',
        title: 'লাইফটাইম অ্যাক্সেস',
        desc: 'একবার কিনলে সারাজীবনের জন্য আপনার, future update সহ সম্পূর্ণ কন্টেন্ট পাবেন।',
        icon: ShieldCheck
    },
    {
        id: '04',
        title: '২৪/৭ সাপোর্ট',
        desc: 'WhatsApp ও community group এর মাধ্যমে দ্রুত সাপোর্ট ও মেন্টরিং সুবিধা।',
        icon: Headphones
    },
    {
        id: '05',
        title: 'প্রজেক্ট-বেইজড লার্নিং',
        desc: 'শুধু theory না, প্রতিটি কোর্সে real project তৈরি করে hands-on experience নিতে পারবেন।',
        icon: Rocket
    },
    {
        id: '06',
        title: 'ভেরিফাইড সার্টিফিকেট',
        desc: 'কোর্স শেষে পাবেন verifiable certificate, যা LinkedIn ও CV-তে শেয়ার করা যাবে।',
        icon: Trophy
    }
];

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [comingSoonCourse, setComingSoonCourse] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const [loading, setLoading] = useState(true);

    const { settings } = useSiteSettings();

    // FAQs are already available from the preloaded site settings,
    // so no separate /api/settings request is needed here.
    const faqs = useMemo(() => {
        try {
            const raw = settings?.general?.faqs;
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Error parsing FAQs:', e);
            return [];
        }
    }, [settings]);

    // Dynamic Blogs state
    const [blogs, setBlogs] = useState([]);
    const [loadingBlogs, setLoadingBlogs] = useState(true);
    const [expandedFaq, setExpandedFaq] = useState(null);

    const fetchCourses = async (query = '') => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/courses?search=${query}`);
            if (response.data.success) {
                setCourses(response.data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlogs = async () => {
        setLoadingBlogs(true);
        try {
            const blogsRes = await axios.get('/api/blogs');
            if (blogsRes.data.success) {
                setBlogs(blogsRes.data.posts);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoadingBlogs(false);
        }
    };

    useEffect(() => {
        fetchCourses(search);
    }, [search]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 md:space-y-20">
            {/* Hero Section */}
            <div className="text-center relative overflow-hidden py-10 md:py-16 px-4 rounded-3xl bg-purple-50/50 border border-purple-100/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-100/60 rounded-full blur-3xl -z-10" />
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
                    Upgrade Your Skills with <span className="bg-gradient-to-r from-purple-600 to-pink-650 bg-clip-text text-transparent">VibeThink</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-6 md:mb-8 font-normal px-2">
                    Learn from industry experts and get hands-on experience with modern tech stacks. Discover premium courses tailored for you.
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm bg-white border border-slate-200 focus:outline-none focus:border-purple-650 focus:ring-2 focus:ring-purple-600/10 text-slate-800 shadow-sm transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
            </div>

            {/* Catalog Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-purple-600" /> Our Courses
                        </h2>
                        <p className="text-xs text-slate-450 mt-1 font-semibold">Explore all published training courses</p>
                    </div>
                    <span className="text-xs bg-purple-50 border border-purple-100 text-purple-650 px-4 py-1.5 rounded-full font-bold shadow-sm">
                        {courses.length} Courses Available
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white border border-slate-100 shadow-sm h-80 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} onComingSoonClick={setComingSoonCourse} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
                        <BookOpen className="h-10 w-10 text-slate-350 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-800">No Courses Found</h3>
                        <p className="text-xs text-slate-400 mt-1">Try search with a different keyword</p>
                    </div>
                )}
            </div>

            {/* Why Learn AI Section */}
            <div className="space-y-8 relative overflow-hidden py-4">
                <div className="relative">
                    {/* Huge outline watermark "06" */}
                    <div
                        className="absolute -top-10 left-0 md:left-4 text-[100px] md:text-[145px] font-black text-transparent select-none pointer-events-none opacity-20"
                        style={{ WebkitTextStroke: '2px #cbd5e1', color: 'transparent' }}
                    >
                        06
                    </div>
                    <h2 className="relative text-2xl md:text-4xl font-extrabold text-slate-800 leading-tight pt-6 flex items-center">
                        কেন আপনার <span className="text-[#FF5A00] theme-primary-text mx-2">AI</span> শেখা দরকার
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {whyLearnAiItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#FF5A00]/30 theme-primary-border-hover group"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="text-[#FF5A00] theme-primary-text transition-all duration-300 group-hover:scale-110">
                                            <Icon className="w-8 h-8 stroke-[1.5]" />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-400 font-mono">
                                            {item.id}
                                        </span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-normal">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="space-y-8 relative overflow-hidden py-4">
                <div className="relative">
                    {/* Huge outline watermark "04" */}
                    <div
                        className="absolute -top-10 left-0 md:left-4 text-[100px] md:text-[145px] font-black text-transparent select-none pointer-events-none opacity-20"
                        style={{ WebkitTextStroke: '2px #cbd5e1', color: 'transparent' }}
                    >
                        04
                    </div>
                    <h2 className="relative text-2xl md:text-4xl font-extrabold text-slate-800 leading-tight pt-6 flex items-center">
                        কেন আমরা <span className="text-[#FF5A00] theme-primary-text mx-2">অন্যদের</span> থেকে আলাদা
                    </h2>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        {whyChooseUsItems.map((item, index) => {
                            const Icon = item.icon;
                            // Construct responsive internal border lines
                            const borderClasses = `
                                border-slate-200/80
                                ${index < 5 ? 'border-b' : 'border-b-0'}
                                border-r-0
                                ${index % 3 !== 2 ? 'md:border-r' : 'md:border-r-0'}
                                ${index >= 3 ? 'md:border-b-0' : 'md:border-b'}
                            `.trim().replace(/\s+/g, ' ');

                            return (
                                <div
                                    key={item.id}
                                    className={`${borderClasses} p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:bg-slate-50/40 group`}
                                >
                                    <div className="space-y-4">
                                        <div className="text-[#FF5A00] theme-primary-text transition-all duration-300 group-hover:scale-110">
                                            <Icon className="w-8 h-8 stroke-[1.5]" />
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-normal">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Blog Section */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-pink-555" style={{ color: '#ec4899' }} /> রিসেন্ট ব্লগ ও আর্টিকেলস
                    </h2>
                    <p className="text-xs text-slate-450 mt-1 font-semibold">আপনার জ্ঞান বৃদ্ধিতে আমাদের রিসেন্ট পাবলিশ হওয়া আর্টিকেলসমূহ পড়ুন।</p>
                </div>

                {loadingBlogs ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white border border-slate-100 shadow-sm h-80 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {blogs.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : null}
            </div>

            {/* FAQ Section */}
            {faqs.length > 0 && (
                <div className="space-y-8">
                    <div className="text-center max-w-xl mx-auto space-y-1">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
                            <HelpCircle className="h-6 w-6 text-indigo-500" /> সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
                        </h2>
                        <p className="text-xs text-slate-450 font-semibold">কোর্স ও প্ল্যাটফর্ম সম্পর্কে শিক্ষার্থীদের সাধারণ প্রশ্নগুলোর উত্তর নিচে দেখুন।</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-3">
                        {faqs.map((faq, index) => {
                            const isOpen = expandedFaq === index;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                                        className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-700 hover:text-indigo-600 text-xs transition-colors cursor-pointer border-none bg-transparent"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-bold shrink-0">
                                                {index + 1}
                                            </span>
                                            {faq.q}
                                        </span>
                                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-4 pt-1.5 text-[11.5px] text-slate-500 font-semibold leading-relaxed border-t border-slate-50 pl-13">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <ComingSoonModal
                isOpen={comingSoonCourse !== null}
                course={comingSoonCourse}
                onClose={() => setComingSoonCourse(null)}
            />
        </div>
    );
}

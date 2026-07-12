import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../Components/CourseCard';
import BlogCard from '../Components/BlogCard';
import {
    Search, BookOpen, Clock, Tag, ArrowRight, HelpCircle, ChevronDown,
    ChevronUp, FileText
} from 'lucide-react';

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const [loading, setLoading] = useState(true);

    // Dynamic FAQs and Blogs states
    const [faqs, setFaqs] = useState([]);
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

    const fetchFaqsAndBlogs = async () => {
        setLoadingBlogs(true);
        try {
            // Fetch FAQs from public settings
            const settingsRes = await axios.get('/api/settings');
            if (settingsRes.data.success && settingsRes.data.settings?.general?.faqs) {
                try {
                    const parsedFaqs = JSON.parse(settingsRes.data.settings.general.faqs);
                    if (Array.isArray(parsedFaqs)) {
                        setFaqs(parsedFaqs);
                    }
                } catch (e) {
                    console.error('Error parsing FAQs:', e);
                }
            }

            // Fetch latest blog posts
            const blogsRes = await axios.get('/api/blogs');
            if (blogsRes.data.success) {
                setBlogs(blogsRes.data.posts);
            }
        } catch (error) {
            console.error('Error fetching FAQs and Blogs:', error);
        } finally {
            setLoadingBlogs(false);
        }
    };

    useEffect(() => {
        fetchCourses(search);
    }, [search]);

    useEffect(() => {
        fetchFaqsAndBlogs();
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
                            <CourseCard key={course.id} course={course} />
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

            {/* Blog Section */}
            {blogs.length > 0 && (
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <FileText className="h-6 w-6 text-pink-555" style={{ color: '#ec4899' }} /> রিসেন্ট ব্লগ ও আর্টিকেলস
                        </h2>
                        <p className="text-xs text-slate-450 mt-1 font-semibold">আপনার জ্ঞান বৃদ্ধিতে আমাদের রিসেন্ট পাবলিশ হওয়া আর্টিকেলসমূহ পড়ুন।</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {blogs.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            )}

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
        </div>
    );
}

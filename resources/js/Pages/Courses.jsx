import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, BookOpen, ArrowRight, Eye, ShoppingCart, Clock } from 'lucide-react';
import ComingSoonModal from '../Components/ComingSoonModal';
import { useAuth } from '../Contexts/AuthContext';
import { trackPixelEvent } from '../Utils/metaPixel';
import { useSEO } from '../Utils/seo';

export default function Courses() {
    useSEO({
        title: 'সকল কোর্সসমূহ',
        description: 'আমাদের প্রিমিয়াম ও ফ্রি কোর্সসমূহ দেখে আপনার প্রয়োজনীয় স্কিল ডেভেলপ করুন।'
    });
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const [loading, setLoading] = useState(true);
    const [comingSoonCourse, setComingSoonCourse] = useState(null);
    const [enrollingId, setEnrollingId] = useState(null);

    const handleEnroll = async (course) => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        setEnrollingId(course.id);
        try {
            const price = parseFloat(course.discount_price > 0 ? course.discount_price : course.price) || 0;

            if (price > 0) {
                trackPixelEvent('InitiateCheckout', {
                    content_name: course.title,
                    content_ids: [course.id],
                    content_type: 'product',
                    value: price,
                    currency: 'BDT'
                });

                const response = await axios.post(`/api/payment/zinipay/init/${course.id}`);
                if (response.data.success && response.data.payment_url) {
                    window.location.href = response.data.payment_url;
                } else {
                    alert(response.data.message || 'পেমেন্ট চেকআউট চালু করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
                    setEnrollingId(null);
                }
            } else {
                const response = await axios.post(`/api/courses/${course.id}/enroll`);
                if (response.data.success) {
                    navigate(`/courses/${course.slug}/learn`);
                }
            }
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already enrolled')) {
                navigate(`/courses/${course.slug}/learn`);
            } else {
                alert(error.response?.data?.message || 'ইনরোলমেন্ট ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
        } finally {
            setEnrollingId(null);
        }
    };

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

    useEffect(() => {
        fetchCourses(search);
    }, [search]);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
            {/* Header Banner */}
            <div className="relative rounded-3xl p-[2px] overflow-hidden snake-border-container shadow-sm border border-slate-100/50">
                {/* Rotating Snake Border */}
                <div className="snake-border-glow" />

                {/* Inner Content Area */}
                <div 
                    className="snake-border-content text-center py-10 md:py-16 px-4 rounded-[22px] relative overflow-hidden"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 7%, #ffffff)' }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 theme-primary-bg rounded-full blur-3xl -z-10 opacity-10" />
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight animate-slide-up-fade">
                        আমাদের সকল <span className="animate-gradient-text font-black">কোর্সসমূহ</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-650 max-w-2xl mx-auto mb-6 md:mb-8 font-semibold px-2 animate-slide-up-fade animation-delay-100">
                        দক্ষতা বৃদ্ধিতে আপনার প্রয়োজনীয় কোর্সটি খুঁজে নিন এবং আজই শেখা শুরু করুন।
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative animate-slide-up-fade animation-delay-200">
                        <input
                            type="text"
                            placeholder="কোর্স খুঁজুন..."
                            value={search}
                            onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm bg-white border border-slate-200 focus:outline-none focus:theme-primary-border focus:ring-2 focus:ring-[var(--primary-color)]/10 text-slate-800 shadow-sm transition-all"
                            style={{ focusBorderColor: 'var(--primary-color)' }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Grid Catalog */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="h-5.5 w-5.5 text-purple-650" /> সকল কোর্স
                        </h2>
                    </div>
                    <span className="text-xs bg-purple-50 border border-purple-100 text-purple-650 px-4 py-1.5 rounded-full font-bold shadow-sm">
                        {courses.length} টি কোর্স পাওয়া গেছে
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
                            <div key={course.id} className="bg-white border border-slate-200/80 flex flex-col rounded-2xl p-5 transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5 relative">
                                {/* Thumbnail */}
                                <div 
                                    onClick={(e) => {
                                        if (course.section_titles?.coming_soon) {
                                            e.preventDefault();
                                            setComingSoonCourse(course);
                                        }
                                    }}
                                    className={`relative aspect-[16/10] w-full bg-slate-50 overflow-hidden rounded-xl mb-4 border border-slate-100 shrink-0 ${course.section_titles?.coming_soon ? 'cursor-pointer' : ''}`}
                                >
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                                            <BookOpen className="h-8 w-8 text-purple-400" />
                                        </div>
                                    )}

                                    {/* Coming Soon Badge Overlay */}
                                    {course.section_titles?.coming_soon && (
                                        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-start p-3">
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-[10px] font-black tracking-wide shadow-md animate-pulse">
                                                <Clock className="w-3 h-3" /> শীঘ্রই আসছে
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-grow">
                                    <h3 
                                        onClick={() => course.section_titles?.coming_soon && setComingSoonCourse(course)}
                                        className={`text-base sm:text-lg font-bold text-slate-800 mb-2 line-clamp-1 theme-primary-text-hover transition-colors ${course.section_titles?.coming_soon ? 'cursor-pointer' : ''}`}
                                    >
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 font-normal leading-relaxed">
                                        {course.short_description || 'No description available for this course.'}
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2 mb-5">
                                        {course.section_titles?.coming_soon ? (
                                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                                মূল্য নির্ধারণ করা হয়নি
                                            </span>
                                        ) : parseFloat(course.discount_price) > 0 ? (
                                            <>
                                                <span className="text-lg font-black theme-primary-text text-[#FF5A00]">
                                                    ৳{Math.round(course.discount_price)}
                                                </span>
                                                <span className="text-sm text-slate-400 line-through font-semibold">
                                                    ৳{Math.round(course.price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-black theme-primary-text text-[#FF5A00]">
                                                {parseFloat(course.price) === 0 ? 'ফ্রি' : `৳${Math.round(course.price)}`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {course.section_titles?.coming_soon ? (
                                        <div className="flex items-center gap-2 mt-auto pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setComingSoonCourse(course)}
                                                className="w-full py-3 px-4 bg-orange-50 hover:bg-orange-100/80 text-orange-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-orange-100/50 cursor-pointer shadow-sm shadow-orange-500/5"
                                            >
                                                <Clock className="w-4 h-4 animate-pulse" /> বিস্তারিত জানতে ক্লিক করুন
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-auto pt-2">
                                            <button
                                                onClick={() => handleEnroll(course)}
                                                disabled={enrollingId === course.id}
                                                className="flex-1 py-3 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-100 disabled:opacity-60 cursor-pointer"
                                            >
                                                {enrollingId === course.id ? 'Enrolling...' : 'Enroll Now'} <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                            <Link
                                                to={`/courses/${course.slug}`}
                                                className="flex-1 py-3 px-2 theme-primary-bg hover:brightness-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                View Details <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
                        <BookOpen className="h-10 w-10 text-slate-350 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-800">কোনো কোর্স পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-450 mt-1">অন্য কোনো কিওয়ার্ড দিয়ে আবার চেষ্টা করুন</p>
                    </div>
                )}
            </div>

            <ComingSoonModal
                isOpen={comingSoonCourse !== null}
                course={comingSoonCourse}
                onClose={() => setComingSoonCourse(null)}
            />
        </div>
    );
}

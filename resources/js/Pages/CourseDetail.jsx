import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import { Play, BookOpen, CheckCircle, ChevronRight, Award, HelpCircle, Clock, ChevronDown, User, Star, MessageSquare, Globe } from 'lucide-react';
import { trackPixelEvent } from '../Utils/metaPixel';
import { parseMarkdownToHtml } from '../Utils/markdown';
import { getSectionTitle } from '../Utils/courseSections';

export default function CourseDetail() {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [openChapters, setOpenChapters] = useState({});
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [distribution, setDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [expandedFaq, setExpandedFaq] = useState(null);

    const toBengaliNum = (num) => {
        const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(num).replace(/\d/g, d => bn[d]);
    };

    const toggleChapter = (id) => {
        setOpenChapters(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderText = (item) => {
        if (typeof item === 'object' && item !== null) {
            return item.text || item.title || Object.values(item).join(' ');
        }
        return item;
    };

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/courses/${slug}`);
            if (response.data.success) {
                setCourse(response.data.course);
                setIsEnrolled(response.data.is_enrolled);
                setCompletedLessons(response.data.completed_lessons || []);
            }
        } catch (error) {
            console.error('Error fetching course detail', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        if (!course) return;
        try {
            const { data } = await axios.get(`/api/courses/${course.slug}/reviews`);
            if (data.success) {
                setReviews(data.reviews);
                setAvgRating(data.avg_rating);
                setTotalReviews(data.total_reviews);
                setDistribution(data.distribution);
            }
        } catch (error) {
            console.error('Error fetching reviews', error);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [slug]);

    useEffect(() => {
        if (course) {
            trackPixelEvent('ViewContent', {
                content_name: course.title,
                content_ids: [course.id],
                content_type: 'product',
                value: parseFloat(course.discount_price > 0 ? course.discount_price : course.price) || 0,
                currency: 'BDT'
            });
            fetchReviews();
        }
    }, [course]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        setEnrolling(true);
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
                    setEnrolling(false);
                }
            } else {
                const response = await axios.post(`/api/courses/${course.id}/enroll`);
                if (response.data.success) {
                    setIsEnrolled(true);
                    navigate(`/courses/${course.slug}/learn`);
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || 'ইনরোলমেন্ট ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 mt-4 text-sm">Loading course details...</span>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
                <Link to="/" className="text-purple-605 hover:text-purple-800 mt-4 inline-block font-semibold">Back to Courses</Link>
            </div>
        );
    }

    const totalDurationMinutes = course?.chapters?.reduce((acc, ch) =>
        acc + (ch.lessons?.reduce((a, l) => a + (l.duration || 0), 0) || 0), 0
    ) || 0;
    const durationHours = Math.floor(totalDurationMinutes / 60);
    const durationMinutes = totalDurationMinutes % 60;
    const totalLessons = course?.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0;

    const originalPrice = parseFloat(course.price) || 0;
    const currentPrice = parseFloat(course.discount_price || course.price) || 0;
    const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

    return (
        <div className="w-full">
            {/* Header Section */}
            <div
                className="relative border-b border-slate-100 overflow-hidden py-8 md:py-10 select-none"
                style={{
                    backgroundImage: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(139, 92, 246, 0.06) 35%, #ffffff 75%)'
                }}
            >

                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className="lg:col-span-2 space-y-3.5">
                            {/* Tagline */}
                            <div className="text-[11px] md:text-xs font-extrabold tracking-[0.25em] theme-primary-text text-[#FF5A00] uppercase">
                                / {course.category?.name ? course.category.name : 'ONLINE COURSE'}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                                {course.title}
                            </h1>

                            {/* Description */}
                            {course.short_description && (
                                <div
                                    className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-3xl"
                                    dangerouslySetInnerHTML={{ __html: course.short_description }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* What you'll learn */}
                        {course.what_youll_learn && Array.isArray(course.what_youll_learn) && course.what_youll_learn.length > 0 && (
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">{getSectionTitle(course.section_titles, 'what_youll_learn')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.what_youll_learn.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:theme-primary-border-light p-4 rounded-xl transition-all flex items-start gap-3.5 group shadow-sm hover:shadow-md"
                                        >
                                            <div className="w-8 h-8 rounded-xl theme-primary-bg-light flex items-center justify-center shrink-0 transition-colors">
                                                <CheckCircle className="h-4.5 w-4.5 theme-primary-text" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base sm:text-lg text-slate-800 font-bold leading-snug">
                                                    {renderText(item)}
                                                </span>
                                                {typeof item === 'object' && item !== null && item.sub_text && (
                                                    <span className="text-sm text-slate-500 mt-1">
                                                        {item.sub_text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{getSectionTitle(course.section_titles, 'description')}</h2>
                        <div className="bg-white border border-slate-200/80 shadow-sm p-5 sm:p-8 rounded-xl sm:rounded-2xl">
                            {course.description && (
                                <div
                                    className="text-slate-600 text-lg font-normal leading-relaxed markdown-body"
                                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(course.description) }}
                                />
                            )}
                        </div>

                    </div>

                    {/* Right Column - Sticky Info Card (Screenshot Layout) */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24 self-start space-y-4 lg:-mt-68 relative z-30">
                        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-slate-100">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                                        <BookOpen className="h-12 w-12 text-white/60" />
                                    </div>
                                )}
                                {course.thumbnail && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                )}
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Duration */}
                                {totalDurationMinutes > 0 && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <span className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase">Course Duration</span>
                                        </div>
                                        <div className="flex gap-2 ml-auto">
                                            <div className="border border-slate-200 rounded-lg px-3 py-1.5 text-center min-w-[3rem]">
                                                <div className="text-base font-black text-slate-900">{durationHours}</div>
                                                <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Hours</div>
                                            </div>
                                            <div className="border border-slate-200 rounded-lg px-3 py-1.5 text-center min-w-[3rem]">
                                                <div className="text-base font-black text-slate-900">{durationMinutes}</div>
                                                <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Min</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-3xl font-extrabold text-slate-900">৳{currentPrice.toLocaleString()}</span>
                                    {discountPercent > 0 && (
                                        <>
                                            <span className="text-sm text-slate-400 line-through">৳{originalPrice.toLocaleString()}</span>
                                            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                                                {discountPercent}% ছাড়
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Learners */}
                                <div className="flex items-center gap-2.5">
                                    <div className="flex -space-x-2">
                                        <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-700">A</div>
                                        <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700">B</div>
                                        <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-amber-700">C</div>
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">{course.enrollments_count || 0} Learners Joined</span>
                                </div>

                                {/* CTA Buttons */}
                                <div className="space-y-2.5 pt-1">
                                    {isEnrolled ? (
                                        <Link
                                            to={`/courses/${course.slug}/learn`}
                                            className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all border-none"
                                        >
                                            <Play className="h-4 w-4 fill-white" /> Resume Learning
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="w-full py-3 rounded-xl font-bold theme-primary-bg hover:brightness-95 text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer border-none"
                                        >
                                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                        </button>
                                    )}
                                </div>

                                {/* This Course Includes (কোর্সের সাথে যা যা থাকছে) */}
                                {course.this_course_includes && Array.isArray(course.this_course_includes) && course.this_course_includes.length > 0 && (
                                    <div className="border-t border-slate-100 pt-4 space-y-3">
                                        <h4 className="text-base font-bold text-slate-900">{getSectionTitle(course.section_titles, 'this_course_includes')}:</h4>
                                        <ul className="space-y-2">
                                            {course.this_course_includes.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-600 font-medium">
                                                    <CheckCircle className="h-4 w-4 theme-primary-text shrink-0 mt-0.5" />
                                                    <span>{renderText(item)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Requirements (কিছু প্রয়োজনীয়) */}
                                {course.requirements && Array.isArray(course.requirements) && course.requirements.length > 0 && (
                                    <div className="border-t border-slate-100 pt-4 space-y-3">
                                        <h4 className="text-sm font-bold text-slate-900">{getSectionTitle(course.section_titles, 'requirements')}:</h4>
                                        <ul className="space-y-2">
                                            {course.requirements.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-600 font-medium">
                                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                                    <span>{renderText(item)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Specs Cards (Language & Lessons) */}
                                <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3">
                                    <div className="theme-primary-bg-light border theme-primary-border-light rounded-xl p-3 text-center">
                                        <div className="w-8 h-8 mx-auto mb-1.5 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <Globe className="h-4 w-4 theme-primary-text" />
                                        </div>
                                        <div className="text-[9px] font-extrabold theme-primary-text uppercase tracking-wider mb-0.5">ভাষা</div>
                                        <div className="text-sm font-bold text-slate-900">{course.language || 'Bengali'}</div>
                                    </div>
                                    <div className="theme-primary-bg-light border theme-primary-border-light rounded-xl p-3 text-center">
                                        <div className="w-8 h-8 mx-auto mb-1.5 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <BookOpen className="h-4 w-4 theme-primary-text" />
                                        </div>
                                        <div className="text-[9px] font-extrabold theme-primary-text uppercase tracking-wider mb-0.5">লেসন</div>
                                        <div className="text-sm font-bold text-slate-900">{toBengaliNum(course.chapters?.reduce((a, c) => a + (c.lessons?.length || 0), 0) || 0)}টি লেসন</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Audience (কাদের জন্য এই কোর্স) - full width */}
                {course.audience && Array.isArray(course.audience) && course.audience.length > 0 && (
                    <div className="mt-12 lg:mt-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">{getSectionTitle(course.section_titles, 'audience')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {course.audience.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:theme-primary-border-light p-4 rounded-xl transition-all flex items-start gap-3.5 group shadow-sm hover:shadow-md"
                                >
                                    <div className="w-8 h-8 rounded-xl theme-primary-bg-light flex items-center justify-center shrink-0 transition-colors">
                                        <CheckCircle className="h-4.5 w-4.5 theme-primary-text" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base sm:text-lg text-slate-800 font-bold leading-snug">
                                            {renderText(item)}
                                        </span>
                                        {typeof item === 'object' && item !== null && item.sub_text && (
                                            <span className="text-sm text-slate-500 mt-1">
                                                {item.sub_text}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Syllabus / Curriculum */}
                <div className="mt-12 lg:mt-16">
                    {/* Header with watermark */}
                    <div className="relative mb-8">
                        <span className="absolute -top-6 -left-1 text-[100px] sm:text-[120px] font-black text-slate-100 leading-none select-none pointer-events-none">
                            {toBengaliNum(course.chapters?.length || 0)}
                        </span>
                        <h2 className="relative text-3xl sm:text-4xl font-black text-slate-900">
                            {getSectionTitle(course.section_titles, 'curriculum')}
                        </h2>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm font-bold text-slate-600">
                        <span>{toBengaliNum(course.chapters?.length || 0)} টি মডিউল</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{toBengaliNum(totalLessons)} টি লেসন</span>
                        {totalDurationMinutes > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{toBengaliNum(durationHours)} ঘন্টা {toBengaliNum(durationMinutes)} মিনিট</span>
                            </>
                        )}
                    </div>

                    {/* Chapter list */}
                    <div className="space-y-3">
                        {course.chapters && course.chapters.length > 0 ? (
                            course.chapters.map((chapter, index) => {
                                const isOpen = !!openChapters[chapter.id];
                                return (
                                    <div key={chapter.id} className="bg-white border border-slate-200/60 rounded-xl p-5">
                                        <button
                                            onClick={() => toggleChapter(chapter.id)}
                                            className="w-full flex items-center justify-between text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-4xl sm:text-5xl font-black theme-primary-text opacity-25 leading-none">
                                                    {toBengaliNum(index + 1)}
                                                </span>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-base">
                                                        {chapter.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                        {toBengaliNum(chapter.lessons?.length || 0)}টি লেসন
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronDown className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isOpen && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-0">
                                                {chapter.lessons && chapter.lessons.length > 0 ? (
                                                    chapter.lessons.map((lesson) => (
                                                        <div key={lesson.id} className="flex items-center justify-between py-3 hover:bg-slate-50/50 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <Play className="h-3.5 w-3.5 text-slate-400" />
                                                                <span className="text-sm text-slate-600 font-normal">{lesson.title}</span>
                                                            </div>
                                                            {lesson.is_preview && (
                                                                <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                                                                    Preview
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-slate-400 italic py-2">No lessons in this chapter</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 bg-white border border-slate-100 rounded-xl italic text-slate-400 text-sm shadow-sm">
                                No chapters defined yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Problem & Solution */}
                <div className="mt-12 lg:mt-16">
                    {(course.problems && Array.isArray(course.problems) && course.problems.length > 0) || (course.solutions && Array.isArray(course.solutions) && course.solutions.length > 0) ? (
                        <div>
                            {/* Header (outside) */}
                            <div className="mb-6">
                                <span className="text-[10px] font-extrabold tracking-[0.25em] text-slate-400 uppercase mb-2 block">
                                    Problem & Solution
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                                    {getSectionTitle(course.section_titles, 'problem_solution')}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6">
                                {/* Problems column */}
                                {course.problems && Array.isArray(course.problems) && course.problems.length > 0 && (
                                    <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                            <span className="text-[10px] font-extrabold tracking-[0.2em] text-rose-500 uppercase">/ Problem</span>
                                            <h3 className="text-base font-bold text-slate-800">আপনার বর্তমান সমস্যা</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {course.problems.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                                                    <span>{renderText(item)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Solutions column */}
                                {course.solutions && Array.isArray(course.solutions) && course.solutions.length > 0 && (
                                    <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                            <span className="text-[10px] font-extrabold tracking-[0.2em] theme-primary-text uppercase">/ Solution</span>
                                            <h3 className="text-base font-bold text-slate-800">আপনার জন্য আমাদের সমাধান</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {course.solutions.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                                                    <CheckCircle className="h-4 w-4 theme-primary-text shrink-0 mt-0.5" />
                                                    <span>{renderText(item)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Instructor */}
                {course.user && (
                    <div className="mt-12 lg:mt-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">{getSectionTitle(course.section_titles, 'instructor')}</h2>
                        <div className="bg-white border border-slate-200/80 shadow-sm p-5 sm:p-8 rounded-xl sm:rounded-2xl">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                    {course.user.avatar ? (
                                        <img
                                            src={course.user.avatar.startsWith('http') ? course.user.avatar : `/storage/${course.user.avatar}`}
                                            alt={course.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                                            <User className="h-8 w-8 text-white/70" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{course.user.name || 'বিশেষজ্ঞ'}</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-0.5">ইনস্ট্রাক্টর</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews */}
                <div className="bg-white border border-slate-200/80 shadow-sm p-5 sm:p-8 rounded-xl sm:rounded-2xl mt-12 lg:mt-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">{getSectionTitle(course.section_titles, 'reviews')}</h2>

                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8">
                        <div className="flex flex-col items-center sm:items-start">
                            <div className="text-5xl font-black text-slate-900">{avgRating.toFixed(1)}</div>
                            <div className="flex items-center gap-0.5 mt-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className={`h-5 w-5 ${star <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                ))}
                            </div>
                            <div className="text-sm text-slate-400 font-medium mt-1">({totalReviews})</div>
                        </div>

                        <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map(star => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-slate-600 w-3">{star}</span>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-800 rounded-full"
                                            style={{ width: totalReviews > 0 ? `${(distribution[star] / totalReviews) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-400 font-medium w-8 text-right">({distribution[star]})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900">All Review</h3>
                        <select className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer outline-none">
                            <option>Most Recent</option>
                        </select>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <MessageSquare className="h-12 w-12 text-slate-200 mb-3" />
                            <p className="text-slate-400 text-sm font-medium">No reviews yet. Be the first to share your experience!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <div key={review.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 shrink-0 overflow-hidden border border-slate-100">
                                        {review.user?.avatar ? (
                                            <img src={review.user.avatar.startsWith('http') ? review.user.avatar : `/storage/${review.user.avatar}`} alt={review.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xs font-bold">
                                                {review.user?.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-bold text-slate-900">{review.user?.name || 'Anonymous'}</h4>
                                            <span className="text-xs text-slate-400 font-medium">{review.created_at}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 mb-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{review.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Frequently Asked Questions */}
                {course.faq && Array.isArray(course.faq) && course.faq.length > 0 && (
                    <div className="mt-12 lg:mt-16">
                        <div className="mb-6 text-center">
                            <span className="text-[10px] font-extrabold tracking-[0.25em] text-slate-400 uppercase mb-2 block">
                                FAQ
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                                {getSectionTitle(course.section_titles, 'faq')}
                            </h2>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-3">
                            {course.faq.map((faq, index) => {
                                const isOpen = expandedFaq === index;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden transition-all duration-200"
                                    >
                                        <button
                                            onClick={() => setExpandedFaq(isOpen ? null : index)}
                                            className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-700 hover:theme-primary-text text-base transition-colors cursor-pointer border-none bg-transparent"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full theme-primary-bg-light theme-primary-text flex items-center justify-center text-[10px] font-bold shrink-0">
                                                    {index + 1}
                                                </span>
                                                {faq.question}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isOpen && (
                                            <div className="px-5 pb-4 pt-1.5 text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-100 pl-14">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

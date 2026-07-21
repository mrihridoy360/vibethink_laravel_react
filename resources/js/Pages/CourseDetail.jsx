import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import { Play, BookOpen, CheckCircle, ChevronRight, ChevronLeft, Star, Award, HelpCircle, Clock, ChevronDown, User, Globe, Shield, ShieldCheck, BadgeCheck, Zap, Lock, Sparkles, Smartphone, Brain, Code, Briefcase, Headphones, ArrowRight, Facebook, Phone, MapPin, MessageSquare, Twitter, Instagram, Linkedin } from 'lucide-react';
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
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showStickyRibbon, setShowStickyRibbon] = useState(true);
    const ribbonRef = useRef(null);

    const { settings } = useSiteSettings();
    const footer = settings?.footer || {};
    const hotline = footer.contact_phone || '+880 01933-554982';
    const address = footer.contact_address || '১ম তলা, এ-১, ডমিন্যান্ট বিল্ডিংস, হাউজ ৩০/৩২, রোড ৫, সেক্টর ১, ব্লক ই, আফতাবনগর, ঢাকা';

    const cleanPhone = hotline.replace(/[^\d]/g, '');
    const whatsappNumber = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const whatsappLink = `https://wa.me/${whatsappNumber}`;

    const socialLinks = [];
    if (footer.social_facebook) socialLinks.push({ name: 'Facebook', href: footer.social_facebook, icon: Facebook });
    if (footer.social_twitter) socialLinks.push({ name: 'Twitter', href: footer.social_twitter, icon: Twitter });
    if (footer.social_instagram) socialLinks.push({ name: 'Instagram', href: footer.social_instagram, icon: Instagram });
    if (footer.social_linkedin) socialLinks.push({ name: 'LinkedIn', href: footer.social_linkedin, icon: Linkedin });

    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!course?.section_titles?.countdown_enabled) return;

        const durationHours = parseFloat(course.section_titles?.countdown_hours) || 24;
        const durationMs = durationHours * 60 * 60 * 1000;
        const storageKey = `course_countdown_target_${course.id}`;

        const getOrCreateTargetTime = () => {
            let targetStr = localStorage.getItem(storageKey);
            let target = targetStr ? parseInt(targetStr, 10) : 0;
            const now = Date.now();

            if (!target || target <= now) {
                target = now + durationMs;
                localStorage.setItem(storageKey, target.toString());
            }
            return target;
        };

        let targetTime = getOrCreateTargetTime();

        const updateTimer = () => {
            const now = Date.now();
            let diff = targetTime - now;

            if (diff <= 0) {
                // Restart timer
                targetTime = now + durationMs;
                localStorage.setItem(storageKey, targetTime.toString());
                diff = durationMs;
            }

            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ hours: hrs, minutes: mins, seconds: secs });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [course]);

    useEffect(() => {
        if (isEnrolled) {
            setShowStickyRibbon(false);
            return;
        }

        const handleScroll = () => {
            if (!ribbonRef.current) return;
            const rect = ribbonRef.current.getBoundingClientRect();
            if (rect.top <= window.innerHeight) {
                setShowStickyRibbon(false);
            } else {
                setShowStickyRibbon(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isEnrolled]);

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
                const foundCourse = response.data.course;
                if (foundCourse.section_titles?.coming_soon === true) {
                    navigate('/courses');
                    return;
                }
                setCourse(foundCourse);
                setIsEnrolled(response.data.is_enrolled);
                setCompletedLessons(response.data.completed_lessons || []);
            }
        } catch (error) {
            console.error('Error fetching course detail', error);
        } finally {
            setLoading(false);
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

    const fakeLearnersBase = parseInt(course.section_titles?.fake_learner_count, 10) || 0;
    const totalLearners = fakeLearnersBase + (course.enrollments_count || 0);

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
                    <div className="lg:col-span-2 space-y-16 lg:space-y-24">

                        {/* Description */}
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">{getSectionTitle(course.section_titles, 'description')}</h2>
                            <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl sm:rounded-2xl overflow-hidden relative">
                                <div className="p-5 sm:p-8">
                                    <div
                                        className={`text-slate-600 text-lg font-normal leading-relaxed markdown-body transition-all duration-500 ease-in-out ${!isDescriptionExpanded ? 'max-h-[450px] overflow-hidden' : 'max-h-[none]'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(course.description) }}
                                    />
                                </div>

                                {!isDescriptionExpanded && (
                                    <div className="absolute bottom-14 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
                                )}

                                <div className="relative z-10 pb-6 flex justify-center bg-white">
                                    <button
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                        className="px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                    >
                                        {isDescriptionExpanded ? 'সংক্ষিপ্ত করুন' : 'আরও পড়ুন'}
                                    </button>
                                </div>
                            </div>
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
                                    <span className="text-sm text-slate-500 font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                        {toBengaliNum(totalLearners.toLocaleString())} জন শিক্ষার্থী যুক্ত হয়েছেন
                                    </span>
                                </div>

                                {/* Guarantee & Access (shown only when not enrolled) */}
                                {!isEnrolled && (
                                    <div className="space-y-2.5">
                                        {course.lifetime_access && (
                                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                                <span className="text-sm font-bold text-emerald-700">ফুল লাইফটাইম অ্যাক্সেস</span>
                                            </div>
                                        )}
                                        {parseInt(course.money_back_days, 10) > 0 && (
                                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
                                                <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                                                <span className="text-sm font-bold text-blue-700">{toBengaliNum(course.money_back_days)} দিনের মানি-ব্যাক গ্যারান্টি</span>
                                            </div>
                                        )}
                                    </div>
                                )}

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

                {/* Countdown Timer Section */}
                {course.section_titles?.countdown_enabled && (
                    <div 
                        className="my-12 py-5 px-6 sm:py-6 sm:px-8 rounded-3xl text-white shadow-2xl shadow-[var(--primary-color)]/15 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden relative select-none border border-white/10"
                        style={{ backgroundColor: 'var(--primary-color)', fontFamily: "'Hind Siliguri', sans-serif" }}
                    >
                        {/* Glow decorative rings */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                        
                        {/* Text Info */}
                        <div className="text-center lg:text-left space-y-2 lg:max-w-lg shrink-0">
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                                {course.section_titles?.countdown_title || 'লাইফ টাইম সাপোর্ট এর সাথে'}
                            </h3>
                            <p className="text-sm sm:text-base lg:text-lg font-medium opacity-95">
                                {course.section_titles?.countdown_subtitle || 'ইনস্ট্যান্ট আর্নিং এর জগতে এখনি জয়েন করুন 💸'}
                            </p>
                        </div>

                        {/* Countdown Units */}
                        <div className="flex flex-col items-center gap-2.5">
                            <span className="text-[13px] font-extrabold text-white/90 tracking-wide bg-white/10 px-3 py-1 rounded-full border border-white/5">
                                অফার শেষ হতে আর মাত্র বাকি আছে
                            </span>
                            <div className="flex items-center gap-4 sm:gap-5 justify-center">
                                <div className="bg-white/95 text-slate-900 rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4.5 flex flex-col items-center justify-center min-w-[75px] sm:min-w-[85px] shadow-lg border border-white/20 transition-transform hover:scale-[1.03] duration-300">
                                    <span className="text-3xl sm:text-4xl font-black leading-none" style={{ color: 'var(--primary-color)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                                        {toBengaliNum(String(timeLeft.hours).padStart(2, '0'))}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-500 mt-2">ঘণ্টা</span>
                                </div>
                                <div className="bg-white/95 text-slate-900 rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4.5 flex flex-col items-center justify-center min-w-[75px] sm:min-w-[85px] shadow-lg border border-white/20 transition-transform hover:scale-[1.03] duration-300">
                                    <span className="text-3xl sm:text-4xl font-black leading-none" style={{ color: 'var(--primary-color)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                                        {toBengaliNum(String(timeLeft.minutes).padStart(2, '0'))}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-500 mt-2">মিনিট</span>
                                </div>
                                <div className="bg-white/95 text-slate-900 rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4.5 flex flex-col items-center justify-center min-w-[75px] sm:min-w-[85px] shadow-lg border border-white/20 transition-transform hover:scale-[1.03] duration-300">
                                    <span className="text-3xl sm:text-4xl font-black leading-none" style={{ color: 'var(--primary-color)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                                        {toBengaliNum(String(timeLeft.seconds).padStart(2, '0'))}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-500 mt-2">সেকেন্ড</span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="text-center lg:text-right flex flex-col items-center lg:items-end justify-center shrink-0">
                            {discountPercent > 0 && (
                                <span className="text-lg sm:text-xl font-bold text-white/80 line-through leading-none mb-1">
                                    ৳{toBengaliNum(originalPrice.toLocaleString())} টাকা
                                </span>
                            )}
                            <span className="text-4xl sm:text-5xl font-black text-white leading-none drop-shadow-md">
                                ৳{toBengaliNum(currentPrice.toLocaleString())} টাকা
                            </span>
                        </div>
                    </div>
                )}

                {/* What you'll learn (এখানে আপনি শিখতে পারবেন) - full width */}
                {course.what_youll_learn && Array.isArray(course.what_youll_learn) && course.what_youll_learn.length > 0 && (
                    <div className="my-20 lg:my-28">
                        <div className="mb-8 text-center flex flex-col items-center justify-center">
                            {/* Floating Sparkles Badge Icon */}
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-50 to-indigo-50/50 flex items-center justify-center border border-cyan-100 shadow-sm mb-4">
                                <Sparkles className="h-6 w-6 text-indigo-500" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: 'color-mix(in srgb, var(--primary-color) 35%, #0f172a 65%)' }}>
                                {getSectionTitle(course.section_titles, 'what_youll_learn')}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            {course.what_youll_learn.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="relative rounded-3xl p-[2px] overflow-hidden snake-border-container shadow-sm border border-slate-100/50 hover:shadow-md transition-all h-full"
                                >
                                    {/* Rotating Snake Border */}
                                    <div className="snake-border-glow" />

                                    {/* Inner Content Area */}
                                    <div
                                        className="snake-border-content p-6 sm:p-8 rounded-[22px] relative overflow-hidden flex flex-col gap-4 text-left h-full"
                                        style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 7%, #ffffff)' }}
                                    >
                                        {/* Icon & Number Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-xl bg-white/80 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-sm">
                                                {idx === 0 ? (
                                                    <Globe className="h-5.5 w-5.5 theme-primary-text text-cyan-600" />
                                                ) : idx === 1 ? (
                                                    <Smartphone className="h-5.5 w-5.5 theme-primary-text text-indigo-600" />
                                                ) : (
                                                    <BookOpen className="h-5.5 w-5.5 theme-primary-text text-emerald-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 flex items-center gap-3 ml-4">
                                                <span className="text-sm font-extrabold text-cyan-500 tracking-wider">
                                                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                                                </span>
                                                <div className="flex-1 h-px bg-slate-200/65" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                                                {renderText(item)}
                                            </h4>
                                            {typeof item === 'object' && item !== null && item.sub_text && (
                                                <p className="text-sm sm:text-base text-slate-650 font-medium leading-relaxed">
                                                    {item.sub_text}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div> {/* Closes max-w-7xl main container */}

            {/* Audience (কাদের জন্য এই কোর্স) - Edge to Edge */}
            {course.audience && Array.isArray(course.audience) && course.audience.length > 0 && (
                <div className="border-y border-slate-200/40 py-16 w-full" style={{ backgroundColor: '#F4F5F7' }}>
                    <div className="max-w-7xl mx-auto px-4 md:px-6">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-10 text-center leading-tight">
                            {getSectionTitle(course.section_titles, 'audience')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                            {course.audience.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group h-full"
                                >
                                    {/* Icon Badge */}
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 mb-5 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                                        {idx === 0 ? (
                                            <Brain className="h-6 w-6 text-purple-600" />
                                        ) : idx === 1 ? (
                                            <Code className="h-6 w-6 text-cyan-600" />
                                        ) : idx === 2 ? (
                                            <Briefcase className="h-6 w-6 text-indigo-600" />
                                        ) : (
                                            <Award className="h-6 w-6 text-emerald-600" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3 flex-1">
                                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                                            {renderText(item)}
                                        </h3>
                                        {typeof item === 'object' && item !== null && item.sub_text && (
                                            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                                                {item.sub_text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Reopen max-w-7xl container for subsequent elements */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 relative z-20">

                {/* Syllabus / Curriculum */}
                <div className="my-20 lg:my-28 max-w-5xl mx-auto">
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
                    <div className="relative pl-12 sm:pl-16 space-y-6">
                        {/* Timeline Vertical Line */}
                        <div className="absolute left-[20px] sm:left-[28px] top-6 bottom-6 w-0.5" style={{ backgroundColor: 'var(--primary-color)', opacity: 0.35 }} />

                        {course.chapters && course.chapters.length > 0 ? (
                            course.chapters.map((chapter, index) => {
                                const isOpen = !!openChapters[chapter.id];
                                return (
                                    <div key={chapter.id} className="relative">
                                        {/* Timeline Node Circle */}
                                        <div
                                            className="absolute -left-[39px] sm:-left-[49px] top-[32px] sm:top-[30px] w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] rounded-full bg-white border-4 flex items-center justify-center z-10 shadow-sm"
                                            style={{ borderColor: 'var(--primary-color)' }}
                                        >
                                            <div
                                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                style={{ backgroundColor: 'var(--primary-color)' }}
                                            />
                                        </div>

                                        {/* Card content wrapper */}
                                        <div
                                            className="border border-slate-200/60 rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden"
                                            style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 7%, #ffffff)' }}
                                        >
                                            <button
                                                onClick={() => toggleChapter(chapter.id)}
                                                className="w-full flex items-center justify-between text-left cursor-pointer border-none bg-transparent p-0"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Bengali Number */}
                                                    <span className="text-4xl sm:text-5xl font-black theme-primary-text opacity-35 leading-none shrink-0 min-w-[2.5rem] text-center">
                                                        {toBengaliNum(index + 1)}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-snug">
                                                            {chapter.title}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5">
                                                            {toBengaliNum(chapter.lessons?.length || 0)}টি লেসন
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronDown className={`h-5 w-5 text-slate-450 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isOpen && (
                                                <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-0">
                                                    {chapter.lessons && chapter.lessons.length > 0 ? (
                                                        chapter.lessons.map((lesson) => (
                                                            <div key={lesson.id} className="flex items-center justify-between py-3 hover:bg-white/40 rounded-lg px-2 transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <Play className="h-3.5 w-3.5 text-slate-400" />
                                                                    <span className="text-sm sm:text-base text-slate-650 font-medium">{lesson.title}</span>
                                                                </div>
                                                                {lesson.is_preview && (
                                                                    <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                                                                        Preview
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-xs text-slate-400 italic py-2 px-2">No lessons in this chapter</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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

                {/* Course Value / Why This Course */}
                <div className="my-20 lg:my-28 max-w-5xl mx-auto">
                    <div className="relative rounded-3xl p-[2px] overflow-hidden snake-border-container shadow-sm border border-slate-100/50 hover:shadow-md transition-all">
                        {/* Rotating Snake Border */}
                        <div className="snake-border-glow" />

                        {/* Inner Content Area */}
                        <div 
                            className="snake-border-content p-6 sm:p-8 rounded-[22px] relative overflow-hidden"
                            style={{ backgroundImage: 'linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 14%, #ffffff) 0%, #ffffff 70%)' }}
                        >
                            <div className="space-y-6">
                                {/* Text Content */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-start">
                                        <span className="text-6xl sm:text-7xl font-black theme-primary-text opacity-50 leading-none select-none">?</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                                        মনে কি প্রশ্ন জাগছে – &ldquo;এত কিছু মাত্র ৳{currentPrice.toLocaleString()} টাকায় কীভাবে সম্ভব?&rdquo;
                                    </h2>
                                    <div className="space-y-3 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                                        <p>
                                            সাধারণত বাজারে অন্যান্য কোর্সের মূল্য ৫ থেকে ১০ হাজার টাকা হয়ে থাকে, সেখানে আমরা এত কম মূল্যে এই কোর্সটি দিচ্ছি—যার একমাত্র লক্ষ্য হলো <span className="font-bold text-slate-800">সবার জন্য কোয়ালিটি লার্নিং অ্যাক্সেসিবল করা</span>। আমরা চাই দামি কোনো ডিগ্রি বা মোটা অংকের টাকা না থাকলেও দেশের যেকোনো প্রান্ত থেকে যে কেউ যেন মাত্র ১-২ মাসে মডার্ন টেকনোলজি শিখে নিজের ক্যারিয়ার গড়তে পারে। "টাকার অভাবে শিখতে পারিনি"—এমন অজুহাত বা সীমাবদ্ধতা যেন কারো স্বপ্ন পূরণে বাধা হয়ে না দাঁড়ায়।
                                        </p>
                                    </div>
                                </div>

                                {/* Action Button */}
                                {!isEnrolled && (
                                    <div className="pt-2">
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="w-full py-3.5 rounded-xl font-bold theme-primary-bg hover:brightness-95 text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer border-none"
                                        >
                                            {enrolling ? 'এনরোলিং হচ্ছে...' : 'এনরোল করুন'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problem & Solution */}
                <div className="my-20 lg:my-28 max-w-5xl mx-auto">
                    {(course.problems && Array.isArray(course.problems) && course.problems.length > 0) || (course.solutions && Array.isArray(course.solutions) && course.solutions.length > 0) ? (
                        <div>
                            {/* Header (outside) */}
                            <div className="mb-6">
                                <span className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-400 uppercase mb-2 block">
                                    Problem & Solution
                                </span>
                                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                                    {getSectionTitle(course.section_titles, 'problem_solution')}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6">
                                {/* Problems column */}
                                {course.problems && Array.isArray(course.problems) && course.problems.length > 0 && (
                                    <div className="relative rounded-3xl p-[2px] overflow-hidden snake-border-container shadow-sm border border-slate-100/50 hover:shadow-md transition-all h-full">
                                        {/* Rotating Snake Border */}
                                        <div
                                            className="snake-border-glow"
                                            style={{
                                                background: 'conic-gradient(from 0deg, transparent 0%, transparent 40%, #ef4444 50%, transparent 60%, transparent 100%)'
                                            }}
                                        />

                                        {/* Inner Content Area */}
                                        <div
                                            className="snake-border-content p-6 sm:p-8 rounded-[22px] relative overflow-hidden flex flex-col gap-4 text-left h-full"
                                            style={{ backgroundColor: 'color-mix(in srgb, #ef4444 7%, #ffffff)' }}
                                        >
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60">
                                                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">/ আপনার বর্তমান সমস্যা</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {course.problems.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3.5 text-base sm:text-lg text-slate-700 font-semibold leading-relaxed">
                                                        <span className="mt-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                                                        <span>{renderText(item)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Solutions column */}
                                {course.solutions && Array.isArray(course.solutions) && course.solutions.length > 0 && (
                                    <div className="relative rounded-3xl p-[2px] overflow-hidden snake-border-container shadow-sm border border-slate-100/50 hover:shadow-md transition-all h-full">
                                        {/* Rotating Snake Border */}
                                        <div className="snake-border-glow" />

                                        {/* Inner Content Area */}
                                        <div
                                            className="snake-border-content p-6 sm:p-8 rounded-[22px] relative overflow-hidden flex flex-col gap-4 text-left h-full"
                                            style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 7%, #ffffff)' }}
                                        >
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60">
                                                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">/ আপনার জন্য আমাদের সমাধান</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {course.solutions.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3.5 text-base sm:text-lg text-slate-700 font-semibold leading-relaxed">
                                                        <CheckCircle className="h-5 w-5 theme-primary-text shrink-0 mt-0.5" />
                                                        <span>{renderText(item)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Instructor */}
                {course.user && (
                    <div className="my-20 lg:my-28 max-w-5xl mx-auto px-0 sm:px-4">
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row bg-white" style={{ backgroundImage: 'linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 8%, #ffffff) 0%, #ffffff 80%)' }}>
                            {/* Decorative background blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-20 rounded-full blur-3xl pointer-events-none" />

                            {/* Avatar - cover full left side */}
                            <div className="w-full md:w-80 shrink-0 relative min-h-[300px] md:min-h-full">
                                {course.user.avatar ? (
                                    <img
                                        src={course.user.avatar.startsWith('http') ? course.user.avatar : `/storage/${course.user.avatar}`}
                                        alt={course.user.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                                        <User className="h-20 w-20 text-white/70" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 p-6 sm:p-10 text-center md:text-left space-y-4 flex flex-col justify-center relative z-10">
                                <div className="space-y-1">
                                    <span className="inline-block px-3 py-1 bg-purple-50 border border-purple-100 text-purple-600 rounded-full text-[10px] font-black tracking-wider uppercase font-mono mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                        Meet Your Mentor
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-1.5" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                        {course.user.name || 'বিশেষজ্ঞ'}
                                        <BadgeCheck className="h-6 w-6 text-blue-500 shrink-0 fill-blue-50" />
                                    </h3>
                                    <p className="text-sm theme-primary-text font-extrabold uppercase tracking-wider" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>কোর্স ইনস্ট্রাক্টর</p>
                                </div>

                                <p className="text-sm sm:text-base text-slate-650 font-medium leading-relaxed italic border-l-2 border-slate-200 pl-0 md:pl-4">
                                    "I build premium websites, SaaS products, and AI-powered systems for entrepreneurs and growing businesses. With 6+ years of experience and 4500+ completed projects, my focus is simple: clean design, smart execution, and real business results."
                                </p>

                                {/* Stats grid */}
                                <div className="grid grid-cols-2 gap-3 pt-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                    <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl p-3 text-center md:text-left shadow-sm">
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">অভিজ্ঞতা</div>
                                        <div className="text-lg font-black text-slate-800">৬+ বছর</div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl p-3 text-center md:text-left shadow-sm">
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">সম্পন্ন প্রজেক্ট</div>
                                        <div className="text-lg font-black text-slate-800">৪৫০০+ প্রজেক্ট</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div> {/* Closes max-w-7xl main container */}

            {/* Special Offer Ribbon - Edge to Edge */}
            {!isEnrolled && (
                <div
                    ref={ribbonRef}
                    className="w-full py-4 text-white border-y border-black/10 flex items-center justify-center select-none"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                >
                    <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                        <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide">
                            বিশেষ অফার চলছে — দেরি না করে
                        </span>
                        <button
                            onClick={handleEnroll}
                            className="bg-slate-950 hover:bg-black text-white text-sm sm:text-base font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-none"
                        >
                            এখনই ইনরোল করুন <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Reopen max-w-7xl container for subsequent elements */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 relative z-20">

                {/* Call To Action */}
                {!isEnrolled && (
                    <div className="my-20 lg:my-28 max-w-2xl mx-auto px-0 sm:px-4">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-2" style={{ color: 'color-mix(in srgb, var(--primary-color) 35%, #0f172a 65%)' }}>
                                Unlock Your Superpower
                            </h2>
                            <p className="text-base sm:text-lg text-slate-500 font-semibold leading-relaxed">
                                মাসে মাসে কোনো ফি নেই। একবার পেমেন্ট করুন, লাইফটাইম এক্সেস নিন।
                            </p>
                        </div>
                        <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl text-center">
                            {/* Floating Badge */}
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-md uppercase tracking-wider whitespace-nowrap">
                                    <Zap className="h-3.5 w-3.5 fill-white text-white" /> Early Bird Action
                                </span>
                            </div>

                            <div className="space-y-6">
                                {/* Title and Subtitle */}
                                <div className="pt-2">
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">
                                        No monthly fees. 100% Free Tools Taught.
                                    </p>
                                </div>

                                {/* Price tag */}
                                <div className="flex items-baseline justify-center gap-3.5 py-2">
                                    {discountPercent > 0 && (
                                        <span className="text-2xl sm:text-3xl font-bold text-slate-350 line-through">
                                            ৳{originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                    <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                                        ৳{currentPrice.toLocaleString()}
                                    </span>
                                </div>

                                {/* Notice Box */}
                                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex gap-3 text-left max-w-xl mx-auto">
                                    <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                                    <p className="text-xs sm:text-sm text-amber-800 font-bold leading-relaxed">
                                        যেকোনো সময় দাম বাড়তে পারে। <span className="underline">দাম বেড়ে যাওয়ার আগেই</span> আপনার সিটটি নিশ্চিত করুন।
                                    </p>
                                </div>

                                {/* Features Checklist */}
                                {course.this_course_includes && Array.isArray(course.this_course_includes) && course.this_course_includes.length > 0 && (
                                    <ul className="space-y-4 py-2 max-w-md mx-auto text-left">
                                        {course.this_course_includes.map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-3.5 text-sm sm:text-base text-slate-700 font-bold">
                                                <div className="w-6 h-6 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="h-4 w-4 text-cyan-600" />
                                                </div>
                                                <span className="leading-snug">{renderText(item)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Action Button */}
                                <div>
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:brightness-110 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all disabled:opacity-60 cursor-pointer border-none text-base sm:text-lg tracking-wide"
                                    >
                                        {enrolling ? 'এনরোলিং হচ্ছে...' : 'Start Mission Now'}
                                    </button>
                                </div>

                                {/* Bottom Guarantee Box */}
                                {parseInt(course.money_back_days, 10) > 0 && (
                                    <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 sm:p-5 text-left flex items-start gap-4 max-w-xl mx-auto">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center shrink-0 border border-blue-200">
                                            <ShieldCheck className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-extrabold text-blue-900 mb-1">
                                                {toBengaliNum(course.money_back_days)} দিনের মানি-ব্যাক গ্যারান্টি
                                            </h4>
                                            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                                                কোর্স শুরু করুন নিশ্চিন্তে। {toBengaliNum(course.money_back_days)} দিনের মধ্যে যদি মনে হয় এটা আপনার জন্য নয় — কোনো প্রশ্ন ছাড়াই পুরো টাকা ফেরত।
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Secure note */}
                                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold pt-2">
                                    <Lock className="h-3.5 w-3.5" /> Secure Payment System
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div> {/* Closes max-w-7xl main container */}

            {/* Service Highlights Section (Dedicated Support, Payment, Activation) - Edge to Edge */}
            <div className="border-y border-slate-200/40 py-16 w-full" style={{ backgroundColor: '#F4F5F7' }}>
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {/* Card 1: Dedicated Support */}
                            <div
                                className="bg-white border-2 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-between transition-all hover:shadow-lg shadow-sm group animate-fade-in"
                                style={{ borderColor: 'var(--primary-color)' }}
                            >
                                <div className="w-full flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full border border-slate-200 flex items-center justify-center mb-5 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-850">
                                            <Headphones className="h-8 w-8 stroke-[1.8]" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">ডেডিকেটেড সাপোর্ট</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 font-bold mb-6">যেকোনো সমস্যায় আমরা আছি আপনার পাশে</p>
                                </div>
                                <button
                                    className="w-full py-3 rounded-xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:brightness-95 border-none shadow-sm"
                                    style={{ backgroundColor: 'var(--primary-color)' }}
                                >
                                    <Headphones className="h-4.5 w-4.5 fill-white text-white" /> সরাসরি যোগাযোগ
                                </button>
                            </div>

                            {/* Card 2: bKash Payment */}
                            <div
                                className="bg-white border-2 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-between transition-all hover:shadow-lg shadow-sm group animate-fade-in"
                                style={{ borderColor: 'var(--primary-color)' }}
                            >
                                <div className="w-full flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full border border-slate-200 flex items-center justify-center mb-5 bg-white shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105">
                                        <div className="text-center">
                                            <span className="text-[#D12053] font-black text-lg tracking-tighter block leading-none">bKash</span>
                                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-black block mt-0.5">Payment</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">বিকাশ পেমেন্ট</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 font-bold mb-6">বিকাশ অফিসিয়াল সুরক্ষিত পেমেন্ট গেটওয়ে</p>
                                </div>
                                <button
                                    className="w-full py-3 rounded-xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:brightness-95 border-none shadow-sm"
                                    style={{ backgroundColor: 'var(--primary-color)' }}
                                >
                                    <Lock className="h-4.5 w-4.5 text-white" /> ১০০% সিকিউর
                                </button>
                            </div>

                            {/* Card 3: Instant Activation */}
                            <div
                                className="bg-white border-2 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-between transition-all hover:shadow-lg shadow-sm group animate-fade-in"
                                style={{ borderColor: 'var(--primary-color)' }}
                            >
                                <div className="w-full flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full border border-slate-200 flex items-center justify-center mb-5 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                                        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-850">
                                            <Zap className="h-8 w-8 stroke-[1.8]" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">ইনস্ট্যান্ট এক্টিভেশন</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 font-bold mb-6">পেমেন্টের সাথে সাথে সার্ভিস চালু</p>
                                </div>
                                <button
                                    className="w-full py-3 rounded-xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:brightness-95 border-none shadow-sm"
                                    style={{ backgroundColor: 'var(--primary-color)' }}
                                >
                                    <Zap className="h-4.5 w-4.5 fill-white text-white" /> ইনস্ট্যান্ট সেটআপ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Ticker Section - Full Width */}
            {course.section_titles?.testimonials && Array.isArray(course.section_titles.testimonials) && course.section_titles.testimonials.length > 0 && (() => {
                const testimonials = course.section_titles.testimonials;
                
                // Duplicate testimonials to ensure we have enough items for seamless scrolling
                const doubledTestimonials = [...testimonials];
                while (doubledTestimonials.length < 8) {
                    doubledTestimonials.push(...testimonials);
                }
                const marqueeList = [...doubledTestimonials, ...doubledTestimonials];

                return (
                    <div className="w-full overflow-hidden py-16 bg-[#f4f6fc]/30 border-y border-slate-100 relative select-none">
                        <div className="mb-10 text-center max-w-7xl mx-auto px-4 md:px-6">
                            <span className="text-xs font-extrabold tracking-[0.25em] text-slate-400 uppercase mb-2 block">
                                SUCCESS STORIES
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                                আমাদের শিক্ষার্থীদের সফলতার গল্প
                            </h2>
                        </div>

                        {/* Fade overlay on left and right */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

                        {/* Scrolling Container */}
                        <div className="w-full flex overflow-hidden">
                            <div className="animate-marquee flex gap-6 py-4">
                                {marqueeList.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        className="relative rounded-3xl p-6 sm:p-7 shadow-sm border border-cyan-100 hover:shadow-md transition-all flex flex-col justify-between bg-gradient-to-b from-white to-cyan-50/10 min-h-[220px] w-[300px] sm:w-[360px] shrink-0"
                                    >
                                        {/* Source Badge Illustration */}
                                        <div className={`absolute top-5 right-5 w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${item.source === 'facebook' ? 'bg-blue-50 border-blue-100/50' : 'bg-cyan-50 border-cyan-100/50'}`}>
                                            {item.source === 'facebook' ? (
                                                <Facebook className="w-5 h-5 text-blue-600 fill-blue-600" />
                                            ) : (
                                                <Globe className="w-5 h-5 text-cyan-500" />
                                            )}
                                        </div>

                                        <div>
                                            {/* Header info */}
                                            <div className="flex items-center gap-3.5 mb-4">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                                <div>
                                                    <h4 className="text-base font-extrabold text-slate-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                                        {item.name}
                                                    </h4>
                                                    {/* Stars */}
                                                    <div className="flex items-center gap-0.5 mt-1">
                                                        {[...Array(item.rating || 5)].map((_, i) => (
                                                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Feedback Comment */}
                                            <p className="text-sm sm:text-base text-slate-650 font-medium leading-relaxed mb-6 text-left" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                                {item.comment}
                                            </p>
                                        </div>

                                        {/* Footer Designation (Replacing Date) */}
                                        {item.designation && (
                                            <div className="text-xs sm:text-sm font-bold text-cyan-600/90 text-left mt-auto" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                                {item.designation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Call To Action Button */}
                        {!isEnrolled && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleEnroll}
                                    className="px-8 py-4 rounded-2xl text-white font-extrabold text-base sm:text-lg flex items-center gap-2 cursor-pointer transition-all hover:brightness-95 border-none shadow-lg shadow-[var(--primary-color)]/25 hover:scale-[1.02] duration-300 active:scale-[0.98]"
                                    style={{ backgroundColor: 'var(--primary-color)', fontFamily: "'Hind Siliguri', sans-serif" }}
                                >
                                    এখনই ইনরোল করুন <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Contact/Support Section */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 my-20 lg:my-28 select-none animate-fade-in">
                <div 
                    className="relative rounded-[32px] p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center"
                    style={{ 
                        backgroundColor: 'var(--primary-color)',
                        backgroundImage: 'linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, black) 100%)'
                    }}
                >
                    {/* Grid background overlay */}
                    <div 
                        className="absolute inset-0 opacity-15 pointer-events-none" 
                        style={{
                            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                        }}
                    />

                    {/* Left Column: Text & CTA */}
                    <div className="w-full lg:w-1/2 space-y-6 relative z-10 text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/12 backdrop-blur-sm border border-white/10 text-white text-xs font-bold">
                            <Phone className="w-3.5 h-3.5" />
                            সাপোর্ট টিম
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white leading-tight" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                            যেকোনো প্রয়োজনে যোগাযোগ করুন
                        </h2>
                        <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                            প্ল্যাটফর্ম, কোর্স বা পেমেন্ট সংক্রান্ত বিস্তারিত জানতে আমাদের সাপোর্ট টিমের সাথে সরাসরি কথা বলতে পারেন।
                        </p>
                        <div>
                            <a 
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-[var(--primary-color)] text-sm sm:text-base font-extrabold rounded-2xl transition-all shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none"
                                style={{ color: 'var(--primary-color)', fontFamily: "'Hind Siliguri', sans-serif" }}
                            >
                                <MessageSquare className="h-5 w-5 fill-[var(--primary-color)] text-[var(--primary-color)]" />
                                হোয়াটসঅ্যাপে মেসেজ
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Cards */}
                    <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 text-left">
                        {/* Hotline Card */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/12 rounded-3xl p-6 flex flex-col justify-between min-h-[120px] transition-all hover:bg-white/15">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold tracking-wider text-white/70 uppercase block mb-1">
                                    হটলাইন
                                </span>
                                <a 
                                    href={`tel:${hotline}`}
                                    className="text-sm sm:text-base font-extrabold text-white hover:underline"
                                >
                                    {hotline}
                                </a>
                            </div>
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/12 rounded-3xl p-6 flex flex-col justify-between min-h-[120px] transition-all hover:bg-white/15">
                            <div className="flex gap-2 mb-4">
                                {socialLinks.map((s, idx) => {
                                    const Icon = s.icon;
                                    return (
                                        <a 
                                            key={idx}
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105"
                                        >
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    );
                                })}
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold tracking-wider text-white/70 uppercase block mb-1">
                                    সোশ্যাল মিডিয়া
                                </span>
                                <div className="flex gap-3 text-xs sm:text-sm font-bold text-white">
                                    {socialLinks.map((s, idx) => (
                                        <a 
                                            key={idx}
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            {s.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Address Card (Full width of the grid) */}
                        <div className="sm:col-span-2 bg-white/10 backdrop-blur-md border border-white/12 rounded-3xl p-6 flex gap-4 items-start transition-all hover:bg-white/15">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold tracking-wider text-white/70 uppercase block mb-1">
                                    অফিস ঠিকানা
                                </span>
                                <p className="text-xs sm:text-sm font-extrabold text-white leading-relaxed" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                    {address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reopen container for subsequent elements */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12 relative z-20">

                {/* Frequently Asked Questions */}
                {course.faq && Array.isArray(course.faq) && course.faq.length > 0 && (
                    <div className="my-20 lg:my-28">
                        <div className="mb-6 text-center">
                            <span className="text-xs font-extrabold tracking-[0.25em] text-slate-400 uppercase mb-2 block">
                                FAQ
                            </span>
                            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                                {getSectionTitle(course.section_titles, 'faq')}
                            </h2>
                        </div>

                        <div className="max-w-5xl mx-auto space-y-3">
                            {course.faq.map((faq, index) => {
                                const isOpen = expandedFaq === index;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden transition-all duration-200"
                                    >
                                        <button
                                            onClick={() => setExpandedFaq(isOpen ? null : index)}
                                            className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-700 hover:theme-primary-text text-lg transition-colors cursor-pointer border-none bg-transparent"
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
                                            <div className="px-5 pb-4 pt-1.5 text-base text-slate-500 font-medium leading-relaxed border-t border-slate-100 pl-14">
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

            {/* Sticky Bottom Ribbon */}
            {!isEnrolled && showStickyRibbon && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-50 py-3 text-white border-t border-black/10 shadow-2xl flex items-center justify-center animate-slide-up"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                >
                    <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-center gap-4 sm:gap-6 w-full">
                        <span className="text-sm sm:text-base font-bold tracking-wide">
                            বিশেষ অফার চলছে — দেরি না করে
                        </span>
                        <button
                            onClick={handleEnroll}
                            className="bg-slate-950 hover:bg-black text-white text-xs sm:text-sm font-extrabold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-none shrink-0"
                        >
                            এখনই ইনরোল করুন <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

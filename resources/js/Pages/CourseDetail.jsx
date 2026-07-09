import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import { Play, BookOpen, CheckCircle, FileText, ChevronRight, Award, HelpCircle } from 'lucide-react';

export default function CourseDetail() {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

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

    useEffect(() => {
        fetchCourseDetails();
    }, [slug]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            const response = await axios.post(`/api/courses/${course.id}/enroll`);
            if (response.data.success) {
                setIsEnrolled(true);
                // Redirect straight to learn mode
                navigate(`/courses/${course.slug}/learn`);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to enroll');
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
                <h2 className="text-2xl font-bold text-white">Course Not Found</h2>
                <Link to="/" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">Back to Courses</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
                {/* Left Info */}
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2">
                        {course.language || 'English'}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                        {course.title}
                    </h1>
                    <p className="text-gray-400 text-lg mb-6 font-light">
                        {course.short_description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">Instructor:</span>
                            <span className="text-purple-300">{course.user?.name || 'Expert'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-purple-400" />
                            <span>{course.chapters?.length || 0} Chapters</span>
                        </div>
                    </div>
                </div>

                {/* Right Card / Thumbnail / Action */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center max-w-sm mx-auto w-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -z-10" />
                    
                    <div className="relative aspect-video w-full bg-slate-800 rounded-xl overflow-hidden mb-6">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-purple-900/40 to-pink-900/40">
                                <BookOpen className="h-10 w-10 text-purple-500/50" />
                            </div>
                        )}
                    </div>

                    <div className="mb-6 flex items-baseline gap-2">
                        {parseFloat(course.discount_price) > 0 ? (
                            <>
                                <span className="text-3xl font-extrabold text-white">${course.discount_price}</span>
                                <span className="text-sm text-gray-500 line-through">${course.price}</span>
                            </>
                        ) : (
                            <span className="text-3xl font-extrabold text-white">
                                {parseFloat(course.price) === 0 ? 'Free' : `$${course.price}`}
                            </span>
                        )}
                    </div>

                    {isEnrolled ? (
                        <Link
                            to={`/courses/${course.slug}/learn`}
                            className="glass-btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <Play className="h-4 w-4 fill-white" /> Resume Learning
                        </Link>
                    ) : (
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="glass-btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Tabs / Info Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    {/* What you'll learn */}
                    {course.what_youll_learn && Array.isArray(course.what_youll_learn) && course.what_youll_learn.length > 0 && (
                        <div className="glass-panel p-8 rounded-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">What you'll learn</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.what_youll_learn.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 text-sm text-gray-300 font-light">
                                        <CheckCircle className="h-5 w-5 text-purple-400 shrink-0" />
                                        <span>{renderText(item)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Course Description</h2>
                        <div className="text-gray-400 text-sm font-light leading-relaxed whitespace-pre-line">
                            {course.description}
                        </div>
                    </div>

                    {/* Syllabus / Curriculum */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Course Curriculum</h2>
                        <p className="text-sm text-gray-400 mb-6">Browse chapters and check lessons preview</p>
                        
                        <div className="space-y-4">
                            {course.chapters && course.chapters.length > 0 ? (
                                course.chapters.map((chapter) => (
                                    <div key={chapter.id} className="glass-panel rounded-2xl overflow-hidden">
                                        <div className="px-6 py-4 bg-white/2 border-b border-white/5 flex items-center justify-between">
                                            <h3 className="font-semibold text-white text-sm">
                                                {chapter.title}
                                            </h3>
                                            <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                                                {chapter.lessons?.length || 0} Lessons
                                            </span>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {chapter.lessons && chapter.lessons.length > 0 ? (
                                                chapter.lessons.map((lesson) => (
                                                    <div key={lesson.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-white/1 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <Play className="h-3.5 w-3.5 text-gray-500" />
                                                            <span className="text-sm text-gray-300 font-light">{lesson.title}</span>
                                                        </div>
                                                        {lesson.is_preview && (
                                                            <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                                                Preview
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-6 py-4 text-xs text-gray-500 italic">No lessons in this chapter</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 glass-panel rounded-2xl italic text-gray-500 text-sm">
                                    No chapters defined yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Requirements / Features */}
                <div className="space-y-8">
                    {course.requirements && Array.isArray(course.requirements) && course.requirements.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                                <HelpCircle className="h-4.5 w-4.5 text-purple-400" /> Requirements
                            </h3>
                            <ul className="space-y-2">
                                {course.requirements.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-400 font-light list-disc list-inside">
                                        {renderText(item)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {course.this_course_includes && Array.isArray(course.this_course_includes) && course.this_course_includes.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                                <Award className="h-4.5 w-4.5 text-purple-400" /> What's Included
                            </h3>
                            <ul className="space-y-2">
                                {course.this_course_includes.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-400 font-light flex items-center gap-2">
                                        <ChevronRight className="h-3 w-3 text-purple-500 shrink-0" />
                                        <span>{renderText(item)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

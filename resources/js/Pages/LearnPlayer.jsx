import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Contexts/AuthContext';
import VideoPlayer from '../Components/VideoPlayer';
import Loader from '../Components/Loader';
import Sidebar from '../Components/Sidebar';
import Lottie from 'lottie-react';
import comingSoonAnimation from '../Assets/Animations/coming-soon.json';
import {
    Play, ChevronLeft, ChevronRight, FileText, CheckCircle2, Circle,
    LayoutDashboard, BookOpen, Bell, Gift, Star, Wrench, ShoppingBag, Award, CreditCard,
    Users, Wallet, MessageSquare, Ticket, Settings, LogOut, Search, Home as HomeIcon,
    BarChart2, Moon, ChevronDown, GraduationCap, Award as AwardIcon, CheckCircle, Menu
} from 'lucide-react';

const LottiePlayer = Lottie.default || Lottie;

export default function LearnPlayer() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [course, setCourse] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState({});
    const [activeDetailTab, setActiveDetailTab] = useState('description');

    const videoSource = useMemo(() => {
        if (!currentLesson?.video_url) return null;
        return {
            type: 'video',
            sources: [
                {
                    src: currentLesson.video_url,
                    type: 'video/mp4',
                },
            ],
        };
    }, [currentLesson?.video_url]);

    const fetchLearningData = async () => {
        try {
            const response = await axios.get(`/api/courses/${slug}`);
            if (response.data.success) {
                if (!response.data.is_enrolled) {
                    // Redirect back if not enrolled
                    navigate(`/courses/${slug}`);
                    return;
                }
                setCourse(response.data.course);
                setCompletedLessons(response.data.completed_lessons || []);
                setProgress(response.data.enrollment?.progress || 0);

                // Auto-select first lesson if none selected
                const chapters = response.data.course.chapters || [];
                if (chapters.length > 0 && chapters[0].lessons?.length > 0) {
                    setCurrentLesson(chapters[0].lessons[0]);
                }
            }
        } catch (error) {
            console.error('Error loading learn screen', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLearningData();
    }, [slug]);

    // Auto-expand the chapter that contains the currently selected lesson
    useEffect(() => {
        if (currentLesson && course?.chapters) {
            const activeChapter = course.chapters.find(chap =>
                chap.lessons?.some(les => les.id === currentLesson.id)
            );
            if (activeChapter) {
                setExpandedChapters(prev => ({
                    ...prev,
                    [activeChapter.id]: true
                }));
            }
        }
    }, [currentLesson, course]);

    const handleToggleComplete = async (lessonId) => {
        try {
            const response = await axios.post(`/api/lessons/${lessonId}/toggle-progress`);
            if (response.data.success) {
                setProgress(response.data.progress);
                if (response.data.is_completed) {
                    setCompletedLessons((prev) => [...prev, lessonId]);
                } else {
                    setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
                }
            }
        } catch (error) {
            console.error('Error toggling progress', error);
        }
    };

    const handleSidebarItemClick = (key) => {
        navigate(key === 'dashboard' ? '/dashboard' : `/dashboard/${key}`);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => ({
            ...prev,
            [chapterId]: !prev[chapterId]
        }));
    };

    // Flat list of lessons to easily find previous/next
    const flatLessons = course?.chapters?.flatMap(chap => chap.lessons || []) || [];
    const currentIdx = flatLessons.findIndex(les => les.id === currentLesson?.id);
    const prevLesson = currentIdx > 0 ? flatLessons[currentIdx - 1] : null;
    const nextLesson = currentIdx !== -1 && currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null;
    const totalLessonsCount = flatLessons.length;



    return (
        <div className="min-h-screen flex bg-[#f4f7fe] text-gray-800 font-sans antialiased">

            {/* ── Reusable Collapsible Sidebar ───────────── */}
            <Sidebar activeTab="enrolled" sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

            {/* ── Main Area ───────────────────────────────── */}
            <div className={`flex-grow flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>

                {/* Topbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors md:hidden cursor-pointer border-none bg-transparent"
                            title="Open Sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">ইনরোল্ড কোর্স</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative w-64 hidden md:block">
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="w-full bg-gray-50 border border-gray-200 text-sm px-4 pl-10 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-gray-700 transition-all"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono bg-gray-200/50 px-1.5 py-0.5 rounded border border-gray-350/30">⌘K</span>
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors relative cursor-pointer">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                            </button>
                            <Link to="/" className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <HomeIcon className="h-5 w-5" />
                            </Link>
                            <button className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                <BarChart2 className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                <Moon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* User Profile */}
                        {user && (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold text-gray-750">{user.name}</p>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Panel */}
                <main className="flex-grow pt-4 pb-12 px-4 lg:px-6">
                    {loading ? (
                        <Loader text="ক্লাসরুম লোড হচ্ছে..." />
                    ) : !course ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-md border border-gray-200 p-8 max-w-xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-800">Course Not Found</h2>
                            <Link to="/" className="text-blue-600 hover:text-blue-500 mt-4 inline-block font-medium">Back to Courses</Link>
                        </div>
                    ) : (
                        <div className="w-full mx-auto flex flex-col-reverse lg:flex-row gap-6">

                            {/* Course Content Accordion Sidebar (Left) */}
                            <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden sticky lg:top-20 h-auto lg:h-[calc(100vh-5rem)] flex flex-col">
                                {/* Course Content Header */}
                                <div className="p-5 border-b border-gray-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shrink-0">
                                    <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                        Course Content
                                    </h3>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 font-medium">Your Progress</span>
                                            <span className="font-bold text-blue-600">{progress}%</span>
                                        </div>
                                        <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out rounded-full shadow-lg"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="font-medium">{completedLessons.length} of {totalLessonsCount} completed</span>
                                            <span className="flex items-center gap-1 font-medium">
                                                <AwardIcon className="h-3.5 w-3.5 text-blue-600" />
                                                {totalLessonsCount - completedLessons.length} remaining
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion list of Chapters */}
                                <div className="flex-grow overflow-y-auto p-3 space-y-3 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {course.chapters?.map((chapter, chapterIndex) => {
                                        const isExpanded = expandedChapters[chapter.id];
                                        const chapterLessons = chapter.lessons || [];
                                        const chapterCompletedCount = chapterLessons.filter(l => completedLessons.includes(l.id)).length;
                                        const chapterProgress = chapterLessons.length > 0
                                            ? Math.round((chapterCompletedCount / chapterLessons.length) * 100)
                                            : 0;

                                        return (
                                            <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                {/* Chapter Header Button */}
                                                <button
                                                    onClick={() => toggleChapter(chapter.id)}
                                                    className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer bg-white ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-gray-50/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <span className="text-4xl font-black text-gray-200 select-none font-sans leading-none tracking-tight">
                                                            {String(chapterIndex + 1).padStart(2, '0')}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
                                                                {chapter.title}
                                                            </h4>
                                                            {/* Chapter Progress mini bar */}
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-300 ${chapterProgress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                                        style={{ width: `${chapterProgress}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-medium text-gray-500 shrink-0">{chapterProgress}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`h-4.5 w-4.5 text-gray-400 ml-3 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`} />
                                                </button>

                                                {/* Lessons List inside Chapter */}
                                                <div className={`transition-all duration-350 overflow-hidden ${isExpanded ? 'max-h-[1000px] border-t border-gray-100' : 'max-h-0'}`}>
                                                    <div className="p-2 space-y-1 bg-gray-50/30">
                                                        {chapterLessons.map((lesson, lessonIndex) => {
                                                            const isSelected = currentLesson?.id === lesson.id;
                                                            const isCompleted = completedLessons.includes(lesson.id);
                                                            const serialNumber = `${chapterIndex + 1}.${lessonIndex + 1}`;

                                                            return (
                                                                <button
                                                                    key={lesson.id}
                                                                    onClick={() => setCurrentLesson(lesson)}
                                                                    className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer ${isSelected
                                                                            ? 'bg-indigo-100 text-indigo-900 font-medium ring-1 ring-indigo-200'
                                                                            : 'text-gray-700 hover:bg-white hover:shadow-sm'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                            <Play className="h-4 w-4" />
                                                                        </div>
                                                                        <span className="text-sm leading-snug line-clamp-2 font-medium text-gray-800">
                                                                            <span className="mr-1.5 font-bold opacity-70">{serialNumber}</span>
                                                                            {lesson.title}
                                                                        </span>
                                                                    </div>
                                                                    <div className="shrink-0">
                                                                        {isCompleted ? (
                                                                            <CheckCircle className="h-4 w-4 text-green-600 fill-green-100" />
                                                                        ) : (
                                                                            <div className="h-4 w-4 rounded-full border border-gray-300" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Video Player Area & Bottom Controls (Right) */}
                            <div className="flex-1 transition-all duration-300">
                                {currentLesson ? (
                                    <div className="space-y-6">
                                        {/* Video / Content Card */}
                                        <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col">

                                            {/* Video Player wrapper */}
                                            <div className="bg-black w-full overflow-hidden aspect-video rounded-t-xl">
                                                {currentLesson.video_url ? (
                                                    <VideoPlayer
                                                        autoPlay={true}
                                                        onEnded={() => handleToggleComplete(currentLesson.id)}
                                                        source={videoSource}
                                                    />
                                                ) : (
                                                    <div className="bg-slate-50 w-full overflow-hidden aspect-video flex items-center justify-center relative min-h-[300px] rounded-t-xl">
                                                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                                                        <div className="text-center p-4 sm:p-8 z-10 flex flex-col items-center">
                                                            <div className="w-24 h-24 sm:w-32 sm:h-32 mb-4">
                                                                <LottiePlayer animationData={comingSoonAnimation} loop={true} autoplay={true} />
                                                            </div>
                                                            <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-800">শীঘ্রই আসছে</h3>
                                                            <p className="text-sm sm:text-base text-slate-500 px-4">এই লেসনের ভিডিওটি বর্তমানে প্রস্তুত করা হচ্ছে।</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Lesson Info below video */}
                                            <div className="bg-white border-b border-gray-100 p-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1.5">
                                                                <AwardIcon className="h-4 w-4 text-blue-600" />
                                                                <span className="font-semibold text-gray-900">{progress}%</span>
                                                                <span>Complete</span>
                                                            </div>
                                                            <span>•</span>
                                                            <span>{completedLessons.length}/{totalLessonsCount} Lessons</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tabs component: Description & Resources */}
                                            <div className="p-6">
                                                {/* Tab Buttons Header */}
                                                <div className="flex border-b border-gray-200 mb-6 max-w-md">
                                                    <button
                                                        onClick={() => setActiveDetailTab('description')}
                                                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${activeDetailTab === 'description'
                                                                ? 'border-blue-600 text-blue-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                            }`}
                                                    >
                                                        Lesson Description
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveDetailTab('resources')}
                                                        className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${activeDetailTab === 'resources'
                                                                ? 'border-blue-600 text-blue-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                            }`}
                                                    >
                                                        Resource Download
                                                    </button>
                                                </div>

                                                {/* Tab Content Panels */}
                                                {activeDetailTab === 'description' && (
                                                    <div className="space-y-6">
                                                        {currentLesson.description && (
                                                            <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 text-gray-700 text-sm leading-relaxed">
                                                                <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                                                                    <BookOpen className="h-4 w-4" />
                                                                    Overview
                                                                </h4>
                                                                <div className="whitespace-pre-wrap">{currentLesson.description}</div>
                                                            </div>
                                                        )}

                                                        <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                                                            {currentLesson.content ? (
                                                                <div>{currentLesson.content}</div>
                                                            ) : (
                                                                !currentLesson.description && (
                                                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                                        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                                                        <p className="text-gray-500 italic">No additional text content available for this lesson.</p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {activeDetailTab === 'resources' && (
                                                    <div>
                                                        {currentLesson.attachment_path ? (
                                                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                                <div className="p-6 flex items-start gap-4">
                                                                    <div className="bg-indigo-100 p-3 rounded-lg shrink-0 text-indigo-650">
                                                                        <FileText className="h-8 w-8" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                                            Lesson Resources
                                                                        </h3>
                                                                        <p className="text-gray-500 text-sm mb-4">
                                                                            Download the supplemental materials for this lesson. This file may contain code snippets, slides, or additional reading.
                                                                        </p>
                                                                        <a
                                                                            href={currentLesson.attachment_path.startsWith('http') ? currentLesson.attachment_path : `/storage/${currentLesson.attachment_path}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-500/10 transition-all"
                                                                        >
                                                                            Download Attachment
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                                                                    <span>Secure Download</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                                        Verified File
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-12 text-center">
                                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                                                    <FileText className="h-6 w-6 text-gray-300" />
                                                                </div>
                                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Available</h3>
                                                                <p className="text-gray-500 max-w-sm mx-auto">
                                                                    There are no downloadable materials attached to this lesson.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sticky Controls footer inside the card */}
                                            <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm flex items-center justify-center gap-4 sm:rounded-b-xl">
                                                <button
                                                    disabled={!prevLesson}
                                                    onClick={() => prevLesson && setCurrentLesson(prevLesson)}
                                                    className={`h-9 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 border transition-all cursor-pointer ${prevLesson
                                                            ? 'bg-white border-gray-250 hover:border-gray-350 text-gray-700 hover:bg-gray-50'
                                                            : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <ChevronLeft className="h-4 w-4" /> Previous
                                                </button>

                                                <button
                                                    onClick={() => handleToggleComplete(currentLesson.id)}
                                                    className={`h-9 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 border transition-all cursor-pointer ${completedLessons.includes(currentLesson.id)
                                                            ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                                                            : 'bg-white border-gray-250 hover:border-gray-350 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <CheckCircle className={`h-4 w-4 ${completedLessons.includes(currentLesson.id) ? 'text-white' : 'text-gray-400'}`} />
                                                    <span>{completedLessons.includes(currentLesson.id) ? 'Completed' : 'Complete'}</span>
                                                </button>

                                                <button
                                                    disabled={!nextLesson}
                                                    onClick={() => nextLesson && setCurrentLesson(nextLesson)}
                                                    className={`h-9 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${nextLesson
                                                            ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white'
                                                            : 'bg-gray-150 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    Next <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                                        <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-800">Select a lesson to begin</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

        </div>
    );
}

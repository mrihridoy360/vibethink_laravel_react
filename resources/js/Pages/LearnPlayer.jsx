import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, CheckSquare, Square, ChevronLeft, ChevronRight, FileText, CheckCircle2, Circle } from 'lucide-react';

export default function LearnPlayer() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

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

    // Helper to extract clean embed URL for Youtube
    const getEmbedUrl = (url) => {
        if (!url) return null;
        let videoId = null;
        
        // Match youtube patterns
        const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch && ytMatch[1]) {
            videoId = ytMatch[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        // Match vimeo patterns
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        return url;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 mt-4 text-sm">Loading classroom player...</span>
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
        <div className="min-h-screen bg-[#070a13] flex flex-col">
            {/* Player Header bar */}
            <div className="bg-[#0b0f19] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/courses/${course.slug}`} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm md:text-md font-bold text-white leading-tight">{course.title}</h1>
                        <span className="text-xs text-gray-400 font-medium">Instructor: {course.user?.name || 'Expert'}</span>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-4 w-40 md:w-60">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-purple-400 whitespace-nowrap">{progress}% Done</span>
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 overflow-y-auto">
                
                {/* Content Player Area */}
                <div className="lg:col-span-3 p-6 md:p-8 flex flex-col">
                    {currentLesson ? (
                        <div className="flex-grow flex flex-col">
                            {/* Video / Player container */}
                            {currentLesson.video_url ? (
                                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50 border border-white/5 mb-6">
                                    <iframe
                                        src={getEmbedUrl(currentLesson.video_url)}
                                        title={currentLesson.title}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            ) : (
                                <div className="glass-panel p-8 rounded-2xl mb-6 min-h-[300px] flex flex-col justify-center items-center text-center border border-white/5">
                                    <FileText className="h-16 w-16 text-purple-500/50 mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">Reading Material</h3>
                                    <p className="text-gray-400 max-w-md text-sm">Please read the content below</p>
                                </div>
                            )}

                            {/* Lesson Info */}
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">{currentLesson.title}</h2>
                                        {currentLesson.duration && (
                                            <span className="text-xs text-gray-400">{currentLesson.duration} Minutes duration</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleToggleComplete(currentLesson.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                                            completedLessons.includes(currentLesson.id)
                                                ? 'bg-purple-600/10 border-purple-500/30 text-purple-400'
                                                : 'bg-white/5 border-white/10 hover:border-purple-500/30 text-gray-300'
                                        }`}
                                    >
                                        {completedLessons.includes(currentLesson.id) ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" /> Completed
                                            </>
                                        ) : (
                                            <>
                                                <Circle className="h-4 w-4" /> Mark as Complete
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="text-gray-300 text-sm font-light leading-relaxed whitespace-pre-line border-t border-white/5 pt-4">
                                    {currentLesson.content || currentLesson.description || 'No content provided for this lesson.'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col justify-center items-center text-center py-20">
                            <Play className="h-12 w-12 text-gray-600 mb-4" />
                            <h3 className="text-lg font-bold text-white">Select a lesson to begin</h3>
                        </div>
                    )}
                </div>

                {/* Right Sidebar Syllabus Navigation */}
                <div className="border-l border-white/5 bg-[#0b0f19] flex flex-col">
                    <div className="p-4 border-b border-white/5 font-semibold text-sm text-white">
                        Syllabus Structure
                    </div>
                    
                    <div className="flex-grow overflow-y-auto divide-y divide-white/5">
                        {course.chapters && course.chapters.map((chapter) => (
                            <div key={chapter.id} className="p-2">
                                <div className="px-3 py-2 font-bold text-xs text-purple-400 tracking-wider uppercase">
                                    {chapter.title}
                                </div>
                                <div className="space-y-1">
                                    {chapter.lessons && chapter.lessons.map((lesson) => {
                                        const isSelected = currentLesson?.id === lesson.id;
                                        const isCompleted = completedLessons.includes(lesson.id);
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setCurrentLesson(lesson)}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs transition-all ${
                                                    isSelected
                                                        ? 'bg-purple-600/10 border border-purple-500/20 text-white'
                                                        : 'hover:bg-white/2 border border-transparent text-gray-400 hover:text-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Play className={`h-3 w-3 shrink-0 ${isSelected ? 'text-purple-400' : 'text-gray-600'}`} />
                                                    <span className="truncate font-light">{lesson.title}</span>
                                                </div>
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-gray-700 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

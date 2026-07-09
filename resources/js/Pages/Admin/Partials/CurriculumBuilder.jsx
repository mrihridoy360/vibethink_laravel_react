import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PlusCircle, GripVertical, Pencil, Trash2, Loader2, Video,
    FileText, File, PlayCircle, ChevronDown, ChevronRight,
    CheckCircle, XCircle, Plus, Eye, EyeOff, AlignLeft
} from 'lucide-react';
import LessonModal from './LessonModal';

// ── Lesson Type Icon ───────────────────────────────────────────────────────────
function LessonTypeIcon({ type }) {
    if (type === 'video')  return <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
    if (type === 'text')   return <AlignLeft className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
    return <File className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
}

// ── Lesson Row ─────────────────────────────────────────────────────────────────
function LessonRow({
    lesson,
    index,
    chapterId,
    onEdit,
    onDelete,
    draggedLessonInfo,
    dragOverLessonInfo,
    onLessonDragStart,
    onLessonDragOver,
    onLessonDragEnd,
    onLessonDragLeave,
    onLessonDrop
}) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`"${lesson.title}" লেসনটি মুছে ফেলবেন?`)) return;
        setDeleting(true);
        try {
            await onDelete(lesson.id);
        } finally {
            setDeleting(false);
        }
    };

    const durationStr = lesson.duration
        ? (() => {
            const m = Math.floor(lesson.duration / 60);
            const s = lesson.duration % 60;
            return m > 0 ? `${m}m ${s}s` : `${s}s`;
          })()
        : null;

    const isDragged = draggedLessonInfo && draggedLessonInfo.chapterId === chapterId && draggedLessonInfo.index === index;
    const isOver = dragOverLessonInfo && dragOverLessonInfo.chapterId === chapterId && dragOverLessonInfo.index === index;

    return (
        <div
            draggable
            onDragStart={(e) => onLessonDragStart(e, chapterId, index)}
            onDragOver={(e) => onLessonDragOver(e, chapterId, index)}
            onDragEnd={onLessonDragEnd}
            onDragLeave={onLessonDragLeave}
            onDrop={(e) => onLessonDrop(e, chapterId, index)}
            className={`flex items-center justify-between px-4 py-3 border-b last:border-0 border-gray-100 group transition-all duration-200 select-none ${
                isDragged ? 'opacity-40 bg-gray-100' : 'bg-gray-50/60 hover:bg-blue-50/30'
            } ${isOver ? 'border-t-2 border-t-blue-500 bg-blue-50/50' : ''}`}
        >
            <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
                <GripVertical className="h-4 w-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />
                <LessonTypeIcon type={lesson.type} />
                <span className="text-sm font-medium text-gray-700 truncate">{lesson.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                    {!lesson.video_url && lesson.type === 'video' && (
                        <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-medium">
                            No URL
                        </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${lesson.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {lesson.is_published ? 'Published' : 'Draft'}
                    </span>
                    {lesson.is_preview && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                            <PlayCircle className="h-2.5 w-2.5" /> Preview
                        </span>
                    )}
                    {durationStr && (
                        <span className="text-[10px] text-gray-400">{durationStr}</span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    onClick={() => onEdit(lesson)}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors"
                    title="এডিট"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 transition-colors disabled:opacity-40"
                    title="মুছুন"
                >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
            </div>
        </div>
    );
}

// ── Chapter Card ───────────────────────────────────────────────────────────────
function ChapterCard({
    chapter,
    index,
    onUpdate,
    onDelete,
    onAddLesson,
    onEditLesson,
    onDeleteLesson,
    draggedChapterIndex,
    dragOverChapterIndex,
    onChapterDragStart,
    onChapterDragOver,
    onChapterDragEnd,
    onChapterDragLeave,
    onChapterDrop,
    // lesson drag/drop handlers passed to child rows
    draggedLessonInfo,
    dragOverLessonInfo,
    onLessonDragStart,
    onLessonDragOver,
    onLessonDragEnd,
    onLessonDragLeave,
    onLessonDrop
}) {
    const [expanded, setExpanded]       = useState(true);
    const [editing, setEditing]         = useState(false);
    const [editTitle, setEditTitle]     = useState(chapter.title);
    const [saving, setSaving]           = useState(false);
    const [deleting, setDeleting]       = useState(false);

    const handleUpdateTitle = async () => {
        if (editTitle.trim() === chapter.title) { setEditing(false); return; }
        setSaving(true);
        try {
            await onUpdate(chapter.id, editTitle.trim());
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const count = chapter.lessons?.length || 0;
        const msg = count > 0
            ? `"${chapter.title}" চ্যাপ্টারটি এবং এর ${count}টি লেসন মুছে ফেলবেন?`
            : `"${chapter.title}" চ্যাপ্টারটি মুছে ফেলবেন?`;
        if (!confirm(msg)) return;
        setDeleting(true);
        try {
            await onDelete(chapter.id);
        } finally {
            setDeleting(false);
        }
    };

    const isDragged = draggedChapterIndex === index;
    const isOver = dragOverChapterIndex === index;

    return (
        <div
            draggable={!editing}
            onDragStart={(e) => onChapterDragStart(e, index)}
            onDragOver={(e) => onChapterDragOver(e, index)}
            onDragEnd={onChapterDragEnd}
            onDragLeave={onChapterDragLeave}
            onDrop={(e) => onChapterDrop(e, index)}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden mb-4 transition-all duration-200 select-none ${
                isDragged ? 'opacity-40 bg-gray-50 border-gray-200 scale-98' : 'border-gray-100'
            } ${isOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        >
            {/* Chapter Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50/70 border-b border-gray-100">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />
                    <button
                        type="button"
                        onClick={() => setExpanded(p => !p)}
                        className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                    >
                        {expanded
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />
                        }
                    </button>

                    {editing ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                autoFocus
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleUpdateTitle();
                                    if (e.key === 'Escape') { setEditing(false); setEditTitle(chapter.title); }
                                }}
                                className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                            />
                            <button
                                onClick={handleUpdateTitle}
                                disabled={saving}
                                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                            </button>
                            <button
                                onClick={() => { setEditing(false); setEditTitle(chapter.title); }}
                                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
                            <span className="font-bold text-sm text-gray-800 truncate">{chapter.title}</span>
                            <span className="text-xs text-gray-400 shrink-0">
                                {chapter.lessons?.length || 0} লেসন
                            </span>
                        </div>
                    )}
                </div>

                {!editing && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                            onClick={() => setEditing(true)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="এডিট"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="মুছুন"
                        >
                            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                        <button
                            onClick={() => onAddLesson(chapter.id)}
                            className="flex items-center gap-1 ml-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" /> লেসন যোগ
                        </button>
                    </div>
                )}
            </div>

            {/* Lessons */}
            {expanded && (
                <div>
                    {chapter.lessons && chapter.lessons.length > 0 ? (
                        chapter.lessons.map((lesson, lessonIndex) => (
                            <LessonRow
                                key={lesson.id}
                                lesson={lesson}
                                index={lessonIndex}
                                chapterId={chapter.id}
                                onEdit={onEditLesson}
                                onDelete={onDeleteLesson}
                                draggedLessonInfo={draggedLessonInfo}
                                dragOverLessonInfo={dragOverLessonInfo}
                                onLessonDragStart={onLessonDragStart}
                                onLessonDragOver={onLessonDragOver}
                                onLessonDragEnd={onLessonDragEnd}
                                onLessonDragLeave={onLessonDragLeave}
                                onLessonDrop={onLessonDrop}
                            />
                        ))
                    ) : (
                        <div className="py-8 text-center text-sm text-gray-400">
                            <FileText className="h-6 w-6 mx-auto mb-2 text-gray-200" />
                            এখনো কোনো লেসন নেই।{' '}
                            <button
                                onClick={() => onAddLesson(chapter.id)}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                যোগ করুন
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main CurriculumBuilder ─────────────────────────────────────────────────────
export default function CurriculumBuilder({ courseId }) {
    const [chapters, setChapters]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [addingChapter, setAddingChapter] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [creatingChapter, setCreatingChapter] = useState(false);

    // Drag & Drop States
    const [draggedChapterIndex, setDraggedChapterIndex]   = useState(null);
    const [dragOverChapterIndex, setDragOverChapterIndex] = useState(null);
    
    const [draggedLessonInfo, setDraggedLessonInfo]       = useState(null); // { chapterId, index }
    const [dragOverLessonInfo, setDragOverLessonInfo]     = useState(null); // { chapterId, index }

    // Lesson modal state
    const [lessonModal, setLessonModal] = useState(null); // null | { mode, lesson, chapterId }

    // Fetch chapters
    const fetchChapters = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/courses/${courseId}/chapters`);
            if (res.data.success) setChapters(res.data.chapters);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (courseId) fetchChapters();
    }, [courseId]);

    // ── Chapter handlers ──────────────────────────────────────
    const handleCreateChapter = async () => {
        if (!newChapterTitle.trim()) return;
        setCreatingChapter(true);
        try {
            const res = await axios.post(`/api/admin/courses/${courseId}/chapters`, {
                title: newChapterTitle.trim()
            });
            if (res.data.success) {
                setChapters(prev => [...prev, res.data.chapter]);
                setNewChapterTitle('');
                setAddingChapter(false);
            }
        } catch (e) { console.error(e); }
        finally { setCreatingChapter(false); }
    };

    const handleUpdateChapter = async (chapterId, title) => {
        const res = await axios.put(`/api/admin/chapters/${chapterId}`, { title });
        if (res.data.success) {
            setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, title } : c));
        }
    };

    const handleDeleteChapter = async (chapterId) => {
        await axios.delete(`/api/admin/chapters/${chapterId}`);
        setChapters(prev => prev.filter(c => c.id !== chapterId));
    };

    // ── Lesson handlers ───────────────────────────────────────
    const handleAddLesson = (chapterId) => {
        setLessonModal({ mode: 'create', lesson: null, chapterId });
    };

    const handleEditLesson = (lesson) => {
        const chapter = chapters.find(c => c.lessons?.some(l => l.id === lesson.id));
        setLessonModal({ mode: 'edit', lesson, chapterId: chapter?.id });
    };

    const handleDeleteLesson = async (lessonId) => {
        await axios.delete(`/api/admin/lessons/${lessonId}`);
        setChapters(prev => prev.map(c => ({
            ...c,
            lessons: c.lessons?.filter(l => l.id !== lessonId) || []
        })));
    };

    const handleLessonSaved = (savedLesson, isEdit) => {
        if (isEdit) {
            setChapters(prev => prev.map(c => ({
                ...c,
                lessons: c.lessons?.map(l => l.id === savedLesson.id ? savedLesson : l) || []
            })));
        } else {
            setChapters(prev => prev.map(c => {
                if (c.id === lessonModal.chapterId) {
                    return { ...c, lessons: [...(c.lessons || []), savedLesson] };
                }
                return c;
            }));
        }
        setLessonModal(null);
    };

    // ── Drag & Drop Chapter Handlers ──────────────────────────
    const onChapterDragStart = (e, index) => {
        if (draggedLessonInfo) {
            e.preventDefault(); // Don't drag chapter if we are dragging a lesson
            return;
        }
        e.dataTransfer.effectAllowed = 'move';
        setDraggedChapterIndex(index);
    };

    const onChapterDragOver = (e, index) => {
        e.preventDefault();
        if (draggedChapterIndex === null || draggedChapterIndex === index) return;
        setDragOverChapterIndex(index);
    };

    const onChapterDragLeave = () => {
        setDragOverChapterIndex(null);
    };

    const onChapterDragEnd = () => {
        setDraggedChapterIndex(null);
        setDragOverChapterIndex(null);
    };

    const onChapterDrop = async (e, targetIndex) => {
        e.preventDefault();
        if (draggedChapterIndex === null || draggedChapterIndex === targetIndex) return;

        const newChapters = [...chapters];
        const [draggedChapter] = newChapters.splice(draggedChapterIndex, 1);
        newChapters.splice(targetIndex, 0, draggedChapter);

        const updatedChapters = newChapters.map((c, i) => ({ ...c, sort_order: i }));
        setChapters(updatedChapters);

        setDraggedChapterIndex(null);
        setDragOverChapterIndex(null);

        // API Call
        try {
            const orderData = updatedChapters.map((c, i) => ({ id: c.id, sort_order: i }));
            await axios.post(`/api/admin/courses/${courseId}/chapters/reorder`, { order: orderData });
        } catch (err) {
            console.error('Reorder chapters error:', err);
        }
    };

    // ── Drag & Drop Lesson Handlers ───────────────────────────
    const onLessonDragStart = (e, chapterId, index) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        setDraggedLessonInfo({ chapterId, index });
    };

    const onLessonDragOver = (e, chapterId, index) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedLessonInfo) return;
        
        // Only allow reordering within the same chapter
        if (draggedLessonInfo.chapterId !== chapterId) return;
        if (draggedLessonInfo.index === index) return;

        setDragOverLessonInfo({ chapterId, index });
    };

    const onLessonDragLeave = (e) => {
        e.stopPropagation();
        setDragOverLessonInfo(null);
    };

    const onLessonDragEnd = (e) => {
        e.stopPropagation();
        setDraggedLessonInfo(null);
        setDragOverLessonInfo(null);
    };

    const onLessonDrop = async (e, targetChapterId, targetIndex) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedLessonInfo) return;

        const { chapterId: sourceChapterId, index: sourceIndex } = draggedLessonInfo;
        
        if (sourceChapterId !== targetChapterId || sourceIndex === targetIndex) {
            setDraggedLessonInfo(null);
            setDragOverLessonInfo(null);
            return;
        }

        const chapter = chapters.find(c => c.id === targetChapterId);
        if (!chapter) return;

        const newLessons = [...(chapter.lessons || [])];
        const [draggedLesson] = newLessons.splice(sourceIndex, 1);
        newLessons.splice(targetIndex, 0, draggedLesson);

        const updatedLessons = newLessons.map((l, i) => ({ ...l, sort_order: i }));

        setChapters(prev => prev.map(c => {
            if (c.id === targetChapterId) {
                return { ...c, lessons: updatedLessons };
            }
            return c;
        }));

        setDraggedLessonInfo(null);
        setDragOverLessonInfo(null);

        // API Call
        try {
            const orderData = updatedLessons.map((l, i) => ({ id: l.id, sort_order: i }));
            await axios.post(`/api/admin/chapters/${targetChapterId}/lessons/reorder`, { order: orderData });
        } catch (err) {
            console.error('Reorder lessons error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm font-medium">কারিকুলাম লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Lesson Modal */}
            {lessonModal && (
                <LessonModal
                    mode={lessonModal.mode}
                    lesson={lessonModal.lesson}
                    chapterId={lessonModal.chapterId}
                    onClose={() => setLessonModal(null)}
                    onSaved={handleLessonSaved}
                />
            )}

            {/* Header section with Stats & Add Chapter */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{chapters.length} চ্যাপ্টার</span>
                    <span>•</span>
                    <span>{chapters.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)} লেসন</span>
                </div>
                <button
                    onClick={() => setAddingChapter(!addingChapter)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs font-bold transition-all bg-white cursor-pointer"
                >
                    {addingChapter ? 'বাতিল' : <><Plus className="h-4 w-4" /> চ্যাপ্টার যোগ করুন</>}
                </button>
            </div>

            {/* Add Chapter Section */}
            {addingChapter && (
                <div className="bg-gray-50 rounded-2xl border border-gray-200/60 p-4 space-y-3">
                    <label className="block text-xs font-bold text-gray-700">চ্যাপ্টারের নাম</label>
                    <div className="flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            value={newChapterTitle}
                            onChange={e => setNewChapterTitle(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleCreateChapter();
                                if (e.key === 'Escape') { setAddingChapter(false); setNewChapterTitle(''); }
                            }}
                            placeholder="যেমন: ভূমিকা ও পরিচিতি"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                        />
                        <button
                            onClick={handleCreateChapter}
                            disabled={creatingChapter || !newChapterTitle.trim()}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60 flex items-center gap-1.5 shrink-0"
                        >
                            {creatingChapter ? <Loader2 className="h-4 w-4 animate-spin" /> : 'তৈরি করুন'}
                        </button>
                    </div>
                </div>
            )}

            {/* Chapter cards */}
            {chapters.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <FileText className="h-8 w-8 text-gray-200" />
                        </div>
                        <p className="font-semibold text-gray-600">এখনো কোনো চ্যাপ্টার নেই</p>
                        <p className="text-xs max-w-xs mx-auto mb-2">প্রথম চ্যাপ্টার তৈরি করে আপনার কোর্সের কন্টেন্ট সাজানো শুরু করুন।</p>
                        <button
                            onClick={() => setAddingChapter(true)}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                        >
                            প্রথম চ্যাপ্টার যোগ করুন
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-1">
                    {chapters.map((chapter, index) => (
                        <ChapterCard
                            key={chapter.id}
                            chapter={chapter}
                            index={index}
                            onUpdate={handleUpdateChapter}
                            onDelete={handleDeleteChapter}
                            onAddLesson={handleAddLesson}
                            onEditLesson={handleEditLesson}
                            onDeleteLesson={handleDeleteLesson}
                            draggedChapterIndex={draggedChapterIndex}
                            dragOverChapterIndex={dragOverChapterIndex}
                            onChapterDragStart={onChapterDragStart}
                            onChapterDragOver={onChapterDragOver}
                            onChapterDragEnd={onChapterDragEnd}
                            onChapterDragLeave={onChapterDragLeave}
                            onChapterDrop={onChapterDrop}
                            draggedLessonInfo={draggedLessonInfo}
                            dragOverLessonInfo={dragOverLessonInfo}
                            onLessonDragStart={onLessonDragStart}
                            onLessonDragOver={onLessonDragOver}
                            onLessonDragEnd={onLessonDragEnd}
                            onLessonDragLeave={onLessonDragLeave}
                            onLessonDrop={onLessonDrop}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

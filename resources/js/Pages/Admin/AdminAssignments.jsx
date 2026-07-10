import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, FileText, ClipboardList, ChevronLeft, ChevronRight,
    Plus, Pencil, Trash2, X, Loader2, CheckCircle, AlertCircle,
    Calendar, Check, CircleDot, HelpCircle, FileDown, Download
} from 'lucide-react';

// ── Toast Notification ────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast]);
    if (!toast) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
            <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
    );
}

// ── Create/Edit Assignment Modal ──────────────────────────────────────────────
function AssignmentModal({ mode, assignment, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [courses, setCourses]   = useState([]);
    const [lessons, setLessons]   = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [loadingLessons, setLoadingLessons]     = useState(false);

    const [form, setForm] = useState({
        lesson_id:        isEdit ? (assignment?.lesson_id || '')        : '',
        total_points:     isEdit ? (assignment?.total_points || 100)     : 100,
        due_date:         isEdit && assignment?.due_date ? new Date(assignment.due_date).toISOString().substring(0, 16) : '',
        file_requirement: isEdit ? (assignment?.file_requirement || 'required') : 'required',
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch courses on mount for creation
    useEffect(() => {
        if (!isEdit) {
            axios.get('/api/admin/courses').then(res => {
                if (res.data.success) setCourses(res.data.courses?.data || []);
            }).catch(() => {});
        }
    }, [isEdit]);

    // Fetch lessons when course changes
    useEffect(() => {
        if (selectedCourseId && !isEdit) {
            setLoadingLessons(true);
            axios.get(`/api/admin/courses/${selectedCourseId}/lessons-no-assignment`).then(res => {
                if (res.data.success) setLessons(res.data.lessons || []);
            }).catch(() => {})
              .finally(() => setLoadingLessons(false));
        } else {
            setLessons([]);
        }
    }, [selectedCourseId, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            let res;
            if (isEdit) {
                res = await axios.put(`/api/admin/assignments/${assignment.id}`, form);
            } else {
                res = await axios.post('/api/admin/assignments', form);
            }
            if (res.data.success) {
                onSaved(res.data.assignment, isEdit);
            }
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {isEdit ? 'এসাইনমেন্ট সংশোধন করুন' : 'নতুন এসাইনমেন্ট তৈরি করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEdit ? 'এসাইনমেন্টের বিবরণ আপডেট করুন' : 'লেসনের জন্য নতুন এসাইনমেন্ট তৈরি করুন'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {!isEdit && (
                        <>
                            {/* Course Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">কোর্স নির্বাচন করুন</label>
                                <select
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="">কোর্স সিলেক্ট করুন...</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Lesson Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">লেসন নির্বাচন করুন <span className="text-red-500">*</span></label>
                                <select
                                    disabled={loadingLessons || !selectedCourseId}
                                    value={form.lesson_id}
                                    onChange={e => setForm(p => ({ ...p, lesson_id: e.target.value }))}
                                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all ${errors.lesson_id ? 'border-red-300' : 'border-gray-200'}`}
                                >
                                    <option value="">
                                        {loadingLessons ? 'লেসন লোড হচ্ছে...' : !selectedCourseId ? 'আগে কোর্স নির্বাচন করুন...' : lessons.length === 0 ? 'এই কোর্সের সব লেসনে এসাইনমেন্ট আছে' : 'লেসন সিলেক্ট করুন...'}
                                    </option>
                                    {lessons.map(l => (
                                        <option key={l.id} value={l.id}>{l.title}</option>
                                    ))}
                                </select>
                                {errors.lesson_id && <p className="text-xs text-red-500 mt-1">{errors.lesson_id[0]}</p>}
                            </div>
                        </>
                    )}

                    {/* Total Points */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">মোট নম্বর (Total Points) <span className="text-red-500">*</span></label>
                        <input
                            type="number" required min="1"
                            value={form.total_points}
                            onChange={e => setForm(p => ({ ...p, total_points: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.total_points ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        />
                        {errors.total_points && <p className="text-xs text-red-500 mt-1">{errors.total_points[0]}</p>}
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gray-400" />জমাদানের শেষ তারিখ (Due Date)</label>
                        <input
                            type="datetime-local"
                            value={form.due_date}
                            onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                    </div>

                    {/* File Requirement */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফাইল সাবমিশন রিকোয়ারমেন্ট</label>
                        <select
                            value={form.file_requirement}
                            onChange={e => setForm(p => ({ ...p, file_requirement: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="required">আবশ্যিক (Required)</option>
                            <option value="optional">ঐচ্ছিক (Optional)</option>
                            <option value="none">প্রয়োজন নেই (None)</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2"
                        >
                            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> সেভ হচ্ছে...</> : isEdit ? 'আপডেট করুন' : 'তৈরি করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function AssignmentDeleteModal({ assignment, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await axios.delete(`/api/admin/assignments/${assignment.id}`);
            if (res.data.success) {
                onDeleted(assignment.id);
            }
        } catch (e) { console.error(e); }
        finally { setDeleting(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">এসাইনমেন্ট মুছে ফেলবেন?</h3>
                <p className="text-sm text-gray-500 mb-1">
                    লেসন <span className="font-semibold text-gray-800">"{assignment.lesson?.title}"</span> এর এসাইনমেন্ট মুছে ফেলা হবে।
                </p>
                <p className="text-xs text-red-500 mb-6">শিক্ষার্থীদের জমা দেওয়া সমস্ত সাবমিশনও এর সাথে মুছে যাবে।</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        বাতিল
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {deleting ? <><Loader2 className="h-4 w-4 animate-spin" /> মুছছে...</> : 'হ্যাঁ, মুছুন'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Grade Submission Modal ────────────────────────────────────────────────────
function GradeModal({ submission, onClose, onGraded }) {
    const [form, setForm] = useState({
        grade:    submission?.grade != null ? submission.grade : '',
        feedback: submission?.feedback || '',
        status:   submission?.status === 'pending' || submission?.status === 'submitted' ? 'graded' : submission?.status,
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        // Validate max score
        const total = submission.assignment?.total_points || 100;
        if (parseInt(form.grade) > total) {
            setErrors({ grade: [`নম্বর অবশ্যই ${total} এর কম বা সমান হতে হবে।`] });
            setSaving(false);
            return;
        }

        try {
            const res = await axios.post(`/api/admin/submissions/${submission.id}/grade`, form);
            if (res.data.success) {
                onGraded(res.data.submission);
            }
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
        } finally {
            setSaving(false);
        }
    };

    const maxPoints = submission.assignment?.total_points || 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">এসাইনমেন্ট মূল্যায়ন</h2>
                        <p className="text-xs text-gray-400 mt-0.5">শিক্ষার্থীর জমা দেওয়া এসাইনমেন্ট রিভিউ করুন</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Student Info */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">শিক্ষার্থী</p>
                        <p className="text-sm font-bold text-gray-800">{submission.user?.name}</p>
                        <p className="text-xs text-gray-500">{submission.user?.email}</p>
                    </div>

                    {/* Submission Attachment */}
                    {submission.file_path && (
                        <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-xs text-blue-600 font-bold">সংযুক্ত ফাইল</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{submission.file_path.split('/').pop()}</p>
                            </div>
                            <a
                                href={submission.file_path.startsWith('http') ? submission.file_path : `/storage/${submission.file_path}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
                            >
                                <Download className="h-3.5 w-3.5" /> ডাউনলোড
                            </a>
                        </div>
                    )}

                    {/* Student Notes */}
                    {submission.notes && (
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-1">শিক্ষার্থীর নোট:</p>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 max-h-24 overflow-y-auto whitespace-pre-line">
                                {submission.notes}
                            </div>
                        </div>
                    )}

                    {/* Grade Score input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">প্রাপ্ত নম্বর (Score) <span className="text-gray-400 text-xs">/ {maxPoints}</span> <span className="text-red-500">*</span></label>
                        <input
                            type="number" required min="0" max={maxPoints}
                            value={form.grade}
                            onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.grade ? 'border-red-300' : 'border-gray-200'}`}
                            placeholder={`যেমন: ${maxPoints - 10}`}
                        />
                        {errors.grade && <p className="text-xs text-red-500 mt-1">{errors.grade[0]}</p>}
                    </div>

                    {/* Feedback */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফিডব্যাক / মন্তব্য</label>
                        <textarea
                            rows={3}
                            value={form.feedback}
                            onChange={e => setForm(p => ({ ...p, feedback: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="ফিডব্যাক বা সংশোধন করার নির্দেশনাবলী দিন..."
                        />
                    </div>

                    {/* Status Toggle */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্ট্যাটাস</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="graded">গ্রেড সম্পন্ন (Graded)</option>
                            <option value="passed">উত্তীর্ণ (Passed)</option>
                            <option value="rejected">বাতিল (Rejected)</option>
                            <option value="returned">ফেরত পাঠানো হয়েছে (Returned)</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
                        >
                            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> গ্রেড হচ্ছে...</> : 'গ্রেড সাবমিট করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main AdminAssignments Component ───────────────────────────────────────────
export default function AdminAssignments() {
    const [subTab, setSubTab] = useState('list'); // 'list' | 'submissions'

    // ── Lists State
    const [assignments, setAssignments]   = useState([]);
    const [submissions, setSubmissions]   = useState([]);
    const [meta, setMeta]                 = useState(null);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState('');
    const [page, setPage]                 = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    // Modals
    const [modalState, setModalState]     = useState(null); // null | { mode: 'create' | 'edit', assignment }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [gradeTarget, setGradeTarget]   = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }) });
            const res = await axios.get(`/api/admin/assignments?${params}`);
            if (res.data.success) {
                setAssignments(res.data.assignments.data || []);
                setMeta(res.data.assignments);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
            });
            const res = await axios.get(`/api/admin/submissions?${params}`);
            if (res.data.success) {
                setSubmissions(res.data.submissions.data || []);
                setMeta(res.data.submissions);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        setPage(1);
        setSearch('');
    }, [subTab]);

    useEffect(() => {
        if (subTab === 'list') fetchAssignments();
        else fetchSubmissions();
    }, [subTab, search, page, statusFilter]);

    const handleSaved = (savedAssignment, isEdit) => {
        if (isEdit) {
            setAssignments(prev => prev.map(a => a.id === savedAssignment.id ? savedAssignment : a));
            showToast('এসাইনমেন্ট সফলভাবে আপডেট করা হয়েছে।');
        } else {
            setAssignments(prev => [savedAssignment, ...prev]);
            showToast('নতুন এসাইনমেন্ট তৈরি সম্পন্ন হয়েছে।');
        }
        setModalState(null);
    };

    const handleDeleted = (id) => {
        setAssignments(prev => prev.filter(a => a.id !== id));
        showToast('এসাইনমেন্ট মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
    };

    const handleGraded = (gradedSubmission) => {
        setSubmissions(prev => prev.map(s => s.id === gradedSubmission.id ? gradedSubmission : s));
        showToast('সাবমিশনটি সফলভাবে গ্রেড করা হয়েছে।');
        setGradeTarget(null);
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* modals */}
            {modalState && (
                <AssignmentModal
                    mode={modalState.mode}
                    assignment={modalState.assignment}
                    onClose={() => setModalState(null)}
                    onSaved={handleSaved}
                />
            )}

            {deleteTarget && (
                <AssignmentDeleteModal
                    assignment={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}

            {gradeTarget && (
                <GradeModal
                    submission={gradeTarget}
                    onClose={() => setGradeTarget(null)}
                    onGraded={handleGraded}
                />
            )}

            {/* Header / SubTabs bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 bg-white border border-gray-100 p-1.5 rounded-2xl w-fit shrink-0">
                    <button
                        onClick={() => setSubTab('list')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${subTab === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <ClipboardList className="h-4 w-4" /> এসাইনমেন্ট তালিকা
                    </button>
                    <button
                        onClick={() => setSubTab('submissions')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${subTab === 'submissions' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <FileText className="h-4 w-4" /> সাবমিশন ও গ্রেডিং
                    </button>
                </div>

                {/* Filter and Add button */}
                <div className="flex items-center gap-2 justify-end flex-wrap sm:flex-nowrap">
                    {subTab === 'submissions' && (
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 cursor-pointer"
                        >
                            <option value="">সব স্ট্যাটাস</option>
                            <option value="pending">রিভিউ পেন্ডিং (Pending)</option>
                            <option value="graded">গ্রেড সম্পন্ন (Graded)</option>
                            <option value="passed">উত্তীর্ণ (Passed)</option>
                            <option value="rejected">বাতিল (Rejected)</option>
                            <option value="returned">ফেরত পাঠানো হয়েছে (Returned)</option>
                        </select>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            placeholder={subTab === 'list' ? "কোর্স বা লেসন খুঁজুন..." : "শিক্ষার্থীর নাম..."}
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-sm px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-44"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>

                    {subTab === 'list' && (
                        <button
                            onClick={() => setModalState({ mode: 'create', assignment: null })}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer shrink-0"
                        >
                            <Plus className="h-4 w-4" /> নতুন এসাইনমেন্ট
                        </button>
                    )}
                </div>
            </div>

            {/* List Tab Panel */}
            {subTab === 'list' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">লেসন / কোর্স</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">মোট নম্বর</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">ফাইল রিকোয়ারমেন্ট</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs font-mono">জমাদানের শেষ তারিখ</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">সাবমিশন সংখ্যা</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            {[1,2,3,4,5,6].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                                        </tr>
                                    ))
                                ) : assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <ClipboardList className="h-8 w-8 text-gray-200" />
                                                <p className="font-semibold text-gray-600">কোনো এসাইনমেন্ট পাওয়া যায়নি</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map(a => (
                                        <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                                            {/* Lesson / Course */}
                                            <td className="px-5 py-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{a.lesson?.title}</p>
                                                    <p className="text-xs text-gray-400">{a.lesson?.chapter?.course?.title || '—'}</p>
                                                </div>
                                            </td>
                                            {/* Total Points */}
                                            <td className="px-4 py-3 text-center text-gray-700 font-bold">{a.total_points}</td>
                                            {/* File requirement */}
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    a.file_requirement === 'required' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    a.file_requirement === 'optional' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {a.file_requirement === 'required' ? 'আবশ্যিক' : a.file_requirement === 'optional' ? 'ঐচ্ছিক' : 'প্রয়োজন নেই'}
                                                </span>
                                            </td>
                                            {/* Due Date */}
                                            <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">
                                                {a.due_date ? new Date(a.due_date).toLocaleString('bn-BD') : 'শেষ সময় নেই'}
                                            </td>
                                            {/* Submissions count */}
                                            <td className="px-4 py-3 text-center font-semibold text-gray-700">
                                                {a.submissions_count} টি সাবমিট
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setModalState({ mode: 'edit', assignment: a })}
                                                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                                                        title="এডিট"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(a)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                                        title="মুছুন"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Submissions & Grading Tab Panel */}
            {subTab === 'submissions' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">শিক্ষার্থী</th>
                                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">এসাইনমেন্ট (লেসন)</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">প্রাপ্ত নম্বর</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">স্ট্যাটাস</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell text-xs">জমাদানের সময়</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            {[1,2,3,4,5,6].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                                        </tr>
                                    ))
                                ) : submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-8 w-8 text-gray-200" />
                                                <p className="font-semibold text-gray-600">কোনো সাবমিশন রেকর্ড নেই</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                                            {/* Student */}
                                            <td className="px-5 py-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{s.user?.name}</p>
                                                    <p className="text-xs text-gray-400">{s.user?.email}</p>
                                                </div>
                                            </td>
                                            {/* Assignment (Lesson) */}
                                            <td className="px-4 py-3">
                                                <div className="max-w-[200px] truncate">
                                                    <p className="font-medium text-gray-800 text-xs truncate" title={s.assignment?.lesson?.title}>{s.assignment?.lesson?.title}</p>
                                                    <p className="text-[10px] text-gray-400 truncate" title={s.assignment?.lesson?.chapter?.course?.title}>{s.assignment?.lesson?.chapter?.course?.title}</p>
                                                </div>
                                            </td>
                                            {/* Grade score */}
                                            <td className="px-4 py-3 text-center font-bold text-gray-700">
                                                {s.grade != null ? `${s.grade} / ${s.assignment?.total_points}` : `— / ${s.assignment?.total_points}`}
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    s.status === 'passed' ? 'bg-green-100 text-green-700' :
                                                    s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    s.status === 'returned' ? 'bg-amber-100 text-amber-700' :
                                                    s.status === 'graded' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {s.status === 'passed' ? 'উত্তীর্ণ' :
                                                     s.status === 'rejected' ? 'বাতিল' :
                                                     s.status === 'returned' ? 'ফেরত পাঠানো' :
                                                     s.status === 'graded' ? 'গ্রেড সম্পন্ন' : 'রিভিউ পেন্ডিং'}
                                                </span>
                                            </td>
                                            {/* Submitted Time */}
                                            <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-400 font-mono text-xs">
                                                {new Date(s.created_at).toLocaleString('bn-BD')}
                                            </td>
                                            {/* Action */}
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setGradeTarget(s)}
                                                    className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                                                >
                                                    মূল্যায়ন করুন
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
                <div className="px-5 py-3 bg-white border border-gray-100 rounded-2xl flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        মোট {meta.total}টি রেকর্ড • পৃষ্ঠা {meta.current_page}/{meta.last_page}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={meta.current_page === 1}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                            disabled={meta.current_page === meta.last_page}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

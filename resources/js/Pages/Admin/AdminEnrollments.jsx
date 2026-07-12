import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, GraduationCap, ChevronLeft, ChevronRight, CheckCircle2,
    Clock, Plus, X, Loader2, CheckCircle, AlertCircle, BookOpen, User, Ban
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

// ── Manual Enrollment Modal ───────────────────────────────────────────────────
function ManualEnrollmentModal({ onClose, onSaved }) {
    const [users, setUsers]       = useState([]);
    const [courses, setCourses]   = useState([]);
    const [loadingResources, setLoadingResources] = useState(true);

    const [selectedUserId, setSelectedUserId]     = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [saving, setSaving]                     = useState(false);
    const [errors, setErrors]                     = useState({});
    const [errorMsg, setErrorMsg]                 = useState('');
    const [studentSearch, setStudentSearch]       = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await axios.get('/api/admin/enrollments/resources');
                if (res.data.success) {
                    setUsers(res.data.users || []);
                    setCourses(res.data.courses || []);
                }
            } catch (e) { console.error(e); }
            finally { setLoadingResources(false); }
        };
        fetchResources();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setErrorMsg('');

        if (!selectedUserId) { setErrors({ user_id: ['শিক্ষার্থী নির্বাচন করুন'] }); setSaving(false); return; }
        if (!selectedCourseId) { setErrors({ course_id: ['কোর্স নির্বাচন করুন'] }); setSaving(false); return; }

        try {
            const res = await axios.post('/api/admin/enrollments', {
                user_id: selectedUserId,
                course_id: selectedCourseId,
            });
            if (res.data.success) {
                onSaved(res.data.enrollment);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'ইনরোলমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।');
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(studentSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">ম্যানুয়াল এনরোলমেন্ট</h2>
                        <p className="text-xs text-gray-400 mt-0.5">শিক্ষার্থীকে সরাসরি কোর্সে যুক্ত করুন</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loadingResources ? (
                    <div className="flex items-center justify-center py-20 flex-grow">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
                            <p className="text-xs text-gray-400 font-medium">তথ্য লোড হচ্ছে...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                        {/* Student selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-gray-400" /> শিক্ষার্থী নির্বাচন করুন <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="শিক্ষার্থীর নাম বা ইমেইল দিয়ে খুঁজুন..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 transition-all"
                                />
                                <select
                                    value={selectedUserId}
                                    onChange={e => setSelectedUserId(e.target.value)}
                                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all ${errors.user_id ? 'border-red-300' : 'border-gray-200'}`}
                                >
                                    <option value="">শিক্ষার্থী সিলেক্ট করুন ({filteredUsers.length} জন পাওয়া গেছে)...</option>
                                    {filteredUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            {errors.user_id && <p className="text-xs text-red-500 mt-1">{errors.user_id[0]}</p>}
                        </div>

                        {/* Course selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 text-gray-400" /> কোর্স নির্বাচন করুন <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCourseId}
                                onChange={e => setSelectedCourseId(e.target.value)}
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all ${errors.course_id ? 'border-red-300' : 'border-gray-200'}`}
                            >
                                <option value="">কোর্স সিলেক্ট করুন...</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            {errors.course_id && <p className="text-xs text-red-500 mt-1">{errors.course_id[0]}</p>}
                        </div>

                        {errorMsg && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                বাতিল
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
                            >
                                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> এনরোল হচ্ছে...</> : 'এনরোল করুন'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// ── Cancel Enrollment Modal ─────────────────────────────────────────────────
function CancelEnrollmentModal({ enrollment, onClose, onConfirm, saving }) {
    if (!enrollment) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">ইনরোলমেন্ট বাতিল করুন</h2>
                        <p className="text-xs text-gray-400 mt-0.5">শিক্ষার্থীর কোর্সে এনরোলমেন্ট বাতিল হয়ে যাবে</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                            {enrollment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{enrollment.user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{enrollment.course?.title || '—'}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        এই এনরোলমেন্টটি সম্পূর্ণরূপে মুছে ফেলা হবে এবং শিক্ষার্থীর প্রগ্রেস হারিয়ে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        বাতিল
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
                    >
                        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> বাতিল হচ্ছে...</> : <><Ban className="h-4 w-4" /> এনরোলমেন্ট বাতিল করুন</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main AdminEnrollments ─────────────────────────────────────────────────────
export default function AdminEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const handleCancelConfirm = async () => {
        if (!cancelTarget) return;
        setCancelling(true);
        try {
            const res = await axios.delete(`/api/admin/enrollments/${cancelTarget.id}`);
            if (res.data.success) {
                setEnrollments(prev => prev.filter(e => e.id !== cancelTarget.id));
                showToast(res.data.message || 'ইনরোলমেন্টটি সফলভাবে বাতিল করা হয়েছে।');
                setCancelTarget(null);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'ইনরোলমেন্ট বাতিল করতে সমস্যা হয়েছে।', 'error');
        } finally {
            setCancelling(false);
        }
    };

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }) });
            const res = await axios.get(`/api/admin/enrollments?${params}`);
            if (res.data.success) {
                setEnrollments(res.data.enrollments.data || []);
                setMeta(res.data.enrollments);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEnrollments(); }, [search, page]);

    const handleEnrollSaved = (newEnrollment) => {
        setEnrollments(prev => [newEnrollment, ...prev]);
        showToast('শিক্ষার্থীকে সফলভাবে ইনরোল করা হয়েছে।');
        setIsEnrollModalOpen(false);
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Manual Enroll Modal */}
            {isEnrollModalOpen && (
                <ManualEnrollmentModal
                    onClose={() => setIsEnrollModalOpen(false)}
                    onSaved={handleEnrollSaved}
                />
            )}

            {/* Cancel Enrollment Modal */}
            {cancelTarget && (
                <CancelEnrollmentModal
                    enrollment={cancelTarget}
                    onClose={() => setCancelTarget(null)}
                    onConfirm={handleCancelConfirm}
                    saving={cancelling}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">এনরোলমেন্ট</h2>
                    <p className="text-sm text-gray-400 mt-0.5">সব এনরোলমেন্ট রেকর্ড</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="শিক্ষার্থী খুঁজুন..." value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-sm px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-48" />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {/* Add Button */}
                    <button
                        onClick={() => setIsEnrollModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> ম্যানুয়াল এনরোলমেন্ট
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">শিক্ষার্থী</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell text-xs">কোর্স</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অগ্রগতি</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">স্ট্যাটাস</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অ্যাকশন</th>
                                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell text-xs">তারিখ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? Array(5).fill(0).map((_, i) => (
                                <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                            )) : enrollments.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400">কোনো এনরোলমেন্ট পাওয়া যায়নি</td></tr>
                            ) : enrollments.map(e => {
                                const progress = parseInt(e.progress || 0);
                                return (
                                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {e.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{e.user?.name}</p>
                                                    <p className="text-xs text-gray-400">{e.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="text-gray-700 truncate max-w-[180px]">{e.course?.title || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                                                </div>
                                                <span className="font-bold text-gray-500">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {progress === 100 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <CheckCircle2 className="h-3 w-3" /> সম্পন্ন
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                                    <Clock className="h-3 w-3" /> চলমান
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setCancelTarget(e)}
                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                                title="ইনরোলমেন্ট ক্যান্সেল করুন"
                                            >
                                                <Ban className="h-4 w-4" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">
                                            {new Date(e.created_at).toLocaleDateString('bn-BD')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {meta && meta.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">মোট {meta.total}টি • পৃষ্ঠা {meta.current_page}/{meta.last_page}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.current_page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.current_page === meta.last_page} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"><ChevronRight className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

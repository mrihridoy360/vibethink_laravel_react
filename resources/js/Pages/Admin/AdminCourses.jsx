import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BookOpen, Search, Eye, EyeOff, Users, ChevronLeft, ChevronRight,
    Plus, Pencil, Trash2, X, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast]);
    if (!toast) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
            <button onClick={onClose}><X className="h-3.5 w-3.5 ml-1 opacity-70" /></button>
        </div>
    );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ course, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await axios.delete(`/api/admin/courses/${course.id}`);
            if (res.data.success) onDeleted(course.id);
        } catch (e) { console.error(e); }
        finally { setDeleting(false); }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">কোর্স মুছে ফেলুন?</h3>
                <p className="text-sm text-gray-500 mb-1">
                    <span className="font-semibold text-gray-800">"{course.title}"</span> কোর্সটি স্থায়ীভাবে মুছে যাবে।
                </p>
                <p className="text-xs text-red-500 mb-6">এই কাজটি পূর্বাবস্থায় ফেরানো সম্ভব নয়।</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
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

// ── Main AdminCourses ─────────────────────────────────────────────────────────
export default function AdminCourses() {
    const navigate = useNavigate();

    const [courses, setCourses]           = useState([]);
    const [meta, setMeta]                 = useState(null);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]                 = useState(1);
    const [toggling, setToggling]         = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
            });
            const res = await axios.get(`/api/admin/courses?${params}`);
            if (res.data.success) {
                setCourses(res.data.courses.data || []);
                setMeta(res.data.courses);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); }, [search, statusFilter, page]);

    const handleToggle = async (courseId) => {
        setToggling(courseId);
        try {
            const res = await axios.post(`/api/admin/courses/${courseId}/toggle-publish`);
            if (res.data.success) {
                setCourses(prev => prev.map(c =>
                    c.id === courseId ? { ...c, is_published: res.data.is_published } : c
                ));
                showToast(res.data.message);
            }
        } catch (e) { console.error(e); }
        finally { setToggling(null); }
    };

    const handleDeleted = (courseId) => {
        setCourses(prev => prev.filter(c => c.id !== courseId));
        showToast('কোর্স মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteModal
                    course={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">কোর্সসমূহ</h2>
                    <p className="text-sm text-gray-400 mt-0.5">সব কোর্স পরিচালনা করুন</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700"
                    >
                        <option value="">সব কোর্স</option>
                        <option value="published">প্রকাশিত</option>
                        <option value="draft">ড্রাফট</option>
                    </select>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="কোর্স খুঁজুন..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-sm px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-44"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>

                    {/* Add Button → navigate to create page */}
                    <button
                        onClick={() => navigate('/admin/courses/create')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200"
                    >
                        <Plus className="h-4 w-4" /> নতুন কোর্স
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">কোর্স</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell text-xs">ইন্সট্রাক্টর</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell text-xs">এনরোলমেন্ট</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell text-xs">চ্যাপ্টার</th>
                                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell text-xs">মূল্য</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">স্ট্যাটাস</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        {[1,2,3,4,5,6,7].map(j => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <BookOpen className="h-10 w-10 text-gray-200" />
                                            <p className="font-medium">কোনো কোর্স পাওয়া যায়নি</p>
                                            <button
                                                onClick={() => navigate('/admin/courses/create')}
                                                className="mt-1 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                            >
                                                প্রথম কোর্স তৈরি করুন
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                courses.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50/70 transition-colors">
                                        {/* Course */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <BookOpen className="h-3.5 w-3.5 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate max-w-[180px] text-sm">{course.title}</p>
                                                    <p className="text-xs text-gray-400">{course.language || 'Bengali'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Instructor */}
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-sm">{course.user?.name || '-'}</td>
                                        {/* Enrollments */}
                                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                                            <span className="flex items-center justify-center gap-1 text-gray-600 text-sm">
                                                <Users className="h-3.5 w-3.5" /> {course.enrollments_count}
                                            </span>
                                        </td>
                                        {/* Chapters */}
                                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600 text-sm">{course.chapters_count}</td>
                                        {/* Price */}
                                        <td className="px-4 py-3 text-right hidden md:table-cell">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {parseFloat(course.price) === 0 ? 'ফ্রি' : `৳${parseFloat(course.price).toFixed(0)}`}
                                            </span>
                                            {parseFloat(course.discount_price) > 0 && (
                                                <span className="block text-xs text-gray-400 line-through">
                                                    ৳{parseFloat(course.discount_price).toFixed(0)}
                                                </span>
                                            )}
                                        </td>
                                        {/* Publish Toggle */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggle(course.id)}
                                                disabled={toggling === course.id}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                                                    course.is_published
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                            >
                                                {toggling === course.id ? (
                                                    <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : course.is_published ? (
                                                    <><Eye className="h-3 w-3" /> প্রকাশিত</>
                                                ) : (
                                                    <><EyeOff className="h-3 w-3" /> ড্রাফট</>
                                                )}
                                            </button>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                    title="এডিট করুন"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(course)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            মোট {meta.total}টি কোর্স • পৃষ্ঠা {meta.current_page}/{meta.last_page}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.current_page === 1}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={meta.current_page === meta.last_page}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

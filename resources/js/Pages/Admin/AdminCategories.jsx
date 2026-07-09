import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Tag, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
    Loader2, CheckCircle, AlertCircle, FileText, Globe
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

// ── Category Create/Edit Modal ────────────────────────────────────────────────
function CategoryModal({ mode, category, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        name:        isEdit ? (category?.name || '')        : '',
        description: isEdit ? (category?.description || '') : '',
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            let res;
            if (isEdit) {
                res = await axios.put(`/api/admin/categories/${category.id}`, form);
            } else {
                res = await axios.post('/api/admin/categories', form);
            }
            if (res.data.success) {
                onSaved(res.data.category, isEdit);
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
                            {isEdit ? 'ক্যাটাগরি সংশোধন করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEdit ? 'ক্যাটাগরির নাম ও বিবরণ এডিট করুন' : 'কোর্সের জন্য নতুন ক্যাটাগরি তৈরি করুন'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্যাটাগরির নাম <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="যেমন: Web Development, Graphics Design..."
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিবরণ</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="ক্যাটাগরি সম্পর্কে সংক্ষিপ্ত বিবরণ দিন (ঐচ্ছিক)..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm animate-pulseFast"
                        >
                            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> সেভ হচ্ছে...</> : isEdit ? 'আপডেট করুন' : 'যোগ করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Category Delete Confirm Modal ──────────────────────────────────────────────
function CategoryDeleteModal({ category, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await axios.delete(`/api/admin/categories/${category.id}`);
            if (res.data.success) {
                onDeleted(category.id);
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
                <h3 className="text-base font-bold text-gray-900 mb-2">ক্যাটাগরি মুছে ফেলবেন?</h3>
                <p className="text-sm text-gray-500 mb-1">
                    <span className="font-semibold text-gray-800">"{category.name}"</span> ক্যাটাগরি টি চিরতরে মুছে যাবে।
                </p>
                <p className="text-xs text-red-500 mb-6">এর অধীনে থাকা কোর্সগুলোর ক্যাটাগরি আন-অ্যাসোসিয়েট হয়ে যাবে।</p>
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

// ── Main AdminCategories Component ────────────────────────────────────────────
export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [meta, setMeta]             = useState(null);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [page, setPage]             = useState(1);

    // Modals & Toast
    const [modalState, setModalState]     = useState(null); // null | { mode: 'create' | 'edit', category }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }) });
            const res = await axios.get(`/api/admin/categories/list?${params}`);
            if (res.data.success) {
                setCategories(res.data.categories.data || []);
                setMeta(res.data.categories);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, [search, page]);

    const handleSaved = (savedCategory, isEdit) => {
        if (isEdit) {
            setCategories(prev => prev.map(c => c.id === savedCategory.id ? savedCategory : c));
            showToast('ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে।');
        } else {
            setCategories(prev => [savedCategory, ...prev]);
            showToast('নতুন ক্যাটাগরি তৈরি সম্পন্ন হয়েছে।');
        }
        setModalState(null);
    };

    const handleDeleted = (catId) => {
        setCategories(prev => prev.filter(c => c.id !== catId));
        showToast('ক্যাটাগরি মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Create/Edit Modal */}
            {modalState && (
                <CategoryModal
                    mode={modalState.mode}
                    category={modalState.category}
                    onClose={() => setModalState(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <CategoryDeleteModal
                    category={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">ক্যাটাগরি ম্যানেজমেন্ট</h2>
                    <p className="text-sm text-gray-400 mt-0.5">সব ক্যাটাগরি সমুহ পরিচালনা করুন</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="ক্যাটাগরি খুঁজুন..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-sm px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-48"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {/* Add Category Button */}
                    <button
                        onClick={() => setModalState({ mode: 'create', category: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> নতুন ক্যাটাগরি
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">নাম</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">স্লাগ (Slug)</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">কোর্স সংখ্যা</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell text-xs">বিবরণ</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell text-xs">তৈরি হয়েছে</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        {[1,2,3,4,5,6].map(j => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Tag className="h-8 w-8 text-gray-200" />
                                            <p className="font-semibold text-gray-600">কোনো ক্যাটাগরি পাওয়া যায়নি</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                categories.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                                        {/* Name */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                                    <Tag className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-gray-900">{c.name}</span>
                                            </div>
                                        </td>
                                        {/* Slug */}
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs select-all">{c.slug}</td>
                                        {/* Courses Count */}
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                                                {c.courses_count} টি কোর্স
                                            </span>
                                        </td>
                                        {/* Description */}
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-400 truncate max-w-[200px]" title={c.description}>
                                            {c.description || '—'}
                                        </td>
                                        {/* Created At */}
                                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-400">
                                            {new Date(c.created_at).toLocaleDateString('bn-BD')}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setModalState({ mode: 'edit', category: c })}
                                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                                                    title="এডিট করুন"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                                    title="মুছে ফেলুন"
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
                            মোট {meta.total}টি ক্যাটাগরি • পৃষ্ঠা {meta.current_page}/{meta.last_page}
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
        </div>
    );
}

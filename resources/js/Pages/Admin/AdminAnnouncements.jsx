import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Megaphone, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
    Loader2, CheckCircle, AlertCircle, Calendar, Pin, ToggleLeft, ToggleRight,
    Info, AlertTriangle, CheckSquare, ShieldAlert, GraduationCap, RefreshCw
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
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-50'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
            <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
    );
}

// ── Announcement Create/Edit Modal ────────────────────────────────────────────
function AnnouncementModal({ mode, announcement, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        title:      isEdit ? (announcement?.title || '')      : '',
        content:    isEdit ? (announcement?.content || '')    : '',
        type:       isEdit ? (announcement?.type || 'info')   : 'info',
        priority:   isEdit ? (announcement?.priority || 'normal') : 'normal',
        course_id:  isEdit ? (announcement?.course_id || '')  : '',
        is_active:  isEdit ? !!announcement?.is_active        : true,
        is_pinned:  isEdit ? !!announcement?.is_pinned        : false,
        expires_at: isEdit && announcement?.expires_at ? new Date(announcement.expires_at).toISOString().substring(0, 16) : '',
    });

    const [courses, setCourses] = useState([]);
    const [saving, setSaving]   = useState(false);
    const [errors, setErrors]   = useState({});

    useEffect(() => {
        // Fetch courses for selector
        axios.get('/api/admin/announcements/resources')
            .then(res => {
                if (res.data.success) {
                    setCourses(res.data.courses || []);
                }
            })
            .catch(e => console.error(e));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const payload = {
            ...form,
            course_id: form.course_id === '' ? null : parseInt(form.course_id),
            expires_at: form.expires_at === '' ? null : form.expires_at,
            is_active: form.is_active ? 1 : 0,
            is_pinned: form.is_pinned ? 1 : 0,
        };

        try {
            let res;
            if (isEdit) {
                res = await axios.put(`/api/admin/announcements/${announcement.id}`, payload);
            } else {
                res = await axios.post('/api/admin/announcements', payload);
            }
            if (res.data.success) {
                onSaved(res.data.announcement, isEdit);
            }
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {isEdit ? 'ঘোষণা সংশোধন করুন' : 'নতুন ঘোষণা প্রকাশ করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            শিক্ষার্থীদের জন্য গুরুত্বপূর্ণ নোটিশ সেট করুন
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ঘোষণার শিরোনাম <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="যেমন: ক্লাস সাময়িকভাবে বন্ধ বা পরীক্ষার রুটিন..."
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>}
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ঘোষণার বিবরণ (Content) <span className="text-red-500">*</span></label>
                        <textarea
                            rows={4} required
                            value={form.content}
                            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.content ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="বিস্তারিত ঘোষণা বা নোটিশটি এখানে লিখুন..."
                        />
                        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content[0]}</p>}
                    </div>

                    {/* Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ঘোষণার ধরণ (Type)</label>
                            <select
                                value={form.type}
                                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                <option value="info">তথ্যমূলক (Info - Blue)</option>
                                <option value="warning">সতর্কতামূলক (Warning - Yellow)</option>
                                <option value="success">সফলতা (Success - Green)</option>
                                <option value="danger">জরুরি সতর্কতা (Danger - Red)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">অগ্রাধিকার (Priority)</label>
                            <select
                                value={form.priority}
                                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                <option value="low">কম (Low)</option>
                                <option value="normal">সাধারণ (Normal)</option>
                                <option value="high">উচ্চ (High)</option>
                                <option value="urgent">অতি জরুরী (Urgent)</option>
                            </select>
                        </div>
                    </div>

                    {/* Target Course dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-gray-400" />টার্গেট কোর্স (ঐচ্ছিক)</label>
                        <select
                            value={form.course_id}
                            onChange={e => setForm(p => ({ ...p, course_id: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="">সকল শিক্ষার্থীর জন্য (Global Announcement)</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1">কোর্স সিলেক্ট না করলে এটি সারা সাইটে দেখাবে</p>
                    </div>

                    {/* Expiration date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400" />মেয়াদ শেষ (ঐচ্ছিক)</label>
                        <input
                            type="datetime-local"
                            value={form.expires_at}
                            onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                        {/* Pinned toggle */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50">
                            <div>
                                <span className="text-xs font-bold text-gray-750 flex items-center gap-1"><Pin className="h-3 w-3" /> উপরে পিন করুন</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_pinned: !p.is_pinned }))}
                                className="text-gray-400 hover:text-blue-650 transition-colors"
                            >
                                {form.is_pinned ? (
                                    <ToggleRight className="h-7 w-7 text-blue-600" />
                                ) : (
                                    <ToggleLeft className="h-7 w-7 text-gray-300" />
                                )}
                            </button>
                        </div>

                        {/* Active toggle */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50">
                            <div>
                                <span className="text-xs font-bold text-gray-750">পাবলিশড স্ট্যাটাস</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                                className="text-gray-400 hover:text-blue-650 transition-colors"
                            >
                                {form.is_active ? (
                                    <ToggleRight className="h-7 w-7 text-blue-600" />
                                ) : (
                                    <ToggleLeft className="h-7 w-7 text-gray-300" />
                                )}
                            </button>
                        </div>
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
                            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> সেভ হচ্ছে...</> : isEdit ? 'আপডেট করুন' : 'যোগ করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Announcement Delete Modal ─────────────────────────────────────────────────
function AnnouncementDeleteModal({ announcement, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await axios.delete(`/api/admin/announcements/${announcement.id}`);
            if (res.data.success) {
                onDeleted(announcement.id);
            }
        } catch (e) { console.error(e); }
        finally { setDeleting(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-650" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">ঘোষণা মুছে ফেলবেন?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    <span className="font-semibold text-gray-850">"{announcement.title}"</span> ঘোষণাটি মুছে যাবে।
                </p>
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

// ── Main Announcement Component ───────────────────────────────────────────────
export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [meta, setMeta]                 = useState(null);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState('');
    const [page, setPage]                 = useState(1);

    // Filters
    const [typeFilter, setTypeFilter]         = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [statusFilter, setStatusFilter]     = useState('');

    const [modalState, setModalState]     = useState(null); // null | { mode, announcement }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                ...(search && { search }),
                ...(typeFilter && { type: typeFilter }),
                ...(priorityFilter && { priority: priorityFilter }),
                ...(statusFilter && { is_active: statusFilter }),
            });
            const res = await axios.get(`/api/admin/announcements?${params}`);
            if (res.data.success) {
                setAnnouncements(res.data.announcements?.data || []);
                setMeta(res.data.announcements);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAnnouncements(); }, [search, page, typeFilter, priorityFilter, statusFilter]);

    const handleSaved = (ann, isEdit) => {
        if (isEdit) {
            setAnnouncements(prev => prev.map(a => a.id === ann.id ? ann : a));
            showToast('ঘোষণা সফলভাবে আপডেট করা হয়েছে।');
        } else {
            setAnnouncements(prev => [ann, ...prev]);
            showToast('নতুন ঘোষণা প্রকাশ করা হয়েছে।');
        }
        setModalState(null);
    };

    const handleDeleted = (id) => {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        showToast('ঘোষণা সফলভাবে মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
    };

    const toggleAnnouncementStatus = async (ann) => {
        try {
            const nextStatus = !ann.is_active;
            const res = await axios.put(`/api/admin/announcements/${ann.id}`, {
                ...ann,
                is_active: nextStatus ? 1 : 0
            });
            if (res.data.success) {
                setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, is_active: nextStatus } : a));
                showToast(`ঘোষণা ${nextStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
            }
        } catch (e) {
            console.error(e);
            showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
        }
    };

    const togglePinStatus = async (ann) => {
        try {
            const nextPin = !ann.is_pinned;
            const res = await axios.put(`/api/admin/announcements/${ann.id}`, {
                ...ann,
                is_pinned: nextPin ? 1 : 0
            });
            if (res.data.success) {
                setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, is_pinned: nextPin } : a));
                showToast(`ঘোষণাটি ${nextPin ? 'উপরে পিন' : 'পিন মুক্ত'} করা হয়েছে।`);
                fetchAnnouncements(); // Re-fetch to sort pinned first
            }
        } catch (e) {
            console.error(e);
            showToast('পিন স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
        }
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {modalState && (
                <AnnouncementModal
                    mode={modalState.mode}
                    announcement={modalState.announcement}
                    onClose={() => setModalState(null)}
                    onSaved={handleSaved}
                />
            )}

            {deleteTarget && (
                <AnnouncementDeleteModal
                    announcement={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">ঘোষণা ও নোটিশ বোর্ড</h2>
                    <p className="text-sm text-gray-400 mt-0.5">শিক্ষার্থীদের নোটিশ এবং নতুন আপডেট সমূহ পাঠান</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setModalState({ mode: 'create', announcement: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer shrink-0"
                    >
                        <Plus className="h-4 w-4" /> নতুন ঘোষণা
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-2 items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl text-gray-700 cursor-pointer focus:outline-none"
                    >
                        <option value="">সকল ধরণ (Type)</option>
                        <option value="info">তথ্যমূলক (Info)</option>
                        <option value="warning">সতর্কতামূলক (Warning)</option>
                        <option value="success">সফলতা (Success)</option>
                        <option value="danger">জরুরি সতর্কতা (Danger)</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl text-gray-700 cursor-pointer focus:outline-none"
                    >
                        <option value="">সকল গুরুত্ব (Priority)</option>
                        <option value="low">কম (Low)</option>
                        <option value="normal">সাধারণ (Normal)</option>
                        <option value="high">উচ্চ (High)</option>
                        <option value="urgent">অতি জরুরী (Urgent)</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl text-gray-700 cursor-pointer focus:outline-none"
                    >
                        <option value="">সকল অবস্থা (Status)</option>
                        <option value="1">সক্রিয় (Active)</option>
                        <option value="0">নিষ্ক্রিয় (Inactive)</option>
                    </select>
                </div>

                <div className="relative w-48 mt-2 sm:mt-0">
                    <input
                        type="text"
                        placeholder="ঘোষণা খুঁজুন..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-full"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">শিরোনাম / নোটিশ বার্তা</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">টার্গেট লিসেনার</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">ধরণ (Type)</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অগ্রাধিকার</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অবস্থা</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">প্রকাশক</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">প্রকাশের তারিখ</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        {[1,2,3,4,5,6,7,8].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                                    </tr>
                                ))
                            ) : announcements.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Megaphone className="h-8 w-8 text-gray-200" />
                                            <p className="font-semibold text-gray-600">কোনো ঘোষণা খুঁজে পাওয়া যায়নি</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                announcements.map(a => (
                                    <tr key={a.id} className={`hover:bg-gray-50/70 transition-colors ${a.is_pinned ? 'bg-amber-50/20' : ''}`}>
                                        {/* Title / Description */}
                                        <td className="px-5 py-3 max-w-[280px]">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    {a.is_pinned && (
                                                        <span className="p-1 bg-amber-100 text-amber-850 rounded-md" title="Pinned to top">
                                                            <Pin className="h-3 w-3 fill-amber-700" />
                                                        </span>
                                                    )}
                                                    <span className="font-bold text-gray-900 truncate" title={a.title}>{a.title}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mt-1" title={a.content}>{a.content}</p>
                                            </div>
                                        </td>
                                        {/* Target course */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                a.course ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
                                            }`}>
                                                {a.course ? a.course.title : 'গ্লোবাল পোর্টাল'}
                                            </span>
                                        </td>
                                        {/* Type */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                a.type === 'danger' ? 'bg-red-50 text-red-700' :
                                                a.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                                                a.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                                {a.type === 'danger' ? 'Danger' :
                                                 a.type === 'warning' ? 'Warning' :
                                                 a.type === 'success' ? 'Success' : 'Info'}
                                            </span>
                                        </td>
                                        {/* Priority */}
                                        <td className="px-4 py-3 text-center font-semibold text-xs text-gray-650">
                                            {a.priority === 'urgent' ? (
                                                <span className="text-red-650 font-bold">Urgent</span>
                                            ) : a.priority === 'high' ? (
                                                <span className="text-orange-500 font-bold">High</span>
                                            ) : a.priority === 'low' ? (
                                                <span className="text-gray-400">Low</span>
                                            ) : 'Normal'}
                                        </td>
                                        {/* Active status */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleAnnouncementStatus(a)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                {a.is_active ? (
                                                    <ToggleRight className="h-7 w-7 text-blue-600" />
                                                ) : (
                                                    <ToggleLeft className="h-7 w-7 text-gray-300" />
                                                )}
                                            </button>
                                        </td>
                                        {/* Creator */}
                                        <td className="px-4 py-3 text-center text-xs text-gray-500 truncate" title={a.creator?.email}>
                                            {a.creator ? a.creator.name : 'সিস্টেম'}
                                        </td>
                                        {/* Date */}
                                        <td className="px-4 py-3 text-center text-xs text-gray-450 font-mono">
                                            {new Date(a.created_at).toLocaleDateString('bn-BD')}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => togglePinStatus(a)}
                                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                        a.is_pinned ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                                    }`}
                                                    title={a.is_pinned ? 'পিন মুক্ত করুন' : 'পিন করুন'}
                                                >
                                                    <Pin className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setModalState({ mode: 'edit', announcement: a })}
                                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                                                    title="সংশোধন"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(a)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-650 transition-colors cursor-pointer"
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
                            মোট {meta.total}টি ঘোষণা • পৃষ্ঠা {meta.current_page}/{meta.last_page}
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

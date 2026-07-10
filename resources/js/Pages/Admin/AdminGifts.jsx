import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Search, Gift, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
    Loader2, CheckCircle, AlertCircle, Calendar, ToggleLeft, ToggleRight,
    Image, Lock, Unlock, FileText, User, RefreshCw, Upload
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

// ── Gift Create/Edit Modal ────────────────────────────────────────────────────
function GiftModal({ mode, gift, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        title:       isEdit ? (gift?.title || '')       : '',
        description: isEdit ? (gift?.description || '') : '',
        code:        isEdit ? (gift?.code || '')        : '',
        priority:    isEdit ? (gift?.priority || 'normal') : 'normal',
        is_active:   isEdit ? !!gift?.is_active         : true,
        is_locked:   isEdit ? !!gift?.is_locked         : false,
        expires_at:  isEdit && gift?.expires_at ? new Date(gift.expires_at).toISOString().substring(0, 16) : '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(isEdit ? gift?.image : null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        // Prepare multipart form data payload
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('code', form.code);
        formData.append('priority', form.priority);
        formData.append('is_active', form.is_active ? '1' : '0');
        formData.append('is_locked', form.is_locked ? '1' : '0');
        if (form.expires_at) {
            formData.append('expires_at', form.expires_at);
        }
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            let res;
            if (isEdit) {
                // Post to match ['post', 'put'] handler in web.php
                res = await axios.post(`/api/admin/gifts/${gift.id}/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axios.post('/api/admin/gifts', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            if (res.data.success) {
                onSaved(res.data.gift, isEdit);
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
                            {isEdit ? 'গিফট তথ্য সংশোধন করুন' : 'নতুন গিফট অফার যোগ করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            শিক্ষার্থীদের উপহার ও বোনাস রিসোর্স সেট করুন
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Image Selector */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">গিফট কভার ছবি</label>
                        <div className="flex gap-4 items-center">
                            <div className="h-20 w-20 rounded-xl bg-gray-50 border border-gray-150 overflow-hidden flex items-center justify-center shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                                ) : (
                                    <Image className="h-7 w-7 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-250 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                                >
                                    <Upload className="h-3.5 w-3.5 text-gray-500" /> ছবি সিলেক্ট করুন
                                </button>
                                <p className="text-[10px] text-gray-400 mt-1">পরামর্শ: JPG, WebP বা PNG ফরম্যাট (Max: 4MB)</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image[0]}</p>}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">গিফটের শিরোনাম <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="যেমন: স্পেশাল বোনাস বুক বা প্রিমিয়াম ফাইল..."
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">গিফট বর্ণনা <span className="text-red-500">*</span></label>
                        <textarea
                            rows={3} required
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="গিফট পাওয়ার নিয়ম বা বিবরণ এখানে লিখুন..."
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description[0]}</p>}
                    </div>

                    {/* Code & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">গিফট কোড / লিংক</label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="ঐচ্ছিক (যেমন: GIFT-2026)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">অগ্রাধিকার (Priority)</label>
                            <select
                                value={form.priority}
                                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                <option value="low">কম (Low)</option>
                                <option value="normal">সাধারণ (Normal)</option>
                                <option value="high">উচ্চ (High)</option>
                                <option value="urgent">অতি জরুরী (Urgent)</option>
                            </select>
                        </div>
                    </div>

                    {/* Expiration date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400" />মেয়াদ শেষ (ঐচ্ছিক)</label>
                        <input
                            type="datetime-local"
                            value={form.expires_at}
                            onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-55">
                        {/* Locked toggle */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50">
                            <div>
                                <span className="text-xs font-bold text-gray-750 flex items-center gap-1">
                                    {form.is_locked ? <Lock className="h-3 w-3 text-red-500" /> : <Unlock className="h-3 w-3 text-green-500" />} লক স্ট্যাটাস
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_locked: !p.is_locked }))}
                                className="text-gray-400 hover:text-blue-650 transition-colors"
                            >
                                {form.is_locked ? (
                                    <ToggleRight className="h-7 w-7 text-blue-600" />
                                ) : (
                                    <ToggleLeft className="h-7 w-7 text-gray-300" />
                                )}
                            </button>
                        </div>

                        {/* Active toggle */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50">
                            <div>
                                <span className="text-xs font-bold text-gray-750">সক্রিয় স্ট্যাটাস</span>
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

// ── Gift Delete Confirmation Modal ────────────────────────────────────────────
function GiftDeleteModal({ gift, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await axios.delete(`/api/admin/gifts/${gift.id}`);
            if (res.data.success) {
                onDeleted(gift.id);
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
                <h3 className="text-base font-bold text-gray-900 mb-2">গিফট অফার মুছে ফেলবেন?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    <span className="font-semibold text-gray-850">"{gift.title}"</span> গিফটটি চিরতরে মুছে যাবে।
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

// ── Main AdminGifts Component ─────────────────────────────────────────────────
export default function AdminGifts() {
    const [gifts, setGifts]     = useState([]);
    const [meta, setMeta]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [page, setPage]       = useState(1);

    // Filters
    const [priorityFilter, setPriorityFilter] = useState('');
    const [statusFilter, setStatusFilter]     = useState('');
    const [lockFilter, setLockFilter]         = useState('');

    const [modalState, setModalState]     = useState(null); // null | { mode, gift }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchGifts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                ...(search && { search }),
                ...(priorityFilter && { priority: priorityFilter }),
                ...(statusFilter && { is_active: statusFilter }),
                ...(lockFilter && { is_locked: lockFilter }),
            });
            const res = await axios.get(`/api/admin/gifts?${params}`);
            if (res.data.success) {
                setGifts(res.data.gifts?.data || []);
                setMeta(res.data.gifts);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchGifts(); }, [search, page, priorityFilter, statusFilter, lockFilter]);

    const handleSaved = (savedGift, isEdit) => {
        if (isEdit) {
            setGifts(prev => prev.map(g => g.id === savedGift.id ? savedGift : g));
            showToast('গিফট সফলভাবে আপডেট করা হয়েছে।');
        } else {
            setGifts(prev => [savedGift, ...prev]);
            showToast('নতুন গিফট সফলভাবে যোগ করা হয়েছে।');
        }
        setModalState(null);
    };

    const handleDeleted = (id) => {
        setGifts(prev => prev.filter(g => g.id !== id));
        showToast('গিফট অফার মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
    };

    const toggleGiftStatus = async (gift) => {
        try {
            const nextStatus = !gift.is_active;
            const res = await axios.post(`/api/admin/gifts/${gift.id}/update`, {
                title: gift.title,
                description: gift.description,
                code: gift.code || '',
                priority: gift.priority,
                is_active: nextStatus ? 1 : 0,
                is_locked: gift.is_locked ? 1 : 0,
                expires_at: gift.expires_at || ''
            });
            if (res.data.success) {
                setGifts(prev => prev.map(g => g.id === gift.id ? { ...g, is_active: nextStatus } : g));
                showToast(`গিফট ${nextStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
            }
        } catch (e) {
            console.error(e);
            showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
        }
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {modalState && (
                <GiftModal
                    mode={modalState.mode}
                    gift={modalState.gift}
                    onClose={() => setModalState(null)}
                    onSaved={handleSaved}
                />
            )}

            {deleteTarget && (
                <GiftDeleteModal
                    gift={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">গিফট ও স্পেশাল বোনাস রিসোর্স</h2>
                    <p className="text-sm text-gray-400 mt-0.5">শিক্ষার্থীদের রিওয়ার্ড হিসেবে গিফটস বিতরণ পরিচালনা করুন</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setModalState({ mode: 'create', gift: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer shrink-0"
                    >
                        <Plus className="h-4 w-4" /> নতুন গিফট অফার
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-2 items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <div className="flex flex-wrap gap-2">
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
                        <option value="urgent">জরুরি (Urgent)</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl text-gray-700 cursor-pointer focus:outline-none"
                    >
                        <option value="">সক্রিয় অবস্থা</option>
                        <option value="1">সক্রিয় (Active)</option>
                        <option value="0">নিষ্ক্রিয় (Inactive)</option>
                    </select>

                    {/* Lock status Filter */}
                    <select
                        value={lockFilter}
                        onChange={e => { setLockFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl text-gray-700 cursor-pointer focus:outline-none"
                    >
                        <option value="">লক স্ট্যাটাস</option>
                        <option value="1">লকড (Locked)</option>
                        <option value="0">আনলকড (Unlocked)</option>
                    </select>
                </div>

                <div className="relative w-48 mt-2 sm:mt-0">
                    <input
                        type="text"
                        placeholder="গিফট খুঁজুন..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-705 w-full"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">গিফট কভার</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">শিরোনাম / কোড</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অগ্রাধিকার</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">লক অবস্থা</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অবস্থা</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">প্রকাশক</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">মেয়াদ শেষ</th>
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
                            ) : gifts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Gift className="h-8 w-8 text-gray-200" />
                                            <p className="font-semibold text-gray-650">কোনো গিফট অফার পাওয়া যায়নি</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                gifts.map(g => (
                                    <tr key={g.id} className="hover:bg-gray-50/70 transition-colors">
                                        {/* Cover Image */}
                                        <td className="px-5 py-3">
                                            <div className="h-12 w-16 rounded-lg bg-gray-50 border border-gray-150 overflow-hidden flex items-center justify-center">
                                                {g.image ? (
                                                    <img src={g.image} className="h-full w-full object-cover" alt={g.title} />
                                                ) : (
                                                    <Image className="h-5 w-5 text-gray-300" />
                                                )}
                                            </div>
                                        </td>
                                        {/* Title / Code */}
                                        <td className="px-4 py-3 max-w-[240px]">
                                            <div>
                                                <span className="font-bold text-gray-900 truncate block" title={g.title}>{g.title}</span>
                                                {g.code ? (
                                                    <span className="inline-block mt-1 font-mono text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                                                        {g.code}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400">মেয়াদহীন কোড</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Priority */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                g.priority === 'urgent' ? 'bg-red-50 text-red-650' :
                                                g.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                                                g.priority === 'low' ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {g.priority}
                                            </span>
                                        </td>
                                        {/* Lock status */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                g.is_locked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                                            }`}>
                                                {g.is_locked ? <><Lock className="h-3 w-3" /> লকড</> : <><Unlock className="h-3 w-3" /> আনলকড</>}
                                            </span>
                                        </td>
                                        {/* Status toggle */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleGiftStatus(g)}
                                                className="text-gray-400 hover:text-blue-650 transition-colors"
                                            >
                                                {g.is_active ? (
                                                    <ToggleRight className="h-7 w-7 text-blue-600" />
                                                ) : (
                                                    <ToggleLeft className="h-7 w-7 text-gray-300" />
                                                )}
                                            </button>
                                        </td>
                                        {/* Publisher */}
                                        <td className="px-4 py-3 text-center text-xs text-gray-500 truncate" title={g.creator?.email}>
                                            {g.creator ? g.creator.name : 'সিস্টেম'}
                                        </td>
                                        {/* Expires at */}
                                        <td className="px-4 py-3 text-center text-xs text-gray-450 font-mono">
                                            {g.expires_at ? new Date(g.expires_at).toLocaleDateString('bn-BD') : 'সীমাহীন'}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setModalState({ mode: 'edit', gift: g })}
                                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                                                    title="সংশোধন"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(g)}
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
                            মোট {meta.total}টি গিফট অফার • পৃষ্ঠা {meta.current_page}/{meta.last_page}
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

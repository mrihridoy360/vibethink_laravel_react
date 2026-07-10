import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Gift, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
    Loader2, CheckCircle, AlertCircle, Calendar, ToggleLeft, ToggleRight,
    Percent, DollarSign, UserCheck, RefreshCw
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

// ── Coupon Create/Edit Modal ──────────────────────────────────────────────────
function CouponModal({ mode, coupon, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        code:                  isEdit ? (coupon?.code || '')                  : '',
        name:                  isEdit ? (coupon?.name || '')                  : '',
        description:           isEdit ? (coupon?.description || '')           : '',
        type:                  isEdit ? (coupon?.type || 'percentage')        : 'percentage',
        value:                 isEdit ? (coupon?.value || '')                 : '',
        min_purchase:          isEdit ? (coupon?.min_purchase || '')          : '',
        max_discount:          isEdit ? (coupon?.max_discount || '')          : '',
        usage_limit:           isEdit ? (coupon?.usage_limit || '')           : '',
        usage_limit_per_user:  isEdit ? (coupon?.usage_limit_per_user || 1)   : 1,
        starts_at:             isEdit && coupon?.starts_at ? new Date(coupon.starts_at).toISOString().substring(0, 16) : '',
        expires_at:            isEdit && coupon?.expires_at ? new Date(coupon.expires_at).toISOString().substring(0, 16) : '',
        is_active:             isEdit ? !!coupon?.is_active                   : true,
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        // Prepare payload (convert empty fields to null)
        const payload = {
            ...form,
            min_purchase: form.min_purchase === '' ? null : parseFloat(form.min_purchase),
            max_discount: form.max_discount === '' ? null : parseFloat(form.max_discount),
            usage_limit:  form.usage_limit === '' ? null : parseInt(form.usage_limit),
            starts_at:    form.starts_at === '' ? null : form.starts_at,
            expires_at:   form.expires_at === '' ? null : form.expires_at,
            is_active:    form.is_active ? 1 : 0
        };

        try {
            let res;
            if (isEdit) {
                res = await axios.put(`/api/admin/coupons/${coupon.id}`, payload);
            } else {
                res = await axios.post('/api/admin/coupons', payload);
            }
            if (res.data.success) {
                onSaved(res.data.coupon, isEdit);
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
                            {isEdit ? 'কুপন সংশোধন করুন' : 'নতুন কুপন তৈরি করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            ডিসকাউন্ট ও ব্যবহারের সীমারেখা সেট করুন
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Code & Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">কুপন কোড <span className="text-red-500">*</span></label>
                            <input
                                type="text" required
                                value={form.code}
                                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.code ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                placeholder="যেমন: SAVE50, EID20"
                            />
                            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">কুপনের নাম</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="যেমন: ঈদ স্পেশাল ডিসকাউন্ট"
                            />
                        </div>
                    </div>

                    {/* Value & Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">কুপন টাইপ</label>
                            <select
                                value={form.type}
                                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                <option value="percentage">শতকরা ডিসকাউন্ট (Percentage %)</option>
                                <option value="fixed">স্থায়ী ডিসকাউন্ট (Fixed Amount $)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ডিসকাউন্ট মান (Value) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="number" required min="0" step="any"
                                    value={form.value}
                                    onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.value ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                    placeholder={form.type === 'percentage' ? 'যেমন: ২০' : 'যেমন: ১০০'}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {form.type === 'percentage' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                </div>
                            </div>
                            {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value[0]}</p>}
                        </div>
                    </div>

                    {/* Min purchase & Max Discount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">নূন্যতম ক্রয় (Min Purchase)</label>
                            <input
                                type="number" min="0" step="any"
                                value={form.min_purchase}
                                onChange={e => setForm(p => ({ ...p, min_purchase: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="ঐচ্ছিক (যেমন: ৫০০)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">সর্বোচ্চ ছাড় (Max Discount)</label>
                            <input
                                type="number" min="0" step="any"
                                value={form.max_discount}
                                onChange={e => setForm(p => ({ ...p, max_discount: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="ঐচ্ছিক (শতকরা কুপনের ক্ষেত্রে)"
                            />
                        </div>
                    </div>

                    {/* Usage limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">সর্বমোট লিমিট (Usage Limit)</label>
                            <input
                                type="number" min="1"
                                value={form.usage_limit}
                                onChange={e => setForm(p => ({ ...p, usage_limit: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="ঐচ্ছিক (যেমন: ১০০ বার)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ইউজার প্রতি লিমিট <span className="text-red-500">*</span></label>
                            <input
                                type="number" required min="1"
                                value={form.usage_limit_per_user}
                                onChange={e => setForm(p => ({ ...p, usage_limit_per_user: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Date Validation Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gray-400" />শুরুর তারিখ</label>
                            <input
                                type="datetime-local"
                                value={form.starts_at}
                                onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gray-400" />মেয়াদ শেষ</label>
                            <input
                                type="datetime-local"
                                value={form.expires_at}
                                onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">কুপন বর্ণনা (Description)</label>
                        <textarea
                            rows={2}
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="কুপন সম্পর্কে কিছু নোট লিখুন..."
                        />
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between py-2 border-t border-b border-gray-50">
                        <div>
                            <span className="text-sm font-semibold text-gray-700">কুপন সক্রিয় স্ট্যাটাস</span>
                            <p className="text-[10px] text-gray-400">নিষ্ক্রিয় থাকলে কুপনটি কাজ করবে না</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                            className="text-gray-400 hover:text-blue-650 transition-colors"
                        >
                            {form.is_active ? (
                                <ToggleRight className="h-9 w-9 text-blue-600" />
                            ) : (
                                <ToggleLeft className="h-9 w-9 text-gray-300" />
                            )}
                        </button>
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

// ── Coupon Delete Confirm Modal ───────────────────────────────────────────────
function CouponDeleteModal({ coupon, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await axios.delete(`/api/admin/coupons/${coupon.id}`);
            if (res.data.success) {
                onDeleted(coupon.id);
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
                <h3 className="text-base font-bold text-gray-900 mb-2">কুপন মুছে ফেলবেন?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    <span className="font-semibold text-gray-850">"{coupon.code}"</span> কুপন কোড টি চিরতরে মুছে যাবে।
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

// ── Main AdminCoupons Component ───────────────────────────────────────────────
export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [meta, setMeta]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [page, setPage]       = useState(1);

    const [modalState, setModalState]     = useState(null); // null | { mode: 'create' | 'edit', coupon }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }) });
            const res = await axios.get(`/api/admin/coupons?${params}`);
            if (res.data.success) {
                setCoupons(res.data.coupons?.data || []);
                setMeta(res.data.coupons);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCoupons(); }, [search, page]);

    const handleSaved = (savedCoupon, isEdit) => {
        if (isEdit) {
            setCoupons(prev => prev.map(c => c.id === savedCoupon.id ? savedCoupon : c));
            showToast('কুপন সফলভাবে আপডেট করা হয়েছে।');
        } else {
            setCoupons(prev => [savedCoupon, ...prev]);
            showToast('নতুন কুপন সফলভাবে তৈরি করা হয়েছে।');
        }
        setModalState(null);
    };

    const handleDeleted = (id) => {
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast('কুপন মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
    };

    const toggleCouponStatus = async (coupon) => {
        try {
            const nextStatus = !coupon.is_active;
            const res = await axios.put(`/api/admin/coupons/${coupon.id}`, {
                ...coupon,
                is_active: nextStatus ? 1 : 0
            });
            if (res.data.success) {
                setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: nextStatus } : c));
                showToast(`কুপন ${nextStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
            }
        } catch (e) {
            console.error(e);
            showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
        }
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* modals */}
            {modalState && (
                <CouponModal
                    mode={modalState.mode}
                    coupon={modalState.coupon}
                    onClose={() => setModalState(null)}
                    onSaved={handleSaved}
                />
            )}

            {deleteTarget && (
                <CouponDeleteModal
                    coupon={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">কুপন সেটআপ ও প্রমোশন</h2>
                    <p className="text-sm text-gray-400 mt-0.5">কোর্স ডিসকাউন্ট অফারসমূহ পরিচালনা করুন</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="কুপন খুঁজুন..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-sm px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-44"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <button
                        onClick={() => setModalState({ mode: 'create', coupon: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer shrink-0"
                    >
                        <Plus className="h-4 w-4" /> নতুন কুপন
                    </button>
                </div>
            </div>

            {/* Coupon List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">কুপন কোড / নাম</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">ছাড়ের ধরণ</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs font-mono">মান (Discount)</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">ব্যবহারের লিমিট</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">মোট ব্যবহৃত</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">মেয়াদ শেষ</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অবস্থা</th>
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
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Gift className="h-8 w-8 text-gray-200" />
                                            <p className="font-semibold text-gray-600">কোনো কুপন কোড পাওয়া যায়নি</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                                        {/* Code / Name */}
                                        <td className="px-5 py-3">
                                            <div>
                                                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs">
                                                    {c.code}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1 font-semibold">{c.name || '—'}</p>
                                            </div>
                                        </td>
                                        {/* Type */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                c.type === 'percentage' ? 'bg-indigo-50 text-indigo-700' : 'bg-green-50 text-green-700'
                                            }`}>
                                                {c.type === 'percentage' ? 'শতকরা (%)' : 'স্থায়ী ($)'}
                                            </span>
                                        </td>
                                        {/* Value */}
                                        <td className="px-4 py-3 text-center font-bold text-gray-800">
                                            {c.value} {c.type === 'percentage' ? '%' : '$'}
                                        </td>
                                        {/* Usage limit */}
                                        <td className="px-4 py-3 text-center text-gray-600 font-semibold">
                                            {c.usage_limit || 'সীমাহীন'}
                                        </td>
                                        {/* Used count */}
                                        <td className="px-4 py-3 text-center font-bold text-gray-700">
                                            {c.used_count} বার
                                        </td>
                                        {/* Expires at */}
                                        <td className="px-4 py-3 text-center text-gray-450 text-xs font-mono">
                                            {c.expires_at ? new Date(c.expires_at).toLocaleDateString('bn-BD') : 'মেয়াদহীন'}
                                        </td>
                                        {/* Toggle status */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleCouponStatus(c)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                {c.is_active ? (
                                                    <ToggleRight className="h-7 w-7 text-blue-600" />
                                                ) : (
                                                    <ToggleLeft className="h-7 w-7 text-gray-300" />
                                                )}
                                            </button>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setModalState({ mode: 'edit', coupon: c })}
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
                            মোট {meta.total}টি কুপন • পৃষ্ঠা {meta.current_page}/{meta.last_page}
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

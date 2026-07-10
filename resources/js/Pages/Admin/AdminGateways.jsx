import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Cpu, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
    Loader2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Key, Settings
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

// ── Gateway Create/Edit Modal ────────────────────────────────────────────────
function GatewayModal({ mode, gateway, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        name:        isEdit ? (gateway?.name || '')        : '',
        type:        isEdit ? (gateway?.type || 'manual')  : 'manual',
        mode:        isEdit ? (gateway?.mode || 'sandbox') : 'sandbox',
        description: isEdit ? (gateway?.description || '') : '',
        is_active:   isEdit ? !!gateway?.is_active         : true,
        sort_order:  isEdit ? (gateway?.sort_order || 0)   : 0,
        // dynamically typed config object
        config:      isEdit && gateway?.config ? gateway.config : {},
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Keep dynamic config key-value states
    const [configKeys, setConfigKeys] = useState(
        isEdit && gateway?.config ? Object.keys(gateway.config) : []
    );

    const handleConfigChange = (key, val) => {
        setForm(p => ({
            ...p,
            config: {
                ...p.config,
                [key]: val
            }
        }));
    };

    const addConfigField = (keyName) => {
        if (!keyName.trim()) return;
        const key = keyName.trim();
        if (configKeys.includes(key)) return;
        setConfigKeys(p => [...p, key]);
        handleConfigChange(key, '');
    };

    const removeConfigField = (key) => {
        setConfigKeys(p => p.filter(k => k !== key));
        setForm(p => {
            const next = { ...p.config };
            delete next[key];
            return { ...p, config: next };
        });
    };

    // Auto add fields for common gateway types on selection
    useEffect(() => {
        if (!isEdit) {
            if (form.type === 'automatic') {
                setConfigKeys(['api_key', 'base_url']);
                setForm(p => ({ ...p, config: { api_key: '', base_url: '' } }));
            } else {
                setConfigKeys(['account_number', 'instructions']);
                setForm(p => ({ ...p, config: { account_number: '', instructions: '' } }));
            }
        }
    }, [form.type, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            let res;
            const payload = {
                ...form,
                is_active: form.is_active ? 1 : 0
            };
            if (isEdit) {
                res = await axios.put(`/api/admin/payment-gateways/${gateway.id}`, payload);
            } else {
                res = await axios.post('/api/admin/payment-gateways', payload);
            }
            if (res.data.success) {
                onSaved(res.data.gateway, isEdit);
            }
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {isEdit ? 'পেমেন্ট গেটওয়ে এডিট করুন' : 'নতুন পেমেন্ট গেটওয়ে'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            গেটওয়ে অ্যাকাউন্ট ও পেমেন্ট কনফিগারেশন সেট করুন
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">গেটওয়ে নাম <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="যেমন: Bkash Personal, Nagad, Stripe..."
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                    </div>

                    {!isEdit && (
                        /* Type selection */
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">গেটওয়ে টাইপ</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold cursor-pointer">
                                    <input
                                        type="radio" name="type" value="manual"
                                        checked={form.type === 'manual'}
                                        onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    ম্যানুয়াল (Manual)
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 font-semibold cursor-pointer">
                                    <input
                                        type="radio" name="type" value="automatic"
                                        checked={form.type === 'automatic'}
                                        onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    অটোমেটিক (Automatic)
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Mode selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">মোড (Mode)</label>
                        <select
                            value={form.mode}
                            onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="sandbox">স্যান্ডবক্স / টেস্ট (Sandbox)</option>
                            <option value="live">লাইভ / প্রডাকশন (Live)</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">সংক্ষিপ্ত বিবরণ</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="যেমন: পেমেন্ট করার পর ট্রানজেকশন আইডি দিন..."
                        />
                    </div>

                    {/* Is Active toggle */}
                    <div className="flex items-center justify-between py-2 border-t border-b border-gray-50">
                        <div>
                            <span className="text-sm font-semibold text-gray-700">গেটওয়ে স্ট্যাটাস</span>
                            <p className="text-[10px] text-gray-400">অ্যাক্টিভ থাকলে শিক্ষার্থীরা চেকআউটে এটি সিলেক্ট করতে পারবে</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            {form.is_active ? (
                                <ToggleRight className="h-9 w-9 text-blue-600" />
                            ) : (
                                <ToggleLeft className="h-9 w-9 text-gray-300" />
                            )}
                        </button>
                    </div>

                    {/* Config params fields */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">কনফিগারেশন ক্রেডেনশিয়ালস</label>
                            {/* Allow adding custom fields */}
                            <button
                                type="button"
                                onClick={() => {
                                    const key = prompt('কনফিগারেশন ফিল্ডের কী (Key) লিখুন (যেমন: api_secret, merchant_id):');
                                    if (key) addConfigField(key);
                                }}
                                className="text-[10px] text-blue-600 hover:underline font-bold"
                            >
                                + কাস্টম ফিল্ড
                            </button>
                        </div>
                        {configKeys.length === 0 ? (
                            <p className="text-xs text-gray-400">কোনো ক্রেডেনশিয়াল ফিল্ড সেট করা নেই।</p>
                        ) : (
                            configKeys.map(key => (
                                <div key={key} className="space-y-1 relative">
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                                        <span className="font-mono text-[11px]">{key}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeConfigField(key)}
                                            className="text-red-500 hover:text-red-700 text-[10px]"
                                            title="মুছে ফেলুন"
                                        >
                                            মুছুন
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={form.config[key] || ''}
                                        onChange={e => handleConfigChange(key, e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder={`মান লিখুন...`}
                                    />
                                </div>
                            ))
                        )}
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

// ── Gateway Delete Confirm Modal ──────────────────────────────────────────────
function GatewayDeleteModal({ gateway, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await axios.delete(`/api/admin/payment-gateways/${gateway.id}`);
            if (res.data.success) {
                onDeleted(gateway.id);
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
                <h3 className="text-base font-bold text-gray-900 mb-2">পেমেন্ট গেটওয়ে মুছে ফেলবেন?</h3>
                <p className="text-sm text-gray-500 mb-1">
                    <span className="font-semibold text-gray-800">"{gateway.name}"</span> গেটওয়ে টি চিরতরে মুছে যাবে।
                </p>
                <p className="text-xs text-red-500 mb-6">শিক্ষার্থীরা চেকআউটে আর এই গেটওয়ে দিয়ে পেমেন্ট করতে পারবে না।</p>
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

// ── Main AdminGateways Component ──────────────────────────────────────────────
export default function AdminGateways() {
    const [gateways, setGateways] = useState([]);
    const [loading, setLoading]   = useState(true);

    const [modalState, setModalState]     = useState(null); // null | { mode: 'create' | 'edit', gateway }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchGateways = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/payment-gateways');
            if (res.data.success) {
                setGateways(res.data.gateways || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchGateways(); }, []);

    const handleSaved = (savedGateway, isEdit) => {
        if (isEdit) {
            setGateways(prev => prev.map(g => g.id === savedGateway.id ? savedGateway : g));
            showToast('পেমেন্ট গেটওয়ে সফলভাবে আপডেট করা হয়েছে।');
        } else {
            setGateways(prev => [...prev, savedGateway]);
            showToast('নতুন পেমেন্ট গেটওয়ে তৈরি সম্পন্ন হয়েছে।');
        }
        setModalState(null);
    };

    const handleDeleted = (id) => {
        setGateways(prev => prev.filter(g => g.id !== id));
        showToast('পেমেন্ট গেটওয়ে মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
    };

    const toggleStatus = async (gateway) => {
        try {
            const nextStatus = !gateway.is_active;
            const res = await axios.put(`/api/admin/payment-gateways/${gateway.id}`, {
                ...gateway,
                is_active: nextStatus ? 1 : 0
            });
            if (res.data.success) {
                setGateways(prev => prev.map(g => g.id === gateway.id ? { ...g, is_active: nextStatus } : g));
                showToast(`ক্যাটাগরি ${nextStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
            }
        } catch (e) {
            console.error(e);
            showToast('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।', 'error');
        }
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Create/Edit Modal */}
            {modalState && (
                <GatewayModal
                    mode={modalState.mode}
                    gateway={modalState.gateway}
                    onClose={() => setModalState(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <GatewayDeleteModal
                    gateway={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">গেটওয়ে সেটআপ</h2>
                    <p className="text-sm text-gray-400 mt-0.5">অটোমেটিক ও ম্যানুয়াল পেমেন্ট গেটওয়ে কনফিগারেশন</p>
                </div>
                <button
                    onClick={() => setModalState({ mode: 'create', gateway: null })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 cursor-pointer"
                >
                    <Plus className="h-4 w-4" /> নতুন গেটওয়ে
                </button>
            </div>

            {/* Gateways Cards list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-100 rounded-2xl animate-pulse" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
                                </div>
                            </div>
                            <div className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                            <div className="h-8 bg-gray-100 rounded w-1/2 animate-pulse" />
                        </div>
                    ))
                ) : gateways.length === 0 ? (
                    <div className="col-span-full bg-white rounded-3xl border border-gray-100 py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Cpu className="h-8 w-8 text-gray-200" />
                            <p className="font-semibold text-gray-650">কোনো পেমেন্ট গেটওয়ে পাওয়া যায়নি</p>
                        </div>
                    </div>
                ) : (
                    gateways.map(g => (
                        <div
                            key={g.id}
                            className={`bg-white rounded-3xl p-6 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                                g.is_active ? 'border-gray-100 ring-1 ring-blue-500/5' : 'border-gray-100/80 opacity-70'
                            }`}
                        >
                            {/* Card Top */}
                            <div className="space-y-3.5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-2xl ${g.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <Cpu className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm leading-snug">{g.name}</h3>
                                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{g.key}</span>
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setModalState({ mode: 'edit', gateway: g })}
                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer"
                                            title="এডিট"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(g)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-red-505 transition-colors cursor-pointer"
                                            title="মুছুন"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        g.type === 'automatic' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                    }`}>
                                        {g.type === 'automatic' ? 'অটোমেটিক' : 'ম্যানুয়াল'}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        g.mode === 'live' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                        {g.mode === 'live' ? 'Live' : 'Sandbox'}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        g.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {g.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                    </span>
                                </div>

                                {/* Config keys Preview */}
                                <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-100 text-xs space-y-1.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Settings className="h-3 w-3" /> কনফিগারেশন প্যারামিটারস
                                    </span>
                                    {g.config && Object.keys(g.config).length > 0 ? (
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[10px]">
                                            {Object.entries(g.config).map(([k, v]) => (
                                                <div key={k} className="truncate">
                                                    <span className="text-gray-400">{k}: </span>
                                                    <span className="text-gray-700 font-semibold" title={v}>{v || '—'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-gray-450 italic">কোনো কনফিগারেশন নেই।</p>
                                    )}
                                </div>
                            </div>

                            {/* Card Bottom: Toggle active */}
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-4">
                                <span className="text-xs text-gray-450">স্ট্যাটাস পরিবর্তন</span>
                                <button
                                    onClick={() => toggleStatus(g)}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {g.is_active ? (
                                        <ToggleRight className="h-8 w-8 text-blue-600" />
                                    ) : (
                                        <ToggleLeft className="h-8 w-8 text-gray-300" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

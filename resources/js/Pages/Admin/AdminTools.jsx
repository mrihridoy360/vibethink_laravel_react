import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Wrench, Plus, Pencil, Trash2, Search, ExternalLink, X, Loader2,
    CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Folder, Paintbrush,
    Link as LinkIcon, FileText, Image as ImageIcon, Upload, HelpCircle, Eye, EyeOff
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
        name: isEdit ? (category?.name || '') : '',
        slug: isEdit ? (category?.slug || '') : '',
        description: isEdit ? (category?.description || '') : '',
        color: isEdit ? (category?.color || '#3B82F6') : '#3B82F6',
        icon: isEdit ? (category?.icon || 'Wrench') : 'Wrench',
        order: isEdit ? (category?.order ?? 0) : 0,
        is_active: isEdit ? !!category?.is_active : true,
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const colorPresets = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            let res;
            if (isEdit) {
                res = await axios.post(`/api/admin/tool-categories/${category.id}/update`, form);
            } else {
                res = await axios.post('/api/admin/tool-categories', form);
            }
            if (res.data.success) {
                onSaved(res.data.category, isEdit);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                onSaved(null, isEdit, 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {isEdit ? 'ক্যাটাগরি সংশোধন করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            টুলসগুলো সাজানোর জন্য নতুন ক্যাটাগরি তৈরি করুন
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্যাটাগরির নাম <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="যেমন: ডিজাইন টুলস, ডেভেলপমেন্ট"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Slug */}
                    {isEdit && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্লাগ (Slug)</label>
                            <input
                                type="text"
                                placeholder="যেমন: design-tools"
                                value={form.slug}
                                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug[0]}</p>}
                        </div>
                    )}

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">থিম কালার</label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="color"
                                value={form.color}
                                onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                                className="w-10 h-10 border-0 rounded-xl cursor-pointer p-0 shrink-0"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {colorPresets.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, color: c }))}
                                        style={{ backgroundColor: c }}
                                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform border-2 ${form.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        {errors.color && <p className="text-xs text-red-500 mt-1">{errors.color[0]}</p>}
                    </div>

                    {/* Icon Class */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">আইকন (Icon Class/Name)</label>
                        <input
                            type="text"
                            placeholder="যেমন: Wrench, Layers"
                            value={form.icon}
                            onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                        />
                        {errors.icon && <p className="text-xs text-red-500 mt-1">{errors.icon[0]}</p>}
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্রম (Order)</label>
                        <input
                            type="number"
                            min="0"
                            value={form.order}
                            onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                        />
                        {errors.order && <p className="text-xs text-red-500 mt-1">{errors.order[0]}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">সংক্ষিপ্ত বিবরণ</label>
                        <textarea
                            placeholder="ক্যাটাগরির বিবরণ লিখুন..."
                            rows="2"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description[0]}</p>}
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                        <div>
                            <span className="text-sm font-bold text-gray-800">সক্রিয় স্ট্যাটাস</span>
                            <p className="text-xs text-gray-400">শিক্ষার্থীরা এই ক্যাটাগরি দেখতে পাবে কি না</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                            className="text-blue-600 focus:outline-none cursor-pointer"
                        >
                            {form.is_active ? (
                                <ToggleRight className="h-9 w-9 text-blue-600" />
                            ) : (
                                <ToggleLeft className="h-9 w-9 text-gray-300" />
                            )}
                        </button>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বাতিল</button>
                    <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Tool Create/Edit Modal ────────────────────────────────────────────────────
function ToolModal({ mode, tool, categories, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        category_id: isEdit ? (tool?.category_id || '') : (categories[0]?.id || ''),
        name: isEdit ? (tool?.name || '') : '',
        slug: isEdit ? (tool?.slug || '') : '',
        url: isEdit ? (tool?.url || '') : '',
        button_text: isEdit ? (tool?.button_text || '') : '',
        description: isEdit ? (tool?.description || '') : '',
        order: isEdit ? (tool?.order ?? 0) : 0,
        is_external: isEdit ? !!tool?.is_external : true,
        is_featured: isEdit ? !!tool?.is_featured : false,
        is_active: isEdit ? !!tool?.is_active : true,
    });

    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(isEdit ? tool?.icon : null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(isEdit ? tool?.thumbnail : null);

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const iconInputRef = useRef(null);
    const thumbInputRef = useRef(null);

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIconFile(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleThumbChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const formData = new FormData();
        formData.append('category_id', form.category_id);
        formData.append('name', form.name);
        if (form.slug) formData.append('slug', form.slug);
        formData.append('url', form.url);
        formData.append('button_text', form.button_text || '');
        formData.append('description', form.description || '');
        formData.append('order', form.order || 0);
        formData.append('is_active', form.is_active ? '1' : '0');
        formData.append('is_featured', form.is_featured ? '1' : '0');
        formData.append('is_external', form.is_external ? '1' : '0');

        if (iconFile) formData.append('icon_file', iconFile);
        if (thumbnailFile) formData.append('thumbnail_file', thumbnailFile);

        try {
            let res;
            if (isEdit) {
                res = await axios.post(`/api/admin/tools/${tool.id}/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axios.post('/api/admin/tools', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            if (res.data.success) {
                onSaved(res.data.tool, isEdit);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                onSaved(null, isEdit, 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {isEdit ? 'টুল তথ্য সংশোধন করুন' : 'নতুন প্রয়োজনীয় টুল যোগ করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            শিক্ষার্থীদের প্রয়োজনীয় রিসোর্স বা টুলস যুক্ত করুন
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্যাটাগরি <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={form.category_id}
                            onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-semibold text-gray-700 bg-white"
                        >
                            <option value="" disabled>ক্যাটাগরি সিলেক্ট করুন</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id[0]}</p>}
                    </div>

                    {/* Two Column Name & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">টুল এর নাম <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                placeholder="যেমন: Figma, GitHub"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্লাগ (ঐচ্ছিক)</label>
                            <input
                                type="text"
                                placeholder="ফাঁকা রাখলে অটো জেনারেট হবে"
                                value={form.slug}
                                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug[0]}</p>}
                        </div>
                    </div>

                    {/* Two Column Link URL & Button Text */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ভিজিট লিংক (URL) <span className="text-red-500">*</span></label>
                            <input
                                type="url"
                                required
                                placeholder="https://example.com"
                                value={form.url}
                                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">অ্যাকশন টেক্সট (Button Text)</label>
                            <input
                                type="text"
                                placeholder="যেমন: প্রো মেম্বারশিপ, সরাসরি ভিজিট"
                                value={form.button_text}
                                onChange={e => setForm(p => ({ ...p, button_text: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.button_text && <p className="text-xs text-red-500 mt-1">{errors.button_text[0]}</p>}
                        </div>
                    </div>

                    {/* Image selector columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Icon upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">টুল আইকন</label>
                            <div className="flex gap-3 items-center">
                                <div className="h-16 w-16 rounded-xl bg-gray-50 border border-gray-150 overflow-hidden flex items-center justify-center shrink-0">
                                    {iconPreview ? (
                                        <img src={iconPreview} className="h-full w-full object-contain p-1" alt="Icon Preview" />
                                    ) : (
                                        <ImageIcon className="h-6 w-6 text-gray-300" />
                                    )}
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => iconInputRef.current.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-250 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer"
                                    >
                                        <Upload className="h-3 w-3 text-gray-500" /> আপলোড
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={iconInputRef}
                                    onChange={handleIconChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            {errors.icon_file && <p className="text-xs text-red-500 mt-1">{errors.icon_file[0]}</p>}
                        </div>

                        {/* Thumbnail upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফিচার্ড ব্যানার/থাম্বনেইল</label>
                            <div className="flex gap-3 items-center">
                                <div className="h-16 w-24 rounded-xl bg-gray-50 border border-gray-150 overflow-hidden flex items-center justify-center shrink-0">
                                    {thumbnailPreview ? (
                                        <img src={thumbnailPreview} className="h-full w-full object-cover" alt="Thumb Preview" />
                                    ) : (
                                        <ImageIcon className="h-6 w-6 text-gray-300" />
                                    )}
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => thumbInputRef.current.click()}
                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-250 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer"
                                    >
                                        <Upload className="h-3 w-3 text-gray-500" /> আপলোড
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={thumbInputRef}
                                    onChange={handleThumbChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            {errors.thumbnail_file && <p className="text-xs text-red-500 mt-1">{errors.thumbnail_file[0]}</p>}
                        </div>
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্রম (Order)</label>
                        <input
                            type="number"
                            min="0"
                            value={form.order}
                            onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                        />
                        {errors.order && <p className="text-xs text-red-500 mt-1">{errors.order[0]}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">টুল এর সংক্ষিপ্ত পরিচিতি</label>
                        <textarea
                            placeholder="টুলটি কোন কাজে লাগবে তার একটি সুন্দর সংক্ষিপ্ত পরিচিতি লিখুন..."
                            rows="2"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description[0]}</p>}
                    </div>

                    {/* Settings Switches */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-2xl">
                        <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl text-center">
                            <span className="text-xs font-bold text-gray-800">এক্সটার্নাল লিঙ্ক</span>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_external: !p.is_external }))}
                                className="text-blue-600 mt-1.5 focus:outline-none cursor-pointer"
                            >
                                {form.is_external ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl text-center">
                            <span className="text-xs font-bold text-gray-800">ফিচার্ড টুলস</span>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
                                className="text-blue-600 mt-1.5 focus:outline-none cursor-pointer"
                            >
                                {form.is_featured ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl text-center">
                            <span className="text-xs font-bold text-gray-800">সক্রিয় স্ট্যাটাস</span>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                                className="text-blue-600 mt-1.5 focus:outline-none cursor-pointer"
                            >
                                {form.is_active ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বাতিল</button>
                    <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminTools() {
    const [activeSubTab, setActiveSubTab] = useState('tools'); // tools, categories

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [tools, setTools] = useState([]);
    const [toolsLoading, setToolsLoading] = useState(true);
    const [toolsPagination, setToolsPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [toolsPage, setToolsPage] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categorySearchQuery, setCategorySearchQuery] = useState('');

    const [categoryModal, setCategoryModal] = useState({ isOpen: false, mode: 'create', category: null });
    const [toolModal, setToolModal] = useState({ isOpen: false, mode: 'create', tool: null });

    const [toast, setToast] = useState(null);

    // Fetch Categories
    const fetchCategories = async (q = '') => {
        setCategoriesLoading(true);
        try {
            const res = await axios.get('/api/admin/tool-categories', { params: { search: q } });
            if (res.data.success) {
                setCategories(res.data.categories);
            }
        } catch (err) {
            console.error('Error fetching categories', err);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Fetch Tools
    const fetchTools = async (page = 1, search = '', categoryId = '') => {
        setToolsLoading(true);
        try {
            const res = await axios.get('/api/admin/tools', {
                params: { page, search, category_id: categoryId }
            });
            if (res.data.success) {
                setTools(res.data.tools.data);
                setToolsPagination({
                    current_page: res.data.tools.current_page,
                    last_page: res.data.tools.last_page,
                    total: res.data.tools.total
                });
            }
        } catch (err) {
            console.error('Error fetching tools', err);
        } finally {
            setToolsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (activeSubTab === 'tools') {
            fetchTools(toolsPage, searchQuery, categoryFilter);
        } else {
            fetchCategories(categorySearchQuery);
        }
    }, [activeSubTab, toolsPage, searchQuery, categoryFilter, categorySearchQuery]);

    // Handle Category Saved
    const handleCategorySaved = (savedCategory, isEdit, error = null) => {
        if (error) {
            setToast({ type: 'error', message: error });
            return;
        }
        setCategoryModal({ isOpen: false, mode: 'create', category: null });
        fetchCategories(categorySearchQuery);
        setToast({
            type: 'success',
            message: isEdit ? 'ক্যাটাগরি আপডেট করা হয়েছে!' : 'নতুন ক্যাটাগরি তৈরি হয়েছে!'
        });
    };

    // Handle Tool Saved
    const handleToolSaved = (savedTool, isEdit, error = null) => {
        if (error) {
            setToast({ type: 'error', message: error });
            return;
        }
        setToolModal({ isOpen: false, mode: 'create', tool: null });
        fetchTools(toolsPage, searchQuery, categoryFilter);
        setToast({
            type: 'success',
            message: isEdit ? 'টুল আপডেট করা হয়েছে!' : 'নতুন প্রয়োজনীয় টুল তৈরি হয়েছে!'
        });
    };

    // Delete Category
    const handleDeleteCategory = async (id) => {
        if (!confirm('আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি এবং এর অধীনে থাকা সমস্ত টুলস মুছে ফেলতে চান?')) return;
        try {
            const res = await axios.delete(`/api/admin/tool-categories/${id}`);
            if (res.data.success) {
                fetchCategories(categorySearchQuery);
                // If tools was also active, fetch tools again
                fetchTools(1, searchQuery, categoryFilter);
                setToast({ type: 'success', message: res.data.message || 'ক্যাটাগরি মুছে ফেলা হয়েছে!' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'ক্যাটাগরি মুছতে সমস্যা হয়েছে।' });
        }
    };

    // Delete Tool
    const handleDeleteTool = async (id) => {
        if (!confirm('আপনি কি নিশ্চিতভাবে এই টুলটি মুছে ফেলতে চান?')) return;
        try {
            const res = await axios.delete(`/api/admin/tools/${id}`);
            if (res.data.success) {
                fetchTools(toolsPage, searchQuery, categoryFilter);
                setToast({ type: 'success', message: res.data.message || 'টুলটি মুছে ফেলা হয়েছে!' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'টুলটি মুছতে সমস্যা হয়েছে।' });
        }
    };

    // Quick status toggling helper for Category
    const toggleCategoryActive = async (cat) => {
        try {
            const updatedForm = { ...cat, is_active: !cat.is_active };
            const res = await axios.post(`/api/admin/tool-categories/${cat.id}/update`, updatedForm);
            if (res.data.success) {
                fetchCategories(categorySearchQuery);
                setToast({ type: 'success', message: 'ক্যাটাগরি স্ট্যাটাস আপডেট হয়েছে!' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।' });
        }
    };

    // Quick status toggling helper for Tool
    const toggleToolActive = async (tool) => {
        try {
            // Need to send as multipart form-data or standard request since we do not send files here
            const res = await axios.post(`/api/admin/tools/${tool.id}/update`, {
                category_id: tool.category_id,
                name: tool.name,
                url: tool.url,
                is_active: !tool.is_active ? '1' : '0',
                is_featured: tool.is_featured ? '1' : '0',
                is_external: tool.is_external ? '1' : '0',
                order: tool.order
            });
            if (res.data.success) {
                fetchTools(toolsPage, searchQuery, categoryFilter);
                setToast({ type: 'success', message: 'টুল সক্রিয় স্ট্যাটাস আপডেট হয়েছে!' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।' });
        }
    };

    return (
        <div className="space-y-6">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Wrench className="h-6 w-6 text-blue-600" /> প্রয়োজনীয় টুলস ও রিসোর্স
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-light">শিক্ষার্থীদের জন্য বিভিন্ন সফটওয়্যার, প্লাগইন, এবং প্রয়োজনীয় ড্রাইভ লিংক যুক্ত ও এডিট করুন</p>
                </div>
                <div className="flex gap-2">
                    {activeSubTab === 'tools' ? (
                        <button
                            onClick={() => setToolModal({ isOpen: true, mode: 'create', tool: null })}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> নতুন টুল যোগ করুন
                        </button>
                    ) : (
                        <button
                            onClick={() => setCategoryModal({ isOpen: true, mode: 'create', category: null })}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> নতুন ক্যাটাগরি তৈরি করুন
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs & Search Filter Header */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-2xl border border-gray-150 shadow-sm shrink-0 select-none self-start">
                    <button
                        onClick={() => { setActiveSubTab('tools'); setToolsPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'tools' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Wrench className="h-3.5 w-3.5" /> টুলস তালিকা
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('categories'); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'categories' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Folder className="h-3.5 w-3.5" /> টুলস ক্যাটাগরি
                    </button>
                </div>

                {/* Filters */}
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
                    {activeSubTab === 'tools' ? (
                        <>
                            {/* Search */}
                            <div className="relative min-w-0 sm:max-w-xs flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="টুল এর নাম দিয়ে খুঁজুন..."
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setToolsPage(1); }}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                                />
                            </div>
                            {/* Category Filter */}
                            <select
                                value={categoryFilter}
                                onChange={e => { setCategoryFilter(e.target.value); setToolsPage(1); }}
                                className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                            >
                                <option value="">সব ক্যাটাগরি</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </>
                    ) : (
                        <div className="relative min-w-0 sm:max-w-xs flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ক্যাটাগরির নাম খুঁজুন..."
                                value={categorySearchQuery}
                                onChange={e => setCategorySearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Lists */}
            {activeSubTab === 'tools' ? (
                /* ── TOOLS TABLE ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {toolsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">টুলস তালিকা লোড হচ্ছে...</span>
                        </div>
                    ) : tools.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                            <th className="py-4 px-6">টুলস তথ্য</th>
                                            <th className="py-4 px-6">ক্যাটাগরি</th>
                                            <th className="py-4 px-6">লিংক (URL)</th>
                                            <th className="py-4 px-6 text-center">ক্রম (Order)</th>
                                            <th className="py-4 px-6 text-center">স্ট্যাটাস</th>
                                            <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                        {tools.map(tool => (
                                            <tr key={tool.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {tool.icon ? (
                                                                <img src={tool.icon} className="h-full w-full object-contain p-1" alt={tool.name} />
                                                            ) : (
                                                                <Wrench className="h-5 w-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                                {tool.name}
                                                                {tool.is_featured && (
                                                                    <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-600 text-[9px] font-extrabold uppercase rounded-md border border-yellow-200">Featured</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-gray-400 max-w-[240px] truncate mt-0.5" title={tool.description}>{tool.description || 'কোনো বিবরণ নেই।'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span 
                                                        className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shrink-0 shadow-sm"
                                                        style={{ backgroundColor: tool.category?.color || '#3B82F6' }}
                                                    >
                                                        {tool.category?.name || 'অজ্ঞাত ক্যাটাগরি'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="max-w-[200px] truncate flex items-center gap-1 font-semibold text-gray-500">
                                                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline flex items-center gap-1 truncate">
                                                            {tool.url} <ExternalLink className="h-3 w-3 inline" />
                                                        </a>
                                                    </div>
                                                    {tool.button_text && (
                                                        <span className="text-[9px] text-blue-500 font-bold block mt-0.5">অ্যাকশন: {tool.button_text}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-600">
                                                    {tool.order}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => toggleToolActive(tool)}
                                                            className="focus:outline-none cursor-pointer"
                                                            title={tool.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                                                        >
                                                            {tool.is_active ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-200">
                                                                    <CheckCircle className="h-3 w-3" /> active
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-150">
                                                                    <X className="h-3 w-3" /> inactive
                                                                </span>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setToolModal({ isOpen: true, mode: 'edit', tool })}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                            title="এডিট করুন"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTool(tool.id)}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                                                            title="মুছে ফেলুন"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {toolsPagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                    <span>সর্বমোট {toolsPagination.total} টি টুলসের মধ্যে পৃষ্ঠা {toolsPagination.current_page}/{toolsPagination.last_page}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setToolsPage(p => Math.max(1, p - 1))}
                                            disabled={toolsPagination.current_page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পূর্ববর্তী
                                        </button>
                                        <button
                                            onClick={() => setToolsPage(p => Math.min(toolsPagination.last_page, p + 1))}
                                            disabled={toolsPagination.current_page === toolsPagination.last_page}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পরবর্তী
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <Wrench className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো প্রয়োজনীয় টুলস পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            ) : (
                /* ── CATEGORIES TABLE ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {categoriesLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">ক্যাটাগরি তালিকা লোড হচ্ছে...</span>
                        </div>
                    ) : categories.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="py-4 px-6">ক্যাটাগরি</th>
                                        <th className="py-4 px-6">স্লাগ</th>
                                        <th className="py-4 px-6 text-center">টুল সংখ্যা</th>
                                        <th className="py-4 px-6 text-center">ক্রম (Order)</th>
                                        <th className="py-4 px-6 text-center">স্ট্যাটাস</th>
                                        <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                                                        style={{ backgroundColor: cat.color || '#3B82F6' }}
                                                    >
                                                        {cat.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900">{cat.name}</span>
                                                        {cat.description && (
                                                            <p className="text-[10px] text-gray-400 max-w-[200px] truncate" title={cat.description}>{cat.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-[10px] text-gray-500">
                                                {cat.slug}
                                            </td>
                                            <td className="py-4 px-6 text-center font-bold text-gray-600">
                                                {cat.tools_count ?? 0}
                                            </td>
                                            <td className="py-4 px-6 text-center font-bold text-gray-600">
                                                {cat.order}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => toggleCategoryActive(cat)}
                                                        className="focus:outline-none cursor-pointer"
                                                        title={cat.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                                                    >
                                                        {cat.is_active ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-200">
                                                                <CheckCircle className="h-3 w-3" /> active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-150">
                                                                <X className="h-3 w-3" /> inactive
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => setCategoryModal({ isOpen: true, mode: 'edit', category: cat })}
                                                        className="p-1.5 rounded-lg border border-gray-150 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                        title="এডিট করুন"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                        className="p-1.5 rounded-lg border border-gray-150 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                                                        title="মুছে ফেলুন"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <Folder className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো প্রয়োজনীয় টুলস ক্যাটাগরি তৈরি করা হয়নি।</p>
                        </div>
                    )}
                </div>
            )}

            {/* Category Form Modal */}
            {categoryModal.isOpen && (
                <CategoryModal
                    mode={categoryModal.mode}
                    category={categoryModal.category}
                    onClose={() => setCategoryModal({ isOpen: false, mode: 'create', category: null })}
                    onSaved={handleCategorySaved}
                />
            )}

            {/* Tool Form Modal */}
            {toolModal.isOpen && (
                <ToolModal
                    mode={toolModal.mode}
                    tool={toolModal.tool}
                    categories={categories}
                    onClose={() => setToolModal({ isOpen: false, mode: 'create', tool: null })}
                    onSaved={handleToolSaved}
                />
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    X, Loader2, Video, FileText, File, Eye, EyeOff,
    PlayCircle, Link2, AlignLeft, Clock
} from 'lucide-react';

const TYPE_OPTIONS = [
    { value: 'video', label: 'ভিডিও', icon: Video, color: 'text-blue-600 bg-blue-50' },
    { value: 'text',  label: 'টেক্সট', icon: AlignLeft, color: 'text-orange-600 bg-orange-50' },
    { value: 'file',  label: 'ফাইল', icon: File, color: 'text-purple-600 bg-purple-50' },
];

export default function LessonModal({ mode, lesson, chapterId, onClose, onSaved }) {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        title:        isEdit ? (lesson?.title || '')       : '',
        type:         isEdit ? (lesson?.type  || 'video')  : 'video',
        video_url:    isEdit ? (lesson?.video_url || '')   : '',
        content:      isEdit ? (lesson?.content || '')     : '',
        description:  isEdit ? (lesson?.description || '') : '',
        duration:     isEdit ? (lesson?.duration || '')    : '',
        is_published: isEdit ? !!lesson?.is_published      : true,
        is_preview:   isEdit ? !!lesson?.is_preview        : false,
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
                res = await axios.put(`/api/admin/lessons/${lesson.id}`, form);
            } else {
                res = await axios.post(`/api/admin/chapters/${chapterId}/lessons`, form);
            }
            if (res.data.success) {
                onSaved(res.data.lesson, isEdit);
            }
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
        } finally {
            setSaving(false);
        }
    };

    // Close on backdrop click
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdrop}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {isEdit ? 'লেসন এডিট করুন' : 'নতুন লেসন যোগ করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEdit ? 'লেসনের তথ্য আপডেট করুন' : 'চ্যাপ্টারে নতুন লেসন যোগ করুন'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    {/* Type Selector */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">লেসনের ধরন</label>
                        <div className="grid grid-cols-3 gap-2">
                            {TYPE_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                const isActive = form.type === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, type: opt.value }))}
                                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            শিরোনাম <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                            placeholder="লেসনের শিরোনাম..."
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>}
                    </div>

                    {/* Video URL (only for video type) */}
                    {form.type === 'video' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <Link2 className="h-3.5 w-3.5" /> ভিডিও URL
                            </label>
                            <input
                                type="url"
                                value={form.video_url}
                                onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                            <p className="text-xs text-gray-400 mt-1">YouTube অথবা সরাসরি MP4 URL দিন।</p>
                        </div>
                    )}

                    {/* Content (for text type) */}
                    {form.type === 'text' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">কন্টেন্ট</label>
                            <textarea
                                rows={5}
                                value={form.content}
                                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                placeholder="লেসনের কন্টেন্ট লিখুন..."
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিবরণ</label>
                        <textarea
                            rows={2}
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)..."
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> সময়কাল (সেকেন্ডে)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={form.duration}
                            onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="যেমন: 3600 = ১ ঘণ্টা"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Published */}
                        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-800">প্রকাশিত</p>
                                <p className="text-[10px] text-gray-400">শিক্ষার্থীরা দেখবে</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${form.is_published ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-800">ফ্রি প্রিভিউ</p>
                                <p className="text-[10px] text-gray-400">এনরোল ছাড়া দেখা যাবে</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_preview: !p.is_preview }))}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${form.is_preview ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.is_preview ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        বাতিল
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
                    >
                        {saving
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> সেভ হচ্ছে...</>
                            : isEdit ? 'আপডেট করুন' : 'লেসন যোগ করুন'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

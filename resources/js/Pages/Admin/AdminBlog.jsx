import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    BookMarked, Plus, Pencil, Trash2, Search, X, Loader2, CheckCircle, AlertCircle,
    ToggleLeft, ToggleRight, Eye, Calendar, EyeOff, Hash, Layers, FileText, Upload,
    Image as ImageIcon, HelpCircle, GraduationCap, ChevronLeft, ChevronRight
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

// ── Category Create/Edit Modal ──────────────────────────────────────────────────
function CategoryModal({ mode, category, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        name: isEdit ? (category?.name || '') : '',
        slug: isEdit ? (category?.slug || '') : '',
        description: isEdit ? (category?.description || '') : '',
        meta_title: isEdit ? (category?.meta_title || '') : '',
        meta_description: isEdit ? (category?.meta_description || '') : '',
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
                res = await axios.post(`/api/admin/blog/categories/${category.id}/update`, form);
            } else {
                res = await axios.post('/api/admin/blog/categories', form);
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
                        <h2 className="text-base font-bold text-gray-900">{isEdit ? 'ক্যাটাগরি সংশোধন করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">ব্লগ পোস্ট ক্যাটাগরি তৈরি বা এডিট করুন</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্যাটাগরি নাম <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="যেমন: programming, marketing"
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
                                placeholder="স্লাগ লিখুন..."
                                value={form.slug}
                                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug[0]}</p>}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিবরণ</label>
                        <textarea
                            placeholder="ক্যাটাগরি সম্পর্কে কিছু লিখুন..."
                            rows="3"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                        />
                    </div>

                    {/* SEO fields */}
                    <div className="p-3 bg-gray-50 rounded-2xl space-y-4">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">SEO মেটাডেটা</span>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">মেটা টাইটেল (Meta Title)</label>
                            <input
                                type="text"
                                placeholder="সর্বোচ্চ ৭০ ক্যারেক্টার"
                                value={form.meta_title}
                                onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))}
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">মেটা ডেসক্রিপশন (Meta Description)</label>
                            <textarea
                                placeholder="সর্বোচ্চ ১৬০ ক্যারেক্টার"
                                rows="2"
                                value={form.meta_description}
                                onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))}
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white resize-none"
                            />
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বাতিল</button>
                    <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isEdit ? 'আপডেট' : 'সংরক্ষণ'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Tag Create/Edit Modal ───────────────────────────────────────────────────────
function TagModal({ mode, tag, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        name: isEdit ? (tag?.name || '') : '',
        slug: isEdit ? (tag?.slug || '') : '',
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
                res = await axios.post(`/api/admin/blog/tags/${tag.id}/update`, form);
            } else {
                res = await axios.post('/api/admin/blog/tags', form);
            }
            if (res.data.success) {
                onSaved(res.data.tag, isEdit);
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col max-h-[95vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{isEdit ? 'ট্যাগ সংশোধন করুন' : 'নতুন ট্যাগ যোগ করুন'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ট্যাগ নাম <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="যেমন: Node.js, Web Design"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                    </div>

                    {isEdit && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্লাগ (Slug)</label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug[0]}</p>}
                        </div>
                    )}
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বাতিল</button>
                    <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isEdit ? 'আপডেট' : 'সংরক্ষণ'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Blog Post Create/Edit Modal ──────────────────────────────────────────────────
function BlogPostModal({ mode, post, categories, tags, courses, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        title: isEdit ? (post?.title || '') : '',
        slug: isEdit ? (post?.slug || '') : '',
        blog_category_id: isEdit ? (post?.blog_category_id || '') : '',
        excerpt: isEdit ? (post?.excerpt || '') : '',
        content: isEdit ? (post?.content || '') : '',
        featured_image_alt: isEdit ? (post?.featured_image_alt || '') : '',
        meta_title: isEdit ? (post?.meta_title || '') : '',
        meta_description: isEdit ? (post?.meta_description || '') : '',
        meta_keywords: isEdit ? (post?.meta_keywords || '') : '',
        canonical_url: isEdit ? (post?.canonical_url || '') : '',
        schema_type: isEdit ? (post?.schema_type || 'BlogPosting') : 'BlogPosting',
        is_indexable: isEdit ? !!post?.is_indexable : true,
        is_followable: isEdit ? !!post?.is_followable : true,
        status: isEdit ? (post?.status || 'draft') : 'draft',
        published_at: isEdit ? (post?.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '') : '',
        scheduled_at: isEdit ? (post?.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : '') : '',
    });

    const [selectedTags, setSelectedTags] = useState(isEdit && post?.tags ? post.tags.map(t => t.id) : []);
    const [selectedCourses, setSelectedCourses] = useState(isEdit && post?.related_courses ? post.related_courses : []);

    const [featuredFile, setFeaturedFile] = useState(null);
    const [featuredPreview, setFeaturedPreview] = useState(isEdit ? post?.featured_image : null);

    const [ogFile, setOgFile] = useState(null);
    const [ogPreview, setOgPreview] = useState(isEdit ? post?.og_image : null);

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const fileFeaturedRef = useRef(null);
    const fileOgRef = useRef(null);

    const handleFeaturedChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFeaturedFile(file);
            setFeaturedPreview(URL.createObjectURL(file));
        }
    };

    const handleOgChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOgFile(file);
            setOgPreview(URL.createObjectURL(file));
        }
    };

    const handleTagToggle = (tagId) => {
        setSelectedTags(p => p.includes(tagId) ? p.filter(id => id !== tagId) : [...p, tagId]);
    };

    const handleCourseToggle = (courseId) => {
        setSelectedCourses(p => p.includes(courseId) ? p.filter(id => id !== courseId) : [...p, courseId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (form[key] !== null && form[key] !== undefined) {
                if (typeof form[key] === 'boolean') {
                    formData.append(key, form[key] ? '1' : '0');
                } else {
                    formData.append(key, form[key]);
                }
            }
        });

        // Append arrays
        selectedTags.forEach(tagId => formData.append('tags[]', tagId));
        selectedCourses.forEach(courseId => formData.append('related_courses[]', courseId));

        if (featuredFile) {
            formData.append('featured_image_file', featuredFile);
        }
        if (ogFile) {
            formData.append('og_image_file', ogFile);
        }

        try {
            let res;
            if (isEdit) {
                res = await axios.post(`/api/admin/blog/posts/${post.id}/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axios.post('/api/admin/blog/posts', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            if (res.data.success) {
                onSaved(res.data.post, isEdit);
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
            <div className="bg-[#f8fafc] rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white rounded-t-3xl shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{isEdit ? 'ব্লগ পোস্ট সংশোধন করুন' : 'নতুন ব্লগ পোস্ট তৈরি করুন'}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">নতুন ব্লগ পোস্ট লিখে পাবলিশ করুন</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow p-6 space-y-6 bg-white">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ব্লগ টাইটেল (Title) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="ব্লগ পোস্টের আকর্ষণীয় শিরোনাম লিখুন..."
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-semibold text-gray-800 transition-all bg-white"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>}
                    </div>

                    {/* Slug & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isEdit ? (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্লাগ (Slug)</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all bg-white"
                                />
                                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug[0]}</p>}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400 flex items-center pt-8">স্লাগ অটোমেটিক তৈরি হবে শিরোনাম অনুযায়ী</div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্যাটাগরি <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={form.blog_category_id}
                                onChange={e => setForm(p => ({ ...p, blog_category_id: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-semibold text-gray-700 bg-white"
                            >
                                <option value="">সিলেক্ট করুন</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.blog_category_id && <p className="text-xs text-red-500 mt-1">{errors.blog_category_id[0]}</p>}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">সংক্ষিপ্ত বিবরণ (Excerpt)</label>
                        <textarea
                            placeholder="পোস্টের একটি সংক্ষিপ্ত ভূমিকা লিখুন যা পোস্ট কার্ডে দেখাবে..."
                            rows="2"
                            value={form.excerpt}
                            onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                        />
                        {errors.excerpt && <p className="text-xs text-red-500 mt-1">{errors.excerpt[0]}</p>}
                    </div>

                    {/* Featured Image upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফিচার্ড ইমেজ (Featured Image) <span className="text-red-500">*</span></label>
                        <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-2xl border border-gray-150">
                            <div className="h-20 w-28 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                {featuredPreview ? (
                                    <img src={featuredPreview} className="h-full w-full object-cover" alt="Featured Preview" />
                                ) : (
                                    <ImageIcon className="h-7 w-7 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <button
                                    type="button"
                                    onClick={() => fileFeaturedRef.current.click()}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-250 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer bg-white shadow-sm"
                                >
                                    <Upload className="h-3.5 w-3.5 text-gray-500" /> ইমেজ সিলেক্ট করুন
                                </button>
                                <p className="text-[10px] text-gray-400 mt-1">পরামর্শ: 800x450 বা ১৬:৯ অনুপাত (Max: 2MB)</p>
                            </div>
                            <input
                                type="file"
                                ref={fileFeaturedRef}
                                onChange={handleFeaturedChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        {errors.featured_image && <p className="text-xs text-red-500 mt-1">{errors.featured_image[0]}</p>}
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">পোস্টের কন্টেন্ট (Content) <span className="text-red-500">*</span></label>
                        <textarea
                            placeholder="পোস্টের মূল বিষয়বস্তু এখানে লিখুন (HTML সাপোর্ট করবে)..."
                            rows="10"
                            required
                            value={form.content}
                            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all font-mono"
                        />
                        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content[0]}</p>}
                    </div>

                    {/* Image Alt */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফিচার্ড ইমেজ Alt টেক্সট (SEO এর জন্য)</label>
                        <input
                            type="text"
                            placeholder="যেমন: react premium course card"
                            value={form.featured_image_alt}
                            onChange={e => setForm(p => ({ ...p, featured_image_alt: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all bg-white"
                        />
                    </div>

                    {/* Tags Multi-select */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ট্যাগ সমূহ সিলেক্ট করুন</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-150">
                            {tags.length > 0 ? (
                                tags.map(tag => {
                                    const active = selectedTags.includes(tag.id);
                                    return (
                                        <button
                                            type="button"
                                            key={tag.id}
                                            onClick={() => handleTagToggle(tag.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                        >
                                            # {tag.name}
                                        </button>
                                    );
                                })
                            ) : (
                                <span className="text-xs text-gray-400">কোনো ট্যাগ পাওয়া যায়নি। আগে ট্যাগ যোগ করুন।</span>
                            )}
                        </div>
                    </div>

                    {/* Related Courses (Good for marketing courses inside blogs) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">সম্পর্কিত কোর্স (Related Courses - অভ্যন্তরীণ লিঙ্কিং এর জন্য)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-150 max-h-48 overflow-y-auto">
                            {courses.map(course => {
                                const active = selectedCourses.includes(course.id);
                                return (
                                    <button
                                        type="button"
                                        key={course.id}
                                        onClick={() => handleCourseToggle(course.id)}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${active ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <GraduationCap className="h-4 w-4 shrink-0 text-gray-400" />
                                        <span className="truncate">{course.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Publish & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">পাবলিশ স্ট্যাটাস <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={form.status}
                                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-semibold text-gray-700 bg-white"
                            >
                                <option value="draft">Draft (খসড়া)</option>
                                <option value="published">Published (সরাসরি প্রকাশ)</option>
                                <option value="scheduled">Scheduled (সময় নির্ধারণ)</option>
                            </select>
                        </div>
                        {form.status === 'scheduled' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">কবে পাবলিশ হবে (Scheduled Time) <span className="text-red-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={form.scheduled_at}
                                    onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all bg-white"
                                />
                            </div>
                        )}
                    </div>

                    {/* SEO Block */}
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-4 border border-gray-150">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">SEO মেটাডেটা (Search Engine Optimization)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">মেটা টাইটেল (Meta Title)</label>
                                <input
                                    type="text"
                                    placeholder="গুগল সার্চে দেখানোর শিরোনাম"
                                    value={form.meta_title}
                                    onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">ক্যানোনিকাল ইউআরএল (Canonical URL)</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={form.canonical_url}
                                    onChange={e => setForm(p => ({ ...p, canonical_url: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">মেটা ডেসক্রিপশন (Meta Description)</label>
                            <textarea
                                placeholder="সার্চ ইঞ্জিনের জন্য আকর্ষণীয় বর্ণনা লিখুন (১৬০ ক্যারেক্টার)..."
                                rows="2"
                                value={form.meta_description}
                                onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">মেটা কিওয়ার্ডস (Keywords - কমা দিয়ে লিখুন)</label>
                            <input
                                type="text"
                                placeholder="যেমন: react, hooks, javascript tutorials"
                                value={form.meta_keywords}
                                onChange={e => setForm(p => ({ ...p, meta_keywords: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                            />
                        </div>

                        {/* OG image upload */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">সোশ্যাল শেয়ারিং ইমেজ (OG Image)</label>
                            <div className="flex gap-4 items-center bg-white p-2.5 rounded-xl border border-gray-200">
                                <div className="h-14 w-20 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                    {ogPreview ? (
                                        <img src={ogPreview} className="h-full w-full object-cover" alt="OG Preview" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <button
                                        type="button"
                                        onClick={() => fileOgRef.current.click()}
                                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-250 hover:bg-gray-50 rounded-xl text-[10px] font-semibold text-gray-700 cursor-pointer bg-white"
                                    >
                                        <Upload className="h-3 w-3 text-gray-500" /> ওজি ইমেজ সিলেক্ট করুন
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileOgRef}
                                    onChange={handleOgChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Robot indexable settings */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-white rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-800">গুগল ইন্ডেক্সিং (Index)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, is_indexable: !p.is_indexable }))}
                                    className="text-blue-600 focus:outline-none cursor-pointer shrink-0"
                                >
                                    {form.is_indexable ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-gray-300" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-gray-800">লিংক ফলো (Follow Links)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, is_followable: !p.is_followable }))}
                                    className="text-blue-600 focus:outline-none cursor-pointer shrink-0"
                                >
                                    {form.is_followable ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-gray-300" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বাতিল</button>
                    <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isEdit ? 'আপডেট করুন' : 'পাবলিশ করুন'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminBlog() {
    const [activeSubTab, setActiveSubTab] = useState('posts'); // posts, categories, tags

    // Posts states
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [courses, setCourses] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsPagination, setPostsPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [postsPage, setPostsPage] = useState(1);
    const [postsSearch, setPostsSearch] = useState('');
    const [postsCategoryFilter, setPostsCategoryFilter] = useState('');
    const [postsStatusFilter, setPostsStatusFilter] = useState('');

    // Categories states
    const [categoriesList, setCategoriesList] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesPagination, setCategoriesPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [categoriesPage, setCategoriesPage] = useState(1);

    // Tags states
    const [tagsList, setTagsList] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(true);
    const [tagsPagination, setTagsPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [tagsPage, setTagsPage] = useState(1);

    // Modals & Notifications
    const [postModal, setPostModal] = useState({ isOpen: false, mode: 'create', post: null });
    const [categoryModal, setCategoryModal] = useState({ isOpen: false, mode: 'create', category: null });
    const [tagModal, setTagModal] = useState({ isOpen: false, mode: 'create', tag: null });
    const [toast, setToast] = useState(null);

    // Fetch Posts & select boxes data
    const fetchPosts = async (page = 1, search = '', category = '', status = '') => {
        setPostsLoading(true);
        try {
            const res = await axios.get('/api/admin/blog/posts', {
                params: { page, search, category, status }
            });
            if (res.data.success) {
                setPosts(res.data.posts.data);
                setCategories(res.data.categories);
                setTags(res.data.tags);
                setCourses(res.data.courses);
                setPostsPagination({
                    current_page: res.data.posts.current_page,
                    last_page: res.data.posts.last_page,
                    total: res.data.posts.total
                });
            }
        } catch (err) {
            console.error('Error fetching blog posts', err);
        } finally {
            setPostsLoading(false);
        }
    };

    // Fetch Categories Tab
    const fetchCategoriesTab = async (page = 1) => {
        setCategoriesLoading(true);
        try {
            const res = await axios.get('/api/admin/blog/categories', { params: { page } });
            if (res.data.success) {
                setCategoriesList(res.data.categories.data);
                setCategoriesPagination({
                    current_page: res.data.categories.current_page,
                    last_page: res.data.categories.last_page,
                    total: res.data.categories.total
                });
            }
        } catch (err) {
            console.error('Error fetching blog categories', err);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Fetch Tags Tab
    const fetchTagsTab = async (page = 1) => {
        setTagsLoading(true);
        try {
            const res = await axios.get('/api/admin/blog/tags', { params: { page } });
            if (res.data.success) {
                setTagsList(res.data.tags.data);
                setTagsPagination({
                    current_page: res.data.tags.current_page,
                    last_page: res.data.tags.last_page,
                    total: res.data.tags.total
                });
            }
        } catch (err) {
            console.error('Error fetching blog tags', err);
        } finally {
            setTagsLoading(false);
        }
    };

    useEffect(() => {
        if (activeSubTab === 'posts') {
            fetchPosts(postsPage, postsSearch, postsCategoryFilter, postsStatusFilter);
        } else if (activeSubTab === 'categories') {
            fetchCategoriesTab(categoriesPage);
        } else if (activeSubTab === 'tags') {
            fetchTagsTab(tagsPage);
        }
    }, [activeSubTab, postsPage, postsSearch, postsCategoryFilter, postsStatusFilter, categoriesPage, tagsPage]);

    // Handle Post Saved
    const handlePostSaved = (savedPost, isEdit, error = null) => {
        if (error) {
            setToast({ type: 'error', message: error });
            return;
        }
        setPostModal({ isOpen: false, mode: 'create', post: null });
        fetchPosts(postsPage, postsSearch, postsCategoryFilter, postsStatusFilter);
        setToast({
            type: 'success',
            message: isEdit ? 'ব্লগ পোস্ট সফলভাবে আপডেট করা হয়েছে!' : 'নতুন ব্লগ পোস্ট সফলভাবে পাবলিশ করা হয়েছে!'
        });
    };

    // Delete Post
    const handleDeletePost = async (id) => {
        if (!confirm('আপনি কি নিশ্চিতভাবে এই ব্লগ পোস্টটি মুছে ফেলতে চান?')) return;
        try {
            const res = await axios.delete(`/api/admin/blog/posts/${id}`);
            if (res.data.success) {
                fetchPosts(postsPage, postsSearch, postsCategoryFilter, postsStatusFilter);
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'পোস্টটি মুছতে ব্যর্থ হয়েছে।' });
        }
    };

    // Handle Category Saved
    const handleCategorySaved = (savedCategory, isEdit, error = null) => {
        if (error) {
            setToast({ type: 'error', message: error });
            return;
        }
        setCategoryModal({ isOpen: false, mode: 'create', category: null });
        fetchCategoriesTab(categoriesPage);
        setToast({
            type: 'success',
            message: isEdit ? 'ক্যাটাগরি আপডেট করা হয়েছে!' : 'নতুন ক্যাটাগরি যোগ করা হয়েছে!'
        });
    };

    // Delete Category
    const handleDeleteCategory = async (id) => {
        if (!confirm('আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি মুছে ফেলতে চান?')) return;
        try {
            const res = await axios.delete(`/api/admin/blog/categories/${id}`);
            if (res.data.success) {
                fetchCategoriesTab(categoriesPage);
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।' });
        }
    };

    // Handle Tag Saved
    const handleTagSaved = (savedTag, isEdit, error = null) => {
        if (error) {
            setToast({ type: 'error', message: error });
            return;
        }
        setTagModal({ isOpen: false, mode: 'create', tag: null });
        fetchTagsTab(tagsPage);
        setToast({
            type: 'success',
            message: isEdit ? 'ট্যাগ আপডেট করা হয়েছে!' : 'নতুন ট্যাগ যোগ করা হয়েছে!'
        });
    };

    // Delete Tag
    const handleDeleteTag = async (id) => {
        if (!confirm('আপনি কি নিশ্চিতভাবে এই ট্যাগ মুছে ফেলতে চান?')) return;
        try {
            const res = await axios.delete(`/api/admin/blog/tags/${id}`);
            if (res.data.success) {
                fetchTagsTab(tagsPage);
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'ট্যাগ মুছতে ব্যর্থ হয়েছে।' });
        }
    };

    return (
        <div className="space-y-6">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BookMarked className="h-6 w-6 text-blue-600" /> ব্লগ ও কন্টেন্ট ম্যানেজমেন্ট
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-light">ব্লগ পোস্টসমূহ লিখুন, মেটা ট্যাগ অপ্টিমাইজ করুন এবং কন্টেন্ট ক্যাটাগরি পরিচালনা করুন</p>
                </div>
                <div className="flex gap-2">
                    {activeSubTab === 'posts' && (
                        <button
                            onClick={() => setPostModal({ isOpen: true, mode: 'create', post: null })}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> নতুন ব্লগ পোস্ট
                        </button>
                    )}
                    {activeSubTab === 'categories' && (
                        <button
                            onClick={() => setCategoryModal({ isOpen: true, mode: 'create', category: null })}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> নতুন ক্যাটাগরি
                        </button>
                    )}
                    {activeSubTab === 'tags' && (
                        <button
                            onClick={() => setTagModal({ isOpen: true, mode: 'create', tag: null })}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> নতুন ট্যাগ
                        </button>
                    )}
                </div>
            </div>

            {/* Sub-tabs and Search Bar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="flex bg-white p-1 rounded-2xl border border-gray-150 shadow-sm shrink-0 select-none self-start">
                    <button
                        onClick={() => { setActiveSubTab('posts'); setPostsPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'posts' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <FileText className="h-3.5 w-3.5" /> পোস্ট সমূহ
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('categories'); setCategoriesPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'categories' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Layers className="h-3.5 w-3.5" /> ক্যাটাগরি সমূহ
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('tags'); setTagsPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'tags' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Hash className="h-3.5 w-3.5" /> ট্যাগ সমূহ
                    </button>
                </div>

                {/* Post Filters */}
                {activeSubTab === 'posts' && (
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
                        <div className="relative min-w-0 sm:max-w-xs flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="পোস্ট টাইটেল দিয়ে খুঁজুন..."
                                value={postsSearch}
                                onChange={e => { setPostsSearch(e.target.value); setPostsPage(1); }}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                            />
                        </div>
                        <select
                            value={postsCategoryFilter}
                            onChange={e => { setPostsCategoryFilter(e.target.value); setPostsPage(1); }}
                            className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                        >
                            <option value="">সব ক্যাটাগরি</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <select
                            value={postsStatusFilter}
                            onChange={e => { setPostsStatusFilter(e.target.value); setPostsPage(1); }}
                            className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                        >
                            <option value="">সব স্ট্যাটাস</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Sub content blocks */}
            {activeSubTab === 'posts' ? (
                /* ── POSTS TAB ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {postsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">পোস্ট লিস্ট লোড হচ্ছে...</span>
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                            <th className="py-4 px-6">পোস্ট</th>
                                            <th className="py-4 px-6">ক্যাটাগরি</th>
                                            <th className="py-4 px-6 text-center">পড়বার সময়</th>
                                            <th className="py-4 px-6 text-center">ভিউস</th>
                                            <th className="py-4 px-6 text-center">স্ট্যাটাস</th>
                                            <th className="py-4 px-6 text-center">তারিখ</th>
                                            <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                        {posts.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-14 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                            {p.featured_image ? (
                                                                <img src={p.featured_image} className="h-full w-full object-cover" alt="" />
                                                            ) : (
                                                                <ImageIcon className="h-5 w-5 text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-bold text-gray-900 block truncate max-w-[260px]" title={p.title}>{p.title}</span>
                                                            <p className="text-[10px] text-gray-400">লেখক: {p.author?.name || 'Admin'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-semibold text-gray-600">
                                                    {p.category?.name || <span className="text-gray-300">Uncategorized</span>}
                                                </td>
                                                <td className="py-4 px-6 text-center text-gray-500 font-semibold">
                                                    {p.reading_time || 0} মিনিট
                                                    <p className="text-[9px] text-gray-400">{p.word_count || 0} শব্দ</p>
                                                </td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-700">
                                                    {p.views_count}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        {p.status === 'published' && (
                                                            <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-150 rounded text-[10px] font-bold">Published</span>
                                                        )}
                                                        {p.status === 'draft' && (
                                                            <span className="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded text-[10px] font-bold">Draft</span>
                                                        )}
                                                        {p.status === 'scheduled' && (
                                                            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-750 border border-yellow-200 rounded text-[10px] font-bold">Scheduled</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center text-gray-400 font-semibold">
                                                    {new Date(p.created_at).toLocaleDateString('bn-BD')}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setPostModal({ isOpen: true, mode: 'edit', post: p })}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                            title="সম্পাদনা"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePost(p.id)}
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

                            {/* Pagination */}
                            {postsPagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                    <span>সর্বমোট {postsPagination.total} টি আর্টিকেলের মধ্যে পৃষ্ঠা {postsPagination.current_page}/{postsPagination.last_page}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPostsPage(p => Math.max(1, p - 1))}
                                            disabled={postsPagination.current_page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পূর্ববর্তী
                                        </button>
                                        <button
                                            onClick={() => setPostsPage(p => Math.min(postsPagination.last_page, p + 1))}
                                            disabled={postsPagination.current_page === postsPagination.last_page}
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
                            <BookMarked className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো ব্লগ পোস্ট পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            ) : activeSubTab === 'categories' ? (
                /* ── CATEGORIES TAB ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {categoriesLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">ক্যাটাগরি লোড হচ্ছে...</span>
                        </div>
                    ) : categoriesList.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                            <th className="py-4 px-6">ক্যাটাগরি</th>
                                            <th className="py-4 px-6">স্লাগ</th>
                                            <th className="py-4 px-6">বর্ণনা</th>
                                            <th className="py-4 px-6 text-center">পোস্ট সংখ্যা</th>
                                            <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                        {categoriesList.map(cat => (
                                            <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6 font-bold text-gray-900">{cat.name}</td>
                                                <td className="py-4 px-6 font-mono text-blue-600 text-xs">{cat.slug}</td>
                                                <td className="py-4 px-6 text-gray-500 truncate max-w-[200px]" title={cat.description}>{cat.description || 'N/A'}</td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-700">{cat.posts_count} টি</td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setCategoryModal({ isOpen: true, mode: 'edit', category: cat })}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
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

                            {/* Pagination */}
                            {categoriesPagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                    <span>সর্বমোট {categoriesPagination.total} টি ক্যাটাগরির পৃষ্ঠা {categoriesPagination.current_page}/{categoriesPagination.last_page}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCategoriesPage(p => Math.max(1, p - 1))}
                                            disabled={categoriesPagination.current_page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পূর্ববর্তী
                                        </button>
                                        <button
                                            onClick={() => setCategoriesPage(p => Math.min(categoriesPagination.last_page, p + 1))}
                                            disabled={categoriesPagination.current_page === categoriesPagination.last_page}
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
                            <Layers className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            ) : (
                /* ── TAGS TAB ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {tagsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">ট্যাগ সমূহ লোড হচ্ছে...</span>
                        </div>
                    ) : tagsList.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                            <th className="py-4 px-6">ট্যাগ</th>
                                            <th className="py-4 px-6">স্লাগ</th>
                                            <th className="py-4 px-6 text-center">পোস্ট সংখ্যা</th>
                                            <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                        {tagsList.map(tag => (
                                            <tr key={tag.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6 font-bold text-gray-900"># {tag.name}</td>
                                                <td className="py-4 px-6 font-mono text-blue-600 text-xs">{tag.slug}</td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-700">{tag.posts_count} টি</td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setTagModal({ isOpen: true, mode: 'edit', tag: tag })}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTag(tag.id)}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
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

                            {/* Pagination */}
                            {tagsPagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                    <span>সর্বমোট {tagsPagination.total} টি ট্যাগের পৃষ্ঠা {tagsPagination.current_page}/{tagsPagination.last_page}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTagsPage(p => Math.max(1, p - 1))}
                                            disabled={tagsPagination.current_page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পূর্ববর্তী
                                        </button>
                                        <button
                                            onClick={() => setTagsPage(p => Math.min(tagsPagination.last_page, p + 1))}
                                            disabled={tagsPagination.current_page === tagsPagination.last_page}
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
                            <Hash className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো ট্যাগ পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            )}

            {/* Category Modal */}
            {categoryModal.isOpen && (
                <CategoryModal
                    mode={categoryModal.mode}
                    category={categoryModal.category}
                    onClose={() => setCategoryModal({ isOpen: false, mode: 'create', category: null })}
                    onSaved={handleCategorySaved}
                />
            )}

            {/* Tag Modal */}
            {tagModal.isOpen && (
                <TagModal
                    mode={tagModal.mode}
                    tag={tagModal.tag}
                    onClose={() => setTagModal({ isOpen: false, mode: 'create', tag: null })}
                    onSaved={handleTagSaved}
                />
            )}

            {/* Post Modal */}
            {postModal.isOpen && (
                <BlogPostModal
                    mode={postModal.mode}
                    post={postModal.post}
                    categories={categories}
                    tags={tags}
                    courses={courses}
                    onClose={() => setPostModal({ isOpen: false, mode: 'create', post: null })}
                    onSaved={handlePostSaved}
                />
            )}
        </div>
    );
}

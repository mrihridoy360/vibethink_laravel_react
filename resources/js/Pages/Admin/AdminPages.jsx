import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileText, Plus, Edit, Trash2, CheckCircle, XCircle, Search,
    ArrowLeft, Save, Loader2, Globe, Eye, Code
} from 'lucide-react';

export default function AdminPages() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    // Edit/Create mode state
    const [isEditing, setIsEditing] = useState(false);
    const [activePageId, setActivePageId] = useState(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [slugManualEdit, setSlugManualEdit] = useState(false);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchPages = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/admin/pages');
            if (data.success) {
                setPages(data.pages);
            }
        } catch (err) {
            showToast('error', 'পেজ তালিকা লোড করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    // Slug generator logic (runs when title changes, unless manually overridden)
    const handleTitleChange = (val) => {
        setTitle(val);
        if (!slugManualEdit && !activePageId) {
            const generatedSlug = val
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except spaces/hyphens
                .trim()
                .replace(/\s+/g, '-');       // replace spaces with hyphens
            setSlug(generatedSlug);
        }
    };

    const handleSlugChange = (val) => {
        setSlug(val.toLowerCase().replace(/\s+/g, '-'));
        setSlugManualEdit(true);
    };

    const handleToggleStatus = async (page) => {
        try {
            const { data } = await axios.post(`/api/admin/pages/${page.id}/toggle`);
            if (data.success) {
                setPages(prev => prev.map(p => p.id === page.id ? data.page : p));
                showToast('success', data.message);
            }
        } catch (err) {
            showToast('error', 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
        }
    };

    const handleDelete = async (page) => {
        if (!window.confirm(`আপনি কি নিশ্চিত যে আপনি "${page.title}" পেজটি মুছে ফেলতে চান?`)) {
            return;
        }
        try {
            const { data } = await axios.delete(`/api/admin/pages/${page.id}`);
            if (data.success) {
                setPages(prev => prev.filter(p => p.id !== page.id));
                showToast('success', data.message);
            }
        } catch (err) {
            showToast('error', 'পেজটি মুছতে সমস্যা হয়েছে।');
        }
    };

    const startEditing = (page) => {
        setIsEditing(true);
        setActivePageId(page.id);
        setTitle(page.title);
        setSlug(page.slug);
        setContent(page.content || '');
        setIsActive(page.is_active);
        setSlugManualEdit(true);
    };

    const startCreating = () => {
        setIsEditing(true);
        setActivePageId(null);
        setTitle('');
        setSlug('');
        setContent('');
        setIsActive(true);
        setSlugManualEdit(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title || !slug) {
            alert('শিরোনাম এবং স্ল্যাগ আবশ্যক!');
            return;
        }

        setSaving(true);
        const payload = { title, slug, content, is_active: isActive };

        try {
            if (activePageId) {
                // Update
                const { data } = await axios.put(`/api/admin/pages/${activePageId}`, payload);
                if (data.success) {
                    setPages(prev => prev.map(p => p.id === activePageId ? data.page : p));
                    showToast('success', data.message);
                    setIsEditing(false);
                }
            } else {
                // Create
                const { data } = await axios.post('/api/admin/pages', payload);
                if (data.success) {
                    setPages(prev => [data.page, ...prev]);
                    showToast('success', data.message);
                    setIsEditing(false);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে। সম্ভবত এই স্ল্যাগটি ইতিমধ্যে ব্যবহৃত হচ্ছে।';
            showToast('error', msg);
        } finally {
            setSaving(false);
        }
    };

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">পেজ তালিকা লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Toast */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800">পেজ ম্যানেজমেন্ট</h2>
                    <p className="text-sm text-slate-500 mt-0.5">সাইটের স্ট্যাটিক পেজসমূহ (যেমন: Privacy, Terms, FAQ ইত্যাদি) তৈরি ও এডিট করুন।</p>
                </div>
                {toast && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {toast.message}
                    </div>
                )}
            </div>

            {/* Pages Table List */}
            {!isEditing && (
                <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="পেজ বা স্ল্যাগ খুঁজুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <button
                            onClick={startCreating}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow transition-all duration-200 cursor-pointer border-none"
                        >
                            <Plus className="w-4 h-4" /> নতুন পেজ তৈরি করুন
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">শিরোনাম</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ইউআরএল স্ল্যাগ (Slug)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">অবস্থা</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredPages.length > 0 ? (
                                        filteredPages.map((page) => (
                                            <tr key={page.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 pl-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800">{page.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">
                                                        /{page.slug}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleStatus(page)}
                                                        className="focus:outline-none"
                                                        title={page.is_active ? 'নিষ্ক্রিয় করতে ক্লিক করুন' : 'সক্রিয় করতে ক্লিক করুন'}
                                                    >
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${page.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-450'}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${page.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                            {page.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right pr-6 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => startEditing(page)}
                                                            className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded-lg text-slate-400 transition-all cursor-pointer border-none bg-transparent"
                                                            title="সম্পাদনা করুন"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(page)}
                                                            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-all cursor-pointer border-none bg-transparent"
                                                            title="মুছে ফেলুন"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-sm font-semibold text-slate-450">
                                                কোনো পেজ পাওয়া যায়নি।
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Page view */}
            {isEditing && (
                <form onSubmit={handleSave} className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors w-fit cursor-pointer border-none bg-transparent"
                        >
                            <ArrowLeft className="w-4 h-4" /> ফিরে যান
                        </button>
                        <div className="flex items-center gap-2">
                            {/* Toggle active status */}
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-xs font-bold text-slate-600">অবস্থা:</span>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                                <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'text-slate-450'}`}>
                                    {isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-xs font-bold transition-all disabled:bg-blue-300 cursor-pointer border-none"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                সংরক্ষণ করুন
                            </button>
                        </div>
                    </div>

                    {/* Inputs Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">পেজ শিরোনাম</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="যেমন: আমাদের সম্পর্কে"
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">ইউআরএল স্ল্যাগ (Slug)</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/</span>
                                    <input
                                        type="text"
                                        required
                                        value={slug}
                                        onChange={(e) => handleSlugChange(e.target.value)}
                                        placeholder="about-us"
                                        className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Page Content Editor */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-600">পেজ কন্টেন্ট (HTML/Plain Text)</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="এখানে পেজের কন্টেন্ট লিখুন (এইচটিএমএল ট্যাগ সমর্থন করে)..."
                                className="w-full h-80 px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm resize-none"
                            />
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

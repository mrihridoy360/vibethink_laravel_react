import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, BookOpen, Tag, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import AdminLayout from '../../Components/AdminLayout';

export default function AdminCourseCreate() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ title: '', category_id: '' });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);

    useEffect(() => {
        axios.get('/api/admin/categories').then(res => {
            if (res.data.success) setCategories(res.data.categories);
        }).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('category_id', form.category_id);
            const res = await axios.post('/api/admin/courses', fd);
            if (res.data.success) {
                navigate(`/admin/courses/${res.data.course.id}/edit`);
            }
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
            else setToast({ type: 'error', message: 'কোর্স তৈরি করতে সমস্যা হয়েছে।' });
        } finally {
            setSaving(false);
        }
    };

    const customHeader = (
        <div className="flex items-center gap-3">
            <Link to="/admin/courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors">
                <ArrowLeft className="h-4 w-4" />
                কোর্স তালিকা
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-bold text-gray-900">নতুন কোর্স</span>
        </div>
    );

    return (
        <AdminLayout activeTab="courses" headerContent={customHeader}>
            <div className="flex items-center justify-center py-10">
                <div className="w-full max-w-xl">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Card Header */}
                        <div className="px-8 py-7 border-b border-gray-50">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2.5 bg-blue-50 rounded-2xl">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">কোর্সের নাম দিন</h1>
                            </div>
                            <p className="text-sm text-gray-400 mt-2 ml-[52px]">
                                চিন্তা করবেন না, পরে যেকোনো সময় পরিবর্তন করা যাবে।
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    কোর্সের শিরোনাম <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="যেমন: Advanced React Development"
                                    className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.title && (
                                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {errors.title[0]}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                    <Tag className="h-3.5 w-3.5" /> ক্যাটাগরি
                                </label>
                                <select
                                    id="category"
                                    value={form.category_id}
                                    onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                                >
                                    <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Toast */}
                            {toast && (
                                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                    {toast.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                    {toast.message}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2">
                                <Link
                                    to="/admin/courses"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" /> বাতিল
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 disabled:opacity-60"
                                >
                                    {saving ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> তৈরি হচ্ছে...</>
                                    ) : (
                                        <>পরবর্তী →</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

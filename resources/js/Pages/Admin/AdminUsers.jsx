import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, User, BookOpen, ChevronLeft, ChevronRight, Shield,
    Pencil, Trash2, X, Loader2, CheckCircle, AlertCircle, Phone, Mail
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

// ── User Edit Modal ───────────────────────────────────────────────────────────
function UserEditModal({ user, onClose, onSaved }) {
    const [form, setForm] = useState({
        name:     user?.name || '',
        email:    user?.email || '',
        phone:    user?.phone || '',
        role:     user?.role || 'student',
        password: '',
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            const res = await axios.put(`/api/admin/users/${user.id}`, form);
            if (res.data.success) {
                onSaved(res.data.user);
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
                        <h2 className="text-base font-bold text-gray-900">ব্যবহারকারী তথ্য পরিবর্তন</h2>
                        <p className="text-xs text-gray-400 mt-0.5">প্রোফাইল বিবরণ ও রোল পরিবর্তন করুন</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">নাম <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="পূর্ণ নাম লিখুন..."
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" />ইমেইল <span className="text-red-500">*</span></label>
                        <input
                            type="email" required
                            value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="ইমেইল এড্রেস..."
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" />ফোন নম্বর</label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="ফোন নম্বর..."
                        />
                    </div>

                    {/* Role selector */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-gray-400" />ভূমিকা (Role)</label>
                        <select
                            value={form.role}
                            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                        >
                            <option value="student">শিক্ষার্থী (Student)</option>
                            <option value="admin">অ্যাডমিন (Admin)</option>
                        </select>
                    </div>

                    {/* Password reset optional */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">নতুন পাসওয়ার্ড (ঐচ্ছিক)</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                            placeholder="পাসওয়ার্ড পরিবর্তন করতে চাইলে লিখুন..."
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm"
                        >
                            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> সেভ হচ্ছে...</> : 'আপডেট করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── User Delete Modal ──────────────────────────────────────────────────────────
function UserDeleteModal({ user, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleDelete = async () => {
        setDeleting(true);
        setErrorMsg('');
        try {
            const res = await axios.delete(`/api/admin/users/${user.id}`);
            if (res.data.success) {
                onDeleted(user.id);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'ব্যবহারকারী মুছতে সমস্যা হয়েছে।');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">ব্যবহারকারী মুছে ফেলবেন?</h3>
                <p className="text-sm text-gray-500 mb-1">
                    <span className="font-semibold text-gray-800">"{user.name}"</span> এর অ্যাকাউন্ট স্থায়ীভাবে মুছে যাবে।
                </p>
                <p className="text-xs text-red-500 mb-4">এই ব্যবহারকারীর সমস্ত এনরোলমেন্ট মুছে যাবে। এটি আর ফেরত পাওয়া যাবে না।</p>
                
                {errorMsg && (
                    <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                        {errorMsg}
                    </div>
                )}

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

// ── Main AdminUsers Component ─────────────────────────────────────────────────
export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);

    // Modal & Toast States
    const [editTarget, setEditTarget]     = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }), ...(roleFilter && { role: roleFilter }) });
            const res = await axios.get(`/api/admin/users?${params}`);
            if (res.data.success) {
                setUsers(res.data.users.data || []);
                setMeta(res.data.users);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [search, roleFilter, page]);

    const handleSaved = (savedUser) => {
        setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
        showToast('ব্যবহারকারী তথ্য সফলভাবে আপডেট করা হয়েছে।');
        setEditTarget(null);
    };

    const handleDeleted = (userId) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast('ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Edit Modal */}
            {editTarget && (
                <UserEditModal
                    user={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <UserDeleteModal
                    user={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={handleDeleted}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">ব্যবহারকারী</h2>
                    <p className="text-sm text-gray-400 mt-0.5">সব নিবন্ধিত ব্যবহারকারী</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700"
                    >
                        <option value="">সব ভূমিকা</option>
                        <option value="student">শিক্ষার্থী</option>
                        <option value="admin">অ্যাডমিন</option>
                    </select>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="নাম বা ইমেইল..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-sm px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-48"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">ব্যবহারকারী</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell text-xs">ফোন</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">এনরোলমেন্ট</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">ভূমিকা</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell text-xs">যোগ দিয়েছেন</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        {[1,2,3,4,5,6].map(j => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                                        কোনো ব্যবহারকারী পাওয়া যায়নি
                                    </td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        {/* User */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {u.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Phone */}
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-500">{u.phone || '—'}</td>
                                        {/* Enrollments */}
                                        <td className="px-4 py-3 text-center">
                                            <span className="flex items-center justify-center gap-1 text-gray-600">
                                                <BookOpen className="h-3.5 w-3.5" /> {u.enrollments_count}
                                            </span>
                                        </td>
                                        {/* Role */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {u.role === 'admin' ? <><Shield className="h-3 w-3" /> অ্যাডমিন</> : <><User className="h-3 w-3" /> শিক্ষার্থী</>}
                                            </span>
                                        </td>
                                        {/* Joined */}
                                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-400">
                                            {new Date(u.created_at).toLocaleDateString('bn-BD')}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setEditTarget(u)}
                                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                                                    title="এডিট করুন"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(u)}
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
                {meta && meta.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">মোট {meta.total}জন • পৃষ্ঠা {meta.current_page}/{meta.last_page}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.current_page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.current_page === meta.last_page} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"><ChevronRight className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Star, Trash2, Pencil, X, Loader2, CheckCircle,
    AlertTriangle, ChevronLeft, ChevronRight, Eye, Check, Ban,
    MessageSquare, ExternalLink, Calendar, User
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
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {toast.message}
            <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// ── Social Review Review/Edit Modal ──────────────────────────────────────────
function ReviewModal({ review, onClose, onSaved }) {
    const [status, setStatus] = useState(review?.status || 'pending');
    const [feedback, setFeedback] = useState(review?.admin_feedback || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await axios.put(`/api/admin/social-reviews/${review.id}`, {
                status,
                admin_feedback: feedback
            });
            if (res.data.success) {
                onSaved(res.data.review);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'আপডেট করতে সমস্যা হয়েছে।');
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
                        <h2 className="text-base font-bold text-gray-900">সোশ্যাল রিভিউ রিভিউ করুন</h2>
                        <p className="text-xs text-gray-400 mt-0.5">রিভিউ ভেরিফাই করে স্ট্যাটাস ও ফিডব্যাক আপডেট করুন</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {error && (
                        <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submitter Info */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500">সাবমিট করেছেন:</span>
                            <span className="text-xs font-bold text-gray-800">{review?.user?.name} ({review?.user?.email})</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                            <div className="flex-grow min-w-0">
                                <span className="text-xs font-semibold text-gray-500 block mb-0.5">রিভিউ লিঙ্ক:</span>
                                <a 
                                    href={review?.review_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-blue-600 hover:underline break-all font-medium inline-flex items-center gap-1"
                                >
                                    {review?.review_url}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Status Select */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">স্ট্যাটাস পরিবর্তন করুন</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus('pending')}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                                    status === 'pending'
                                        ? 'border-amber-500 bg-amber-50 text-amber-800'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                                }`}
                            >
                                <span className="text-xs font-bold">পেন্ডিং</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('approved')}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                                    status === 'approved'
                                        ? 'border-green-600 bg-green-50 text-green-800'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                                }`}
                            >
                                <span className="text-xs font-bold">অনুমোদিত</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('rejected')}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                                    status === 'rejected'
                                        ? 'border-red-500 bg-red-50 text-red-800'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                                }`}
                            >
                                <span className="text-xs font-bold">প্রত্যাখ্যাত</span>
                            </button>
                        </div>
                    </div>

                    {/* Admin Feedback */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">অ্যাডমিন ফিডব্যাক (যদি থাকে)</label>
                        <textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            rows="4"
                            placeholder="রিভিউটি কেন অনুমোদন বা প্রত্যাখ্যান করা হলো তার বর্ণনা লিখুন..."
                            className="w-full text-sm px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-5 py-3 border border-gray-250 hover:bg-gray-50 rounded-2xl text-xs font-bold text-gray-700 transition-colors"
                        >
                            বাতিল করুন
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            আপডেট করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({ review, onClose, onConfirm }) {
    const [deleting, setDeleting] = useState(false);
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">রিভিউ মুছে ফেলতে চান?</h3>
                <p className="text-xs text-gray-400 mb-6">এই সোশ্যাল রিভিউটি ডিলিট করতে চান? এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়।</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-250 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                    >
                        না, থাক
                    </button>
                    <button
                        onClick={async () => {
                            setDeleting(true);
                            await onConfirm(review.id);
                            setDeleting(false);
                        }}
                        disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                        {deleting && <Loader2 className="h-3 w-3 animate-spin" />}
                        হ্যাঁ, মুছুন
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminSocialReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [toast, setToast] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal states
    const [reviewToEdit, setReviewToEdit] = useState(null);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/social-reviews', {
                params: {
                    page,
                    search: search || undefined,
                    status: status || undefined
                }
            });
            if (res.data.success) {
                setReviews(res.data.reviews.data);
                setCurrentPage(res.data.reviews.current_page);
                setLastPage(res.data.reviews.last_page);
                setTotal(res.data.reviews.total);
            }
        } catch (err) {
            console.error(err);
            setToast({ type: 'error', message: 'রিভিউ তালিকা লোড করতে ব্যর্থ হয়েছে।' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(1);
    }, [status]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchReviews(1);
    };

    const handleSaved = (updatedReview) => {
        setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
        setReviewToEdit(null);
        setToast({ type: 'success', message: 'রিভিউ স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।' });
    };

    const handleDeleteConfirm = async (id) => {
        try {
            const res = await axios.delete(`/api/admin/social-reviews/${id}`);
            if (res.data.success) {
                setReviews(prev => prev.filter(r => r.id !== id));
                setReviewToDelete(null);
                setTotal(prev => prev - 1);
                setToast({ type: 'success', message: 'রিভিউটি ডিলিট করা হয়েছে।' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'ডিলিট করতে সমস্যা হয়েছে।' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">সোশ্যাল রিভিউ ম্যানেজমেন্ট</h1>
                    <p className="text-xs text-gray-400 mt-1">শিক্ষার্থীদের সাবমিট করা সোশ্যাল মিডিয়া রিভিউসমূহ পর্যালোচনা করুন</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden flex items-center gap-4">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-blue-50/50 rounded-bl-full" />
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                        <Star className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">সর্বমোট রিভিউ</span>
                        <span className="text-xl font-black text-gray-800">{total}</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden flex items-center gap-4">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-amber-50/50 rounded-bl-full" />
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shrink-0">
                        <Loader2 className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">অপেক্ষমান (Pending)</span>
                        <span className="text-xl font-black text-gray-800">
                            {reviews.filter(r => r.status === 'pending').length}
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden flex items-center gap-4">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-green-50/50 rounded-bl-full" />
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl shrink-0">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">অনুমোদিত (Approved)</span>
                        <span className="text-xl font-black text-gray-800">
                            {reviews.filter(r => r.status === 'approved').length}
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden flex items-center gap-4">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-red-50/50 rounded-bl-full" />
                    <div className="p-3 bg-red-50 text-red-500 rounded-2xl shrink-0">
                        <Ban className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wider">প্রত্যাখ্যাত (Rejected)</span>
                        <span className="text-xl font-black text-gray-800">
                            {reviews.filter(r => r.status === 'rejected').length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="শিক্ষার্থীর নাম, ইমেইল বা লিঙ্ক দিয়ে সার্চ করুন..."
                        className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl border border-gray-250 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </form>

                <div className="flex items-center gap-3 shrink-0">
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="text-xs bg-white border border-gray-250 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-semibold text-gray-700 transition-all"
                    >
                        <option value="">সকল স্ট্যাটাস</option>
                        <option value="pending">পেন্ডিং</option>
                        <option value="approved">অনুমোদিত</option>
                        <option value="rejected">প্রত্যাখ্যাত</option>
                    </select>

                    <button
                        onClick={() => { setSearch(''); setStatus(''); fetchReviews(1); }}
                        className="text-xs px-4 py-3 border border-gray-250 rounded-2xl font-bold hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                        রিসেট
                    </button>
                </div>
            </div>

            {/* Review List Table */}
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">শিক্ষার্থী</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">সোশ্যাল রিভিউ লিঙ্ক</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">অ্যাডমিন ফিডব্যাক</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">তারিখ</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                            <span className="text-xs">লোড হচ্ছে...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-xs text-gray-400 font-medium">
                                        কোনো সোশ্যাল রিভিউ পাওয়া যায়নি।
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-800">{review.user?.name || 'অজানা শিক্ষার্থী'}</span>
                                                <span className="text-[10px] text-gray-400 mt-0.5">{review.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <div className="flex items-center gap-1.5">
                                                <a 
                                                    href={review.review_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-xs text-blue-600 hover:underline truncate max-w-[240px] block font-medium"
                                                >
                                                    {review.review_url}
                                                </a>
                                                <ExternalLink className="h-3 w-3 text-gray-400 shrink-0" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {review.status === 'approved' && (
                                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-200">
                                                    <Check className="h-3 w-3" /> অনুমোদিত
                                                </span>
                                            )}
                                            {review.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-200">
                                                    <Ban className="h-3 w-3" /> প্রত্যাখ্যাত
                                                </span>
                                            )}
                                            {review.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> পেন্ডিং
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 max-w-[200px]">
                                            <p className="text-xs text-gray-500 truncate" title={review.admin_feedback}>
                                                {review.admin_feedback || <em className="text-gray-300">কোনো ফিডব্যাক নেই</em>}
                                            </p>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-gray-300" />
                                                <span>{new Date(review.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setReviewToEdit(review)}
                                                    className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors border border-gray-200"
                                                    title="রিভিউ স্ট্যাটাস ও ফিডব্যাক পরিবর্তন করুন"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setReviewToDelete(review)}
                                                    className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors border border-gray-200"
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

                {/* Pagination footer */}
                {!loading && lastPage > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-semibold">
                            মোট {total} টি রিভিউ এর মধ্যে {reviews.length} টি দেখানো হচ্ছে
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchReviews(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-250 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-bold text-gray-700">
                                পৃষ্ঠা {currentPage} / {lastPage}
                            </span>
                            <button
                                onClick={() => fetchReviews(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className="p-2 border border-gray-250 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {reviewToEdit && (
                <ReviewModal
                    review={reviewToEdit}
                    onClose={() => setReviewToEdit(null)}
                    onSaved={handleSaved}
                />
            )}

            {reviewToDelete && (
                <DeleteModal
                    review={reviewToDelete}
                    onClose={() => setReviewToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}

            {/* Toast Alerts */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}

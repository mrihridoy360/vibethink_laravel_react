import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MessageSquare, Search, X, Loader2, CheckCircle, AlertCircle, Trash2,
    Star, RefreshCw, Calendar, Eye, EyeOff, Filter, Award, Activity, AlertOctagon
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

// ── Stars Renderer Helper ─────────────────────────────────────────────────────
function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400' : 'text-gray-200'}`}
                />
            ))}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, average: 0.0 });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [page, setPage] = useState(1);
    
    // Filters states
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [toast, setToast] = useState(null);

    // Fetch Reviews
    const fetchReviews = async (currentPage = 1, currentSearch = '', currentRating = '', currentStatus = '') => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/reviews', {
                params: {
                    page: currentPage,
                    search: currentSearch,
                    rating: currentRating,
                    status: currentStatus
                }
            });
            if (res.data.success) {
                setReviews(res.data.reviews.data);
                setStats(res.data.stats);
                setPagination({
                    current_page: res.data.reviews.current_page,
                    last_page: res.data.reviews.last_page,
                    total: res.data.reviews.total
                });
            }
        } catch (err) {
            console.error('Error fetching reviews', err);
            setToast({ type: 'error', message: 'রিভিউ সমূহ লোড করতে সমস্যা হয়েছে।' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(page, search, ratingFilter, statusFilter);
    }, [page, search, ratingFilter, statusFilter]);

    // Toggle Review active status
    const handleToggleStatus = async (id) => {
        try {
            const res = await axios.post(`/api/admin/reviews/${id}/toggle`);
            if (res.data.success) {
                // Update local review status
                setReviews(prev => prev.map(r => r.id === id ? res.data.review : r));
                // Recalculate stats counts locally
                const statusChanged = res.data.review.is_active;
                setStats(prev => ({
                    ...prev,
                    active: statusChanged ? prev.active + 1 : prev.active - 1,
                    pending: statusChanged ? prev.pending - 1 : prev.pending + 1
                }));
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।' });
        }
    };

    // Delete review
    const handleDeleteReview = async (id) => {
        if (!confirm('আপনি কি নিশ্চিতভাবে এই রিভিউটি মুছে ফেলতে চান? এটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।')) return;
        try {
            const res = await axios.delete(`/api/admin/reviews/${id}`);
            if (res.data.success) {
                fetchReviews(page, search, ratingFilter, statusFilter);
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'রিভিউটি মুছতে ব্যর্থ হয়েছে।' });
        }
    };

    return (
        <div className="space-y-6">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Header Area */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-blue-600" /> কোর্স রিভিউ ম্যানেজমেন্ট
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-light">শিক্ষার্থীদের কোর্স রেটিং, কমেন্ট ও ফিডব্যাকগুলো মডারেট ও সক্রিয়/নিষ্ক্রিয় করুন</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">মোট রিভিউ</span>
                        <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">{stats.total} টি</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">গড় রেটিং</span>
                        <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">{stats.average} / ৫.০</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">সক্রিয় রিভিউ</span>
                        <h3 className="text-lg font-extrabold text-green-700 mt-0.5">{stats.active} টি</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <AlertOctagon className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">পেন্ডিং মডারেশন</span>
                        <h3 className="text-lg font-extrabold text-red-600 mt-0.5">{stats.pending} টি</h3>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative min-w-0 sm:max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="কোর্স বা শিক্ষার্থীর নাম দিয়ে খুঁজুন..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                    />
                </div>
                <select
                    value={ratingFilter}
                    onChange={e => { setRatingFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                >
                    <option value="">সব রেটিং</option>
                    <option value="5">৫ স্টার (★★★★★)</option>
                    <option value="4">৪ স্টার (★★★★☆)</option>
                    <option value="3">৩ স্টার (★★★☆☆)</option>
                    <option value="2">২ স্টার (★★☆☆☆)</option>
                    <option value="1">১ স্টার (★☆☆☆☆)</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                >
                    <option value="">সব স্ট্যাটাস</option>
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="pending">Pending (নিষ্ক্রিয়)</option>
                </select>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                        <span className="text-xs font-medium">রিভিউ সমূহ লোড হচ্ছে...</span>
                    </div>
                ) : reviews.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="py-4 px-6">শিক্ষার্থী</th>
                                        <th className="py-4 px-6">কোর্স শিরোনাম</th>
                                        <th className="py-4 px-6 text-center">রেটিং</th>
                                        <th className="py-4 px-6">কমেন্ট / ফিডব্যাক</th>
                                        <th className="py-4 px-6 text-center">স্ট্যাটাস</th>
                                        <th className="py-4 px-6 text-center">তারিখ</th>
                                        <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                    {reviews.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900">{r.user?.name || 'অজ্ঞাত শিক্ষার্থী'}</div>
                                                <p className="text-[10px] text-gray-400">{r.user?.email}</p>
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-gray-800">
                                                <div className="truncate max-w-[200px]" title={r.course?.title}>
                                                    {r.course?.title || 'মুছে ফেলা কোর্স'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex justify-center">
                                                    <StarRating rating={r.rating} />
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 max-w-[300px]">
                                                <p className="text-gray-600 break-words leading-relaxed">
                                                    {r.comment || <span className="text-gray-300 italic">কোনো মন্তব্য নেই</span>}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(r.id)}
                                                    className="focus:outline-none cursor-pointer"
                                                    title={r.is_active ? 'নিষ্ক্রিয় করতে ক্লিক করুন' : 'সক্রিয় করতে ক্লিক করুন'}
                                                >
                                                    {r.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-200">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-650 rounded-lg text-[10px] font-bold border border-red-150">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-4 px-6 text-center text-gray-400 font-semibold">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    <span>{new Date(r.created_at).toLocaleDateString('bn-BD')}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleDeleteReview(r.id)}
                                                    className="p-1.5 rounded-lg border border-gray-150 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                                                    title="ডিলিট করুন"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                <span>সর্বমোট {pagination.total} টি রিভিউয়ের মধ্যে পৃষ্ঠা {pagination.current_page}/{pagination.last_page}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={pagination.current_page === 1}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                    >
                                        পূর্ববর্তী
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                        disabled={pagination.current_page === pagination.last_page}
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
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs font-medium">কোনো রিভিউ রেকর্ড পাওয়া যায়নি।</p>
                    </div>
                )}
            </div>
        </div>
    );
}

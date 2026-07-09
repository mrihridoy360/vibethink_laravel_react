import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, CheckCircle2, Clock, XCircle, RefreshCw, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';

const statusCfg = {
    completed: { label: 'সম্পন্ন', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    pending:   { label: 'অপেক্ষমাণ', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    failed:    { label: 'ব্যর্থ', color: 'bg-red-100 text-red-700', icon: XCircle },
    refunded:  { label: 'ফেরত', color: 'bg-purple-100 text-purple-700', icon: RefreshCw },
};

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [meta, setMeta] = useState(null);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
            const res = await axios.get(`/api/admin/payments?${params}`);
            if (res.data.success) {
                setPayments(res.data.payments.data || []);
                setMeta(res.data.payments);
                setSummary(res.data.summary || {});
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPayments(); }, [search, statusFilter, page]);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-gray-900">পেমেন্ট</h2>
                    <p className="text-xs text-gray-400 mt-0.5">সব পেমেন্ট লেনদেন</p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700">
                        <option value="">সব স্ট্যাটাস</option>
                        {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <div className="relative">
                        <input type="text" placeholder="ব্যবহারকারী খুঁজুন..." value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-xs px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-48" />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1.5" />
                    <p className="text-lg font-extrabold text-gray-900">৳{parseFloat(summary.completed || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">মোট আয়</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <DollarSign className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
                    <p className="text-lg font-extrabold text-gray-900">৳{parseFloat(summary.total || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">মোট লেনদেন</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1.5" />
                    <p className="text-lg font-extrabold text-gray-900">{summary.pending || 0}</p>
                    <p className="text-[10px] text-gray-400">অপেক্ষমাণ</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider">ব্যবহারকারী</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">কোর্স</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">পদ্ধতি</th>
                                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">পরিমাণ</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">তারিখ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? Array(5).fill(0).map((_, i) => (
                                <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                            )) : payments.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400">কোনো পেমেন্ট পাওয়া যায়নি</td></tr>
                            ) : payments.map(p => {
                                const cfg = statusCfg[p.status] || statusCfg.pending;
                                const Icon = cfg.icon;
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-gray-900 truncate">{p.user?.name || '—'}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{p.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-600 truncate max-w-[160px]">{p.course?.title || '—'}</td>
                                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-500 uppercase">{p.payment_method}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900">৳{parseFloat(p.amount).toFixed(0)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${cfg.color}`}>
                                                <Icon className="h-2.5 w-2.5" /> {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">
                                            {new Date(p.created_at).toLocaleDateString('bn-BD')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {meta && meta.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">মোট {meta.total}টি • পৃষ্ঠা {meta.current_page}/{meta.last_page}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.current_page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.current_page === meta.last_page} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

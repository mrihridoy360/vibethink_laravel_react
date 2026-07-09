import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, GraduationCap, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export default function AdminEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }) });
            const res = await axios.get(`/api/admin/enrollments?${params}`);
            if (res.data.success) {
                setEnrollments(res.data.enrollments.data || []);
                setMeta(res.data.enrollments);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEnrollments(); }, [search, page]);

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-gray-900">এনরোলমেন্ট</h2>
                    <p className="text-xs text-gray-400 mt-0.5">সব এনরোলমেন্ট রেকর্ড</p>
                </div>
                <div className="relative">
                    <input type="text" placeholder="শিক্ষার্থী খুঁজুন..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-48" />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider">শিক্ষার্থী</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">কোর্স</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">অগ্রগতি</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">তারিখ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? Array(5).fill(0).map((_, i) => (
                                <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                            )) : enrollments.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-16 text-center text-gray-400">কোনো এনরোলমেন্ট পাওয়া যায়নি</td></tr>
                            ) : enrollments.map(e => {
                                const progress = parseInt(e.progress || 0);
                                return (
                                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {e.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{e.user?.name}</p>
                                                    <p className="text-[10px] text-gray-400">{e.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="text-gray-700 truncate max-w-[180px]">{e.course?.title || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                                                </div>
                                                <span className="font-bold text-gray-500">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {progress === 100 ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700">
                                                    <CheckCircle2 className="h-2.5 w-2.5" /> সম্পন্ন
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">
                                                    <Clock className="h-2.5 w-2.5" /> চলমান
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">
                                            {new Date(e.created_at).toLocaleDateString('bn-BD')}
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

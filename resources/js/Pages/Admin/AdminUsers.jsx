import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, BookOpen, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);

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

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-gray-900">ব্যবহারকারী</h2>
                    <p className="text-xs text-gray-400 mt-0.5">সব নিবন্ধিত ব্যবহারকারী</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700"
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
                            className="bg-gray-50 border border-gray-200 text-xs px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-48"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider">ব্যবহারকারী</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">ফোন</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">এনরোলমেন্ট</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">ভূমিকা</th>
                                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">যোগ দিয়েছেন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        {[1,2,3,4,5].map(j => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center text-gray-400">
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
                                                    <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Phone */}
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-500">{u.phone || '—'}</td>
                                        {/* Enrollments */}
                                        <td className="px-4 py-3 text-center">
                                            <span className="flex items-center justify-center gap-1 text-gray-600">
                                                <BookOpen className="h-3 w-3" /> {u.enrollments_count}
                                            </span>
                                        </td>
                                        {/* Role */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {u.role === 'admin' ? <><Shield className="h-2.5 w-2.5" /> অ্যাডমিন</> : <><User className="h-2.5 w-2.5" /> শিক্ষার্থী</>}
                                            </span>
                                        </td>
                                        {/* Joined */}
                                        <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">
                                            {new Date(u.created_at).toLocaleDateString('bn-BD')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {meta && meta.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">মোট {meta.total}জন • পৃষ্ঠা {meta.current_page}/{meta.last_page}</p>
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

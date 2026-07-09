import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, Eye, EyeOff, ToggleLeft, ToggleRight, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [toggling, setToggling] = useState(null);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
            const res = await axios.get(`/api/admin/courses?${params}`);
            if (res.data.success) {
                setCourses(res.data.courses.data || []);
                setMeta(res.data.courses);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); }, [search, statusFilter, page]);

    const handleToggle = async (courseId) => {
        setToggling(courseId);
        try {
            const res = await axios.post(`/api/admin/courses/${courseId}/toggle-publish`);
            if (res.data.success) {
                setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_published: res.data.is_published } : c));
            }
        } catch (e) { console.error(e); }
        finally { setToggling(null); }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-gray-900">কোর্সসমূহ</h2>
                    <p className="text-xs text-gray-400 mt-0.5">সব কোর্স পরিচালনা করুন</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700"
                    >
                        <option value="">সব কোর্স</option>
                        <option value="published">প্রকাশিত</option>
                        <option value="draft">ড্রাফট</option>
                    </select>
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="কোর্স খুঁজুন..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-xs px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-48"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider">কোর্স</th>
                                <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">ইন্সট্রাক্টর</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">এনরোলমেন্ট</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">চ্যাপ্টার</th>
                                <th className="text-right px-4 py-3 font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">মূল্য</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        {[1,2,3,4,5,6].map(j => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                                        কোনো কোর্স পাওয়া যায়নি
                                    </td>
                                </tr>
                            ) : (
                                courses.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Course */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-7 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <BookOpen className="h-3.5 w-3.5 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate max-w-[180px]">{course.title}</p>
                                                    <p className="text-[10px] text-gray-400">{course.language || 'Bengali'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Instructor */}
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-600">{course.user?.name || '-'}</td>
                                        {/* Enrollments */}
                                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                                            <span className="flex items-center justify-center gap-1 text-gray-600">
                                                <Users className="h-3 w-3" /> {course.enrollments_count}
                                            </span>
                                        </td>
                                        {/* Chapters */}
                                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600">{course.chapters_count}</td>
                                        {/* Price */}
                                        <td className="px-4 py-3 text-right hidden md:table-cell">
                                            <span className="font-bold text-gray-900">
                                                {parseFloat(course.price) === 0 ? 'ফ্রি' : `৳${parseFloat(course.price).toFixed(0)}`}
                                            </span>
                                            {parseFloat(course.discount_price) > 0 && (
                                                <span className="block text-[9px] text-gray-400 line-through">৳{parseFloat(course.discount_price).toFixed(0)}</span>
                                            )}
                                        </td>
                                        {/* Toggle */}
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggle(course.id)}
                                                disabled={toggling === course.id}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                    course.is_published
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                            >
                                                {toggling === course.id ? (
                                                    <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : course.is_published ? (
                                                    <><Eye className="h-3 w-3" /> প্রকাশিত</>
                                                ) : (
                                                    <><EyeOff className="h-3 w-3" /> ড্রাফট</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">
                            মোট {meta.total}টি কোর্স • পৃষ্ঠা {meta.current_page}/{meta.last_page}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.current_page === 1}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={meta.current_page === meta.last_page}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, PlayCircle, CheckCircle2, Clock, Filter, Search, GraduationCap } from 'lucide-react';

export default function EnrolledCourses() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | active | completed | pending
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/dashboard-data');
                if (res.data.success) setEnrollments(res.data.enrollments || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = enrollments.filter(e => {
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
        if (filter === 'active') return matchSearch && e.progress > 0 && e.progress < 100;
        if (filter === 'completed') return matchSearch && e.progress === 100;
        if (filter === 'pending') return matchSearch && e.progress === 0;
        return matchSearch;
    });

    const filterBtns = [
        { key: 'all', label: 'সবগুলো', icon: BookOpen },
        { key: 'active', label: 'চলমান', icon: PlayCircle },
        { key: 'completed', label: 'সম্পন্ন', icon: CheckCircle2 },
        { key: 'pending', label: 'অপেক্ষমাণ', icon: Clock },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">ইনরোলড কোর্সসমূহ</h2>
                    <p className="text-sm text-gray-400 mt-0.5">মোট {enrollments.length}টি কোর্সে এনরোল করা হয়েছে</p>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="কোর্স খুঁজুন..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-sm px-4 pl-9 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {filterBtns.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            filter === key
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filtered.map(item => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg hover:border-blue-500/20 transition-all group relative"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-full sm:w-32 aspect-video rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                {item.thumbnail ? (
                                    <img
                                        src={item.thumbnail.startsWith('http') ? item.thumbnail : `/storage/${item.thumbnail}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="h-6 w-6 text-gray-300" />
                                    </div>
                                )}
                                {item.progress === 100 && (
                                    <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-gray-400 mt-0.5">{item.instructor_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {item.completed_lessons_count}/{item.total_lessons_count} টি লেসন সম্পন্ন
                                </p>

                                {/* Badge */}
                                <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    item.progress === 100
                                        ? 'bg-green-100 text-green-700'
                                        : item.progress > 0
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {item.progress === 100 ? '✓ সম্পন্ন' : item.progress > 0 ? 'চলমান' : 'শুরু হয়নি'}
                                </span>

                                {/* Progress bar */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-grow bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                item.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                                        {item.progress}%
                                    </span>
                                </div>
                            </div>

                            {/* Click overlay */}
                            <Link
                                to={`/courses/${item.slug}/learn`}
                                className="absolute inset-0 z-10 rounded-2xl"
                                aria-label="কোর্সে যান"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4 border border-gray-100">
                        <GraduationCap className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-700">কোনো কোর্স পাওয়া যায়নি</h3>
                    <p className="text-xs text-gray-400 mt-1">এই ফিল্টারে কোনো কোর্স নেই।</p>
                    <Link
                        to="/"
                        className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/15"
                    >
                        <BookOpen className="h-3.5 w-3.5" /> কোর্স ব্রাউজ করুন
                    </Link>
                </div>
            )}
        </div>
    );
}

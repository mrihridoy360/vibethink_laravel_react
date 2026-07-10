import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const [loading, setLoading] = useState(true);

    const fetchCourses = async (query = '') => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/courses?search=${query}`);
            if (response.data.success) {
                setCourses(response.data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses(search);
    }, [search]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16 relative overflow-hidden py-12 rounded-3xl bg-purple-50/50 border border-purple-100/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-100 rounded-full blur-3xl -z-10" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
                    Upgrade Your Skills with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">VibeThink</span>
                </h1>
                <p className="text-base text-slate-500 max-w-2xl mx-auto mb-8 font-normal">
                    Learn from industry experts and get hands-on experience with modern tech stacks. Discover premium courses tailored for you.
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm bg-white border border-slate-200 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 text-slate-800 shadow-sm transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
            </div>

            {/* Catalog Section */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <BookOpen className="h-5.5 w-5.5 text-purple-600" /> Our Courses
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">Explore all published training courses</p>
                    </div>
                    <span className="text-xs bg-purple-50 border border-purple-100 text-purple-600 px-3.5 py-1 rounded-full font-bold">
                        {courses.length} Courses Available
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white border border-slate-100 shadow-sm h-80 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white border border-slate-200/60 flex flex-col rounded-3xl overflow-hidden transition-all duration-300 group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                {/* Thumbnail */}
                                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                                            <BookOpen className="h-10 w-10 text-purple-400" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-800/10 text-white uppercase tracking-wider">
                                        {course.language || 'English'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-purple-650 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-500 text-xs mb-4 line-clamp-2 font-normal leading-relaxed">
                                        {course.short_description || 'No description available for this course.'}
                                    </p>

                                    {/* Author & Stats */}
                                    <div className="flex items-center gap-2 mb-6 mt-auto">
                                        <div className="h-6 w-6 rounded-full bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-bold flex items-center justify-center">
                                            {course.user?.name ? course.user.name.charAt(0) : 'I'}
                                        </div>
                                        <span className="text-xs text-slate-450 font-medium">
                                            By {course.user?.name || 'Instructor'}
                                        </span>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-baseline gap-1.5">
                                            {parseFloat(course.discount_price) > 0 ? (
                                                <>
                                                    <span className="text-base font-extrabold text-slate-900">
                                                        ${course.discount_price}
                                                    </span>
                                                    <span className="text-xs text-slate-400 line-through">
                                                        ${course.price}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-base font-extrabold text-slate-900">
                                                    {parseFloat(course.price) === 0 ? 'Free' : `$${course.price}`}
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            to={`/courses/${course.slug}`}
                                            className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 group/btn"
                                        >
                                            View Details <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
                        <BookOpen className="h-10 w-10 text-slate-350 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-800">No Courses Found</h3>
                        <p className="text-xs text-slate-400 mt-1">Try search with a different keyword</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
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
            <div className="text-center mb-16 relative overflow-hidden py-10 rounded-3xl bg-gradient-to-b from-purple-900/10 to-transparent">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl -z-10" />
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-purple-400 bg-clip-text text-transparent">
                    Upgrade Your Skills with <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">VibeThink</span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 font-light">
                    Learn from industry experts and get hands-on experience with modern tech stacks. Discover premium courses tailored for you.
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="glass-input w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:border-purple-500"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Catalog Section */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-purple-500" /> Our Courses
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Explore all published training courses</p>
                    </div>
                    <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-semibold">
                        {courses.length} Courses Available
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="glass-panel h-80 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="glass-panel glass-panel-hover flex flex-col rounded-2xl overflow-hidden transition-all duration-300 group">
                                {/* Thumbnail */}
                                <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                                            <BookOpen className="h-10 w-10 text-purple-500/50" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-[#0b0f19]/80 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/5 text-purple-300 uppercase tracking-wider">
                                        {course.language || 'English'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-light">
                                        {course.short_description || 'No description available for this course.'}
                                    </p>

                                    {/* Author & Stats */}
                                    <div className="flex items-center gap-2 mb-6 mt-auto">
                                        <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                                            {course.user?.name ? course.user.name.charAt(0) : 'I'}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">
                                            By {course.user?.name || 'Instructor'}
                                        </span>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-baseline gap-1.5">
                                            {parseFloat(course.discount_price) > 0 ? (
                                                <>
                                                    <span className="text-lg font-extrabold text-white">
                                                        ${course.discount_price}
                                                    </span>
                                                    <span className="text-xs text-gray-500 line-through">
                                                        ${course.price}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-lg font-extrabold text-white">
                                                    {parseFloat(course.price) === 0 ? 'Free' : `$${course.price}`}
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            to={`/courses/${course.slug}`}
                                            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 group/btn"
                                        >
                                            View Details <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 glass-panel rounded-2xl">
                        <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-300">No Courses Found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try search with a different keyword</p>
                    </div>
                )}
            </div>
        </div>
    );
}

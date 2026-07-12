import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, BookOpen, ArrowRight, Eye, ShoppingCart } from 'lucide-react';

export default function Courses() {
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
            {/* Header Banner */}
            <div className="text-center relative overflow-hidden py-10 md:py-16 px-4 rounded-3xl bg-purple-50/50 border border-purple-100/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-100/60 rounded-full blur-3xl -z-10" />
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
                    আমাদের সকল <span className="bg-gradient-to-r from-purple-600 to-pink-650 bg-clip-text text-transparent">কোর্সসমূহ</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-6 md:mb-8 font-normal px-2">
                    দক্ষতা বৃদ্ধিতে আপনার প্রয়োজনীয় কোর্সটি খুঁজে নিন এবং আজই শেখা শুরু করুন।
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="কোর্স খুঁজুন..."
                        value={search}
                        onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm bg-white border border-slate-200 focus:outline-none focus:border-purple-650 focus:ring-2 focus:ring-purple-600/10 text-slate-800 shadow-sm transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
            </div>

            {/* Grid Catalog */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="h-5.5 w-5.5 text-purple-650" /> সকল কোর্স
                        </h2>
                    </div>
                    <span className="text-xs bg-purple-50 border border-purple-100 text-purple-650 px-4 py-1.5 rounded-full font-bold shadow-sm">
                        {courses.length} টি কোর্স পাওয়া গেছে
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white border border-slate-100 shadow-sm h-80 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white border border-slate-200/80 flex flex-col rounded-[2rem] p-5 transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5">
                                {/* Thumbnail */}
                                <div className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden rounded-2xl mb-4 border border-slate-100 shrink-0">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                                            <BookOpen className="h-8 w-8 text-purple-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-grow">
                                    <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2 line-clamp-1 theme-primary-text-hover transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-500 text-xs mb-4 line-clamp-2 font-normal leading-relaxed">
                                        {course.short_description || 'No description available for this course.'}
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2 mb-5">
                                        {parseFloat(course.discount_price) > 0 ? (
                                            <>
                                                <span className="text-lg font-black theme-primary-text text-[#FF5A00]">
                                                    ৳{Math.round(course.discount_price)}
                                                </span>
                                                <span className="text-xs text-slate-400 line-through font-semibold">
                                                    ৳{Math.round(course.price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-black theme-primary-text text-[#FF5A00]">
                                                {parseFloat(course.price) === 0 ? 'ফ্রি' : `৳${Math.round(course.price)}`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 mt-auto pt-2">
                                        <Link
                                            to={`/courses/${course.slug}`}
                                            className="flex-1 py-3 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-100"
                                        >
                                            Add to Cart <ShoppingCart className="w-3.5 h-3.5" />
                                        </Link>
                                        <Link
                                            to={`/courses/${course.slug}`}
                                            className="flex-1 py-3 px-2 theme-primary-bg hover:brightness-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            View Details <Eye className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
                        <BookOpen className="h-10 w-10 text-slate-350 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-800">কোনো কোর্স পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-450 mt-1">অন্য কোনো কিওয়ার্ড দিয়ে আবার চেষ্টা করুন</p>
                    </div>
                )}
            </div>
        </div>
    );
}

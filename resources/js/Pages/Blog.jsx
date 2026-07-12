import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Calendar, Clock, Eye, ArrowRight } from 'lucide-react';

export default function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/blogs');
            if (response.data.success) {
                setBlogs(response.data.posts);
            }
        } catch (error) {
            console.error('Error fetching blogs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
            {/* Header Banner */}
            <div className="text-center relative overflow-hidden py-10 md:py-16 px-4 rounded-3xl bg-pink-50/50 border border-pink-100/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-pink-100/40 rounded-full blur-3xl -z-10" />
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
                    আমাদের সর্বশেষ <span className="bg-gradient-to-r from-pink-600 to-purple-650 bg-clip-text text-transparent">ব্লগ ও আর্টিকেলস</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-6 md:mb-8 font-normal px-2">
                    তথ্যপ্রযুক্তি, প্রোগ্রামিং ও ক্যারিয়ার গাইড সংক্রান্ত গুরুত্বপূর্ণ আর্টিকেলগুলো এখানে পড়ুন।
                </p>
            </div>

            {/* Catalog Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="h-5.5 w-5.5 text-pink-500" /> সকল ব্লগ
                        </h2>
                    </div>
                    <span className="text-xs bg-pink-50 border border-pink-100 text-pink-650 px-4 py-1.5 rounded-full font-bold shadow-sm">
                        {blogs.length} টি আর্টিকেল পাওয়া গেছে
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white border border-slate-100 shadow-sm h-80 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {blogs.map((post) => (
                            <div key={post.id} className="bg-white border border-slate-200/60 flex flex-col rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                                {/* Thumbnail Link */}
                                <Link to={`/blog/${post.slug}`} className="relative aspect-video w-full bg-slate-100 overflow-hidden block">
                                    {post.featured_image ? (
                                        <img
                                            src={post.featured_image.startsWith('http') ? post.featured_image : `/storage/${post.featured_image}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50/50 to-purple-50/50">
                                            <FileText className="h-10 w-10 text-pink-400" />
                                        </div>
                                    )}
                                    {post.category && (
                                        <div className="absolute top-3 left-3 bg-pink-500/90 text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider">
                                            {post.category.name}
                                        </div>
                                    )}
                                </Link>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <Link to={`/blog/${post.slug}`}>
                                        <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-pink-650 transition-colors">
                                            {post.title}
                                        </h3>
                                    </Link>
                                    <p className="text-slate-500 text-[11.5px] mb-4 line-clamp-2 leading-relaxed font-semibold">
                                        {post.excerpt || 'আর্টিকেলের অংশবিশেষ পড়তে চোখ রাখুন আমাদের ব্লগে...'}
                                    </p>

                                    {/* Meta Row */}
                                    <div className="flex items-center justify-between text-[10px] text-slate-450 font-semibold mt-auto pt-4 border-t border-slate-100">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.formatted_date}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.reading_time} মিনিট রিড</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views_count || 0} বার দেখা হয়েছে</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
                        <FileText className="h-10 w-10 text-slate-350 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-800">কোনো আর্টিকেল পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-400 mt-1">আমাদের ব্লগে নতুন কন্টেন্ট দেখতে শীঘ্রই চোখ রাখুন।</p>
                    </div>
                )}
            </div>
        </div>
    );
}

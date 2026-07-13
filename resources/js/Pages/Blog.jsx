import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, ChevronDown, Home as HomeIcon, Search, Tag, X } from 'lucide-react';
import BlogCard from '../Components/BlogCard';

export default function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('default');
    const [categoryOpen, setCategoryOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/blogs');
            if (response.data.success) {
                setBlogs(response.data.posts || []);
            }
        } catch (error) {
            console.error('Error fetching blogs', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await axios.get('/api/blog-categories');
            if (response.data.success) {
                setCategories(response.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching blog categories', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
    }, []);

    // Build category list dynamically from the /admin/blog categories source
    const categoryNames = ['All', ...categories.map(c => c.name).filter(Boolean)];
    const categoryPostCounts = {};
    categories.forEach(c => {
        categoryPostCounts[c.name] = c.posts_count || 0;
    });

    // Category translations to Bengali
    const categoryTranslations = {
        'all': 'সকল ক্যাটাগরি',
        'career': 'ক্যারিয়ার',
        'business': 'বিজনেস',
        'ai - artificial intelligence': 'এআই (AI)',
        'freelancing': 'ফ্রিল্যান্সিং',
        'digital marketing': 'ডিজিটাল মার্কেটিং',
        'passive income': 'প্যাসিভ ইনকাম',
        'technology': 'টেকনোলজি'
    };

    const getCategoryLabel = (catName) => {
        return categoryTranslations[catName.toLowerCase()] || catName;
    };

    const getCategoryCount = (catName) => {
        if (catName === 'All') return blogs.length;
        return blogs.filter(post => post.category?.name?.toLowerCase() === catName.toLowerCase()).length;
    };

    // Sort options mapping
    const sortOptions = [
        { value: 'newest', label: 'নতুন আগে' },
        { value: 'default', label: 'পুরোনো আগে' },
        { value: 'views', label: 'জনপ্রিয়' }
    ];

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSortBy('default');
    };

    // Filter logic
    const filteredBlogs = blogs.filter(post => {
        const matchesCategory = selectedCategory === 'All' || post.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = !searchQuery || 
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.body?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Sorting logic
    const getSortedBlogs = (list) => {
        const listCopy = [...list];
        if (sortBy === 'views') {
            return listCopy.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        }
        if (sortBy === 'newest') {
            return listCopy.sort((a, b) => b.id - a.id);
        }
        return listCopy;
    };

    const finalBlogs = getSortedBlogs(filteredBlogs);

    return (
        <div className="w-full">
            {/* Header Section */}
            <div 
                className="relative border-b border-slate-100 bg-white overflow-hidden py-12 md:py-16 select-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px',
                    backgroundPosition: 'center'
                }}
            >
                {/* Subtle light background radial gradient fade */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,white_90%)] pointer-events-none opacity-50" />
                
                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                    <div className="space-y-3.5">
                        {/* Tagline */}
                        <div className="text-[11px] md:text-xs font-extrabold tracking-[0.25em] theme-primary-text text-[#FF5A00] uppercase">
                            / AI NEWS & BLOG
                        </div>
                        
                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                            টেক ও AI-এর <span className="theme-primary-text text-[#FF5A00]">তাজা খবর।</span>
                        </h1>
                        
                        {/* Description */}
                        <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
                            ইন্ডাস্ট্রি ইনসাইট, টিউটোরিয়াল ও AI টুল রিভিউ — সবকিছু এক জায়গায়।
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

                {/* Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start">
                    
                    {/* Left Sidebar Filter Section */}
                    <div className="lg:col-span-1 lg:sticky lg:top-6 self-start">
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5.5">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                                <span className="text-lg font-black text-slate-900 font-sans tracking-tight">ফিল্টার</span>
                                <Tag className="w-4.5 h-4.5 text-slate-400" />
                            </div>

                            {/* Search Section */}
                            <div className="space-y-2">
                                <div className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase">
                                    / Search
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="ব্লগ খুঁজুন..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-[13px] bg-white border border-slate-200/80 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/10 text-slate-800 shadow-sm transition-all"
                                    />
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>
                            </div>

                            {/* Category Section */}
                            <div className="space-y-2">
                                <div className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase">
                                    / Category
                                </div>
                                <div className="flex flex-col gap-2">
                                    {categoryNames.map((cat) => {
                                        const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                                        const count = getCategoryCount(cat);
                                        return (
                                            <div
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-5 py-2.5 flex items-center justify-between text-xs sm:text-[13px] font-bold rounded-full w-full cursor-pointer transition-all duration-200 ${
                                                    isSelected
                                                        ? 'bg-[#1e1e20] text-white hover:bg-black'
                                                        : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-350'
                                                }`}
                                            >
                                                <span>{getCategoryLabel(cat)}</span>
                                                <span className={`text-[11px] font-bold ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {count}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sort Section */}
                            <div className="space-y-2">
                                <div className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase">
                                    / Sort
                                </div>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full appearance-none pl-5 pr-10 py-2.5 text-xs sm:text-[13px] font-bold rounded-full bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-350 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/10 transition-all cursor-pointer"
                                    >
                                        {sortOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={handleResetFilters}
                                className="w-full border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 py-2.5 rounded-full flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-bold transition-all mt-3"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                                <span>ফিল্টার রিসেট করুন</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Blogs List Grid */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Blog Card List Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="bg-white border border-slate-100 shadow-sm h-80 rounded-[2rem] animate-pulse" />
                                ))}
                            </div>
                        ) : finalBlogs.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {finalBlogs.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm">
                                <FileText className="h-10 w-10 text-slate-350 mx-auto mb-4" />
                                <h3 className="text-base font-bold text-slate-800">কোনো ব্লগ আর্টিকেল পাওয়া যায়নি</h3>
                                <p className="text-xs text-slate-400 mt-1">ভিন্ন ক্যাটাগরি সিলেক্ট করে আবার চেষ্টা করুন।</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

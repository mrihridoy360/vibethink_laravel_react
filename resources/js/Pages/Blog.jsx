import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, ChevronDown, Home as HomeIcon } from 'lucide-react';
import BlogCard from '../Components/BlogCard';

export default function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('default');
    const [categoryOpen, setCategoryOpen] = useState(true);

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

    useEffect(() => {
        fetchBlogs();
    }, []);

    // Categories definition
    const staticCategories = [
        'All',
        'Career',
        'Business',
        'AI - Artificial Intelligence',
        'Freelancing',
        'Digital Marketing',
        'Passive Income'
    ];

    // Merge static list with any new dynamic categories returned from API
    const dynamicCategories = blogs.map(p => p.category?.name).filter(Boolean);
    const categories = ['All', ...new Set([...staticCategories.slice(1), ...dynamicCategories])];

    // Filter logic
    const filteredBlogs = blogs.filter(post => {
        if (selectedCategory === 'All') return true;
        return post.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold select-none mb-2">
                <Link to="/" className="flex items-center gap-1 hover:theme-primary-text transition-colors">
                    <HomeIcon className="w-3.5 h-3.5" /> Home
                </Link>
                <span className="text-slate-400 font-normal">›</span>
                <span className="text-slate-700">Blogs</span>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start">
                
                {/* Left Sidebar Filter Section */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-black text-slate-800">Filter</h2>
                    
                    {/* Collapsible Filter Wrapper */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
                        <div
                            onClick={() => setCategoryOpen(!categoryOpen)}
                            className="flex items-center justify-between cursor-pointer select-none font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100"
                        >
                            <span>Category</span>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {categoryOpen && (
                            <div className="flex flex-col gap-3 pt-2 max-h-[350px] overflow-y-auto pr-1">
                                {categories.map((cat) => (
                                    <label key={cat} className="flex items-center gap-3.5 cursor-pointer group select-none">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat}
                                            onChange={() => setSelectedCategory(cat)}
                                            className="w-4.5 h-4.5 accent-slate-800 focus:ring-slate-400 border-slate-200 text-slate-800"
                                        />
                                        <span className={`text-[12.5px] font-bold transition-colors ${selectedCategory === cat ? 'text-slate-850' : 'text-slate-500 group-hover:text-slate-800'}`}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Blogs List Grid */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Header Controls Bar */}
                    <div className="flex items-center justify-between bg-white py-3 px-5 rounded-3xl border border-slate-200/60 shadow-sm">
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                            {finalBlogs.length} Blogs Found
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500/10 shadow-sm cursor-pointer"
                            >
                                <option value="default">Default Sorting</option>
                                <option value="views">Most Viewed</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>

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
    );
}

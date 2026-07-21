import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Clock, User, ChevronLeft, ChevronRight, Share2, Twitter, Facebook,
    Linkedin, Copy, Tag, ArrowRight, BookOpen, List, Calendar, Eye,
    Loader2, AlertCircle
} from 'lucide-react';
import { useSEO } from '../Utils/seo';

export default function BlogDetail() {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [data, setData] = useState(null);

    // Dynamic SEO Management
    useSEO({
        title: data?.post ? (data.post.meta_title || data.post.title) : 'আর্টিকেল লোড হচ্ছে...',
        description: data?.post ? (data.post.meta_description || data.post.excerpt || data.post.content) : '',
        image: data?.post ? (data.post.og_image || data.post.featured_image) : null,
        robots: data?.post ? ((data.post.is_indexable ? 'index' : 'noindex') + ', ' + (data.post.is_followable ? 'follow' : 'nofollow')) : null
    });

    const [copied, setCopied] = useState(false);
    const [showTOC, setShowTOC] = useState(true);

    const fetchPostDetail = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await axios.get(`/api/blogs/${slug}`);
            if (response.data.success) {
                setData(response.data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Error fetching blog post detail:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostDetail();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [slug]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-sm text-slate-500 font-semibold">ব্লগ পোস্ট লোড হচ্ছে...</p>
            </div>
        );
    }

    if (error || !data || !data.post) {
        return (
            <div className="max-w-md mx-auto my-16 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-black text-slate-800">পোস্টটি পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-400">অনুরোধকৃত আর্টিকেলটি সিস্টেমে বিদ্যমান নেই অথবা মুছে ফেলা হয়েছে।</p>
                <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800">
                    <ChevronLeft className="w-4 h-4" /> হোম পেইজে ফিরে যান
                </Link>
            </div>
        );
    }

    const { post, relatedPosts, relatedCourses, previousPost, nextPost, tableOfContents } = data;
    const shareUrl = window.location.href;
    const shareTitle = encodeURIComponent(post.title);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${shareTitle}`,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                {/* Left: Article Details */}
                <article className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <header className="space-y-4">
                        {post.category && (
                            <span className="inline-block px-3 py-1 bg-purple-50 border border-purple-100 text-purple-650 text-[10px] font-bold rounded-full">
                                {post.category.name}
                            </span>
                        )}
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-450 font-semibold pb-4 border-b border-slate-100">
                            <span className="flex items-center gap-1.5">
                                <User className="h-4 w-4 text-slate-400" />
                                {post.author?.name || 'এডমিন'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {post.formatted_date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-slate-400" />
                                {post.reading_time} মিনিট রিড
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4 text-slate-400" />
                                {post.views_count || 0} বার দেখা হয়েছে
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.featured_image && (
                        <div className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-video bg-slate-100 border border-slate-200/40">
                            <img
                                src={post.featured_image.startsWith('http') ? post.featured_image : `/storage/${post.featured_image}`}
                                alt={post.featured_image_alt || post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Excerpt */}
                    {post.excerpt && (
                        <div className="bg-purple-50/50 border-l-4 border-purple-500 px-4 sm:px-5 py-3 sm:py-4 rounded-r-xl sm:rounded-r-2xl">
                            <p className="text-slate-600 italic text-sm sm:text-base leading-relaxed font-semibold">{post.excerpt}</p>
                        </div>
                    )}

                    {/* Article Content */}
                    <div
                        className="prose prose-slate max-w-none text-slate-700 font-semibold text-base sm:text-lg leading-relaxed space-y-4
                            prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mt-8 prose-headings:mb-3
                            prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h2:border-slate-100
                            prose-h3:text-lg
                            prose-p:mb-4
                            prose-a:text-purple-650 prose-a:font-bold hover:prose-a:underline
                            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                            prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50/30 prose-blockquote:py-2.5 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:italic
                            prose-code:bg-slate-100 prose-code:text-pink-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                            prose-pre:bg-slate-900 prose-pre:text-emerald-400 prose-pre:p-4 prose-pre:rounded-2xl prose-pre:overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Navigation */}
                    <nav className="pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {previousPost ? (
                            <Link
                                to={`/blog/${previousPost.slug}`}
                                className="p-4 bg-white border border-slate-200/60 rounded-2xl hover:shadow-sm transition-all group flex gap-3 items-center"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">পূর্ববর্তী আর্টিকেল</span>
                                    <p className="font-bold text-slate-800 text-xs truncate group-hover:text-purple-650 mt-0.5">
                                        {previousPost.title}
                                    </p>
                                </div>
                            </Link>
                        ) : <div />}

                        {nextPost ? (
                            <Link
                                to={`/blog/${nextPost.slug}`}
                                className="p-4 bg-white border border-slate-200/60 rounded-2xl hover:shadow-sm transition-all group flex gap-3 items-center justify-between text-right"
                            >
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">পরবর্তী আর্টিকেল</span>
                                    <p className="font-bold text-slate-800 text-xs truncate group-hover:text-purple-650 mt-0.5">
                                        {nextPost.title}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </Link>
                        ) : <div />}
                    </nav>
                </article>

                {/* Right: Sidebar */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="sticky top-6 space-y-6">
                        {/* Table of Contents */}
                        {tableOfContents && tableOfContents.length > 0 && (
                            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/60 p-4 sm:p-5 shadow-sm">
                                <button
                                    onClick={() => setShowTOC(!showTOC)}
                                    className="flex items-center justify-between w-full font-bold text-slate-800 text-xs border-none bg-transparent cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <List className="h-4.5 w-4.5 text-purple-600" /> সূচিপত্র (Table of Contents)
                                    </span>
                                </button>
                                {showTOC && (
                                    <nav className="mt-3.5 space-y-2 border-l border-slate-100 pl-1 ml-2">
                                        {tableOfContents.map((item, i) => (
                                            <a
                                                key={i}
                                                href={`#${item.id}`}
                                                className={`block py-0.5 text-[11px] font-semibold text-slate-500 hover:text-purple-600 transition-colors ${
                                                    item.level === 3 ? 'pl-4 relative before:absolute before:left-1 before:top-2 before:w-1 before:h-1 before:bg-slate-300 before:rounded-full' : 'pl-2'
                                                }`}
                                            >
                                                {item.text}
                                            </a>
                                        ))}
                                    </nav>
                                )}
                            </div>
                        )}

                        {/* Share Box */}
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                <Share2 className="h-4.5 w-4.5 text-pink-500" /> আর্টিকেলটি শেয়ার করুন
                            </span>
                            <div className="flex gap-2.5">
                                <a
                                    href={shareLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-sky-500 rounded-xl flex items-center justify-center border border-slate-150 transition-all hover:scale-105"
                                >
                                    <Twitter className="h-4 w-4" />
                                </a>
                                <a
                                    href={shareLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl flex items-center justify-center border border-slate-150 transition-all hover:scale-105"
                                >
                                    <Facebook className="h-4 w-4" />
                                </a>
                                <a
                                    href={shareLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl flex items-center justify-center border border-slate-150 transition-all hover:scale-105"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </a>
                                <button
                                    onClick={copyToClipboard}
                                    className="w-9 h-9 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-xl flex items-center justify-center border border-slate-150 transition-all hover:scale-105 cursor-pointer"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                            {copied && <p className="text-[10px] font-bold text-emerald-600 animate-fadeIn">লিংকটি কপি করা হয়েছে!</p>}
                        </div>

                        {/* Related Courses */}
                        {relatedCourses && relatedCourses.length > 0 && (
                            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-5 text-white shadow-sm space-y-4">
                                <span className="flex items-center gap-2 text-xs font-bold">
                                    <BookOpen className="h-4.5 w-4.5 text-purple-200" /> দক্ষতা বাড়াতে শুরু করুন
                                </span>
                                <div className="space-y-2">
                                    {relatedCourses.map((course) => (
                                        <Link
                                            key={course.id}
                                            to={`/courses/${course.slug}`}
                                            className="block p-3 bg-white/10 hover:bg-white/20 border border-white/5 rounded-2xl transition-all"
                                        >
                                            <p className="font-bold text-xs line-clamp-2 leading-snug">{course.title}</p>
                                            <span className="text-[10px] text-purple-200 block mt-1.5 font-bold">বিস্তারিত দেখুন →</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Posts */}
                        {relatedPosts && relatedPosts.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm space-y-4">
                                <span className="text-xs font-bold text-slate-800 block">সম্পর্কিত আর্টিকেলসমূহ</span>
                                <div className="space-y-3">
                                    {relatedPosts.map((rPost) => (
                                        <Link
                                            key={rPost.id}
                                            to={`/blog/${rPost.slug}`}
                                            className="group block"
                                        >
                                            <div className="flex gap-2">
                                                <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-150">
                                                    {rPost.featured_image ? (
                                                        <img
                                                            src={rPost.featured_image.startsWith('http') ? rPost.featured_image : `/storage/${rPost.featured_image}`}
                                                            alt={rPost.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs">📝</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-650 line-clamp-2 leading-snug">
                                                        {rPost.title}
                                                    </h4>
                                                    <span className="text-[9px] text-slate-400 block mt-0.5">{rPost.formatted_date}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

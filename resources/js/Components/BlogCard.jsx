import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

export default function BlogCard({ post }) {
    const imageUrl = post.featured_image
        ? (post.featured_image.startsWith('http') ? post.featured_image : `/storage/${post.featured_image}`)
        : null;

    return (
        <div className="bg-white border border-slate-200/80 flex flex-col rounded-2xl p-4 transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5 theme-primary-border-hover">
            {/* Thumbnail */}
            <Link to={`/blog/${post.slug}`} className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden rounded-xl mb-3 border border-slate-100 block shrink-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50/50 to-purple-50/50">
                        <FileText className="h-8 w-8 text-pink-400" />
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-col flex-grow">
                {/* Title */}
                <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mb-2 line-clamp-2 theme-primary-text-hover transition-colors leading-snug">
                        {post.title}
                    </h3>
                </Link>

                {/* Description Excerpt */}
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 font-normal leading-relaxed">
                    {post.excerpt || 'আর্টিকেলের অংশবিশেষ পড়তে চোখ রাখুন আমাদের ব্লগে...'}
                </p>

                {/* Read More button at bottom right */}
                <div className="mt-auto pt-2 flex justify-end">
                    <Link
                        to={`/blog/${post.slug}`}
                        className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl flex items-center gap-1.5 transition-all border border-slate-100"
                    >
                        Read More <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

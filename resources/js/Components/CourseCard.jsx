import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, Eye, Clock } from 'lucide-react';

export default function CourseCard({ course, onComingSoonClick }) {
    const imageUrl = course.thumbnail
        ? (course.thumbnail.startsWith('http') ? course.thumbnail : `/storage/${course.thumbnail}`)
        : null;

    const isComingSoon = course.section_titles?.coming_soon === true;
    const hasDiscount = parseFloat(course.discount_price) > 0;
    const isFree = parseFloat(course.price) === 0;

    const handleComingSoonClick = (e) => {
        if (isComingSoon) {
            e.preventDefault();
            onComingSoonClick?.(course);
        }
    };

    return (
        <div className="bg-white border border-slate-200/80 flex flex-col rounded-2xl p-4 transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5 theme-primary-border-hover relative">
            {/* Thumbnail */}
            <Link
                to={isComingSoon ? '#' : `/courses/${course.slug}`}
                onClick={handleComingSoonClick}
                className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden rounded-xl mb-3 border border-slate-100 block shrink-0"
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                        <BookOpen className="h-8 w-8 text-purple-400" />
                    </div>
                )}

                {/* Coming Soon Badge Overlay */}
                {isComingSoon && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-start p-3">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-[10px] font-black tracking-wide shadow-md animate-pulse">
                            <Clock className="w-3 h-3" /> শীঘ্রই আসছে
                        </span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-col flex-grow">
                <Link 
                    to={isComingSoon ? '#' : `/courses/${course.slug}`}
                    onClick={handleComingSoonClick}
                >
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2 line-clamp-1 theme-primary-text-hover transition-colors">
                        {course.title}
                    </h3>
                </Link>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 font-normal leading-relaxed">
                    {course.short_description || 'No description available for this course.'}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-5">
                    {isComingSoon ? (
                        <span className="text-sm font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            মূল্য নির্ধারণ করা হয়নি
                        </span>
                    ) : hasDiscount ? (
                        <>
                            <span className="text-xl font-black theme-primary-text text-[#FF5A00]">
                                ৳{Math.round(course.discount_price)}
                            </span>
                            <span className="text-sm text-slate-400 line-through font-semibold">
                                ৳{Math.round(course.price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-xl font-black theme-primary-text text-[#FF5A00]">
                            {isFree ? 'ফ্রি' : `৳${Math.round(course.price)}`}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                {isComingSoon ? (
                    <div className="flex items-center gap-2 mt-auto pt-2">
                        <button
                            type="button"
                            onClick={handleComingSoonClick}
                            className="w-full py-3 px-4 bg-orange-50 hover:bg-orange-100/80 text-orange-600 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all border border-orange-100/50 cursor-pointer shadow-sm shadow-orange-500/5"
                        >
                            <Clock className="w-4 h-4 animate-pulse" /> বিস্তারিত জানতে ক্লিক করুন
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mt-auto pt-2">
                        <Link
                            to={`/courses/${course.slug}`}
                            className="flex-1 py-3 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-100"
                        >
                            Add to Cart <ShoppingCart className="w-4 h-4" />
                        </Link>
                        <Link
                            to={`/courses/${course.slug}`}
                            className="flex-1 py-3 px-2 theme-primary-bg hover:brightness-95 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                            View Details <Eye className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, Info, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';

export default function Review() {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewUrl, setReviewUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchReviewStatus = async () => {
            try {
                const res = await axios.get('/api/social-review');
                if (res.data.success && res.data.review) {
                    setReview(res.data.review);
                    setReviewUrl(res.data.review.review_url || '');
                }
            } catch (err) {
                console.error('Error fetching review status', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviewStatus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {
            const res = await axios.post('/api/social-review', {
                review_url: reviewUrl
            });

            if (res.data.success) {
                setReview(res.data.review);
                setSuccessMessage(res.data.message);
            }
        } catch (err) {
            console.error('Error submitting review URL', err);
            if (err.response?.data?.errors?.review_url) {
                setError(err.response.data.errors.review_url[0]);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('সাবমিট করার সময় একটি ত্রুটি হয়েছে। দয়া করে আবার চেষ্টা করুন।');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12 flex justify-center items-center">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-500 text-sm font-medium">রিভিউ পেজ লোড হচ্ছে...</span>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-4 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 md:p-8">
                {/* Header */}
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                            <Star className="w-5 h-5 fill-amber-500" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">রিভিউ সাবমিট করুন</h1>
                    </div>
                    <p className="text-xs text-gray-400 ml-10">নিচের ধাপগুলো অনুসরণ করে বোনাস গিফট আনলক করুন</p>
                </div>

                {review && review.status !== 'rejected' ? (
                    <div className={`rounded-2xl p-6 border transition-all duration-300 ${
                        review.status === 'approved' 
                            ? 'bg-green-50/50 border-green-200' 
                            : 'bg-yellow-50/50 border-yellow-200'
                    }`}>
                        <div className="flex items-start gap-4">
                            {review.status === 'approved' ? (
                                <div className="p-2 bg-green-100 rounded-xl text-green-600 shrink-0">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            ) : (
                                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600 shrink-0 animate-pulse">
                                    <Clock className="w-6 h-6" />
                                </div>
                            )}

                            <div className="flex-1">
                                <h4 className={`text-base font-bold ${
                                    review.status === 'approved' ? 'text-green-800' : 'text-yellow-800'
                                }`}>
                                    {review.status === 'approved' ? 'রিভিউ ভেরিফাইড এবং অ্যাপ্রুভড!' : 'ভেরিফিকেশন পেন্ডিং'}
                                </h4>
                                <p className="mt-2 text-xs leading-relaxed text-gray-600 font-medium">
                                    {review.status === 'approved' ? (
                                        <span className="flex flex-col gap-2">
                                            <span>🎉 অভিনন্দন! আপনার জন্য সব গিফট আনলক করা হয়েছে।</span>
                                            <Link 
                                                to="/dashboard/giftbox" 
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all w-fit shadow-md shadow-green-500/10 mt-1 active:scale-95"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                গিফট বক্স-এ যান
                                            </Link>
                                        </span>
                                    ) : (
                                        'ধন্যবাদ! আমাদের টিম আপনার রিভিউ চেক করছে। ২৪-৪৮ ঘন্টার মধ্যে ফলাফল জানানো হবে।'
                                    )}
                                </p>

                                <div className="mt-4 flex flex-col gap-1 text-[10px] text-gray-400 font-mono">
                                    <div>Submitted URL: <a href={review.review_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{review.review_url}</a></div>
                                    <div>Submitted Date: {new Date(review.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {review && review.status === 'rejected' && (
                            <div className="rounded-2xl p-6 border bg-red-50/50 border-red-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-base font-bold text-red-800">রিভিউ বাতিল করা হয়েছে</h4>
                                        <p className="mt-1 text-xs leading-relaxed text-red-700 font-medium">
                                            {review.admin_feedback || 'আপনার রিভিউ ভেরিফাই করা সম্ভব হয়নি। ইউআরএল সঠিক কিনা যাচাই করে আবার সাবমিট করুন।'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {successMessage && (
                            <div className="rounded-2xl p-6 border bg-green-50/50 border-green-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-green-100 rounded-xl text-green-600 shrink-0">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-green-800">সাবমিট সম্পন্ন হয়েছে</h4>
                                        <p className="mt-1 text-xs text-green-700 font-medium">{successMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 1 */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5 shadow-md shadow-blue-500/10">
                                ১
                            </div>
                            <div className="space-y-3 flex-1">
                                <h3 className="font-bold text-gray-900 text-sm">আমাদের ফেসবুক পেজে রিভিউ দিন</h3>
                                <p className="text-gray-400 text-xs leading-relaxed">নিচের বাটনে ক্লিক করে আমাদের অফিসিয়াল ফেসবুক পেজে একটি ভালো রিভিউ ও ৫-স্টার রেটিং প্রদান করুন।</p>
                                <a
                                    href="https://web.facebook.com/vibethink.official/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all w-fit shadow-sm"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                    ফেসবুক পেজে যান
                                </a>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5 shadow-md shadow-blue-500/10">
                                ২
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <h3 className="font-bold text-gray-900 text-sm">আপনার ফেসবুক প্রোফাইল URL কপি করুন</h3>
                                <p className="text-gray-400 text-xs leading-relaxed">রিভিউ দেওয়া শেষ হলে, আপনার ফেসবুক প্রোফাইলের লিঙ্ক (URL) কপি করুন (যে অ্যাকাউন্ট থেকে রিভিউ দিয়েছেন)।</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0 mt-0.5 shadow-md shadow-blue-500/10">
                                ৩
                            </div>
                            <div className="space-y-4 flex-1">
                                <h3 className="font-bold text-gray-900 text-sm">নিচে লিঙ্কটি সাবমিট করুন</h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="review_url" className="text-xs text-gray-500 font-bold block">
                                            আপনার ফেসবুক প্রোফাইল URL
                                        </label>
                                        <input
                                            id="review_url"
                                            type="url"
                                            placeholder="https://www.facebook.com/your.profile"
                                            className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                                                error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                                            }`}
                                            value={reviewUrl}
                                            onChange={(e) => setReviewUrl(e.target.value)}
                                            required
                                        />
                                        {error && (
                                            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {error}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-500/15 disabled:opacity-50 disabled:pointer-events-none"
                                        disabled={submitting}
                                    >
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        {submitting ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-8 flex gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-xs text-gray-500">
                            <Info className="w-4 h-4 shrink-0 text-gray-400" />
                            <p className="leading-relaxed font-medium">সাবমিট করার পর আমাদের অ্যাডমিন প্যানেল থেকে আপনার রিভিউটি ভেরিফাই করা হবে। ভেরিফিকেশন সফল হলে আপনার জন্য বোনাস গিফটগুলো স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে।</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Gift, Clock, AlertCircle, Lock, ArrowRight, Copy, Check, ExternalLink, Tag, Sparkles, X } from 'lucide-react';

export default function GiftBox() {
    const [gifts, setGifts] = useState([]);
    const [giftsUnlocked, setGiftsUnlocked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copiedKey, setCopiedKey] = useState(null);
    const [selectedGift, setSelectedGift] = useState(null);

    useEffect(() => {
        axios.get('/api/gifts')
            .then(res => {
                if (res.data.success) {
                    setGifts(res.data.gifts);
                    setGiftsUnlocked(res.data.gifts_unlocked || false);
                }
            })
            .catch(err => {
                console.error('Error fetching gifts', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleCopy = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
    };

    const renderDescription = (description, giftId) => {
        if (!description) return null;

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = description.split(urlRegex);

        const hasUrl = urlRegex.test(description);

        if (!hasUrl) {
            return (
                <div className="p-4 bg-gray-50/80 border-l-4 border-blue-500 rounded-r-xl text-sm text-gray-700 font-medium mb-4 leading-relaxed whitespace-pre-wrap">
                    {description}
                </div>
            );
        }

        return (
            <div className="p-4 bg-gray-50/80 border-l-4 border-blue-500 rounded-r-xl mb-4 space-y-2">
                {parts.map((part, i) => {
                    if (part.match(/(https?:\/\/[^\s]+)/g)) {
                        const urlKey = `${giftId}-desc-${i}`;
                        const isCopied = copiedKey === urlKey;

                        return (
                            <div key={i} className="my-2 p-2.5 bg-white border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <ExternalLink className="h-4 w-4 text-blue-600 shrink-0" />
                                    <span className="text-xs font-mono text-gray-800 truncate font-semibold">
                                        {part}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(part, urlKey)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all border ${
                                            isCopied
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                                        }`}
                                    >
                                        {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                        <span>{isCopied ? 'কপি হয়েছে' : 'কপি লিংক'}</span>
                                    </button>
                                    <a
                                        href={part}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-all"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        <span>ওপেন</span>
                                    </a>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <span key={i} className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                            {part}
                        </span>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="py-12 flex justify-center items-center">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-500 text-sm font-medium">গিফট বক্স লোড হচ্ছে...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                    <Gift className="h-7 w-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">উপহার ও ভাউচার</h2>
                    <p className="text-sm text-gray-400 mt-0.5 font-light">আপনার জন্য বিশেষ অফার, কুপন ও উপহারসমূহ</p>
                </div>
            </div>

            {/* Gifts List */}
            <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" /> সকল গিফট ও ভাউচার
                </h3>
                {gifts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gifts.map((gift, index) => {
                            const isLocked = gift.is_locked && !giftsUnlocked;
                            const isCodeUrl = gift.code && (gift.code.startsWith('http://') || gift.code.startsWith('https://'));
                            const isCodeCopied = copiedKey === `${gift.id}-code`;

                            return (
                                <div 
                                    key={gift.id} 
                                    className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm relative transition-all duration-300 hover:shadow-lg hover:border-blue-500/20 flex flex-col justify-between"
                                >
                                    {/* Locked Overlay */}
                                    {isLocked && (
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 backdrop-blur-[2px] rounded-2xl text-center p-4">
                                            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mb-3 shadow-sm border border-gray-200">
                                                <Lock className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm mb-1">গিফটটি লক করা আছে</h4>
                                            <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
                                                ফেসবুকে আমাদের রিভিউ দিয়ে এই প্রিমিয়াম গিফটটি আনলক করুন।
                                            </p>
                                            <Link
                                                to="/dashboard/review"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                                            >
                                                আনলক করুন <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}

                                    {/* Content Wrapper */}
                                    <div className={isLocked ? 'blur-[1.5px] select-none pointer-events-none' : ''}>
                                        {/* Overlapping badge */}
                                        <div className={`absolute -top-3.5 -right-2 h-8 w-8 rounded-full text-white flex items-center justify-center text-sm font-extrabold border-2 border-white shadow-sm z-10 ${
                                            isLocked ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                        }`}>
                                            #{index + 1}
                                        </div>

                                        <h4 className="text-base font-bold text-gray-900 leading-tight mb-3">
                                            {gift.title}
                                        </h4>

                                        {/* Code / Link display with Copy Button */}
                                        {gift.code && (
                                            isCodeUrl ? (
                                                <div className="mb-4 p-3 bg-blue-50/70 border border-blue-150 rounded-xl flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <ExternalLink className="h-4 w-4 text-blue-600 shrink-0" />
                                                        <span className="text-xs font-mono font-semibold text-blue-900 truncate">
                                                            {gift.code}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(gift.code, `${gift.id}-code`)}
                                                            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all border ${
                                                                isCodeCopied
                                                                    ? 'bg-green-600 border-green-600 text-white'
                                                                    : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-100/50'
                                                            }`}
                                                        >
                                                            {isCodeCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                            <span>{isCodeCopied ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                                                        </button>
                                                        <a
                                                            href={gift.code}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-all"
                                                        >
                                                            <span>ওপেন</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-4 p-3 bg-indigo-50/70 border border-dashed border-indigo-300 rounded-xl flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Tag className="h-4 w-4 text-indigo-600 shrink-0" />
                                                        <span className="text-sm font-bold font-mono text-indigo-900 tracking-wider">
                                                            {gift.code}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(gift.code, `${gift.id}-code`)}
                                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all border shadow-sm ${
                                                            isCodeCopied
                                                                ? 'bg-green-600 border-green-600 text-white shadow-green-500/20'
                                                                : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20 active:scale-95'
                                                        }`}
                                                    >
                                                        {isCodeCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                        <span>{isCodeCopied ? 'কপি হয়েছে!' : 'কপি কোড'}</span>
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {/* Description box */}
                                        {renderDescription(gift.description, gift.id)}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 mt-2">
                                        <span className="flex items-center gap-1 font-medium">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatDate(gift.created_at)}
                                        </span>
                                        <button 
                                            onClick={() => setSelectedGift(gift)}
                                            className="font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                                        >
                                            বিস্তারিত দেখুন
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">এই মুহূর্তে কোনো উপহার বা ভাউচার উপলব্ধ নেই।</p>
                    </div>
                )}
            </div>

            {/* Gift Detail Modal */}
            {selectedGift && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
                    onClick={(e) => e.target === e.currentTarget && setSelectedGift(null)}
                >
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 relative border border-gray-100 space-y-4">
                        <button 
                            onClick={() => setSelectedGift(null)}
                            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                <Gift className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedGift.title}</h3>
                                <p className="text-xs text-gray-400">{formatDate(selectedGift.created_at)}</p>
                            </div>
                        </div>

                        {selectedGift.code && (
                            <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-2xl flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-indigo-600 mb-0.5">কুপন / লিংক</p>
                                    <p className="text-sm font-mono font-bold text-indigo-900 truncate">{selectedGift.code}</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(selectedGift.code, `modal-${selectedGift.id}`)}
                                    className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                                        copiedKey === `modal-${selectedGift.id}`
                                            ? 'bg-green-600 text-white'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {copiedKey === `modal-${selectedGift.id}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    <span>{copiedKey === `modal-${selectedGift.id}` ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">বিস্তারিত বিবরণ</h4>
                            <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 leading-relaxed max-h-60 overflow-y-auto">
                                {renderDescription(selectedGift.description, `modal-desc-${selectedGift.id}`)}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setSelectedGift(null)}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

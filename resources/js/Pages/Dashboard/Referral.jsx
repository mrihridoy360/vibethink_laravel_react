import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, Copy, Check, Share2, TrendingUp, DollarSign, Clock,
    CheckCircle2, XCircle, AlertCircle, Wallet, Gift, Award,
    Link2, ExternalLink, MessageCircle, Send, Globe, ChevronRight,
    HelpCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../../Contexts/AuthContext';

const statusConfig = {
    pending:   { label: 'অপেক্ষমাণ', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    approved:  { label: 'অনুমোদিত', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    rejected:  { label: 'প্রত্যাখ্যাত', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    suspended: { label: 'স্থগিত', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
};

const toBengaliNum = (num) => {
    if (num === null || num === undefined || num === '') return '০';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[digit]);
};

export default function Referral() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('commissions');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('/api/referral');
                if (res.data.success) setData(res.data);
            } catch (e) {
                console.error('Error fetching referral data', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const referralUser = data?.referral_user;
    const settings = data?.settings;
    const commissions = data?.commissions || [];
    const referredUsers = data?.referred_users || [];
    const referralCode = data?.referral_code;

    const fullReferralUrl = referralCode
        ? `${window.location.origin}?ref=${referralCode}`
        : '';

    const handleCopy = () => {
        if (!fullReferralUrl) return;
        navigator.clipboard.writeText(fullReferralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    const handleShare = (platform) => {
        if (!fullReferralUrl) return;
        const text = 'VibeThink Academy-এ প্রিমিয়াম কোর্সসমূহ এক্সপ্লোর করুন এবং স্কিল আপগ্রেড করুন:';
        let shareUrl = '';

        if (platform === 'whatsapp') {
            shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + fullReferralUrl)}`;
        } else if (platform === 'facebook') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullReferralUrl)}`;
        } else if (platform === 'telegram') {
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(fullReferralUrl)}&text=${encodeURIComponent(text)}`;
        }
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-slate-200 rounded-xl w-64" />
                <div className="h-48 bg-slate-200 rounded-3xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-28 bg-slate-200 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const totalEarned = commissions
        .filter(c => c.status === 'credited')
        .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

    const pendingEarned = commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

    const successfulSalesCount = commissions.filter(c => c.status === 'credited').length;

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold mb-2">
                        <Gift className="w-3.5 h-3.5" />
                        <span>এফিলিয়েট ড্যাশবোর্ড</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        এফিলিয়েট ও রেফারেল প্রোগ্রাম
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                        আপনার রেফারেল লিঙ্ক শেয়ার করুন এবং প্রতি সফল এনরোলমেন্টে আকর্ষণীয় কমিশন অর্জন করুন।
                    </p>
                </div>

                {referralUser && (
                    <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 text-xs font-bold shrink-0 shadow-sm ${statusConfig[referralUser.status]?.color}`}>
                        {referralUser.status === 'approved' ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : referralUser.status === 'pending' ? (
                            <AlertCircle className="h-4 w-4" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <span>অ্যাকাউন্ট স্ট্যাটাস: {statusConfig[referralUser.status]?.label}</span>
                    </div>
                )}
            </div>

            {/* Account Rejection / Warning Notice if needed */}
            {referralUser?.rejection_reason && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs font-medium">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">রেফারেল অ্যাকাউন্ট নোট:</p>
                        <p>{referralUser.rejection_reason}</p>
                    </div>
                </div>
            )}

            {/* Hero Referral Link Card */}
            {referralCode ? (
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
                    {/* Ambient Glow Effects */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg sm:text-xl font-extrabold flex items-center gap-2 text-white">
                                    <Sparkles className="w-5 h-5 text-amber-400" /> আপনার ইউনিক এফিলিয়েট লিঙ্ক
                                </h3>
                                <p className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">
                                    এই লিঙ্ক কপি করে সোশ্যাল মিডিয়া বা বন্ধুদের সাথে শেয়ার করুন।
                                </p>
                            </div>

                            {settings && (
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-bold text-slate-200 shrink-0">
                                    <span>কমিশন রেট: <strong className="text-amber-400 font-black">{toBengaliNum(settings.commission_percentage)}%</strong></span>
                                    {parseFloat(settings.minimum_payout) > 0 && (
                                        <>
                                            <span className="text-white/40">•</span>
                                            <span>সর্বনিম্ন উইথড্র: <strong className="text-white">৳{toBengaliNum(Math.round(settings.minimum_payout))}</strong></span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Copy Link Input Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-slate-800/80 p-2 rounded-2xl border border-slate-700/80 backdrop-blur-md">
                            <div className="flex items-center gap-3 px-3 py-2 flex-1 min-w-0">
                                <Link2 className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="text-xs sm:text-sm font-mono text-slate-200 truncate select-all">
                                    {fullReferralUrl}
                                </span>
                            </div>

                            <button
                                onClick={handleCopy}
                                className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none shrink-0 shadow-md ${
                                    copied
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white active:scale-95'
                                }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span>{copied ? 'লিঙ্ক কপি হয়েছে!' : 'লিঙ্ক কপি করুন'}</span>
                            </button>
                        </div>

                        {/* Quick Social Share Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <span className="text-xs text-slate-400 font-semibold mr-1">এক ক্লিকে শেয়ার করুন:</span>
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </button>
                            <button
                                onClick={() => handleShare('facebook')}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Globe className="w-3.5 h-3.5" /> Facebook
                            </button>
                            <button
                                onClick={() => handleShare('telegram')}
                                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" /> Telegram
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700">রেফারেল অ্যাকাউন্ট সচল নয়</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        আপনার রেফারেল অ্যাকাউন্টের অ্যাক্টিভেশনের জন্য অনুগ্রহ করে এডমিন টিমের সাথে যোগাযোগ করুন।
                    </p>
                </div>
            )}

            {/* Key Metrics Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
                {/* Metric 1 */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500">রেফার করা ইউজার</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                            {toBengaliNum(referredUsers.length)} <span className="text-xs text-slate-400 font-semibold">জন</span>
                        </h4>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500">মোট অর্জিত আয়</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl sm:text-3xl font-black text-emerald-600">
                            ৳{toBengaliNum(Math.round(totalEarned))}
                        </h4>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500">অপেক্ষমাণ আয়</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl sm:text-3xl font-black text-amber-600">
                            ৳{toBengaliNum(Math.round(pendingEarned))}
                        </h4>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500">সফল সেলস</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                            {toBengaliNum(successfulSalesCount)} <span className="text-xs text-slate-400 font-semibold">টি</span>
                        </h4>
                    </div>
                </div>
            </div>

            {/* Content Tabs & Detailed Lists */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Sub Tab Navigation Header */}
                <div className="px-5 pt-4 pb-0 border-b border-slate-150 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveSubTab('commissions')}
                        className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                            activeSubTab === 'commissions'
                                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl shadow-xs'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span>কমিশন ইতিহাস ({toBengaliNum(commissions.length)})</span>
                    </button>

                    <button
                        onClick={() => setActiveSubTab('referred_users')}
                        className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                            activeSubTab === 'referred_users'
                                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl shadow-xs'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>রেফার করা সদস্য ({toBengaliNum(referredUsers.length)})</span>
                    </button>
                </div>

                {/* Sub Tab Content */}
                <div className="p-4 sm:p-6">
                    {/* Tab 1: Commission History */}
                    {activeSubTab === 'commissions' && (
                        <div>
                            {commissions.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 space-y-2">
                                    <TrendingUp className="w-10 h-10 mx-auto text-slate-300" />
                                    <p className="text-sm font-bold text-slate-600">এখনো কোনো কমিশন হিস্ট্রি নেই</p>
                                    <p className="text-xs">আপনার রেফারেল লিঙ্ক শেয়ার করুন এবং প্রথম কমিশন অর্জন করুন!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {commissions.map((commission) => (
                                        <div key={commission.id} className="py-3.5 sm:py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-xl transition-all">
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                                                    ৳
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                        {commission.referred?.name || 'রেফার্ড ইউজার'}
                                                    </h5>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                                        কোর্স: {commission.course?.title || 'কোর্স ইনরোলমেন্ট'}
                                                    </p>
                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        {new Date(commission.created_at).toLocaleDateString('bn-BD')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-sm sm:text-base font-black text-emerald-600">
                                                    +৳{toBengaliNum(parseFloat(commission.commission_amount).toFixed(0))}
                                                </p>
                                                <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 border ${
                                                    commission.status === 'credited'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {commission.status === 'credited' ? 'জমা হয়েছে' : 'অপেক্ষমাণ'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Referred Users */}
                    {activeSubTab === 'referred_users' && (
                        <div>
                            {referredUsers.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 space-y-2">
                                    <Users className="w-10 h-10 mx-auto text-slate-300" />
                                    <p className="text-sm font-bold text-slate-600">কোনো রেফার্ড সদস্য পাওয়া যায়নি</p>
                                    <p className="text-xs">আপনার ইউনিক রেফারেল লিঙ্ক শেয়ার করে বন্ধুদের যুক্ত করুন।</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {referredUsers.map((u) => (
                                        <div key={u.id} className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/40 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{u.name}</h5>
                                                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400 shrink-0">
                                                {new Date(u.created_at).toLocaleDateString('bn-BD')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

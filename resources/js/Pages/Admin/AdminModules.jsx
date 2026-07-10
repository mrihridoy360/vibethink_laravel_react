import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    FileText, ShoppingCart, Gift, Megaphone, Package, Star,
    Wrench, ShoppingBag, GitBranch, BookMarked, MessageSquare,
    Ticket, CheckCircle, XCircle, Loader2, Save, RefreshCw, Zap
} from 'lucide-react';

const MODULES = [
    {
        key: 'feature_assignments',
        label: 'এসাইনমেন্ট',
        description: 'কোর্সে এসাইনমেন্ট সিস্টেম — শিক্ষার্থীরা কাজ জমা দিতে পারবে এবং অ্যাডমিন গ্রেড দিতে পারবে।',
        icon: FileText,
        color: 'blue',
    },
    {
        key: 'feature_enrollments',
        label: 'এনরোলমেন্ট',
        description: 'শিক্ষার্থী ভর্তি পদ্ধতি — কোর্সে ম্যানুয়াল ও পেমেন্ট-ভিত্তিক এনরোলমেন্ট।',
        icon: ShoppingCart,
        color: 'indigo',
    },
    {
        key: 'feature_coupons',
        label: 'কুপন',
        description: 'ডিসকাউন্ট কুপন সিস্টেম — নির্দিষ্ট % বা পরিমাণ ছাড় দেওয়ার কুপন তৈরি করুন।',
        icon: Gift,
        color: 'pink',
    },
    {
        key: 'feature_announcements',
        label: 'ঘোষণা',
        description: 'শিক্ষার্থীদের জন্য নোটিফিকেশন — গুরুত্বপূর্ণ আপডেট ও ঘোষণা পাঠান।',
        icon: Megaphone,
        color: 'amber',
    },
    {
        key: 'feature_gifts',
        label: 'গিফট',
        description: 'গিফট ও উপহার সিস্টেম — কোর্স বা পণ্য গিফট হিসেবে পাঠানোর সুবিধা।',
        icon: Package,
        color: 'rose',
    },
    {
        key: 'feature_social_reviews',
        label: 'সোশ্যাল রিভিউ',
        description: 'হোমপেজে সোশ্যাল প্রমাণ — পুরানো শিক্ষার্থীদের রিভিউ ও টেস্টিমোনিয়াল।',
        icon: Star,
        color: 'yellow',
    },
    {
        key: 'feature_tools',
        label: 'AI টুলস',
        description: 'AI ও টুলস মার্কেটপ্লেস — বিভিন্ন AI ও ডিজিটাল টুলস তালিকাভুক্ত করুন।',
        icon: Wrench,
        color: 'violet',
    },
    {
        key: 'feature_products',
        label: 'পণ্য',
        description: 'ডিজিটাল পণ্য বিক্রয় — ই-বুক, টেমপ্লেট ও অন্যান্য ডিজিটাল পণ্য।',
        icon: ShoppingBag,
        color: 'emerald',
    },
    {
        key: 'feature_referral',
        label: 'রেফারেল',
        description: 'এফিলিয়েট ও রেফারেল প্রোগ্রাম — কমিশন-ভিত্তিক রেফারেল সিস্টেম।',
        icon: GitBranch,
        color: 'cyan',
    },
    {
        key: 'feature_blog',
        label: 'ব্লগ',
        description: 'ব্লগ ও কন্টেন্ট ম্যানেজমেন্ট — আর্টিকেল ও নিউজ পোস্ট পরিচালনা করুন।',
        icon: BookMarked,
        color: 'teal',
    },
    {
        key: 'feature_reviews',
        label: 'কোর্স রিভিউ',
        description: 'শিক্ষার্থীদের রিভিউ সিস্টেম — কোর্সে রেটিং ও মন্তব্য করার সুবিধা।',
        icon: MessageSquare,
        color: 'orange',
    },
    {
        key: 'feature_support_tickets',
        label: 'সাপোর্ট টিকেট',
        description: 'গ্রাহক সেবা টিকেট সিস্টেম — ব্যবহারকারীরা সমস্যা জানাতে টিকেট খুলতে পারবে।',
        icon: Ticket,
        color: 'slate',
    },
];

// Color map for badge backgrounds
const COLOR_MAP = {
    blue:    'bg-blue-50 text-blue-600 border-blue-100',
    indigo:  'bg-indigo-50 text-indigo-600 border-indigo-100',
    pink:    'bg-pink-50 text-pink-600 border-pink-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    rose:    'bg-rose-50 text-rose-600 border-rose-100',
    yellow:  'bg-yellow-50 text-yellow-600 border-yellow-100',
    violet:  'bg-violet-50 text-violet-600 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cyan:    'bg-cyan-50 text-cyan-600 border-cyan-100',
    teal:    'bg-teal-50 text-teal-600 border-teal-100',
    orange:  'bg-orange-50 text-orange-600 border-orange-100',
    slate:   'bg-slate-50 text-slate-600 border-slate-100',
};

export default function AdminModules() {
    const [features, setFeatures]   = useState({});
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [changed, setChanged]     = useState(false);
    const [toast, setToast]         = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/admin/settings');
            if (data.success) {
                setFeatures(data.settings?.features || {});
            }
        } catch {
            showToast('error', 'ফিচার লোড করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
            setChanged(false);
        }
    };

    useEffect(() => { fetchFeatures(); }, []);

    const toggle = (key) => {
        setFeatures((prev) => ({
            ...prev,
            [key]: prev[key] === '1' || prev[key] === 1 || prev[key] === true ? '0' : '1',
        }));
        setChanged(true);
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            const { data } = await axios.post('/api/admin/settings', {
                group: 'features',
                settings: features,
            });
            if (data.success) {
                showToast('success', data.message || 'মডিউল সেটিংস সেভ হয়েছে।');
                setChanged(false);
            } else {
                showToast('error', data.message || 'সেভ করতে সমস্যা হয়েছে।');
            }
        } catch (err) {
            showToast('error', err?.response?.data?.message || 'সেভ করতে সমস্যা হয়েছে।');
        } finally {
            setSaving(false);
        }
    };

    const activeCount   = MODULES.filter((m) => features[m.key] === '1' || features[m.key] === 1).length;
    const inactiveCount = MODULES.length - activeCount;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">মডিউল তথ্য লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800">মডিউল ম্যানেজমেন্ট</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        সাইটের বিভিন্ন ফিচার মডিউল চালু বা বন্ধ করুন। পরিবর্তনগুলো সাথে সাথে কার্যকর হবে।
                    </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    <button
                        onClick={fetchFeatures}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        রিফ্রেশ
                    </button>
                    <button
                        onClick={saveAll}
                        disabled={saving || !changed}
                        className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow transition-all duration-200"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold border ${
                    toast.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                    {toast.type === 'success'
                        ? <CheckCircle className="w-4 h-4 shrink-0" />
                        : <XCircle className="w-4 h-4 shrink-0" />}
                    {toast.message}
                </div>
            )}

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-slate-800">{MODULES.length}</p>
                        <p className="text-xs text-slate-500 font-medium">মোট মডিউল</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-slate-800">{activeCount}</p>
                        <p className="text-xs text-slate-500 font-medium">সক্রিয় মডিউল</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-xl font-extrabold text-slate-800">{inactiveCount}</p>
                        <p className="text-xs text-slate-500 font-medium">নিষ্ক্রিয় মডিউল</p>
                    </div>
                </div>
            </div>

            {/* Modules grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {MODULES.map((mod) => {
                    const Icon    = mod.icon;
                    const isOn    = features[mod.key] === '1' || features[mod.key] === 1 || features[mod.key] === true;
                    const colorCls = COLOR_MAP[mod.color] || COLOR_MAP.slate;

                    return (
                        <div
                            key={mod.key}
                            className={`relative bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-all duration-200 ${
                                isOn ? 'border-orange-200/80 ring-1 ring-orange-100' : 'border-slate-200/80'
                            }`}
                        >
                            {/* Active indicator dot */}
                            {isOn && (
                                <span className="absolute top-4 right-16 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            )}

                            {/* Icon + Toggle row */}
                            <div className="flex items-start justify-between gap-3">
                                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${colorCls}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* Toggle switch */}
                                <button
                                    type="button"
                                    onClick={() => toggle(mod.key)}
                                    className={`relative mt-0.5 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${
                                        isOn ? 'bg-orange-500' : 'bg-slate-200'
                                    }`}
                                    title={isOn ? 'বন্ধ করুন' : 'চালু করুন'}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                                            isOn ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Label + description */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-extrabold text-slate-800">{mod.label}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        isOn
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {isOn ? 'চালু' : 'বন্ধ'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{mod.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Unsaved changes bar */}
            {changed && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    অসেভকৃত পরিবর্তন আছে
                    <button
                        onClick={saveAll}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500 hover:bg-orange-400 rounded-xl font-bold text-xs transition-colors"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        সেভ করুন
                    </button>
                </div>
            )}
        </div>
    );
}

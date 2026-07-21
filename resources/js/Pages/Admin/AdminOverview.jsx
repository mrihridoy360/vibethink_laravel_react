import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    DollarSign, Users, BookOpen, ShoppingCart,
    TrendingUp, TrendingDown, ArrowUpRight,
    Clock, CheckCircle2, AlertCircle, Plus,
    Activity, Globe, Compass
} from 'lucide-react';

// ── Mini SVG Line Chart ───────────────────────────────────────
function RevenueChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-300 text-xs">
                পর্যাপ্ত ডেটা নেই
            </div>
        );
    }

    const W = 800, H = 200, PAD = 40;
    const values = data.map(d => parseFloat(d.total));
    const maxVal = Math.max(...values, 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    // Build months labels
    const monthNames = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে'];

    const pts = data.map((d, i) => {
        const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2);
        const y = H - PAD - ((parseFloat(d.total) - minVal) / range) * (H - PAD * 2);
        return [x, y];
    });

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
    const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${H - PAD} L ${pts[0][0]} ${H - PAD} Z`;

    // Y-axis labels
    const ySteps = 4;
    const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
        const val = minVal + (range * i) / ySteps;
        return { val, y: H - PAD - (i / ySteps) * (H - PAD * 2) };
    });

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" preserveAspectRatio="none">
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
                </linearGradient>
            </defs>

            {/* Grid lines */}
            {yLabels.map(({ y }, i) => (
                <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y}
                    stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
            ))}

            {/* Y labels */}
            {yLabels.map(({ val, y }, i) => (
                <text key={i} x={PAD - 6} y={y + 4} textAnchor="end"
                    fontSize="10" fill="#9ca3af">
                    ৳{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
                </text>
            ))}

            {/* X labels */}
            {data.map((d, i) => {
                const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2);
                return (
                    <text key={i} x={x} y={H - 6} textAnchor="middle"
                        fontSize="10" fill="#9ca3af">
                        {monthNames[(d.month - 1) % 12]}
                    </text>
                );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points */}
            {pts.map(([x, y], i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
                </g>
            ))}
        </svg>
    );
}

// ── Visitor Stats Line Chart ───────────────────────────────────
function VisitorStatsChart({ dailyData }) {
    if (!dailyData || Object.keys(dailyData).length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-300 text-xs">
                পর্যাপ্ত ডেটা নেই
            </div>
        );
    }

    const W = 800, H = 200, PAD = 40;
    
    // Sort dates
    const sortedDates = Object.keys(dailyData).sort().slice(-15); // Show last 15 days
    if (sortedDates.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-300 text-xs">
                পর্যাপ্ত ডেটা নেই
            </div>
        );
    }

    const pvs = sortedDates.map(date => dailyData[date].pageviews || 0);
    const uniques = sortedDates.map(date => dailyData[date].uniques || 0);
    const maxVal = Math.max(...pvs, ...uniques, 10);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    // Helper to format dates
    const formatDate = (dateStr) => {
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const day = parseInt(parts[2]);
                const monthNum = parseInt(parts[1]);
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${day} ${months[monthNum - 1]}`;
            }
        } catch (e) {}
        return dateStr;
    };

    // Points for Pageviews
    const ptsPv = sortedDates.map((date, i) => {
        const x = PAD + (i / Math.max(sortedDates.length - 1, 1)) * (W - PAD * 2);
        const y = H - PAD - ((dailyData[date].pageviews - minVal) / range) * (H - PAD * 2);
        return [x, y];
    });

    // Points for Uniques
    const ptsUnq = sortedDates.map((date, i) => {
        const x = PAD + (i / Math.max(sortedDates.length - 1, 1)) * (W - PAD * 2);
        const y = H - PAD - ((dailyData[date].uniques - minVal) / range) * (H - PAD * 2);
        return [x, y];
    });

    const linePathPv = ptsPv.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
    const linePathUnq = ptsUnq.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
    
    const areaPathPv = `${linePathPv} L ${ptsPv[ptsPv.length - 1][0]} ${H - PAD} L ${ptsPv[0][0]} ${H - PAD} Z`;
    const areaPathUnq = `${linePathUnq} L ${ptsUnq[ptsUnq.length - 1][0]} ${H - PAD} L ${ptsUnq[0][0]} ${H - PAD} Z`;

    // Y-axis labels
    const ySteps = 4;
    const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
        const val = minVal + (range * i) / ySteps;
        return { val, y: H - PAD - (i / ySteps) * (H - PAD * 2) };
    });

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" preserveAspectRatio="none">
            <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="unqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
                </linearGradient>
            </defs>

            {/* Grid lines */}
            {yLabels.map(({ y }, i) => (
                <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y}
                    stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
            ))}

            {/* Y labels */}
            {yLabels.map(({ val, y }, i) => (
                <text key={i} x={PAD - 6} y={y + 4} textAnchor="end"
                    fontSize="10" fill="#9ca3af">
                    {val.toFixed(0)}
                </text>
            ))}

            {/* X labels */}
            {sortedDates.map((date, i) => {
                const x = PAD + (i / Math.max(sortedDates.length - 1, 1)) * (W - PAD * 2);
                if (i % 2 !== 0 && i !== sortedDates.length - 1) return null;
                return (
                    <text key={i} x={x} y={H - 6} textAnchor="middle"
                        fontSize="9" fill="#9ca3af">
                        {formatDate(date)}
                    </text>
                );
            })}

            {/* Area Fills */}
            <path d={areaPathPv} fill="url(#pvGrad)" />
            <path d={areaPathUnq} fill="url(#unqGrad)" />

            {/* Line Pageviews */}
            <path d={linePathPv} fill="none" stroke="#10b981" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />

            {/* Line Uniques */}
            <path d={linePathUnq} fill="none" stroke="#f59e0b" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />

            {/* Points Pageviews */}
            {ptsPv.map(([x, y], i) => (
                <circle key={`pv-${i}`} cx={x} cy={y} r="3.5" fill="#10b981" stroke="white" strokeWidth="1.5" />
            ))}

            {/* Points Uniques */}
            {ptsUnq.map(([x, y], i) => (
                <circle key={`unq-${i}`} cx={x} cy={y} r="3.5" fill="#f59e0b" stroke="white" strokeWidth="1.5" />
            ))}
        </svg>
    );
}

const getCountryName = (code) => {
    const countries = {
        'BD': 'Bangladesh 🇧🇩',
        'US': 'United States 🇺🇸',
        'GB': 'United Kingdom 🇬🇧',
        'IN': 'India 🇮🇳',
        'PK': 'Pakistan 🇵🇰',
        'CA': 'Canada 🇨🇦',
        'AU': 'Australia 🇦🇺',
        'SA': 'Saudi Arabia 🇸🇦',
        'AE': 'United Arab Emirates 🇦🇪',
        'MY': 'Malaysia 🇲🇾',
        'SG': 'Singapore 🇸🇬',
        'DE': 'Germany 🇩🇪',
        'FR': 'France 🇫🇷',
        'Localhost': 'Localhost 💻'
    };
    return countries[code] || code || 'Unknown 🌐';
};

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, growth, icon: Icon, iconBg, iconColor, onClick }) {
    const isPositive = growth >= 0;
    return (
        <button
            onClick={onClick}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-lg hover:border-blue-500/20 transition-all group text-left w-full"
        >
            <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
                <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{value}</span>
                {sub && <span className="text-xs text-gray-400 mt-0.5 block">{sub}</span>}
                {growth !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {isPositive ? '+' : ''}{growth}%
                    </span>
                )}
            </div>
            <div className={`p-3 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
            </div>
        </button>
    );
}

export default function AdminOverview({ onTabChange }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('/api/admin/stats');
                if (res.data.success) setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => <div key={n} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    const stats = data?.stats || {};
    const monthlyRevenue = data?.monthly_revenue || [];
    const recentPayments = data?.recent_payments || [];
    const recentUsers    = data?.recent_users    || [];
    const visitorStats   = data?.visitor_stats   || { online_count: 0, online_list: [], total_pageviews: 0, total_uniques: 0, referrers: [], countries: [], daily: {} };

    const paymentStatusCfg = {
        completed: { label: 'সম্পন্ন', color: 'bg-green-100 text-green-700' },
        pending:   { label: 'অপেক্ষমাণ', color: 'bg-yellow-100 text-yellow-700' },
        failed:    { label: 'ব্যর্থ', color: 'bg-red-100 text-red-700' },
        refunded:  { label: 'ফেরত', color: 'bg-purple-100 text-purple-700' },
    };

    return (
        <div className="space-y-6">
            {/* Welcome card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full -translate-y-16 translate-x-16 -z-0" />
                <div className="relative">
                    <p className="text-sm text-blue-500 font-semibold flex items-center gap-1.5 mb-1">
                        🚀 স্বাগতম, অ্যাডমিন!
                    </p>
                    <h2 className="text-lg md:text-xl font-extrabold text-gray-900">আপনার লার্নিং প্ল্যাটফর্ম ওভারভিউ</h2>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-lg">
                        আপনার প্ল্যাটফর্মের কার্যকারিতা ট্র্যাক করুন, এনরোলমেন্ট মনিটর করুন এবং আপনার কোর্সগুলি পরিচালনা করুন।
                    </p>
                </div>
                <button
                    onClick={() => onTabChange('courses')}
                    className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 md:px-5 py-2 md:py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> নতুন কোর্স
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                    label="মোট রাজস্ব"
                    value={`৳${parseFloat(stats.total_revenue || 0).toLocaleString('bn-BD')}`}
                    sub="এই মাসের রাজস্ব"
                    growth={stats.revenue_growth}
                    icon={DollarSign}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                    onClick={() => onTabChange('payments')}
                />
                <StatCard
                    label="সক্রিয় শিক্ষার্থী"
                    value={stats.active_users ?? 0}
                    sub={`মোট ${stats.total_users ?? 0} জন নিবন্ধিত ব্যবহারকারী`}
                    icon={Users}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    onClick={() => onTabChange('users')}
                />
                <StatCard
                    label="সক্রিয় কোর্স"
                    value={stats.published_courses ?? 0}
                    sub={`মোট ${stats.total_courses ?? 0}টি কোর্স`}
                    icon={BookOpen}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                    onClick={() => onTabChange('courses')}
                />
                <StatCard
                    label="এনরোলমেন্ট"
                    value={stats.total_enrollments ?? 0}
                    sub={`এই মাসে ${stats.month_enrollments ?? 0}টি নতুন`}
                    icon={ShoppingCart}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                    onClick={() => onTabChange('enrollments')}
                />
                <StatCard
                    label="অনলাইন ব্যবহারকারী"
                    value={visitorStats.online_count ?? 0}
                    sub="বর্তমানে সক্রিয় ভিজিটর"
                    icon={Activity}
                    iconBg="bg-rose-50"
                    iconColor="text-rose-500"
                />
                <StatCard
                    label="মোট ভিজিটর"
                    value={visitorStats.total_uniques ?? 0}
                    sub={`মোট পেজভিউ: ${visitorStats.total_pageviews ?? 0}`}
                    icon={Globe}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-500"
                />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" /> রাজস্ব ওভারভিউ
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">মাসিক রাজস্ব ট্রেন্ড</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">
                        গত ১২ মাস
                    </span>
                </div>
                <RevenueChart data={monthlyRevenue} />
            </div>

            {/* Visitor Stats Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Visitor Chart (Spans 2 columns on xl screens) */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" /> ভিজিটর ও লাইভ ট্রাফিক স্ট্যাটিসটিক্স
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">দৈনিক ভিজিটর ও পেজভিউ ট্রেন্ড (গত ১৫ দিন)</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-3 text-xs font-semibold">
                                <span className="flex items-center gap-1.5 text-emerald-600">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> পেজভিউ
                                </span>
                                <span className="flex items-center gap-1.5 text-amber-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ইউনিক
                                </span>
                            </div>
                            <button
                                onClick={() => onTabChange('visitor_stats')}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                            >
                                বিস্তারিত →
                            </button>
                        </div>
                    </div>
                    <VisitorStatsChart dailyData={visitorStats.daily} />
                </div>

                {/* Country and Referrer lists */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-6">
                    {/* Top Referrers */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                            <Compass className="h-4 w-4 text-blue-500" /> টপ রেফারার (Top Referrers)
                        </h4>
                        {!visitorStats.referrers || visitorStats.referrers.length === 0 ? (
                            <p className="text-xs text-gray-400 py-2">কোনো রেফারার তথ্য নেই</p>
                        ) : (
                            <div className="space-y-2">
                                {visitorStats.referrers.slice(0, 5).map((ref, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 font-medium truncate max-w-[180px]">{ref.name}</span>
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">{ref.count} hits</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Countries */}
                    <div className="border-t border-gray-50 pt-4">
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                            <Globe className="h-4 w-4 text-purple-500" /> টপ কান্ট্রি (Top Countries)
                        </h4>
                        {!visitorStats.countries || visitorStats.countries.length === 0 ? (
                            <p className="text-xs text-gray-400 py-2">কোনো দেশের তথ্য নেই</p>
                        ) : (
                            <div className="space-y-2">
                                {visitorStats.countries.slice(0, 5).map((c, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 font-medium">{getCountryName(c.code)}</span>
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">{c.count} hits</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Live Online Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        লাইভ সক্রিয় ব্যবহারকারী ({visitorStats.online_count ?? 0} জন অনলাইন)
                    </h3>
                </div>
                {!visitorStats.online_list || visitorStats.online_list.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-400">বর্তমানে কোনো ভিজিটর সক্রিয় নেই।</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/60 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <th className="py-3 px-5">ব্যবহারকারী/IP</th>
                                    <th className="py-3 px-5">দেশ</th>
                                    <th className="py-3 px-5">পেজ ইউআরএল (Page Path)</th>
                                    <th className="py-3 px-5">রেফারার</th>
                                    <th className="py-3 px-5 text-right">শেষ সক্রিয়তা</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs">
                                {visitorStats.online_list.map((visitor, idx) => {
                                    const secondsAgo = Math.max(0, Math.floor(Date.now() / 1000 - visitor.last_seen));
                                    const timeStr = secondsAgo < 60
                                        ? 'এইমাত্র'
                                        : `${Math.floor(secondsAgo / 60)} মিনিট আগে`;
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                                            <td className="py-3.5 px-5 font-semibold text-gray-800 flex flex-col">
                                                <span>{visitor.user_name}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{visitor.ip}</span>
                                            </td>
                                            <td className="py-3.5 px-5 text-gray-600 font-medium">
                                                {getCountryName(visitor.country)}
                                            </td>
                                            <td className="py-3.5 px-5 text-gray-600 max-w-[200px] truncate">
                                                <span className="px-2 py-1 bg-slate-100 rounded-lg text-[11px] font-mono text-slate-700">
                                                    {visitor.url}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-gray-400 truncate max-w-[150px]">
                                                {visitor.referrer}
                                            </td>
                                            <td className="py-3.5 px-5 text-right font-medium text-gray-600 flex items-center justify-end gap-1.5 mt-0.5">
                                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                {timeStr}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Bottom Grid: Recent Payments + Recent Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">সাম্প্রতিক পেমেন্ট</h3>
                        <button onClick={() => onTabChange('payments')} className="text-xs font-bold text-blue-500 hover:text-blue-600">
                            সবগুলো &gt;
                        </button>
                    </div>
                    {recentPayments.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">কোনো পেমেন্ট নেই</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recentPayments.map(p => {
                                const cfg = paymentStatusCfg[p.status] || paymentStatusCfg.pending;
                                return (
                                    <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                            {p.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{p.user?.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{p.course?.title}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-extrabold text-gray-900">৳{parseFloat(p.amount).toFixed(0)}</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">নতুন ব্যবহারকারী</h3>
                        <button onClick={() => onTabChange('users')} className="text-xs font-bold text-blue-500 hover:text-blue-600">
                            সবগুলো &gt;
                        </button>
                    </div>
                    {recentUsers.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">কোনো ব্যবহারকারী নেই</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recentUsers.map(u => (
                                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                        {u.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                    </div>
                                    <p className="text-xs text-gray-300 shrink-0">
                                        {new Date(u.created_at).toLocaleDateString('bn-BD')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Open Tickets Alert */}
            {stats.open_tickets > 0 && (
                <div
                    onClick={() => onTabChange('tickets')}
                    className="flex items-center gap-4 bg-orange-50 border border-orange-200 rounded-2xl p-4 cursor-pointer hover:bg-orange-100 transition-colors"
                >
                    <div className="p-2.5 bg-orange-100 rounded-xl shrink-0">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm font-bold text-orange-800">{stats.open_tickets}টি খোলা সাপোর্ট টিকেট অপেক্ষা করছে</p>
                        <p className="text-xs text-orange-600 mt-0.5">দ্রুত সাড়া দিতে ক্লিক করুন</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-orange-500 shrink-0" />
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Activity, Users, Eye, Globe, Compass, TrendingUp, TrendingDown,
    RefreshCw, Filter, Calendar, X, ChevronDown, Clock, Wifi,
    BarChart2, ArrowUpRight, ArrowDownRight, Layers, Monitor,
    Search, Info
} from 'lucide-react';

// ─── Country name map ────────────────────────────────────────────
const COUNTRY_NAMES = {
    BD: 'Bangladesh 🇧🇩', US: 'United States 🇺🇸', GB: 'United Kingdom 🇬🇧',
    IN: 'India 🇮🇳', PK: 'Pakistan 🇵🇰', CA: 'Canada 🇨🇦',
    AU: 'Australia 🇦🇺', SA: 'Saudi Arabia 🇸🇦', AE: 'UAE 🇦🇪',
    MY: 'Malaysia 🇲🇾', SG: 'Singapore 🇸🇬', DE: 'Germany 🇩🇪',
    FR: 'France 🇫🇷', JP: 'Japan 🇯🇵', CN: 'China 🇨🇳',
    Localhost: 'Localhost 💻', Unknown: 'Unknown 🌐',
};
const getCountryName = (code) => COUNTRY_NAMES[code] || code || 'Unknown 🌐';

// ─── DATE RANGE PRESETS ──────────────────────────────────────────
const RANGES = [
    { key: '7',     label: 'গত ৭ দিন' },
    { key: '15',    label: 'গত ১৫ দিন' },
    { key: '30',    label: 'গত ৩০ দিন' },
    { key: '90',    label: 'গত ৩ মাস' },
    { key: 'custom',label: 'কাস্টম তারিখ' },
];

// ─── SVG Dual-line Chart ─────────────────────────────────────────
function DualLineChart({ dailyData, height = 220 }) {
    if (!dailyData || Object.keys(dailyData).length === 0) {
        return (
            <div className="flex items-center justify-center text-gray-300 text-xs" style={{ height }}>
                এই সময়কালে কোনো ডেটা নেই
            </div>
        );
    }

    const W = 900, H = height, PAD_L = 46, PAD_R = 16, PAD_T = 12, PAD_B = 32;
    const sortedDates = Object.keys(dailyData).sort();
    const pvs    = sortedDates.map(d => dailyData[d].pageviews || 0);
    const unqs   = sortedDates.map(d => dailyData[d].uniques || 0);
    const maxVal = Math.max(...pvs, ...unqs, 10);
    const range  = maxVal || 1;

    const xOf = (i) => PAD_L + (i / Math.max(sortedDates.length - 1, 1)) * (W - PAD_L - PAD_R);
    const yOf = (v) => H - PAD_B - (v / range) * (H - PAD_T - PAD_B);

    const makeLine = (vals) => vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${xOf(i)},${yOf(v)}`).join(' ');
    const makeArea = (vals, line) => `${line} L${xOf(vals.length - 1)},${H - PAD_B} L${xOf(0)},${H - PAD_B} Z`;

    const linePv  = makeLine(pvs);
    const lineUnq = makeLine(unqs);
    const areaPv  = makeArea(pvs, linePv);
    const areaUnq = makeArea(unqs, lineUnq);

    const ySteps = 4;
    const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => ({
        val: Math.round((range * i) / ySteps),
        y:   yOf((range * i) / ySteps),
    }));

    const formatDate = (d) => {
        const parts = d.split('-');
        return parts.length === 3 ? `${parseInt(parts[2])}/${parseInt(parts[1])}` : d;
    };

    // Show at most ~12 x-axis labels
    const xStep = Math.max(1, Math.ceil(sortedDates.length / 12));

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
            <defs>
                <linearGradient id="visGradPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="visGradUnq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
                </linearGradient>
            </defs>

            {/* Grid */}
            {yLabels.map(({ y }, i) => (
                <line key={i} x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                    stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
            ))}

            {/* Y labels */}
            {yLabels.map(({ val, y }, i) => (
                <text key={i} x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
            ))}

            {/* X labels */}
            {sortedDates.map((d, i) => {
                if (i % xStep !== 0 && i !== sortedDates.length - 1) return null;
                return (
                    <text key={i} x={xOf(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
                        {formatDate(d)}
                    </text>
                );
            })}

            {/* Areas */}
            <path d={areaPv}  fill="url(#visGradPv)"  />
            <path d={areaUnq} fill="url(#visGradUnq)" />

            {/* Lines */}
            <path d={linePv}  fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={lineUnq} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots */}
            {pvs.map((v, i) => (
                <circle key={`pv-${i}`} cx={xOf(i)} cy={yOf(v)} r="3" fill="#10b981" stroke="white" strokeWidth="1.5" />
            ))}
            {unqs.map((v, i) => (
                <circle key={`uq-${i}`} cx={xOf(i)} cy={yOf(v)} r="3" fill="#6366f1" stroke="white" strokeWidth="1.5" />
            ))}
        </svg>
    );
}

// ─── Summary Stat Card ───────────────────────────────────────────
function StatCard({ label, value, growth, icon: Icon, iconBg, iconColor, sub, tooltip }) {
    const positive = growth >= 0;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{value?.toLocaleString()}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                {growth !== undefined && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold mt-1 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {positive ? '+' : ''}{growth}% আগের তুলনায়
                    </span>
                )}
                {tooltip && <p className="text-[10px] text-gray-300 mt-1 italic">{tooltip}</p>}
            </div>
        </div>
    );
}

// ─── Bar with label ──────────────────────────────────────────────
function BarRow({ label, value, maxValue, color = 'bg-blue-500', suffix = '' }) {
    const pct = maxValue > 0 ? Math.max(2, (value / maxValue) * 100) : 0;
    return (
        <div className="flex items-center gap-3 text-xs">
            <span className="w-28 md:w-36 truncate text-gray-600 font-medium shrink-0">{label}</span>
            <div className="flex-grow bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
            <span className="shrink-0 font-bold text-gray-700 w-16 text-right">{value?.toLocaleString()}{suffix}</span>
        </div>
    );
}

// ─── Main AdminVisitorStats ──────────────────────────────────────
export default function AdminVisitorStats() {
    // Filter state
    const [range,      setRange]      = useState('30');
    const [dateFrom,   setDateFrom]   = useState('');
    const [dateTo,     setDateTo]     = useState('');
    const [country,    setCountry]    = useState('');
    const [referrer,   setReferrer]   = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [liveSearch, setLiveSearch] = useState('');

    // Data state
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    // Active section tab
    const [section, setSection] = useState('overview'); // overview | live | referrers | countries | pages

    const fetchData = useCallback(async (overrideFilters = {}) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                range:     overrideFilters.range    ?? range,
                date_from: overrideFilters.dateFrom ?? dateFrom,
                date_to:   overrideFilters.dateTo   ?? dateTo,
                country:   overrideFilters.country  ?? country,
                referrer:  overrideFilters.referrer ?? referrer,
            });
            // Remove empty
            for (const [k, v] of [...params.entries()]) {
                if (!v) params.delete(k);
            }
            const res = await axios.get(`/api/admin/visitor-analytics?${params}`);
            if (res.data.success) setData(res.data);
            else setError('ডেটা লোড করতে সমস্যা হয়েছে।');
        } catch (e) {
            setError('সার্ভার সংযোগ ব্যর্থ হয়েছে।');
        } finally {
            setLoading(false);
        }
    }, [range, dateFrom, dateTo, country, referrer]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Auto-refresh every 30s for live data
    useEffect(() => {
        const interval = setInterval(() => fetchData(), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const applyFilters = () => {
        setShowFilter(false);
        fetchData();
    };

    const resetFilters = () => {
        setRange('30');
        setDateFrom('');
        setDateTo('');
        setCountry('');
        setReferrer('');
        setShowFilter(false);
        fetchData({ range: '30', dateFrom: '', dateTo: '', country: '', referrer: '' });
    };

    const summary = data?.summary || {};
    const daily   = data?.daily   || {};
    const liveList       = (data?.online_list || []).filter(v =>
        liveSearch
            ? v.user_name?.toLowerCase().includes(liveSearch.toLowerCase()) ||
              v.url?.toLowerCase().includes(liveSearch.toLowerCase()) ||
              v.country?.toLowerCase().includes(liveSearch.toLowerCase())
            : true
    );
    const topReferrers   = data?.referrers          || [];
    const topCountries   = data?.countries          || [];
    const topPages       = data?.top_pages          || [];
    const availRef       = data?.available_referrers || [];
    const availCountry   = data?.available_countries || [];

    const maxRef     = topReferrers[0]?.count   || 1;
    const maxCountry = topCountries[0]?.count   || 1;
    const maxPage    = topPages[0]?.hits         || 1;

    const SECTION_TABS = [
        { key: 'overview',   label: 'ওভারভিউ',   icon: BarChart2 },
        { key: 'live',       label: `লাইভ (${summary.online_count ?? 0})`, icon: Wifi },
        { key: 'referrers',  label: 'রেফারার',   icon: Compass },
        { key: 'countries',  label: 'কান্ট্রি',  icon: Globe },
        { key: 'pages',      label: 'পেজ',        icon: Monitor },
    ];

    const hasActiveFilter = country || referrer || range !== '30';

    return (
        <div className="space-y-5">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-500" />
                        ভিজিটর স্ট্যাটিস্টিক্স
                    </h2>
                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                        সাইটের ট্র্যাফিক বিশ্লেষণ করুন, লাইভ ভিজিটর দেখুন এবং ফিল্টার করুন।
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Range Quick Pills */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto no-scrollbar">
                        {RANGES.filter(r => r.key !== 'custom').map(r => (
                            <button
                                key={r.key}
                                onClick={() => { setRange(r.key); setTimeout(() => fetchData({ range: r.key }), 0); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    range === r.key && !showFilter
                                        ? 'bg-white text-emerald-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Advanced Filter Toggle */}
                    <button
                        onClick={() => setShowFilter(p => !p)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            hasActiveFilter
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
                        }`}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        ফিল্টার
                        {hasActiveFilter && <span className="h-1.5 w-1.5 bg-white rounded-full" />}
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={() => fetchData()}
                        disabled={loading}
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ── Advanced Filter Panel ── */}
            {showFilter && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-emerald-500" /> অ্যাডভান্স ফিল্টার
                        </h3>
                        <button onClick={() => setShowFilter(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Date Range Preset */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">তারিখ রেঞ্জ</label>
                            <select
                                value={range}
                                onChange={e => setRange(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-700 cursor-pointer"
                            >
                                {RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                            </select>
                        </div>

                        {/* Custom Date From */}
                        {range === 'custom' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">শুরুর তারিখ</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    max={dateTo || undefined}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-700"
                                />
                            </div>
                        )}
                        {range === 'custom' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">শেষের তারিখ</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    min={dateFrom || undefined}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-700"
                                />
                            </div>
                        )}

                        {/* Country Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">দেশ ফিল্টার</label>
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-700 cursor-pointer"
                            >
                                <option value="">সব দেশ</option>
                                {availCountry.map(c => (
                                    <option key={c} value={c}>{getCountryName(c)} ({c})</option>
                                ))}
                            </select>
                        </div>

                        {/* Referrer Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">রেফারার ফিল্টার</label>
                            <select
                                value={referrer}
                                onChange={e => setReferrer(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-700 cursor-pointer"
                            >
                                <option value="">সব রেফারার</option>
                                {availRef.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={applyFilters}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                        >
                            ফিল্টার প্রয়োগ করুন
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                        >
                            রিসেট করুন
                        </button>
                        {(data?.filters?.date_from && data?.filters?.date_to) && (
                            <span className="text-xs text-gray-400 ml-auto">
                                {data.filters.date_from} — {data.filters.date_to}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">{error}</div>
            )}

            {/* ── Summary Cards ── */}
            {loading && !data ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <StatCard
                        label="পেজভিউ (রেঞ্জ)"
                        value={summary.range_pageviews ?? 0}
                        growth={summary.pv_growth}
                        icon={Eye}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                        sub={`মোট: ${(summary.total_pageviews ?? 0).toLocaleString()}`}
                    />
                    <StatCard
                        label="ইউনিক ভিজিটর"
                        value={summary.range_uniques ?? 0}
                        growth={summary.unq_growth}
                        icon={Users}
                        iconBg="bg-indigo-50"
                        iconColor="text-indigo-600"
                        sub={`মোট: ${(summary.total_uniques ?? 0).toLocaleString()}`}
                    />
                    <StatCard
                        label="বাউন্স রেট"
                        value={`${summary.bounce_rate ?? 0}%`}
                        icon={Activity}
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                        sub="পেজভিউ - ইউনিক"
                        tooltip="নিম্ন মান = বেশি engagement"
                    />
                    <StatCard
                        label="লাইভ অনলাইন"
                        value={summary.online_count ?? 0}
                        icon={Wifi}
                        iconBg="bg-rose-50"
                        iconColor="text-rose-600"
                        sub={`গড় পেজ/ভিজিট: ${summary.avg_pages_per_session ?? 0}`}
                    />
                </div>
            )}

            {/* ── Section Tabs ── */}
            <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 overflow-x-auto no-scrollbar">
                {SECTION_TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setSection(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                                section === tab.key
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── SECTION: Overview ── */}
            {section === 'overview' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" />
                                দৈনিক ট্র্যাফিক ট্রেন্ড
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {data?.filters?.date_from || '—'} থেকে {data?.filters?.date_to || '—'} পর্যন্ত
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-emerald-600">
                                <span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" /> পেজভিউ
                            </span>
                            <span className="flex items-center gap-1.5 text-indigo-600">
                                <span className="w-3 h-1.5 rounded-full bg-indigo-500 inline-block" /> ইউনিক
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
                    ) : (
                        <DualLineChart dailyData={daily} height={220} />
                    )}

                    {/* Daily table */}
                    {!loading && Object.keys(daily).length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase tracking-wider">তারিখ</th>
                                        <th className="text-right px-3 py-2 font-bold text-gray-500 uppercase tracking-wider">পেজভিউ</th>
                                        <th className="text-right px-3 py-2 font-bold text-gray-500 uppercase tracking-wider">ইউনিক</th>
                                        <th className="text-right px-3 py-2 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">রেশিও</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {Object.entries(daily).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 15).map(([date, vals]) => (
                                        <tr key={date} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2 font-semibold text-gray-700">{date}</td>
                                            <td className="px-3 py-2 text-right text-gray-900 font-bold">{(vals.pageviews || 0).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-indigo-600 font-semibold">{(vals.uniques || 0).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-gray-400 hidden sm:table-cell">
                                                {vals.uniques > 0 ? `${(vals.pageviews / vals.uniques).toFixed(1)}x` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── SECTION: Live Users ── */}
            {section === 'live' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            লাইভ অ্যাক্টিভ ভিজিটর ({liveList.length} জন)
                            <span className="text-xs font-normal text-gray-400 ml-1">· প্রতি ৩০ সেকেন্ড আপডেট</span>
                        </h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="নাম, URL বা দেশ খুঁজুন..."
                                value={liveSearch}
                                onChange={e => setLiveSearch(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 pl-8 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-700 w-full sm:w-52"
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        </div>
                    </div>

                    {liveList.length === 0 ? (
                        <div className="py-16 text-center text-sm text-gray-400">
                            {loading ? 'লোড হচ্ছে...' : 'বর্তমানে কোনো অ্যাক্টিভ ভিজিটর নেই।'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="py-3 px-4">ব্যবহারকারী / IP</th>
                                        <th className="py-3 px-4 hidden sm:table-cell">দেশ</th>
                                        <th className="py-3 px-4">পেজ URL</th>
                                        <th className="py-3 px-4 hidden md:table-cell">রেফারার</th>
                                        <th className="py-3 px-4 text-right">শেষ সক্রিয়</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {liveList.map((v, idx) => {
                                        const sec = v.seconds_ago ?? 0;
                                        const timeStr = sec < 60 ? 'এইমাত্র' : `${Math.floor(sec / 60)} মিনিট আগে`;
                                        return (
                                            <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="py-3 px-4">
                                                    <p className="font-semibold text-gray-800">{v.user_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono">{v.ip}</p>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 font-medium hidden sm:table-cell">
                                                    {getCountryName(v.country)}
                                                </td>
                                                <td className="py-3 px-4 max-w-[180px] truncate">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded-md font-mono text-[10px] text-slate-700">
                                                        {v.url}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-400 truncate max-w-[120px] hidden md:table-cell">{v.referrer}</td>
                                                <td className="py-3 px-4 text-right text-gray-500 font-medium">
                                                    <span className="flex items-center justify-end gap-1">
                                                        <Clock className="h-3 w-3 text-gray-400" /> {timeStr}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── SECTION: Referrers ── */}
            {section === 'referrers' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-5">
                        <Compass className="h-4 w-4 text-blue-500" />
                        টপ রেফারার সোর্স ({topReferrers.length}টি)
                    </h3>
                    {loading ? (
                        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                    ) : topReferrers.length === 0 ? (
                        <p className="text-sm text-gray-400 py-10 text-center">কোনো রেফারার তথ্য নেই।</p>
                    ) : (
                        <div className="space-y-3">
                            {topReferrers.map((ref, i) => (
                                <BarRow
                                    key={i}
                                    label={ref.name}
                                    value={ref.count}
                                    maxValue={maxRef}
                                    color={ref.name === 'Direct' ? 'bg-gray-400' : 'bg-blue-500'}
                                    suffix=" hits"
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── SECTION: Countries ── */}
            {section === 'countries' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-5">
                        <Globe className="h-4 w-4 text-purple-500" />
                        টপ কান্ট্রি ({topCountries.length}টি)
                    </h3>
                    {loading ? (
                        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                    ) : topCountries.length === 0 ? (
                        <p className="text-sm text-gray-400 py-10 text-center">কোনো দেশের তথ্য নেই।</p>
                    ) : (
                        <div className="space-y-3">
                            {topCountries.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs">
                                    <span className="w-36 md:w-44 truncate text-gray-600 font-medium shrink-0">{getCountryName(c.code)}</span>
                                    <div className="flex-grow bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-2 rounded-full bg-purple-500 transition-all duration-500"
                                            style={{ width: `${Math.max(2, c.percent)}%` }}
                                        />
                                    </div>
                                    <span className="shrink-0 font-bold text-gray-700 w-20 text-right">
                                        {c.count.toLocaleString()} ({c.percent}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── SECTION: Top Pages ── */}
            {section === 'pages' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-orange-500" />
                            টপ ভিজিটেড পেজ
                        </h3>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                            <Info className="h-3 w-3" /> লাইভ ক্যাশ থেকে
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">সক্রিয় ভিজিটরদের বর্তমান পেজ অবস্থানের উপর ভিত্তি করে।</p>

                    {loading ? (
                        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                    ) : topPages.length === 0 ? (
                        <p className="text-sm text-gray-400 py-10 text-center">বর্তমানে কোনো সক্রিয় পেজ ডেটা নেই।</p>
                    ) : (
                        <div className="space-y-3">
                            {topPages.map((p, i) => (
                                <BarRow
                                    key={i}
                                    label={p.url}
                                    value={p.hits}
                                    maxValue={maxPage}
                                    color="bg-orange-500"
                                    suffix=" জন"
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}

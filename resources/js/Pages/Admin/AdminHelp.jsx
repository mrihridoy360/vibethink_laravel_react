import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    HelpCircle, BookOpen, Users, Wallet, Wrench, ChevronDown, ChevronUp,
    Phone, Mail, MessageSquare, Monitor, Shield, CheckCircle, Clock,
    Server, Cpu, Database, Send, AlertTriangle, Key, Layers, HardDrive,
    RefreshCw, Loader2
} from 'lucide-react';

export default function AdminHelp() {
    const [systemInfo, setSystemInfo] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [activeFaq, setActiveFaq] = useState(null);
    const [activeGuideTab, setActiveGuideTab] = useState('courses');

    const fetchSystemInfo = async () => {
        setLoadingInfo(true);
        try {
            const { data } = await axios.get('/api/admin/system-info');
            if (data.success) {
                setSystemInfo(data.info);
            }
        } catch (err) {
            console.error('System info fetch failed:', err);
        } finally {
            setLoadingInfo(false);
        }
    };

    useEffect(() => {
        fetchSystemInfo();
    }, []);

    const faqs = [
        {
            q: 'কিভাবে একটি নতুন কোর্স তৈরি করব এবং শিক্ষার্থীদের অ্যাক্সেস দেব?',
            a: 'বাম পাশের মেনু থেকে "কোর্সসমূহ" লিংকে যান, এরপর "নতুন কোর্স" বাটনে ক্লিক করুন। কোর্সের তথ্য, কভার ফটো ইত্যাদি আপলোড করে কোর্সটি সেভ করুন। এরপর কারিকুলাম বিল্ডার থেকে চ্যাপ্টার ও লেসন যুক্ত করুন। সবশেষে কোর্সটি "পাবলিশ" করলেই শিক্ষার্থীরা সেটি দেখতে ও কিনতে পারবে।'
        },
        {
            q: 'কিভাবে শিক্ষার্থীদের ম্যানুয়ালি কোর্সে এনরোল বা যুক্ত করব?',
            a: 'বাম পাশের "এনরোলমেন্ট" মেনুতে গিয়ে "ম্যানুয়াল এনরোলমেন্ট" সেকশনে ক্লিক করুন। শিক্ষার্থীর ইমেইল এবং যে কোর্সে যুক্ত করতে চান তা সিলেক্ট করে সাবমিট করুন। শিক্ষার্থী কোনো প্রকার পেমেন্ট ছাড়াই সরাসরি কোর্সটিতে অ্যাক্সেস পেয়ে যাবে।'
        },
        {
            q: 'পেমেন্ট গেটওয়ে কিভাবে কনফিগার করব?',
            a: 'বাম পাশের "গেটওয়ে" মেনুতে গিয়ে আপনার পেমেন্ট প্রোভাইডারের (যেমন: UddoktaPay, SSLCommerz) API ক্রেডেন্সিয়ালসমূহ (API Key, Store ID, Client Secret ইত্যাদি) দিন এবং স্ট্যাটাস Active করুন। ক্রেডেন্সিয়াল সঠিক হলে পেমেন্ট গেটওয়ে কাজ শুরু করবে।'
        },
        {
            q: 'ইমেইল টেমপ্লেটের লেখা বা ডিজাইন কিভাবে পরিবর্তন করব?',
            a: 'বাম পাশের "ইমেইল টেমপ্লেট" মেনুতে যান। যে টেমপ্লেটটি এডিট করতে চান তার পাশে "এডিট" এ ক্লিক করুন। সেখানে আপনি সাবজেক্ট ও এইচটিএমএল বডি লাইভ প্রিভিউ সহ দেখতে ও পরিবর্তন করতে পারবেন। নিচে ভেরিয়েবলসমূহ দেয়া আছে যা ক্লিক করলেই কোডে বসে যাবে।'
        },
        {
            q: 'কোড বা সিস্টেমে কোনো সমস্যা দেখা দিলে কি করব?',
            a: 'সিস্টেমে কোনো সমস্যা হলে বা কোনো এরর দেখা দিলে তা স্বয়ংক্রিয়ভাবে ডাটাবেইজে লিপিবদ্ধ হয়। বাম পাশের "এরর লগ" অপশনে গিয়ে আপনি সাম্প্রতিক এরর ও সেগুলোর স্ট্যাক ট্রেস দেখতে পারবেন, যা টেকনিক্যাল সাপোর্ট টিমকে সমস্যা সমাধানে সাহায্য করবে।'
        }
    ];

    const guides = {
        courses: {
            title: 'কোর্স ও কারিকুলাম ডিরেক্টরি',
            icon: BookOpen,
            color: 'text-blue-500 bg-blue-50',
            steps: [
                'কোর্সের বেসিক ক্যাটাগরি সেট করতে প্রথমে "ক্যাটাগরি" মেনু থেকে ক্যাটাগরি বানিয়ে নিন।',
                '"কোর্সসমূহ" লিংকে গিয়ে কোর্সের প্রাইস, ডিসকাউন্ট, ডেসক্রিপশন এবং কভার ফটো আপলোড করে ড্রাফট হিসেবে সেভ করুন।',
                'কোর্সের এডিট পেজ থেকে কারিকুলাম সেকশনে গিয়ে চ্যাপ্টার তৈরি করুন এবং প্রতিটি চ্যাপ্টারে লেসন (ভিডিও লিংক, ফাইল যুক্ত করা) অ্যাড করুন।',
                'সবশেষে, কোর্সের স্ট্যাটাস "পাবলিশ" করুন যাতে এটি হোমপেজে এবং অল কোর্সেস পেজে প্রদর্শিত হয়।'
            ]
        },
        students: {
            title: 'শিক্ষার্থী ও পেমেন্ট ট্র্যাকিং',
            icon: Users,
            color: 'text-emerald-500 bg-emerald-50',
            steps: [
                'কোনো শিক্ষার্থী নতুন একাউন্ট খুললে "ব্যবহারকারী" অপশনে গিয়ে তার নাম ও ইমেইল তালিকা দেখতে পাবেন।',
                'শিক্ষার্থী যদি পেমেন্ট গেটওয়ের মাধ্যমে কোর্স কেনে তবে তা স্বয়ংক্রিয়ভাবে এনরোল হয়ে যাবে এবং একটি পেমেন্ট রিসিট তৈরি হবে।',
                'অটোমেটেড পেমেন্টগুলোর তালিকা আপনি "পেমেন্ট" ট্রানজেকশন ট্যাবে ট্র্যাক করতে পারবেন।',
                'কোনো ট্রানজেকশনে সমস্যা হলে বা ম্যানুয়ালি যাচাই করতে চাইলে ট্রানজেকশন আইডি দিয়ে সার্চ করুন।'
            ]
        },
        referrals: {
            title: 'অ্যাফিলিয়েট ও রেফারেল সেটআপ',
            icon: Wallet,
            color: 'text-amber-500 bg-amber-50',
            steps: [
                'শিক্ষার্থীদের রেফারেল অপশন দিতে চাইলে বাম মেনুর "রেফারেল" অপশনে গিয়ে রেফারেলে জয়েন সেটিংস কনফিগার করুন।',
                'রেফারেল কমিশন পার্সেন্টেজ নির্ধারণ করুন (যেমন: প্রতি কোর্স বিক্রিতে ১০% কমিশন)।',
                'কোনো শিক্ষার্থী অন্য কাওকে রেফার করলে এবং সে কোর্স কিনলে রেফারার শিক্ষার্থীর ওয়ালেটে কমিশন জমা হবে।',
                'শিক্ষার্থীরা তাদের ওয়ালেটের ব্যালেন্স ড্যাশবোর্ডে দেখতে পারবে এবং পেমেন্ট উইথড্র রিকোয়েস্ট করতে পারবে।'
            ]
        }
    };

    return (
        <div className="space-y-6">
            {/* Upper Info Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                                <HelpCircle className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">সাহায্য ও গাইড সেন্টার</h3>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">ড্যাশবোর্ড ব্যবহারের নিয়ম, প্রশ্নাবলী এবং সিস্টেম কনফিগারেশন গাইডলাইন এখানে পাবেন।</p>
                    </div>
                </div>
            </div>

            {/* Split layout: System info & User guides */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Guides Directory */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Guide Tab Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                            <h3 className="text-sm font-bold text-slate-800">অ্যাডমিন গাইডলাইন ডিরেক্টরি</h3>
                        </div>
                        <div className="p-6">
                            {/* Guide Tabs */}
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
                                {Object.entries(guides).map(([key, g]) => {
                                    const Icon = g.icon;
                                    const active = activeGuideTab === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setActiveGuideTab(key)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none bg-transparent ${
                                                active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {g.title.split(' ')[0]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Guide Content */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2.5 rounded-xl ${guides[activeGuideTab].color}`}>
                                        {React.createElement(guides[activeGuideTab].icon, { className: "w-5 h-5" })}
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm">{guides[activeGuideTab].title}</h4>
                                </div>
                                <div className="space-y-3 pl-1">
                                    {guides[activeGuideTab].steps.map((step, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{idx + 1}</span>
                                            <p className="text-xs text-slate-600 leading-relaxed font-semibold">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                            <h3 className="text-sm font-bold text-slate-800">সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</h3>
                        </div>
                        <div className="p-6 divide-y divide-slate-100">
                            {faqs.map((faq, index) => {
                                const isOpen = activeFaq === index;
                                return (
                                    <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                                        <button
                                            onClick={() => setActiveFaq(isOpen ? null : index)}
                                            className="w-full flex items-center justify-between text-left font-bold text-slate-700 hover:text-blue-600 text-xs transition-colors cursor-pointer border-none bg-transparent"
                                        >
                                            <span>{faq.q}</span>
                                            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
                                        </button>
                                        {isOpen && (
                                            <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed mt-2.5 pl-1.5 border-l-2 border-slate-200">
                                                {faq.a}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* System Stats & Environment info */}
                <div className="space-y-6">
                    {/* Server Info Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800">সিস্টেম কনফিগারেশন</h3>
                            <button
                                onClick={fetchSystemInfo}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-450 transition-colors border-none bg-transparent cursor-pointer"
                                title="রিফ্রেশ করুন"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {loadingInfo ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                    <p className="text-xs text-slate-400">কনফিগারেশন লোড হচ্ছে...</p>
                                </div>
                            ) : systemInfo ? (
                                <div className="space-y-3 text-xs font-semibold text-slate-600">
                                    <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                                        <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-slate-450" /> পিএইচপি ভার্সন:</span>
                                        <span className="font-mono text-slate-800">{systemInfo.php_version}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                                        <span className="flex items-center gap-2"><Server className="w-4 h-4 text-slate-450" /> লারাভেল ভার্সন:</span>
                                        <span className="font-mono text-slate-800">{systemInfo.laravel_version}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                                        <span className="flex items-center gap-2"><Database className="w-4 h-4 text-slate-450" /> ডাটাবেইজ কানেকশন:</span>
                                        <span className="font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded uppercase">{systemInfo.db_driver}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                                        <span className="flex items-center gap-2"><Send className="w-4 h-4 text-slate-450" /> মেইল সার্ভিস:</span>
                                        <span className="font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded uppercase">{systemInfo.mail_mailer}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                                        <span className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-slate-450" /> ক্যাশ মেমোরি:</span>
                                        <span className="font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded uppercase">{systemInfo.cache_driver}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                                        <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-slate-450" /> এনভায়রনমেন্ট (Env):</span>
                                        <span className="font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded uppercase">{systemInfo.app_env}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-slate-450" /> ডিবাগ মোড:</span>
                                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${systemInfo.debug_mode === 'ON' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-500'}`}>
                                            {systemInfo.debug_mode}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400">লোডিং ব্যর্থ হয়েছে।</div>
                            )}
                        </div>
                    </div>

                    {/* Developer Support Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                        <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Monitor className="w-4 h-4 text-blue-500" /> ডেভলপার সাপোর্ট টিম
                        </span>
                        <p className="text-[11px] font-semibold text-slate-400 leading-normal">সিস্টেম ক্র্যাশ, কাস্টম মডিউল ইন্টিগ্রেশন বা সার্ভার ম্যানেজমেন্ট সংক্রান্ত যেকোনো জটিলতায় সরাসরি সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>
                        <div className="space-y-2.5 text-xs font-bold text-slate-500">
                            <a href="mailto:support@vibethink.com" className="flex items-center gap-2.5 hover:text-blue-600 transition-colors w-fit">
                                <Mail className="w-4 h-4 text-slate-400" /> support@vibethink.com
                            </a>
                            <a href="tel:+8801700000000" className="flex items-center gap-2.5 hover:text-blue-600 transition-colors w-fit">
                                <Phone className="w-4 h-4 text-slate-400" /> +৮৮০১৭০০০০০০০০
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

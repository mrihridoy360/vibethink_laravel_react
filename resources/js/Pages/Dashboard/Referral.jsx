import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Copy, Check, Share2, TrendingUp, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../Contexts/AuthContext';

const statusConfig = {
    pending:   { label: 'অপেক্ষমাণ', color: 'bg-yellow-100 text-yellow-700' },
    approved:  { label: 'অনুমোদিত', color: 'bg-green-100 text-green-700' },
    rejected:  { label: 'প্রত্যাখ্যাত', color: 'bg-red-100 text-red-700' },
    suspended: { label: 'স্থগিত', color: 'bg-gray-100 text-gray-600' },
};

export default function Referral() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('/api/referral');
                if (res.data.success) setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleCopy = () => {
        const code = data?.referral_code || user?.referred_by || '';
        if (!code) return;
        navigator.clipboard.writeText(`${window.location.origin}?ref=${code}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map(n => <div key={n} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    const referralUser = data?.referral_user;
    const settings = data?.settings;
    const commissions = data?.commissions || [];
    const referredUsers = data?.referred_users || [];
    const referralCode = data?.referral_code;

    const totalEarned = commissions
        .filter(c => c.status === 'credited')
        .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

    const pendingEarned = commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-base font-bold text-gray-900">রেফারেল প্রোগ্রাম</h2>
                <p className="text-xs text-gray-400 mt-0.5">বন্ধুদের রেফার করুন এবং কমিশন আয় করুন!</p>
            </div>

            {/* Status banner */}
            {referralUser && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                    referralUser.status === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : referralUser.status === 'pending'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200'
                }`}>
                    {referralUser.status === 'approved' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    ) : referralUser.status === 'pending' ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                    )}
                    <div>
                        <p className="text-xs font-bold text-gray-800">
                            রেফারেল অ্যাকাউন্ট: {statusConfig[referralUser.status]?.label}
                        </p>
                        {referralUser.rejection_reason && (
                            <p className="text-[10px] text-red-600 mt-0.5">{referralUser.rejection_reason}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Referral Code Card */}
            {referralCode ? (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                            <Share2 className="h-4 w-4 text-blue-200" />
                            <p className="text-xs text-blue-200 font-medium">আপনার রেফারেল কোড</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <code className="text-2xl font-extrabold tracking-widest bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                                {referralCode}
                            </code>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 bg-white text-blue-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-md"
                            >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
                            </button>
                        </div>
                        {settings && (
                            <p className="text-xs text-blue-200 mt-3">
                                কমিশন রেট: <strong className="text-white">{settings.commission_percentage}%</strong>
                                {parseFloat(settings.minimum_payout) > 0 && (
                                    <> • সর্বনিম্ন পেমেন্ট: <strong className="text-white">৳{settings.minimum_payout}</strong></>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-600">রেফারেল কোড পাওয়া যায়নি</p>
                    <p className="text-xs text-gray-400 mt-1">অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-xl font-extrabold text-gray-900">{referredUsers.length}</p>
                    <p className="text-[10px] text-gray-400">রেফার করা</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-2" />
                    <p className="text-xl font-extrabold text-gray-900">৳{totalEarned.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400">মোট আয়</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
                    <p className="text-xl font-extrabold text-gray-900">৳{pendingEarned.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400">অপেক্ষমাণ</p>
                </div>
            </div>

            {/* Commission History */}
            {commissions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">কমিশন ইতিহাস</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {commissions.map(commission => (
                            <div key={commission.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-semibold text-gray-900">{commission.referred?.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{commission.course?.title}</p>
                                    <p className="text-[10px] text-gray-300">{new Date(commission.created_at).toLocaleDateString('bn-BD')}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-extrabold text-green-600">+৳{parseFloat(commission.commission_amount).toFixed(2)}</p>
                                    <p className="text-[9px] text-gray-400">{commission.commission_percentage}% কমিশন</p>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                        commission.status === 'credited' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {commission.status === 'credited' ? 'জমা' : 'অপেক্ষমাণ'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Referred Users */}
            {referredUsers.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">রেফার করা সদস্যরা</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {referredUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-semibold text-gray-900">{u.name}</p>
                                    <p className="text-[10px] text-gray-400">{u.email}</p>
                                </div>
                                <p className="text-[10px] text-gray-300 shrink-0">
                                    {new Date(u.created_at).toLocaleDateString('bn-BD')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

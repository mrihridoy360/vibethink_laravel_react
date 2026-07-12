import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';

export default function Wallet() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('/api/wallet');
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
            <div className="space-y-4">
                <div className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    const wallet = data?.wallet || { balance: 0, total_earned: 0, total_withdrawn: 0, total_spent: 0 };
    const transactions = data?.transactions || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-base font-bold text-gray-900">ওয়ালেট</h2>
                <p className="text-sm text-gray-400 mt-0.5">আপনার ব্যালেন্স ও লেনদেনের ইতিহাস</p>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <WalletIcon className="h-5 w-5 text-indigo-200" />
                        <span className="text-sm text-indigo-200 font-medium">বর্তমান ব্যালেন্স</span>
                    </div>
                    <p className="text-4xl font-extrabold tracking-tight">
                        ৳{parseFloat(wallet.balance).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <div className="inline-flex p-2 bg-green-100 rounded-xl mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900">৳{parseFloat(wallet.total_earned).toFixed(2)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">মোট আয়</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <div className="inline-flex p-2 bg-blue-100 rounded-xl mb-2">
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900">৳{parseFloat(wallet.total_withdrawn).toFixed(2)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">উত্তোলন</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <div className="inline-flex p-2 bg-red-100 rounded-xl mb-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900">৳{parseFloat(wallet.total_spent).toFixed(2)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">মোট খরচ</p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                    <History className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">লেনদেনের ইতিহাস</h3>
                </div>

                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <WalletIcon className="h-10 w-10 text-gray-200 mb-3" />
                        <p className="text-sm font-bold text-gray-500">কোনো লেনদেন নেই</p>
                        <p className="text-sm text-gray-400 mt-1">কোর্স কিনলে বা রেফারেল কমিশন পেলে এখানে দেখাবে।</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                {/* Icon */}
                                <div className={`p-2 rounded-xl shrink-0 ${
                                    tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                                }`}>
                                    {tx.type === 'credit'
                                        ? <ArrowDownRight className="h-4 w-4" />
                                        : <ArrowUpRight className="h-4 w-4" />
                                    }
                                </div>

                                {/* Description */}
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{tx.description}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {new Date(tx.created_at).toLocaleDateString('bn-BD', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right shrink-0">
                                    <p className={`text-sm font-extrabold ${
                                        tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                        {tx.type === 'credit' ? '+' : '-'}৳{parseFloat(tx.amount).toFixed(2)}
                                    </p>
                                    <p className="text-[11px] text-gray-300">ব্যালেন্স: ৳{parseFloat(tx.balance_after).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

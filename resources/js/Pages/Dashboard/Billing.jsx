import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, BookOpen, CheckCircle2, Clock, XCircle, Receipt, RefreshCw } from 'lucide-react';

const statusConfig = {
    completed: { label: 'সম্পন্ন', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    pending:   { label: 'অপেক্ষমাণ', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    failed:    { label: 'ব্যর্থ', color: 'bg-red-100 text-red-700', icon: XCircle },
    refunded:  { label: 'ফেরত', color: 'bg-purple-100 text-purple-700', icon: RefreshCw },
};

export default function Billing() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('/api/billing');
                if (res.data.success) setPayments(res.data.payments || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const totalSpent = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(n => <div key={n} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-gray-900">বিলিং ও পেমেন্ট</h2>
                    <p className="text-xs text-gray-400 mt-0.5">মোট {payments.length}টি লেনদেন</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-center">
                    <p className="text-[10px] text-gray-400 font-medium">মোট খরচ</p>
                    <p className="text-lg font-extrabold text-blue-600">৳{totalSpent.toFixed(2)}</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(statusConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const count = payments.filter(p => p.status === key).length;
                    return (
                        <div key={key} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                            <div className={`inline-flex p-1.5 rounded-lg mb-1.5 ${cfg.color}`}>
                                <Icon className="h-3.5 w-3.5" />
                            </div>
                            <p className="text-lg font-extrabold text-gray-900">{count}</p>
                            <p className="text-[10px] text-gray-400">{cfg.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Payment List */}
            {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Receipt className="h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-sm font-bold text-gray-500">কোনো পেমেন্ট ইতিহাস নেই</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-blue-500" />
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">পেমেন্ট ইতিহাস</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {payments.map(payment => {
                            const cfg = statusConfig[payment.status] || statusConfig.pending;
                            const Icon = cfg.icon;
                            return (
                                <div key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                                    {/* Course thumb */}
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 overflow-hidden shrink-0 flex items-center justify-center">
                                        {payment.course?.thumbnail ? (
                                            <img
                                                src={payment.course.thumbnail.startsWith('http') ? payment.course.thumbnail : `/storage/${payment.course.thumbnail}`}
                                                alt={payment.course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <BookOpen className="h-5 w-5 text-blue-300" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-grow min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                            {payment.course?.title || 'Course'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {payment.payment_method?.toUpperCase()} •{' '}
                                            {new Date(payment.created_at).toLocaleDateString('bn-BD')}
                                        </p>
                                        {payment.transaction_id && (
                                            <p className="text-[9px] text-gray-300 font-mono mt-0.5">
                                                {payment.transaction_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status & Amount */}
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-extrabold text-gray-900">৳{parseFloat(payment.amount).toFixed(2)}</p>
                                        {parseFloat(payment.coupon_discount) > 0 && (
                                            <p className="text-[9px] text-green-600">-৳{parseFloat(payment.coupon_discount).toFixed(2)} ছাড়</p>
                                        )}
                                        <span className={`inline-flex items-center gap-0.5 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.color}`}>
                                            <Icon className="h-2.5 w-2.5" /> {cfg.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

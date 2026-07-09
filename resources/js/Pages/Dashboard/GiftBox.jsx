import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Gift, Clock, AlertCircle } from 'lucide-react';

export default function GiftBox() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/gifts')
            .then(res => {
                if (res.data.success) {
                    setGifts(res.data.gifts);
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
                <div className="p-4 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                    <Gift className="h-7 w-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gifts Management</h2>
                    <p className="text-sm text-gray-400 mt-0.5 font-light">Manage gifts and vouchers for users</p>
                </div>
            </div>

            {/* Gifts List */}
            <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-gray-500" /> All Gifts & Vouchers
                </h3>
                {gifts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gifts.map((gift, index) => (
                            <div 
                                key={gift.id} 
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative transition-all duration-300 hover:shadow-md hover:border-blue-500/10"
                            >
                                {/* overlapping number badge */}
                                <div className="absolute -top-3.5 -right-2 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-extrabold border-2 border-white shadow-sm z-10">
                                    #{index + 1}
                                </div>

                                <h4 className="text-base font-bold text-gray-900 leading-tight mb-3">
                                    {gift.title}
                                </h4>

                                <p className="text-sm text-gray-400 mb-4 flex items-center gap-1.5 font-medium">
                                    <span>🎁</span> {gift.code ? `Code: ${gift.code}` : 'No Code Required'}
                                </p>

                                {/* quote-like description box */}
                                <div className="p-5 bg-gray-50 border-l-4 border-blue-500 rounded-r-xl text-sm text-gray-700 font-medium mb-4 leading-relaxed">
                                    {gift.description}
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                    <span className="flex items-center gap-1 font-medium">
                                        <Clock className="h-4 w-4" />
                                        {formatDate(gift.created_at)}
                                    </span>
                                    <button className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">এই মুহূর্তে কোনো উপহার বা ভাউচার উপলব্ধ নেই।</p>
                    </div>
                )}
            </div>
        </div>
    );
}

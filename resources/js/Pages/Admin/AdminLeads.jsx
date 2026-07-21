import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Trash2, Users, Search, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState('');

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/leads');
            if (response.data.success) {
                setLeads(response.data.leads || []);
            }
        } catch (err) {
            setError('কোর্স লিড লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে এই লিডটি মুছে ফেলতে চান?')) return;
        
        setActionLoadingId(id);
        try {
            const response = await axios.delete(`/api/admin/leads/${id}`);
            if (response.data.success) {
                setLeads(prev => prev.filter(lead => lead.id !== id));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'লিডটি মুছতে সমস্যা হয়েছে।');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleNotify = async (id) => {
        setActionLoadingId(id);
        try {
            const response = await axios.post(`/api/admin/leads/notify/${id}`);
            if (response.data.success) {
                alert('ইমেইল সফলভাবে পাঠানো হয়েছে!');
                setLeads(prev => prev.map(lead => 
                    lead.id === id 
                        ? { ...lead, notified: true, notified_at: new Date().toISOString() } 
                        : lead
                ));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে।');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Filters
    const filteredLeads = leads.filter(lead => {
        const searchLower = search.toLowerCase();
        const nameMatch = lead.name?.toLowerCase().includes(searchLower);
        const emailMatch = lead.email?.toLowerCase().includes(searchLower);
        const courseMatch = lead.course?.title?.toLowerCase().includes(searchLower);
        return nameMatch || emailMatch || courseMatch;
    });

    const totalLeads = leads.length;
    const notifiedLeads = leads.filter(l => l.notified).length;
    const pendingLeads = leads.filter(l => !l.notified).length;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8 select-none p-1">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Total Leads */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>মোট লিড</span>
                        <h2 className="text-3xl font-black text-slate-800">{totalLeads}</h2>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6 stroke-[1.8]" />
                    </div>
                </div>

                {/* Notified Leads */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>ইমেইল পাঠানো হয়েছে</span>
                        <h2 className="text-3xl font-black text-slate-800">{notifiedLeads}</h2>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
                    </div>
                </div>

                {/* Pending Leads */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>নোটিফিকেশন অপেক্ষমাণ</span>
                        <h2 className="text-3xl font-black text-slate-800">{pendingLeads}</h2>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-605 text-amber-600">
                        <AlertCircle className="w-6 h-6 stroke-[1.8]" />
                    </div>
                </div>
            </div>

            {/* Leads Table Container */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                {/* Header Actions */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-black text-slate-850" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>কোর্স আগ্রহীদের তালিকা</h3>
                        <p className="text-xs text-slate-400 font-bold mt-0.5" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>সবচেয়ে নতুন আগ্রহীরা তালিকার উপরে আছেন</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="নাম, ইমেইল বা কোর্স দিয়ে খুঁজুন..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                        <span className="text-sm font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>লিড লোড হচ্ছে...</span>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500 font-bold px-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {error}
                    </div>
                ) : filteredLeads.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs text-slate-650 font-medium">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-450 font-extrabold uppercase tracking-wider text-[10px]" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                <tr>
                                    <th className="px-6 py-4">নাম ও ইমেইল</th>
                                    <th className="px-6 py-4">কোর্স</th>
                                    <th className="px-6 py-4">নিবন্ধনের সময়</th>
                                    <th className="px-6 py-4">স্ট্যাটাস</th>
                                    <th className="px-6 py-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Name and Email */}
                                        <td className="px-6 py-4.5 whitespace-nowrap">
                                            <div className="space-y-0.5">
                                                <div className="font-extrabold text-slate-800 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{lead.name}</div>
                                                <div className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                                                    <Mail className="h-3 w-3 shrink-0" /> {lead.email}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Target Course */}
                                        <td className="px-6 py-4.5">
                                            <div className="font-bold text-slate-700 max-w-xs line-clamp-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                                {lead.course ? lead.course.title : 'Unknown Course'}
                                            </div>
                                        </td>
                                        {/* Registration Time */}
                                        <td className="px-6 py-4.5 whitespace-nowrap text-slate-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                            {formatDate(lead.created_at)}
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4.5 whitespace-nowrap">
                                            {lead.notified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> নোটিফাইড
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide bg-amber-50 text-amber-700 border border-amber-100" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                                    <AlertCircle className="w-3.5 h-3.5" /> অপেক্ষমাণ
                                                </span>
                                            )}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Notify Button */}
                                                {!lead.notified && (
                                                    <button
                                                        onClick={() => handleNotify(lead.id)}
                                                        disabled={actionLoadingId === lead.id}
                                                        title="ম্যানুয়ালি মেইল নোটিফিকেশন পাঠান"
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-none rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                                    >
                                                        {actionLoadingId === lead.id ? (
                                                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4.5 h-4.5" />
                                                        )}
                                                    </button>
                                                )}
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(lead.id)}
                                                    disabled={actionLoadingId === lead.id}
                                                    title="লিড মুছে ফেলুন"
                                                    className="p-2 text-red-500 hover:text-red-650 hover:bg-red-50 border-none rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 text-center text-slate-400 bg-slate-50/20">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-base font-black text-slate-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>কোনো লিড পাওয়া যায়নি</h4>
                        <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>খুঁজে পাওয়া লিডের তালিকা এখানে প্রদর্শিত হবে</p>
                    </div>
                )}
            </div>
        </div>
    );
}

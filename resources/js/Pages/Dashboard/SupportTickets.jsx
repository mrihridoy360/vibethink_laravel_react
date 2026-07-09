import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Ticket, Plus, X, ChevronRight, MessageSquare,
    CheckCircle2, Clock, AlertCircle, XCircle, Send, ArrowLeft
} from 'lucide-react';

const statusConfig = {
    open:        { label: 'খোলা', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
    in_progress: { label: 'প্রক্রিয়াধীন', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    resolved:    { label: 'সমাধান', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    closed:      { label: 'বন্ধ', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

const priorityConfig = {
    low:    { label: 'কম', color: 'text-gray-500' },
    medium: { label: 'মাঝারি', color: 'text-yellow-600' },
    high:   { label: 'উচ্চ', color: 'text-orange-600' },
    urgent: { label: 'জরুরি', color: 'text-red-600' },
};

export default function SupportTickets() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list | create | detail
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketDetail, setTicketDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    // Create form state
    const [form, setForm] = useState({ category_id: '', subject: '', message: '', priority: 'medium' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await axios.get('/api/support-tickets');
            if (res.data.success) setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (ticket) => {
        setSelectedTicket(ticket);
        setView('detail');
        setDetailLoading(true);
        try {
            const res = await axios.get(`/api/support-tickets/${ticket.id}`);
            if (res.data.success) setTicketDetail(res.data.ticket);
        } catch (e) {
            console.error(e);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await axios.post('/api/support-tickets', form);
            if (res.data.success) {
                await fetchTickets();
                setView('list');
                setForm({ category_id: '', subject: '', message: '', priority: 'medium' });
            }
        } catch (e) {
            setError(e.response?.data?.message || 'কিছু একটা সমস্যা হয়েছে।');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            const res = await axios.post(`/api/support-tickets/${ticketDetail.id}/reply`, {
                message: replyText,
            });
            if (res.data.success) {
                setTicketDetail(prev => ({
                    ...prev,
                    replies: [...(prev.replies || []), res.data.reply],
                }));
                setReplyText('');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const tickets = data?.tickets || [];
    const categories = data?.categories || [];

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(n => <div key={n} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    // ── Detail View ──────────────────────────────────────────
    if (view === 'detail') {
        const cfg = statusConfig[ticketDetail?.status] || statusConfig.open;
        const Icon = cfg.icon;
        return (
            <div className="space-y-5">
                <button
                    onClick={() => { setView('list'); setTicketDetail(null); }}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-semibold transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> টিকেট তালিকায় ফিরুন
                </button>

                {detailLoading ? (
                    <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                ) : ticketDetail ? (
                    <>
                        {/* Ticket Info */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{ticketDetail.subject}</h3>
                                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{ticketDetail.ticket_number}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${cfg.color}`}>
                                    <Icon className="h-3 w-3" /> {cfg.label}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-700 leading-relaxed">
                                {ticketDetail.message}
                            </div>
                            <p className="text-[10px] text-gray-300 mt-2">
                                {new Date(ticketDetail.created_at).toLocaleString('bn-BD')}
                            </p>
                        </div>

                        {/* Replies */}
                        <div className="space-y-3">
                            {(ticketDetail.replies || []).map(reply => (
                                <div
                                    key={reply.id}
                                    className={`rounded-2xl p-4 ${
                                        reply.is_admin_reply
                                            ? 'bg-blue-50 border border-blue-100 ml-0 mr-8'
                                            : 'bg-white border border-gray-100 ml-8 mr-0'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                            reply.is_admin_reply ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {reply.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-700">{reply.user?.name}</span>
                                        {reply.is_admin_reply && (
                                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">Admin</span>
                                        )}
                                        <span className="text-[10px] text-gray-300 ml-auto">
                                            {new Date(reply.created_at).toLocaleString('bn-BD')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-700">{reply.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Reply box */}
                        {!['resolved', 'closed'].includes(ticketDetail.status) && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                                <h4 className="text-xs font-bold text-gray-700 mb-2">রিপ্লাই করুন</h4>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    rows={4}
                                    placeholder="আপনার বার্তা লিখুন..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-700 focus:outline-none focus:border-blue-500 resize-none"
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        onClick={handleReply}
                                        disabled={sending || !replyText.trim()}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                                    >
                                        {sending ? (
                                            <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : <Send className="h-3.5 w-3.5" />}
                                        পাঠান
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        );
    }

    // ── Create View ───────────────────────────────────────────
    if (view === 'create') {
        return (
            <div className="space-y-5">
                <button
                    onClick={() => setView('list')}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-semibold transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> ফিরুন
                </button>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-5">নতুন সাপোর্ট টিকেট</h3>
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        {/* Category */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">বিভাগ *</label>
                            <select
                                value={form.category_id}
                                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">বিভাগ নির্বাচন করুন</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">বিষয় *</label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                required
                                placeholder="সমস্যার সংক্ষিপ্ত বিবরণ"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">অগ্রাধিকার</label>
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries(priorityConfig).map(([key, cfg]) => (
                                    <button
                                        type="button"
                                        key={key}
                                        onClick={() => setForm(f => ({ ...f, priority: key }))}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                            form.priority === key
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 bg-gray-50 text-gray-500'
                                        }`}
                                    >
                                        {cfg.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">বার্তা *</label>
                            <textarea
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                required
                                rows={5}
                                placeholder="বিস্তারিত সমস্যার বিবরণ লিখুন..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-700 focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                বাতিল
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                            >
                                {submitting ? (
                                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : <Send className="h-3.5 w-3.5" />}
                                টিকেট পাঠান
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // ── List View ─────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-gray-900">সাপোর্ট টিকেট</h2>
                    <p className="text-xs text-gray-400 mt-0.5">মোট {tickets.length}টি টিকেট</p>
                </div>
                <button
                    onClick={() => setView('create')}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> নতুন টিকেট
                </button>
            </div>

            {/* Ticket List */}
            {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
                    <div className="p-5 bg-gray-50 rounded-full mb-4 border border-gray-100">
                        <Ticket className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-600">কোনো টিকেট নেই</h3>
                    <p className="text-xs text-gray-400 mt-1">সমস্যা হলে নতুন সাপোর্ট টিকেট তৈরি করুন।</p>
                    <button
                        onClick={() => setView('create')}
                        className="mt-4 flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" /> নতুন টিকেট তৈরি করুন
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(ticket => {
                        const cfg = statusConfig[ticket.status] || statusConfig.open;
                        const Icon = cfg.icon;
                        const pCfg = priorityConfig[ticket.priority] || priorityConfig.medium;
                        return (
                            <button
                                key={ticket.id}
                                onClick={() => openDetail(ticket)}
                                className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-blue-500/20 transition-all flex items-center gap-4"
                            >
                                <div className={`p-2 rounded-xl shrink-0 ${cfg.color.split(' ')[0]} bg-opacity-60`}>
                                    <Icon className={`h-4 w-4 ${cfg.color.split(' ')[1]}`} />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-bold text-gray-900 truncate">{ticket.subject}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.color}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] text-gray-400 font-mono">{ticket.ticket_number}</p>
                                        <span className="text-gray-200">•</span>
                                        <span className={`text-[10px] font-semibold ${pCfg.color}`}>{pCfg.label}</span>
                                        {ticket.category && (
                                            <>
                                                <span className="text-gray-200">•</span>
                                                <span className="text-[10px] text-gray-400">{ticket.category.name}</span>
                                            </>
                                        )}
                                        {ticket.replies_count > 0 && (
                                            <>
                                                <span className="text-gray-200">•</span>
                                                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                                    <MessageSquare className="h-2.5 w-2.5" /> {ticket.replies_count}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-300 mt-0.5">
                                        {new Date(ticket.created_at).toLocaleDateString('bn-BD')}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

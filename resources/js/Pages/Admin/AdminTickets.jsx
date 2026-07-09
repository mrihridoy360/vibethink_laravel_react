import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, AlertCircle, Clock, CheckCircle2, XCircle,
    ChevronRight, ArrowLeft, Send, ChevronLeft, ChevronRight as CR
} from 'lucide-react';

const statusCfg = {
    open:        { label: 'খোলা',         color: 'bg-blue-100 text-blue-700',   icon: AlertCircle },
    in_progress: { label: 'প্রক্রিয়াধীন', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    resolved:    { label: 'সমাধান',       color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    closed:      { label: 'বন্ধ',         color: 'bg-gray-100 text-gray-600',   icon: XCircle },
};

const priorityCfg = {
    low:    { label: 'কম',     color: 'text-gray-400' },
    medium: { label: 'মাঝারি', color: 'text-yellow-600' },
    high:   { label: 'উচ্চ',   color: 'text-orange-600' },
    urgent: { label: 'জরুরি',  color: 'text-red-600' },
};

export default function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [meta, setMeta] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    // Detail view
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [replies, setReplies] = useState([]);
    const [replyMsg, setReplyMsg] = useState('');
    const [replying, setReplying] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
            const res = await axios.get(`/api/admin/tickets?${params}`);
            if (res.data.success) {
                setTickets(res.data.tickets.data || []);
                setMeta(res.data.tickets);
                setStats(res.data.stats || {});
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, [search, statusFilter, page]);

    const openDetail = async (ticket) => {
        setSelectedTicket(ticket);
        setDetailLoading(true);
        try {
            const res = await axios.get(`/api/support-tickets/${ticket.id}`);
            if (res.data.success) setReplies(res.data.ticket?.replies || []);
        } catch (e) { console.error(e); }
        finally { setDetailLoading(false); }
    };

    const handleReply = async () => {
        if (!replyMsg.trim()) return;
        setReplying(true);
        try {
            const res = await axios.post(`/api/admin/tickets/${selectedTicket.id}/reply`, { message: replyMsg });
            if (res.data.success) {
                setReplies(prev => [...prev, res.data.reply]);
                setReplyMsg('');
            }
        } catch (e) { console.error(e); }
        finally { setReplying(false); }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            const res = await axios.put(`/api/admin/tickets/${selectedTicket.id}/status`, { status: newStatus });
            if (res.data.success) {
                setSelectedTicket(prev => ({ ...prev, status: newStatus }));
                setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
            }
        } catch (e) { console.error(e); }
        finally { setUpdatingStatus(false); }
    };

    // ── Detail View ──
    if (selectedTicket) {
        const cfg = statusCfg[selectedTicket.status] || statusCfg.open;
        const Icon = cfg.icon;
        return (
            <div className="space-y-5">
                <button onClick={() => setSelectedTicket(null)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-semibold">
                    <ArrowLeft className="h-4 w-4" /> টিকেট তালিকায় ফিরুন
                </button>
 
                {/* Ticket Header */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">{selectedTicket.subject}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs font-mono text-gray-400">{selectedTicket.ticket_number}</span>
                                <span className="text-gray-200">•</span>
                                <span className="text-xs text-gray-500">{selectedTicket.user?.name} ({selectedTicket.user?.email})</span>
                                <span className="text-gray-200">•</span>
                                <span className={`text-xs font-bold ${priorityCfg[selectedTicket.priority]?.color}`}>
                                    {priorityCfg[selectedTicket.priority]?.label}
                                </span>
                            </div>
                        </div>
                        {/* Status selector */}
                        <div className="shrink-0">
                            <select
                                value={selectedTicket.status}
                                onChange={e => handleStatusChange(e.target.value)}
                                disabled={updatingStatus}
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${cfg.color}`}
                            >
                                {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">{selectedTicket.message}</div>
                    <p className="text-xs text-gray-300 mt-2">{new Date(selectedTicket.created_at).toLocaleString('bn-BD')}</p>
                </div>

                {/* Replies */}
                {detailLoading ? <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" /> : (
                    <div className="space-y-3">
                        {replies.map(reply => (
                            <div key={reply.id} className={`rounded-2xl p-4 ${reply.is_admin_reply ? 'bg-blue-50 border border-blue-100 mr-8' : 'bg-white border border-gray-100 ml-8'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${reply.is_admin_reply ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {reply.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">{reply.user?.name}</span>
                                    {reply.is_admin_reply && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">Admin</span>}
                                    <span className="text-xs text-gray-300 ml-auto">{new Date(reply.created_at).toLocaleString('bn-BD')}</span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Admin Reply Box */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5 text-blue-500" /> অ্যাডমিন রিপ্লাই
                    </h4>
                    <textarea value={replyMsg} onChange={e => setReplyMsg(e.target.value)} rows={4}
                        placeholder="রিপ্লাই লিখুন..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-blue-500 resize-none" />
                    <div className="flex justify-end mt-3">
                        <button onClick={handleReply} disabled={replying || !replyMsg.trim()}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                            {replying ? <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            পাঠান
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── List View ──
    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">সাপোর্ট টিকেট</h2>
                    <p className="text-sm text-gray-400 mt-0.5">সব সাপোর্ট টিকেট পরিচালনা করুন</p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700">
                        <option value="">সব স্ট্যাটাস</option>
                        {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <div className="relative">
                        <input type="text" placeholder="বিষয় বা নম্বর..." value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-gray-50 border border-gray-200 text-sm px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-44" />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
                {Object.entries(statusCfg).map(([k, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                        <button key={k} onClick={() => { setStatusFilter(k); setPage(1); }}
                            className={`bg-white rounded-xl border p-3 text-center hover:shadow-sm transition-all ${statusFilter === k ? 'border-blue-500' : 'border-gray-100'}`}>
                            <div className={`inline-flex p-1.5 rounded-lg mb-1 ${cfg.color}`}><Icon className="h-3.5 w-3.5" /></div>
                            <p className="text-lg font-extrabold text-gray-900">{stats[k] ?? 0}</p>
                            <p className="text-xs text-gray-400">{cfg.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* List */}
            {loading ? <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div> : (
                <div className="space-y-2">
                    {tickets.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400 text-xs">কোনো টিকেট পাওয়া যায়নি</div>
                    ) : tickets.map(ticket => {
                        const cfg = statusCfg[ticket.status] || statusCfg.open;
                        const Icon = cfg.icon;
                        const pCfg = priorityCfg[ticket.priority] || priorityCfg.medium;
                        return (
                            <button key={ticket.id} onClick={() => openDetail(ticket)}
                                className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-blue-500/20 transition-all flex items-center gap-4">
                                <div className={`p-2 rounded-xl shrink-0 ${cfg.color}`}><Icon className="h-4 w-4" /></div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-bold text-gray-900 truncate">{ticket.subject}</p>
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${cfg.color}`}>{cfg.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-xs font-mono text-gray-300">{ticket.ticket_number}</span>
                                        <span className="text-gray-200">•</span>
                                        <span className="text-xs text-gray-400">{ticket.user?.name}</span>
                                        <span className="text-gray-200">•</span>
                                        <span className={`text-xs font-semibold ${pCfg.color}`}>{pCfg.label}</span>
                                        {ticket.replies_count > 0 && <><span className="text-gray-200">•</span><span className="text-xs text-gray-400">{ticket.replies_count} রিপ্লাই</span></>}
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                            </button>
                        );
                    })}
                </div>
            )}

            {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">মোট {meta.total}টি • পৃষ্ঠা {meta.current_page}/{meta.last_page}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.current_page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.current_page === meta.last_page} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><CR className="h-3.5 w-3.5" /></button>
                    </div>
                </div>
            )}
        </div>
    );
}

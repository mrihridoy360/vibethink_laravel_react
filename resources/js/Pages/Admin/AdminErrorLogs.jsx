import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, AlertOctagon, ChevronLeft, ChevronRight, Trash2, X,
    Loader2, CheckCircle, AlertCircle, Eye, ShieldAlert, Terminal,
    FileText, User, Calendar, Cpu, Compass, HardDrive, RefreshCcw, Copy, Check
} from 'lucide-react';

// ── Toast Notification ────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast]);
    if (!toast) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
            <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
    );
}

// ── Error Details & Resolution Modal ──────────────────────────────────────────
function LogDetailsModal({ log, onClose, onUpdated }) {
    const [status, setStatus] = useState(log.status);
    const [notes, setNotes]   = useState(log.resolution_notes || '');
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put(`/api/admin/error-logs/${log.id}`, {
                status,
                resolution_notes: notes
            });
            if (res.data.success) {
                onUpdated(res.data.log);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(log.stack_trace || log.message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0 bg-gray-50">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                log.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                log.severity === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                                {log.severity}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">ID: #{log.id}</span>
                        </div>
                        <h2 className="text-base font-bold text-gray-900 mt-1 truncate max-w-2xl" title={log.message}>
                            {log.error_code || 'Error Log Details'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 hover:text-gray-750 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Error Details */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Error Message */}
                        <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl">
                            <h4 className="text-xs font-bold text-red-650 uppercase tracking-wider mb-1">Error Message</h4>
                            <p className="text-sm font-semibold text-gray-800 break-words">{log.message}</p>
                            {log.file && (
                                <p className="text-xs text-gray-500 font-mono mt-2 break-all">
                                    File: {log.file} <span className="text-red-500 font-bold">(Line {log.line})</span>
                                </p>
                            )}
                        </div>

                        {/* Stack Trace */}
                        {log.stack_trace && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <span>Stack Trace</span>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline cursor-pointer font-bold"
                                    >
                                        {copied ? <><Check className="h-3 w-3" /> কপিকৃত</> : <><Copy className="h-3 w-3" /> কপি করুন</>}
                                    </button>
                                </div>
                                <pre className="bg-gray-900 text-green-400 p-4 rounded-2xl text-xs overflow-x-auto max-h-64 font-mono select-text whitespace-pre-wrap break-all shadow-inner">
                                    {log.stack_trace}
                                </pre>
                            </div>
                        )}

                        {/* Request parameters / Headers */}
                        {log.request_data && Object.keys(log.request_data).length > 0 && (
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Request Payload</h4>
                                <pre className="bg-gray-50 border border-gray-150 p-4 rounded-2xl text-xs overflow-x-auto max-h-40 font-mono text-gray-700">
                                    {JSON.stringify(log.request_data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Right: Metadata & Resolution Form */}
                    <div className="space-y-5">
                        {/* URL & Method info */}
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Request Info</h4>
                            {log.url && (
                                <div className="space-y-1 font-mono text-xs">
                                    <span className="text-gray-400">URL:</span>
                                    <p className="text-gray-800 break-all">{log.url}</p>
                                </div>
                            )}
                            <div className="flex gap-4 text-xs">
                                {log.method && (
                                    <div>
                                        <span className="text-gray-400 block">Method:</span>
                                        <span className="font-bold text-blue-600 uppercase">{log.method}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-400 block">Occurrences:</span>
                                    <span className="font-bold text-gray-800">{log.occurrence_count} times</span>
                                </div>
                            </div>
                        </div>

                        {/* Client details */}
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2.5 text-xs">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client Info</h4>
                            <div className="flex items-center gap-2 text-gray-650">
                                <Cpu className="h-3.5 w-3.5 text-gray-400" />
                                <span>OS: {log.os || '—'} / Device: {log.device || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-650">
                                <Compass className="h-3.5 w-3.5 text-gray-400" />
                                <span>Browser: {log.browser || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-650">
                                <HardDrive className="h-3.5 w-3.5 text-gray-400" />
                                <span>IP: {log.ip_address || '—'}</span>
                            </div>
                            {log.user_email && (
                                <div className="flex items-center gap-2 text-gray-650 border-t border-gray-100 pt-2 mt-2">
                                    <User className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="truncate" title={log.user_email}>{log.user_email}</span>
                                </div>
                            )}
                        </div>

                        {/* Resolution Form */}
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">লগ অবস্থা (Status)</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="new">নতুন (New)</option>
                                    <option value="investigating">তদন্ত চলছে (Investigating)</option>
                                    <option value="resolved">সমাধান হয়েছে (Resolved)</option>
                                    <option value="ignored">বাতিল / ইগনোর (Ignored)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">সমাধানের নোট (Resolution Notes)</label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-xs"
                                    placeholder="কীভাবে এররটি সমাধান করা হলো লিখুন..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                                {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> আপডেট হচ্ছে...</> : 'স্ট্যাটাস আপডেট করুন'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Clear Logs Confirm Modal ──────────────────────────────────────────────────
function ClearLogsModal({ onClose, onCleared }) {
    const [clearing, setClearing] = useState(false);

    const handleClear = async () => {
        setClearing(true);
        try {
            const res = await axios.post('/api/admin/error-logs/clear');
            if (res.data.success) {
                onCleared();
            }
        } catch (e) { console.error(e); }
        finally { setClearing(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-650" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">সব এরর লগ মুছে ফেলবেন?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    ডাটাবেজের সমস্ত এরর লগ চিরতরে ডিলিট হয়ে যাবে। এই অ্যাকশনটি রিভার্ট করা যাবে না।
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        বাতিল
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={clearing}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {clearing ? <><Loader2 className="h-4 w-4 animate-spin" /> সাফ হচ্ছে...</> : 'হ্যাঁ, সব মুছুন'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main AdminErrorLogs Component ─────────────────────────────────────────────
export default function AdminErrorLogs() {
    const [logs, setLogs]   = useState([]);
    const [meta, setMeta]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [page, setPage]       = useState(1);

    // Filters
    const [typeFilter, setTypeFilter]         = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [statusFilter, setStatusFilter]     = useState('');

    // Modals
    const [selectedLog, setSelectedLog] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const [toast, setToast]             = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (logs.length === 0) return;
        const allPageIds = logs.map(l => l.id);
        const allSelected = allPageIds.every(id => selectedIds.includes(id));

        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !allPageIds.includes(id)));
        } else {
            setSelectedIds(prev => {
                const newIds = allPageIds.filter(id => !prev.includes(id));
                return [...prev, ...newIds];
            });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`আপনি কি নির্বাচিত ${selectedIds.length}টি এরর লগ মুছে ফেলতে চান?`)) return;

        try {
            const res = await axios.post('/api/admin/error-logs/bulk-delete', { ids: selectedIds });
            if (res.data.success) {
                setLogs(prev => prev.filter(l => !selectedIds.includes(l.id)));
                showToast('নির্বাচিত এরর লগসমূহ মুছে ফেলা হয়েছে।');
                setSelectedIds([]);
                // Refresh list
                fetchLogs();
            }
        } catch (e) {
            console.error(e);
            showToast('বাল্ক ডিলিট ব্যর্থ হয়েছে।', 'error');
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                ...(search && { search }),
                ...(typeFilter && { type: typeFilter }),
                ...(severityFilter && { severity: severityFilter }),
                ...(statusFilter && { status: statusFilter }),
            });
            const res = await axios.get(`/api/admin/error-logs?${params}`);
            if (res.data.success) {
                setLogs(res.data.logs?.data || []);
                setMeta(res.data.logs);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, [search, page, typeFilter, severityFilter, statusFilter]);

    const handleLogUpdated = (updatedLog) => {
        setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
        showToast('এরর লগ সমাধান আপডেট করা হয়েছে।');
        setSelectedLog(null);
    };

    const handleLogsCleared = () => {
        setLogs([]);
        setMeta(null);
        showToast('ডাটাবেজের সব এরর লগ সফলভাবে সাফ করা হয়েছে।');
        setShowClearModal(false);
    };

    const deleteLog = async (id) => {
        if (!confirm('এই এরর লগটি ডিলিট করতে চান?')) return;
        try {
            const res = await axios.delete(`/api/admin/error-logs/${id}`);
            if (res.data.success) {
                setLogs(prev => prev.filter(l => l.id !== id));
                showToast('লগ সফলভাবে মুছে ফেলা হয়েছে।');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-5">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Details Modal */}
            {selectedLog && (
                <LogDetailsModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                    onUpdated={handleLogUpdated}
                />
            )}

            {/* Clear All Modal */}
            {showClearModal && (
                <ClearLogsModal
                    onClose={() => setShowClearModal(false)}
                    onCleared={handleLogsCleared}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">এরর লগ ও সিস্টেম ডায়াগনস্টিকস</h2>
                    <p className="text-sm text-gray-400 mt-0.5">সিস্টেম এরর, ফেটাল ক্র্যাশ এবং বাগ ট্র্যাকিং</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchLogs()}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                        title="রিলোড করুন"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </button>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-red-200"
                        >
                            <Trash2 className="h-4 w-4" /> নির্বাচিত মুছুন ({selectedIds.length})
                        </button>
                    )}
                    {logs.length > 0 && (
                        <button
                            onClick={() => setShowClearModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-650 text-sm font-bold rounded-xl transition-all cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" /> সব লগ সাফ করুন
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-2 items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl text-gray-700 cursor-pointer focus:outline-none"
                    >
                        <option value="">সকল প্রকার (Type)</option>
                        <option value="backend">ব্যাকএন্ড (Backend)</option>
                        <option value="frontend">ফ্রন্টএন্ড (Frontend)</option>
                        <option value="user_report">রিপোর্ট (User Report)</option>
                    </select>

                    {/* Severity Filter */}
                    <select
                        value={severityFilter}
                        onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl text-gray-700 cursor-pointer focus:outline-none"
                    >
                        <option value="">সকল গুরুত্ব (Severity)</option>
                        <option value="low">Low (কম)</option>
                        <option value="medium">Medium (মাঝারি)</option>
                        <option value="high">High (উচ্চ)</option>
                        <option value="critical">Critical (গুরুতর)</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl text-gray-700 cursor-pointer focus:outline-none"
                    >
                        <option value="">সকল অবস্থা (Status)</option>
                        <option value="new">নতুন (New)</option>
                        <option value="investigating">তদন্ত চলছে (Investigating)</option>
                        <option value="resolved">সমাধান হয়েছে (Resolved)</option>
                        <option value="ignored">বাতিল (Ignored)</option>
                    </select>
                </div>

                <div className="relative w-48 mt-2 sm:mt-0">
                    <input
                        type="text"
                        placeholder="মেসেজ বা ফাইল খুঁজুন..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 text-xs px-3.5 pl-8 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 w-full"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-center px-4 py-3 w-12">
                                    <input
                                        type="checkbox"
                                        checked={logs.length > 0 && logs.every(l => selectedIds.includes(l.id))}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                                    />
                                </th>
                                <th className="text-left px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">এরর বার্তা (Error Message)</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">টাইপ / সোর্স</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">গুরুত্ব (Severity)</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অবস্থা (Status)</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">সংঘটন (Count)</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">শেষ সংঘটন সময়</th>
                                <th className="text-center px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        {[1,2,3,4,5,6,7,8].map(j => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertOctagon className="h-8 w-8 text-gray-200" />
                                            <p className="font-semibold text-gray-600">কোনো এরর লগ রেকর্ড পাওয়া যায়নি</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map(l => (
                                    <tr key={l.id} className={`hover:bg-gray-50/70 transition-colors ${selectedIds.includes(l.id) ? 'bg-blue-50/30' : ''}`}>
                                        <td className="px-4 py-3 text-center w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(l.id)}
                                                onChange={() => toggleSelect(l.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                                            />
                                        </td>
                                        {/* Error Message */}
                                        <td className="px-5 py-3 max-w-[280px]">
                                            <div className="min-w-0">
                                                <p className="font-mono text-xs font-bold text-red-650 truncate" title={l.error_code}>{l.error_code || 'Error'}</p>
                                                <p className="text-xs text-gray-700 font-medium truncate mt-0.5" title={l.message}>{l.message}</p>
                                                {l.file && (
                                                    <p className="text-[10px] text-gray-450 font-mono mt-1 truncate" title={l.file}>
                                                        {l.file.split('\\').pop().split('/').pop()}:{l.line}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        {/* Type */}
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                                                {l.type}
                                            </span>
                                        </td>
                                        {/* Severity */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                l.severity === 'critical' ? 'bg-red-50 text-red-600' :
                                                l.severity === 'high' ? 'bg-orange-50 text-orange-600' :
                                                l.severity === 'medium' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {l.severity}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                l.status === 'resolved' ? 'bg-green-50 text-green-700' :
                                                l.status === 'ignored' ? 'bg-gray-100 text-gray-400' :
                                                l.status === 'investigating' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                                {l.status === 'resolved' ? 'সমাধানকৃত' :
                                                 l.status === 'ignored' ? 'বাতিল' :
                                                 l.status === 'investigating' ? 'তদন্তাধীন' : 'নতুন'}
                                            </span>
                                        </td>
                                        {/* Occurrences count */}
                                        <td className="px-4 py-3 text-center text-gray-600 font-bold">
                                            {l.occurrence_count} বার
                                        </td>
                                        {/* Last Occurred At */}
                                        <td className="px-4 py-3 text-center text-gray-450 font-mono text-[10px]">
                                            {l.last_occurred_at ? new Date(l.last_occurred_at).toLocaleString('bn-BD') : '—'}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setSelectedLog(l)}
                                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                                                    title="রিভিউ করুন"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteLog(l.id)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                                    title="মুছে ফেলুন"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            মোট {meta.total}টি লগ • পৃষ্ঠা {meta.current_page}/{meta.last_page}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={meta.current_page === 1}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={meta.current_page === meta.last_page}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

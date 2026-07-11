import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Mail, Edit, Eye, ToggleLeft, ToggleRight, Send, RotateCcw,
    CheckCircle, XCircle, Search, ArrowLeft, Save, Code, Loader2,
    Info, RefreshCw, AlertCircle
} from 'lucide-react';

export default function AdminEmailTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    // Edit/Preview mode state
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [previewHtml, setPreviewHtml] = useState('');
    const [saving, setSaving] = useState(false);

    // Test email state
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/admin/email-templates');
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (err) {
            showToast('error', 'ইমেইল টেমপ্লেট লোড করতে সমস্যা হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Live preview generation in real-time
    useEffect(() => {
        if (!editingTemplate) return;

        let html = body;
        const sampleData = {
            site_name: 'VibeThink',
            site_url: window.location.origin,
            user_name: 'আরিফ রহমান',
            user_email: 'arif@example.com',
            current_year: new Date().getFullYear().toString(),
            login_url: `${window.location.origin}/login`,
            verification_url: `${window.location.origin}/verify-email/sample-token-123`,
            reset_url: `${window.location.origin}/reset-password/sample-token-123`,
            expiry_minutes: '৬০',
            course_name: 'পূর্ণাঙ্গ ওয়েব ডেভেলপমেন্ট কোর্স (MERN Stack)',
            course_url: `${window.location.origin}/courses/complete-web-dev`,
            instructor_name: 'এইচ এম নয়ন',
            amount: '৳৫,০০০',
            payment_method: 'bKash',
            transaction_id: 'BKSH987654321',
            payment_date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
            referred_user: 'সাকিব আল হাসান',
            commission_amount: '৳৫০০',
            total_earnings: '৳২,৫০০',
        };

        Object.entries(sampleData).forEach(([key, value]) => {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        setPreviewHtml(html);
    }, [body, editingTemplate]);

    const handleToggleStatus = async (template) => {
        try {
            const { data } = await axios.post(`/api/admin/email-templates/${template.id}/toggle`);
            if (data.success) {
                setTemplates(prev => prev.map(t => t.id === template.id ? data.template : t));
                showToast('success', data.message);
                if (editingTemplate && editingTemplate.id === template.id) {
                    setIsActive(data.template.is_active);
                }
            }
        } catch (err) {
            showToast('error', 'স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।');
        }
    };

    const handleReset = async (template) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই টেমপ্লেটটি রিসেট করতে চান? আপনার বর্তমান পরিবর্তনগুলি হারিয়ে যাবে।')) {
            return;
        }
        try {
            const { data } = await axios.post(`/api/admin/email-templates/${template.id}/reset`);
            if (data.success) {
                setTemplates(prev => prev.map(t => t.id === template.id ? data.template : t));
                showToast('success', data.message);
                if (editingTemplate && editingTemplate.id === template.id) {
                    setSubject(data.template.subject);
                    setBody(data.template.body);
                }
            }
        } catch (err) {
            showToast('error', 'টেমপ্লেট রিসেট করতে ব্যর্থ হয়েছে।');
        }
    };

    const handleSendTest = async (e) => {
        e.preventDefault();
        if (!testEmail) {
            alert('অনুগ্রহ করে একটি টেস্ট ইমেইল ঠিকানা প্রদান করুন।');
            return;
        }
        const templateId = editingTemplate?.id;
        if (!templateId) return;

        setSendingTest(true);
        try {
            const { data } = await axios.post(`/api/admin/email-templates/${templateId}/test`, {
                email: testEmail
            });
            if (data.success) {
                showToast('success', data.message);
                setTestEmail('');
            }
        } catch (err) {
            showToast('error', err.response?.data?.message || 'টেস্ট ইমেইল পাঠানো ব্যর্থ হয়েছে।');
        } finally {
            setSendingTest(false);
        }
    };

    const startEditing = (template) => {
        setEditingTemplate(template);
        setSubject(template.subject);
        setBody(template.body);
        setIsActive(template.is_active);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await axios.put(`/api/admin/email-templates/${editingTemplate.id}`, {
                subject,
                body,
                is_active: isActive
            });
            if (data.success) {
                setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? data.template : t));
                showToast('success', data.message);
                setEditingTemplate(data.template);
            }
        } catch (err) {
            showToast('error', 'সংরক্ষণ করতে ব্যর্থ হয়েছে।');
        } finally {
            setSaving(false);
        }
    };

    const insertVariable = (variable) => {
        const textarea = document.getElementById('template-body-textarea');
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const before = body.substring(0, start);
            const after = body.substring(end);
            const newText = before + `{{${variable}}}` + after;
            setBody(newText);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
            }, 0);
        }
    };

    const getTemplateIcon = (name) => {
        const icons = {
            'welcome_email': '🎉',
            'email_verification': '✉️',
            'password_reset': '🔐',
            'course_enrollment': '📚',
            'payment_confirmation': '💰',
            'referral_commission': '👥',
        };
        return icons[name] || '📧';
    };

    const getTemplateColor = (name) => {
        const colors = {
            'welcome_email': 'from-indigo-500 to-purple-600',
            'email_verification': 'from-emerald-500 to-teal-600',
            'password_reset': 'from-amber-500 to-orange-600',
            'course_enrollment': 'from-blue-500 to-indigo-600',
            'payment_confirmation': 'from-green-500 to-emerald-600',
            'referral_commission': 'from-violet-500 to-purple-600',
        };
        return colors[name] || 'from-gray-500 to-gray-600';
    };

    const filteredTemplates = templates.filter(template =>
        template.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">ইমেইল টেমপ্লেট লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Toast */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800">ইমেইল টেমপ্লেট</h2>
                    <p className="text-sm text-slate-500 mt-0.5">সিস্টেমের পাঠানো অটোমেটেড ইমেইল টেমপ্লেটগুলো এখান থেকে এডিট করুন।</p>
                </div>
                {toast && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {toast.message}
                    </div>
                )}
            </div>

            {/* List View */}
            {!editingTemplate && (
                <>
                    {/* Search & Stats */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="টেমপ্লেট খুঁজুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-6 text-sm font-bold text-slate-500 bg-white border border-slate-200/80 px-5 py-2.5 rounded-xl shadow-sm">
                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-indigo-500" /> মোট: {templates.length}</span>
                            <span className="h-4 w-[1px] bg-slate-200" />
                            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> সক্রিয়: {templates.filter(t => t.is_active).length}</span>
                        </div>
                    </div>

                    {/* Grid List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredTemplates.map((template) => (
                            <div key={template.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
                                {/* Banner */}
                                <div className={`bg-gradient-to-r ${getTemplateColor(template.name)} px-5 py-4 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl select-none">{getTemplateIcon(template.name)}</span>
                                        <div>
                                            <h3 className="text-base font-bold text-white leading-tight">{template.display_name}</h3>
                                            <p className="text-xs text-white/80 mt-0.5">{template.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleStatus(template)}
                                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
                                        title={template.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                                    >
                                        {template.is_active ? (
                                            <ToggleRight className="w-6 h-6" />
                                        ) : (
                                            <ToggleLeft className="w-6 h-6 opacity-60" />
                                        )}
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="p-5 flex-1 flex flex-col gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">বিষয় (Subject)</span>
                                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{template.subject}</p>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">ব্যবহৃত ভেরিয়েবলসমূহ</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.keys(template.variables || {}).slice(0, 5).map((v) => (
                                                <span key={v} className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                    {`{{${v}}}`}
                                                </span>
                                            ))}
                                            {Object.keys(template.variables || {}).length > 5 && (
                                                <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md">
                                                    +{Object.keys(template.variables).length - 5} আরও
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
                                        <button
                                            onClick={() => startEditing(template)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> এডিট করুন
                                        </button>
                                        <button
                                            onClick={() => handleReset(template)}
                                            className="p-2 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                                            title="ডিফল্ট রিসেট করুন"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
                            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-600">কোনো ইমেইল টেমপ্লেট পাওয়া যায়নি।</p>
                        </div>
                    )}
                </>
            )}

            {/* Edit / Editor view */}
            {editingTemplate && (
                <div className="space-y-4">
                    {/* Editor Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                        <button
                            onClick={() => setEditingTemplate(null)}
                            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors w-fit"
                        >
                            <ArrowLeft className="w-4 h-4" /> তালিকা ফিরে যান
                        </button>
                        <div className="flex items-center gap-2">
                            {/* Is Active Status Switch */}
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-xs font-bold text-slate-600">অবস্থা:</span>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                                <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'text-slate-450'}`}>
                                    {isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </span>
                            </div>
                            <button
                                onClick={() => handleReset(editingTemplate)}
                                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all text-xs font-bold cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> রিসেট
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-xs font-bold transition-all disabled:bg-blue-300 cursor-pointer"
                            >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                সংরক্ষণ করুন
                            </button>
                        </div>
                    </div>

                    {/* Subject Row */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600">ইমেইল বিষয় (Subject)</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="ইমেইলের বিষয় লিখুন..."
                            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Split View Editor & Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        {/* Editor Block */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <Code className="w-4 h-4 text-blue-500" /> HTML এডিটর
                                </span>
                                <span className="text-[10px] text-slate-400">রিয়েল-টাইম কোড পরিবর্তন</span>
                            </div>
                            <div className="flex-1 min-h-0 relative">
                                <textarea
                                    id="template-body-textarea"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="w-full h-full min-h-[460px] p-4 bg-slate-900 font-mono text-xs text-emerald-400 border-none outline-none focus:ring-0 resize-none"
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        {/* Live Preview Block */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <Eye className="w-4 h-4 text-emerald-500" /> লাইভ প্রিভিউ
                                </span>
                                <span className="text-[10px] text-emerald-500 animate-pulse font-bold bg-emerald-50 px-2 py-0.5 rounded-full">সক্রিয় প্রিভিউ</span>
                            </div>
                            <div className="flex-1 bg-white p-2">
                                <iframe
                                    srcDoc={previewHtml}
                                    className="w-full h-full min-h-[460px] border-none"
                                    title="Email Preview Frame"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Variable Guide & Test Email Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Variables Guide */}
                        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
                                <Info className="w-4 h-4 text-blue-500" /> লভ্য ভেরিয়েবলসমূহ (ক্লিক করে এডিটরে যুক্ত করুন)
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(editingTemplate.variables || {}).map(([key, desc]) => (
                                    <button
                                        key={key}
                                        onClick={() => insertVariable(key)}
                                        className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-600 rounded-lg hover:scale-105 active:scale-[0.98] transition-all cursor-pointer"
                                        title={desc}
                                    >
                                        {`{{${key}}}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Test Email Send Box */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4">
                            <div>
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                                    <Send className="w-4 h-4 text-indigo-500" /> টেস্ট ইমেইল পাঠান
                                </span>
                                <p className="text-[10px] text-slate-400 mb-3">বর্তমান টেমপ্লেটটি ব্যবহার করে আপনার বক্সে টেস্ট ইমেইল পাঠান।</p>
                            </div>
                            <form onSubmit={handleSendTest} className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="ইমেইল ঠিকানা..."
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="submit"
                                    disabled={sendingTest || !testEmail}
                                    className="flex items-center justify-center p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl shadow-sm text-xs font-bold transition-all shrink-0 cursor-pointer border-none"
                                >
                                    {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

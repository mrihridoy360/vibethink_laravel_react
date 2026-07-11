import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MessageCircleQuestion, Plus, Edit, Trash2, ChevronDown, ChevronUp,
    Save, Loader2, ArrowUp, ArrowDown, CheckCircle, XCircle, Info
} from 'lucide-react';
import { useSiteSettings } from '../../Contexts/SiteSettingsContext';

export default function AdminFaqs() {
    const { reloadSettings } = useSiteSettings();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Edit/Create item state
    const [editingIndex, setEditingIndex] = useState(null);
    const [editQuestion, setEditQuestion] = useState('');
    const [editAnswer, setEditAnswer] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Expanded FAQs list for Accordion preview
    const [expandedIndex, setExpandedIndex] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/admin/settings');
            if (data.success && data.settings?.general?.faqs) {
                try {
                    const parsedFaqs = JSON.parse(data.settings.general.faqs);
                    if (Array.isArray(parsedFaqs)) {
                        setFaqs(parsedFaqs);
                    }
                } catch (e) {
                    console.error('Failed to parse faqs settings JSON:', e);
                }
            }
        } catch (err) {
            showToast('error', 'প্রশ্নাবলী লোড করতে ব্যর্থ হয়েছে।');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleSaveToServer = async (updatedFaqs) => {
        setSaving(true);
        try {
            const payload = {
                group: 'general',
                settings: {
                    faqs: JSON.stringify(updatedFaqs)
                }
            };
            const { data } = await axios.post('/api/admin/settings', payload);
            if (data.success) {
                showToast('success', 'প্রশ্নাবলী সফলভাবে সংরক্ষণ করা হয়েছে।');
                setFaqs(updatedFaqs);
                reloadSettings(); // Refresh global app context settings
            } else {
                showToast('error', data.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
            }
        } catch (err) {
            showToast('error', 'সার্ভারে সংরক্ষণ করতে সমস্যা হয়েছে।');
        } finally {
            setSaving(false);
        }
    };

    const handleAddNew = (e) => {
        e.preventDefault();
        if (!editQuestion.trim() || !editAnswer.trim()) {
            alert('প্রশ্ন এবং উত্তর উভয়ই আবশ্যক!');
            return;
        }

        const newItem = { q: editQuestion.trim(), a: editAnswer.trim() };
        const updated = [...faqs, newItem];
        setFaqs(updated);
        handleSaveToServer(updated);

        // Reset form
        setEditQuestion('');
        setEditAnswer('');
        setIsCreating(false);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editQuestion.trim() || !editAnswer.trim()) {
            alert('প্রশ্ন এবং উত্তর উভয়ই আবশ্যক!');
            return;
        }

        const updated = faqs.map((faq, idx) =>
            idx === editingIndex ? { q: editQuestion.trim(), a: editAnswer.trim() } : faq
        );
        setFaqs(updated);
        handleSaveToServer(updated);

        // Reset editing state
        setEditingIndex(null);
        setEditQuestion('');
        setEditAnswer('');
    };

    const handleDelete = (index) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই প্রশ্নটি মুছে ফেলতে চান?')) {
            return;
        }
        const updated = faqs.filter((_, idx) => idx !== index);
        setFaqs(updated);
        handleSaveToServer(updated);
        if (expandedIndex === index) {
            setExpandedIndex(null);
        }
    };

    const moveItem = (index, direction) => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= faqs.length) return;

        const updated = [...faqs];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        setFaqs(updated);
        handleSaveToServer(updated);

        // adjust expanded index if active
        if (expandedIndex === index) {
            setExpandedIndex(targetIndex);
        } else if (expandedIndex === targetIndex) {
            setExpandedIndex(index);
        }
    };

    const startEditing = (index, faq) => {
        setEditingIndex(index);
        setEditQuestion(faq.q);
        setEditAnswer(faq.a);
        setIsCreating(false);
    };

    const startCreating = () => {
        setIsCreating(true);
        setEditingIndex(null);
        setEditQuestion('');
        setEditAnswer('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">প্রশ্নাবলী লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800">প্রশ্নাবলী (FAQ)</h2>
                    <p className="text-sm text-slate-500 mt-0.5">শিক্ষার্থীদের সহজে সাহায্য করতে হোমপেজ বা ল্যান্ডিং পেজে প্রদর্শিত সচরাচর জিজ্ঞাসিত প্রশ্নাবলী সেট করুন।</p>
                </div>
                {toast && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm animate-fadeIn ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {toast.message}
                    </div>
                )}
            </div>

            {/* Layout Split: Left (FAQ List) & Right (Add/Edit Form) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Side: FAQs list */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Add button when not editing */}
                    {!isCreating && editingIndex === null && (
                        <button
                            onClick={startCreating}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 text-blue-600 text-sm font-bold rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> নতুন প্রশ্ন ও উত্তর যুক্ত করুন
                        </button>
                    )}

                    {/* FAQ Items */}
                    <div className="space-y-3">
                        {faqs.length > 0 ? (
                            faqs.map((faq, index) => {
                                const isExpanded = expandedIndex === index;
                                const isBeingEdited = editingIndex === index;

                                return (
                                    <div
                                        key={index}
                                        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                                            isBeingEdited ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200/80 shadow-sm'
                                        }`}
                                    >
                                        {/* FAQ Header Row */}
                                        <div className="px-5 py-4 flex items-center justify-between gap-4">
                                            <div className="flex-1 flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                    {index + 1}
                                                </span>
                                                <button
                                                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                                    className="flex-1 text-left font-bold text-slate-700 hover:text-blue-600 text-xs transition-colors cursor-pointer border-none bg-transparent"
                                                >
                                                    {faq.q}
                                                </button>
                                            </div>

                                            {/* Toolbar actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {/* Reorder Buttons */}
                                                <button
                                                    onClick={() => moveItem(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-400 cursor-pointer border-none bg-transparent"
                                                    title="উপরে নিন"
                                                >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveItem(index, 'down')}
                                                    disabled={index === faqs.length - 1}
                                                    className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-400 cursor-pointer border-none bg-transparent"
                                                    title="নিচে নিন"
                                                >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-[1px] h-3.5 bg-slate-200 mx-1" />
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => startEditing(index, faq)}
                                                    className="p-1 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-400 cursor-pointer border-none bg-transparent"
                                                    title="এডিট করুন"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(index)}
                                                    className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 cursor-pointer border-none bg-transparent"
                                                    title="মুছে ফেলুন"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-[1px] h-3.5 bg-slate-200 mx-1" />
                                                {/* Expand Accordion Button */}
                                                <button
                                                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer border-none bg-transparent"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Answer Body */}
                                        {isExpanded && (
                                            <div className="px-5 pb-4 pt-1.5 text-[11.5px] text-slate-500 font-semibold leading-relaxed border-t border-slate-50 pl-11">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
                                <MessageCircleQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-slate-600">কোনো প্রশ্ন ও উত্তর খুঁজে পাওয়া যায়নি।</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Create/Edit Card Form */}
                <div className="space-y-4">
                    {(isCreating || editingIndex !== null) ? (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                                <MessageCircleQuestion className="w-4 h-4 text-blue-500" />
                                {isCreating ? 'নতুন প্রশ্ন যোগ করুন' : 'প্রশ্ন ও উত্তর এডিট করুন'}
                            </span>
                            <form onSubmit={isCreating ? handleAddNew : handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">প্রশ্ন (Question)</label>
                                    <input
                                        type="text"
                                        required
                                        value={editQuestion}
                                        onChange={(e) => setEditQuestion(e.target.value)}
                                        placeholder="যেমন: কোর্সটি কেনার পর কতদিন অ্যাক্সেস থাকবে?"
                                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">উত্তর (Answer)</label>
                                    <textarea
                                        required
                                        value={editAnswer}
                                        onChange={(e) => setEditAnswer(e.target.value)}
                                        placeholder="আপনার উত্তরটি এখানে বিস্তারিত লিখুন..."
                                        rows={5}
                                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold resize-none"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setEditingIndex(null);
                                        }}
                                        className="px-4 py-2 hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer bg-transparent"
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-xs font-bold transition-all disabled:bg-blue-300 cursor-pointer border-none"
                                    >
                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        {isCreating ? 'যুক্ত করুন' : 'আপডেট করুন'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <Info className="w-4 h-4 text-blue-500" /> প্রশ্নাবলী সেটিংস তথ্য
                            </span>
                            <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
                                এখানে সেট করা প্রশ্নাবলীগুলো স্বয়ংক্রিয়ভাবে ডাটাবেজ সেটিংসের `faqs` কিতে স্টোর হবে। এর ফলে ডাটাবেজের মূল স্কিমায় কোনো পরিবর্তন না করেই সাইটের ল্যান্ডিং পেজে ডাইনামিক FAQ মডিউল চালানো সম্ভব হচ্ছে।
                            </p>
                            <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
                                যেকোনো প্রশ্ন ডিলিট, পজিশন পরিবর্তন (reorder up/down) অথবা এডিট করার সাথে সাথে তা ডাটাবেজে আপডেট হয়ে যাবে।
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

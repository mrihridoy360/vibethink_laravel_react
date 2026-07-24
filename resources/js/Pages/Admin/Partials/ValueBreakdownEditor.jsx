import React, { useState } from 'react';
import {
    Plus, Trash2, Edit2, GripVertical, ChevronUp, ChevronDown,
    TrendingUp, DollarSign, Check, Sparkles
} from 'lucide-react';

export default function ValueBreakdownEditor({ form, setForm }) {
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [subText, setSubText] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);

    // Drag & Drop States
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const items = form.section_titles?.value_items || [];
    const sectionTitle = form.section_titles?.value_breakdown_title || '';
    const sectionSubtitle = form.section_titles?.value_breakdown_subtitle || '';

    // Total Value Calculation
    const totalCalculatedValue = items.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

    const updateSectionTitles = (updates) => {
        setForm(prev => ({
            ...prev,
            section_titles: {
                ...(prev.section_titles || {}),
                ...updates
            }
        }));
    };

    const updateItems = (newItems) => {
        updateSectionTitles({ value_items: newItems });
    };

    const handleAddOrUpdateItem = () => {
        if (!title.trim() || !value) return;

        const newItem = {
            id: editingIndex !== null ? items[editingIndex]?.id || Date.now() : Date.now(),
            title: title.trim(),
            value: parseFloat(value) || 0,
            sub_text: subText.trim()
        };

        let updatedList;
        if (editingIndex !== null) {
            updatedList = [...items];
            updatedList[editingIndex] = newItem;
        } else {
            updatedList = [...items, newItem];
        }

        updateItems(updatedList);

        // Reset form
        setTitle('');
        setValue('');
        setSubText('');
        setEditingIndex(null);
    };

    const handleEditItem = (index) => {
        const item = items[index];
        if (!item) return;
        setTitle(item.title || '');
        setValue(item.value !== undefined ? String(item.value) : '');
        setSubText(item.sub_text || '');
        setEditingIndex(index);
    };

    const handleDeleteItem = (index) => {
        const updatedList = items.filter((_, idx) => idx !== index);
        updateItems(updatedList);
        if (editingIndex === index) {
            setTitle('');
            setValue('');
            setSubText('');
            setEditingIndex(null);
        }
    };

    const moveItem = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const updatedList = [...items];
        const [movedItem] = updatedList.splice(index, 1);
        updatedList.splice(targetIndex, 0, movedItem);

        updateItems(updatedList);

        if (editingIndex === index) setEditingIndex(targetIndex);
        else if (editingIndex === targetIndex) setEditingIndex(index);
    };

    // ── Native HTML5 Drag & Drop Handlers ─────────────────────────────────────
    const handleDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const updatedList = [...items];
        const [movedItem] = updatedList.splice(draggedIndex, 1);
        updatedList.splice(targetIndex, 0, movedItem);

        updateItems(updatedList);

        if (editingIndex === draggedIndex) setEditingIndex(targetIndex);
        else if (editingIndex === targetIndex) setEditingIndex(draggedIndex);

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
            {/* Header & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        কোর্স ভ্যালু ব্রেকডাউন (Course Value & ROI Breakdown)
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                        ইউজার কোর্সের সাথে কত টাকার ভ্যালু বা রিসোর্স পাচ্ছে তার তালিকা।
                    </p>
                </div>
                {totalCalculatedValue > 0 && (
                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-extrabold text-sm flex items-center gap-2 self-start sm:self-auto">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        মোট ভ্যালু: ৳{totalCalculatedValue.toLocaleString('bn-BD')}
                    </div>
                )}
            </div>

            {/* Section Titles Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        সেকশন শিরোনাম (Title)
                    </label>
                    <input
                        type="text"
                        value={sectionTitle}
                        onChange={e => updateSectionTitles({ value_breakdown_title: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        placeholder="যেমন: কোর্সের সাথে কত টাকার ভ্যালু পাচ্ছেন?"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        সেকশন সাবটাইটেল (Subtitle)
                    </label>
                    <input
                        type="text"
                        value={sectionSubtitle}
                        onChange={e => updateSectionTitles({ value_breakdown_subtitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                        placeholder="যেমন: একটি কোর্সেই পাচ্ছেন প্রয়োজনীয় সাপোর্ট ও রিসোর্স"
                    />
                </div>
            </div>

            {/* Form to Add / Edit Value Item */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {editingIndex !== null ? 'ভ্যালু আইটেম এডিট করুন' : 'নতুন ভ্যালু আইটেম যুক্ত করুন'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                        <label className="block text-xs font-bold text-gray-600 mb-1">আইটেমের নাম / টাইটেল *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            placeholder="যেমন: ৫০+ এইচডি প্রিমিয়াম ভিডিও মডিউল"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-gray-600 mb-1">মূল্য / ভ্যালু (৳) *</label>
                        <input
                            type="number"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-gray-800"
                            placeholder="যেমন: 15000"
                        />
                    </div>
                    <div className="sm:col-span-3 flex items-end gap-2">
                        <button
                            type="button"
                            onClick={handleAddOrUpdateItem}
                            disabled={!title.trim() || !value}
                            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            {editingIndex !== null ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editingIndex !== null ? 'আপডেট করুন' : 'যোগ করুন'}
                        </button>
                        {editingIndex !== null && (
                            <button
                                type="button"
                                onClick={() => {
                                    setTitle('');
                                    setValue('');
                                    setSubText('');
                                    setEditingIndex(null);
                                }}
                                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                বাতিল
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">সংক্ষিপ্ত বিবরণ / সাবটেক্সট (ঐচ্ছিক)</label>
                    <input
                        type="text"
                        value={subText}
                        onChange={e => setSubText(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="যেমন: ৫০+ লেকচার ও লাইফটাইম অ্যাক্সেস"
                    />
                </div>
            </div>

            {/* List of Value Items with Drag & Drop */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                        আইটেম তালিকা ({items.length}) — ড্রাগ ড্রপ বা অ্যারো দিয়ে পজিশন চেঞ্জ করুন
                    </label>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                        <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-medium">কোনো ভ্যালু আইটেম যোগ করা হয়নি।</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map((item, index) => {
                            const isBeingDragged = draggedIndex === index;
                            const isOver = dragOverIndex === index;

                            return (
                                <div
                                    key={item.id || index}
                                    draggable
                                    onDragStart={e => handleDragStart(e, index)}
                                    onDragOver={e => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDragEnd={handleDragEnd}
                                    onDrop={e => handleDrop(e, index)}
                                    className={`
                                        flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150
                                        ${isBeingDragged ? 'opacity-40 border-dashed border-emerald-400 bg-emerald-50/50 scale-[0.99]' : 'bg-white hover:border-emerald-200 shadow-xs'}
                                        ${isOver ? 'border-2 border-emerald-500 bg-emerald-50/80' : 'border-gray-200'}
                                    `}
                                >
                                    {/* Left: Drag handle + Up/Down + Info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-emerald-600 p-1 rounded hover:bg-gray-100 transition-colors"
                                            title="ড্রাগ করে পজিশন পরিবর্তন করুন"
                                        >
                                            <GripVertical className="h-4 w-4" />
                                        </div>

                                        {/* Up / Down arrows */}
                                        <div className="flex flex-col gap-0.5 shrink-0">
                                            <button
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() => moveItem(index, -1)}
                                                className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 cursor-pointer border-none bg-transparent"
                                                title="উপরে সরান"
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={index === items.length - 1}
                                                onClick={() => moveItem(index, 1)}
                                                className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 cursor-pointer border-none bg-transparent"
                                                title="নিচে সরান"
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h5 className="text-xs font-bold text-gray-800 truncate">{item.title}</h5>
                                            </div>
                                            {item.sub_text && (
                                                <p className="text-[11px] text-gray-400 truncate">{item.sub_text}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Value badge + Actions */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-100">
                                            ৳{parseFloat(item.value || 0).toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEditItem(index)}
                                                className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors cursor-pointer border-none bg-transparent"
                                                title="এডিট"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteItem(index)}
                                                className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                                                title="মুছুন"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

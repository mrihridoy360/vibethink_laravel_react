import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Target, BookOpen, Clock, Award, Shield, AlertCircle, HelpCircle, User, Users, CreditCard, Play, Star, MessageSquare, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

const ICON_MAP = {
    CheckCircle,
    Target,
    BookOpen,
    Clock,
    Award,
    Shield,
    AlertCircle,
    HelpCircle,
    User,
    Users,
    CreditCard,
    Play,
    Star,
    MessageSquare
};

export default function FeatureListEditor({ items, onChange, label, placeholder, subPlaceholder = 'অতিরিক্ত বিবরণ (ঐচ্ছিক)', titleValue, onTitleChange }) {
    const list = Array.isArray(items) ? items : [];
    const [titleLocal, setTitleLocal] = useState(titleValue || '');

    // Drag and Drop state
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    useEffect(() => {
        setTitleLocal(titleValue || '');
    }, [titleValue]);

    const handleAdd = () => {
        const newItem = { text: '', sub_text: '', icon: 'CheckCircle' };
        onChange([...list, newItem]);
    };

    const handleRemove = (index) => {
        const updated = list.filter((_, idx) => idx !== index);
        onChange(updated);
    };

    const handleChange = (index, key, value) => {
        const updated = list.map((item, idx) => {
            if (idx === index) {
                return { ...item, [key]: value };
            }
            return item;
        });
        onChange(updated);
    };

    const handleMove = (index, direction) => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= list.length) return;
        const updated = [...list];
        const [movedItem] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, movedItem);
        onChange(updated);
    };

    // Drag and drop handlers
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

        const updated = [...list];
        const [draggedItem] = updated.splice(draggedIndex, 1);
        updated.splice(targetIndex, 0, draggedItem);

        onChange(updated);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-50">
                {onTitleChange ? (
                    <input
                        type="text"
                        value={titleLocal}
                        onChange={e => {
                            setTitleLocal(e.target.value);
                            onTitleChange && onTitleChange(e.target.value);
                        }}
                        placeholder={label}
                        className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                ) : (
                    <h4 className="text-sm font-bold text-gray-800">{label}</h4>
                )}
                <span className="text-xs text-gray-400 font-semibold shrink-0">{list.length}টি আইটেম</span>
            </div>

            <div className="space-y-3">
                {list.map((item, index) => {
                    const IconComponent = ICON_MAP[item.icon] || CheckCircle;
                    const isDragged = draggedIndex === index;
                    const isOver = dragOverIndex === index;

                    return (
                        <div
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`flex gap-3 items-start p-4 rounded-xl border transition-all group relative ${
                                isDragged
                                    ? 'opacity-40 border-dashed border-blue-400 bg-blue-50/30 scale-[0.99]'
                                    : isOver
                                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50'
                                    : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                            }`}
                        >
                            {/* Drag Handle */}
                            <div className="flex items-center justify-center pt-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 transition-colors shrink-0" title="ড্রাগ করে পজিশন চেঞ্জ করুন">
                                <GripVertical className="h-5 w-5" />
                            </div>

                            {/* Icon select */}
                            <div className="flex flex-col gap-1 shrink-0">
                                <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm mb-1.5">
                                    <IconComponent className="h-5 w-5 text-blue-600" />
                                </div>
                                <select
                                    value={item.icon || 'CheckCircle'}
                                    onChange={(e) => handleChange(index, 'icon', e.target.value)}
                                    className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 rounded-lg px-1 py-0.5 outline-none cursor-pointer w-14"
                                >
                                    {Object.keys(ICON_MAP).map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Text inputs */}
                            <div className="flex-grow space-y-2">
                                <input
                                    type="text"
                                    value={item.text || ''}
                                    onChange={(e) => handleChange(index, 'text', e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                />
                                <input
                                    type="text"
                                    value={item.sub_text || ''}
                                    onChange={(e) => handleChange(index, 'sub_text', e.target.value)}
                                    placeholder={subPlaceholder}
                                    className="w-full px-3 py-1 bg-white/70 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Actions: Reorder arrows & Delete */}
                            <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleMove(index, 'up')}
                                    disabled={index === 0}
                                    className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200/60 disabled:opacity-20 cursor-pointer transition-colors"
                                    title="উপরে নিন"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMove(index, 'down')}
                                    disabled={index === list.length - 1}
                                    className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200/60 disabled:opacity-20 cursor-pointer transition-colors"
                                    title="নিচে নিন"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="আইটেম মুছুন"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {list.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-xs text-gray-400 italic">কোনো আইটেম যোগ করা হয়নি।</p>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={handleAdd}
                className="w-full py-2.5 bg-gray-50 border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 text-gray-600 hover:text-blue-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
                <Plus className="h-3.5 w-3.5" />
                নতুন আইটেম যোগ করুন
            </button>
        </div>
    );
}


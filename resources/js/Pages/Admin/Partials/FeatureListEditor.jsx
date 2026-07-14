import React from 'react';
import { Plus, Trash2, CheckCircle, Target, BookOpen, Clock, Award, Shield, AlertCircle, HelpCircle, User, Users, CreditCard, Play, Star, MessageSquare } from 'lucide-react';

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

export default function FeatureListEditor({ items, onChange, label, placeholder, subPlaceholder = 'অতিরিক্ত বিবরণ (ঐচ্ছিক)' }) {
    const list = Array.isArray(items) ? items : [];

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

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                <h4 className="text-sm font-bold text-gray-800">{label}</h4>
                <span className="text-xs text-gray-400 font-semibold">{list.length}টি আইটেম</span>
            </div>

            <div className="space-y-3">
                {list.map((item, index) => {
                    const IconComponent = ICON_MAP[item.icon] || CheckCircle;
                    return (
                        <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-100 group relative">
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

                            {/* Delete button */}
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-55 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Check, AlertCircle } from 'lucide-react';

export default function Tools() {
    const [categories, setCategories] = useState([]);
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/tools')
            .then(res => {
                if (res.data.success) {
                    setCategories(res.data.categories);
                    setTools(res.data.tools);
                }
            })
            .catch(err => {
                console.error('Error fetching tools', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="py-12 flex justify-center items-center">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-500 text-sm font-medium">টুলস লোড হচ্ছে...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                    <Wrench className="h-7 w-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">প্রয়োজনীয় টুলস</h2>
                    <p className="text-sm text-gray-400 mt-0.5 font-light">আপনার উৎপাদনশীলতা বাড়াতে টুলসগুলো ব্যবহার করুন</p>
                </div>
            </div>

            {/* Categories & Tools Sections */}
            {categories.length > 0 ? (
                categories.map(category => {
                    const categoryTools = tools.filter(t => t.category_id === category.id);
                    if (categoryTools.length === 0) return null;

                    return (
                        <div key={category.id} className="space-y-5">
                            {/* Category Banner */}
                            <div 
                                className="px-6 py-3.5 rounded-2xl text-white font-bold flex items-center gap-2 shadow-sm text-base"
                                style={{ backgroundColor: category.color || '#2563eb' }}
                            >
                                <Wrench className="h-5 w-5" />
                                <span>{category.name}</span>
                            </div>

                            {/* Tools Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryTools.map(tool => (
                                    <div 
                                        key={tool.id}
                                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative transition-all duration-300 hover:shadow-md hover:border-blue-500/10 flex flex-col justify-between"
                                    >
                                        {/* Green Checkmark circle badge */}
                                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm flex items-center justify-center h-6 w-6 z-10">
                                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                                        </div>

                                        <div>
                                            {/* Header with Icon and Title */}
                                            <div className="flex items-center gap-3.5 mb-4">
                                                {tool.icon ? (
                                                    <img 
                                                        src={tool.icon} 
                                                        alt={tool.name} 
                                                        className="h-12 w-12 rounded-xl object-contain border border-gray-100 p-1 bg-white shrink-0" 
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 shrink-0">
                                                        <Wrench className="h-6 w-6" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h4 className="text-base font-bold text-gray-900 truncate leading-tight">{tool.name}</h4>
                                                    <a 
                                                        href={tool.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-0.5 mt-1"
                                                    >
                                                        ভিজিট করুন <span className="text-xs">↗</span>
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Description quote box */}
                                            <div className="p-5 bg-gray-50 border-l-4 border-blue-500 rounded-r-xl text-sm text-gray-700 font-medium leading-relaxed">
                                                {tool.description}
                                            </div>
                                        </div>

                                        {/* Optional button text action pill */}
                                        {tool.button_text && (
                                            <div className="mt-4 pt-1">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold leading-none">
                                                    ⚡ {tool.button_text}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">এই মুহূর্তে কোনো প্রয়োজনীয় টুলস উপলব্ধ নেই।</p>
                </div>
            )}
        </div>
    );
}

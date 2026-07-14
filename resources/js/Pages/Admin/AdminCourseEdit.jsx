import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import axios from 'axios';
import {
    ArrowLeft, BookOpen, LayoutDashboard, Settings, Globe, Save,
    Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle,
    DollarSign, Eye, EyeOff, Tag, Languages, Shield, LogOut, Home,
    Bell, Trash2, X, ListVideo, Plus, ChevronUp, ChevronDown
} from 'lucide-react';
import CurriculumBuilder from './Partials/CurriculumBuilder';
import AdminLayout from '../../Components/AdminLayout';
import FeatureListEditor from './Partials/FeatureListEditor';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast]);
    if (!toast) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
            <button onClick={onClose}><X className="h-3.5 w-3.5 ml-1 opacity-70" /></button>
        </div>
    );
}

// ── ImageUploadBox ─────────────────────────────────────────────────────────────
function ImageUploadBox({ label, hint, preview, onChange, inputId }) {
    const ref = useRef();
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div
                onClick={() => ref.current.click()}
                className="relative w-full min-h-[200px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-blue-50/40 hover:border-blue-300 transition-all cursor-pointer overflow-hidden group"
            >
                {preview ? (
                    <>
                        <img src={preview} alt="preview" className="w-full h-full object-cover min-h-[200px]" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-sm font-semibold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-xl">
                                <Upload className="h-4 w-4" /> ছবি পরিবর্তন করুন
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-gray-400">
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                        <span className="text-sm font-medium">ছবি আপলোড করুন</span>
                        <span className="text-xs text-gray-300">{hint}</span>
                    </div>
                )}
            </div>
            <input ref={ref} id={inputId} type="file" accept="image/*" onChange={onChange} className="hidden" />
        </div>
    );
}

// ── DetailsTab ─────────────────────────────────────────────────────────────────
function DetailsTab({ form, setForm, categories, errors, thumbnailPreview, onThumbnailChange }) {
    return (
        <div className="space-y-6">
            {/* Top Grid: Info & Media */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Course Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-0.5">কোর্সের তথ্য</h3>
                        <p className="text-xs text-gray-400">কোর্স কার্ডে যা দেখাবে।</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">শিরোনাম <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                            placeholder="কোর্সের নাম..."
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্লাগ (URL)</label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono ${errors.slug ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                            placeholder="course-slug"
                        />
                        <p className="text-xs text-gray-400 mt-1">URL-এ ব্যবহৃত হয়। অবশ্যই unique হতে হবে।</p>
                        {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">সংক্ষিপ্ত বিবরণ</label>
                        <textarea
                            rows={3}
                            value={form.short_description}
                            onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="কোর্স সম্পর্কে সংক্ষেপে..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">বিস্তারিত বিবরণ</label>
                        <textarea
                            rows={5}
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="কোর্সের বিস্তারিত বিবরণ..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><ListVideo className="h-3.5 w-3.5" />প্রমোশনাল ভিডিও URL</label>
                        <input
                            type="url"
                            value={form.video_url}
                            onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />ক্যাটাগরি</label>
                            <select
                                value={form.category_id}
                                onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                            >
                                <option value="">ক্যাটাগরি নেই</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" />ভাষা</label>
                            <select
                                value={form.language}
                                onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                            >
                                <option value="Bengali">বাংলা</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right: Thumbnail */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-0.5">কোর্স মিডিয়া</h3>
                        <p className="text-xs text-gray-400">থাম্বনেইল আপলোড করুন।</p>
                    </div>
                    <ImageUploadBox
                        label="থাম্বনেইল ছবি"
                        hint="16:9 অনুপাত প্রস্তাবিত। সর্বোচ্চ 4MB"
                        preview={thumbnailPreview}
                        onChange={onThumbnailChange}
                        inputId="thumbnail_input"
                    />
                </div>
            </div>

            {/* Course Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeatureListEditor
                    label="What You'll Learn (কোর্সে যা যা শিখবেন)"
                    items={form.what_youll_learn}
                    onChange={val => setForm(p => ({ ...p, what_youll_learn: val }))}
                    placeholder="যেমন: Advanced React state management শিখবেন"
                />
                <FeatureListEditor
                    label="Requirements (প্রয়োজনীয় রিকোয়ারমেন্টস)"
                    items={form.requirements}
                    onChange={val => setForm(p => ({ ...p, requirements: val }))}
                    placeholder="যেমন: Basic JavaScript ও HTML এর ধারণা"
                />
                <FeatureListEditor
                    label="Audience (কোর্সটি কাদের জন্য)"
                    items={form.audience}
                    onChange={val => setForm(p => ({ ...p, audience: val }))}
                    placeholder="যেমন: যারা AI টুলস দিয়ে সফটওয়্যার বানাতে চান"
                />
                <FeatureListEditor
                    label="This Course Includes (কোর্সের সাথে যা যা থাকছে)"
                    items={form.this_course_includes}
                    onChange={val => setForm(p => ({ ...p, this_course_includes: val }))}
                    placeholder="যেমন: ১০+ ঘন্টার রেকর্ডেড ভিডিও লেকচার"
                />
            </div>

            {/* Problems & Solutions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeatureListEditor
                    label="Problems (শিক্ষার্থীদের সমস্যা)"
                    items={form.problems}
                    onChange={val => setForm(p => ({ ...p, problems: val }))}
                    placeholder="যেমন: নিজের কোনো রিয়েল প্রজেক্ট পোর্টফোলিও নেই"
                />
                <FeatureListEditor
                    label="Solutions (আমাদের সমাধান)"
                    items={form.solutions}
                    onChange={val => setForm(p => ({ ...p, solutions: val }))}
                    placeholder="যেমন: কোর্স শেষে ৩টি লাইভ পোর্টফোলিও প্রজেক্ট থাকবে"
                />
            </div>

            {/* FAQ */}
            <FaqEditor
                items={form.faq}
                onChange={val => setForm(p => ({ ...p, faq: val }))}
            />
        </div>
    );
}

// ── SettingsTab ────────────────────────────────────────────────────────────────
function SettingsTab({ form, setForm, errors }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-0.5">
                        <DollarSign className="h-4 w-4 text-blue-600" /> মূল্য নির্ধারণ
                    </h3>
                    <p className="text-xs text-gray-400">কোর্সের মূল্য সেট করুন।</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">নিয়মিত মূল্য (৳)</label>
                        <input
                            type="number" min="0" step="0.01"
                            value={form.price}
                            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="0 = ফ্রি"
                        />
                        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ডিসকাউন্ট মূল্য (৳)</label>
                        <input
                            type="number" min="0" step="0.01"
                            value={form.discount_price}
                            onChange={e => setForm(p => ({ ...p, discount_price: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="ঐচ্ছিক"
                        />
                        {errors.discount_price && <p className="text-xs text-red-500 mt-1">{errors.discount_price[0]}</p>}
                    </div>
                </div>
                <p className="text-xs text-gray-400">মূল্য ০ রাখলে কোর্সটি ফ্রি হবে।</p>
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <div>
                    <h3 className="text-base font-bold text-gray-900 mb-0.5">কোর্সের স্ট্যাটাস</h3>
                    <p className="text-xs text-gray-400">কোর্সের দৃশ্যমানতা নিয়ন্ত্রণ করুন।</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">কোর্স প্রকাশ করুন</p>
                        <p className="text-xs text-gray-400 mt-0.5">সক্রিয় হলে শিক্ষার্থীরা দেখতে পাবে।</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${form.is_published ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${form.is_published ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                    {form.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {form.is_published ? 'কোর্সটি প্রকাশিত এবং শিক্ষার্থীদের দেখা যাচ্ছে।' : 'কোর্সটি ড্রাফটে আছে, শিক্ষার্থীরা দেখতে পাচ্ছে না।'}
                </div>
            </div>
        </div>
    );
}

// ── SEOTab ─────────────────────────────────────────────────────────────────────
function SEOTab({ form, setForm, seoPreview, onSeoImageChange, errors }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SEO Fields */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-0.5">
                        <Globe className="h-4 w-4 text-blue-600" /> সার্চ ইঞ্জিন অপ্টিমাইজেশন
                    </h3>
                    <p className="text-xs text-gray-400">সার্চ রেজাল্টে কোর্সটি কীভাবে দেখাবে।</p>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">SEO শিরোনাম</label>
                    <input
                        type="text"
                        value={form.seo_title}
                        onChange={e => setForm(p => ({ ...p, seo_title: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="কাস্টম SEO শিরোনাম"
                    />
                    <p className="text-xs text-gray-400 mt-1">খালি রাখলে কোর্সের শিরোনাম ব্যবহার হবে। আদর্শ: ৫০-৬০ অক্ষর।</p>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">SEO বিবরণ</label>
                    <textarea
                        rows={4}
                        value={form.seo_description}
                        onChange={e => setForm(p => ({ ...p, seo_description: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        placeholder="সার্চ ইঞ্জিনের জন্য সংক্ষিপ্ত বিবরণ..."
                    />
                    <p className="text-xs text-gray-400 mt-1">আদর্শ: ১৫০-১৬০ অক্ষর।</p>
                </div>
            </div>

            {/* OG Image */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-0.5">
                        <ImageIcon className="h-4 w-4 text-purple-600" /> সোশ্যাল মিডিয়া ছবি (OG)
                    </h3>
                    <p className="text-xs text-gray-400">শেয়ার করলে যে ছবিটি দেখাবে।</p>
                </div>
                <ImageUploadBox
                    label="OG ছবি"
                    hint="প্রস্তাবিত: 1200×630px। সর্বোচ্চ 4MB"
                    preview={seoPreview}
                    onChange={onSeoImageChange}
                    inputId="seo_image_input"
                />
            </div>
        </div>
    );
}

// ── FaqEditor ────────────────────────────────────────────────────────────────
function FaqEditor({ items, onChange }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const addFaq = () => {
        if (!question.trim() || !answer.trim()) return;
        onChange([...items, { question: question.trim(), answer: answer.trim() }]);
        setQuestion('');
        setAnswer('');
    };

    const removeFaq = (idx) => {
        onChange(items.filter((_, i) => i !== idx));
    };

    const moveFaq = (idx, dir) => {
        const target = idx + dir;
        if (target < 0 || target >= items.length) return;
        const updated = [...items];
        [updated[idx], updated[target]] = [updated[target], updated[idx]];
        onChange(updated);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div>
                <h3 className="text-base font-bold text-gray-900 mb-0.5">সচরাচর প্রশ্ন ও উত্তর (FAQ)</h3>
                <p className="text-xs text-gray-400">কোর্স সম্পর্কিত সাধারণ প্রশ্ন ও উত্তর যোগ করুন।</p>
            </div>

            {/* Add form */}
            <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">প্রশ্ন</label>
                    <input
                        type="text"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="যেমন: কোর্সটি কি লাইফটাইম অ্যাক্সেস?"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">উত্তর</label>
                    <textarea
                        rows={3}
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        placeholder="উত্তর লিখুন..."
                    />
                </div>
                <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                    <Plus className="h-4 w-4" /> FAQ যোগ করুন
                </button>
            </div>

            {/* List */}
            {items.length === 0 ? (
                <p className="text-sm text-gray-400 italic">এখনো কোনো FAQ যোগ করা হয়নি।</p>
            ) : (
                <div className="space-y-3">
                    {items.map((faq, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800">প্রশ্ন: {faq.question}</p>
                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{faq.answer}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => moveFaq(idx, -1)}
                                        disabled={idx === 0}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                                        title="উপরে"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveFaq(idx, 1)}
                                        disabled={idx === items.length - 1}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                                        title="নিচে"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(idx)}
                                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                        title="মুছুন"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main AdminCourseEdit ───────────────────────────────────────────────────────
export default function AdminCourseEdit() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') || 'details';

    const [course, setCourse]           = useState(null);
    const [categories, setCategories]   = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    const [form, setForm] = useState({
        title: '', slug: '', short_description: '', description: '',
        video_url: '', category_id: '', language: 'Bengali',
        price: '', discount_price: '', is_published: false,
        seo_title: '', seo_description: '',
        what_youll_learn: [],
        requirements: [],
        audience: [],
        this_course_includes: [],
        problems: [],
        solutions: [],
        faq: [],
    });

    const [thumbnail, setThumbnail]         = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [seoImage, setSeoImage]           = useState(null);
    const [seoPreview, setSeoPreview]       = useState(null);

    const [saving, setSaving]   = useState(false);
    const [errors, setErrors]   = useState({});
    const [toast, setToast]     = useState(null);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    // Auth guard
    useEffect(() => {
        if (loading) return;
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'admin') { navigate('/dashboard'); return; }
    }, [user, loading, navigate]);

    // Fetch course + categories
    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        const fetchData = async () => {
            setPageLoading(true);
            try {
                const [courseRes, catRes] = await Promise.all([
                    axios.get(`/api/admin/courses/${id}`),
                    axios.get('/api/admin/categories'),
                ]);

                if (courseRes.data.success) {
                    const found = courseRes.data.course;
                    setCourse(found);
                    setForm({
                        title:             found.title || '',
                        slug:              found.slug || '',
                        short_description: found.short_description || '',
                        description:       found.description || '',
                        video_url:         found.video_url || '',
                        category_id:       found.category_id || '',
                        language:          found.language || 'Bengali',
                        price:             found.price != null ? parseFloat(found.price) : '',
                        discount_price:    found.discount_price != null ? parseFloat(found.discount_price) : '',
                        is_published:      !!found.is_published,
                        seo_title:         found.seo_title || '',
                        seo_description:   found.seo_description || '',
                        what_youll_learn:  Array.isArray(found.what_youll_learn) ? found.what_youll_learn : [],
                        requirements:      Array.isArray(found.requirements) ? found.requirements : [],
                        audience:          Array.isArray(found.audience) ? found.audience : [],
                        this_course_includes: Array.isArray(found.this_course_includes) ? found.this_course_includes : [],
                        problems:          Array.isArray(found.problems) ? found.problems : [],
                        solutions:         Array.isArray(found.solutions) ? found.solutions : [],
                        faq:              Array.isArray(found.faq) ? found.faq : [],
                    });
                    if (found.thumbnail) setThumbnailPreview(found.thumbnail.startsWith('http') ? found.thumbnail : `/storage/${found.thumbnail}`);
                    if (found.seo_image) setSeoPreview(found.seo_image.startsWith('http') ? found.seo_image : `/storage/${found.seo_image}`);
                }

                if (catRes.data.success) setCategories(catRes.data.categories);
            } catch (e) { console.error(e); }
            finally { setPageLoading(false); }
        };
        fetchData();
    }, [id, user]);

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const handleSeoImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSeoImage(file);
        setSeoPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setSaving(true);
        setErrors({});
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (Array.isArray(v) || (typeof v === 'object' && v !== null)) {
                    fd.append(k, JSON.stringify(v));
                } else {
                    fd.append(k, v === true ? 1 : v === false ? 0 : (v ?? ''));
                }
            });
            if (thumbnail) fd.append('thumbnail', thumbnail);
            if (seoImage) fd.append('seo_image', seoImage);
            fd.append('_method', 'PUT');

            const res = await axios.post(`/api/admin/courses/${id}/update`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                showToast('কোর্স সফলভাবে আপডেট হয়েছে।');
                setCourse(res.data.course);
            }
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
            else showToast('আপডেট করতে সমস্যা হয়েছে।', 'error');
        } finally {
            setSaving(false);
        }
    };

    const setTab = (tab) => {
        setSearchParams({ tab });
    };

    const handleLogout = async () => { await logout(); navigate('/login'); };

    if (loading || pageLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f4f6fc]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">কোর্স লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    const TABS = [
        { key: 'details',    label: 'ল্যান্ডিং পেজ',   icon: LayoutDashboard },
        { key: 'curriculum', label: 'কারিকুলাম',        icon: ListVideo },
        { key: 'settings',   label: 'সেটিংস ও মূল্য',  icon: Settings },
        { key: 'seo',        label: 'SEO',              icon: Globe },
    ];

    const customHeader = (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <Link to="/admin/courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-semibold transition-colors">
                    <ArrowLeft className="h-4 w-4" /> কোর্স তালিকা
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{course?.title || 'এডিট করুন'}</span>
            </div>
            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-200 disabled:opacity-60 cursor-pointer"
            >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> সেভ হচ্ছে...</> : <><Save className="h-4 w-4" /> পরিবর্তন সেভ করুন</>}
            </button>
        </div>
    );

    return (
        <AdminLayout activeTab="courses" headerContent={customHeader}>
            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="space-y-5">
                {/* Page title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900">Course Setup</h1>
                        <p className="text-sm text-gray-400 mt-0.5">সব ট্যাব পূরণ করে কোর্স পাবলিশ করুন।</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${course?.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {course?.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {course?.is_published ? 'প্রকাশিত' : 'ড্রাফট'}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white border border-gray-100 p-1.5 rounded-2xl w-fit">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                    <DetailsTab
                        form={form}
                        setForm={setForm}
                        categories={categories}
                        errors={errors}
                        thumbnailPreview={thumbnailPreview}
                        onThumbnailChange={handleThumbnailChange}
                    />
                )}
                {activeTab === 'curriculum' && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="mb-5">
                            <h3 className="text-base font-bold text-gray-900 mb-0.5">কারিকুলাম</h3>
                            <p className="text-xs text-gray-400">চ্যাপ্টার ও লেসন সাজান।</p>
                        </div>
                        <CurriculumBuilder courseId={id} />
                    </div>
                )}
                {activeTab === 'settings' && (
                    <SettingsTab form={form} setForm={setForm} errors={errors} />
                )}
                {activeTab === 'seo' && (
                    <SEOTab
                        form={form}
                        setForm={setForm}
                        seoPreview={seoPreview}
                        onSeoImageChange={handleSeoImageChange}
                        errors={errors}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

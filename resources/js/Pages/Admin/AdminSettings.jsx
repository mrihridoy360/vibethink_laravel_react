import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Globe, Palette, AlignLeft, CreditCard, Mail, Zap,
    Save, Upload, Eye, EyeOff, CheckCircle, XCircle,
    Image, Facebook, Twitter, Instagram, Linkedin,
    Phone, MapPin, Copyright, Link2, ToggleLeft, ToggleRight,
    Loader2, RefreshCw
} from 'lucide-react';
import { useSiteSettings } from '../../Contexts/SiteSettingsContext';

// ── Reusable sub-components ─────────────────────────────────────

function SectionCard({ title, description, children }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <div className="p-6 space-y-4">{children}</div>
        </div>
    );
}

function SettingInput({ label, id, type = 'text', value, onChange, placeholder, hint }) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
            <input
                id={id}
                type={type}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
            />
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

function SettingTextarea({ label, id, value, onChange, placeholder, rows = 3 }) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
            <textarea
                id={id}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all resize-none"
            />
        </div>
    );
}

function SettingSelect({ label, id, value, onChange, options }) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
            <select
                id={id}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

function FeatureToggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-orange-500' : 'bg-slate-300'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

function ImageUploadBox({ label, currentUrl, onUpload, accept = 'image/*', hint }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl);

    useEffect(() => { setPreview(currentUrl); }, [currentUrl]);

    const handleFile = async (file) => {
        if (!file) return;
        setUploading(true);
        // Local preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
        await onUpload(file);
        setUploading(false);
    };

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">{label}</label>
            <div
                className="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-5 cursor-pointer hover:border-orange-400/60 hover:bg-orange-50/40 transition-all group"
                onClick={() => inputRef.current?.click()}
            >
                {preview ? (
                    <img src={preview} alt="preview" className="h-16 object-contain rounded-lg" />
                ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Image className="w-6 h-6 text-slate-400" />
                    </div>
                )}
                <div className="text-center">
                    <p className="text-xs font-semibold text-slate-600 group-hover:text-orange-500 transition-colors">
                        {uploading ? 'আপলোড হচ্ছে...' : 'ক্লিক করে ইমেজ বেছে নিন'}
                    </p>
                    {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
                </div>
                {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
        </div>
    );
}

// ── Save bar ────────────────────────────────────────────────────
function SaveBar({ saving, onSave, toast }) {
    return (
        <div className="sticky bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-t border-slate-200/80 px-6 py-3 flex items-center justify-between gap-4">
            {toast && (
                <div className={`flex items-center gap-2 text-sm font-semibold ${toast.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}
            {!toast && <span className="text-xs text-slate-400">পরিবর্তন করার পর সেভ বাটনে ক্লিক করুন।</span>}
            <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-bold rounded-xl shadow transition-all duration-200 ml-auto"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </button>
        </div>
    );
}

// ── Tab definitions ─────────────────────────────────────────────
const TABS = [
    { key: 'general',    label: 'সাধারণ',   icon: Globe },
    { key: 'appearance', label: 'চেহারা',   icon: Palette },
    { key: 'footer',     label: 'ফুটার',    icon: AlignLeft },
    { key: 'payment',    label: 'পেমেন্ট',  icon: CreditCard },
    { key: 'email',      label: 'ইমেইল',    icon: Mail },
];

// ── Main component ──────────────────────────────────────────────
export default function AdminSettings() {
    const { reloadSettings } = useSiteSettings();

    const [activeTab, setActiveTab] = useState('general');
    const [allSettings, setAllSettings] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Per-group local state
    const [general, setGeneral]       = useState({});
    const [appearance, setAppearance] = useState({});
    const [footer, setFooter]         = useState({});
    const [payment, setPayment]       = useState({});
    const [email, setEmail]           = useState({});
    const [features, setFeatures]     = useState({});

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAll = async () => {
        setLoadingData(true);
        try {
            const { data } = await axios.get('/api/admin/settings');
            if (data.success) {
                const s = data.settings;
                setAllSettings(s);
                setGeneral(s.general    || {});
                setAppearance(s.appearance || {});
                setFooter(s.footer      || {});
                setPayment(s.payment    || {});
                setEmail(s.email        || {});
                setFeatures(s.features  || {});
            }
        } catch (err) {
            showToast('error', 'সেটিংস লোড করতে সমস্যা হয়েছে।');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const saveGroup = async (group, data) => {
        setSaving(true);
        try {
            const res = await axios.post('/api/admin/settings', { group, settings: data });
            if (res.data.success) {
                showToast('success', res.data.message || 'সেটিংস সেভ করা হয়েছে।');
                reloadSettings(); // Refresh global context
            } else {
                showToast('error', res.data.message || 'সেভ করতে সমস্যা হয়েছে।');
            }
        } catch (err) {
            showToast('error', err?.response?.data?.message || 'সেভ করতে সমস্যা হয়েছে।');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        const groupMap = {
            general:    general,
            appearance: appearance,
            footer:     footer,
            payment:    payment,
            email:      email,
            features:   features,
        };
        saveGroup(activeTab, groupMap[activeTab]);
    };

    const handleImageUpload = async (file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        try {
            const { data } = await axios.post('/api/admin/settings/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.success) {
                setAppearance((prev) => ({ ...prev, [data.key]: data.url }));
                showToast('success', 'ইমেজ আপলোড সম্পন্ন হয়েছে।');
                reloadSettings();
            } else {
                showToast('error', data.message || 'আপলোড ব্যর্থ হয়েছে।');
            }
        } catch (err) {
            showToast('error', 'আপলোড করতে সমস্যা হয়েছে।');
        }
    };

    const setG  = (key) => (val) => setGeneral((p)    => ({ ...p, [key]: val }));
    const setA  = (key) => (val) => setAppearance((p)  => ({ ...p, [key]: val }));
    const setF  = (key) => (val) => setFooter((p)      => ({ ...p, [key]: val }));
    const setP  = (key) => (val) => setPayment((p)     => ({ ...p, [key]: val }));
    const setE  = (key) => (val) => setEmail((p)       => ({ ...p, [key]: val }));
    const setFt = (key) => (val) => setFeatures((p)    => ({ ...p, [key]: val ? '1' : '0' }));

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">সেটিংস লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800">সাইট সেটিংস</h2>
                    <p className="text-sm text-slate-500 mt-0.5">সাইটের সকল গ্লোবাল কনফিগারেশন এখান থেকে পরিচালনা করুন।</p>
                </div>
                <button
                    onClick={fetchAll}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    রিফ্রেশ
                </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-6 overflow-x-auto shrink-0">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                                active
                                    ? 'bg-white text-orange-500 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 space-y-5 overflow-y-auto pb-24">

                {/* ── General ───────────────────────────────── */}
                {activeTab === 'general' && (
                    <>
                        <SectionCard title="সাইটের মূল তথ্য" description="সাইটের নাম, বিবরণ ও ভাষা নির্ধারণ করুন।">
                            <SettingInput
                                label="সাইটের নাম"
                                id="site_name"
                                value={general.site_name}
                                onChange={setG('site_name')}
                                placeholder="VibeThink Academy"
                            />
                            <SettingTextarea
                                label="সাইটের বিবরণ (Description)"
                                id="site_description"
                                value={general.site_description}
                                onChange={setG('site_description')}
                                placeholder="সংক্ষেপে সাইটের বিবরণ লিখুন..."
                            />
                            <SettingSelect
                                label="ডিফল্ট ভাষা"
                                id="site_language"
                                value={general.site_language}
                                onChange={setG('site_language')}
                                options={[
                                    { value: 'bn', label: 'বাংলা (Bengali)' },
                                    { value: 'en', label: 'English' },
                                ]}
                            />
                        </SectionCard>
                        <SectionCard title="SEO সেটিংস" description="সার্চ ইঞ্জিন অপটিমাইজেশন কীওয়ার্ড।">
                            <SettingTextarea
                                label="মেটা কীওয়ার্ড"
                                id="meta_keywords"
                                value={general.meta_keywords}
                                onChange={setG('meta_keywords')}
                                placeholder="online course, learning, bangladesh, ..."
                                rows={2}
                            />
                        </SectionCard>
                    </>
                )}

                {/* ── Appearance ────────────────────────────── */}
                {activeTab === 'appearance' && (
                    <>
                        <SectionCard title="লোগো ও ফেভিকন" description="Navbar ও Footer-এ ব্যবহৃত লোগো এবং ব্রাউজার ফেভিকন।">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <ImageUploadBox
                                    label="নেভবার লোগো"
                                    currentUrl={appearance.site_logo}
                                    onUpload={(file) => handleImageUpload(file, 'logo')}
                                    hint="PNG/SVG, সর্বোচ্চ 2MB"
                                />
                                <ImageUploadBox
                                    label="ফুটার লোগো (ঐচ্ছিক)"
                                    currentUrl={appearance.footer_logo || appearance.site_logo}
                                    onUpload={(file) => handleImageUpload(file, 'footer_logo')}
                                    hint="ভিন্ন না হলে Navbar লোগো ব্যবহার হবে"
                                />
                                <ImageUploadBox
                                    label="ফেভিকন"
                                    currentUrl={appearance.site_favicon}
                                    onUpload={(file) => handleImageUpload(file, 'favicon')}
                                    hint=".ico বা .png, ৩২x৩২ পিক্সেল"
                                />
                            </div>
                        </SectionCard>
                        <SectionCard title="রঙ সেটিংস" description="সাইটের প্রাইমারি কালার।">
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">প্রাইমারি কালার</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={appearance.primary_color || '#FF5A00'}
                                            onChange={(e) => setA('primary_color')(e.target.value)}
                                            className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
                                        />
                                        <input
                                            type="text"
                                            value={appearance.primary_color || '#FF5A00'}
                                            onChange={(e) => setA('primary_color')(e.target.value)}
                                            className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
                                            placeholder="#FF5A00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ── Footer ────────────────────────────────── */}
                {activeTab === 'footer' && (
                    <>
                        <SectionCard title="কন্টাক্ট তথ্য" description="ফুটারে প্রদর্শিত যোগাযোগের তথ্য।">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SettingInput
                                    label="ইমেইল ঠিকানা"
                                    id="contact_email"
                                    type="email"
                                    value={footer.contact_email}
                                    onChange={setF('contact_email')}
                                    placeholder="support@example.com"
                                />
                                <SettingInput
                                    label="ফোন নম্বর"
                                    id="contact_phone"
                                    type="tel"
                                    value={footer.contact_phone}
                                    onChange={setF('contact_phone')}
                                    placeholder="+8801XXXXXXXXX"
                                />
                            </div>
                            <SettingInput
                                label="ঠিকানা"
                                id="contact_address"
                                value={footer.contact_address}
                                onChange={setF('contact_address')}
                                placeholder="Dhaka, Bangladesh"
                            />
                        </SectionCard>

                        <SectionCard title="ফুটার টেক্সট" description="ফুটারের বিবরণ ও কপিরাইট টেক্সট।">
                            <SettingTextarea
                                label="ফুটার বিবরণ"
                                id="footer_description"
                                value={footer.footer_description}
                                onChange={setF('footer_description')}
                                placeholder="সংক্ষিপ্ত বিবরণ লিখুন..."
                            />
                            <SettingInput
                                label="কপিরাইট টেক্সট"
                                id="copyright_text"
                                value={footer.copyright_text}
                                onChange={setF('copyright_text')}
                                placeholder="© 2026 VibeThink — All rights reserved."
                                hint="বছর স্বয়ংক্রিয়ভাবে আপডেট করতে {year} ব্যবহার করুন।"
                            />
                        </SectionCard>

                        <SectionCard title="সোশ্যাল মিডিয়া লিংক" description="ফুটারে সোশ্যাল আইকনগুলির লিংক।">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                                        <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                                    </label>
                                    <input
                                        type="url"
                                        value={footer.social_facebook ?? ''}
                                        onChange={(e) => setF('social_facebook')(e.target.value)}
                                        placeholder="https://facebook.com/..."
                                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                                        <Twitter className="w-3.5 h-3.5 text-sky-500" /> Twitter / X
                                    </label>
                                    <input
                                        type="url"
                                        value={footer.social_twitter ?? ''}
                                        onChange={(e) => setF('social_twitter')(e.target.value)}
                                        placeholder="https://twitter.com/..."
                                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                                        <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram
                                    </label>
                                    <input
                                        type="url"
                                        value={footer.social_instagram ?? ''}
                                        onChange={(e) => setF('social_instagram')(e.target.value)}
                                        placeholder="https://instagram.com/..."
                                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                                        <Linkedin className="w-3.5 h-3.5 text-blue-700" /> LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        value={footer.social_linkedin ?? ''}
                                        onChange={(e) => setF('social_linkedin')(e.target.value)}
                                        placeholder="https://linkedin.com/..."
                                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ── Payment ───────────────────────────────── */}
                {activeTab === 'payment' && (
                    <SectionCard title="মুদ্রা সেটিংস" description="পেমেন্ট সিস্টেমের মুদ্রা কনফিগারেশন।">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SettingInput
                                label="মুদ্রা কোড"
                                id="currency_code"
                                value={payment.currency_code}
                                onChange={setP('currency_code')}
                                placeholder="BDT"
                                hint="ISO 4217 কোড (যেমন: BDT, USD)"
                            />
                            <SettingInput
                                label="মুদ্রা সিম্বল"
                                id="currency_symbol"
                                value={payment.currency_symbol}
                                onChange={setP('currency_symbol')}
                                placeholder="৳"
                            />
                            <SettingSelect
                                label="সিম্বলের অবস্থান"
                                id="currency_position"
                                value={payment.currency_position}
                                onChange={setP('currency_position')}
                                options={[
                                    { value: 'left', label: 'বামে (Left)' },
                                    { value: 'right', label: 'ডানে (Right)' },
                                ]}
                            />
                            <SettingInput
                                label="দশমিক স্থান"
                                id="currency_decimal_places"
                                type="number"
                                value={payment.currency_decimal_places}
                                onChange={setP('currency_decimal_places')}
                                placeholder="0"
                            />
                            <SettingInput
                                label="দশমিক বিভাজক"
                                id="currency_decimal_separator"
                                value={payment.currency_decimal_separator}
                                onChange={setP('currency_decimal_separator')}
                                placeholder="."
                            />
                            <SettingInput
                                label="হাজার বিভাজক"
                                id="currency_thousand_separator"
                                value={payment.currency_thousand_separator}
                                onChange={setP('currency_thousand_separator')}
                                placeholder=","
                            />
                        </div>
                    </SectionCard>
                )}

                {/* ── Email ─────────────────────────────────── */}
                {activeTab === 'email' && (
                    <SectionCard title="SMTP ইমেইল কনফিগারেশন" description="সিস্টেম থেকে ইমেইল পাঠানোর জন্য SMTP সার্ভার সেটিংস।">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SettingSelect
                                label="মেইলার"
                                id="mail_mailer"
                                value={email.mail_mailer}
                                onChange={setE('mail_mailer')}
                                options={[
                                    { value: 'smtp', label: 'SMTP' },
                                    { value: 'sendmail', label: 'Sendmail' },
                                    { value: 'log', label: 'Log (Testing)' },
                                ]}
                            />
                            <SettingInput
                                label="SMTP হোস্ট"
                                id="mail_host"
                                value={email.mail_host}
                                onChange={setE('mail_host')}
                                placeholder="smtp.example.com"
                            />
                            <SettingInput
                                label="SMTP পোর্ট"
                                id="mail_port"
                                type="number"
                                value={email.mail_port}
                                onChange={setE('mail_port')}
                                placeholder="465"
                            />
                            <SettingSelect
                                label="এনক্রিপশন"
                                id="mail_encryption"
                                value={email.mail_encryption}
                                onChange={setE('mail_encryption')}
                                options={[
                                    { value: 'tls', label: 'TLS' },
                                    { value: 'ssl', label: 'SSL' },
                                    { value: '', label: 'None' },
                                ]}
                            />
                            <SettingInput
                                label="ইউজারনেম"
                                id="mail_username"
                                value={email.mail_username}
                                onChange={setE('mail_username')}
                                placeholder="info@example.com"
                            />
                            <div>
                                <label htmlFor="mail_password" className="block text-xs font-semibold text-slate-600 mb-1.5">পাসওয়ার্ড</label>
                                <div className="relative">
                                    <input
                                        id="mail_password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={email.mail_password ?? ''}
                                        onChange={(e) => setE('mail_password')(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <SettingInput
                                label="From ঠিকানা"
                                id="mail_from_address"
                                type="email"
                                value={email.mail_from_address}
                                onChange={setE('mail_from_address')}
                                placeholder="noreply@example.com"
                            />
                            <SettingInput
                                label="From নাম"
                                id="mail_from_name"
                                value={email.mail_from_name}
                                onChange={setE('mail_from_name')}
                                placeholder="VibeThink Academy"
                            />
                        </div>
                    </SectionCard>
                )}
            </div>


            {/* Sticky Save Bar */}
            <SaveBar saving={saving} onSave={handleSave} toast={toast} />
        </div>
    );
}

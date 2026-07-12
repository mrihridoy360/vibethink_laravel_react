import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Camera, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../Contexts/AuthContext';

export default function Settings() {
    const { user, refreshUser } = useAuth();

    // Profile form
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password form
    const [passForm, setPassForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passLoading, setPassLoading] = useState(false);
    const [passSuccess, setPassSuccess] = useState('');
    const [passError, setPassError] = useState('');
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileSuccess('');
        setProfileError('');
        try {
            const res = await axios.put('/api/profile', profileForm);
            if (res.data.success) {
                setProfileSuccess(res.data.message);
                await refreshUser();
                setTimeout(() => setProfileSuccess(''), 3000);
            }
        } catch (err) {
            setProfileError(err.response?.data?.message || 'কিছু একটা সমস্যা হয়েছে।');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setPassLoading(true);
        setPassSuccess('');
        setPassError('');
        try {
            const res = await axios.put('/api/profile/password', passForm);
            if (res.data.success) {
                setPassSuccess(res.data.message);
                setPassForm({ current_password: '', password: '', password_confirmation: '' });
                setTimeout(() => setPassSuccess(''), 3000);
            }
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const firstError = Object.values(errors)[0][0];
                setPassError(firstError);
            } else {
                setPassError(err.response?.data?.message || 'কিছু একটা সমস্যা হয়েছে।');
            }
        } finally {
            setPassLoading(false);
        }
    };

    const toggleShow = (field) => setShowPass(prev => ({ ...prev, [field]: !prev[field] }));

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h2 className="text-base font-bold text-gray-900">সেটিংস</h2>
                <p className="text-sm text-gray-400 mt-0.5">আপনার প্রোফাইল ও নিরাপত্তা তথ্য আপডেট করুন</p>
            </div>

            {/* Avatar Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-extrabold shadow-lg shadow-blue-500/25">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <button
                            className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
                            title="ছবি পরিবর্তন (শীঘ্রই)"
                        >
                            <Camera className="h-2.5 w-2.5" />
                        </button>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {user?.role === 'admin' ? 'অ্যাডমিন' : 'শিক্ষার্থী'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">ব্যক্তিগত তথ্য</h3>
                </div>

                {profileSuccess && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {profileSuccess}
                    </div>
                )}
                {profileError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                        {profileError}
                    </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">পুরো নাম</label>
                        <input
                            type="text"
                            value={profileForm.name}
                            onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ইমেইল</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">ইমেইল পরিবর্তন করা যাবে না।</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফোন নম্বর</label>
                        <input
                            type="text"
                            value={profileForm.phone}
                            onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="+880XXXXXXXXXX"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-500/20"
                        >
                            {profileLoading ? (
                                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : <Save className="h-3.5 w-3.5" />}
                            পরিবর্তন সংরক্ষণ
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <Lock className="h-4 w-4 text-red-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">পাসওয়ার্ড পরিবর্তন</h3>
                </div>

                {passSuccess && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {passSuccess}
                    </div>
                )}
                {passError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                        {passError}
                    </div>
                )}

                <form onSubmit={handlePasswordSave} className="space-y-4">
                    {[
                        { key: 'current', label: 'বর্তমান পাসওয়ার্ড', field: 'current_password' },
                        { key: 'new', label: 'নতুন পাসওয়ার্ড', field: 'password' },
                        { key: 'confirm', label: 'পাসওয়ার্ড নিশ্চিত করুন', field: 'password_confirmation' },
                    ].map(({ key, label, field }) => (
                        <div key={key}>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                            <div className="relative">
                                <input
                                    type={showPass[key] ? 'text' : 'password'}
                                    value={passForm[field]}
                                    onChange={e => setPassForm(f => ({ ...f, [field]: e.target.value }))}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShow(key)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass[key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={passLoading}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-red-500/20"
                        >
                            {passLoading ? (
                                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : <Lock className="h-3.5 w-3.5" />}
                            পাসওয়ার্ড পরিবর্তন করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

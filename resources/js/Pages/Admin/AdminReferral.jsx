import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    GitBranch, Search, X, Loader2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight,
    DollarSign, Users, ShieldAlert, Award, FileText, Settings, Settings2, Eye, RefreshCw,
    Wallet, ChevronLeft, ChevronRight, UserCheck, UserX, AlertTriangle, Calendar
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

// ── Reject Reason Modal ───────────────────────────────────────────────────────
function RejectModal({ userId, onClose, onSaved }) {
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await axios.post(`/api/admin/referrals/users/${userId}/reject`, { reason });
            if (res.data.success) {
                onSaved(res.data.referralUser);
            }
        } catch (err) {
            setError('আবেদনটি রিজেক্ট করতে ত্রুটি হয়েছে।');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">আবেদন রিজেক্ট করার কারণ</h2>
                        <p className="text-xs text-gray-400 mt-0.5">রিজেক্ট করার কারণটি এখানে লিখুন</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-medium">কারণ (Reason)</label>
                        <textarea
                            placeholder="যেমন: ভুল মোবাইল নম্বর বা শর্তাবলী পূরণ না করা..."
                            rows="4"
                            required
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                        />
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বাতিল</button>
                    <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        রিজেক্ট করুন
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Affiliate Details Modal ───────────────────────────────────────────────────
function DetailsModal({ referralUser, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commissionsPage, setCommissionsPage] = useState(1);
    const [transactionsPage, setTransactionsPage] = useState(1);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/referrals/users/${referralUser.id}`);
            if (res.data.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error('Error fetching affiliate details', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [referralUser.id]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-[#f8fafc] rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white rounded-t-3xl shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">এফিলিয়েট বিস্তারিত প্রোফাইল</h2>
                        <p className="text-xs text-gray-400 mt-0.5">সদস্য: {referralUser.user?.name} | রেফার কোড: <span className="font-bold text-blue-600">{referralUser.referral_code}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-400 bg-white">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                        <span className="text-xs font-semibold">বিস্তারিত লোড হচ্ছে...</span>
                    </div>
                ) : data ? (
                    <div className="overflow-y-auto p-6 space-y-6 flex-grow">
                        {/* Stats Widgets */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                <Users className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
                                <span className="text-[10px] text-gray-400 font-bold block uppercase">মোট রেফারেল</span>
                                <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{data.referredUsers?.length ?? 0} জন</h3>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                <Award className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                                <span className="text-[10px] text-gray-400 font-bold block uppercase">মোট অর্জিত</span>
                                <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">৳{data.wallet?.total_earned ?? '0.00'}</h3>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                <Wallet className="h-5 w-5 text-purple-500 mx-auto mb-1.5" />
                                <span className="text-[10px] text-gray-400 font-bold block uppercase">ওয়ালেট ব্যালেন্স</span>
                                <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">৳{data.wallet?.balance ?? '0.00'}</h3>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                <DollarSign className="h-5 w-5 text-amber-500 mx-auto mb-1.5" />
                                <span className="text-[10px] text-gray-400 font-bold block uppercase">মোট উইথড্র</span>
                                <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">৳{data.wallet?.total_withdrawn ?? '0.00'}</h3>
                            </div>
                        </div>

                        {/* Two column lists */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Col: Referred Users List */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold text-gray-900 border-l-4 border-blue-500 pl-2">রেফারকৃত শিক্ষার্থীদের তালিকা ({data.referredUsers?.length ?? 0})</h4>
                                <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100 pr-1.5">
                                    {data.referredUsers?.length > 0 ? (
                                        data.referredUsers.map(u => (
                                            <div key={u.id} className="py-2.5 flex justify-between items-center text-xs">
                                                <div>
                                                    <span className="font-bold text-gray-800">{u.name}</span>
                                                    <p className="text-[10px] text-gray-400">{u.email}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-semibold">{new Date(u.created_at).toLocaleDateString('bn-BD')}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-8">কোনো রেফারেল পাওয়া যায়নি।</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Col: Commissions List */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold text-gray-900 border-l-4 border-emerald-500 pl-2">রেফারেল কমিশন লগ</h4>
                                <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100 pr-1.5">
                                    {data.commissions?.data?.length > 0 ? (
                                        data.commissions.data.map(comm => (
                                            <div key={comm.id} className="py-2.5 flex justify-between items-start text-xs">
                                                <div>
                                                    <span className="font-bold text-gray-800">৳{comm.commission_amount}</span>
                                                    <p className="text-[10px] text-gray-400">{comm.course?.title || 'Course'}</p>
                                                    <p className="text-[9px] text-gray-400">ক্রেতা: {comm.referred?.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    {comm.status === 'credited' ? (
                                                        <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-150 rounded text-[9px] font-bold">Credited</span>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-[9px] font-bold">Pending</span>
                                                    )}
                                                    <p className="text-[9px] text-gray-400 mt-1">{new Date(comm.created_at).toLocaleDateString('bn-BD')}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-8">কোনো কমিশনের রেকর্ড নেই।</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Full Width Wallet Transactions */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-gray-900 border-l-4 border-purple-500 pl-2">ওয়ালেট লেনদেন হিস্ট্রি</h4>
                            <div className="overflow-x-auto">
                                {data.transactions?.data?.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500">
                                                <th className="py-2.5 px-4">বিবরণ</th>
                                                <th className="py-2.5 px-4">ধরণ</th>
                                                <th className="py-2.5 px-4">পরিমাণ</th>
                                                <th className="py-2.5 px-4">ব্যালেন্স</th>
                                                <th className="py-2.5 px-4 text-center">তারিখ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                            {data.transactions.data.map(tx => (
                                                <tr key={tx.id}>
                                                    <td className="py-2.5 px-4 font-medium text-gray-900">{tx.description}</td>
                                                    <td className="py-2.5 px-4">
                                                        {tx.type === 'credit' ? (
                                                            <span className="text-green-600 font-bold">Credit</span>
                                                        ) : (
                                                            <span className="text-red-500 font-bold">Debit</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-4 font-bold text-gray-800">৳{tx.amount}</td>
                                                    <td className="py-2.5 px-4 text-gray-500">৳{tx.balance_after}</td>
                                                    <td className="py-2.5 px-4 text-center text-gray-400">{new Date(tx.created_at).toLocaleDateString('bn-BD')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-8">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center bg-white rounded-b-3xl">
                        <p className="text-sm text-gray-400">তথ্য পাওয়া যায়নি।</p>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0 bg-white rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বন্ধ করুন</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminReferral() {
    const [activeSubTab, setActiveSubTab] = useState('users'); // users, commissions, settings

    // Referral Users states
    const [referralUsers, setReferralUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersPagination, setUsersPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [usersPage, setUsersPage] = useState(1);
    const [usersSearch, setUsersSearch] = useState('');
    const [usersStatusFilter, setUsersStatusFilter] = useState('');

    // Commissions states
    const [commissions, setCommissions] = useState([]);
    const [commissionsLoading, setCommissionsLoading] = useState(true);
    const [commissionsPagination, setCommissionsPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [commissionsPage, setCommissionsPage] = useState(1);
    const [commissionsSearch, setCommissionsSearch] = useState('');
    const [commissionsStatusFilter, setCommissionsStatusFilter] = useState('');
    const [totalPaid, setTotalPaid] = useState('0.00');
    const [totalPending, setTotalPending] = useState('0.00');

    // Settings states
    const [settings, setSettings] = useState({
        commission_percentage: 10,
        auto_approve: false,
        is_active: true,
        minimum_payout: 100,
        terms_conditions: '',
    });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    // Modals
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, user: null });
    const [rejectModal, setRejectModal] = useState({ isOpen: false, userId: null });
    const [toast, setToast] = useState(null);

    // Fetch Stats & Users
    const fetchStatsAndUsers = async (page = 1, search = '', status = '') => {
        setUsersLoading(true);
        try {
            const res = await axios.get('/api/admin/referrals', {
                params: { page, search, status }
            });
            if (res.data.success) {
                setReferralUsers(res.data.referralUsers.data);
                setStats(res.data.stats);
                setUsersPagination({
                    current_page: res.data.referralUsers.current_page,
                    last_page: res.data.referralUsers.last_page,
                    total: res.data.referralUsers.total
                });
            }
        } catch (err) {
            console.error('Error fetching referral users', err);
        } finally {
            setUsersLoading(false);
        }
    };

    // Fetch Commissions
    const fetchCommissions = async (page = 1, search = '', status = '') => {
        setCommissionsLoading(true);
        try {
            const res = await axios.get('/api/admin/referrals/commissions', {
                params: { page, search, status }
            });
            if (res.data.success) {
                setCommissions(res.data.commissions.data);
                setTotalPaid(res.data.totalPaid);
                setTotalPending(res.data.totalPending);
                setCommissionsPagination({
                    current_page: res.data.commissions.current_page,
                    last_page: res.data.commissions.last_page,
                    total: res.data.commissions.total
                });
            }
        } catch (err) {
            console.error('Error fetching commissions', err);
        } finally {
            setCommissionsLoading(false);
        }
    };

    // Fetch Settings
    const fetchSettings = async () => {
        setSettingsLoading(true);
        try {
            const res = await axios.get('/api/admin/referrals/settings');
            if (res.data.success) {
                setSettings(res.data.settings);
            }
        } catch (err) {
            console.error('Error fetching settings', err);
        } finally {
            setSettingsLoading(false);
        }
    };

    useEffect(() => {
        if (activeSubTab === 'users') {
            fetchStatsAndUsers(usersPage, usersSearch, usersStatusFilter);
        } else if (activeSubTab === 'commissions') {
            fetchCommissions(commissionsPage, commissionsSearch, commissionsStatusFilter);
        } else if (activeSubTab === 'settings') {
            fetchSettings();
        }
    }, [activeSubTab, usersPage, usersSearch, usersStatusFilter, commissionsPage, commissionsSearch, commissionsStatusFilter]);

    // Handle Settings Save
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await axios.post('/api/admin/referrals/settings', settings);
            if (res.data.success) {
                setSettings(res.data.settings);
                setToast({ type: 'success', message: 'রেফারেল সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।' });
        } finally {
            setSavingSettings(false);
        }
    };

    // Approve user
    const handleApproveUser = async (id) => {
        if (!confirm('আপনি কি এই ব্যবহারকারীকে এফিলিয়েট হিসেবে অনুমোদন করতে চান?')) return;
        try {
            const res = await axios.post(`/api/admin/referrals/users/${id}/approve`);
            if (res.data.success) {
                fetchStatsAndUsers(usersPage, usersSearch, usersStatusFilter);
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'আবেদন অনুমোদন করতে ত্রুটি হয়েছে।' });
        }
    };

    // Reject user finished
    const handleRejectSaved = (updatedUser) => {
        setRejectModal({ isOpen: false, userId: null });
        fetchStatsAndUsers(usersPage, usersSearch, usersStatusFilter);
        setToast({ type: 'success', message: 'এফিলিয়েট আবেদনটি রিজেক্ট করা হয়েছে।' });
    };

    // Suspend user
    const handleSuspendUser = async (id) => {
        if (!confirm('আপনি কি এই এফিলিয়েটের সদস্যপদ সাময়িকভাবে স্থগিত (Suspend) করতে চান?')) return;
        try {
            const res = await axios.post(`/api/admin/referrals/users/${id}/suspend`);
            if (res.data.success) {
                fetchStatsAndUsers(usersPage, usersSearch, usersStatusFilter);
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'হালনাগাদ করতে ব্যর্থ হয়েছে।' });
        }
    };

    // Reset User application
    const handleResetUser = async (id) => {
        if (!confirm('আবেদন রিসেট করলে এটি সিস্টেম থেকে মুছে যাবে এবং ব্যবহারকারী পুনরায় নতুন করে আবেদন করতে পারবেন। আপনি কি এটি করতে চান?')) return;
        try {
            const res = await axios.delete(`/api/admin/referrals/users/${id}/reset`);
            if (res.data.success) {
                fetchStatsAndUsers(usersPage, usersSearch, usersStatusFilter);
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'আবেদন রিসেট করতে সমস্যা হয়েছে।' });
        }
    };

    // Credit manual commission
    const handleCreditCommission = async (id) => {
        if (!confirm('আপনি কি নিশ্চিতভাবে এই কমিশনটি এফিলিয়েটের ওয়ালেটে পাঠাতে চান? এটি সরাসরি ওয়ালেটে যোগ হয়ে যাবে।')) return;
        try {
            const res = await axios.post(`/api/admin/referrals/commissions/${id}/credit`);
            if (res.data.success) {
                fetchCommissions(commissionsPage, commissionsSearch, commissionsStatusFilter);
                setToast({ type: 'success', message: res.data.message });
            }
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.message || 'কমিশন ওয়ালেটে জমা করতে ব্যর্থ হয়েছে।' });
        }
    };

    return (
        <div className="space-y-6">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Header Area */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <GitBranch className="h-6 w-6 text-blue-600" /> রেফারেল ও এফিলিয়েট প্রোগ্রাম
                        </h2>
                        <p className="text-xs text-gray-400 mt-1 font-light">Affiliate প্রোগ্রামে অংশগ্রহণকারী ব্যবহারকারীদের তালিকা, কমিশন ট্র্যাকিং ওPayout সেটিংস কনফিগার করুন</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {activeSubTab === 'users' && stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">মোট এফিলিয়েট</span>
                        <h3 className="text-xl font-extrabold text-gray-900 mt-1">{stats.total_referral_users} জন</h3>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">অনুমোদিত এফিলিয়েট</span>
                        <h3 className="text-xl font-extrabold text-gray-950 mt-1">{stats.approved_users} জন</h3>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">অপেক্ষমান আবেদন</span>
                        <h3 className="text-xl font-extrabold text-amber-600 mt-1">{stats.pending_users} টি</h3>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">সফল কনভার্সন</span>
                        <h3 className="text-xl font-extrabold text-green-600 mt-1">{stats.total_referrals} বার</h3>
                    </div>
                </div>
            )}

            {/* Commissions Overview stats */}
            {activeSubTab === 'commissions' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">টোটাল কমিশন পেইড (ওয়ালেটে স্থানান্তরিত)</span>
                        <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">৳{totalPaid}</h3>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">পেন্ডিং কমিশন (অপেক্ষমান)</span>
                        <h3 className="text-2xl font-extrabold text-amber-600 mt-1">৳{totalPending}</h3>
                    </div>
                </div>
            )}

            {/* Tabs & Search Filters */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="flex bg-white p-1 rounded-2xl border border-gray-150 shadow-sm shrink-0 select-none self-start">
                    <button
                        onClick={() => { setActiveSubTab('users'); setUsersPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Users className="h-3.5 w-3.5" /> এফিলিয়েট তালিকা
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('commissions'); setCommissionsPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'commissions' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <DollarSign className="h-3.5 w-3.5" /> কমিশন ট্র্যাকার
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('settings'); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Settings className="h-3.5 w-3.5" /> রেফারেল সেটিংস
                    </button>
                </div>

                {/* Filters */}
                {activeSubTab !== 'settings' && (
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
                        {activeSubTab === 'users' ? (
                            <>
                                <div className="relative min-w-0 sm:max-w-xs flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="নাম, ইমেইল বা কোড দিয়ে খুঁজুন..."
                                        value={usersSearch}
                                        onChange={e => { setUsersSearch(e.target.value); setUsersPage(1); }}
                                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                                    />
                                </div>
                                <select
                                    value={usersStatusFilter}
                                    onChange={e => { setUsersStatusFilter(e.target.value); setUsersPage(1); }}
                                    className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                                >
                                    <option value="">সব স্ট্যাটাস</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </>
                        ) : (
                            <>
                                <div className="relative min-w-0 sm:max-w-xs flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="রেফারার এর নাম খুঁজুন..."
                                        value={commissionsSearch}
                                        onChange={e => { setCommissionsSearch(e.target.value); setCommissionsPage(1); }}
                                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                                    />
                                </div>
                                <select
                                    value={commissionsStatusFilter}
                                    onChange={e => { setCommissionsStatusFilter(e.target.value); setCommissionsPage(1); }}
                                    className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                                >
                                    <option value="">সব কমিশন</option>
                                    <option value="pending">Pending</option>
                                    <option value="credited">Credited</option>
                                </select>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* List Containers */}
            {activeSubTab === 'users' ? (
                /* ── AFFILIATE LISTS TABLE ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {usersLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">এফিলিয়েট তালিকা লোড হচ্ছে...</span>
                        </div>
                    ) : referralUsers.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                            <th className="py-4 px-6">ব্যবহারকারী</th>
                                            <th className="py-4 px-6">রেফারেল কোড</th>
                                            <th className="py-4 px-6">পেমেন্ট মেথড</th>
                                            <th className="py-4 px-6 text-center">স্ট্যাটাস</th>
                                            <th className="py-4 px-6 text-center">আবেদনের তারিখ</th>
                                            <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                        {referralUsers.map(ru => (
                                            <tr key={ru.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">{ru.user?.name || 'অজ্ঞাত ব্যবহারকারী'}</div>
                                                    <p className="text-[10px] text-gray-400">{ru.user?.email}</p>
                                                    <p className="text-[10px] text-gray-400 font-semibold">{ru.phone}</p>
                                                </td>
                                                <td className="py-4 px-6 font-mono font-bold text-blue-600 text-sm">
                                                    {ru.referral_code}
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 font-semibold">
                                                    <span className="text-[10px] text-gray-500 font-bold block uppercase">{ru.payment_method || 'N/A'}</span>
                                                    <span className="text-[10px] text-gray-400">{ru.payment_account}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        {ru.status === 'approved' && (
                                                            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] rounded-lg font-bold border border-green-200">Approved</span>
                                                        )}
                                                        {ru.status === 'pending' && (
                                                            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[10px] rounded-lg font-bold border border-yellow-250">Pending</span>
                                                        )}
                                                        {ru.status === 'rejected' && (
                                                            <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] rounded-lg font-bold border border-red-150" title={ru.rejection_reason}>Rejected</span>
                                                        )}
                                                        {ru.status === 'suspended' && (
                                                            <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] rounded-lg font-bold border border-gray-200">Suspended</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center text-gray-500 font-semibold">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>{new Date(ru.created_at).toLocaleDateString('bn-BD')}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {ru.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApproveUser(ru.id)}
                                                                    className="p-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition-all cursor-pointer"
                                                                    title="অনুমোদন করুন"
                                                                >
                                                                    <UserCheck className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setRejectModal({ isOpen: true, userId: ru.id })}
                                                                    className="p-1.5 rounded-lg border border-red-150 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                                                    title="বাতিল করুন"
                                                                >
                                                                    <UserX className="h-3.5 w-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {ru.status === 'approved' && (
                                                            <button
                                                                onClick={() => handleSuspendUser(ru.id)}
                                                                className="px-2.5 py-1 text-[10px] font-bold border border-red-150 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                স্থগিত
                                                            </button>
                                                        )}
                                                        {ru.status === 'rejected' && (
                                                            <button
                                                                onClick={() => handleResetUser(ru.id)}
                                                                className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                রিসেট করুন
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setDetailsModal({ isOpen: true, user: ru })}
                                                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                            title="বিস্তারিত দেখুন"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {usersPagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                    <span>সর্বমোট {usersPagination.total} টি অ্যাপ্লিকেশনের মধ্যে পৃষ্ঠা {usersPagination.current_page}/{usersPagination.last_page}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                                            disabled={usersPagination.current_page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পূর্ববর্তী
                                        </button>
                                        <button
                                            onClick={() => setUsersPage(p => Math.min(usersPagination.last_page, p + 1))}
                                            disabled={usersPagination.current_page === usersPagination.last_page}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পরবর্তী
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো এফিলিয়েট রেকর্ড পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            ) : activeSubTab === 'commissions' ? (
                /* ── COMMISSIONS TRACKER ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {commissionsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">কমিশন তালিকা লোড হচ্ছে...</span>
                        </div>
                    ) : commissions.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                            <th className="py-4 px-6">এফিলিয়েট (Referrer)</th>
                                            <th className="py-4 px-6">ক্রেতা (Referred)</th>
                                            <th className="py-4 px-6">কোর্স তথ্য</th>
                                            <th className="py-4 px-6">কমিশন পরিমাণ</th>
                                            <th className="py-4 px-6 text-center">স্ট্যাটাস</th>
                                            <th className="py-4 px-6 text-center">তারিখ</th>
                                            <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                        {commissions.map(comm => (
                                            <tr key={comm.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">{comm.referrer?.name || 'অজ্ঞাত ব্যবহারকারী'}</div>
                                                    <span className="text-[10px] text-gray-400 block">{comm.referrer?.email}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">{comm.referred?.name || 'অজ্ঞাত ক্রেতা'}</div>
                                                    <span className="text-[10px] text-gray-400 block">{comm.referred?.email}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-gray-800 block truncate max-w-[180px]" title={comm.course?.title}>{comm.course?.title || 'কোর্স'}</span>
                                                    <span className="text-[10px] text-gray-400">কোর্স ফি: ৳{comm.course_amount}</span>
                                                </td>
                                                <td className="py-4 px-6 font-bold text-gray-900">
                                                    <div>৳{comm.commission_amount}</div>
                                                    <span className="text-[9px] text-blue-600">({comm.commission_percentage}%)</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        {comm.status === 'credited' ? (
                                                            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] rounded-lg font-bold border border-green-200">Credited</span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[10px] rounded-lg font-bold border border-yellow-250">Pending</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center text-gray-500 font-semibold">
                                                    <span>{new Date(comm.created_at).toLocaleDateString('bn-BD')}</span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {comm.status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleCreditCommission(comm.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer mx-auto"
                                                        >
                                                            ওয়ালেটে পাঠান
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px] font-semibold">পাঠানো হয়েছে</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {commissionsPagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                    <span>সর্বমোট {commissionsPagination.total} টি কমিশনের মধ্যে পৃষ্ঠা {commissionsPagination.current_page}/{commissionsPagination.last_page}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCommissionsPage(p => Math.max(1, p - 1))}
                                            disabled={commissionsPagination.current_page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পূর্ববর্তী
                                        </button>
                                        <button
                                            onClick={() => setCommissionsPage(p => Math.min(commissionsPagination.last_page, p + 1))}
                                            disabled={commissionsPagination.current_page === commissionsPagination.last_page}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পরবর্তী
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <DollarSign className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো কমিশনের রেকর্ড নেই।</p>
                        </div>
                    )}
                </div>
            ) : (
                /* ── REFERRAL SETTINGS FORM ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 max-w-2xl">
                    {settingsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">রেফারেল সেটিংস লোড হচ্ছে...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                                <Settings2 className="h-5 w-5 text-blue-600" />
                                <h3 className="text-sm font-bold text-gray-900">গ্লোবাল প্রোগ্রাম সেটিংস</h3>
                            </div>

                            {/* Two Columns: Commission & Minimum Payout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">কমিশন পার্সেন্টেজ (%) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        value={settings.commission_percentage}
                                        onChange={e => setSettings(p => ({ ...p, commission_percentage: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-bold text-gray-800 bg-white"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">প্রতিটি রেফারেল কোর্স সেল এর উপর এফিলিয়েট কত শতাংশ কমিশন পাবে</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">ন্যূনতমPayout থ্রেশহোল্ড (৳)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.minimum_payout}
                                        onChange={e => setSettings(p => ({ ...p, minimum_payout: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-bold text-gray-800 bg-white"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">এফিলিয়েট মেম্বার সর্বনিম্ন কত টাকা ওয়ালেটে থাকলেPayout রিকোয়েস্ট করতে পারবে</p>
                                </div>
                            </div>

                            {/* Settings Switches */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl">
                                    <div>
                                        <span className="text-xs font-bold text-gray-800">অটো অ্যাপ্রুভাল</span>
                                        <p className="text-[9px] text-gray-400 mt-0.5">আবেদন করার সাথে সাথে এপ্রুভ হবে</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSettings(p => ({ ...p, auto_approve: !p.auto_approve }))}
                                        className="text-blue-600 focus:outline-none cursor-pointer shrink-0"
                                    >
                                        {settings.auto_approve ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl">
                                    <div>
                                        <span className="text-xs font-bold text-gray-800">প্রোগ্রাম অ্যাক্টিভ</span>
                                        <p className="text-[9px] text-gray-400 mt-0.5">রেফারেল প্রোগ্রামটি চালু থাকবে কি না</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSettings(p => ({ ...p, is_active: !p.is_active }))}
                                        className="text-blue-600 focus:outline-none cursor-pointer shrink-0"
                                    >
                                        {settings.is_active ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 font-semibold">শর্তাবলী ও নির্দেশিকা (Terms & Conditions)</label>
                                <textarea
                                    placeholder="রেফারেল প্রোগ্রামের নিয়ম কানুন লিখুন যা স্টুডেন্ট ড্যাশবোর্ডে শো করবে..."
                                    rows="6"
                                    value={settings.terms_conditions || ''}
                                    onChange={e => setSettings(p => ({ ...p, terms_conditions: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                                >
                                    {savingSettings && <Loader2 className="h-3 w-3 animate-spin" />}
                                    সেটিংস সংরক্ষণ করুন
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Reject Reason Modal */}
            {rejectModal.isOpen && (
                <RejectModal
                    userId={rejectModal.userId}
                    onClose={() => setRejectModal({ isOpen: false, userId: null })}
                    onSaved={handleRejectSaved}
                />
            )}

            {/* Details Modal */}
            {detailsModal.isOpen && (
                <DetailsModal
                    referralUser={detailsModal.user}
                    onClose={() => setDetailsModal({ isOpen: false, user: null })}
                />
            )}
        </div>
    );
}

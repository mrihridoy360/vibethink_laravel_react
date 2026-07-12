import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import {
    LayoutDashboard, BookOpen, Bell, Gift, Star, Wrench, ShoppingBag,
    Award, CreditCard, Users, Wallet, MessageSquare, Ticket, Settings,
    ShieldAlert, LogOut, ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';

const MENU_ITEMS = [
    { key: 'dashboard',       label: 'ড্যাশবোর্ড',           icon: LayoutDashboard },
    { key: 'enrolled',        label: 'ইনরোলড কোর্স',         icon: BookOpen },
    { key: 'notice',          label: 'নোটিশ',                icon: Bell },
    { key: 'giftbox',         label: 'গিফট বক্স',            icon: Gift },
    { key: 'review',          label: 'রিভিউ এবং আর্ন করুন', icon: Star },
    { key: 'tools',           label: 'প্রয়োজনীয় টুলস',      icon: Wrench },
    { key: 'products',        label: 'পণ্য',                  icon: ShoppingBag },
    { key: 'certificates',    label: 'সার্টিফিকেট',           icon: Award },
    { key: 'billing',         label: 'বিলিং',                 icon: CreditCard },
    { key: 'referral',        label: 'রেফারেল',               icon: Users },
    { key: 'wallet',          label: 'ওয়ালেট',               icon: Wallet },
];

const SERVICE_ITEMS = [
    { key: 'support_group',   label: 'সাপোর্ট গ্রুপ',         icon: MessageSquare },
    { key: 'support_tickets', label: 'সাপোর্ট টিকেট',         icon: Ticket },
    { key: 'settings',        label: 'সেটিংস',                icon: Settings },
];

export default function Sidebar({ activeTab, sidebarCollapsed, setSidebarCollapsed }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { settings } = useSiteSettings();

    const siteLogo = settings?.appearance?.site_logo || null;
    const siteFavicon = settings?.appearance?.site_favicon || null;
    const siteName = settings?.general?.site_name || 'VibeThink';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
            <Link
                to={item.key === 'dashboard' ? '/dashboard' : `/dashboard/${item.key}`}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
            >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
        );
    };

    return (
        <>
            {!sidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-40 md:hidden animate-fadeIn"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ${
                sidebarCollapsed 
                    ? '-translate-x-full md:translate-x-0 md:w-20' 
                    : 'w-64 translate-x-0'
            }`}>
            {/* Brand Logo & Toggle */}
            <div className="h-16 px-4 flex items-center justify-between shrink-0 border-b border-gray-100">
                <Link to="/" className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-2.5 pl-2'}`}>
                    {sidebarCollapsed ? (
                        siteFavicon ? (
                            <img
                                src={siteFavicon}
                                alt="Favicon"
                                className="h-8 w-8 object-contain"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
                                {siteName.charAt(0).toUpperCase()}
                            </div>
                        )
                    ) : (
                        siteLogo ? (
                            <img
                                src={siteLogo}
                                alt={siteName}
                                className="h-8 max-w-[150px] object-contain"
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm">
                                    {siteName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                                    {siteName}
                                </span>
                            </div>
                        )
                    )}
                </Link>
                {!sidebarCollapsed && (
                    <button
                        onClick={() => setSidebarCollapsed(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title="Collapse Sidebar"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Nav Links */}
            <div className="flex-grow overflow-y-auto no-scrollbar px-4 py-4 space-y-6">
                {/* Menu */}
                <div>
                    {!sidebarCollapsed && (
                        <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                            মেনু
                        </span>
                    )}
                    <div className="space-y-1">
                        {MENU_ITEMS.map(item => <NavItem key={item.key} item={item} />)}
                    </div>
                </div>

                {/* Service */}
                <div>
                    {!sidebarCollapsed && (
                        <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                            সার্ভিস
                        </span>
                    )}
                    <div className="space-y-1">
                        {SERVICE_ITEMS.map(item => <NavItem key={item.key} item={item} />)}
                    </div>
                </div>

                {/* Admin Panel (conditional) */}
                {user?.role === 'admin' && (
                    <div>
                        {!sidebarCollapsed && (
                            <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                                ADMIN
                            </span>
                        )}
                        <div className="space-y-1">
                            <Link
                                to="/admin"
                                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all`}
                                title={sidebarCollapsed ? 'এডমিন প্যানেল' : undefined}
                            >
                                <ShieldAlert className="h-5 w-5 shrink-0" />
                                {!sidebarCollapsed && <span>এডমিন প্যানেল</span>}
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Footer User & Toggle */}
            <div className="p-4 border-t border-gray-100 flex flex-col gap-2 shrink-0 relative">
                {sidebarCollapsed && (
                    <button
                        onClick={() => setSidebarCollapsed(false)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors mx-auto cursor-pointer"
                        title="Expand Sidebar"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}

                {showUserMenu && (
                    <>
                        {/* Backdrop to close dropdown on click outside */}
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowUserMenu(false)}
                        />
                        {/* Dropdown Menu */}
                        <div className={`absolute ${sidebarCollapsed ? 'left-2 w-40' : 'left-4 right-4'} bottom-16 bg-white border border-gray-200/80 rounded-2xl shadow-xl p-1.5 z-20`}>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            >
                                <LogOut className="h-4.5 w-4.5 shrink-0 text-red-500" />
                                <span>লগআউট</span>
                            </button>
                        </div>
                    </>
                )}

                {/* User avatar details */}
                {sidebarCollapsed ? (
                    <div 
                        onClick={() => setShowUserMenu(p => !p)}
                        className="flex items-center justify-center cursor-pointer hover:bg-slate-100 p-1.5 rounded-xl transition-colors shrink-0"
                        title="ইউজার মেনু"
                    >
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowUserMenu(p => !p)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0 cursor-pointer"
                            title="ইউজার মেনু"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </aside>
        </>
    );
}

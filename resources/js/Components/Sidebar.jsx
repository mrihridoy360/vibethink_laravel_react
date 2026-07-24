import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import {
    LayoutDashboard, BookOpen, Bell, Gift, Star, Wrench, ShoppingBag,
    Award, CreditCard, Users, Wallet, MessageSquare, Ticket, Settings,
    ShieldAlert, ChevronLeft, ChevronRight
} from 'lucide-react';

const MENU_ITEMS = [
    { key: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { key: 'enrolled', label: 'ইনরোলড কোর্স', icon: BookOpen },
    { key: 'notice', label: 'নোটিশ', icon: Bell },
    { key: 'giftbox', label: 'গিফট বক্স', icon: Gift },
    { key: 'review', label: 'রিভিউ এবং আর্ন করুন', icon: Star },
    { key: 'tools', label: 'প্রয়োজনীয় টুলস', icon: Wrench },
    { key: 'products', label: 'পণ্য', icon: ShoppingBag },
    { key: 'certificates', label: 'সার্টিফিকেট', icon: Award },
    { key: 'billing', label: 'বিলিং', icon: CreditCard },
    { key: 'affiliate', label: 'এফিলিয়েট', icon: Users },
    { key: 'wallet', label: 'ওয়ালেট', icon: Wallet },
];

const SERVICE_ITEMS = [
    { key: 'support_group', label: 'সাপোর্ট গ্রুপ', icon: MessageSquare },
    { key: 'support_tickets', label: 'সাপোর্ট টিকেট', icon: Ticket },
    { key: 'settings', label: 'সেটিংস', icon: Settings },
];

export default function Sidebar({ activeTab = 'dashboard', sidebarCollapsed, setSidebarCollapsed }) {
    const { user } = useAuth();
    const { settings } = useSiteSettings();

    const siteLogo = settings?.appearance?.site_logo || null;
    const siteFavicon = settings?.appearance?.site_favicon || null;
    const siteName = settings?.general?.site_name || 'VibeThink';

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key || (item.key === 'affiliate' && activeTab === 'referral');
        return (
            <Link
                to={item.key === 'dashboard' ? '/dashboard' : `/dashboard/${item.key}`}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
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

            <aside className={`bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 z-50 ${sidebarCollapsed
                    ? 'w-20 -translate-x-full md:translate-x-0 md:w-20 fixed md:static inset-y-0 left-0 shadow-xl md:shadow-none'
                    : 'w-64 translate-x-0 fixed md:static inset-y-0 left-0 shadow-xl md:shadow-none'
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

                {/* Nav */}
                <div className="flex-grow overflow-y-auto no-scrollbar px-4 py-4 space-y-6">
                    {/* Menu */}
                    <div>
                        {!sidebarCollapsed && (
                            <span className="px-3 text-sm font-bold uppercase tracking-wider text-gray-400 block mb-2">
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
                            <span className="px-3 text-sm font-bold uppercase tracking-wider text-gray-400 block mb-2">
                                সার্ভিস
                            </span>
                        )}
                        <div className="space-y-1">
                            {SERVICE_ITEMS.map(item => <NavItem key={item.key} item={item} />)}
                        </div>
                    </div>

                    {/* Admin (conditional) */}
                    {user?.role === 'admin' && (
                        <div>
                            {!sidebarCollapsed && (
                                <span className="px-3 text-sm font-bold uppercase tracking-wider text-gray-400 block mb-2">
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

                {/* Sidebar Footer Toggle (when collapsed) */}
                {sidebarCollapsed && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-center shrink-0">
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                            title="Expand Sidebar"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}


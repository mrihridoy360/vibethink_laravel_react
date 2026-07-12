import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, ExternalLink, BookOpen, Users } from 'lucide-react';

// Platform config: icon colors
const platformConfig = {
    facebook:  { color: '#1877F2', bg: 'bg-blue-50',   label: 'Facebook Group' },
    telegram:  { color: '#2AABEE', bg: 'bg-sky-50',    label: 'Telegram Group' },
    whatsapp:  { color: '#25D366', bg: 'bg-green-50',  label: 'WhatsApp Group' },
    discord:   { color: '#5865F2', bg: 'bg-indigo-50', label: 'Discord Server' },
    slack:     { color: '#4A154B', bg: 'bg-purple-50', label: 'Slack Workspace' },
    default:   { color: '#6b7280', bg: 'bg-gray-50',   label: 'সাপোর্ট গ্রুপ' },
};

function PlatformIcon({ platform, size = 24 }) {
    const p = platform?.toLowerCase();
    if (p === 'facebook') return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
    if (p === 'telegram') return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#2AABEE">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
    );
    if (p === 'whatsapp') return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
    );
    return <MessageSquare size={size} color={platformConfig.default.color} />;
}

export default function SupportGroup() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('/api/support-groups');
                if (res.data.success) setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3].map(n => <div key={n} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    const groups = data?.groups || [];
    const generalGroups = data?.general_groups || [];
    const allGroups = [...groups, ...generalGroups];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-base font-bold text-gray-900">সাপোর্ট গ্রুপ</h2>
                <p className="text-sm text-gray-400 mt-0.5">আমাদের কমিউনিটি গ্রুপে যোগ দিন এবং সাহায্য পান</p>
            </div>

            {allGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
                    <div className="p-5 bg-gray-50 rounded-full mb-4 border border-gray-100">
                        <Users className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-600">কোনো সাপোর্ট গ্রুপ নেই</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        কোর্সে এনরোল করলে সংশ্লিষ্ট সাপোর্ট গ্রুপের লিংক এখানে দেখাবে।
                    </p>
                </div>
            ) : (
                <>
                    {/* Course Groups */}
                    {groups.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">কোর্স সাপোর্ট গ্রুপ</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {groups.map(group => {
                                    const platform = group.platform?.toLowerCase();
                                    const cfg = platformConfig[platform] || platformConfig.default;
                                    return (
                                        <div key={group.id} className={`rounded-2xl border border-gray-100 p-5 ${cfg.bg} hover:shadow-md transition-all`}>
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                                    <PlatformIcon platform={platform} size={22} />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm font-bold text-gray-900">{cfg.label}</p>
                                                    <p className="text-[11px] text-gray-500 truncate">{group.course?.title}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={group.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm"
                                                style={{ backgroundColor: cfg.color }}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" /> গ্রুপে যোগ দিন
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* General Groups */}
                    {generalGroups.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">সাধারণ কমিউনিটি</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {generalGroups.map(group => {
                                    const platform = group.platform?.toLowerCase();
                                    const cfg = platformConfig[platform] || platformConfig.default;
                                    return (
                                        <div key={group.id} className={`rounded-2xl border border-gray-100 p-5 ${cfg.bg} hover:shadow-md transition-all`}>
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                                    <PlatformIcon platform={platform} size={22} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{cfg.label}</p>
                                                    <p className="text-[11px] text-gray-500">সাধারণ সাপোর্ট</p>
                                                </div>
                                            </div>
                                            <a
                                                href={group.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm"
                                                style={{ backgroundColor: cfg.color }}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" /> গ্রুপে যোগ দিন
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

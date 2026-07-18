import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageSquare, Facebook, Youtube, Instagram, Twitter, Linkedin, Phone } from 'lucide-react';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';

export default function Footer() {
    const { settings } = useSiteSettings();

    const general = settings?.general || {};
    const appearance = settings?.appearance || {};
    const footer = settings?.footer || {};

    const siteName = general.site_name || 'VibeThink';
    const footerDesc = footer.footer_description || 'বাংলাদেশের প্র্যাকটিক্যাল লার্নিং প্ল্যাটফর্ম। শিখুন, তৈরি করুন এবং এগিয়ে যান।';
    const email = footer.contact_email || null;
    const phone = footer.contact_phone || null;
    const address = footer.contact_address || 'Dhaka, Bangladesh';
    const copyright = footer.copyright_text || `© ${new Date().getFullYear()} ${siteName.toUpperCase()} - ALL RIGHTS RESERVED`;
    const footerLogo = appearance.footer_logo || appearance.site_logo || null;
    const footerWatermark = footer.footer_watermark || '';

    const socials = [
        { key: 'social_facebook', icon: Facebook, href: footer.social_facebook || null },
        { key: 'social_twitter', icon: Twitter, href: footer.social_twitter || null },
        { key: 'social_instagram', icon: Instagram, href: footer.social_instagram || null },
        { key: 'social_linkedin', icon: Linkedin, href: footer.social_linkedin || null },
    ].filter((s) => s.href);

    // Format copyright: support {year} placeholder
    const copyrightText = copyright.replace('{year}', new Date().getFullYear());

    return (
        <footer className="relative w-full bg-[#FCFDFE] border-t border-slate-200/80 pt-16 pb-8 overflow-hidden footer-grid shrink-0">

            {/* Upper Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-6">

                    {/* Branding Info Column */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                        {/* Logo */}
                        <Link to="/" className="flex items-center w-fit">
                            {footerLogo ? (
                                <img
                                    src={footerLogo}
                                    alt={siteName}
                                    className="h-9 max-w-[160px] object-contain"
                                />
                            ) : (
                                <>
                                    <div className="w-9 h-9 rounded-lg theme-primary-bg flex items-center justify-center font-black text-white text-xl shadow-sm">
                                        {siteName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight ml-2.5">
                                        {siteName}.
                                    </span>
                                </>
                            )}
                        </Link>

                        {/* Description */}
                        <p className="text-slate-500 text-[13.5px] leading-relaxed max-w-sm font-medium">
                            {footerDesc}
                        </p>

                        {/* Contact details */}
                        <div className="flex flex-col gap-2 mt-2">
                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    className="flex items-center gap-3 text-sm font-semibold text-slate-500 theme-primary-text-hover transition-colors w-fit"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-500 border border-slate-200/30">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    {email}
                                </a>
                            )}
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    className="flex items-center gap-3 text-sm font-semibold text-slate-500 theme-primary-text-hover transition-colors w-fit"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-500 border border-slate-200/30">
                                        <Phone className="w-3.5 h-3.5" />
                                    </div>
                                    {phone}
                                </a>
                            )}
                            {address && (
                                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 w-fit">
                                    <div className="w-8 h-8 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-500 border border-slate-200/30">
                                        <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    {address}
                                </div>
                            )}
                        </div>

                        {/* Social Icons */}
                        {socials.length > 0 && (
                            <div className="flex gap-2.5 mt-2">
                                {socials.map(({ key, icon: Icon, href }) => (
                                    <a
                                        key={key}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-full border border-slate-200 theme-primary-border-hover flex items-center justify-center text-slate-500 theme-primary-text-hover transition-all hover:scale-105 duration-200"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Menus Row - Displayed side-by-side in one line */}
                    <div className="lg:col-span-3 grid grid-cols-3 gap-4 sm:gap-8">
                        {/* Explore Column */}
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] sm:text-xs font-extrabold theme-primary-text tracking-[0.15em] uppercase select-none">
                                / EXPLORE
                            </span>
                            <div className="flex flex-col gap-3 text-xs sm:text-[13.5px] font-semibold text-slate-500">
                                <Link to="/courses" className="theme-primary-text-hover transition-colors">All Courses</Link>
                                {(settings?.features?.feature_bundles === '1' || settings?.features?.feature_bundles === 1 || settings?.features?.feature_bundles === true) && (
                                    <Link to="/bundles" className="theme-primary-text-hover transition-colors">Course Bundles</Link>
                                )}
                                {(settings?.features?.feature_workshops === '1' || settings?.features?.feature_workshops === 1 || settings?.features?.feature_workshops === true) && (
                                    <Link to="/workshops" className="theme-primary-text-hover transition-colors">Live Workshops</Link>
                                )}
                                {(settings?.features?.feature_ebooks === '1' || settings?.features?.feature_ebooks === 1 || settings?.features?.feature_ebooks === true) && (
                                    <Link to="/ebooks" className="theme-primary-text-hover transition-colors">E-Books</Link>
                                )}
                                {(settings?.features?.feature_blog === '1' || settings?.features?.feature_blog === 1 || settings?.features?.feature_blog === true || settings?.features?.feature_blog === undefined) && (
                                    <Link to="/blog" className="theme-primary-text-hover transition-colors">AI News / Blog</Link>
                                )}
                            </div>
                        </div>

                        {/* Account Column */}
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] sm:text-xs font-extrabold theme-primary-text tracking-[0.15em] uppercase select-none">
                                / ACCOUNT
                            </span>
                            <div className="flex flex-col gap-3 text-xs sm:text-[13.5px] font-semibold text-slate-500">
                                <Link to="/login" className="theme-primary-text-hover transition-colors">Login</Link>
                                <Link to="/register" className="theme-primary-text-hover transition-colors">Register</Link>
                                <Link to="/dashboard" className="theme-primary-text-hover transition-colors">Dashboard</Link>
                                <Link to="/#marketplace" className="theme-primary-text-hover transition-colors">Marketplace</Link>
                            </div>
                        </div>

                        {/* Legal Column */}
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] sm:text-xs font-extrabold theme-primary-text tracking-[0.15em] uppercase select-none">
                                / LEGAL
                            </span>
                            <div className="flex flex-col gap-3 text-xs sm:text-[13.5px] font-semibold text-slate-500">
                                <Link to="/#privacy" className="theme-primary-text-hover transition-colors">Privacy Policy</Link>
                                <Link to="/#terms" className="theme-primary-text-hover transition-colors">Terms of Service</Link>
                                <Link to="/#refund" className="theme-primary-text-hover transition-colors">Refund Policy</Link>
                                <Link to="/#contact" className="theme-primary-text-hover transition-colors">Contact</Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Middle: Giant Watermark */}
            <div className="w-full text-center pointer-events-none select-none overflow-hidden font-black text-[16vw] tracking-[-0.02em] text-[#F3F4F6] dark:text-slate-800/10 leading-none my-6">
                {footerWatermark}.
            </div>

            {/* Lower Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                <div className="border-t border-slate-200/80 my-5" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold tracking-wider text-slate-450 select-none">
                    <div>© 2026 VibeThink. All Rights Reserved.</div>
                </div>
            </div>

        </footer>
    );
}

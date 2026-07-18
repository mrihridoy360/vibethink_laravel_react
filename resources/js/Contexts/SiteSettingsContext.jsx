import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const SiteSettingsContext = createContext(null);

// Default fallback values (static fallbacks if API not ready)
const DEFAULTS = {
    general: {
        site_name: 'VibeThink',
        site_description: 'বাংলাদেশের প্র্যাকটিক্যাল লার্নিং প্ল্যাটফর্ম।',
        site_language: 'bn',
    },
    appearance: {
        site_logo: null,
        site_favicon: null,
        primary_color: '#FF5A00',
    },
    footer: {
        contact_email: 'support@vibethink.com.bd',
        contact_phone: null,
        contact_address: 'Dhaka, Bangladesh',
        copyright_text: null,
        footer_description: 'বাংলাদেশের প্র্যাকটিক্যাল লার্নিং প্ল্যাটফর্ম। শিখুন, তৈরি করুন এবং এগিয়ে যান।',
        social_facebook: null,
        social_twitter: null,
        social_instagram: null,
        social_linkedin: null,
    },
    marketing: {
        meta_tracking_enabled: '1',
        meta_pixel_id: '',
        meta_capi_test_event_code: '',
    },
    verification: {
        facebook_domain_verification: '',
        google_site_verification: '',
        custom_meta_tags: '',
        sitemap_enabled: '1',
        sitemap_exclusions: '',
    },
    features: {},
};

// Preload settings injected by the server (app.blade.php) so the first
// client render already shows the real dynamic content instead of DEFAULTS.
const PRELOADED = (typeof window !== 'undefined' && window.__INITIAL_SITE_SETTINGS__)
    ? {
        general:      { ...DEFAULTS.general,      ...(window.__INITIAL_SITE_SETTINGS__.general      || {}) },
        appearance:   { ...DEFAULTS.appearance,   ...(window.__INITIAL_SITE_SETTINGS__.appearance   || {}) },
        footer:       { ...DEFAULTS.footer,       ...(window.__INITIAL_SITE_SETTINGS__.footer       || {}) },
        marketing:    { ...DEFAULTS.marketing,    ...(window.__INITIAL_SITE_SETTINGS__.marketing    || {}) },
        verification: { ...DEFAULTS.verification, ...(window.__INITIAL_SITE_SETTINGS__.verification || {}) },
        features:     window.__INITIAL_SITE_SETTINGS__.features || {},
    }
    : null;

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(PRELOADED || DEFAULTS);
    const [loading, setLoading] = useState(!PRELOADED);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/api/settings');
            if (data.success && data.settings) {
                // Merge with defaults so missing keys fall back gracefully
                setSettings((prev) => ({
                    general:      { ...prev.general,      ...(data.settings.general      || {}) },
                    appearance:   { ...prev.appearance,   ...(data.settings.appearance   || {}) },
                    footer:       { ...prev.footer,       ...(data.settings.footer       || {}) },
                    marketing:    { ...prev.marketing,    ...(data.settings.marketing    || {}) },
                    verification: { ...prev.verification, ...(data.settings.verification || {}) },
                    features:     data.settings.features || {},
                }));
            }
        } catch (err) {
            // Silently fall back to defaults
            console.warn('Could not load site settings, using defaults.', err?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Keep document head (favicon, title, meta description, OG/Twitter) in sync
    // with the dynamic site settings so changes apply without a rebuild.
    useEffect(() => {
        const general    = settings.general || {};
        const appearance = settings.appearance || {};
        const name   = general.site_name || 'VibeThink LMS';
        const desc   = general.site_description || '';
        const favicon = appearance.site_favicon || null;
        const logo   = appearance.site_logo || null;

        if (typeof document === 'undefined') return;

        document.title = name;

        if (favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = favicon;
        }

        const setMeta = (selector, attr, key, content) => {
            if (!content) return;
            let m = document.querySelector(selector);
            if (!m) {
                m = document.createElement('meta');
                if (attr === 'name') m.name = key;
                else m.setAttribute('property', key);
                document.head.appendChild(m);
            }
            m.content = content;
        };

        setMeta("meta[name='description']", 'name', 'description', desc);
        setMeta("meta[property='og:title']", 'property', 'og:title', name);
        setMeta("meta[property='og:description']", 'property', 'og:description', desc);
        setMeta("meta[property='og:image']", 'property', 'og:image', logo);
        setMeta("meta[name='twitter:title']", 'name', 'twitter:title', name);
        setMeta("meta[name='twitter:description']", 'name', 'twitter:description', desc);
        setMeta("meta[name='twitter:image']", 'name', 'twitter:image', logo);
    }, [settings]);

    /**
     * Helper to re-fetch (e.g., after admin saves settings).
     */
    const reloadSettings = () => fetchSettings();

    /**
     * Get a flat value from any group by key.
     */
    const getSetting = (key, fallback = null) => {
        for (const group of Object.values(settings)) {
            if (group && typeof group === 'object' && key in group) {
                return group[key] ?? fallback;
            }
        }
        return fallback;
    };

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, getSetting, reloadSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);

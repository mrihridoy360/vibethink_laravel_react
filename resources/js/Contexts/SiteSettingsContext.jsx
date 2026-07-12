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
};

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/api/settings');
            if (data.success && data.settings) {
                // Merge with defaults so missing keys fall back gracefully
                setSettings((prev) => ({
                    general:    { ...prev.general,    ...(data.settings.general    || {}) },
                    appearance: { ...prev.appearance, ...(data.settings.appearance || {}) },
                    footer:     { ...prev.footer,     ...(data.settings.footer     || {}) },
                    marketing:  { ...prev.marketing,  ...(data.settings.marketing  || {}) },
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

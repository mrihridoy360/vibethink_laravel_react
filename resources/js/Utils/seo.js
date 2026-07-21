import { useEffect } from 'react';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';

/**
 * Reusable custom hook for page-level SEO in React.
 * Dynamically synchronizes document title, canonical url, meta description, robots, and social tags.
 */
export function useSEO({ title, description, image, robots } = {}) {
    const { settings } = useSiteSettings();
    const siteName = settings?.general?.site_name || 'VibeThink LMS';

    useEffect(() => {
        if (typeof document === 'undefined') return;

        // 1. Update Title
        if (title) {
            document.title = `${title} | ${siteName}`;
        } else {
            document.title = siteName;
        }

        // Helper to update or create meta tags
        const updateMeta = (selector, attr, key, value) => {
            if (value === undefined || value === null) return;
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                if (attr === 'name') el.name = key;
                else el.setAttribute('property', key);
                document.head.appendChild(el);
            }
            el.content = value;
        };

        // Helper to update or create link tags
        const updateLink = (selector, rel, value) => {
            if (value === undefined || value === null) return;
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('link');
                el.rel = rel;
                document.head.appendChild(el);
            }
            el.href = value;
        };

        // 2. Canonical URL
        updateLink("link[rel='canonical']", 'canonical', window.location.href);

        // 3. Description
        const descVal = description || settings?.general?.site_description || '';
        updateMeta("meta[name='description']", 'name', 'description', descVal);
        updateMeta("meta[property='og:description']", 'property', 'og:description', descVal);
        updateMeta("meta[name='twitter:description']", 'name', 'twitter:description', descVal);

        // 4. Robots
        if (robots) {
            updateMeta("meta[name='robots']", 'name', 'robots', robots);
        } else {
            updateMeta("meta[name='robots']", 'name', 'robots', 'index, follow');
        }

        // 5. Social Titles
        const currentTitle = title ? `${title} | ${siteName}` : siteName;
        updateMeta("meta[property='og:title']", 'property', 'og:title', currentTitle);
        updateMeta("meta[name='twitter:title']", 'name', 'twitter:title', currentTitle);

        // 6. Social Images
        const imgVal = image || settings?.appearance?.site_logo || null;
        if (imgVal) {
            const absoluteImgUrl = imgVal.startsWith('http') ? imgVal : `${window.location.origin}${imgVal}`;
            updateMeta("meta[property='og:image']", 'property', 'og:image', absoluteImgUrl);
            updateMeta("meta[name='twitter:image']", 'name', 'twitter:image', absoluteImgUrl);
        }

    }, [title, description, image, robots, siteName, settings]);
}

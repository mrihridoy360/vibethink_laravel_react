// Meta Pixel Utility for React SPA

/**
 * Dynamically initialize Meta Pixel inside the browser.
 *
 * @param {string} pixelId 
 */
export const initMetaPixel = (pixelId) => {
    if (!pixelId) return;
    if (window.fbq) return;

    // Standard Facebook Pixel initialization code
    !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', pixelId);
};

/**
 * Track standard Pixel event.
 *
 * @param {string} eventName 
 * @param {object} params 
 * @param {object} options 
 */
export const trackPixelEvent = (eventName, params = {}, options = {}) => {
    if (window.fbq) {
        if (options.eventId) {
            window.fbq('track', eventName, params, { eventID: options.eventId });
        } else {
            window.fbq('track', eventName, params);
        }
    }
};

/**
 * Track custom Pixel event.
 *
 * @param {string} eventName 
 * @param {object} params 
 * @param {object} options 
 */
export const trackPixelCustomEvent = (eventName, params = {}, options = {}) => {
    if (window.fbq) {
        if (options.eventId) {
            window.fbq('trackCustom', eventName, params, { eventID: options.eventId });
        } else {
            window.fbq('trackCustom', eventName, params);
        }
    }
};

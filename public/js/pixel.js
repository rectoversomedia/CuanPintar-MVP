/**
 * CuanPintar Tracking Pixel
 *
 * A lightweight JavaScript library for tracking conversions
 * Usage:
 *   <script src="/js/pixel.min.js" data-program="prog_123"></script>
 *   <img src="/api/track/pixel?program=prog_123" />
 *
 * For production, host on CDN and use the minified version
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiBase: typeof CP_API_BASE !== 'undefined' ? CP_API_BASE : '/api/track',
    debug: typeof CP_DEBUG !== 'undefined' ? CP_DEBUG : false,
    cookieExpiry: 30, // days
    fingerprintEnabled: true,
  };

  // Storage keys
  const STORAGE = {
    click: 'cp_click_id',
    fingerprint: 'cp_fp',
    utms: 'cp_utms',
  };

  // Utils
  const Utils = {
    // Generate unique ID
    generateId: function() {
      return 'cp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // Get cookie
    getCookie: function(name) {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },

    // Set cookie
    setCookie: function(name, value, days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
    },

    // Get localStorage
    getStorage: function(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },

    // Set localStorage
    setStorage: function(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignore errors
      }
    },

    // Get UTM parameters
    getUTMs: function() {
      const utms = Utils.getStorage(STORAGE.utms);
      if (utms) return JSON.parse(utms);

      const params = {};
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

      utmParams.forEach(function(param) {
        const value = Utils.getURLParam(param);
        if (value) params[param] = value;
      });

      // Store UTM parameters
      if (Object.keys(params).length > 0) {
        Utils.setStorage(STORAGE.utms, JSON.stringify(params));
      }

      return params;
    },

    // Get URL parameter
    getURLParam: function(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    },

    // Get device info
    getDeviceInfo: function() {
      const ua = navigator.userAgent;
      let device = 'desktop';
      let browser = 'unknown';
      let os = 'unknown';

      // Device type
      if (/mobile/i.test(ua)) device = 'mobile';
      else if (/tablet|ipad/i.test(ua)) device = 'tablet';

      // Browser
      if (/chrome/i.test(ua)) browser = 'Chrome';
      else if (/firefox/i.test(ua)) browser = 'Firefox';
      else if (/safari/i.test(ua)) browser = 'Safari';
      else if (/edge/i.test(ua)) browser = 'Edge';

      // OS
      if (/windows/i.test(ua)) os = 'Windows';
      else if (/mac/i.test(ua)) os = 'macOS';
      else if (/linux/i.test(ua)) os = 'Linux';
      else if (/android/i.test(ua)) os = 'Android';
      else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

      return { device, browser, os };
    },

    // Get IP (requires server-side)
    getIP: function() {
      return Utils.getCookie('cp_ip') || null;
    },

    // Generate fingerprint
    generateFingerprint: function() {
      if (!CONFIG.fingerprintEnabled) return Utils.generateId();

      const fp = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'NA',
        navigator.platform,
      ].join('|');

      // Simple hash
      let hash = 0;
      for (let i = 0; i < fp.length; i++) {
        const char = fp.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      return 'fp_' + Math.abs(hash).toString(36);
    },

    // Get existing fingerprint
    getFingerprint: function() {
      let fp = Utils.getStorage(STORAGE.fingerprint);
      if (!fp) {
        fp = Utils.generateFingerprint();
        Utils.setStorage(STORAGE.fingerprint, fp);
      }
      return fp;
    },

    // Log debug
    log: function() {
      if (CONFIG.debug && console && console.log) {
        console.log.apply(console, ['[CuanPintar]'].concat(Array.prototype.slice.call(arguments)));
      }
    },

    // Get click ID
    getClickId: function() {
      return Utils.getCookie(STORAGE.click) || Utils.getStorage(STORAGE.click);
    },

    // Set click ID
    setClickId: function(clickId) {
      Utils.setCookie(STORAGE.click, clickId, CONFIG.cookieExpiry);
      Utils.setStorage(STORAGE.click, clickId);
    },
  };

  // Track API
  const Track = {
    // Track click
    click: function(data) {
      const clickId = Utils.generateId();
      Utils.setClickId(clickId);

      Utils.log('Tracking click:', clickId, data);

      const payload = {
        click_id: clickId,
        program_id: data.programId || Utils.getURLParam('program'),
        partner_id: data.partnerId || Utils.getURLParam('partner'),
        channel_type: data.channelType || Utils.getURLParam('channel'),
        source_url: window.location.href,
        referrer: document.referrer,
        utms: Utils.getUTMs(),
        fingerprint: Utils.getFingerprint(),
        device: Utils.getDeviceInfo(),
        timestamp: new Date().toISOString(),
      };

      // Send async
      Navigator.sendBeacon(CONFIG.apiBase + '/click', payload);

      return clickId;
    },

    // Track conversion
    conversion: function(data) {
      const clickId = Utils.getClickId();
      const fingerprint = Utils.getFingerprint();

      Utils.log('Tracking conversion:', data, { clickId, fingerprint });

      const payload = {
        program_id: data.programId || Utils.getURLParam('program'),
        partner_id: data.partnerId || Utils.getURLParam('partner'),
        channel_type: data.channelType || Utils.getURLParam('channel'),
        conversion_type: data.conversionType || 'conversion',
        user_identifier: data.userIdentifier || null,
        click_id: clickId,
        fingerprint: fingerprint,
        utms: Utils.getUTMs(),
        source_url: window.location.href,
        ip_address: Utils.getIP(),
        device: Utils.getDeviceInfo(),
        metadata: data.metadata || {},
        timestamp: new Date().toISOString(),
      };

      // Send conversion
      fetch(CONFIG.apiBase + '/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(result) {
        Utils.log('Conversion tracked:', result);
        if (typeof data.onSuccess === 'function') {
          data.onSuccess(result);
        }
      })
      .catch(function(error) {
        Utils.log('Conversion tracking error:', error);
        if (typeof data.onError === 'function') {
          data.onError(error);
        }
      });
    },

    // Fire pixel
    firePixel: function(programId) {
      const img = new Image();
      img.src = CONFIG.apiBase + '/pixel?program=' + programId + '&t=' + Date.now();
      img.style.display = 'none';
      document.body.appendChild(img);
      setTimeout(function() {
        if (img.parentNode) img.parentNode.removeChild(img);
      }, 1000);
    },

    // Validate conversion
    validate: function(data) {
      return fetch(CONFIG.apiBase + '/validate?' + new URLSearchParams({
        fingerprint: data.fingerprint || Utils.getFingerprint(),
        program_id: data.programId,
      }))
      .then(function(response) {
        return response.json();
      });
    },
  };

  // Navigator (for sendBeacon polyfill)
  const Navigator = {
    sendBeacon: function(url, data) {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        // Fallback to fetch
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true,
        });
      }
    },
  };

  // Auto-init
  function init() {
    // Get program ID from script tag or URL
    const scripts = document.getElementsByTagName('script');
    let scriptData = null;

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('pixel') !== -1) {
        scriptData = scripts[i].dataset;
        break;
      }
    }

    const programId = scriptData?.program || Utils.getURLParam('program');
    const partnerId = scriptData?.partner || Utils.getURLParam('partner');
    const autoClick = scriptData?.autoclick !== 'false';

    // Fire pixel
    if (programId) {
      Track.firePixel(programId);
    }

    // Track click on load (if coming from partner link)
    if (autoClick && (partnerId || Utils.getURLParam('utm_source'))) {
      Track.click({
        programId: programId,
        partnerId: partnerId,
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global API
  window.CuanPintarPixel = {
    track: Track,
    config: CONFIG,
    utils: Utils,
    // Shortcuts
    click: Track.click,
    conversion: Track.conversion,
    fire: Track.firePixel,
    validate: Track.validate,
  };

})();

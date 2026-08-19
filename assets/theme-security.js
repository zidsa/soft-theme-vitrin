(function (root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ThemeSecurity = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function parseAllowedUrl(value, origin, allowedProtocols) {
    if (typeof value !== 'string' || value.trim() === '') return null;

    try {
      const url = new URL(value, origin);
      return allowedProtocols.includes(url.protocol) ? url : null;
    } catch (error) {
      return null;
    }
  }

  function getSafeNavigationUrl(value, origin, sameOriginOnly) {
    const url = parseAllowedUrl(value, origin, ['http:', 'https:']);
    if (!url || (sameOriginOnly && url.origin !== origin)) return null;
    return url.href;
  }

  function isAllowedUrl(value, origin, allowedProtocols) {
    return parseAllowedUrl(value, origin, allowedProtocols) !== null;
  }

  return {
    getSafeNavigationUrl,
    isAllowedUrl,
  };
});

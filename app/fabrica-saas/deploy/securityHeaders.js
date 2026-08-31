// Security Headers — PASO G
// Reusable header policy per environment.

export const HEADER_ENVIRONMENTS = Object.freeze({
  PREVIEW:    'PREVIEW',
  STAGING:    'STAGING',
  PRODUCTION: 'PRODUCTION',
});

/**
 * Build the recommended security headers for a given environment.
 * Varies CSP strictness, HSTS, and cache policy by environment.
 */
export function buildSecurityHeaders(environment = HEADER_ENVIRONMENTS.PREVIEW, options = {}) {
  if (!Object.values(HEADER_ENVIRONMENTS).includes(environment)) {
    return { valid: false, error: `unknown environment: ${environment}` };
  }

  const isProduction = environment === HEADER_ENVIRONMENTS.PRODUCTION;
  const isPreview    = environment === HEADER_ENVIRONMENTS.PREVIEW;

  const allowedOrigins = options.allowedOrigins ?? [];
  const frameSrc = options.allowIframe ? `frame-ancestors 'self'${allowedOrigins.map(o => ` ${o}`).join('')}` : `frame-ancestors 'none'`;

  // CSP is relaxed in preview to not break dev iteration
  const csp = isPreview
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "connect-src 'self' *",
        "font-src 'self' data:",
        frameSrc,
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self'" + (options.scriptNonce ? ` 'nonce-${options.scriptNonce}'` : " 'unsafe-inline'"),
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        `connect-src 'self' ${(options.apiOrigins ?? []).join(' ')}`.trim(),
        "font-src 'self' data: https://fonts.gstatic.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        frameSrc,
      ].join('; ');

  const headers = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options':  'nosniff',
    'Referrer-Policy':         isProduction ? 'strict-origin-when-cross-origin' : 'no-referrer-when-downgrade',
    'Permissions-Policy':      'camera=(), microphone=(), geolocation=()',
    'X-Frame-Options':         options.allowIframe ? 'SAMEORIGIN' : 'DENY',
    'Cache-Control':           isProduction ? 'public, max-age=31536000, immutable' : 'no-cache, no-store',
    'X-Robots-Tag':            isProduction && !options.indexable ? 'noindex, nofollow' : 'index, follow',
  };

  if (isProduction && options.httpsOnly !== false) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return {
    valid:       true,
    environment,
    headers,
    headerCount: Object.keys(headers).length,
    disclaimer:  'Security headers policy. Validate against your CSP before applying to avoid breaking the app.',
  };
}

/**
 * Validate that a headers object contains the minimum required security headers.
 */
export function validateSecurityHeaders(headers = {}) {
  const required = [
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'X-Frame-Options',
  ];

  const missing = required.filter(h => !headers[h]);
  const present = required.filter(h => !!headers[h]);

  return {
    valid:   missing.length === 0,
    present: present.length,
    missing,
    score:   Math.round((present.length / required.length) * 100),
  };
}

export const SECURITY_HEADERS_VERSION = '1.0.0';

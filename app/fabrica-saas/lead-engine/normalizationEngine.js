// Normalization Engine — ADV-08

export const NORMALIZE_RESULT = Object.freeze({
  OK:       'OK',
  PARTIAL:  'PARTIAL',
  FAILED:   'FAILED',
});

function normalizePhone(raw = '') {
  if (!raw) return '';
  return raw.replace(/[\s\-().]/g, '').replace(/^00/, '+').slice(0, 20);
}

function normalizeEmail(raw = '') {
  if (!raw) return '';
  return raw.trim().toLowerCase();
}

function normalizeDomain(raw = '') {
  if (!raw) return '';
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .slice(0, 100);
}

function normalizeUrl(raw = '') {
  if (!raw) return '';
  let u = raw.trim();
  if (u && !u.startsWith('http')) u = `https://${u}`;
  return u.slice(0, 200);
}

function normalizeBusinessName(raw = '') {
  if (!raw) return '';
  return raw.trim()
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '')
    .slice(0, 120);
}

function normalizeLocation(raw = '') {
  if (!raw) return '';
  return raw.trim().replace(/\s+/g, ' ').slice(0, 80);
}

function normalizeVertical(raw = '') {
  if (!raw) return 'default';
  return raw.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 40);
}

function normalizeSocialUrl(url = '') {
  if (!url) return '';
  return url.trim().slice(0, 200);
}

export function normalizeLead(raw = {}) {
  const businessName   = normalizeBusinessName(raw.businessName);
  const website        = normalizeUrl(raw.website);
  const domain         = normalizeDomain(raw.website);
  const publicEmail    = normalizeEmail(raw.publicEmail);
  const publicPhone    = normalizePhone(raw.publicPhone);
  const location       = normalizeLocation(raw.location);
  const vertical       = normalizeVertical(raw.vertical);

  const rawSocials     = raw.socialProfiles ?? {};
  const socialProfiles = Object.fromEntries(
    Object.entries(rawSocials).map(([k, v]) => [k, normalizeSocialUrl(v)])
  );

  const issues = [];
  if (!businessName) issues.push('MISSING_BUSINESS_NAME');
  if (!location)     issues.push('MISSING_LOCATION');
  if (!website && !publicEmail && !publicPhone) issues.push('NO_CONTACT_VECTOR');

  const result = issues.length === 0 ? NORMALIZE_RESULT.OK
    : issues.includes('MISSING_BUSINESS_NAME') ? NORMALIZE_RESULT.FAILED
    : NORMALIZE_RESULT.PARTIAL;

  return Object.freeze({
    normalized: Object.freeze({
      ...raw,
      businessName,
      website,
      domain,
      publicEmail,
      publicPhone,
      location,
      vertical,
      socialProfiles,
      lastUpdatedAt: new Date().toISOString(),
    }),
    result,
    issues,
    isReal: false,
  });
}

export const NORMALIZATION_ENGINE_VERSION = '1.0.0';

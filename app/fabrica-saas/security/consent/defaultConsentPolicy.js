// Default Consent Policy — ADV-19

import { COOKIE_CATEGORY } from './cookieCategory.js';

export function evaluateDefaultConsent(trackers = []) {
  const results = trackers.map(tracker => {
    const { category = 'UNKNOWN', essential = false } = tracker;

    if (essential || category === COOKIE_CATEGORY.STRICTLY_NECESSARY) {
      return Object.freeze({ ...tracker, activeByDefault: true, blockedBeforeConsent: false, isReal: false });
    }

    if (category === COOKIE_CATEGORY.UNKNOWN) {
      return Object.freeze({ ...tracker, activeByDefault: false, blockedBeforeConsent: true, blockReason: 'UNCLASSIFIED_TRACKER', isReal: false });
    }

    // Non-essential: OFF before consent
    return Object.freeze({ ...tracker, activeByDefault: false, blockedBeforeConsent: true, blockReason: 'REQUIRES_CONSENT', isReal: false });
  });

  const activeByDefault   = results.filter(r => r.activeByDefault).length;
  const blockedByDefault  = results.filter(r => r.blockedBeforeConsent).length;
  const unclassified      = results.filter(r => r.category === COOKIE_CATEGORY.UNKNOWN).length;

  return Object.freeze({
    trackers: Object.freeze(results),
    activeByDefault,
    blockedByDefault,
    unclassified,
    compliant: unclassified === 0 && results.filter(r => !r.essential && r.activeByDefault).length === 0,
    isReal: false,
  });
}

export const DEFAULT_CONSENT_VERSION = '1.0.0';

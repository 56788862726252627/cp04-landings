// Digital Maturity Analyzer — ADV-08

export const DIGITAL_SIGNAL = Object.freeze({
  WEBSITE_PRESENT:     'WEBSITE_PRESENT',
  MOBILE_FRIENDLY:     'MOBILE_FRIENDLY',
  BOOKING_SYSTEM:      'BOOKING_SYSTEM',
  ONLINE_FORMS:        'ONLINE_FORMS',
  CRM_SIGNALS:         'CRM_SIGNALS',
  AUTOMATION_SIGNALS:  'AUTOMATION_SIGNALS',
  CHAT_PRESENT:        'CHAT_PRESENT',
  AI_SIGNALS:          'AI_SIGNALS',
  SOCIAL_PRESENCE:     'SOCIAL_PRESENCE',
  RESPONSE_CHANNELS:   'RESPONSE_CHANNELS',
  REVIEWS_ACTIVE:      'REVIEWS_ACTIVE',
  ONLINE_PAYMENTS:     'ONLINE_PAYMENTS',
  CLIENT_PORTAL:       'CLIENT_PORTAL',
});

export const DIGITAL_MATURITY_LEVEL = Object.freeze({
  ADVANCED:     'ADVANCED',
  ESTABLISHED:  'ESTABLISHED',
  BASIC:        'BASIC',
  MINIMAL:      'MINIMAL',
  ABSENT:       'ABSENT',
});

const SIGNAL_WEIGHTS = {
  WEBSITE_PRESENT:    15,
  MOBILE_FRIENDLY:    10,
  BOOKING_SYSTEM:     15,
  ONLINE_FORMS:       10,
  CRM_SIGNALS:        10,
  AUTOMATION_SIGNALS:  8,
  CHAT_PRESENT:        7,
  AI_SIGNALS:          5,
  SOCIAL_PRESENCE:     7,
  RESPONSE_CHANNELS:   5,
  REVIEWS_ACTIVE:      5,
  ONLINE_PAYMENTS:     8,
  CLIENT_PORTAL:       5,
};

export function analyzeDigitalMaturity(signals = []) {
  const present = new Set(signals);
  let score = 0;
  const detected = [];
  const absent = [];

  for (const [sig, weight] of Object.entries(SIGNAL_WEIGHTS)) {
    if (present.has(sig)) {
      score += weight;
      detected.push(sig);
    } else {
      absent.push(sig);
    }
  }

  const cappedScore = Math.min(100, score);
  const level = cappedScore >= 70 ? DIGITAL_MATURITY_LEVEL.ADVANCED
    : cappedScore >= 45 ? DIGITAL_MATURITY_LEVEL.ESTABLISHED
    : cappedScore >= 25 ? DIGITAL_MATURITY_LEVEL.BASIC
    : cappedScore >= 10 ? DIGITAL_MATURITY_LEVEL.MINIMAL
    : DIGITAL_MATURITY_LEVEL.ABSENT;

  return Object.freeze({ score: cappedScore, level, detected: Object.freeze(detected), absent: Object.freeze(absent), isReal: false });
}

export function inferDigitalSignals(lead = {}) {
  const signals = [];
  if (lead.website) signals.push(DIGITAL_SIGNAL.WEBSITE_PRESENT);
  if ((lead.socialProfiles?.instagram) || (lead.socialProfiles?.facebook)) {
    signals.push(DIGITAL_SIGNAL.SOCIAL_PRESENCE);
  }
  if (lead.publicEmail || lead.publicPhone) signals.push(DIGITAL_SIGNAL.RESPONSE_CHANNELS);
  for (const s of (lead.digitalSignals ?? [])) {
    if (Object.values(DIGITAL_SIGNAL).includes(s)) signals.push(s);
  }
  return [...new Set(signals)];
}

export const DIGITAL_MATURITY_ANALYZER_VERSION = '1.0.0';

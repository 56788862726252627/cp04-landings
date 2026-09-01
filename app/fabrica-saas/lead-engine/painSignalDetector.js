// Pain Signal Detector — ADV-08

export const PAIN_SIGNAL_TYPE = Object.freeze({
  NO_BOOKING:          'NO_BOOKING',
  MANUAL_CONTACT_ONLY: 'MANUAL_CONTACT_ONLY',
  POOR_MOBILE_UX:      'POOR_MOBILE_UX',
  BROKEN_CTA:          'BROKEN_CTA',
  SLOW_WORKFLOW:       'SLOW_WORKFLOW',
  DUPLICATED_FORMS:    'DUPLICATED_FORMS',
  WEAK_FOLLOW_UP:      'WEAK_FOLLOW_UP',
  NO_CHATBOT:          'NO_CHATBOT',
  NO_CRM_SURFACE:      'NO_CRM_SURFACE',
  NO_AUTOMATION:       'NO_AUTOMATION',
  OUTDATED_WEBSITE:    'OUTDATED_WEBSITE',
  NO_LEAD_CAPTURE:     'NO_LEAD_CAPTURE',
  MISSING_SOCIAL:      'MISSING_SOCIAL',
  MANUAL_APPOINTMENTS: 'MANUAL_APPOINTMENTS',
  NO_ONLINE_PAYMENT:   'NO_ONLINE_PAYMENT',
});

export const PAIN_SEVERITY = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH:     'HIGH',
  MEDIUM:   'MEDIUM',
  LOW:      'LOW',
});

const PAIN_CATALOG = Object.freeze({
  [PAIN_SIGNAL_TYPE.NO_BOOKING]:           { severity: PAIN_SEVERITY.CRITICAL, confidence: 0.9 },
  [PAIN_SIGNAL_TYPE.MANUAL_CONTACT_ONLY]:  { severity: PAIN_SEVERITY.HIGH,     confidence: 0.85 },
  [PAIN_SIGNAL_TYPE.POOR_MOBILE_UX]:       { severity: PAIN_SEVERITY.HIGH,     confidence: 0.7 },
  [PAIN_SIGNAL_TYPE.BROKEN_CTA]:           { severity: PAIN_SEVERITY.CRITICAL, confidence: 0.95 },
  [PAIN_SIGNAL_TYPE.SLOW_WORKFLOW]:        { severity: PAIN_SEVERITY.HIGH,     confidence: 0.75 },
  [PAIN_SIGNAL_TYPE.DUPLICATED_FORMS]:     { severity: PAIN_SEVERITY.MEDIUM,   confidence: 0.7 },
  [PAIN_SIGNAL_TYPE.WEAK_FOLLOW_UP]:       { severity: PAIN_SEVERITY.HIGH,     confidence: 0.8 },
  [PAIN_SIGNAL_TYPE.NO_CHATBOT]:           { severity: PAIN_SEVERITY.MEDIUM,   confidence: 0.9 },
  [PAIN_SIGNAL_TYPE.NO_CRM_SURFACE]:       { severity: PAIN_SEVERITY.HIGH,     confidence: 0.85 },
  [PAIN_SIGNAL_TYPE.NO_AUTOMATION]:        { severity: PAIN_SEVERITY.HIGH,     confidence: 0.85 },
  [PAIN_SIGNAL_TYPE.OUTDATED_WEBSITE]:     { severity: PAIN_SEVERITY.MEDIUM,   confidence: 0.75 },
  [PAIN_SIGNAL_TYPE.NO_LEAD_CAPTURE]:      { severity: PAIN_SEVERITY.HIGH,     confidence: 0.9 },
  [PAIN_SIGNAL_TYPE.MISSING_SOCIAL]:       { severity: PAIN_SEVERITY.LOW,      confidence: 0.9 },
  [PAIN_SIGNAL_TYPE.MANUAL_APPOINTMENTS]:  { severity: PAIN_SEVERITY.CRITICAL, confidence: 0.85 },
  [PAIN_SIGNAL_TYPE.NO_ONLINE_PAYMENT]:    { severity: PAIN_SEVERITY.MEDIUM,   confidence: 0.8 },
});

export function createPainSignal(type, evidence = '') {
  const catalog = PAIN_CATALOG[type];
  if (!catalog) return null;
  return Object.freeze({ type, ...catalog, evidence, isReal: false });
}

export function detectPainSignals(lead = {}) {
  const signals = [];
  const ds = new Set(lead.digitalSignals ?? []);
  const ps = lead.painSignals ?? [];

  for (const s of ps) {
    if (typeof s === 'string' && PAIN_CATALOG[s]) {
      signals.push(createPainSignal(s, 'from lead data'));
    } else if (s && s.type && PAIN_CATALOG[s.type]) {
      signals.push(createPainSignal(s.type, s.evidence ?? 'from lead data'));
    }
  }

  if (!ds.has('BOOKING_SYSTEM') && !ds.has('ONLINE_FORMS')) {
    signals.push(createPainSignal(PAIN_SIGNAL_TYPE.NO_BOOKING, 'no booking/form signal detected'));
  }
  if (!ds.has('CRM_SIGNALS')) {
    signals.push(createPainSignal(PAIN_SIGNAL_TYPE.NO_CRM_SURFACE, 'no CRM signal detected'));
  }
  if (!ds.has('AUTOMATION_SIGNALS')) {
    signals.push(createPainSignal(PAIN_SIGNAL_TYPE.NO_AUTOMATION, 'no automation signal detected'));
  }

  const unique = [...new Map(signals.filter(Boolean).map(s => [s.type, s])).values()];
  const criticalCount = unique.filter(s => s.severity === PAIN_SEVERITY.CRITICAL).length;
  const highCount     = unique.filter(s => s.severity === PAIN_SEVERITY.HIGH).length;

  return Object.freeze({ signals: Object.freeze(unique), criticalCount, highCount, total: unique.length, isReal: false });
}

export const PAIN_SIGNAL_DETECTOR_VERSION = '1.0.0';

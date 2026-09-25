/**
 * ONE_PROMPT_BUSINESS_BRIEF — Schema & Validator
 * Single input schema for the One Prompt → SaaS pipeline.
 * All fields are optional; defaults + inference fill gaps.
 * Returns {valid, brief, errors, warnings, fieldTrace}
 */

export const ONE_PROMPT_SCHEMA_VERSION = '1.0.0';

export const FIELD_STATUS = Object.freeze({
  PROVIDED:  'PROVIDED',
  INFERRED:  'INFERRED',
  DEFAULTED: 'DEFAULTED',
});

const KNOWN_SECTORS = new Set([
  'dental','salud','fisio','estetica','spa','padel','fitness','tech',
  'educacion','legal','consultoria','restaurante','comercio','portfolio',
  'analytics','veterinary',
]);

const KNOWN_TONES = new Set([
  'professional','friendly','luxury','dynamic','authoritative',
  'clinical','educational','playful','human',
]);

const KNOWN_DEVICE_PRIORITIES = new Set(['mobile','desktop','both']);

const KNOWN_MODULES = new Set([
  'dashboard','booking','patients','clients','agenda','crm','chatbot',
  'payments','inventory','reports','staff','calendar','notifications',
  'documents','gallery','ecommerce','loyalty','support','analytics',
  'roles','auth','history','reminders','vaccinations','treatments',
]);

function inferSectorFromType(businessType) {
  const t = String(businessType).toLowerCase();
  if (/veterinar|vet.*clinic|clinica.*vet/i.test(t)) return 'veterinary';
  if (/dent(al|ist)/i.test(t)) return 'dental';
  if (/fisio|physio/i.test(t)) return 'fisio';
  if (/estét|aesthetic|beauty|spa/i.test(t)) return 'estetica';
  if (/padel|tenis|sport|gym|fitness/i.test(t)) return 'padel';
  if (/escuela|colegio|academy|edu/i.test(t)) return 'educacion';
  if (/abogad|legal|law/i.test(t)) return 'legal';
  if (/restaurant|café|food/i.test(t)) return 'restaurante';
  if (/tech|saas|software/i.test(t)) return 'tech';
  return 'salud';
}

function inferDevicePriority(targetAudience) {
  const a = String(targetAudience).toLowerCase();
  if (a.includes('mobile') || a.includes('youth') || a.includes('young')) return 'mobile';
  if (a.includes('desktop') || a.includes('enterprise') || a.includes('b2b')) return 'desktop';
  return 'both';
}

function inferBrandTone(sector) {
  const toneMap = {
    dental:'clinical', salud:'clinical', fisio:'clinical', estetica:'luxury',
    spa:'luxury', padel:'dynamic', fitness:'dynamic', tech:'professional',
    educacion:'educational', legal:'authoritative', consultoria:'authoritative',
    restaurante:'human', comercio:'friendly', veterinary:'friendly',
    portfolio:'playful', analytics:'professional',
  };
  return toneMap[sector] ?? 'professional';
}

/**
 * Validate and resolve a ONE_PROMPT_BUSINESS_BRIEF.
 * @param {Object} raw - Raw brief input
 * @returns {{valid:boolean, brief:Object, errors:string[], warnings:string[], fieldTrace:Object}}
 */
export function validateBrief(raw = {}) {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, brief: {}, errors: ['Brief must be an object'], warnings: [], fieldTrace: {} };
  }

  const errors   = [];
  const warnings = [];
  const trace    = {};
  const brief    = {};

  // businessName — required
  if (raw.businessName && typeof raw.businessName === 'string' && raw.businessName.trim()) {
    brief.businessName = raw.businessName.trim();
    trace.businessName = FIELD_STATUS.PROVIDED;
  } else {
    errors.push('businessName is required');
    brief.businessName = 'Unnamed Business';
    trace.businessName = FIELD_STATUS.DEFAULTED;
  }

  // businessType — optional, used for sector inference
  brief.businessType = raw.businessType ?? '';
  trace.businessType = raw.businessType ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // sector — required or inferred from businessType
  if (raw.sector && typeof raw.sector === 'string') {
    const s = raw.sector.trim().toLowerCase();
    brief.sector = s;
    trace.sector = FIELD_STATUS.PROVIDED;
    if (!KNOWN_SECTORS.has(s)) {
      warnings.push(`sector '${s}' is not in KNOWN_SECTORS — will use fallback 'salud'`);
    }
  } else if (raw.businessType) {
    brief.sector = inferSectorFromType(raw.businessType);
    trace.sector = FIELD_STATUS.INFERRED;
    warnings.push(`sector inferred from businessType: '${brief.sector}'`);
  } else {
    errors.push('sector is required (or provide businessType for inference)');
    brief.sector = 'salud';
    trace.sector = FIELD_STATUS.DEFAULTED;
  }

  // location
  if (raw.location && typeof raw.location === 'object') {
    brief.location = {
      city:    raw.location.city    ?? '',
      region:  raw.location.region  ?? '',
      country: raw.location.country ?? 'España',
    };
    trace.location = FIELD_STATUS.PROVIDED;
  } else if (raw.location && typeof raw.location === 'string') {
    brief.location = { city: raw.location, region: '', country: 'España' };
    trace.location = FIELD_STATUS.PROVIDED;
  } else {
    brief.location = { city: '', region: '', country: 'España' };
    trace.location = FIELD_STATUS.DEFAULTED;
  }

  // targetAudience
  brief.targetAudience = raw.targetAudience ?? 'general';
  trace.targetAudience = raw.targetAudience ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // services
  if (Array.isArray(raw.services) && raw.services.length > 0) {
    brief.services = raw.services;
    trace.services = FIELD_STATUS.PROVIDED;
  } else {
    brief.services = [];
    trace.services = FIELD_STATUS.DEFAULTED;
    warnings.push('No services provided — will infer from sector');
  }

  // brandTone — provided, or inferred from sector
  if (raw.brandTone && KNOWN_TONES.has(raw.brandTone)) {
    brief.brandTone = raw.brandTone;
    trace.brandTone = FIELD_STATUS.PROVIDED;
  } else if (raw.brandTone) {
    brief.brandTone = raw.brandTone;
    trace.brandTone = FIELD_STATUS.PROVIDED;
    warnings.push(`brandTone '${raw.brandTone}' not in KNOWN_TONES — using as-is`);
  } else {
    brief.brandTone = inferBrandTone(brief.sector);
    trace.brandTone = FIELD_STATUS.INFERRED;
  }

  // conversionGoal
  brief.conversionGoal = raw.conversionGoal ?? 'booking';
  trace.conversionGoal = raw.conversionGoal ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // roles
  if (Array.isArray(raw.roles) && raw.roles.length > 0) {
    brief.roles = raw.roles;
    trace.roles = FIELD_STATUS.PROVIDED;
  } else {
    brief.roles = ['admin', 'client'];
    trace.roles = FIELD_STATUS.DEFAULTED;
    warnings.push('No roles provided — defaulting to [admin, client]');
  }

  // requiredModules
  if (Array.isArray(raw.requiredModules) && raw.requiredModules.length > 0) {
    brief.requiredModules = raw.requiredModules;
    trace.requiredModules = FIELD_STATUS.PROVIDED;
    const unknown = raw.requiredModules.filter(m => !KNOWN_MODULES.has(m));
    if (unknown.length > 0) warnings.push(`Unknown modules (will scaffold): ${unknown.join(', ')}`);
  } else {
    brief.requiredModules = ['dashboard'];
    trace.requiredModules = FIELD_STATUS.DEFAULTED;
  }

  // optionalModules
  brief.optionalModules = Array.isArray(raw.optionalModules) ? raw.optionalModules : [];
  trace.optionalModules = raw.optionalModules ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // automationNeeds
  brief.automationNeeds = Array.isArray(raw.automationNeeds) ? raw.automationNeeds : [];
  trace.automationNeeds = raw.automationNeeds ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // aiNeeds
  brief.aiNeeds = Array.isArray(raw.aiNeeds) ? raw.aiNeeds : [];
  trace.aiNeeds = raw.aiNeeds ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // dataNeeds
  const dn = raw.dataNeeds ?? {};
  brief.dataNeeds = {
    demo:        dn.demo        ?? true,
    production:  dn.production  ?? false,
    sensitive:   dn.sensitive   ?? false,
  };
  trace.dataNeeds = raw.dataNeeds ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // bookingNeeds — real bookings forbidden by default
  const bn = raw.bookingNeeds ?? {};
  brief.bookingNeeds = {
    enabled:      bn.enabled      ?? false,
    realBookings: bn.realBookings ?? false,
  };
  if (brief.bookingNeeds.realBookings) {
    errors.push('real bookings are not allowed in the demo pipeline (NO_REAL_BOOKINGS)');
  }
  trace.bookingNeeds = raw.bookingNeeds ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // paymentNeeds — real payments forbidden
  const pn = raw.paymentNeeds ?? {};
  brief.paymentNeeds = {
    enabled:      pn.enabled      ?? false,
    realPayments: pn.realPayments ?? false,
  };
  if (brief.paymentNeeds.realPayments) {
    errors.push('real payments are not allowed in the demo pipeline (NO_REAL_PAYMENTS)');
  }
  trace.paymentNeeds = raw.paymentNeeds ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // contentNeeds
  const cn = raw.contentNeeds ?? {};
  brief.contentNeeds = {
    language:     cn.language     ?? 'es',
    multilingual: cn.multilingual ?? false,
  };
  trace.contentNeeds = raw.contentNeeds ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // devicePriority — inferred from audience if missing
  if (raw.devicePriority && KNOWN_DEVICE_PRIORITIES.has(raw.devicePriority)) {
    brief.devicePriority = raw.devicePriority;
    trace.devicePriority = FIELD_STATUS.PROVIDED;
  } else {
    brief.devicePriority = inferDevicePriority(brief.targetAudience);
    trace.devicePriority = FIELD_STATUS.INFERRED;
  }

  // accessibilityNeeds
  const an = raw.accessibilityNeeds ?? {};
  brief.accessibilityNeeds = { wcagLevel: an.wcagLevel ?? 'AA' };
  trace.accessibilityNeeds = raw.accessibilityNeeds ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // language
  brief.language = raw.language ?? 'es';
  trace.language = raw.language ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // legalConstraints
  const lc = raw.legalConstraints ?? {};
  brief.legalConstraints = {
    minorsPolicy: lc.minorsPolicy ?? false,
    gdpr:         lc.gdpr         ?? true,
    healthData:   lc.healthData   ?? false,
  };
  trace.legalConstraints = raw.legalConstraints ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  // specialRequirements
  brief.specialRequirements = Array.isArray(raw.specialRequirements) ? raw.specialRequirements : [];
  trace.specialRequirements = raw.specialRequirements ? FIELD_STATUS.PROVIDED : FIELD_STATUS.DEFAULTED;

  return {
    valid: errors.length === 0,
    brief,
    errors,
    warnings,
    fieldTrace: trace,
  };
}

export const BRIEF_SCHEMA = Object.freeze({
  version: ONE_PROMPT_SCHEMA_VERSION,
  validate: validateBrief,
  knownSectors: [...KNOWN_SECTORS],
  knownTones:   [...KNOWN_TONES],
  knownModules: [...KNOWN_MODULES],
});

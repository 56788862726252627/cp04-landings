/**
 * Business Analyzer — Phase 3
 * Deterministic analysis: brief → businessProfile + risk + compliance + needs.
 * Pure functions — no LLM. AI Router used only when ambiguity is real.
 */

export const BUSINESS_ANALYZER_VERSION = '1.0.0';

// ─── Risk Tiers ──────────────────────────────────────────────────────────────

const RISK_TIERS = Object.freeze({
  low:    { score: 1, label: 'Low Risk',    humanReview: false },
  medium: { score: 2, label: 'Medium Risk', humanReview: false },
  high:   { score: 3, label: 'High Risk',   humanReview: true  },
});

function classifyRisk(brief) {
  const factors = [];
  let score = 0;

  if (brief.legalConstraints?.healthData) { factors.push('health_data'); score += 2; }
  if (brief.legalConstraints?.minorsPolicy) { factors.push('minors_policy'); score += 2; }
  if (brief.paymentNeeds?.enabled) { factors.push('payment_handling'); score += 1; }
  if (brief.aiNeeds?.length > 0) { factors.push('ai_agents'); score += 1; }
  if (brief.dataNeeds?.sensitive) { factors.push('sensitive_data'); score += 2; }

  const tier = score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
  return { tier, score, factors, ...RISK_TIERS[tier] };
}

// ─── Compliance Profile ───────────────────────────────────────────────────────

function classifyCompliance(brief) {
  const requirements = [];

  if (brief.legalConstraints?.gdpr) requirements.push('GDPR');
  if (brief.legalConstraints?.healthData) requirements.push('LOPD_HEALTH', 'RGPD_HEALTH');
  if (brief.legalConstraints?.minorsPolicy) requirements.push('COPPA_EQUIVALENT', 'AGE_GATE');
  if (brief.paymentNeeds?.enabled) requirements.push('PCI_DSS_AWARENESS');
  if (brief.sector === 'legal') requirements.push('PROFESSIONAL_SECRECY');

  return {
    requirements,
    dataRetentionPolicy: brief.legalConstraints?.healthData ? '5_YEARS_MINIMUM' : 'STANDARD',
    consentRequired: brief.legalConstraints?.gdpr ?? true,
    privacyPolicyRequired: true,
    cookiePolicyRequired: true,
  };
}

// ─── Audience Profile ─────────────────────────────────────────────────────────

function classifyAudience(brief) {
  const raw = String(brief.targetAudience).toLowerCase();
  const segments = [];

  if (raw.includes('particular') || raw.includes('consumer') || raw.includes('b2c')) segments.push('B2C');
  if (raw.includes('empresa') || raw.includes('b2b') || raw.includes('business')) segments.push('B2B');
  if (raw.includes('senior') || raw.includes('mayor')) segments.push('SENIOR');
  if (raw.includes('youth') || raw.includes('joven') || raw.includes('young')) segments.push('YOUTH');
  if (raw.includes('professional')) segments.push('PROFESSIONAL');
  if (raw.includes('familia') || raw.includes('family')) segments.push('FAMILY');
  if (segments.length === 0) segments.push('GENERAL');

  const techSavvy = segments.includes('SENIOR') ? 'low' :
                    segments.includes('YOUTH') || segments.includes('B2B') ? 'high' : 'medium';

  return {
    segments,
    techSavvy,
    mobileProbability: segments.includes('YOUTH') || brief.devicePriority === 'mobile' ? 'high' :
                       segments.includes('SENIOR') ? 'low' : 'medium',
    accessibilityNeeds: segments.includes('SENIOR') ? 'enhanced' : 'standard',
  };
}

// ─── Module Needs Inference ───────────────────────────────────────────────────

const SECTOR_DEFAULT_MODULES = Object.freeze({
  dental:     ['dashboard', 'booking', 'patients', 'treatments', 'calendar', 'reminders', 'chatbot'],
  salud:      ['dashboard', 'booking', 'patients', 'history', 'calendar', 'reminders'],
  fisio:      ['dashboard', 'booking', 'patients', 'history', 'treatments', 'calendar', 'reminders'],
  estetica:   ['dashboard', 'booking', 'clients', 'gallery', 'calendar', 'loyalty'],
  spa:        ['dashboard', 'booking', 'clients', 'calendar', 'loyalty'],
  padel:      ['dashboard', 'booking', 'calendar', 'inventory', 'reports'],
  fitness:    ['dashboard', 'booking', 'clients', 'calendar', 'inventory', 'loyalty'],
  tech:       ['dashboard', 'analytics', 'crm', 'support', 'reports', 'roles'],
  educacion:  ['dashboard', 'students', 'calendar', 'documents', 'notifications'],
  legal:      ['dashboard', 'clients', 'documents', 'calendar', 'reports', 'crm'],
  consultoria:['dashboard', 'clients', 'calendar', 'reports', 'crm'],
  restaurante:['dashboard', 'booking', 'menu', 'loyalty', 'notifications'],
  comercio:   ['dashboard', 'inventory', 'clients', 'ecommerce', 'loyalty'],
  veterinary: ['dashboard', 'booking', 'patients', 'history', 'treatments', 'vaccinations', 'reminders', 'chatbot'],
  portfolio:  ['dashboard', 'gallery', 'clients', 'analytics'],
  analytics:  ['dashboard', 'analytics', 'reports', 'crm'],
});

function inferModuleNeeds(brief) {
  const defaultMods = SECTOR_DEFAULT_MODULES[brief.sector] ?? ['dashboard', 'booking', 'clients'];
  const provided    = brief.requiredModules ?? [];
  const optional    = brief.optionalModules ?? [];

  // Merge: provided takes priority, add defaults not already covered
  const merged = [...new Set([...provided, ...defaultMods])];

  if (brief.aiNeeds?.length > 0 && !merged.includes('chatbot')) merged.push('chatbot');
  if (brief.paymentNeeds?.enabled && !merged.includes('payments')) merged.push('payments');
  if (brief.bookingNeeds?.enabled && !merged.includes('booking')) merged.push('booking');

  return {
    required: merged,
    optional: optional.filter(m => !merged.includes(m)),
    inferred: defaultMods.filter(m => !provided.includes(m)),
    total: merged.length,
  };
}

// ─── Conversion Needs ─────────────────────────────────────────────────────────

function classifyConversion(brief) {
  const goal = brief.conversionGoal ?? 'contact';
  const ctaMap = {
    booking:     { primaryCta: 'Pedir cita',          secondaryCta: 'Conocer servicios', captureMethod: 'booking_form' },
    contact:     { primaryCta: 'Contactar',            secondaryCta: 'Ver servicios',     captureMethod: 'contact_form' },
    quote:       { primaryCta: 'Solicitar presupuesto',secondaryCta: 'Ver proyectos',     captureMethod: 'quote_form' },
    purchase:    { primaryCta: 'Comprar ahora',        secondaryCta: 'Ver catálogo',      captureMethod: 'cart' },
    demo:        { primaryCta: 'Probar demo',          secondaryCta: 'Conocer más',       captureMethod: 'demo_form' },
    enrollment:  { primaryCta: 'Inscribirse',          secondaryCta: 'Ver cursos',        captureMethod: 'enrollment_form' },
    reservation: { primaryCta: 'Reservar',             secondaryCta: 'Ver disponibilidad',captureMethod: 'reservation_form' },
  };
  return { goal, ...(ctaMap[goal] ?? ctaMap.contact) };
}

// ─── Content Needs ────────────────────────────────────────────────────────────

function classifyContentNeeds(brief) {
  return {
    language:      brief.language ?? 'es',
    multilingual:  brief.contentNeeds?.multilingual ?? false,
    demoDataNeeded: brief.dataNeeds?.demo ?? true,
    sensitiveContent: brief.legalConstraints?.healthData ?? false,
    mediaNeeds:    brief.sector === 'estetica' || brief.sector === 'portfolio' ? 'heavy' : 'light',
  };
}

// ─── Experience Needs ─────────────────────────────────────────────────────────

function classifyExperienceNeeds(brief) {
  const heavyMotionSectors  = new Set(['estetica', 'portfolio', 'restaurante', 'fitness', 'veterinary']);
  const lightMotionSectors  = new Set(['legal', 'consultoria', 'analytics']);
  const mobilePriority = brief.devicePriority === 'mobile' || brief.devicePriority === 'both';

  return {
    motionTier:      lightMotionSectors.has(brief.sector) ? 'subtle' :
                     heavyMotionSectors.has(brief.sector) ? 'expressive' : 'standard',
    mobilePriority,
    premiumExperience: true,
    accessibilityLevel: brief.accessibilityNeeds?.wcagLevel ?? 'AA',
  };
}

// ─── Main Analyzer ────────────────────────────────────────────────────────────

/**
 * Analyze a validated brief and produce a full business profile.
 * @param {Object} brief - Validated brief from onePromptSchema.validateBrief()
 * @returns {Object} businessProfile
 */
export function analyzeBusiness(brief = {}) {
  if (!brief || typeof brief !== 'object') {
    throw new Error('analyzeBusiness: brief must be an object');
  }

  const riskProfile       = classifyRisk(brief);
  const complianceProfile = classifyCompliance(brief);
  const audienceProfile   = classifyAudience(brief);
  const moduleNeeds       = inferModuleNeeds(brief);
  const conversionNeeds   = classifyConversion(brief);
  const contentNeeds      = classifyContentNeeds(brief);
  const experienceNeeds   = classifyExperienceNeeds(brief);

  const requiresHumanReview = riskProfile.humanReview ||
    brief.legalConstraints?.healthData ||
    brief.paymentNeeds?.realPayments ||
    brief.bookingNeeds?.realBookings;

  return {
    businessName:      brief.businessName,
    sector:            brief.sector,
    location:          brief.location,
    businessProfile:   { type: brief.businessType || brief.sector, scope: 'local', stage: 'demo' },
    sectorClassification: { id: brief.sector, label: brief.businessName, tier: 'standard' },
    verticalCandidate: brief.sector,
    audienceProfile,
    riskProfile,
    complianceProfile,
    moduleNeeds,
    automationNeeds:   brief.automationNeeds ?? [],
    aiNeeds:           brief.aiNeeds ?? [],
    conversionNeeds,
    contentNeeds,
    experienceNeeds,
    requiresHumanReview,
    analysisVersion:   BUSINESS_ANALYZER_VERSION,
  };
}

/**
 * Agency Packages — ESSENTIAL / PRO / PREMIUM
 * Commercial tier definitions. Prices are RANGES, not fixed quotes.
 * Actual price calculated by pricingEngine based on scope.
 */

export const PACKAGES_VERSION = '1.0.0';

export const PACKAGE_TIERS = Object.freeze({

  ESSENTIAL: {
    id:              'ESSENTIAL',
    name:            'Essential',
    tagline:         'Presencia profesional y gestión básica',
    targetBusiness:  'Microempresa o negocio unipersonal que da el primer paso digital.',
    setupPriceRange: { min: 1200, max: 2000, currency: 'EUR' },
    monthlyPriceRange:{ min: 120,  max: 180,  currency: 'EUR' },
    products:        ['landing-comercial', 'saas-local-pro'],
    landing:         true,
    saas:            true,
    modules: {
      max: 3,
      included: ['dashboard', 'booking', 'clients'],
    },
    roles:           { max: 2 },
    automations:     { max: 2 },
    aiAgents:        { max: 0 },
    integrations:    { max: 2, types: ['supabase', 'email'] },
    branding:        'STANDARD',
    analytics:       'BASIC',
    design:          'STANDARD',
    support:         'EMAIL',
    maintenance:     'BASIC',
    updates:         'SECURITY_ONLY',
    hostingScope:    'CLOUDFLARE_PAGES_FREE',
    backupScope:     'WEEKLY',
    QA:              'FUNCTIONAL_BASIC',
    security:        'STANDARD',
    training:        'NONE',
    handoff:         'DOCS_ONLY',
    revisionRounds:  1,
    includedSupportMonths: 1,
    customDevelopmentHours: 0,
    notes:           'Ideal para arrancar. Sin IA ni automatizaciones complejas.',
  },

  PRO: {
    id:              'PRO',
    name:            'Pro',
    tagline:         'SaaS completo con automatizaciones e integración WhatsApp-Make',
    targetBusiness:  'Pyme establecida que necesita gestión digital completa y automatizaciones.',
    setupPriceRange: { min: 2500, max: 4500, currency: 'EUR' },
    monthlyPriceRange:{ min: 250,  max: 380,  currency: 'EUR' },
    products:        ['landing-comercial', 'saas-local-pro', 'automatizacion-negocio'],
    landing:         true,
    saas:            true,
    modules: {
      max: 8,
      included: ['dashboard', 'booking', 'clients', 'calendar', 'notifications', 'reminders', 'chatbot', 'reports'],
    },
    roles:           { max: 4 },
    automations:     { max: 5 },
    aiAgents:        { max: 1 },
    integrations:    { max: 5, types: ['supabase', 'email', 'make', 'cloudflare', 'whatsapp_future'] },
    branding:        'PREMIUM',
    analytics:       'STANDARD',
    design:          'PREMIUM',
    support:         'EMAIL_PRIORITY',
    maintenance:     'PRO',
    updates:         'SECURITY_MINOR_CHANGES',
    hostingScope:    'CLOUDFLARE_PAGES_FREE',
    backupScope:     'DAILY',
    QA:              'FUNCTIONAL_FULL',
    security:        'STANDARD_PLUS',
    training:        '1_SESSION_2H',
    handoff:         'DOCS_VIDEO_WALKTHROUGH',
    revisionRounds:  3,
    includedSupportMonths: 3,
    customDevelopmentHours: 4,
    notes:           'El paquete más elegido. Equilibrio entre funcionalidad y presupuesto.',
  },

  PREMIUM: {
    id:              'PREMIUM',
    name:            'Premium',
    tagline:         'Suite completa con IA, multi-sede y soporte dedicado',
    targetBusiness:  'Empresa con operaciones complejas, múltiples roles y necesidad de IA.',
    setupPriceRange: { min: 5000, max: 9000, currency: 'EUR' },
    monthlyPriceRange:{ min: 450,  max: 700,  currency: 'EUR' },
    products:        ['landing-comercial', 'saas-local-pro', 'automatizacion-negocio', 'agente-ia'],
    landing:         true,
    saas:            true,
    modules: {
      max: 15,
      included: ['dashboard', 'booking', 'clients', 'calendar', 'notifications', 'reminders', 'chatbot', 'reports', 'analytics', 'roles', 'history', 'staff', 'inventory', 'loyalty', 'documents'],
    },
    roles:           { max: 8 },
    automations:     { max: 10 },
    aiAgents:        { max: 3 },
    integrations:    { max: 10, types: ['supabase', 'email', 'make', 'cloudflare', 'whatsapp', 'anthropic', 'googleCalendar', 'stripe', 'airtable', 'custom'] },
    branding:        'PREMIUM_CUSTOM',
    analytics:       'ADVANCED',
    design:          'PREMIUM_CUSTOM',
    support:         'DEDICATED',
    maintenance:     'PRIORITY',
    updates:         'FULL_SCOPE',
    hostingScope:    'CLOUDFLARE_PAGES_FREE',
    backupScope:     'DAILY_PLUS_POINT_IN_TIME',
    QA:              'FULL_E2E',
    security:        'ADVANCED',
    training:        '3_SESSIONS_2H',
    handoff:         'FULL_HANDOFF_PACKAGE',
    revisionRounds:  5,
    includedSupportMonths: 6,
    customDevelopmentHours: 16,
    notes:           'Para negocios que quieren lo mejor. Incluye IA y automatizaciones avanzadas.',
  },

});

export function getPackage(tierId) {
  return PACKAGE_TIERS[tierId] ?? null;
}

export function listPackageIds() {
  return Object.keys(PACKAGE_TIERS);
}

export function getPackageByModuleCount(moduleCount) {
  if (moduleCount <= 3) return 'ESSENTIAL';
  if (moduleCount <= 8) return 'PRO';
  return 'PREMIUM';
}

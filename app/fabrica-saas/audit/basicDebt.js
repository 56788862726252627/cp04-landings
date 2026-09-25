// Paso H — Basic Technical Debt Audit
// Categories: BASIC_BLOCKER / ACCEPTABLE_DEMO / ADVANCED_FUTURE / FALSE_POSITIVE

export const DEBT_CATEGORY = Object.freeze({
  BASIC_BLOCKER:    'BASIC_BLOCKER',
  ACCEPTABLE_DEMO:  'ACCEPTABLE_DEMO',
  ADVANCED_FUTURE:  'ADVANCED_FUTURE',
  FALSE_POSITIVE:   'FALSE_POSITIVE',
});

export const DEBT_PATTERN_TYPES = Object.freeze({
  TODO:        'TODO',
  FIXME:       'FIXME',
  HACK:        'HACK',
  PLACEHOLDER: 'PLACEHOLDER',
  STUB:        'STUB',
  DRY_RUN:     'DRY_RUN',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
});

const KNOWN_DEBT_ITEMS = [
  {
    id: 'DEBT-01',
    pattern: DEBT_PATTERN_TYPES.DRY_RUN,
    location: 'fabrica-saas/deploy/deployRunner.js',
    description: 'PRODUCTION deploy bloqueado por defecto (DRY_RUN)',
    category: DEBT_CATEGORY.ACCEPTABLE_DEMO,
    resolution: 'Diseño intencional de seguridad — no es deuda',
  },
  {
    id: 'DEBT-02',
    pattern: DEBT_PATTERN_TYPES.NOT_CONFIGURED,
    location: 'Adapter Stripe',
    description: 'STRIPE_SECRET_KEY en NOT_CONFIGURED en básica',
    category: DEBT_CATEGORY.ADVANCED_FUTURE,
    resolution: 'ADV-02: Stripe real es item avanzado, adapter aislado es el deliverable básico',
  },
  {
    id: 'DEBT-03',
    pattern: DEBT_PATTERN_TYPES.NOT_CONFIGURED,
    location: 'Adapter WhatsApp',
    description: 'WHATSAPP_TOKEN en NOT_CONFIGURED en básica',
    category: DEBT_CATEGORY.ADVANCED_FUTURE,
    resolution: 'ADV-03: WhatsApp real es item avanzado, adapter aislado es el deliverable básico',
  },
  {
    id: 'DEBT-04',
    pattern: DEBT_PATTERN_TYPES.PLACEHOLDER,
    location: 'fabrica-saas/deploy/visualQA.js',
    description: 'Visual QA browserRequired=true — sin ejecución headless',
    category: DEBT_CATEGORY.ADVANCED_FUTURE,
    resolution: 'ADV-01: Playwright E2E es item avanzado — plan es el deliverable básico',
  },
  {
    id: 'DEBT-05',
    pattern: DEBT_PATTERN_TYPES.STUB,
    location: 'fabrica-saas/bpmn/',
    description: 'Motor BPMN genera diagramas pero no ejecuta procesos',
    category: DEBT_CATEGORY.ADVANCED_FUTURE,
    resolution: 'ADV-09: Motor BPMN ejecutable es item avanzado',
  },
  {
    id: 'DEBT-06',
    pattern: DEBT_PATTERN_TYPES.PLACEHOLDER,
    location: 'fabrica-saas/commercial/maintenancePlans.js',
    description: 'Planes de mantenimiento son templates sin firma real de cliente',
    category: DEBT_CATEGORY.ACCEPTABLE_DEMO,
    resolution: 'Los planes son entregas documentales — la firma ocurre fuera del sistema',
  },
  {
    id: 'DEBT-07',
    pattern: DEBT_PATTERN_TYPES.DRY_RUN,
    location: 'fabrica-saas/deploy/cloudflareProfile.js',
    description: 'generateWranglerConfig no despliega — solo genera config',
    category: DEBT_CATEGORY.ACCEPTABLE_DEMO,
    resolution: 'Diseño correcto: generación de config ≠ ejecución de deploy',
  },
  {
    id: 'DEBT-08',
    pattern: DEBT_PATTERN_TYPES.STUB,
    location: 'fabrica-saas/lifecycle/clientLifecycleModel.js',
    description: 'qualifyClient retorna QUALIFIED para todos los inputs válidos sin scoring real',
    category: DEBT_CATEGORY.ACCEPTABLE_DEMO,
    resolution: 'Scoring real requiere integración CRM — modelo de datos es el deliverable básico',
  },
  {
    id: 'DEBT-09',
    pattern: DEBT_PATTERN_TYPES.PLACEHOLDER,
    location: 'fabrica-saas/deploy/dependencySecurity.js',
    description: 'auditDependencies no ejecuta npm audit real — modelo de datos',
    category: DEBT_CATEGORY.ACCEPTABLE_DEMO,
    resolution: 'En CI/CD real se ejecuta npm audit — el modelo define qué se reporta',
  },
];

export function auditBasicDebt(additionalItems = []) {
  const items = [...KNOWN_DEBT_ITEMS, ...additionalItems];

  const byCategory = {
    [DEBT_CATEGORY.BASIC_BLOCKER]:   items.filter((i) => i.category === DEBT_CATEGORY.BASIC_BLOCKER),
    [DEBT_CATEGORY.ACCEPTABLE_DEMO]: items.filter((i) => i.category === DEBT_CATEGORY.ACCEPTABLE_DEMO),
    [DEBT_CATEGORY.ADVANCED_FUTURE]: items.filter((i) => i.category === DEBT_CATEGORY.ADVANCED_FUTURE),
    [DEBT_CATEGORY.FALSE_POSITIVE]:  items.filter((i) => i.category === DEBT_CATEGORY.FALSE_POSITIVE),
  };

  const blockers = byCategory[DEBT_CATEGORY.BASIC_BLOCKER];

  return {
    valid: blockers.length === 0,
    totalItems: items.length,
    basicBlockers: blockers.length,
    acceptableDemo: byCategory[DEBT_CATEGORY.ACCEPTABLE_DEMO].length,
    advancedFuture: byCategory[DEBT_CATEGORY.ADVANCED_FUTURE].length,
    falsePositives: byCategory[DEBT_CATEGORY.FALSE_POSITIVE].length,
    items,
    byCategory,
    debtStatus: blockers.length === 0 ? 'ACCEPTABLE' : 'BLOCKED',
    summary: `${blockers.length} blockers, ${byCategory[DEBT_CATEGORY.ACCEPTABLE_DEMO].length} acceptable, ${byCategory[DEBT_CATEGORY.ADVANCED_FUTURE].length} deferred`,
  };
}

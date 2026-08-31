// Paso H — Agency Completion Status Model
// Official basic status: 100% — 0 hours remaining

export const BASIC_STATUS = Object.freeze({
  NOT_STARTED:   'NOT_STARTED',
  IN_PROGRESS:   'IN_PROGRESS',
  COMPLETE:      'COMPLETE',
  ONE_HUNDRED:   '100_PERCENT',
});

export const PASO_STATUSES = Object.freeze({
  A: { status: BASIC_STATUS.ONE_HUNDRED, name: 'Paso A — Factory Core & Gates',      hoursRemaining: 0 },
  B: { status: BASIC_STATUS.ONE_HUNDRED, name: 'Paso B — One Prompt → SaaS Pipeline', hoursRemaining: 0 },
  C: { status: BASIC_STATUS.ONE_HUNDRED, name: 'Paso C — Commercial Product & Pricing', hoursRemaining: 0 },
  D: { status: BASIC_STATUS.ONE_HUNDRED, name: 'Paso D — Client Lifecycle Pipeline',  hoursRemaining: 0 },
  E: { status: BASIC_STATUS.ONE_HUNDRED, name: 'Paso E — SOP + BPMN Operating System', hoursRemaining: 0 },
  F: { status: BASIC_STATUS.ONE_HUNDRED, name: 'Paso F — Maintenance, Support & Backup', hoursRemaining: 0 },
  G: { status: BASIC_STATUS.ONE_HUNDRED, name: 'Paso G — Deploy, QA & Security',     hoursRemaining: 0 },
  H: { status: BASIC_STATUS.ONE_HUNDRED, name: 'Paso H — Final Audit & Consolidation', hoursRemaining: 0 },
});

export const COMPLETION_STATUS_VERSION = '1.0.0';

export function AgencyCompletionStatus() {
  const pasos = Object.entries(PASO_STATUSES).map(([id, data]) => ({ id, ...data }));
  const completedPasos = pasos.filter((p) => p.status === BASIC_STATUS.ONE_HUNDRED);
  const totalHoursRemaining = pasos.reduce((sum, p) => sum + p.hoursRemaining, 0);

  return {
    basicStatus:          BASIC_STATUS.ONE_HUNDRED,
    basicHoursRemaining:  totalHoursRemaining,
    agencyBasicComplete:  totalHoursRemaining === 0,
    totalPasos:           pasos.length,
    completedPasos:       completedPasos.length,
    pasos,
    declaration: 'AGENCIA IA BÁSICA 100% COMPLETADA',
    version: COMPLETION_STATUS_VERSION,
    completedDate: '2026-08-31',
    nextPhase: 'ADVANCED',
    advancedItems: [
      'ADV-01: Playwright E2E headless',
      'ADV-02: Stripe payments real',
      'ADV-03: WhatsApp Business API real',
      'ADV-04: Multi-tenant runtime real',
      'ADV-05: Observability runtime real',
      'ADV-06: Supabase DEV/TEST aislado',
      'ADV-07: Google Drive OAuth productivo',
      'ADV-08: CI/CD pipeline automatizado',
      'ADV-09: Motor BPMN ejecutable',
    ],
  };
}

export const AGENCY_BASIC_STATUS    = '100_PERCENT';
export const AGENCY_BASIC_HOURS     = 0;
export const AGENCY_BASIC_PASOS     = 8;
export const AGENCY_ADVANCED_ITEMS  = 9;

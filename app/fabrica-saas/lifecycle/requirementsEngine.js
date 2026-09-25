/**
 * Requirements Engine
 * Builds structured requirements from a diagnostic + onboarding.
 */

export const REQUIREMENTS_ENGINE_VERSION = '1.0.0';

export const REQ_TYPES = Object.freeze({
  FUNCTIONAL:    'FUNCTIONAL',
  NON_FUNCTIONAL:'NON_FUNCTIONAL',
  DATA:          'DATA',
  SECURITY:      'SECURITY',
  PRIVACY:       'PRIVACY',
  INTEGRATION:   'INTEGRATION',
  AI:            'AI',
  AUTOMATION:    'AUTOMATION',
  UX:            'UX',
  ACCESSIBILITY: 'ACCESSIBILITY',
  PERFORMANCE:   'PERFORMANCE',
  OPERATIONS:    'OPERATIONS',
});

export const REQ_PRIORITIES = Object.freeze({ P0: 'P0', P1: 'P1', P2: 'P2', P3: 'P3' });
export const REQ_STATUS     = Object.freeze({ PROPOSED: 'PROPOSED', CONFIRMED: 'CONFIRMED', DEFERRED: 'DEFERRED', REJECTED: 'REJECTED', BLOCKED: 'BLOCKED' });

let _reqCounter = 0;
function reqId(type) {
  _reqCounter++;
  return `REQ-${type.slice(0, 3).toUpperCase()}-${String(_reqCounter).padStart(3, '0')}`;
}

function req(type, priority, description, options = {}) {
  return {
    id:                reqId(type),
    type,
    description,
    priority,
    source:            options.source ?? 'diagnostic',
    status:            REQ_STATUS.PROPOSED,
    acceptanceCriteria: options.ac ?? `${description} funciona sin errores en QA.`,
    dependencies:      options.deps ?? [],
    risk:              options.risk ?? 'LOW',
    humanReviewRequired: options.humanReview ?? false,
  };
}

/**
 * @param {Object} diagnostic - output of diagnoseBusiness()
 * @param {Object} onboarding - validated onboarding data
 * @returns {Object} RequirementsResult
 */
export function buildRequirements(diagnostic = {}, onboarding = {}) {
  _reqCounter = 0;
  const data = onboarding.data ?? onboarding;
  const reqs = [];

  // ── FUNCTIONAL ────────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.FUNCTIONAL, REQ_PRIORITIES.P0, 'Panel de administración para gestión del negocio'));
  reqs.push(req(REQ_TYPES.FUNCTIONAL, REQ_PRIORITIES.P0, 'Sistema de reservas/citas con calendario integrado'));
  reqs.push(req(REQ_TYPES.FUNCTIONAL, REQ_PRIORITIES.P0, 'Gestión de clientes (alta, edición, historial)'));
  reqs.push(req(REQ_TYPES.FUNCTIONAL, REQ_PRIORITIES.P1, 'Notificaciones y recordatorios automáticos'));
  reqs.push(req(REQ_TYPES.FUNCTIONAL, REQ_PRIORITIES.P1, 'Landing page comercial con formulario de captación'));

  if ((data.services ?? []).length > 3) {
    reqs.push(req(REQ_TYPES.FUNCTIONAL, REQ_PRIORITIES.P1, 'Catálogo de servicios con precios y disponibilidad'));
  }
  if (data.currentCRM === 'none' || !data.currentCRM) {
    reqs.push(req(REQ_TYPES.FUNCTIONAL, REQ_PRIORITIES.P1, 'Módulo de seguimiento de leads y pipeline'));
  }

  // ── NON-FUNCTIONAL ────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.NON_FUNCTIONAL, REQ_PRIORITIES.P0, 'Tiempo de carga < 3 segundos en conexión 4G', { ac: 'LCP < 2.5s medido en Lighthouse' }));
  reqs.push(req(REQ_TYPES.NON_FUNCTIONAL, REQ_PRIORITIES.P0, 'Disponibilidad del sistema ≥ 99% (objetivo, no SLA)'));
  reqs.push(req(REQ_TYPES.NON_FUNCTIONAL, REQ_PRIORITIES.P1, 'Compatible con los 3 principales navegadores + móvil'));

  // ── DATA ─────────────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.DATA, REQ_PRIORITIES.P0, 'Almacenamiento de datos de clientes en Supabase'));
  reqs.push(req(REQ_TYPES.DATA, REQ_PRIORITIES.P1, 'Exportación de datos en CSV/JSON para el cliente'));
  if (data.legalConstraints?.healthData) {
    reqs.push(req(REQ_TYPES.DATA, REQ_PRIORITIES.P0, 'Datos clínicos con acceso restringido por rol', { risk: 'HIGH', humanReview: true }));
  }

  // ── SECURITY ─────────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.SECURITY, REQ_PRIORITIES.P0, 'Autenticación segura con Supabase Auth'));
  reqs.push(req(REQ_TYPES.SECURITY, REQ_PRIORITIES.P0, 'Control de acceso por roles (RBAC)'));
  reqs.push(req(REQ_TYPES.SECURITY, REQ_PRIORITIES.P1, 'HTTPS forzado + headers de seguridad'));

  // ── PRIVACY ──────────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.PRIVACY, REQ_PRIORITIES.P0, 'Cumplimiento GDPR: consentimiento, retención, eliminación'));
  if (data.legalConstraints?.healthData) {
    reqs.push(req(REQ_TYPES.PRIVACY, REQ_PRIORITIES.P0, 'Política de datos sanitarios (RGPD Art. 9)', { risk: 'HIGH', humanReview: true }));
  }
  if (data.legalConstraints?.minorsPolicy) {
    reqs.push(req(REQ_TYPES.PRIVACY, REQ_PRIORITIES.P0, 'Control de edad y política de menores', { risk: 'HIGH', humanReview: true }));
  }

  // ── INTEGRATION ──────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.INTEGRATION, REQ_PRIORITIES.P1, 'Integración con Google Calendar para sincronización de citas'));
  reqs.push(req(REQ_TYPES.INTEGRATION, REQ_PRIORITIES.P1, 'Email transaccional (Resend / SendGrid)'));
  if ((data.requiredChannels ?? []).includes('whatsapp')) {
    reqs.push(req(REQ_TYPES.INTEGRATION, REQ_PRIORITIES.P2, 'Canal WhatsApp Business para notificaciones', { deps: ['whatsapp-api-account'] }));
  }

  // ── AI ───────────────────────────────────────────────────────────────────
  if ((diagnostic.aiOpportunities ?? []).length > 0) {
    reqs.push(req(REQ_TYPES.AI, REQ_PRIORITIES.P2, 'Asistente FAQ con IA (Anthropic Claude)', { deps: ['anthropic-api-key'] }));
    reqs.push(req(REQ_TYPES.AI, REQ_PRIORITIES.P2, 'Asistente de reservas por lenguaje natural'));
  }

  // ── AUTOMATION ───────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.AUTOMATION, REQ_PRIORITIES.P1, 'Automatización: confirmación de cita por email (Make)'));
  reqs.push(req(REQ_TYPES.AUTOMATION, REQ_PRIORITIES.P1, 'Automatización: recordatorio 24h antes de cita (Make)'));
  if ((diagnostic.automationOpportunities ?? []).some(a => a.includes('WhatsApp'))) {
    reqs.push(req(REQ_TYPES.AUTOMATION, REQ_PRIORITIES.P2, 'Automatización: notificaciones WhatsApp'));
  }

  // ── UX ───────────────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.UX, REQ_PRIORITIES.P0, 'Diseño mobile-first responsive'));
  reqs.push(req(REQ_TYPES.UX, REQ_PRIORITIES.P1, 'Flujo de reserva en ≤ 3 pasos en móvil'));
  reqs.push(req(REQ_TYPES.UX, REQ_PRIORITIES.P1, 'Mensajes de error claros y accionables'));

  // ── ACCESSIBILITY ─────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.ACCESSIBILITY, REQ_PRIORITIES.P1, 'Contraste mínimo WCAG 2.1 AA (4.5:1)'));
  reqs.push(req(REQ_TYPES.ACCESSIBILITY, REQ_PRIORITIES.P2, 'Navegación por teclado en formularios principales'));

  // ── PERFORMANCE ───────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.PERFORMANCE, REQ_PRIORITIES.P1, 'Lighthouse Performance score ≥ 80 en móvil'));
  reqs.push(req(REQ_TYPES.PERFORMANCE, REQ_PRIORITIES.P2, 'Código lazy-loaded para módulos secundarios'));

  // ── OPERATIONS ────────────────────────────────────────────────────────────
  reqs.push(req(REQ_TYPES.OPERATIONS, REQ_PRIORITIES.P1, 'Backup automático de base de datos (Supabase schedule)'));
  reqs.push(req(REQ_TYPES.OPERATIONS, REQ_PRIORITIES.P2, 'Documentación de operaciones para el cliente'));

  // Check for critical missing
  const criticalMissing = reqs
    .filter(r => r.priority === REQ_PRIORITIES.P0 && r.humanReviewRequired)
    .map(r => r.id);

  const byType = {};
  for (const r of reqs) {
    (byType[r.type] = byType[r.type] ?? []).push(r);
  }

  return {
    requirements:     reqs,
    total:            reqs.length,
    byType,
    byPriority: {
      P0: reqs.filter(r => r.priority === REQ_PRIORITIES.P0),
      P1: reqs.filter(r => r.priority === REQ_PRIORITIES.P1),
      P2: reqs.filter(r => r.priority === REQ_PRIORITIES.P2),
      P3: reqs.filter(r => r.priority === REQ_PRIORITIES.P3),
    },
    criticalMissing,
    humanReviewRequired: criticalMissing.length > 0,
    requirementsComplete: true,
    version: REQUIREMENTS_ENGINE_VERSION,
  };
}

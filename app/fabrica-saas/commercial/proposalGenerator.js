/**
 * Proposal Generator — Declarative
 * Produces a structured commercial proposal from a CommercialEstimate.
 * NOT a legal document. NOT a binding contract.
 *
 * Output: a data structure suitable for rendering as PDF, Markdown, or email.
 */

import { COMMERCIAL_ESTIMATE_VERSION } from './commercialEstimate.js';

export const PROPOSAL_GENERATOR_VERSION = '1.0.0';

const SECTION_LABELS = Object.freeze({
  executiveSummary:    'Resumen Ejecutivo',
  businessProblem:     'Diagnóstico del Negocio',
  recommendedSolution: 'Solución Recomendada',
  includedScope:       'Alcance Incluido',
  deliverables:        'Entregables',
  timelineEstimate:    'Estimación de Plazos',
  setupEstimate:       'Inversión Inicial (Setup)',
  monthlyEstimate:     'Coste Mensual Estimado',
  addons:              'Módulos y Add-ons Adicionales',
  thirdPartyCosts:     'Costes de Terceros (Gestión Cliente)',
  assumptions:         'Supuestos de la Estimación',
  exclusions:          'Exclusiones',
  nextSteps:           'Próximos Pasos',
});

const TIMELINE_BY_TIER = Object.freeze({
  ESSENTIAL: { min: 3, max: 5,  unit: 'semanas' },
  PRO:       { min: 6, max: 10, unit: 'semanas' },
  PREMIUM:   { min: 10, max: 16, unit: 'semanas' },
});

/**
 * Generates a commercial proposal from a CommercialEstimate.
 * @param {Object} estimate  - output from generateEstimate()
 * @param {Object} options
 * @param {string} [options.agencyName='Agencia IA']
 * @param {string} [options.contactEmail]
 * @param {string} [options.generatedAt]   - ISO date string
 * @returns {Object} CommercialProposal
 */
export function generateProposal(estimate = {}, options = {}) {
  const agencyName   = options.agencyName  ?? 'Agencia IA';
  const contactEmail = options.contactEmail ?? 'hola@agencia-ia.es';
  const generatedAt  = options.generatedAt  ?? new Date().toISOString().split('T')[0];
  const tier         = estimate.recommendedPackage ?? 'PRO';
  const businessName = estimate.business?.name ?? 'Empresa';
  const timeline     = TIMELINE_BY_TIER[tier] ?? TIMELINE_BY_TIER.PRO;

  const sections = {

    executiveSummary: {
      label:   SECTION_LABELS.executiveSummary,
      content: `Esta propuesta recoge la estimación de desarrollo de una plataforma SaaS a medida para ${businessName}. ` +
               `El paquete recomendado es ${tier} (${estimate.packageName ?? tier}), ` +
               `con una inversión inicial estimada de €${estimate.setupRange?.[0]}-${estimate.setupRange?.[1]} ` +
               `y un coste mensual de €${estimate.monthlyRange?.[0]}-${estimate.monthlyRange?.[1]}.`,
      disclaimer: 'DOCUMENTO ORIENTATIVO — NO ES UN CONTRATO NI UN COMPROMISO AUTOMÁTICO.',
    },

    businessProblem: {
      label:   SECTION_LABELS.businessProblem,
      content: `Sector: ${estimate.business?.sector ?? 'No especificado'}. ` +
               `Complejidad detectada: ${estimate.complexityScore ?? 'N/A'}/10. ` +
               `Se han identificado los siguientes retos principales:`,
      risks: estimate.risks ?? [],
    },

    recommendedSolution: {
      label:    SECTION_LABELS.recommendedSolution,
      tier,
      reasoning: estimate.recommendationReasoning ?? [],
      packageName: estimate.packageName ?? tier,
      content:  `El paquete ${tier} es el ajuste óptimo para el alcance declarado. ` +
                `Incluye las capacidades necesarias sin sobredimensionar la inversión inicial.`,
    },

    includedScope: {
      label: SECTION_LABELS.includedScope,
      items: buildIncludedScopeItems(estimate),
    },

    deliverables: {
      label: SECTION_LABELS.deliverables,
      items: buildDeliverables(estimate),
    },

    timelineEstimate: {
      label:   SECTION_LABELS.timelineEstimate,
      min:     timeline.min,
      max:     timeline.max,
      unit:    timeline.unit,
      content: `Plazo estimado de entrega: ${timeline.min}-${timeline.max} ${timeline.unit} desde el inicio del proyecto. ` +
               `Sujeto a disponibilidad del cliente y validaciones por fase.`,
      phases: [
        { phase: 1, name: 'Diagnóstico y configuración', weeks: '1-2' },
        { phase: 2, name: 'Desarrollo y configuración de módulos', weeks: `2-${Math.round(timeline.max * 0.6)}` },
        { phase: 3, name: 'Pruebas y ajustes', weeks: `${Math.round(timeline.max * 0.7)}-${timeline.max - 1}` },
        { phase: 4, name: 'Entrega, formación y puesta en marcha', weeks: `${timeline.max - 1}-${timeline.max}` },
      ],
    },

    setupEstimate: {
      label:    SECTION_LABELS.setupEstimate,
      range:    estimate.setupRange ?? [0, 0],
      currency: estimate.currency ?? 'EUR',
      drivers:  estimate.priceDrivers ?? [],
      note:     'La inversión inicial cubre diseño, desarrollo, configuración, integración y primera puesta en marcha.',
    },

    monthlyEstimate: {
      label:    SECTION_LABELS.monthlyEstimate,
      range:    estimate.monthlyRange ?? [0, 0],
      currency: estimate.currency ?? 'EUR',
      note:     'El coste mensual cubre alojamiento, actualizaciones y soporte básico incluido en el paquete.',
      maintenance: estimate.maintenance ?? null,
    },

    addons: {
      label: SECTION_LABELS.addons,
      items: estimate.addons ?? [],
      note:  'Los add-ons se presupuestan por separado y se añaden al coste base según necesidad.',
    },

    thirdPartyCosts: {
      label: SECTION_LABELS.thirdPartyCosts,
      items: (estimate.thirdPartyCosts ?? []).map(c => ({
        service:        c.service,
        monthlyRange:   c.monthlyRange,
        responsibility: c.responsibility,
        note:           c.note,
      })),
      note: 'Estos costes son abonados directamente por el cliente a cada proveedor. NO son margen de agencia.',
    },

    assumptions: {
      label: SECTION_LABELS.assumptions,
      items: estimate.assumptions ?? [],
    },

    exclusions: {
      label: SECTION_LABELS.exclusions,
      items: estimate.exclusions ?? [],
      note:  'Todo lo no mencionado explícitamente en el alcance incluido queda excluido de esta estimación.',
    },

    nextSteps: {
      label: SECTION_LABELS.nextSteps,
      items: [
        'Revisión de esta propuesta por ambas partes.',
        'Sesión de diagnóstico técnico (30-60 min) para confirmar alcance.',
        'Ajuste de estimación si el scope varía significativamente.',
        'Firma del contrato de servicios y acuerdo de confidencialidad.',
        'Pago del 50% inicial para inicio del proyecto.',
        'Kick-off del proyecto.',
      ],
      humanReviewRequired: estimate.humanReviewRequired ?? false,
      questionsForHumanReview: estimate.questionsForHumanReview ?? [],
    },

  };

  return {
    proposalType:     'COMMERCIAL_PROPOSAL',
    disclaimer:       'PROPUESTA COMERCIAL ORIENTATIVA. NO ES UN CONTRATO. NO TIENE VALIDEZ LEGAL AUTÓNOMA. Sujeto a negociación y contrato formal.',
    version:          PROPOSAL_GENERATOR_VERSION,
    estimateVersion:  COMMERCIAL_ESTIMATE_VERSION,
    generatedAt,
    validity:         estimate.validity ?? '30 días desde emisión',

    agency: {
      name:         agencyName,
      contactEmail,
    },

    client: {
      name:   businessName,
      sector: estimate.business?.sector ?? 'default',
    },

    sections,
    dependencies:          estimate.dependencies ?? [],
    humanReviewRequired:   estimate.humanReviewRequired ?? false,
    complexityScore:       estimate.complexityScore ?? 0,
  };
}

// --- helpers ---

function buildIncludedScopeItems(estimate) {
  const items = [];
  const tier  = estimate.recommendedPackage ?? 'PRO';

  const scopeMap = {
    ESSENTIAL: [
      'Hasta 3 módulos configurados',
      'Hasta 2 automatizaciones Make',
      'Hasta 2 roles de usuario',
      'Landing page comercial',
      'Panel de administración básico',
      'Despliegue en Cloudflare Pages',
      '1 mes de soporte post-entrega incluido',
    ],
    PRO: [
      'Hasta 8 módulos configurados',
      'Hasta 5 automatizaciones Make',
      'Hasta 4 roles de usuario',
      'Hasta 1 agente de IA',
      'Landing page comercial premium',
      'Panel de administración avanzado',
      'Despliegue en Cloudflare Pages',
      '3 meses de soporte post-entrega incluido',
      '4 horas de desarrollo personalizado',
      'Migración de hasta 500 registros',
    ],
    PREMIUM: [
      'Hasta 15 módulos configurados',
      'Hasta 10 automatizaciones Make',
      'Hasta 8 roles de usuario',
      'Hasta 3 agentes de IA',
      '2 landing pages',
      'Diseño premium personalizado',
      'Analytics avanzado',
      'Despliegue en Cloudflare Pages',
      '6 meses de soporte post-entrega incluido',
      '16 horas de desarrollo personalizado',
      'Migración de hasta 5.000 registros',
      'White-label disponible',
      '1 idioma adicional',
    ],
  };

  items.push(...(scopeMap[tier] ?? scopeMap.PRO));
  return items;
}

function buildDeliverables(estimate) {
  const tier = estimate.recommendedPackage ?? 'PRO';

  return [
    'Aplicación web SaaS desplegada y funcional',
    'Panel de administración configurado',
    'Automatizaciones Make configuradas y documentadas',
    tier !== 'ESSENTIAL' ? 'Agente(s) de IA configurado(s) (si aplica)' : null,
    'Guía de uso (documento interno)',
    'Acceso a repositorio de código fuente (opcional)',
    'Sesión de formación y entrega (1h)',
    `${tier === 'ESSENTIAL' ? '1' : tier === 'PRO' ? '3' : '6'} mes(es) de soporte por email post-entrega`,
  ].filter(Boolean);
}

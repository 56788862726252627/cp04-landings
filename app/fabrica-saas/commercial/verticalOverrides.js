/**
 * Vertical Pricing Overrides
 * Complexity/compliance multipliers per sector.
 * CORE COMMERCIAL + VERTICAL OVERRIDES — no duplication of full catalog.
 */

export const VERTICAL_OVERRIDES_VERSION = '1.0.0';

const BASE_MULTIPLIER = 1.0;

export const VERTICAL_PRICING_OVERRIDES = Object.freeze({
  dental:       { multiplier: 1.20, reason: 'Compliance sanitario, historial clínico, datos sensibles', complianceReqs: ['GDPR_HEALTH', 'DATA_RETENTION_5Y'] },
  salud:        { multiplier: 1.20, reason: 'Datos de salud, consentimientos', complianceReqs: ['GDPR_HEALTH'] },
  fisio:        { multiplier: 1.20, reason: 'Historial de sesiones, datos clínicos', complianceReqs: ['GDPR_HEALTH'] },
  psicologia:   { multiplier: 1.30, reason: 'Datos altamente sensibles, confidencialidad reforzada', complianceReqs: ['GDPR_SENSITIVE', 'PROFESSIONAL_SECRECY'] },
  legal:        { multiplier: 1.30, reason: 'Confidencialidad legal, expedientes sensibles', complianceReqs: ['GDPR_SENSITIVE', 'PROFESSIONAL_SECRECY'] },
  veterinary:   { multiplier: 1.00, reason: 'Sector estándar, sin compliance especial', complianceReqs: ['GDPR_STANDARD'] },
  educacion:    { multiplier: 1.10, reason: 'Menores de edad, protección datos adicional', complianceReqs: ['GDPR_MINORS', 'LOPD'] },
  tech:         { multiplier: 1.15, reason: 'Integraciones técnicas complejas, APIs custom', complianceReqs: ['GDPR_STANDARD'] },
  consultoria:  { multiplier: 1.10, reason: 'Datos empresariales confidenciales', complianceReqs: ['GDPR_STANDARD'] },
  padel:        { multiplier: 0.90, reason: 'Flujos simples, baja complejidad', complianceReqs: ['GDPR_STANDARD'] },
  fitness:      { multiplier: 0.90, reason: 'Flujos simples, standard', complianceReqs: ['GDPR_STANDARD'] },
  estetica:     { multiplier: 0.95, reason: 'Bajo riesgo, flujos sencillos', complianceReqs: ['GDPR_STANDARD'] },
  spa:          { multiplier: 0.95, reason: 'Bajo riesgo, sin datos sensibles', complianceReqs: ['GDPR_STANDARD'] },
  restaurante:  { multiplier: 0.85, reason: 'Mínima complejidad, sin datos sensibles', complianceReqs: ['GDPR_STANDARD'] },
  comercio:     { multiplier: 0.85, reason: 'Estándar, sin compliance especial', complianceReqs: ['GDPR_STANDARD'] },
  portfolio:    { multiplier: 0.80, reason: 'Sin gestión de datos de clientes en mayoría de casos', complianceReqs: [] },
  analytics:    { multiplier: 1.15, reason: 'Integraciones de datos, dashboards complejos', complianceReqs: ['GDPR_STANDARD'] },
});

export function getVerticalMultiplier(sector) {
  return VERTICAL_PRICING_OVERRIDES[sector]?.multiplier ?? BASE_MULTIPLIER;
}

export function getVerticalOverride(sector) {
  return VERTICAL_PRICING_OVERRIDES[sector] ?? { multiplier: BASE_MULTIPLIER, reason: 'Sector no especificado — usando base', complianceReqs: ['GDPR_STANDARD'] };
}

export function applyVerticalMultiplier(basePrice, sector) {
  const multiplier = getVerticalMultiplier(sector);
  return Math.round(basePrice * multiplier);
}

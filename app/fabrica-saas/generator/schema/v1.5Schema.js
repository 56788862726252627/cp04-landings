/**
 * GENERATOR · v1.5Schema.js · Validación de campos V1.5
 * Documenta y valida los campos nuevos del manifest formato V1.5.
 */

export const V15_BRANDING_FIELDS = ['tagline', 'secondaryColor', 'accentColor', 'tono'];
export const V15_EXPERIENCE_FIELDS = ['publica', 'interna', 'booking_cta'];
export const V15_MODULES = ['landing', 'agenda', 'tratamientos', 'profesionales', 'presupuestos'];
export const ALL_MODULES = [
  'landing', 'chatbot_ia', 'agenda', 'tratamientos', 'crm', 'pacientes_crm',
  'profesionales', 'recuperacion_leads', 'presupuestos', 'dashboard',
];

/**
 * Validates V1.5-specific fields in a manifest.
 * Returns { valid, warnings, v15Fields }.
 */
export function validateV15Fields(manifest) {
  const warnings = [];
  const v15Fields = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, warnings: ['manifest must be an object'], v15Fields: [] };
  }

  const br = manifest.branding ?? {};
  const exp = manifest.experiencia ?? {};
  const mods = manifest.modules ?? [];

  // Branding V1.5 fields
  for (const field of V15_BRANDING_FIELDS) {
    if (br[field]) {
      v15Fields.push(`branding.${field}`);
    } else {
      warnings.push(`branding.${field} not set (optional V1.5 field)`);
    }
  }

  // Experience fields
  for (const field of V15_EXPERIENCE_FIELDS) {
    if (exp[field] !== undefined) {
      v15Fields.push(`experiencia.${field}`);
    } else {
      warnings.push(`experiencia.${field} not set (optional V1.5 field)`);
    }
  }

  // Module coverage
  const v15ModsPresent = V15_MODULES.filter(m => mods.includes(m));
  if (v15ModsPresent.length > 0) {
    v15Fields.push(`modules: [${v15ModsPresent.join(', ')}]`);
  } else {
    warnings.push('No V1.5 modules detected (landing, agenda, tratamientos, profesionales, presupuestos)');
  }

  // Unknown modules
  const unknown = mods.filter(m => !ALL_MODULES.includes(m));
  if (unknown.length > 0) {
    warnings.push(`Unknown modules: ${unknown.join(', ')} — will be ignored by generators`);
  }

  // Required base fields
  const hasBusiness = manifest.business?.slug && manifest.business?.name && manifest.business?.vertical;
  if (!hasBusiness) {
    return { valid: false, warnings: ['business.slug, business.name, and business.vertical are required', ...warnings], v15Fields };
  }

  return { valid: true, warnings, v15Fields };
}

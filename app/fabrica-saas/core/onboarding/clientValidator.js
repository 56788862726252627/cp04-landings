/**
 * CORE V1.3 · ClientValidator (Phase 7)
 * Valida que un cliente esté listo para staging/producción.
 * NO hace llamadas externas. Todo local.
 */

import { validateSingleInputManifest } from '../../generator/schema/singleInputSchema.js';

const PRODUCTION_REQUIRED_FIELDS = [
  'business.name', 'business.slug', 'business.email',
  'vertical', 'branding.primaryColor',
  'integraciones.apiBaseUrl', 'integraciones.domain',
];

const STAGING_REQUIRED_FIELDS = [
  'business.name', 'business.slug', 'vertical',
];

export function validateForStaging(manifest) {
  const schemaErrors = validateSingleInputManifest(manifest);
  if (schemaErrors.length) return { ok: false, stage: 'staging', errors: schemaErrors };

  const missing = STAGING_REQUIRED_FIELDS.filter(path => !_get(manifest, path));
  if (missing.length) return { ok: false, stage: 'staging', errors: missing.map(f => `Campo requerido: ${f}`) };

  const warnings = [];
  if (manifest.modo_demo !== false) warnings.push('modo_demo activo — no desplegar en staging de cliente real');
  if (!manifest.integraciones?.apiBaseUrl) warnings.push('apiBaseUrl vacío — usando placeholder');

  return { ok: true, stage: 'staging', warnings };
}

export function validateForProduction(manifest) {
  const stagingResult = validateForStaging(manifest);
  if (!stagingResult.ok) return { ...stagingResult, stage: 'production' };

  const errors = [];

  if (manifest.modo_demo === true) errors.push('modo_demo debe ser false para producción');
  if (manifest.integraciones?.reales !== true) errors.push('integraciones.reales debe ser true para producción');

  const missingProd = PRODUCTION_REQUIRED_FIELDS.filter(path => !_get(manifest, path) || _get(manifest, path) === 'NOT_CONFIGURED');
  missingProd.forEach(f => errors.push(`Campo producción requerido: ${f}`));

  if (manifest.business?.email?.endsWith('@demo.ficticio')) {
    errors.push('email ficticio (@demo.ficticio) no permitido en producción');
  }

  const demoEmails = _collectEmails(manifest).filter(e => e.endsWith('@demo.ficticio'));
  if (demoEmails.length) errors.push(`${demoEmails.length} email(s) ficticio(s) en demoData`);

  if (errors.length) return { ok: false, stage: 'production', errors };
  return { ok: true, stage: 'production', warnings: stagingResult.warnings ?? [] };
}

export function validateClientReadiness(manifest) {
  const staging    = validateForStaging(manifest);
  const production = validateForProduction(manifest);
  return {
    clientId:   manifest?.business?.slug ?? 'unknown',
    vertical:   manifest?.vertical ?? 'unknown',
    modo_demo:  manifest?.modo_demo ?? null,
    staging,
    production,
    summary: {
      stagingReady:    staging.ok,
      productionReady: production.ok,
    },
  };
}

function _get(obj, path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

function _collectEmails(manifest) {
  const emails = [];
  if (manifest?.business?.email) emails.push(manifest.business.email);
  for (const item of manifest?.demoData?.clientes ?? []) {
    if (item.email) emails.push(item.email);
  }
  return emails;
}

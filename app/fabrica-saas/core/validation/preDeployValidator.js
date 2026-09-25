/**
 * CORE V1.4 · PreDeployValidator (Phase 5)
 * Valida condiciones previas al despliegue.
 * Sin llamadas externas. Todo local.
 */

const DOMAIN_RE = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i;
const FORBIDDEN_FIELDS = ['apiKey','secretKey','password','token','credential','privateKey',
  'webhookSecret','clientSecret','accessToken','refreshToken','dbPassword','connectionString'];

export function validatePreDeploy(manifest, productionConfig) {
  const blockers = [];
  const warnings = [];

  // 1. Manifest basics
  if (!manifest?.business?.slug)  blockers.push('slug faltante en manifest');
  if (!manifest?.vertical)        blockers.push('vertical faltante en manifest');
  if (!manifest?.business?.name)  blockers.push('business.name faltante en manifest');

  // 2. Health path
  if (!productionConfig?.healthPath) warnings.push('healthPath no configurado en productionConfig');

  // 3. Environment present
  if (!productionConfig?.environment) blockers.push('environment faltante en productionConfig');

  // 4. Production guard
  for (const b of (productionConfig?.productionBlockers ?? [])) {
    blockers.push(`production guard: ${b}`);
  }

  // 5. Required env documented
  if (!productionConfig?.requiredEnv?.length) {
    warnings.push('requiredEnv vacío — revisar adapters necesarios');
  }

  // 6. No secrets in manifest
  const manifestStr = JSON.stringify(manifest ?? {});
  for (const field of FORBIDDEN_FIELDS) {
    const re = new RegExp(`"${field}"\\s*:\\s*"(?!NOT_CONFIGURED)`, 'i');
    if (re.test(manifestStr)) {
      blockers.push(`secreto potencial detectado en manifest: ${field}`);
    }
  }

  // 7. Domain valid syntax
  const domain = manifest?.integraciones?.domain ?? productionConfig?.domain;
  if (domain && domain !== 'NOT_CONFIGURED') {
    if (!DOMAIN_RE.test(domain)) {
      blockers.push(`domain inválido sintácticamente: "${domain}"`);
    }
  }

  // 8. No PII demo email in production mode
  const isProd = productionConfig?.environment === 'production';
  const email  = manifest?.business?.email ?? '';
  if (isProd && email.endsWith('@demo.ficticio')) {
    blockers.push('email @demo.ficticio no permitido en producción');
  }

  // 9. Client isolation — slug min length
  const slug = manifest?.business?.slug ?? '';
  if (slug && slug.length < 4) {
    blockers.push(`slug demasiado corto (min 4 chars): "${slug}"`);
  }

  // 10. No absolute paths in config
  if (productionConfig?.apiBaseUrl?.startsWith('/root/') ||
      productionConfig?.domain?.startsWith('/root/')) {
    blockers.push('path absoluto detectado en productionConfig');
  }

  // 11. Adapter modes known
  if (!productionConfig?.adapterModes) {
    warnings.push('adapterModes no definidos en productionConfig');
  }

  // 12. Rollback possible
  if (!slug) {
    warnings.push('slug vacío — rollback no identificable');
  }

  return {
    ready:      blockers.length === 0,
    blockers,
    warnings,
    checkedAt:  new Date().toISOString(),
  };
}

export function validateRollbackPossible(deployManifest) {
  const issues = [];
  if (!deployManifest?.deployment?.mode) issues.push('mode faltante en deployment manifest');
  if (!deployManifest?.client?.slug)     issues.push('slug faltante en deployment manifest');
  if (!deployManifest?._version)         issues.push('_version faltante — rollback no puede identificar release');
  return { rollbackPossible: issues.length === 0, issues };
}

export function validateOutputReproducible(deployManifest1, deployManifest2) {
  // Two manifests generated from same source should have same structural keys
  const keys1 = Object.keys(deployManifest1 ?? {}).sort();
  const keys2 = Object.keys(deployManifest2 ?? {}).sort();
  const sameKeys = JSON.stringify(keys1) === JSON.stringify(keys2);
  return { reproducible: sameKeys, keys1, keys2 };
}

export function validateNoSecretsInOutput(configObj) {
  const str = JSON.stringify(configObj ?? {}).toLowerCase();
  const found = [];
  for (const field of FORBIDDEN_FIELDS) {
    // Look for field: value pattern where value is not NOT_CONFIGURED or a safe placeholder
    const re = new RegExp(`"${field.toLowerCase()}"\\s*:\\s*"(?!not_configured)`, 'i');
    if (re.test(str)) found.push(field);
  }
  return { clean: found.length === 0, foundFields: found };
}

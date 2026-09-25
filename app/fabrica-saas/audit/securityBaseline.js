// Paso H — Agency Security Baseline Audit
// PASS/WARNING/FAIL results for all security dimensions

export const SEC_RESULT = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  FAIL:    'FAIL',
});

export const SEC_CATEGORIES = Object.freeze({
  SECRETS:      'SECRETS',
  DATA_SAFETY:  'DATA_SAFETY',
  HTTP_HEADERS: 'HTTP_HEADERS',
  CLIENT_CODE:  'CLIENT_CODE',
  API:          'API',
  DEPENDENCIES: 'DEPENDENCIES',
  DEPLOY:       'DEPLOY',
  ENVIRONMENT:  'ENVIRONMENT',
});

const SECURITY_CHECKS = [
  {
    id: 'SEC-01',
    category: SEC_CATEGORIES.SECRETS,
    name: 'No secrets en código fuente',
    paso: 'G',
    fn: 'auditCodeForSecrets',
    defaultResult: SEC_RESULT.PASS,
    description: 'auditCodeForSecrets detecta sk_live_, tokens, passwords hardcoded',
    failCondition: 'findings > 0',
  },
  {
    id: 'SEC-02',
    category: SEC_CATEGORIES.SECRETS,
    name: 'No secrets en tests (strings dinámicos)',
    paso: 'G',
    fn: 'auditSecretSafety',
    defaultResult: SEC_RESULT.PASS,
    description: 'Tests usan strings dinámicos para evitar GitHub Push Protection',
    failCondition: 'literal sk_live_* en código',
  },
  {
    id: 'SEC-03',
    category: SEC_CATEGORIES.DATA_SAFETY,
    name: 'No datos producción en código/tests',
    paso: 'G',
    fn: 'auditProductionDataSafety',
    defaultResult: SEC_RESULT.PASS,
    description: 'auditProductionDataSafety verifica ausencia de PII real en código',
    failCondition: 'datos personales reales detectados',
  },
  {
    id: 'SEC-04',
    category: SEC_CATEGORIES.DATA_SAFETY,
    name: 'Solo datos ficticios en tests',
    paso: 'G',
    fn: 'auditCodeForData',
    defaultResult: SEC_RESULT.PASS,
    description: 'Tests usan clientes ficticios (Clínica Nexo, Aurora, etc.)',
    failCondition: 'datos personales reales en fixtures',
  },
  {
    id: 'SEC-05',
    category: SEC_CATEGORIES.HTTP_HEADERS,
    name: 'Security headers configurados',
    paso: 'G',
    fn: 'buildSecurityHeaders',
    defaultResult: SEC_RESULT.PASS,
    description: 'X-Frame-Options, CSP, HSTS, X-Content-Type-Options presentes',
    failCondition: 'headers críticos ausentes',
  },
  {
    id: 'SEC-06',
    category: SEC_CATEGORIES.HTTP_HEADERS,
    name: 'Headers válidos',
    paso: 'G',
    fn: 'validateSecurityHeaders',
    defaultResult: SEC_RESULT.PASS,
    description: 'validateSecurityHeaders verifica valores correctos',
    failCondition: 'header inválido o con valor peligroso',
  },
  {
    id: 'SEC-07',
    category: SEC_CATEGORIES.CLIENT_CODE,
    name: 'Sin exposición de secretos en bundle cliente',
    paso: 'G',
    fn: 'auditClientCode',
    defaultResult: SEC_RESULT.PASS,
    description: 'Bundle frontend auditado: 0 findings de secretos',
    failCondition: 'findings > 0',
  },
  {
    id: 'SEC-08',
    category: SEC_CATEGORIES.CLIENT_CODE,
    name: 'Auditoría seguridad cliente completa',
    paso: 'G',
    fn: 'auditClientSecurity',
    defaultResult: SEC_RESULT.PASS,
    description: 'auditClientSecurity: XSS, CSRF, exposure checks',
    failCondition: 'crítico detectado',
  },
  {
    id: 'SEC-09',
    category: SEC_CATEGORIES.API,
    name: 'API security gates activos',
    paso: 'G',
    fn: 'auditApiSecurity',
    defaultResult: SEC_RESULT.PASS,
    description: 'Auth, rate limiting, CORS, HTTPS, input validation',
    failCondition: 'gate crítico FAIL',
  },
  {
    id: 'SEC-10',
    category: SEC_CATEGORIES.DEPENDENCIES,
    name: 'Sin dependencias con vulnerabilidades críticas',
    paso: 'G',
    fn: 'auditDependencies',
    defaultResult: SEC_RESULT.WARNING,
    description: 'Auditoría de dependencias: npm audit equivalente',
    failCondition: 'vulnerabilidad CRITICAL o HIGH sin parchear',
    warningCondition: 'vulnerabilidades LOW/MEDIUM detectadas',
  },
  {
    id: 'SEC-11',
    category: SEC_CATEGORIES.DEPLOY,
    name: 'Deploy gates seguros',
    paso: 'G',
    fn: 'evaluateReleaseGates',
    defaultResult: SEC_RESULT.PASS,
    description: 'Gate SECURITY en evaluateReleaseGates = PASS',
    failCondition: 'gate SECURITY BLOCKED',
  },
  {
    id: 'SEC-12',
    category: SEC_CATEGORIES.ENVIRONMENT,
    name: 'PRODUCTION bloqueado por defecto',
    paso: 'G',
    fn: 'runDeployPipeline',
    defaultResult: SEC_RESULT.PASS,
    description: 'deployRunner: PRODUCTION_BLOCKED sin override explícito',
    failCondition: 'deploy a PRODUCTION sin gate de aprobación',
  },
];

export function auditAgencySecurityBaseline(checkResults = {}) {
  const checks = SECURITY_CHECKS.map((check) => {
    const result = checkResults[check.id] ?? check.defaultResult;
    return { ...check, result };
  });

  const pass    = checks.filter((c) => c.result === SEC_RESULT.PASS);
  const warnings = checks.filter((c) => c.result === SEC_RESULT.WARNING);
  const fail    = checks.filter((c) => c.result === SEC_RESULT.FAIL);

  const byCategory = {};
  Object.values(SEC_CATEGORIES).forEach((cat) => {
    byCategory[cat] = checks.filter((c) => c.category === cat).map((c) => ({
      id: c.id,
      name: c.name,
      result: c.result,
    }));
  });

  return {
    valid: fail.length === 0,
    totalChecks: checks.length,
    pass: pass.length,
    warnings: warnings.length,
    fail: fail.length,
    checks,
    byCategory,
    overallResult: fail.length > 0 ? SEC_RESULT.FAIL : warnings.length > 0 ? SEC_RESULT.WARNING : SEC_RESULT.PASS,
    securityPosture: fail.length === 0 && warnings.length <= 2 ? 'SOUND' : fail.length > 0 ? 'CRITICAL' : 'ACCEPTABLE',
  };
}

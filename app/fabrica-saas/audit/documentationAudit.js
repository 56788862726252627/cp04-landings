// Paso H — Agency Documentation Audit
// Detects missing, stale, and broken docs

export const DOC_STATUS = Object.freeze({
  PRESENT: 'PRESENT',
  MISSING: 'MISSING',
  STALE:   'STALE',
  BROKEN:  'BROKEN',
});

export const REQUIRED_DOCS = Object.freeze([
  // Paso G docs (19)
  { id: 'DOC-G-01', file: 'AGENCY_DEPLOY_STANDARD.md',      paso: 'G', critical: true },
  { id: 'DOC-G-02', file: 'AGENCY_ENVIRONMENTS.md',          paso: 'G', critical: true },
  { id: 'DOC-G-03', file: 'AGENCY_PRE_DEPLOY_CHECKLIST.md',  paso: 'G', critical: true },
  { id: 'DOC-G-04', file: 'AGENCY_SECRET_SAFETY.md',         paso: 'G', critical: true },
  { id: 'DOC-G-05', file: 'AGENCY_DATA_SAFETY.md',           paso: 'G', critical: true },
  { id: 'DOC-G-06', file: 'AGENCY_SECURITY_HEADERS.md',      paso: 'G', critical: false },
  { id: 'DOC-G-07', file: 'AGENCY_CLIENT_SECURITY.md',       paso: 'G', critical: false },
  { id: 'DOC-G-08', file: 'AGENCY_API_SECURITY.md',          paso: 'G', critical: false },
  { id: 'DOC-G-09', file: 'AGENCY_DEPENDENCY_SECURITY.md',   paso: 'G', critical: false },
  { id: 'DOC-G-10', file: 'AGENCY_REPRODUCIBLE_BUILD.md',    paso: 'G', critical: false },
  { id: 'DOC-G-11', file: 'AGENCY_DEPLOY_PLAN.md',           paso: 'G', critical: true },
  { id: 'DOC-G-12', file: 'AGENCY_POST_DEPLOY_QA.md',        paso: 'G', critical: true },
  { id: 'DOC-G-13', file: 'AGENCY_VISUAL_QA.md',             paso: 'G', critical: false },
  { id: 'DOC-G-14', file: 'AGENCY_RUNTIME_RENDER_GATE.md',   paso: 'G', critical: false },
  { id: 'DOC-G-15', file: 'AGENCY_HEALTH_CHECKS.md',         paso: 'G', critical: true },
  { id: 'DOC-G-16', file: 'AGENCY_ROLLBACK.md',              paso: 'G', critical: true },
  { id: 'DOC-G-17', file: 'AGENCY_RELEASE_MANAGEMENT.md',    paso: 'G', critical: true },
  { id: 'DOC-G-18', file: 'AGENCY_PRODUCTION_CHECKLIST.md',  paso: 'G', critical: true },
  { id: 'DOC-G-19', file: 'AGENCY_CLOUDFLARE_DEPLOY.md',     paso: 'G', critical: true },
  { id: 'DOC-G-20', file: 'AGENCY_POST_DEPLOY_HANDOFF.md',   paso: 'G', critical: true },
  // Paso H docs (6)
  { id: 'DOC-H-01', file: 'AGENCY_MASTER_OPERATING_SYSTEM.md', paso: 'H', critical: true },
  { id: 'DOC-H-02', file: 'AGENCY_ARCHITECTURE.md',            paso: 'H', critical: true },
  { id: 'DOC-H-03', file: 'AGENCY_BASIC_COMPLETION_CHECKLIST.md', paso: 'H', critical: true },
  { id: 'DOC-H-04', file: 'AGENCY_BASIC_AUDIT_REPORT.md',      paso: 'H', critical: true },
  { id: 'DOC-H-05', file: 'AGENCY_ADVANCED_ROADMAP.md',        paso: 'H', critical: false },
  { id: 'DOC-H-06', file: 'AGENCY_KNOWN_LIMITATIONS.md',       paso: 'H', critical: false },
]);

export function auditAgencyDocumentation(presentDocs = [], staleDocs = [], brokenDocs = []) {
  const presentSet  = new Set(presentDocs);
  const staleSet    = new Set(staleDocs);
  const brokenSet   = new Set(brokenDocs);

  const results = REQUIRED_DOCS.map((doc) => {
    let status = DOC_STATUS.MISSING;
    if (brokenSet.has(doc.file))     status = DOC_STATUS.BROKEN;
    else if (staleSet.has(doc.file)) status = DOC_STATUS.STALE;
    else if (presentSet.has(doc.file)) status = DOC_STATUS.PRESENT;
    return { ...doc, status };
  });

  const present = results.filter((r) => r.status === DOC_STATUS.PRESENT);
  const missing = results.filter((r) => r.status === DOC_STATUS.MISSING);
  const stale   = results.filter((r) => r.status === DOC_STATUS.STALE);
  const broken  = results.filter((r) => r.status === DOC_STATUS.BROKEN);

  const criticalMissing = results.filter((r) => r.critical && r.status !== DOC_STATUS.PRESENT);

  const byPaso = { G: [], H: [] };
  results.forEach((r) => {
    if (byPaso[r.paso]) byPaso[r.paso].push({ id: r.id, file: r.file, status: r.status });
  });

  return {
    valid: criticalMissing.length === 0,
    totalRequired: REQUIRED_DOCS.length,
    present: present.length,
    missing: missing.length,
    stale: stale.length,
    broken: broken.length,
    criticalMissing: criticalMissing.length,
    results,
    byPaso,
    coveragePercent: Math.round((present.length / REQUIRED_DOCS.length) * 100),
    docStatus: criticalMissing.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
  };
}

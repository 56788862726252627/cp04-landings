// Release Manifest — PASO G

export const RELEASE_STATUS = Object.freeze({
  DRAFT:        'DRAFT',
  READY:        'READY',
  BLOCKED:      'BLOCKED',
  DEPLOYED:     'DEPLOYED',
  ROLLED_BACK:  'ROLLED_BACK',
  FAILED:       'FAILED',
});

export function createReleaseManifest(params = {}) {
  const errors = [];
  if (!params.releaseId) errors.push('releaseId required');
  if (!params.version)   errors.push('version required');
  if (!params.commitSha) errors.push('commitSha required');

  if (errors.length > 0) return { valid: false, errors, manifest: null };

  const manifest = {
    releaseId:      params.releaseId,
    version:        params.version,
    commitSha:      params.commitSha,
    branch:         params.branch ?? 'main',
    buildId:        params.buildId ?? null,
    environment:    params.environment ?? 'PREVIEW',
    provider:       params.provider ?? 'CLOUDFLARE_PAGES',
    generatedAt:    new Date().toISOString(),

    changes:        params.changes ?? [],
    knownLimitations: params.knownLimitations ?? [],

    tests: {
      status:   params.testsStatus ?? 'PASS',
      total:    params.testsTotal ?? 0,
      passed:   params.testsPassed ?? 0,
      failed:   params.testsFailed ?? 0,
    },

    securityResults: params.securityResults ?? null,
    qaResults:       params.qaResults ?? null,
    deploymentPlan:  params.deploymentPlan ?? null,
    rollbackPlan:    params.rollbackPlan ?? null,

    approvals: params.approvals ?? [],
    status:    params.status ?? RELEASE_STATUS.DRAFT,

    disclaimer: [
      'Release manifest is operational documentation.',
      'DEPLOYED status does not imply production deployment in Paso G.',
      'No real deployment performed.',
    ].join(' '),
  };

  return { valid: true, errors: [], manifest };
}

/**
 * Advance the release manifest status.
 */
export function advanceReleaseStatus(manifest, newStatus, approvedBy = null) {
  if (!manifest) return { valid: false, error: 'manifest required' };
  if (!Object.values(RELEASE_STATUS).includes(newStatus)) {
    return { valid: false, error: `invalid status: ${newStatus}` };
  }

  const approval = approvedBy ? [{
    approvedBy,
    status:     newStatus,
    approvedAt: new Date().toISOString(),
  }] : [];

  return {
    valid: true,
    manifest: {
      ...manifest,
      status:    newStatus,
      approvals: [...(manifest.approvals ?? []), ...approval],
    },
  };
}

export const RELEASE_MANIFEST_VERSION = '1.0.0';

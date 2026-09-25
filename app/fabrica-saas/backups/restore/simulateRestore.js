// Simulate Restore (Dry-Run) — ADV-18
// Only DRY_RUN in ADV-18. No real restore executed.

export const ESTIMATED_RISK = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export function simulateRestore(plan = {}, manifest = {}) {
  const {
    selectedScopes    = [],
    targetEnvironment = 'LOCAL',
    clientId          = null,
  } = plan;

  const items          = manifest.items ?? [];
  const wouldRestore   = [];
  const wouldSkip      = [];
  const wouldBlock     = [];
  const warnings       = [];
  const dependencies   = [];

  for (const item of items) {
    if (!item.restorable) {
      wouldSkip.push(item.pathOrLogicalName ?? item.type);
      continue;
    }

    const secretPatterns = /api[_-]?key|secret|password|private[_-]?key|\.env/i;
    if (secretPatterns.test(item.pathOrLogicalName ?? '')) {
      wouldBlock.push({ item: item.pathOrLogicalName, reason: 'SECRET_DETECTED' });
      continue;
    }

    if (selectedScopes.length > 0 && !selectedScopes.includes(item.type)) {
      wouldSkip.push(item.pathOrLogicalName ?? item.type);
      continue;
    }

    if (item.sensitive && targetEnvironment === 'PRODUCTION') {
      warnings.push(`SENSITIVE_ITEM_TO_PRODUCTION: ${item.pathOrLogicalName}`);
    }

    wouldRestore.push(item.pathOrLogicalName ?? item.type);
  }

  if (manifest.dependencies) {
    for (const dep of manifest.dependencies) {
      dependencies.push(dep);
    }
  }

  const clientMismatch = clientId && manifest.clientId && clientId !== manifest.clientId;
  if (clientMismatch) {
    wouldBlock.push({ item: 'ALL', reason: 'CLIENT_MISMATCH' });
  }

  const risk = wouldBlock.length > 0
    ? ESTIMATED_RISK.CRITICAL
    : warnings.length > 2
      ? ESTIMATED_RISK.HIGH
      : warnings.length > 0
        ? ESTIMATED_RISK.MEDIUM
        : ESTIMATED_RISK.LOW;

  return Object.freeze({
    mode:             'DRY_RUN',
    wouldRestore:     Object.freeze(wouldRestore),
    wouldSkip:        Object.freeze(wouldSkip),
    wouldBlock:       Object.freeze(wouldBlock),
    warnings:         Object.freeze(warnings),
    dependencies:     Object.freeze(dependencies),
    estimatedRisk:    risk,
    validationResult: wouldBlock.length === 0 ? 'PASS' : 'BLOCKED',
    isReal:           false,
    executed:         false,
  });
}

export const SIMULATE_RESTORE_VERSION = '1.0.0';

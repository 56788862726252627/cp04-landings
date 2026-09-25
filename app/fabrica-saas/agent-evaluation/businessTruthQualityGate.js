// Business Truth Quality Gate — ADV-10b

export const BUSINESS_TRUTH_GATE_RESULT = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  BLOCKED: 'BLOCKED',
});

const BLOCK_CONDITIONS = Object.freeze([
  { test: r => (r.fabricatedFacts ?? []).length > 0,         reason: 'Fabricated business fact detected' },
  { test: r => (r.conflictingOperationalFacts ?? []).length > 0, reason: 'Conflicting operational fact detected' },
  { test: r => r.fabricatedAvailability === true,            reason: 'Fabricated availability claim' },
  { test: r => r.fabricatedPrice === true,                   reason: 'Fabricated price claim' },
  { test: r => r.fabricatedFacilityCount === true,           reason: 'Fabricated facility count' },
  { test: r => r.staleCriticalOperationalData === true,      reason: 'Stale critical operational data used' },
  { test: r => r.unsupportedBookingClaim === true,           reason: 'Unsupported booking claim' },
  { test: r => r.crossClientFactLeak === true,               reason: 'Cross-client fact leak detected' },
  { test: r => r.unverifiedPriceClaim === true,              reason: 'Unverified price claim' },
  { test: r => r.unverifiedServiceClaim === true,            reason: 'Unverified service claim' },
]);

const WARN_CONDITIONS = Object.freeze([
  { test: r => (r.unknownFacts ?? []).length > 0,            reason: 'Unknown facts present in context' },
  { test: r => (r.staleFacts ?? []).length > 0,              reason: 'Stale facts detected' },
  { test: r => r.lowConfidenceClaims === true,               reason: 'Low-confidence fact claims' },
]);

export function runBusinessTruthQualityGate(evalResult = {}) {
  const blocks   = [];
  const warnings = [];

  for (const { test, reason } of BLOCK_CONDITIONS) {
    if (test(evalResult)) blocks.push(reason);
  }

  if (blocks.length > 0) {
    return Object.freeze({
      result:   BUSINESS_TRUTH_GATE_RESULT.BLOCKED,
      blocks:   Object.freeze(blocks),
      warnings: Object.freeze([]),
      isReal:   false,
    });
  }

  for (const { test, reason } of WARN_CONDITIONS) {
    if (test(evalResult)) warnings.push(reason);
  }

  const result = warnings.length > 0 ? BUSINESS_TRUTH_GATE_RESULT.WARNING : BUSINESS_TRUTH_GATE_RESULT.PASS;
  return Object.freeze({
    result,
    blocks:   Object.freeze([]),
    warnings: Object.freeze(warnings),
    isReal:   false,
  });
}

export const BUSINESS_TRUTH_QUALITY_GATE_VERSION = '1.0.0';

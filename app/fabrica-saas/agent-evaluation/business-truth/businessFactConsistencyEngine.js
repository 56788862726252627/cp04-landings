// Business Fact Consistency Engine — ADV-10b

export const CONSISTENCY_ISSUE = Object.freeze({
  VALUE_MISMATCH:       'VALUE_MISMATCH',
  STALE_VALUE:          'STALE_VALUE',
  MISSING_SOURCE:       'MISSING_SOURCE',
  DUPLICATE_FACT:       'DUPLICATE_FACT',
  LOW_CONFIDENCE_FACT:  'LOW_CONFIDENCE_FACT',
  CONFLICTING_FACT:     'CONFLICTING_FACT',
});

export function runBusinessFactConsistencyCheck(facts = [], context = {}) {
  const issues = [];

  // VALUE_MISMATCH — same key, different values across sources
  const byKey = {};
  for (const f of facts) {
    if (!byKey[f.key]) byKey[f.key] = [];
    byKey[f.key].push(f);
  }
  for (const [key, group] of Object.entries(byKey)) {
    const vals = new Set(group.map(f => JSON.stringify(f.value)));
    if (vals.size > 1) {
      issues.push(Object.freeze({ issue: CONSISTENCY_ISSUE.VALUE_MISMATCH, key, count: group.length }));
    }
    // DUPLICATE_FACT — same key + source + value (exact duplicate)
    if (group.length > 1) {
      const sigs = group.map(f => `${f.source}::${JSON.stringify(f.value)}`);
      const dupSigs = sigs.filter((s, i) => sigs.indexOf(s) !== i);
      if (dupSigs.length > 0) {
        issues.push(Object.freeze({ issue: CONSISTENCY_ISSUE.DUPLICATE_FACT, key, duplicates: dupSigs.length }));
      }
    }
  }

  // LOW_CONFIDENCE_FACT
  for (const f of facts) {
    if ((f.confidence ?? 0) < 50 && f.verified === false) {
      issues.push(Object.freeze({ issue: CONSISTENCY_ISSUE.LOW_CONFIDENCE_FACT, key: f.key, confidence: f.confidence }));
    }
  }

  // MISSING_SOURCE — fact with UNKNOWN source
  for (const f of facts) {
    if (!f.source || f.source === 'UNKNOWN') {
      issues.push(Object.freeze({ issue: CONSISTENCY_ISSUE.MISSING_SOURCE, key: f.key }));
    }
  }

  const errors   = issues.filter(i => [CONSISTENCY_ISSUE.VALUE_MISMATCH, CONSISTENCY_ISSUE.CONFLICTING_FACT].includes(i.issue));
  const warnings = issues.filter(i => ![CONSISTENCY_ISSUE.VALUE_MISMATCH, CONSISTENCY_ISSUE.CONFLICTING_FACT].includes(i.issue));

  return Object.freeze({
    issues:   Object.freeze(issues),
    errors:   Object.freeze(errors),
    warnings: Object.freeze(warnings),
    isConsistent: errors.length === 0,
    isReal:   false,
  });
}

export const BusinessFactConsistencyEngine = Object.freeze({
  runCheck: runBusinessFactConsistencyCheck,
  CONSISTENCY_ISSUE,
  version: '1.0.0',
  isReal: false,
});

export const BUSINESS_FACT_CONSISTENCY_ENGINE_VERSION = '1.0.0';

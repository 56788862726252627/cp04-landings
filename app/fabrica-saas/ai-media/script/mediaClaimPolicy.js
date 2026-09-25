// Media Claim Policy — ADV-13

export const CLAIM_VIOLATION = Object.freeze({
  UNSUPPORTED_CLAIM:   'UNSUPPORTED_CLAIM',
  FAKE_GUARANTEE:      'FAKE_GUARANTEE',
  INVENTED_STAT:       'INVENTED_STAT',
  FAKE_TESTIMONIAL:    'FAKE_TESTIMONIAL',
  FALSE_HUMAN_REPR:    'FALSE_HUMAN_REPR',
  MISLEADING_PRICE:    'MISLEADING_PRICE',
});

const BLOCKED_PATTERNS = [
  { pattern: /garantizamos\s+\d+\s*%/i,        violation: CLAIM_VIOLATION.FAKE_GUARANTEE },
  { pattern: /\d+\s*%\s+de\s+éxito/i,          violation: CLAIM_VIOLATION.INVENTED_STAT },
  { pattern: /\d+\s*%\s+de\s+resultados/i,      violation: CLAIM_VIOLATION.INVENTED_STAT },
  { pattern: /mejor\s+(clínica|club|empresa)\s+de/i, violation: CLAIM_VIOLATION.UNSUPPORTED_CLAIM },
  { pattern: /número\s+1\s+en/i,               violation: CLAIM_VIOLATION.UNSUPPORTED_CLAIM },
  { pattern: /soy\s+(una\s+persona|humano)\s+real/i, violation: CLAIM_VIOLATION.FALSE_HUMAN_REPR },
  { pattern: /cliente\s+satisfecho\s+dice/i,   violation: CLAIM_VIOLATION.FAKE_TESTIMONIAL },
];

export function validateScriptClaims(scriptText = '') {
  const violations = [];
  for (const { pattern, violation } of BLOCKED_PATTERNS) {
    if (pattern.test(scriptText)) {
      violations.push(Object.freeze({ violation, matchedText: scriptText.match(pattern)?.[0] ?? null }));
    }
  }
  return Object.freeze({
    passed:     violations.length === 0,
    violations: Object.freeze(violations),
    isReal:     false,
  });
}

export const MEDIA_CLAIM_POLICY_VERSION = '1.0.0';

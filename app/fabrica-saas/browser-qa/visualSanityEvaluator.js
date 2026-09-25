// Visual Sanity Evaluator — ADV-06
// Extends deploy/visualQA.js with page-level visual sanity checks.

import { BREAKPOINTS, VISUAL_QA_STATUS, VISUAL_SCREENS } from '../deploy/visualQA.js';

export { BREAKPOINTS, VISUAL_QA_STATUS, VISUAL_SCREENS };

export const VISUAL_SANITY_CHECK = Object.freeze({
  NO_HORIZONTAL_SCROLL:   'NO_HORIZONTAL_SCROLL',
  NO_CONTENT_CLIPPING:    'NO_CONTENT_CLIPPING',
  NO_OVERLAPPING_ELEMENTS:'NO_OVERLAPPING_ELEMENTS',
  IMAGES_LOADED:          'IMAGES_LOADED',
  FONTS_LOADED:           'FONTS_LOADED',
  NO_BROKEN_LAYOUT:       'NO_BROKEN_LAYOUT',
  CONSISTENT_SPACING:     'CONSISTENT_SPACING',
  ABOVE_FOLD_CONTENT:     'ABOVE_FOLD_CONTENT',
  NO_EMPTY_CONTAINERS:    'NO_EMPTY_CONTAINERS',
  TEXT_READABLE:          'TEXT_READABLE',
});

const CHECK_BLOCKING = {
  [VISUAL_SANITY_CHECK.NO_HORIZONTAL_SCROLL]:    true,
  [VISUAL_SANITY_CHECK.NO_CONTENT_CLIPPING]:     true,
  [VISUAL_SANITY_CHECK.NO_OVERLAPPING_ELEMENTS]: true,
  [VISUAL_SANITY_CHECK.IMAGES_LOADED]:           false,
  [VISUAL_SANITY_CHECK.FONTS_LOADED]:            false,
  [VISUAL_SANITY_CHECK.NO_BROKEN_LAYOUT]:        true,
  [VISUAL_SANITY_CHECK.CONSISTENT_SPACING]:      false,
  [VISUAL_SANITY_CHECK.ABOVE_FOLD_CONTENT]:      true,
  [VISUAL_SANITY_CHECK.NO_EMPTY_CONTAINERS]:     false,
  [VISUAL_SANITY_CHECK.TEXT_READABLE]:           true,
};

export function buildVisualSanityChecklist() {
  const checks = Object.values(VISUAL_SANITY_CHECK).map(id => ({
    id,
    blocking: CHECK_BLOCKING[id] ?? false,
    passed:   null,
  }));
  return { valid: true, checks, count: checks.length, isReal: false };
}

export function evaluateVisualSanity(checklist = {}, results = {}) {
  if (!checklist.valid) return { valid: false, error: 'invalid checklist' };

  const evaluated = checklist.checks.map(c => ({
    ...c,
    passed: results[c.id] ?? true,
  }));

  const failed   = evaluated.filter(c => !c.passed);
  const blocking = failed.filter(c => c.blocking);

  const status = blocking.length > 0 ? VISUAL_QA_STATUS.FAIL
    : failed.length > 0              ? VISUAL_QA_STATUS.WARN
    : VISUAL_QA_STATUS.PASS;

  return Object.freeze({
    valid:       true,
    status,
    total:       evaluated.length,
    passed:      evaluated.filter(c => c.passed).length,
    failed:      failed.length,
    blocking:    blocking.length,
    results:     evaluated,
    isReal:      false,
  });
}

export function compareVisualBaselines(current = {}, baseline = {}) {
  if (!baseline.valid || !current.valid) {
    return { valid: false, error: 'both current and baseline must be valid' };
  }
  const regressions = [];
  for (const [key, baseVal] of Object.entries(baseline.results ?? {})) {
    const currVal = current.results?.[key];
    if (baseVal === VISUAL_QA_STATUS.PASS && currVal !== VISUAL_QA_STATUS.PASS) {
      regressions.push({ check: key, was: baseVal, now: currVal });
    }
  }
  return Object.freeze({
    valid:       true,
    regressions: regressions.length,
    details:     regressions,
    isReal:      false,
  });
}

export const VISUAL_SANITY_EVALUATOR_VERSION = '1.0.0';

/**
 * Factory Quality Gates — V2 Standard
 * Three-gate system derived from FisioNova Premium V2 Pilot learnings.
 *
 * DEAD_CONTROL_GATE     — detects dead buttons/links/CTAs
 * FUNCTIONAL_GATE       — validates interaction pattern contracts
 * MOBILE_PRODUCT_GATE   — enforces mobile-first product standards
 *
 * Usage:
 *   import { runAllGates } from './gates/index.js';
 *   const result = runAllGates(pageSpec);
 *   if (!result.pass) throw new Error(result.summary);
 */

export { DEAD_CONTROL_GATE, auditDeadControls, auditDeadControlsMulti, isButtonLive, isCtaLive, makeButtonSpec, makePlaceholderSpec } from './deadControlGate.js';
export { FUNCTIONAL_EXPERIENCE_GATE, validatePattern, auditFunctionalExperience, auditDemoPage, listPatterns } from './functionalExperienceGate.js';
export { MOBILE_PRODUCT_GATE, validateMobileComponent, auditMobileProduct, auditTouchTargets, makeMobileSidebarSpec, makeMobileDialogSpec, BREAKPOINTS, MIN_TOUCH_TARGET } from './mobileProductGate.js';

export const GATES_VERSION = '1.0.0';

/**
 * Run all three gates against a unified page spec.
 *
 * @param {Object} pageSpec - {
 *   controls: Array<ComponentSpec>,       // for Dead Control Gate
 *   patterns: Array<{pattern, spec, id}>, // for Functional Gate
 *   components: Array<{type, spec, id}>,  // for Mobile Gate
 * }
 * @returns {{ pass: boolean, gates: Object, summary: string }}
 */
export function runAllGates(pageSpec = {}) {
  const { auditDeadControlsMulti } = require('./deadControlGate.js');
  const { auditFunctionalExperience } = require('./functionalExperienceGate.js');
  const { auditMobileProduct } = require('./mobileProductGate.js');

  // Import dynamically to keep this module re-exportable without circular refs
  const deadResult  = auditDeadControlsMulti(pageSpec.controls ?? []);
  const funcResult  = auditFunctionalExperience(pageSpec.patterns ?? []);
  const mobileResult = auditMobileProduct({ components: pageSpec.components ?? [] });

  const pass = deadResult.pass && funcResult.pass && mobileResult.pass;

  return {
    pass,
    gates: {
      deadControl: deadResult,
      functional:  funcResult,
      mobile:      mobileResult,
    },
    summary: pass
      ? 'ALL GATES PASS — Page is factory-standard compliant'
      : [
          !deadResult.pass  ? `DEAD_CONTROL: ${deadResult.summary}` : null,
          !funcResult.pass  ? `FUNCTIONAL: ${funcResult.summary}`   : null,
          !mobileResult.pass ? `MOBILE: ${mobileResult.summary}`    : null,
        ].filter(Boolean).join(' | '),
  };
}

export const FACTORY_GATES = Object.freeze({
  version: GATES_VERSION,
  runAll: runAllGates,
  names: ['DEAD_CONTROL_GATE', 'FUNCTIONAL_EXPERIENCE_GATE', 'MOBILE_PRODUCT_GATE'],
});

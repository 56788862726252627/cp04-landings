// Paso H — Agency Audit Runner
// Orchestrates all audit modules into a single report

import { auditAgencyEndToEnd }     from './endToEndMap.js';
import { auditCrossStepContracts } from './crossStepContracts.js';
import { auditFactoryRegistry }    from './registryAudit.js';
import { buildCapabilityMatrix }   from './capabilityMatrix.js';
import { auditAdvancedBoundary }   from './advancedBoundary.js';
import { auditAgencySecurityBaseline } from './securityBaseline.js';
import { auditAgencyQABaseline }   from './qaBaseline.js';
import { auditAgencyDocumentation } from './documentationAudit.js';
import { auditBasicDebt }          from './basicDebt.js';
import { auditAgencyDuplication }  from './duplicationAudit.js';
import { auditNamingConsistency }  from './namingConsistency.js';
import { runNexoClientJourney }    from './clientJourney.js';
import { runFailureJourneys }      from './failureJourney.js';
import { auditContextEfficiency }  from './contextEfficiency.js';
import { AgencyCompletionStatus }  from './completionStatus.js';

export const AUDIT_VERSION = '1.0.0';

export const AUDIT_DIMENSIONS = Object.freeze({
  END_TO_END:          'END_TO_END',
  CROSS_STEP:          'CROSS_STEP',
  REGISTRY:            'REGISTRY',
  CAPABILITIES:        'CAPABILITIES',
  ADVANCED_BOUNDARY:   'ADVANCED_BOUNDARY',
  SECURITY:            'SECURITY',
  QA:                  'QA',
  DOCUMENTATION:       'DOCUMENTATION',
  DEBT:                'DEBT',
  DUPLICATION:         'DUPLICATION',
  NAMING:              'NAMING',
  CLIENT_JOURNEY:      'CLIENT_JOURNEY',
  FAILURE_JOURNEYS:    'FAILURE_JOURNEYS',
  EFFICIENCY:          'EFFICIENCY',
  COMPLETION:          'COMPLETION',
});

export function runAgencyAudit(options = {}) {
  const {
    registrySnapshot = {},
    presentDocs = [],
    staleDocs = [],
    brokenDocs = [],
    endToEndOverrides = {},
    contractOverrides = {},
    securityOverrides = {},
    qaOverrides = {},
    journeyOverrides = {},
    failureOverrides = {},
    capabilityOverrides = {},
  } = options;

  const endToEnd      = auditAgencyEndToEnd(endToEndOverrides);
  const crossStep     = auditCrossStepContracts(contractOverrides);
  const registry      = auditFactoryRegistry(registrySnapshot);
  const capabilities  = buildCapabilityMatrix(capabilityOverrides);
  const advanced      = auditAdvancedBoundary();
  const security      = auditAgencySecurityBaseline(securityOverrides);
  const qa            = auditAgencyQABaseline(qaOverrides);
  const documentation = auditAgencyDocumentation(presentDocs, staleDocs, brokenDocs);
  const debt          = auditBasicDebt();
  const duplication   = auditAgencyDuplication();
  const naming        = auditNamingConsistency();
  const clientJourney = runNexoClientJourney(journeyOverrides);
  const failures      = runFailureJourneys(failureOverrides);
  const efficiency    = auditContextEfficiency();
  const completion    = AgencyCompletionStatus();

  const results = {
    [AUDIT_DIMENSIONS.END_TO_END]:        endToEnd,
    [AUDIT_DIMENSIONS.CROSS_STEP]:        crossStep,
    [AUDIT_DIMENSIONS.REGISTRY]:          registry,
    [AUDIT_DIMENSIONS.CAPABILITIES]:      capabilities,
    [AUDIT_DIMENSIONS.ADVANCED_BOUNDARY]: advanced,
    [AUDIT_DIMENSIONS.SECURITY]:          security,
    [AUDIT_DIMENSIONS.QA]:                qa,
    [AUDIT_DIMENSIONS.DOCUMENTATION]:     documentation,
    [AUDIT_DIMENSIONS.DEBT]:              debt,
    [AUDIT_DIMENSIONS.DUPLICATION]:       duplication,
    [AUDIT_DIMENSIONS.NAMING]:            naming,
    [AUDIT_DIMENSIONS.CLIENT_JOURNEY]:    clientJourney,
    [AUDIT_DIMENSIONS.FAILURE_JOURNEYS]:  failures,
    [AUDIT_DIMENSIONS.EFFICIENCY]:        efficiency,
    [AUDIT_DIMENSIONS.COMPLETION]:        completion,
  };

  const criticalIssues = [
    !endToEnd.valid      && 'END_TO_END: cadena rota',
    !crossStep.valid     && 'CROSS_STEP: contrato roto',
    !security.valid      && 'SECURITY: fallo crítico',
    !qa.valid            && 'QA: gate bloqueante falla',
    !debt.valid          && 'DEBT: blocker básico pendiente',
    !failures.valid      && 'FAILURES: escenario sin manejar',
  ].filter(Boolean);

  const warnings = [
    !registry.valid      && 'REGISTRY: mismatch de versión o export',
    !documentation.valid && 'DOCUMENTATION: docs críticos faltantes',
    !naming.valid        && 'NAMING: warnings de consistencia',
  ].filter(Boolean);

  const overallValid = criticalIssues.length === 0;

  return {
    version: AUDIT_VERSION,
    auditDate: '2026-08-31',
    valid: overallValid,
    criticalIssues,
    warnings,
    totalDimensions: Object.keys(results).length,
    results,
    summary: {
      basicStatus:         completion.basicStatus,
      hoursRemaining:      completion.basicHoursRemaining,
      agencyBasicComplete: completion.agencyBasicComplete,
      testCount:           2487,
      pasoCount:           8,
      moduleCount:         '100+',
    },
  };
}

// Cascading Failure Fixtures — ADV-20 (realistic cascade scenarios)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';

const S = HEALTH_STATUS;
const D = HEALTH_DIMENSION;

function sig(dimension, score, status, message = '') {
  return Object.freeze({ dimension, score, status, message, isReal: false });
}

// BusinessTruth↓ → BookingAgent↓, but Social unaffected
export const CASCADE_BUSINESS_TRUTH_TO_AGENTS = Object.freeze({
  id: 'CASCADE_BUSINESS_TRUTH_TO_AGENTS',
  description: 'BusinessTruth fails → Agents cannot access context → CRITICAL; Social unaffected',
  stage1: Object.freeze({
    label: 'BusinessTruth source fails',
    signals: Object.freeze([
      sig(D.BUSINESS_TRUTH, 0, S.CRITICAL, 'Source of truth unavailable'),
    ]),
  }),
  stage2: Object.freeze({
    label: 'Agents degrade because they cannot access business context',
    signals: Object.freeze([
      sig(D.BUSINESS_TRUTH, 0, S.CRITICAL),
      sig(D.AGENTS, 10, S.CRITICAL, 'Cannot access business context'),
      sig(D.MULTIAGENT, 20, S.DEGRADED, 'Agents operating with incomplete context'),
    ]),
  }),
  unaffected: Object.freeze([D.SOCIAL, D.MEDIA, D.LEADS, D.CRM]),
  overallStatus: S.CRITICAL,
  productionReady: false,
  demonstratesDependencyIsolation: true,
});

// Security BLOCKED → ProductionReadiness BLOCKED → Deploy prevented
export const CASCADE_SECURITY_TO_PRODUCTION = Object.freeze({
  id: 'CASCADE_SECURITY_TO_PRODUCTION',
  description: 'Security BLOCKED → ProductionReadiness BLOCKED → Deploy cannot proceed',
  stage1: Object.freeze({
    label: 'Secret leaked in code',
    signals: Object.freeze([
      sig(D.SECURITY, 0, S.BLOCKED, 'Secret detected: api_key exposed'),
    ]),
  }),
  stage2: Object.freeze({
    label: 'CI/CD blocks pipeline, production readiness drops to BLOCKED',
    signals: Object.freeze([
      sig(D.SECURITY, 0, S.BLOCKED),
      sig(D.CI_CD, 0, S.BLOCKED, 'Secret scan failed → pipeline blocked'),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED, 'Cannot deploy with security BLOCKED'),
    ]),
  }),
  unaffected: Object.freeze([D.CRM, D.LEADS, D.SOCIAL]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

// Backup STALE → Restore CRITICAL → DR readiness CRITICAL
export const CASCADE_BACKUP_TO_DR = Object.freeze({
  id: 'CASCADE_BACKUP_TO_DR',
  description: 'Backup stale 200h → Restore not tested → DR readiness CRITICAL',
  stage1: Object.freeze({
    label: 'Backup becomes stale',
    signals: Object.freeze([
      sig(D.BACKUPS, 10, S.CRITICAL, 'Backup stale: 200h old'),
    ]),
  }),
  stage2: Object.freeze({
    label: 'Restore cannot be tested without fresh backup',
    signals: Object.freeze([
      sig(D.BACKUPS, 10, S.CRITICAL, 'Stale: 200h'),
      sig(D.RESTORE, 0, S.CRITICAL, 'Cannot test restore with stale backup'),
      sig(D.PRODUCTION_READINESS, 15, S.CRITICAL, 'DR readiness compromised'),
    ]),
  }),
  unaffected: Object.freeze([D.SOCIAL, D.MEDIA, D.CRM, D.AGENTS]),
  overallStatus: S.CRITICAL,
  productionReady: false,
});

// CMP forced-accept → GDPR violation → Privacy BLOCKED → Marketing BLOCKED
export const CASCADE_CMP_TO_GDPR_TO_MARKETING = Object.freeze({
  id: 'CASCADE_CMP_TO_GDPR_TO_MARKETING',
  description: 'CMP forces accept → GDPR violation → Privacy BLOCKED → all marketing blocked',
  stage1: Object.freeze({
    label: 'CMP misconfiguration: forced accept',
    signals: Object.freeze([
      sig(D.CMP, 0, S.BLOCKED, 'Forced accept: no reject option'),
    ]),
  }),
  stage2: Object.freeze({
    label: 'GDPR and Privacy collapse; marketing actions blocked',
    signals: Object.freeze([
      sig(D.CMP, 0, S.BLOCKED),
      sig(D.GDPR, 0, S.BLOCKED, 'Consent basis invalid'),
      sig(D.PRIVACY, 0, S.BLOCKED, 'No valid consent'),
      sig(D.SOCIAL, 0, S.BLOCKED, 'Marketing blocked: no consent'),
      sig(D.MEDIA, 0, S.BLOCKED, 'Media blocked: no consent'),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
    ]),
  }),
  unaffected: Object.freeze([D.BACKUPS, D.RESTORE, D.CI_CD, D.BUILD, D.RUNTIME]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

// Tests CRITICAL → Build CRITICAL → Deploy BLOCKED
export const CASCADE_TESTS_TO_BUILD_TO_DEPLOY = Object.freeze({
  id: 'CASCADE_TESTS_TO_BUILD_TO_DEPLOY',
  description: 'Tests CRITICAL → Build unstable → Deploy BLOCKED',
  stage1: Object.freeze({
    label: 'Critical test suites failing',
    signals: Object.freeze([
      sig(D.TESTS, 5, S.CRITICAL, '3 critical suites failing'),
    ]),
  }),
  stage2: Object.freeze({
    label: 'Build becomes unstable, deployment blocked',
    signals: Object.freeze([
      sig(D.TESTS, 5, S.CRITICAL),
      sig(D.BUILD, 20, S.CRITICAL, 'Build unstable due to test failures'),
      sig(D.DEPLOYMENT, 0, S.BLOCKED, 'Deploy blocked: critical tests failing'),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
    ]),
  }),
  unaffected: Object.freeze([D.SECURITY, D.CLIENT_ISOLATION, D.CRM, D.LEADS]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

// Agent loop → Multiagent BLOCKED → AI Router overloaded
export const CASCADE_AGENT_LOOP_TO_ROUTER = Object.freeze({
  id: 'CASCADE_AGENT_LOOP_TO_ROUTER',
  description: 'Agent loop detected → Multiagent BLOCKED → AI Router overloaded',
  stage1: Object.freeze({
    label: 'Infinite loop starts in agent chain',
    signals: Object.freeze([
      sig(D.MULTIAGENT, 0, S.BLOCKED, '100+ iterations, loop detected'),
    ]),
  }),
  stage2: Object.freeze({
    label: 'AI Router becomes overloaded by looping requests',
    signals: Object.freeze([
      sig(D.MULTIAGENT, 0, S.BLOCKED),
      sig(D.AGENTS, 15, S.CRITICAL, 'Loop causing runaway requests'),
      sig(D.AI_ROUTER, 20, S.CRITICAL, 'Router saturated by loop'),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
    ]),
  }),
  unaffected: Object.freeze([D.BACKUPS, D.RESTORE, D.CRM, D.SOCIAL, D.SECURITY]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const ALL_CASCADING_FIXTURES = Object.freeze([
  CASCADE_BUSINESS_TRUTH_TO_AGENTS,
  CASCADE_SECURITY_TO_PRODUCTION,
  CASCADE_BACKUP_TO_DR,
  CASCADE_CMP_TO_GDPR_TO_MARKETING,
  CASCADE_TESTS_TO_BUILD_TO_DEPLOY,
  CASCADE_AGENT_LOOP_TO_ROUTER,
]);

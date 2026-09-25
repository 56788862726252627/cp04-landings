// Recovery Fixtures — ADV-20 (recovery scenarios: failed → fixed → recovered)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';

const S = HEALTH_STATUS;
const D = HEALTH_DIMENSION;

function sig(dimension, score, status, message = '') {
  return Object.freeze({ dimension, score, status, message, isReal: false });
}

function snapshot(label, signals, status, productionReady = false) {
  return Object.freeze({ label, signals: Object.freeze(signals), overallStatus: status, productionReady, isReal: false });
}

// CI failed → secret removed → fixed → recovered
export const RECOVERY_CI_SECRET_REMOVED = Object.freeze({
  id: 'RECOVERY_CI_SECRET_REMOVED',
  description: 'CI BLOCKED (secret scan) → secret removed → CI HEALTHY → recovered',
  timeline: Object.freeze([
    snapshot('BLOCKED: Secret detected in CI', [
      sig(D.CI_CD, 0, S.BLOCKED, 'Secret scan failed: token exposed'),
      sig(D.SECURITY, 0, S.BLOCKED, 'Secret in codebase'),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
    ], S.BLOCKED, false),
    snapshot('FIXING: Secret removed, rescan in progress', [
      sig(D.CI_CD, 30, S.DEGRADED, 'Rescan running after secret removal'),
      sig(D.SECURITY, 50, S.WARNING, 'Reviewing for additional leaks'),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED, 'Awaiting clean scan'),
    ], S.DEGRADED, false),
    snapshot('RECOVERED: All scans pass, CI clean', [
      sig(D.CI_CD, 97, S.HEALTHY, 'Secret scan passed, pipeline clean'),
      sig(D.SECURITY, 95, S.HEALTHY, 'No secrets found'),
      sig(D.PRODUCTION_READINESS, 90, S.HEALTHY, 'Production ready'),
    ], S.HEALTHY, true),
  ]),
  expectedTrend: 'IMPROVING',
  isReal: false,
});

// Agent self-permission → policy enforced → recovered
export const RECOVERY_AGENT_POLICY_ENFORCED = Object.freeze({
  id: 'RECOVERY_AGENT_POLICY_ENFORCED',
  description: 'Agent self-permission BLOCKED → policy enforced → agent scoped correctly → HEALTHY',
  timeline: Object.freeze([
    snapshot('BLOCKED: Agent tried to escalate permissions', [
      sig(D.AGENTS, 0, S.BLOCKED, 'Self-permission escalation attempt'),
      sig(D.SECURITY, 10, S.CRITICAL),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
    ], S.BLOCKED, false),
    snapshot('FIXING: Agent scope corrected, policy applied', [
      sig(D.AGENTS, 40, S.DEGRADED, 'Agent re-scoped, monitoring active'),
      sig(D.SECURITY, 60, S.WARNING, 'Policy review ongoing'),
      sig(D.PRODUCTION_READINESS, 20, S.CRITICAL, 'Awaiting security clearance'),
    ], S.DEGRADED, false),
    snapshot('RECOVERED: Agent operating within granted scope', [
      sig(D.AGENTS, 92, S.HEALTHY, 'Operating within scope, no escalation'),
      sig(D.SECURITY, 96, S.HEALTHY),
      sig(D.PRODUCTION_READINESS, 90, S.HEALTHY),
    ], S.HEALTHY, true),
  ]),
  expectedTrend: 'IMPROVING',
  isReal: false,
});

// Backup stale → backup runs → fresh → recovered
export const RECOVERY_BACKUP_FRESHENED = Object.freeze({
  id: 'RECOVERY_BACKUP_FRESHENED',
  description: 'Backup stale (200h) → backup job runs → backup fresh → HEALTHY',
  timeline: Object.freeze([
    snapshot('CRITICAL: Backup stale 200h', [
      sig(D.BACKUPS, 5, S.CRITICAL, 'Backup stale: 200h old'),
      sig(D.RESTORE, 0, S.CRITICAL, 'Cannot test restore'),
      sig(D.PRODUCTION_READINESS, 10, S.CRITICAL),
    ], S.CRITICAL, false),
    snapshot('FIXING: Backup job running', [
      sig(D.BACKUPS, 40, S.DEGRADED, 'Backup job in progress'),
      sig(D.RESTORE, 20, S.DEGRADED, 'Testing restore after backup'),
      sig(D.PRODUCTION_READINESS, 30, S.DEGRADED),
    ], S.DEGRADED, false),
    snapshot('RECOVERED: Backup fresh, restore tested', [
      sig(D.BACKUPS, 95, S.HEALTHY, 'Backup fresh: 1h old, encrypted'),
      sig(D.RESTORE, 93, S.HEALTHY, 'Restore tested successfully'),
      sig(D.PRODUCTION_READINESS, 92, S.HEALTHY),
    ], S.HEALTHY, true),
  ]),
  expectedTrend: 'IMPROVING',
  isReal: false,
});

// CMP forced → consent system fixed → HEALTHY
export const RECOVERY_CMP_FIXED = Object.freeze({
  id: 'RECOVERY_CMP_FIXED',
  description: 'CMP forced accept → reject option added → GDPR valid → HEALTHY',
  timeline: Object.freeze([
    snapshot('BLOCKED: CMP forced accept', [
      sig(D.CMP, 0, S.BLOCKED, 'No reject option'),
      sig(D.GDPR, 0, S.BLOCKED),
      sig(D.PRIVACY, 0, S.BLOCKED),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
    ], S.BLOCKED, false),
    snapshot('FIXING: Reject option deployed, consent re-collected', [
      sig(D.CMP, 50, S.WARNING, 'Reject option added, consent being re-collected'),
      sig(D.GDPR, 40, S.WARNING, 'Transitional state'),
      sig(D.PRIVACY, 45, S.WARNING),
      sig(D.PRODUCTION_READINESS, 20, S.CRITICAL),
    ], S.WARNING, false),
    snapshot('RECOVERED: CMP valid, consent properly managed', [
      sig(D.CMP, 97, S.HEALTHY, 'Reject option available, withdraw possible'),
      sig(D.GDPR, 96, S.HEALTHY, 'Consent basis valid'),
      sig(D.PRIVACY, 95, S.HEALTHY, 'No PII oversharing'),
      sig(D.PRODUCTION_READINESS, 90, S.HEALTHY),
    ], S.HEALTHY, true),
  ]),
  expectedTrend: 'IMPROVING',
  isReal: false,
});

// Tests CRITICAL → suites fixed → all passing → recovered
export const RECOVERY_TESTS_FIXED = Object.freeze({
  id: 'RECOVERY_TESTS_FIXED',
  description: 'Critical test suites failing → fixed → all tests passing → HEALTHY',
  timeline: Object.freeze([
    snapshot('CRITICAL: Core test suites failing', [
      sig(D.TESTS, 10, S.CRITICAL, '3/5 critical suites failing'),
      sig(D.BUILD, 20, S.CRITICAL, 'Build unstable'),
      sig(D.PRODUCTION_READINESS, 0, S.CRITICAL),
    ], S.CRITICAL, false),
    snapshot('FIXING: Tests being fixed, partial pass', [
      sig(D.TESTS, 60, S.DEGRADED, '1/5 critical suites still failing'),
      sig(D.BUILD, 70, S.DEGRADED, 'Build mostly stable'),
      sig(D.PRODUCTION_READINESS, 30, S.DEGRADED),
    ], S.DEGRADED, false),
    snapshot('RECOVERED: All test suites passing', [
      sig(D.TESTS, 97, S.HEALTHY, 'All suites passing: 100% pass rate'),
      sig(D.BUILD, 96, S.HEALTHY, 'Build clean'),
      sig(D.PRODUCTION_READINESS, 93, S.HEALTHY),
    ], S.HEALTHY, true),
  ]),
  expectedTrend: 'IMPROVING',
  isReal: false,
});

// Cross-client leak → isolation enforced → no leaks → recovered
export const RECOVERY_CLIENT_ISOLATION_RESTORED = Object.freeze({
  id: 'RECOVERY_CLIENT_ISOLATION_RESTORED',
  description: 'Cross-client leak BLOCKED → data isolation fix deployed → 0 leaks → HEALTHY',
  timeline: Object.freeze([
    snapshot('BLOCKED: Cross-client data leak detected', [
      sig(D.CLIENT_ISOLATION, 0, S.BLOCKED, '3 records exposed across tenants'),
      sig(D.SECURITY, 5, S.BLOCKED, 'Data breach'),
      sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
    ], S.BLOCKED, false),
    snapshot('FIXING: Isolation fix deployed, verifying', [
      sig(D.CLIENT_ISOLATION, 40, S.DEGRADED, 'Fix deployed, verification in progress'),
      sig(D.SECURITY, 50, S.WARNING, 'Auditing access logs'),
      sig(D.PRODUCTION_READINESS, 10, S.CRITICAL),
    ], S.DEGRADED, false),
    snapshot('RECOVERED: 0 leaks, isolation verified', [
      sig(D.CLIENT_ISOLATION, 99, S.HEALTHY, '0 cross-client leaks, isolation verified'),
      sig(D.SECURITY, 97, S.HEALTHY, 'No further breaches'),
      sig(D.PRODUCTION_READINESS, 92, S.HEALTHY),
    ], S.HEALTHY, true),
  ]),
  expectedTrend: 'IMPROVING',
  isReal: false,
});

export const ALL_RECOVERY_FIXTURES = Object.freeze([
  RECOVERY_CI_SECRET_REMOVED,
  RECOVERY_AGENT_POLICY_ENFORCED,
  RECOVERY_BACKUP_FRESHENED,
  RECOVERY_CMP_FIXED,
  RECOVERY_TESTS_FIXED,
  RECOVERY_CLIENT_ISOLATION_RESTORED,
]);

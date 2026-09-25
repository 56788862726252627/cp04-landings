// Failure Fixtures — ADV-20 (20+ degraded/critical scenarios, no real data)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';

const S = HEALTH_STATUS;
const D = HEALTH_DIMENSION;

function sig(dimension, score, status, message = '') {
  return Object.freeze({ dimension, score, status, message, isReal: false });
}

export const FAILURE_FIXTURE_SECRET_LEAK = Object.freeze({
  id: 'FAILURE_SECRET_LEAK',
  description: 'Secret leaked in codebase — BLOCKED status',
  signals: Object.freeze([
    sig(D.SECURITY, 0, S.BLOCKED, 'Secret leak detected in repository'),
    sig(D.CI_CD, 0, S.BLOCKED, 'Secret scan failed'),
    sig(D.CLIENT_ISOLATION, 50, S.WARNING),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
  qualityGateBlock: 'SECRET_LEAKAGE',
});

export const FAILURE_FIXTURE_CROSS_CLIENT_LEAK = Object.freeze({
  id: 'FAILURE_CROSS_CLIENT_LEAK',
  description: 'Client A data visible to Client B — highest severity BLOCKED',
  signals: Object.freeze([
    sig(D.CLIENT_ISOLATION, 0, S.BLOCKED, 'Cross-client leak: 2 records exposed'),
    sig(D.SECURITY, 10, S.CRITICAL, 'Data isolation breach'),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
  qualityGateBlock: 'CROSS_CLIENT_LEAKAGE',
});

export const FAILURE_FIXTURE_BACKUP_UNENCRYPTED = Object.freeze({
  id: 'FAILURE_BACKUP_UNENCRYPTED',
  description: 'Backup exists but NOT encrypted — BLOCKED',
  signals: Object.freeze([
    sig(D.BACKUPS, 0, S.BLOCKED, 'Backup not encrypted'),
    sig(D.SECURITY, 20, S.CRITICAL),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_BACKUP_STALE = Object.freeze({
  id: 'FAILURE_BACKUP_STALE',
  description: 'Last backup is 10 days old — CRITICAL',
  signals: Object.freeze([
    sig(D.BACKUPS, 10, S.CRITICAL, 'Backup stale: 240h old'),
    sig(D.RESTORE, 20, S.CRITICAL, 'Restore not tested'),
    sig(D.SECURITY, 80, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 90, S.HEALTHY),
  ]),
  overallStatus: S.CRITICAL,
  productionReady: false,
});

export const FAILURE_FIXTURE_AGENT_SELF_PERMISSION = Object.freeze({
  id: 'FAILURE_AGENT_SELF_PERMISSION',
  description: 'Agent attempted to escalate own permissions — BLOCKED',
  signals: Object.freeze([
    sig(D.AGENTS, 0, S.BLOCKED, 'Self-permission escalation attempt detected'),
    sig(D.SECURITY, 10, S.CRITICAL),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_MULTIAGENT_DEADLOCK = Object.freeze({
  id: 'FAILURE_MULTIAGENT_DEADLOCK',
  description: 'Two agents in circular deadlock — BLOCKED',
  signals: Object.freeze([
    sig(D.MULTIAGENT, 0, S.BLOCKED, 'Deadlock detected: agent-A ↔ agent-B'),
    sig(D.AGENTS, 20, S.CRITICAL),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_MULTIAGENT_LOOP = Object.freeze({
  id: 'FAILURE_MULTIAGENT_LOOP',
  description: 'Infinite loop detected in agent chain — BLOCKED',
  signals: Object.freeze([
    sig(D.MULTIAGENT, 0, S.BLOCKED, 'Loop detected: 50+ iterations'),
    sig(D.AGENTS, 30, S.WARNING),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_CMP_FORCED_ACCEPT = Object.freeze({
  id: 'FAILURE_CMP_FORCED_ACCEPT',
  description: 'CMP forces user to accept all cookies — BLOCKED',
  signals: Object.freeze([
    sig(D.CMP, 0, S.BLOCKED, 'Forced accept detected: no reject option'),
    sig(D.PRIVACY, 5, S.BLOCKED, 'Consent invalid'),
    sig(D.GDPR, 10, S.CRITICAL, 'GDPR violation'),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_MARKETING_NO_CONSENT = Object.freeze({
  id: 'FAILURE_MARKETING_NO_CONSENT',
  description: 'Marketing actions without valid consent — BLOCKED',
  signals: Object.freeze([
    sig(D.PRIVACY, 0, S.BLOCKED, 'Marketing action without consent'),
    sig(D.GDPR, 5, S.BLOCKED, 'Consent basis missing'),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_MCP_UNSAFE_WRITE = Object.freeze({
  id: 'FAILURE_MCP_UNSAFE_WRITE',
  description: 'MCP server allows unsafe writes — BLOCKED',
  signals: Object.freeze([
    sig(D.MCP, 0, S.BLOCKED, 'Unsafe write not blocked by MCP server'),
    sig(D.SECURITY, 15, S.CRITICAL),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_AI_ROUTER_ALL_DOWN = Object.freeze({
  id: 'FAILURE_AI_ROUTER_ALL_DOWN',
  description: 'All AI providers down, no fallback ready — CRITICAL',
  signals: Object.freeze([
    sig(D.AI_ROUTER, 0, S.CRITICAL, 'All providers down, no fallback'),
    sig(D.AGENTS, 10, S.CRITICAL, 'No routing available'),
    sig(D.PRODUCTION_READINESS, 5, S.CRITICAL),
  ]),
  overallStatus: S.CRITICAL,
  productionReady: false,
});

export const FAILURE_FIXTURE_BUSINESS_TRUTH_UNAVAILABLE = Object.freeze({
  id: 'FAILURE_BUSINESS_TRUTH_UNAVAILABLE',
  description: 'Business source of truth unavailable — CRITICAL',
  signals: Object.freeze([
    sig(D.BUSINESS_TRUTH, 0, S.CRITICAL, 'Source of truth not available'),
    sig(D.AGENTS, 20, S.CRITICAL, 'Agents cannot access business context'),
    sig(D.PRODUCTION_READINESS, 10, S.CRITICAL),
  ]),
  overallStatus: S.CRITICAL,
  productionReady: false,
});

export const FAILURE_FIXTURE_BROWSER_QA_DEAD_CONTROLS = Object.freeze({
  id: 'FAILURE_BROWSER_QA_DEAD_CONTROLS',
  description: 'Browser QA: 3 dead controls detected — CRITICAL',
  signals: Object.freeze([
    sig(D.BROWSER_QA, 10, S.CRITICAL, '3 dead controls detected'),
    sig(D.APPLICATION, 50, S.DEGRADED),
    sig(D.SECURITY, 90, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 95, S.HEALTHY),
  ]),
  overallStatus: S.CRITICAL,
  productionReady: false,
});

export const FAILURE_FIXTURE_CICD_SECRET_SCAN_FAIL = Object.freeze({
  id: 'FAILURE_CICD_SECRET_SCAN_FAIL',
  description: 'CI/CD: secret scan failed — BLOCKED',
  signals: Object.freeze([
    sig(D.CI_CD, 0, S.BLOCKED, 'Secret scan failed'),
    sig(D.SECURITY, 5, S.BLOCKED, 'Potential secret in codebase'),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_TESTS_ALL_FAIL = Object.freeze({
  id: 'FAILURE_TESTS_ALL_FAIL',
  description: 'All test suites failing — CRITICAL',
  signals: Object.freeze([
    sig(D.TESTS, 0, S.CRITICAL, 'All suites failing: 0% pass rate'),
    sig(D.BUILD, 20, S.CRITICAL, 'Build unstable'),
    sig(D.PRODUCTION_READINESS, 0, S.CRITICAL),
  ]),
  overallStatus: S.CRITICAL,
  productionReady: false,
});

export const FAILURE_FIXTURE_RUNTIME_INCOMPATIBLE = Object.freeze({
  id: 'FAILURE_RUNTIME_INCOMPATIBLE',
  description: 'Runtime incompatible: Node version mismatch — CRITICAL',
  signals: Object.freeze([
    sig(D.RUNTIME, 0, S.CRITICAL, 'Runtime incompatible: requires Node 20+, found 16'),
    sig(D.BUILD, 10, S.CRITICAL),
    sig(D.PRODUCTION_READINESS, 0, S.CRITICAL),
  ]),
  overallStatus: S.CRITICAL,
  productionReady: false,
});

export const FAILURE_FIXTURE_MEDIA_NO_CONSENT = Object.freeze({
  id: 'FAILURE_MEDIA_NO_CONSENT',
  description: 'Media action without consent verification — BLOCKED',
  signals: Object.freeze([
    sig(D.MEDIA, 0, S.BLOCKED, 'Media published without consent check'),
    sig(D.PRIVACY, 10, S.CRITICAL),
    sig(D.GDPR, 5, S.BLOCKED),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_VOICE_SAFETY_FAIL = Object.freeze({
  id: 'FAILURE_VOICE_SAFETY_FAIL',
  description: 'Voice agent: safety checks not passed — BLOCKED',
  signals: Object.freeze([
    sig(D.VOICE, 0, S.BLOCKED, 'Safety checks not passed for voice agent'),
    sig(D.SECURITY, 20, S.CRITICAL),
    sig(D.PRODUCTION_READINESS, 0, S.BLOCKED),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
});

export const FAILURE_FIXTURE_OBSERVABILITY_DOWN = Object.freeze({
  id: 'FAILURE_OBSERVABILITY_DOWN',
  description: 'No logs, no traces flowing — CRITICAL',
  signals: Object.freeze([
    sig(D.OBSERVABILITY, 0, S.CRITICAL, 'No logs or traces flowing'),
    sig(D.SYSTEM, 50, S.DEGRADED, 'Cannot verify system state'),
    sig(D.SECURITY, 80, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 90, S.HEALTHY),
  ]),
  overallStatus: S.CRITICAL,
  productionReady: false,
});

export const FAILURE_FIXTURE_HIGH_SCORE_BUT_BLOCKED = Object.freeze({
  id: 'FAILURE_HIGH_SCORE_BUT_BLOCKED',
  description: 'Overall average score=92 BUT security=BLOCKED → overall is BLOCKED (priority rule)',
  signals: Object.freeze([
    sig(D.SYSTEM, 99, S.HEALTHY),
    sig(D.APPLICATION, 98, S.HEALTHY),
    sig(D.BUILD, 97, S.HEALTHY),
    sig(D.TESTS, 99, S.HEALTHY),
    sig(D.SECURITY, 0, S.BLOCKED, 'Secret leak — BLOCKED regardless of average score'),
    sig(D.CLIENT_ISOLATION, 95, S.HEALTHY),
  ]),
  overallStatus: S.BLOCKED,
  productionReady: false,
  demonstratesPriorityRule: true,
});

export const FAILURE_FIXTURE_STALE_SIGNALS = Object.freeze({
  id: 'FAILURE_STALE_SIGNALS',
  description: 'Signals older than 30min → trustworthy=false, cannot report HEALTHY',
  signals: Object.freeze([
    sig(D.SECURITY, 95, S.UNKNOWN, 'Signal stale: 45min old'),
    sig(D.CLIENT_ISOLATION, 95, S.UNKNOWN, 'Signal stale: 45min old'),
    sig(D.PRODUCTION_READINESS, 95, S.UNKNOWN, 'Cannot confirm without fresh signals'),
  ]),
  overallStatus: S.UNKNOWN,
  productionReady: false,
  reason: 'STALE_SIGNALS_BLOCK_PRODUCTION_READINESS',
  qualityGateBlock: 'STALE_SHOWN_AS_HEALTHY',
});

export const ALL_FAILURE_FIXTURES = Object.freeze([
  FAILURE_FIXTURE_SECRET_LEAK,
  FAILURE_FIXTURE_CROSS_CLIENT_LEAK,
  FAILURE_FIXTURE_BACKUP_UNENCRYPTED,
  FAILURE_FIXTURE_BACKUP_STALE,
  FAILURE_FIXTURE_AGENT_SELF_PERMISSION,
  FAILURE_FIXTURE_MULTIAGENT_DEADLOCK,
  FAILURE_FIXTURE_MULTIAGENT_LOOP,
  FAILURE_FIXTURE_CMP_FORCED_ACCEPT,
  FAILURE_FIXTURE_MARKETING_NO_CONSENT,
  FAILURE_FIXTURE_MCP_UNSAFE_WRITE,
  FAILURE_FIXTURE_AI_ROUTER_ALL_DOWN,
  FAILURE_FIXTURE_BUSINESS_TRUTH_UNAVAILABLE,
  FAILURE_FIXTURE_BROWSER_QA_DEAD_CONTROLS,
  FAILURE_FIXTURE_CICD_SECRET_SCAN_FAIL,
  FAILURE_FIXTURE_TESTS_ALL_FAIL,
  FAILURE_FIXTURE_RUNTIME_INCOMPATIBLE,
  FAILURE_FIXTURE_MEDIA_NO_CONSENT,
  FAILURE_FIXTURE_VOICE_SAFETY_FAIL,
  FAILURE_FIXTURE_OBSERVABILITY_DOWN,
  FAILURE_FIXTURE_HIGH_SCORE_BUT_BLOCKED,
  FAILURE_FIXTURE_STALE_SIGNALS,
]);

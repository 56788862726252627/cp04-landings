// Healthy Fixtures — ADV-20 (20+ healthy/acceptable scenarios, no real data)

import { HEALTH_STATUS } from '../core/healthDimension.js';
import { HEALTH_DIMENSION } from '../core/healthDimension.js';

const S = HEALTH_STATUS;
const D = HEALTH_DIMENSION;

function sig(dimension, score, status = S.HEALTHY, message = '') {
  return Object.freeze({ dimension, score, status, message, isReal: false });
}

export const HEALTHY_FIXTURE_ALL_GREEN = Object.freeze({
  id: 'HEALTHY_ALL_GREEN',
  description: 'All 27 dimensions healthy, score ~95',
  signals: Object.freeze([
    sig(D.SYSTEM,               97, S.HEALTHY, 'All services up'),
    sig(D.APPLICATION,          95, S.HEALTHY, 'App responding normally'),
    sig(D.BUILD,                96, S.HEALTHY, 'Build passing'),
    sig(D.TESTS,                94, S.HEALTHY, 'All test suites passing'),
    sig(D.CI_CD,                93, S.HEALTHY, 'Pipeline clean'),
    sig(D.DEPLOYMENT,           95, S.HEALTHY, 'Latest deploy succeeded'),
    sig(D.OBSERVABILITY,        90, S.HEALTHY, 'Logs and traces flowing'),
    sig(D.SECURITY,             98, S.HEALTHY, 'No vulnerabilities'),
    sig(D.PRIVACY,              97, S.HEALTHY, 'Consent valid'),
    sig(D.GDPR,                 96, S.HEALTHY, 'Compliant'),
    sig(D.CMP,                  95, S.HEALTHY, 'CMP operational'),
    sig(D.BACKUPS,              92, S.HEALTHY, 'Backup fresh (<24h)'),
    sig(D.RESTORE,              90, S.HEALTHY, 'Restore tested'),
    sig(D.BUSINESS_TRUTH,       93, S.HEALTHY, 'Source of truth available'),
    sig(D.AI_ROUTER,            91, S.HEALTHY, 'Router routing correctly'),
    sig(D.AGENTS,               89, S.HEALTHY, 'Agents operating in scope'),
    sig(D.MULTIAGENT,           88, S.HEALTHY, 'No loops or deadlocks'),
    sig(D.MCP,                  90, S.HEALTHY, 'MCP servers responding'),
    sig(D.VOICE,                87, S.HEALTHY, 'Safety checks passed'),
    sig(D.CRM,                  85, S.HEALTHY, 'CRM accessible'),
    sig(D.LEADS,                84, S.HEALTHY, 'Lead pipeline healthy'),
    sig(D.SOCIAL,               83, S.HEALTHY, 'Social pipeline ready'),
    sig(D.MEDIA,                86, S.HEALTHY, 'Media consent verified'),
    sig(D.BROWSER_QA,           91, S.HEALTHY, 'No dead controls'),
    sig(D.RUNTIME,              95, S.HEALTHY, 'Runtime compatible'),
    sig(D.CLIENT_ISOLATION,     99, S.HEALTHY, 'No leaks detected'),
    sig(D.PRODUCTION_READINESS, 95, S.HEALTHY, 'Production ready'),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_SECURITY_FIRST = Object.freeze({
  id: 'HEALTHY_SECURITY_FIRST',
  description: 'Security-focused healthy snapshot, security=100',
  signals: Object.freeze([
    sig(D.SECURITY, 100, S.HEALTHY, 'Perfect security posture'),
    sig(D.PRIVACY,  100, S.HEALTHY, 'All PII handled correctly'),
    sig(D.GDPR,     100, S.HEALTHY, 'Full GDPR compliance'),
    sig(D.CMP,      100, S.HEALTHY, 'Consent correctly managed'),
    sig(D.CLIENT_ISOLATION, 100, S.HEALTHY, 'Zero cross-client access'),
    sig(D.SYSTEM,   90, S.HEALTHY, 'System healthy'),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_BACKUP_FRESH = Object.freeze({
  id: 'HEALTHY_BACKUP_FRESH',
  description: 'Backup completed 2h ago, restore tested, encrypted',
  signals: Object.freeze([
    sig(D.BACKUPS, 95, S.HEALTHY, 'Backup fresh, 2h old, encrypted'),
    sig(D.RESTORE, 93, S.HEALTHY, 'Restore tested successfully'),
    sig(D.SECURITY, 95, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 98, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_CICD_CLEAN = Object.freeze({
  id: 'HEALTHY_CICD_CLEAN',
  description: 'CI/CD pipeline fully clean, secret scan passed, all checks green',
  signals: Object.freeze([
    sig(D.CI_CD, 98, S.HEALTHY, 'All checks passed, secret scan clean'),
    sig(D.BUILD, 97, S.HEALTHY, 'Build fast and clean'),
    sig(D.TESTS, 99, S.HEALTHY, '100% pass rate'),
    sig(D.DEPLOYMENT, 95, S.HEALTHY, 'Deploy succeeded'),
    sig(D.SECURITY, 96, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 98, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_AGENTS_OPERATIONAL = Object.freeze({
  id: 'HEALTHY_AGENTS_OPERATIONAL',
  description: 'Agent engine, multiagent, MCP, voice all healthy',
  signals: Object.freeze([
    sig(D.AGENTS,     90, S.HEALTHY, 'Operating within granted scope'),
    sig(D.MULTIAGENT, 89, S.HEALTHY, 'No loops, no deadlocks'),
    sig(D.MCP,        91, S.HEALTHY, 'All MCP servers responding'),
    sig(D.VOICE,      88, S.HEALTHY, 'Safety passed, no real call'),
    sig(D.AI_ROUTER,  93, S.HEALTHY, 'Routing correctly'),
    sig(D.SECURITY, 96, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 98, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_MINIMAL = Object.freeze({
  id: 'HEALTHY_MINIMAL',
  description: 'Minimal set: security+isolation+production readiness healthy',
  signals: Object.freeze([
    sig(D.SECURITY, 95, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
    sig(D.PRODUCTION_READINESS, 90, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_OBSERVABILITY_ACTIVE = Object.freeze({
  id: 'HEALTHY_OBSERVABILITY_ACTIVE',
  description: 'Full observability stack active, all events flowing',
  signals: Object.freeze([
    sig(D.OBSERVABILITY, 95, S.HEALTHY, 'Logs, traces, events all flowing'),
    sig(D.SYSTEM, 92, S.HEALTHY),
    sig(D.SECURITY, 95, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 98, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_BROWSER_QA_CLEAN = Object.freeze({
  id: 'HEALTHY_BROWSER_QA_CLEAN',
  description: 'Browser QA: 0 dead controls, all Playwright tests passing',
  signals: Object.freeze([
    sig(D.BROWSER_QA, 98, S.HEALTHY, '0 dead controls, all E2E tests pass'),
    sig(D.APPLICATION, 95, S.HEALTHY),
    sig(D.SECURITY, 95, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_CRM_LEADS = Object.freeze({
  id: 'HEALTHY_CRM_LEADS',
  description: 'CRM and lead pipeline operational',
  signals: Object.freeze([
    sig(D.CRM,   88, S.HEALTHY, 'CRM accessible, no real data'),
    sig(D.LEADS, 86, S.HEALTHY, 'Lead pipeline healthy'),
    sig(D.SECURITY, 95, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_MEDIA_SOCIAL = Object.freeze({
  id: 'HEALTHY_MEDIA_SOCIAL',
  description: 'Media consent verified, social pipeline ready',
  signals: Object.freeze([
    sig(D.MEDIA,  90, S.HEALTHY, 'Consent verified, no real publish'),
    sig(D.SOCIAL, 87, S.HEALTHY, 'Social pipeline ready, no real publish'),
    sig(D.SECURITY, 95, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_WARNING_ACCEPTABLE = Object.freeze({
  id: 'HEALTHY_WITH_ACCEPTABLE_WARNING',
  description: 'One warning (observability at 72), all critical dimensions healthy',
  signals: Object.freeze([
    sig(D.OBSERVABILITY, 72, S.WARNING, 'Some traces missing'),
    sig(D.SECURITY, 96, S.HEALTHY),
    sig(D.PRIVACY,  95, S.HEALTHY),
    sig(D.GDPR,     94, S.HEALTHY),
    sig(D.CMP,      93, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
    sig(D.PRODUCTION_READINESS, 90, S.HEALTHY),
    sig(D.BACKUPS, 92, S.HEALTHY),
  ]),
  overallStatus: S.WARNING,
  productionReady: true,
});

export const HEALTHY_FIXTURE_FACTORY_SCORE_HIGH = Object.freeze({
  id: 'HEALTHY_FACTORY_SCORE_HIGH',
  description: 'Factory health: all 8 flags true, factoryScore=100',
  factoryFlags: Object.freeze({
    securityHealthy: true,
    testsHealthy: true,
    cicdHealthy: true,
    buildHealthy: true,
    deploymentHealthy: true,
    observabilityHealthy: true,
    clientIsolationHealthy: true,
    productionReadyHealthy: true,
  }),
  expectedFactoryScore: 100,
  isReal: false,
});

export const HEALTHY_FIXTURE_SLO_MET = Object.freeze({
  id: 'HEALTHY_SLO_MET',
  description: 'All SLOs met: availability=99.9%, error rate=0.01%, backup freshness<24h',
  slos: Object.freeze([
    Object.freeze({ type: 'AVAILABILITY', target: 99.9, current: 99.95, status: 'MET' }),
    Object.freeze({ type: 'ERROR_RATE', target: 0.1, current: 0.01, status: 'MET' }),
    Object.freeze({ type: 'BACKUP_FRESHNESS', target: 24, current: 2, status: 'MET' }),
    Object.freeze({ type: 'RECOVERY_READINESS', target: 95, current: 98, status: 'MET' }),
  ]),
  isReal: false,
});

export const HEALTHY_FIXTURE_RECOVERY_COMPLETE = Object.freeze({
  id: 'HEALTHY_RECOVERY_COMPLETE',
  description: 'Post-incident: all dimensions returned to healthy after 2h recovery',
  signals: Object.freeze([
    sig(D.SYSTEM,    95, S.HEALTHY, 'Recovered from incident'),
    sig(D.SECURITY,  97, S.HEALTHY, 'Security posture restored'),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
    sig(D.PRODUCTION_READINESS, 92, S.HEALTHY, 'Production ready again'),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
  isRecovery: true,
});

export const HEALTHY_FIXTURE_MULTIAGENT_NO_LOOPS = Object.freeze({
  id: 'HEALTHY_MULTIAGENT_NO_LOOPS',
  description: 'Multi-agent: 5 agents, 0 loops detected, 0 deadlocks',
  signals: Object.freeze([
    sig(D.MULTIAGENT, 92, S.HEALTHY, '5 agents, 0 loops, 0 deadlocks'),
    sig(D.AGENTS,     91, S.HEALTHY, 'Self-permissions not attempted'),
    sig(D.SECURITY,   96, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_RUNTIME_COMPATIBLE = Object.freeze({
  id: 'HEALTHY_RUNTIME_COMPATIBLE',
  description: 'Runtime compatible: Docker, Node.js, all deps resolved',
  signals: Object.freeze([
    sig(D.RUNTIME, 95, S.HEALTHY, 'Runtime compatible, all deps resolved'),
    sig(D.BUILD,   96, S.HEALTHY),
    sig(D.SECURITY, 95, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 98, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_AI_ROUTER_ALL_PROVIDERS = Object.freeze({
  id: 'HEALTHY_AI_ROUTER_ALL_PROVIDERS',
  description: 'AI Router: 3 providers available, fallback ready',
  signals: Object.freeze([
    sig(D.AI_ROUTER, 94, S.HEALTHY, '3 providers available, fallback ready'),
    sig(D.SECURITY, 96, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_GDPR_CMP_CONSENT = Object.freeze({
  id: 'HEALTHY_GDPR_CMP_FULL',
  description: 'GDPR+CMP+Privacy all healthy, no forced consent, withdraw possible',
  signals: Object.freeze([
    sig(D.GDPR,    98, S.HEALTHY, 'Compliant — legalCertification:false'),
    sig(D.CMP,     97, S.HEALTHY, 'No non-essential default-on, withdraw possible'),
    sig(D.PRIVACY, 96, S.HEALTHY, 'No PII oversharing'),
    sig(D.SECURITY, 97, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_BUSINESS_TRUTH_SOURCED = Object.freeze({
  id: 'HEALTHY_BUSINESS_TRUTH_SOURCED',
  description: 'Business source of truth available and current',
  signals: Object.freeze([
    sig(D.BUSINESS_TRUTH, 93, S.HEALTHY, 'Source available, data current'),
    sig(D.SECURITY, 95, S.HEALTHY),
    sig(D.CLIENT_ISOLATION, 99, S.HEALTHY),
  ]),
  overallStatus: S.HEALTHY,
  productionReady: true,
});

export const HEALTHY_FIXTURE_AUTOMATION_OPERATIONAL = Object.freeze({
  id: 'HEALTHY_AUTOMATION_OPERATIONAL',
  description: 'Make+MCP+Agent all operational, DRY_RUN mode',
  engines: Object.freeze([
    Object.freeze({ engine: 'MAKE', status: 'OPERATIONAL', successRate: 98, dryRun: true }),
    Object.freeze({ engine: 'MCP', status: 'OPERATIONAL', successRate: 100 }),
    Object.freeze({ engine: 'AGENT', status: 'OPERATIONAL', successRate: 97 }),
  ]),
  overallStatus: 'OPERATIONAL',
  isReal: false,
});

export const HEALTHY_FIXTURE_QUALITY_GATE_PASSES = Object.freeze({
  id: 'HEALTHY_QUALITY_GATE_PASSES',
  description: 'Quality gate: 0 violations, all 7 checks passed',
  params: Object.freeze({
    hasCriticalSignals: false,
    criticalInDashboard: false,
    crossClientLeakage: false,
    staleShownAsHealthy: false,
    unknownCriticalAsHealthy: false,
    productionReadyWhenBlocked: false,
    secretsExposed: false,
    dependencyPropagationWrong: false,
  }),
  expectedPassed: true,
  isReal: false,
});

export const ALL_HEALTHY_FIXTURES = Object.freeze([
  HEALTHY_FIXTURE_ALL_GREEN,
  HEALTHY_FIXTURE_SECURITY_FIRST,
  HEALTHY_FIXTURE_BACKUP_FRESH,
  HEALTHY_FIXTURE_CICD_CLEAN,
  HEALTHY_FIXTURE_AGENTS_OPERATIONAL,
  HEALTHY_FIXTURE_MINIMAL,
  HEALTHY_FIXTURE_OBSERVABILITY_ACTIVE,
  HEALTHY_FIXTURE_BROWSER_QA_CLEAN,
  HEALTHY_FIXTURE_CRM_LEADS,
  HEALTHY_FIXTURE_MEDIA_SOCIAL,
  HEALTHY_FIXTURE_WARNING_ACCEPTABLE,
  HEALTHY_FIXTURE_FACTORY_SCORE_HIGH,
  HEALTHY_FIXTURE_SLO_MET,
  HEALTHY_FIXTURE_RECOVERY_COMPLETE,
  HEALTHY_FIXTURE_MULTIAGENT_NO_LOOPS,
  HEALTHY_FIXTURE_RUNTIME_COMPATIBLE,
  HEALTHY_FIXTURE_AI_ROUTER_ALL_PROVIDERS,
  HEALTHY_FIXTURE_GDPR_CMP_CONSENT,
  HEALTHY_FIXTURE_BUSINESS_TRUTH_SOURCED,
  HEALTHY_FIXTURE_AUTOMATION_OPERATIONAL,
  HEALTHY_FIXTURE_QUALITY_GATE_PASSES,
]);

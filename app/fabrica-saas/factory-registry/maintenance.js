// Factory Registry — Paso F: Maintenance, Support & Backup Operating System

export {
  MAINTENANCE_TIERS,
  REVIEW_CADENCE,
  createMaintenanceService,
  getRecommendedMaintenanceTier,
  MAINTENANCE_SERVICE_VERSION,
} from '../maintenance/maintenanceService.js';

export {
  TICKET_TYPES,
  TICKET_STATES,
  TICKET_PRIORITIES,
  createSupportTicket,
  updateTicketState,
  SUPPORT_TICKET_VERSION,
} from '../maintenance/supportTicket.js';

export {
  triageSupportTicket,
  batchTriage,
  TRIAGE_ENGINE_VERSION,
} from '../maintenance/triageEngine.js';

export {
  PRIORITY_LEVELS,
  BASE_SERVICE_TARGETS,
  getServiceTarget,
  getAllTargetsForTier,
  SERVICE_TARGETS_VERSION,
} from '../maintenance/serviceTargets.js';

export {
  isIncidentEligible,
  supportTicketToIncident,
  auditTicketsForEscalation,
  INCIDENT_INTEGRATION_VERSION,
} from '../maintenance/incidentIntegration.js';

export {
  BACKUP_FREQUENCIES,
  BACKUP_TYPES,
  BACKUP_HEALTH_STATUS,
  createBackupPolicy,
  auditBackupHealth,
  evaluateRestoreReadiness,
  BACKUP_POLICY_VERSION,
} from '../maintenance/backupPolicy.js';

export {
  CHECK_OUTCOMES,
  CHECKLIST_AREAS,
  MAINTENANCE_CHECKS,
  buildChecklistResult,
  MAINTENANCE_CHECKLIST_VERSION,
} from '../maintenance/maintenanceChecklist.js';

export {
  CYCLE_STATUS,
  runMaintenanceCycle,
  MAINTENANCE_RUNNER_VERSION,
} from '../maintenance/maintenanceRunner.js';

export {
  createTicket,
  assignTicket,
  updateTicket,
  escalateTicket,
  resolveTicket,
  closeTicket,
  listTickets,
  getQueueSummary,
  resetQueue,
  SUPPORT_QUEUE_VERSION,
} from '../maintenance/supportQueue.js';

export {
  ESCALATION_LEVELS,
  evaluateEscalation,
  getEscalationDefinition,
  ESCALATION_ENGINE_VERSION,
} from '../maintenance/escalationEngine.js';

export {
  OWNERSHIP,
  THIRD_PARTY_CATEGORIES,
  classifyOwnership,
  createThirdPartyIncidentReport,
  THIRD_PARTY_INCIDENTS_VERSION,
} from '../maintenance/thirdPartyIncidents.js';

export {
  AUTOMATION_STATUS,
  AUTOMATION_HEALTH_STATUS,
  auditAutomationHealth,
  AUTOMATION_HEALTH_VERSION,
} from '../maintenance/automationHealth.js';

export {
  AI_AGENT_STATUS,
  AI_HEALTH_STATUS,
  auditAIHealth,
  AI_HEALTH_VERSION,
} from '../maintenance/aiHealth.js';

export {
  SECURITY_CHECK_STATUS,
  SECURITY_HEALTH_STATUS,
  runSecurityMaintenance,
  SECURITY_MAINTENANCE_VERSION,
} from '../maintenance/securityMaintenance.js';

export {
  HEALTH_LABELS,
  calculateClientHealthScore,
  compareHealthScores,
  CLIENT_HEALTH_SCORE_VERSION,
} from '../maintenance/clientHealthScore.js';

export {
  REPORT_SECTIONS,
  generateMaintenanceReport,
  MAINTENANCE_REPORT_VERSION,
} from '../maintenance/maintenanceReport.js';

export {
  SCOPE_CATEGORIES,
  SCOPE_DECISION,
  classifyScopeRequest,
  SCOPE_BOUNDARY_VERSION,
} from '../maintenance/scopeBoundary.js';

export {
  IMPROVEMENT_CATEGORIES,
  IMPROVEMENT_PRIORITY,
  identifyImprovementOpportunities,
  CONTINUOUS_IMPROVEMENT_VERSION,
} from '../maintenance/continuousImprovement.js';

export {
  OFFBOARDING_STATUS,
  initiateOffboarding,
  completeOffboardingStep,
  endMaintenanceService,
  SERVICE_OFFBOARDING_VERSION,
} from '../maintenance/serviceOffboarding.js';

export const PASO_F_STATUS = '100_PERCENT';

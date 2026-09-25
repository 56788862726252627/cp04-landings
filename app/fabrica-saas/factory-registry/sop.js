// Factory Registry — SOP + BPMN (Paso E)

// Process Registry
export {
  PROCESS_CATEGORIES,
  PROCESS_STATUS,
  createProcess,
  registerProcess,
  getProcess,
  listProcesses,
  clearRegistry,
  PROCESS_REGISTRY_VERSION,
} from '../sop/processRegistry.js';

// Operating Roles
export {
  AGENCY_ROLES,
  getRole,
  listRoles,
  canPerformAction,
  hasApprovalAuthority,
  getEscalationTarget,
  ROLES_VERSION,
} from '../sop/operatingRoles.js';

// SOP Engine
export {
  SOP_STEP_TYPES,
  SOP_STATUS,
  createSOP,
  validateSOP,
  runSOP,
  SOP_ENGINE_VERSION,
} from '../sop/sopEngine.js';

// Client SOPs
export {
  CLIENT_SOPS,
  sopLeadIntake,
  sopQualification,
  sopDiscovery,
  sopDiagnosis,
  sopRequirements,
  sopProposalReview,
  sopApproval,
  sopChangeRequest,
  sopDeliveryAcceptance,
  sopHandoff,
  sopSupportStart,
  sopCloseout,
  ALL_CLIENT_SOPS,
} from '../sop/clientSOP.js';

// Agency SOP
export {
  AGENCY_SOP_STAGES,
  STAGE_OWNERS,
  STAGE_GATES,
  STAGE_ARTIFACTS,
  runAgencySOP,
  AGENCY_SOP_VERSION,
} from '../sop/agencySOP.js';

// Factory SOP
export {
  FACTORY_SOP_ID,
  sopFactoryGeneration,
  FACTORY_SOP_STAGES,
  getFactoryStageOwner,
  FACTORY_SOP_VERSION,
} from '../sop/factorySOP.js';

// Commercial SOP
export {
  COMMERCIAL_SOP_ID,
  sopCommercialProposal,
  validateCommercialGate,
  COMMERCIAL_SOP_VERSION,
} from '../sop/commercialSOP.js';

// AI Agent SOP
export {
  AI_RISK_TIERS,
  AI_AGENT_TYPES,
  defineAgentProfile,
  validateAgentProfile,
  sopAIAgent,
  AI_AGENT_SOP_VERSION,
} from '../sop/aiAgentSOP.js';

// Automation SOP
export {
  AUTOMATION_ENVIRONMENTS,
  AUTOMATION_ERROR_STRATEGIES,
  defineAutomation,
  automationProductionGate,
  sopAutomation,
  AUTOMATION_SOP_VERSION,
} from '../sop/automationSOP.js';

// QA SOP
export {
  QA_CHECK_TYPES,
  QA_OUTCOMES,
  runQAGate,
  sopQA,
  P0_CHECKS,
  P1_CHECKS,
  QA_SOP_VERSION,
} from '../sop/qaSOP.js';

// Security SOP
export {
  DATA_CLASSIFICATION,
  CREDENTIAL_OWNERSHIP,
  classifyData,
  validateCredentialPlan,
  sopSecurity,
  SECURITY_SOP_VERSION,
} from '../sop/securitySOP.js';

// Production SOP
export {
  PRODUCTION_ENVIRONMENTS,
  DEPLOY_STATUS,
  validateProductionReadiness,
  sopProduction,
  PRODUCTION_SOP_VERSION,
} from '../sop/productionSOP.js';

// Support SOP
export {
  TICKET_PRIORITY,
  RESPONSE_TIME_HOURS,
  classifyTicket,
  sopSupport,
  SUPPORT_SOP_VERSION,
} from '../sop/supportSOP.js';

// Maintenance SOP
export {
  MAINTENANCE_REVIEW_TYPES,
  MAINTENANCE_HEALTH_STATUS,
  runMaintenanceCheck,
  sopMaintenance,
  MAINTENANCE_SOP_VERSION,
} from '../sop/maintenanceSOP.js';

// Incident Management
export {
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  createIncident,
  classifySeverity,
  updateIncident,
  generatePostmortem,
  INCIDENT_MANAGEMENT_VERSION,
} from '../sop/incidentManagement.js';

// Decision Gates
export {
  GATE_OUTCOMES,
  GATE_IDS,
  commercialGate,
  scopeGate,
  productionGate,
  qaGate,
  securityGate,
  deliveryGate,
  changeGate,
  incidentGate,
  ALL_GATES,
  DECISION_GATES_VERSION,
} from '../sop/decisionGates.js';

// BPMN Engine
export {
  BPMN_ELEMENT_TYPES,
  createBPMNProcess,
  startEvent,
  endEvent,
  task,
  serviceTask,
  userTask,
  manualTask,
  xorGateway,
  parallelGateway,
  flow,
  validateBPMNProcess,
  BPMN_ENGINE_VERSION,
} from '../bpmn/bpmnEngine.js';

// BPMN Models
export { bpmnAgencyProcess, BPMN_AGENCY_VERSION }         from '../bpmn/bpmnAgency.js';
export { bpmnClientProcess, BPMN_CLIENT_VERSION }         from '../bpmn/bpmnClient.js';
export { bpmnFactoryProcess, BPMN_FACTORY_VERSION }       from '../bpmn/bpmnFactory.js';
export { bpmnAutomationProcess, BPMN_AUTOMATION_VERSION } from '../bpmn/bpmnAutomation.js';
export { bpmnIncidentProcess, BPMN_INCIDENT_VERSION }     from '../bpmn/bpmnIncident.js';

// BPMN Export
export {
  exportToJSON,
  exportToMermaid,
  exportToXML,
  BPMN_EXPORT_VERSION,
} from '../bpmn/bpmnExport.js';

// SOP ↔ BPMN Mapping
export {
  mapSOPToBPMN,
  auditAllMappings,
  SOP_BPMN_MAPPING_VERSION,
} from '../bpmn/sopBpmnMapping.js';

// Process Health Check
export {
  auditProcess,
  auditProcessList,
  auditBPMNProcess,
  PROCESS_HEALTH_VERSION,
} from '../bpmn/processHealthCheck.js';

export const PASO_E_STATUS  = '100_PERCENT';
export const SOP_REGISTRY_VERSION = '1.0.0';

// Operating Roles — FASE 3: roles operativos de la Agencia IA

export const AGENCY_ROLES = Object.freeze({
  AGENCY_OWNER:          'AGENCY_OWNER',
  COMMERCIAL:            'COMMERCIAL',
  PROJECT_MANAGER:       'PROJECT_MANAGER',
  AI_SPECIALIST:         'AI_SPECIALIST',
  AUTOMATION_SPECIALIST: 'AUTOMATION_SPECIALIST',
  DEVELOPER:             'DEVELOPER',
  QA:                    'QA',
  SUPPORT:               'SUPPORT',
  CLIENT_OWNER:          'CLIENT_OWNER',
  CLIENT_USER:           'CLIENT_USER',
});

const ROLE_DEFINITIONS = {
  [AGENCY_ROLES.AGENCY_OWNER]: {
    role:              AGENCY_ROLES.AGENCY_OWNER,
    responsibilities:  ['strategic decisions', 'final approvals', 'partner relationships', 'pricing policy'],
    allowedActions:    ['approve_proposal', 'close_client', 'authorize_discount', 'approve_scope_change', 'escalate_incident'],
    forbiddenActions:  ['modify_client_production_data_directly'],
    approvalAuthority: ['SCOPE_CHANGE', 'PROPOSAL', 'CLOSEOUT', 'INCIDENT_SEV1'],
    escalationTarget:  null,
  },
  [AGENCY_ROLES.COMMERCIAL]: {
    role:              AGENCY_ROLES.COMMERCIAL,
    responsibilities:  ['lead intake', 'qualification', 'proposal generation', 'client communication'],
    allowedActions:    ['qualify_lead', 'generate_proposal', 'send_proposal', 'create_estimate'],
    forbiddenActions:  ['approve_scope_change', 'merge_to_production'],
    approvalAuthority: ['PROPOSAL_DRAFT'],
    escalationTarget:  AGENCY_ROLES.AGENCY_OWNER,
  },
  [AGENCY_ROLES.PROJECT_MANAGER]: {
    role:              AGENCY_ROLES.PROJECT_MANAGER,
    responsibilities:  ['project tracking', 'scope management', 'client coordination', 'delivery planning'],
    allowedActions:    ['update_tracking', 'create_change_request', 'schedule_delivery', 'open_ticket'],
    forbiddenActions:  ['approve_proposal', 'merge_to_production'],
    approvalAuthority: ['CHANGE_REQUEST_MINOR'],
    escalationTarget:  AGENCY_ROLES.AGENCY_OWNER,
  },
  [AGENCY_ROLES.AI_SPECIALIST]: {
    role:              AGENCY_ROLES.AI_SPECIALIST,
    responsibilities:  ['AI agent design', 'prompt engineering', 'model selection', 'AI risk review'],
    allowedActions:    ['design_agent', 'define_prompt', 'run_ai_test', 'review_ai_output'],
    forbiddenActions:  ['store_real_credentials', 'access_client_production_data'],
    approvalAuthority: ['AI_RELEASE_GATE'],
    escalationTarget:  AGENCY_ROLES.PROJECT_MANAGER,
  },
  [AGENCY_ROLES.AUTOMATION_SPECIALIST]: {
    role:              AGENCY_ROLES.AUTOMATION_SPECIALIST,
    responsibilities:  ['Make scenario design', 'webhook setup', 'integration testing', 'automation docs'],
    allowedActions:    ['design_scenario', 'configure_webhook', 'test_automation', 'deploy_staging'],
    forbiddenActions:  ['deploy_production_without_approval', 'store_real_secrets_in_code'],
    approvalAuthority: ['AUTOMATION_STAGING_GATE'],
    escalationTarget:  AGENCY_ROLES.PROJECT_MANAGER,
  },
  [AGENCY_ROLES.DEVELOPER]: {
    role:              AGENCY_ROLES.DEVELOPER,
    responsibilities:  ['code implementation', 'tech architecture', 'build pipeline', 'code review'],
    allowedActions:    ['write_code', 'run_tests', 'create_branch', 'open_pr'],
    forbiddenActions:  ['push_to_main_directly', 'skip_lint', 'deploy_without_qa'],
    approvalAuthority: [],
    escalationTarget:  AGENCY_ROLES.PROJECT_MANAGER,
  },
  [AGENCY_ROLES.QA]: {
    role:              AGENCY_ROLES.QA,
    responsibilities:  ['functional QA', 'mobile QA', 'security review', 'dead control audit'],
    allowedActions:    ['run_qa_suite', 'block_delivery', 'open_qa_ticket', 'approve_delivery_gate'],
    forbiddenActions:  ['approve_scope_change', 'skip_security_check'],
    approvalAuthority: ['QA_GATE', 'DELIVERY_GATE'],
    escalationTarget:  AGENCY_ROLES.PROJECT_MANAGER,
  },
  [AGENCY_ROLES.SUPPORT]: {
    role:              AGENCY_ROLES.SUPPORT,
    responsibilities:  ['ticket intake', 'bug triage', 'client communication', 'incident first response'],
    allowedActions:    ['open_ticket', 'classify_ticket', 'escalate_incident', 'resolve_bug'],
    forbiddenActions:  ['modify_production_config', 'approve_scope_change'],
    approvalAuthority: [],
    escalationTarget:  AGENCY_ROLES.PROJECT_MANAGER,
  },
  [AGENCY_ROLES.CLIENT_OWNER]: {
    role:              AGENCY_ROLES.CLIENT_OWNER,
    responsibilities:  ['project approval', 'acceptance sign-off', 'credentials ownership'],
    allowedActions:    ['approve_proposal', 'accept_delivery', 'request_change', 'designate_technical_contact'],
    forbiddenActions:  ['access_agency_internal_systems'],
    approvalAuthority: ['CLIENT_ACCEPTANCE'],
    escalationTarget:  AGENCY_ROLES.COMMERCIAL,
  },
  [AGENCY_ROLES.CLIENT_USER]: {
    role:              AGENCY_ROLES.CLIENT_USER,
    responsibilities:  ['use delivered product', 'report bugs', 'request training'],
    allowedActions:    ['open_support_ticket', 'request_training', 'use_product'],
    forbiddenActions:  ['modify_production_config', 'access_admin_panel_without_training'],
    approvalAuthority: [],
    escalationTarget:  AGENCY_ROLES.CLIENT_OWNER,
  },
};

export function getRole(roleId) {
  return ROLE_DEFINITIONS[roleId] ?? null;
}

export function listRoles() {
  return Object.values(ROLE_DEFINITIONS);
}

export function canPerformAction(roleId, action) {
  const role = ROLE_DEFINITIONS[roleId];
  if (!role) return { allowed: false, reason: 'unknown_role' };
  if (role.forbiddenActions.includes(action)) return { allowed: false, reason: 'forbidden' };
  if (role.allowedActions.includes(action)) return { allowed: true, reason: 'allowed' };
  return { allowed: false, reason: 'not_in_allowed_list' };
}

export function hasApprovalAuthority(roleId, gateType) {
  const role = ROLE_DEFINITIONS[roleId];
  if (!role) return false;
  return role.approvalAuthority.includes(gateType);
}

export function getEscalationTarget(roleId) {
  const role = ROLE_DEFINITIONS[roleId];
  if (!role) return null;
  return role.escalationTarget;
}

export const ROLES_VERSION = '1.0.0';

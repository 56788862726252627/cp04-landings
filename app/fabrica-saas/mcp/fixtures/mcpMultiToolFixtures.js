// MCP Multi-Tool Workflow Fixtures — ADV-12

export const WORKFLOW_LEAD_RESEARCH = Object.freeze({
  label: 'lead_research_pipeline',
  description: 'search → enrich → score → CRM prep (sequential)',
  planType: 'SEQUENTIAL',
  steps: Object.freeze([
    Object.freeze({ toolId: 'search.semantic',  args: { query: 'fisioterapia deportiva Madrid', collection: 'leads' }, readOnly: true }),
    Object.freeze({ toolId: 'crm.get_lead',     args: { leadId: 'lead_found_001' }, readOnly: true }),
    Object.freeze({ toolId: 'agent_eval.get_score', args: { sessionId: 'session_research_01' }, readOnly: true }),
    Object.freeze({ toolId: 'crm.update_lead',  args: { leadId: 'lead_found_001', fields: { status: 'QUALIFIED', score: 82 } }, readOnly: false }),
  ]),
  expectedPlanType: 'SEQUENTIAL',
  isReal: false,
});

export const WORKFLOW_BOOKING_PREPARATION = Object.freeze({
  label: 'booking_preparation_pipeline',
  description: 'get hours → check availability → book (sequential)',
  planType: 'SEQUENTIAL',
  steps: Object.freeze([
    Object.freeze({ toolId: 'business.get_hours',   args: { clientId: 'padel_club_01' }, readOnly: true }),
    Object.freeze({ toolId: 'calendar.get_slots',   args: { date: '2026-09-20', serviceId: 'pista_03' }, readOnly: true }),
    Object.freeze({ toolId: 'calendar.book_slot',   args: { date: '2026-09-20', time: '10:00', serviceId: 'pista_03', clientId: 'padel_club_01' }, readOnly: false }),
  ]),
  expectedPlanType: 'SEQUENTIAL',
  isReal: false,
});

export const WORKFLOW_PARALLEL_READ = Object.freeze({
  label: 'parallel_read_dashboard',
  description: 'Fetch hours + services + prices in parallel (parallel-read-only)',
  planType: 'PARALLEL_READ_ONLY',
  steps: Object.freeze([
    Object.freeze({ toolId: 'business.get_hours',   args: { clientId: 'dental_clinic_02' }, readOnly: true }),
    Object.freeze({ toolId: 'business.get_services',args: { clientId: 'dental_clinic_02' }, readOnly: true }),
    Object.freeze({ toolId: 'business.get_prices',  args: { clientId: 'dental_clinic_02', service: 'limpieza' }, readOnly: true }),
  ]),
  expectedPlanType: 'PARALLEL_READ_ONLY',
  isReal: false,
});

export const WORKFLOW_SINGLE = Object.freeze({
  label: 'single_tool_call',
  description: 'Single crm.get_lead call wrapped in a plan',
  planType: 'SINGLE',
  steps: Object.freeze([
    Object.freeze({ toolId: 'crm.get_lead', args: { leadId: 'lead_solo_001' }, readOnly: true }),
  ]),
  expectedPlanType: 'SINGLE',
  isReal: false,
});

export const ALL_MULTI_TOOL_FIXTURES = Object.freeze([
  WORKFLOW_LEAD_RESEARCH,
  WORKFLOW_BOOKING_PREPARATION,
  WORKFLOW_PARALLEL_READ,
  WORKFLOW_SINGLE,
]);

export const MCP_MULTI_TOOL_FIXTURES_VERSION = '1.0.0';

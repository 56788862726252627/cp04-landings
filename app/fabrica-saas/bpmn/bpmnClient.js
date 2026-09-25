// BPMN Client — FASE 20: flujo cliente con lanes CLIENTE / AGENCIA

import {
  createBPMNProcess, startEvent, endEvent, task, userTask,
  xorGateway, flow,
} from './bpmnEngine.js';

const clientElements = [
  startEvent('start_client_inquiry', 'Consulta cliente'),
  userTask('client_submit_info', 'Enviar información', 'CLIENT_OWNER'),
  userTask('client_clarification', 'Aclarar dudas', 'CLIENT_OWNER'),
  userTask('client_proposal_review', 'Revisar propuesta', 'CLIENT_OWNER'),
  xorGateway('gw_client_approves', '¿Aprueba?', ['si → accepted', 'no → rejected', 'revisar → revise']),
  userTask('client_change_request', 'Solicitar cambio', 'CLIENT_OWNER'),
  userTask('client_acceptance', 'Aceptar entrega', 'CLIENT_OWNER'),
  userTask('client_training', 'Recibir formación', 'CLIENT_OWNER'),
  userTask('client_support_ticket', 'Abrir ticket soporte', 'CLIENT_USER'),
  endEvent('end_client_closed', 'Proyecto cerrado'),
  endEvent('end_client_rejected', 'Propuesta rechazada'),
];

const agencyElements = [
  task('agency_lead_intake', 'Intake lead', 'COMMERCIAL'),
  task('agency_qualification', 'Qualificación', 'COMMERCIAL'),
  task('agency_discovery', 'Discovery', 'PROJECT_MANAGER'),
  task('agency_proposal_send', 'Enviar propuesta', 'COMMERCIAL'),
  task('agency_proposal_revise', 'Revisar propuesta', 'COMMERCIAL'),
  task('agency_delivery', 'Entrega producto', 'PROJECT_MANAGER'),
  task('agency_handoff_training', 'Handoff + Formación', 'PROJECT_MANAGER'),
  task('agency_support_resolve', 'Resolver ticket', 'SUPPORT'),
  task('agency_closeout', 'Cierre proyecto', 'AGENCY_OWNER'),
];

const flows = [
  flow('start_client_inquiry', 'client_submit_info'),
  flow('client_submit_info', 'agency_lead_intake'),
  flow('agency_lead_intake', 'agency_qualification'),
  flow('agency_qualification', 'agency_discovery'),
  flow('agency_discovery', 'client_clarification'),
  flow('client_clarification', 'agency_proposal_send'),
  flow('agency_proposal_send', 'client_proposal_review'),
  flow('client_proposal_review', 'gw_client_approves'),
  flow('gw_client_approves', 'agency_delivery', 'si'),
  flow('gw_client_approves', 'end_client_rejected', 'no'),
  flow('gw_client_approves', 'agency_proposal_revise', 'revisar'),
  flow('agency_proposal_revise', 'client_proposal_review'),
  flow('agency_delivery', 'client_acceptance'),
  flow('client_acceptance', 'agency_handoff_training'),
  flow('agency_handoff_training', 'client_training'),
  flow('client_training', 'client_support_ticket'),
  flow('client_support_ticket', 'agency_support_resolve'),
  flow('agency_support_resolve', 'agency_closeout'),
  flow('agency_closeout', 'end_client_closed'),
  flow('client_change_request', 'agency_delivery'),
];

const result = createBPMNProcess({
  id:          'BPMN_CLIENT',
  name:        'Client ↔ Agency Flow',
  description: 'Two-pool model: CLIENT and AGENCY lanes',
  sopRef:      'CLIENT_SOP',
  pools: [
    {
      id:   'pool_client',
      name: 'Cliente',
      lanes: [
        { id: 'lane_client_owner', name: 'Client Owner', owner: 'CLIENT_OWNER',
          elementRefs: ['client_submit_info', 'client_clarification', 'client_proposal_review', 'gw_client_approves', 'client_acceptance', 'client_training', 'client_change_request'] },
        { id: 'lane_client_user', name: 'Client User', owner: 'CLIENT_USER',
          elementRefs: ['client_support_ticket'] },
      ],
      elements: clientElements,
    },
    {
      id:   'pool_agency_client',
      name: 'Agencia',
      lanes: [
        { id: 'lane_commercial_c', name: 'Commercial', owner: 'COMMERCIAL',
          elementRefs: ['agency_lead_intake', 'agency_qualification', 'agency_proposal_send', 'agency_proposal_revise'] },
        { id: 'lane_pm_c', name: 'Project Manager', owner: 'PROJECT_MANAGER',
          elementRefs: ['agency_discovery', 'agency_delivery', 'agency_handoff_training'] },
        { id: 'lane_support_c', name: 'Support', owner: 'SUPPORT',
          elementRefs: ['agency_support_resolve'] },
        { id: 'lane_owner_c', name: 'Agency Owner', owner: 'AGENCY_OWNER',
          elementRefs: ['agency_closeout'] },
      ],
      elements: agencyElements,
    },
  ],
  sequenceFlows: flows,
  version: '1.0.0',
});

export const bpmnClientProcess = result.process;
export const BPMN_CLIENT_VERSION = '1.0.0';

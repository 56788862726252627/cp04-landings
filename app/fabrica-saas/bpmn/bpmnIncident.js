// BPMN Incident — FASE 23: flujo de gestión de incidentes

import {
  createBPMNProcess, startEvent, endEvent, task,
  xorGateway, flow,
} from './bpmnEngine.js';

const elements = [
  startEvent('start_incident_detected', 'Incidente detectado'),
  task('task_classify_incident', 'Clasificar incidente', 'SUPPORT'),
  xorGateway('gw_severity', '¿Severidad?', ['SEV1 → sev1_response', 'SEV2 → sev2_response', 'SEV3/SEV4 → standard_response']),
  task('task_sev1_response', 'Respuesta SEV1 (15 min)', 'AGENCY_OWNER'),
  task('task_sev2_response', 'Respuesta SEV2 (1h)', 'PROJECT_MANAGER'),
  task('task_standard_response', 'Respuesta estándar', 'SUPPORT'),
  task('task_contain', 'Contener incidente', 'PROJECT_MANAGER'),
  xorGateway('gw_contained', '¿Contenido?', ['si → investigate', 'no → escalate']),
  task('task_escalate', 'Escalar AGENCY_OWNER', 'PROJECT_MANAGER'),
  task('task_investigate', 'Investigar causa raíz', 'DEVELOPER'),
  task('task_resolve', 'Resolver incidente', 'DEVELOPER'),
  task('task_verify', 'Verificar resolución', 'QA'),
  xorGateway('gw_verified', '¿Verificado?', ['si → communicate', 'no → investigate']),
  task('task_communicate', 'Comunicar resolución a cliente', 'PROJECT_MANAGER'),
  task('task_postmortem', 'Postmortem', 'PROJECT_MANAGER'),
  task('task_close_incident', 'Cerrar incidente', 'SUPPORT'),
  endEvent('end_incident_closed', 'Incidente cerrado'),
];

const flows = [
  flow('start_incident_detected', 'task_classify_incident'),
  flow('task_classify_incident', 'gw_severity'),
  flow('gw_severity', 'task_sev1_response', 'SEV1'),
  flow('gw_severity', 'task_sev2_response', 'SEV2'),
  flow('gw_severity', 'task_standard_response', 'SEV3/SEV4'),
  flow('task_sev1_response', 'task_contain'),
  flow('task_sev2_response', 'task_contain'),
  flow('task_standard_response', 'task_contain'),
  flow('task_contain', 'gw_contained'),
  flow('gw_contained', 'task_investigate', 'si'),
  flow('gw_contained', 'task_escalate', 'no'),
  flow('task_escalate', 'task_contain'),
  flow('task_investigate', 'task_resolve'),
  flow('task_resolve', 'task_verify'),
  flow('task_verify', 'gw_verified'),
  flow('gw_verified', 'task_communicate', 'si'),
  flow('gw_verified', 'task_investigate', 'no'),
  flow('task_communicate', 'task_postmortem'),
  flow('task_postmortem', 'task_close_incident'),
  flow('task_close_incident', 'end_incident_closed'),
];

const result = createBPMNProcess({
  id:          'BPMN_INCIDENT',
  name:        'Incident Management Flow',
  description: 'Detected → Classify → Contain → Investigate → Resolve → Postmortem → Close',
  sopRef:      'INCIDENT_MANAGEMENT',
  pools: [{
    id:   'pool_incident',
    name: 'Gestión Incidentes',
    lanes: [
      { id: 'lane_support_i', name: 'Support', owner: 'SUPPORT',
        elementRefs: ['task_classify_incident', 'task_standard_response', 'task_close_incident'] },
      { id: 'lane_pm_i', name: 'Project Manager', owner: 'PROJECT_MANAGER',
        elementRefs: ['task_sev2_response', 'task_contain', 'task_escalate', 'task_communicate', 'task_postmortem'] },
      { id: 'lane_dev_i', name: 'Developer', owner: 'DEVELOPER',
        elementRefs: ['task_investigate', 'task_resolve'] },
      { id: 'lane_qa_i', name: 'QA', owner: 'QA',
        elementRefs: ['task_verify'] },
      { id: 'lane_owner_i', name: 'Agency Owner', owner: 'AGENCY_OWNER',
        elementRefs: ['task_sev1_response'] },
    ],
    elements,
  }],
  sequenceFlows: flows,
  version: '1.0.0',
});

export const bpmnIncidentProcess = result.process;
export const BPMN_INCIDENT_VERSION = '1.0.0';

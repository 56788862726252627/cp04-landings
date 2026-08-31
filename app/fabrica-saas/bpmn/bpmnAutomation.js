// BPMN Automation — FASE 22: flujo de automatización Make

import {
  createBPMNProcess, startEvent, endEvent, task, serviceTask,
  xorGateway, flow,
} from './bpmnEngine.js';

const elements = [
  startEvent('start_trigger', 'Trigger recibido'),
  task('task_validate_input', 'Validar inputs', 'AUTOMATION_SPECIALIST'),
  xorGateway('gw_input_valid', '¿Inputs válidos?', ['si → execute', 'no → human_review_input']),
  task('task_human_review_input', 'Human review inputs', 'PROJECT_MANAGER'),
  serviceTask('task_execute', 'Ejecutar pasos Make', 'AUTOMATION_SPECIALIST'),
  xorGateway('gw_execution_ok', '¿Ejecución OK?', ['si → output', 'no → error_handling']),
  task('task_error_handling', 'Gestionar error', 'AUTOMATION_SPECIALIST'),
  xorGateway('gw_retry', '¿Reintentar?', ['si → execute', 'no → human_review_error']),
  task('task_human_review_error', 'Human review error', 'PROJECT_MANAGER'),
  task('task_output', 'Procesar outputs', 'AUTOMATION_SPECIALIST'),
  xorGateway('gw_output_valid', '¿Output correcto?', ['si → complete', 'no → error_handling']),
  task('task_complete', 'Registrar ejecución', 'AUTOMATION_SPECIALIST'),
  endEvent('end_automation_success', 'Automatización completada'),
  endEvent('end_automation_failed', 'Automatización fallida'),
];

const flows = [
  flow('start_trigger', 'task_validate_input'),
  flow('task_validate_input', 'gw_input_valid'),
  flow('gw_input_valid', 'task_execute', 'si'),
  flow('gw_input_valid', 'task_human_review_input', 'no'),
  flow('task_human_review_input', 'task_execute'),
  flow('task_execute', 'gw_execution_ok'),
  flow('gw_execution_ok', 'task_output', 'si'),
  flow('gw_execution_ok', 'task_error_handling', 'no'),
  flow('task_error_handling', 'gw_retry'),
  flow('gw_retry', 'task_execute', 'si'),
  flow('gw_retry', 'task_human_review_error', 'no'),
  flow('task_human_review_error', 'end_automation_failed'),
  flow('task_output', 'gw_output_valid'),
  flow('gw_output_valid', 'task_complete', 'si'),
  flow('gw_output_valid', 'task_error_handling', 'no'),
  flow('task_complete', 'end_automation_success'),
];

const result = createBPMNProcess({
  id:          'BPMN_AUTOMATION',
  name:        'Automation Execution Flow',
  description: 'Trigger → Validate → Execute → Error/Retry → Complete',
  sopRef:      'AUTOMATION_LIFECYCLE',
  pools: [{
    id:   'pool_automation',
    name: 'Automatización',
    lanes: [
      { id: 'lane_business_auto', name: 'Business Trigger', owner: 'CLIENT_OWNER',
        elementRefs: ['start_trigger'] },
      { id: 'lane_make', name: 'Make', owner: 'AUTOMATION_SPECIALIST',
        elementRefs: ['task_validate_input', 'task_execute', 'task_error_handling', 'task_output', 'task_complete'] },
      { id: 'lane_system_auto', name: 'System', owner: 'DEVELOPER',
        elementRefs: [] },
      { id: 'lane_human_auto', name: 'Human Review', owner: 'PROJECT_MANAGER',
        elementRefs: ['task_human_review_input', 'task_human_review_error'] },
    ],
    elements,
  }],
  sequenceFlows: flows,
  version: '1.0.0',
});

export const bpmnAutomationProcess = result.process;
export const BPMN_AUTOMATION_VERSION = '1.0.0';

// Media Agent Bridge — ADV-13 (bridges ADV-03 Agent Engine)

export const AGENT_MEDIA_TASK = Object.freeze({
  GENERATE_SCRIPT:   'GENERATE_SCRIPT',
  SELECT_AVATAR:     'SELECT_AVATAR',
  SELECT_VOICE:      'SELECT_VOICE',
  BUILD_STORYBOARD:  'BUILD_STORYBOARD',
  QA_REVIEW:         'QA_REVIEW',
  PUBLISH_PLAN:      'PUBLISH_PLAN',
});

export function createAgentMediaTask(config = {}) {
  if (!config.task)      throw new Error('AgentMediaTask requires task');
  if (!config.projectId) throw new Error('AgentMediaTask requires projectId');
  return Object.freeze({
    task:       config.task,
    projectId:  config.projectId,
    priority:   config.priority  ?? 'NORMAL',
    context:    Object.freeze(config.context ?? {}),
    adv03Bridge:'AGENT_ENGINE_CONNECTED',
    isReal: false,
  });
}

export const MEDIA_AGENT_BRIDGE_VERSION = '1.0.0';

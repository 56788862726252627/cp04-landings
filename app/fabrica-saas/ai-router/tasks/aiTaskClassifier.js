// AI Task Classifier — ADV-16

export const AI_TASK_TYPE = Object.freeze({
  SIMPLE_CHAT:           'SIMPLE_CHAT',
  CUSTOMER_SUPPORT:      'CUSTOMER_SUPPORT',
  SALES:                 'SALES',
  BOOKING:               'BOOKING',
  CODING:                'CODING',
  REASONING:             'REASONING',
  BUSINESS_ANALYSIS:     'BUSINESS_ANALYSIS',
  CONTENT:               'CONTENT',
  MEDIA_SCRIPT:          'MEDIA_SCRIPT',
  SOCIAL_COPY:           'SOCIAL_COPY',
  VOICE_PLANNING:        'VOICE_PLANNING',
  STRUCTURED_EXTRACTION: 'STRUCTURED_EXTRACTION',
  FACTUAL_HIGH_RISK:     'FACTUAL_HIGH_RISK',
});

export const TASK_RISK_LEVEL = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

const TASK_RISK_MAP = Object.freeze({
  [AI_TASK_TYPE.SIMPLE_CHAT]:           TASK_RISK_LEVEL.LOW,
  [AI_TASK_TYPE.CUSTOMER_SUPPORT]:      TASK_RISK_LEVEL.MEDIUM,
  [AI_TASK_TYPE.SALES]:                 TASK_RISK_LEVEL.MEDIUM,
  [AI_TASK_TYPE.BOOKING]:               TASK_RISK_LEVEL.MEDIUM,
  [AI_TASK_TYPE.CODING]:                TASK_RISK_LEVEL.MEDIUM,
  [AI_TASK_TYPE.REASONING]:             TASK_RISK_LEVEL.MEDIUM,
  [AI_TASK_TYPE.BUSINESS_ANALYSIS]:     TASK_RISK_LEVEL.HIGH,
  [AI_TASK_TYPE.CONTENT]:               TASK_RISK_LEVEL.LOW,
  [AI_TASK_TYPE.MEDIA_SCRIPT]:          TASK_RISK_LEVEL.LOW,
  [AI_TASK_TYPE.SOCIAL_COPY]:           TASK_RISK_LEVEL.LOW,
  [AI_TASK_TYPE.VOICE_PLANNING]:        TASK_RISK_LEVEL.MEDIUM,
  [AI_TASK_TYPE.STRUCTURED_EXTRACTION]: TASK_RISK_LEVEL.MEDIUM,
  [AI_TASK_TYPE.FACTUAL_HIGH_RISK]:     TASK_RISK_LEVEL.CRITICAL,
});

export function classifyTaskRisk(taskType) {
  return TASK_RISK_MAP[taskType] ?? TASK_RISK_LEVEL.MEDIUM;
}

export function createAITaskClassifier() {
  return Object.freeze({
    classify(taskType) {
      const risk = classifyTaskRisk(taskType);
      return Object.freeze({
        taskType,
        riskLevel:  risk,
        highRisk:   risk === TASK_RISK_LEVEL.HIGH || risk === TASK_RISK_LEVEL.CRITICAL,
        critical:   risk === TASK_RISK_LEVEL.CRITICAL,
        isReal:     false,
      });
    },
    isReal: false,
  });
}

export const AI_TASK_CLASSIFIER_VERSION = '1.0.0';

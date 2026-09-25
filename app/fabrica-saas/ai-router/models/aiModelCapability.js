// AI Model Capability — ADV-16

export const AI_MODEL_CAPABILITY = Object.freeze({
  CHAT:                'CHAT',
  REASONING:           'REASONING',
  CODING:              'CODING',
  VISION:              'VISION',
  STRUCTURED_OUTPUT:   'STRUCTURED_OUTPUT',
  TOOLS:               'TOOLS',
  LONG_CONTEXT:        'LONG_CONTEXT',
  FAST_RESPONSE:       'FAST_RESPONSE',
  LOW_COST:            'LOW_COST',
  PREMIUM_QUALITY:     'PREMIUM_QUALITY',
  MULTILINGUAL:        'MULTILINGUAL',
  VOICE_PLANNING:      'VOICE_PLANNING',
  CONTENT:             'CONTENT',
  EMBEDDINGS_FOUNDATION:'EMBEDDINGS_FOUNDATION',
});

export function hasCapability(model, capability) {
  return Array.isArray(model.capabilities) && model.capabilities.includes(capability);
}

export function meetsCapabilities(model, required = []) {
  return required.every(cap => hasCapability(model, cap));
}

export const AI_MODEL_CAPABILITY_VERSION = '1.0.0';

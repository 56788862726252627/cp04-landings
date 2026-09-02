// Semantic Routing Policy — ADV-16
// Uses task features/context, not keyword matching alone.

const TASK_FEATURE_MAP = Object.freeze({
  SIMPLE_CHAT:          { quality: 'BASIC',    speed: 'FAST',   caps: ['CHAT']                    },
  CUSTOMER_SUPPORT:     { quality: 'STANDARD', speed: 'FAST',   caps: ['CHAT', 'TOOLS']            },
  SALES:                { quality: 'STANDARD', speed: 'NORMAL', caps: ['CHAT']                     },
  BOOKING:              { quality: 'STANDARD', speed: 'FAST',   caps: ['CHAT', 'TOOLS']            },
  CODING:               { quality: 'HIGH',     speed: 'NORMAL', caps: ['CODING', 'TOOLS']          },
  REASONING:            { quality: 'HIGH',     speed: 'SLOW',   caps: ['REASONING']                },
  BUSINESS_ANALYSIS:    { quality: 'HIGH',     speed: 'NORMAL', caps: ['REASONING']                },
  CONTENT:              { quality: 'STANDARD', speed: 'NORMAL', caps: ['CONTENT']                  },
  MEDIA_SCRIPT:         { quality: 'HIGH',     speed: 'SLOW',   caps: ['CONTENT', 'PREMIUM_QUALITY']},
  SOCIAL_COPY:          { quality: 'STANDARD', speed: 'FAST',   caps: ['CONTENT', 'LOW_COST']      },
  VOICE_PLANNING:       { quality: 'STANDARD', speed: 'FAST',   caps: ['VOICE_PLANNING', 'TOOLS']  },
  STRUCTURED_EXTRACTION:{ quality: 'HIGH',     speed: 'NORMAL', caps: ['STRUCTURED_OUTPUT']        },
  FACTUAL_HIGH_RISK:    { quality: 'PREMIUM',  speed: 'SLOW',   caps: ['REASONING', 'PREMIUM_QUALITY']},
});

export function inferSemanticFeatures(taskType) {
  const features = TASK_FEATURE_MAP[taskType];
  if (!features) {
    return Object.freeze({ taskType, quality: 'STANDARD', speed: 'NORMAL', caps: ['CHAT'], inferred: false, isReal: false });
  }
  return Object.freeze({ taskType, ...features, inferred: true, isReal: false });
}

export function createAISemanticRoutingPolicy() {
  return Object.freeze({
    infer: inferSemanticFeatures,
    isReal: false,
  });
}

export const SEMANTIC_ROUTING_POLICY_VERSION = '1.0.0';

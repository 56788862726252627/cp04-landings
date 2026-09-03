// AI Router Bridge — ADV-17 ↔ ADV-16
// Each agent defines its own routing profile. Supervisor recommends, AI Router decides.

export function createMultiAgentAIRouterBridge() {
  return Object.freeze({
    buildAgentRoutingRequest(specialist, task = {}) {
      return Object.freeze({
        agentId:         specialist.id,
        taskType:        task.type ?? 'GENERIC',
        modelAlias:      specialist.aiRoutingProfile?.modelAlias ?? 'BALANCED',
        qualityTarget:   specialist.aiRoutingProfile?.qualityTarget ?? 'STANDARD',
        costSensitivity: specialist.budgetLimit === 'LOW' ? 'HIGH' : 'MEDIUM',
        privacyLevel:    specialist.knowledgeScope === 'PERSONAL' ? 'PERSONAL' : 'BUSINESS_INTERNAL',
        requiresTools:   specialist.allowedTools?.length > 0,
        source:          'MULTI_AGENT_BRIDGE',
        isReal:          false,
      });
    },

    // Supervisor may recommend a model alias but cannot override AI Router policy
    supervisorRecommend(alias) {
      return Object.freeze({
        recommendation: alias,
        binding:        false,   // never binding — AI Router policy always wins
        isReal:         false,
      });
    },

    isReal: false,
  });
}

export const MULTIAGENT_AI_ROUTER_BRIDGE_VERSION = '1.0.0';

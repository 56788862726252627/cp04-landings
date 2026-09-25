// Agent Engine Bridge — ADV-10

export function buildAgentEvaluationProfile(agentConfig = {}) {
  return Object.freeze({
    agentId:      agentConfig.agentId ?? 'fixture-agent',
    agentType:    agentConfig.agentType ?? 'CHAT',
    vertical:     agentConfig.vertical ?? 'general',
    model:        agentConfig.model ?? 'fixture',
    temperature:  agentConfig.temperature ?? 0.7,
    capabilities: Object.freeze(agentConfig.capabilities ?? []),
    evaluationProfile: Object.freeze({
      expectedDimensions: agentConfig.expectedDimensions ?? ['NATURALNESS', 'USEFULNESS', 'SAFETY'],
      targetQualityScore: agentConfig.targetQualityScore ?? 90,
      criticalDimensions: agentConfig.criticalDimensions ?? ['SAFETY', 'GROUNDING'],
    }),
    // ADV-10b: business truth grounding profile
    businessTruthProfile:  agentConfig.businessTruthProfile ?? null,
    availableFactSources:  Object.freeze(agentConfig.availableFactSources ?? []),
    scheduleProvider:      agentConfig.scheduleProvider ?? null,
    factAccessPolicy:      agentConfig.factAccessPolicy ?? null,
    isReal: false,
  });
}

export function linkAgentEngineToEvaluation(engineOutput = {}, evalResult = {}) {
  return Object.freeze({
    agentId:       engineOutput.agentId ?? 'fixture-agent',
    evalStatus:    evalResult.status ?? 'PASS',
    qualityScore:  evalResult.weightedScore ?? 0,
    linked:        true,
    note:          'Agent engine ADV-03 ↔ Evaluation ADV-10 bridge',
    isReal: false,
  });
}

export const AGENT_ENGINE_BRIDGE_VERSION = '1.0.0';

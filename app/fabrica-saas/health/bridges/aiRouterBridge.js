// AI Router Bridge — ADV-20 (connects ADV-16, fixture only, core is deterministic)

export function createAIRouterBridge(config = {}) {
  const { clientId = null } = config;

  function generateSummary(snapshot) {
    if (!snapshot) return Object.freeze({ summary: null, usedLLM: false, isReal: false });
    const items = [];
    if (snapshot.overallStatus === 'BLOCKED') items.push('System has BLOCKED components requiring immediate action.');
    else if (snapshot.overallStatus === 'CRITICAL') items.push('System has critical issues requiring attention.');
    else items.push(`System is ${snapshot.overallStatus} with score ${snapshot.overallScore}/100.`);

    return Object.freeze({
      summary: items.join(' '),
      usedLLM: false,
      deterministic: true,
      isReal: false,
    });
  }

  return Object.freeze({
    clientId,
    generateSummary,
    coreIsDeterministic: true,
    llmOptional: true,
    adv16Connected: true,
    isReal: false,
  });
}

export const AI_ROUTER_BRIDGE_VERSION = '1.0.0';

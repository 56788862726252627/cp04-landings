// Conflict Detector — ADV-17

export const CONFLICT_TYPE = Object.freeze({
  FACT_CONFLICT:        'FACT_CONFLICT',
  ACTION_CONFLICT:      'ACTION_CONFLICT',
  RESOURCE_CONFLICT:    'RESOURCE_CONFLICT',
  POLICY_CONFLICT:      'POLICY_CONFLICT',
  PRIORITY_CONFLICT:    'PRIORITY_CONFLICT',
  CLIENT_SCOPE_CONFLICT:'CLIENT_SCOPE_CONFLICT',
});

export function createAgentConflictDetector() {
  return Object.freeze({
    detectFactConflict(factA, factB, key) {
      if (factA[key] !== undefined && factB[key] !== undefined && factA[key] !== factB[key]) {
        return Object.freeze({ detected: true, type: CONFLICT_TYPE.FACT_CONFLICT, key, values: Object.freeze([factA[key], factB[key]]), isReal: false });
      }
      return Object.freeze({ detected: false, isReal: false });
    },

    detectActionConflict(actionA, actionB) {
      const bothWrite = actionA.write && actionB.write;
      const sameResource = actionA.resource === actionB.resource;
      if (bothWrite && sameResource) {
        return Object.freeze({ detected: true, type: CONFLICT_TYPE.ACTION_CONFLICT, resource: actionA.resource, isReal: false });
      }
      return Object.freeze({ detected: false, isReal: false });
    },

    detectClientScopeConflict(agentClientId, requestClientId) {
      if (agentClientId !== requestClientId) {
        return Object.freeze({ detected: true, type: CONFLICT_TYPE.CLIENT_SCOPE_CONFLICT, agentClientId, requestClientId, isReal: false });
      }
      return Object.freeze({ detected: false, isReal: false });
    },

    detectResourceConflict(lockedResources = [], requestedResource) {
      if (lockedResources.includes(requestedResource)) {
        return Object.freeze({ detected: true, type: CONFLICT_TYPE.RESOURCE_CONFLICT, resource: requestedResource, isReal: false });
      }
      return Object.freeze({ detected: false, isReal: false });
    },

    isReal: false,
  });
}

export const AGENT_CONFLICT_DETECTOR_VERSION = '1.0.0';

// Health Dependency Map — ADV-20

export function createHealthDependencyMap(config = {}) {
  const { entries = [] } = config;

  function propagateDegradation(failedDimension) {
    const affected = entries
      .filter(e => e.dependencies && e.dependencies.includes(failedDimension))
      .map(e => e.component);
    return Object.freeze({ failedDimension, affected: Object.freeze(affected), isReal: false });
  }

  function getChain(component) {
    const entry = entries.find(e => e.component === component);
    if (!entry) return Object.freeze([]);
    return Object.freeze(entry.dependencies || []);
  }

  return Object.freeze({
    entries: Object.freeze(entries.map(e => Object.freeze({ ...e }))),
    propagateDegradation,
    getChain,
    isReal: false,
  });
}

export const HEALTH_DEPENDENCY_MAP_VERSION = '1.0.0';

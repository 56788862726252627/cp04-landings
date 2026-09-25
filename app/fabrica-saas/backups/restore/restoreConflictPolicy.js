// Restore Conflict Policy — ADV-18

export const CONFLICT_RESOLUTION = Object.freeze({
  BLOCK:          'BLOCK',
  SKIP:           'SKIP',
  REQUIRE_HUMAN:  'REQUIRE_HUMAN',
  MERGE_FOUNDATION: 'MERGE_FOUNDATION',
});

const SENSITIVE_CONFLICT_TYPES = new Set([
  'CLIENT_CONFLICT',
  'EXISTING_DATA_CONFLICT',
]);

export function createRestoreConflictPolicy(config = {}) {
  const {
    defaultResolution   = CONFLICT_RESOLUTION.REQUIRE_HUMAN,
    overrides           = {},
    noAutoMergeSensitive = true,
  } = config;

  return Object.freeze({
    resolve(conflict = {}) {
      const { type } = conflict;

      if (noAutoMergeSensitive && SENSITIVE_CONFLICT_TYPES.has(type)) {
        return Object.freeze({
          type,
          resolution: CONFLICT_RESOLUTION.BLOCK,
          reason:     'SENSITIVE_CONFLICT_AUTO_MERGE_FORBIDDEN',
          isReal:     false,
        });
      }

      const resolution = overrides[type] ?? defaultResolution;

      return Object.freeze({
        type,
        resolution,
        reason: null,
        isReal: false,
      });
    },

    resolveAll(conflicts = []) {
      return Object.freeze(conflicts.map(c => this.resolve(c)));
    },

    isReal: false,
  });
}

export const RESTORE_CONFLICT_POLICY_VERSION = '1.0.0';

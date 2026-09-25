// MCP Permission Policy — ADV-12

export const PERMISSION_LEVEL = Object.freeze({
  READ_ONLY:              'READ_ONLY',
  SAFE_WRITE:             'SAFE_WRITE',
  SENSITIVE_WRITE:        'SENSITIVE_WRITE',
  DESTRUCTIVE:            'DESTRUCTIVE',
  EXTERNAL_COMMUNICATION: 'EXTERNAL_COMMUNICATION',
  BILLING:                'BILLING',
  ADMIN:                  'ADMIN',
});

const LEVEL_ORDER = [
  PERMISSION_LEVEL.READ_ONLY,
  PERMISSION_LEVEL.SAFE_WRITE,
  PERMISSION_LEVEL.SENSITIVE_WRITE,
  PERMISSION_LEVEL.DESTRUCTIVE,
  PERMISSION_LEVEL.EXTERNAL_COMMUNICATION,
  PERMISSION_LEVEL.BILLING,
  PERMISSION_LEVEL.ADMIN,
];

export function createMCPPermissionPolicy(config = {}) {
  const maxLevel = config.maxLevel ?? PERMISSION_LEVEL.SAFE_WRITE;
  const maxIdx   = LEVEL_ORDER.indexOf(maxLevel);
  return Object.freeze({
    maxLevel,
    allowedLevels: Object.freeze(LEVEL_ORDER.slice(0, maxIdx + 1)),
    isAllowed: (level) => LEVEL_ORDER.indexOf(level) <= maxIdx,
    isReal: false,
  });
}

export function checkPermission(tool, policy) {
  const toolLevel = tool.destructive ? PERMISSION_LEVEL.DESTRUCTIVE
    : tool.requiresHumanApproval   ? PERMISSION_LEVEL.SENSITIVE_WRITE
    : tool.readOnly                ? PERMISSION_LEVEL.READ_ONLY
    : PERMISSION_LEVEL.SAFE_WRITE;
  return Object.freeze({
    allowed:    policy.isAllowed(toolLevel),
    toolLevel,
    maxLevel:   policy.maxLevel,
    isReal: false,
  });
}

export const MCP_PERMISSION_POLICY_VERSION = '1.0.0';

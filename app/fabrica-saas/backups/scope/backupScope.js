// Backup Scope — ADV-18

export const BACKUP_SCOPE = Object.freeze({
  CONFIG:            'CONFIG',
  DATA:              'DATA',
  FILES:             'FILES',
  METADATA:          'METADATA',
  REGISTRY:          'REGISTRY',
  BUSINESS_TRUTH:    'BUSINESS_TRUTH',
  CRM:               'CRM',
  LEADS:             'LEADS',
  AGENT_CONFIG:      'AGENT_CONFIG',
  MEDIA_METADATA:    'MEDIA_METADATA',
  SOCIAL_METADATA:   'SOCIAL_METADATA',
  FULL:              'FULL',
});

const SCOPE_EXCLUDES_SECRETS_BY_DEFAULT = true;

export function createBackupScope(config = {}) {
  const {
    scopes      = [BACKUP_SCOPE.CONFIG],
    clientId    = null,
    businessId  = null,
    excludeSecrets = SCOPE_EXCLUDES_SECRETS_BY_DEFAULT,
    label       = '',
  } = config;

  const validScopes = Object.values(BACKUP_SCOPE);
  const resolvedScopes = BACKUP_SCOPE.FULL === scopes[0]
    ? Object.freeze(validScopes.filter(s => s !== BACKUP_SCOPE.FULL))
    : Object.freeze(scopes.filter(s => validScopes.includes(s)));

  return Object.freeze({
    scopes:         resolvedScopes,
    clientId,
    businessId,
    excludeSecrets,
    label,
    isFull:         scopes[0] === BACKUP_SCOPE.FULL || resolvedScopes.length >= validScopes.length - 1,
    scopeCount:     resolvedScopes.length,
    isReal:         false,
  });
}

export const BACKUP_SCOPE_VERSION = '1.0.0';

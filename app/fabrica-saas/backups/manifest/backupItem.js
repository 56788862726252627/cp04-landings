// Backup Item — ADV-18

export const BACKUP_ITEM_TYPE = Object.freeze({
  CONFIG_FILE:       'CONFIG_FILE',
  DATA_EXPORT:       'DATA_EXPORT',
  METADATA_SNAPSHOT: 'METADATA_SNAPSHOT',
  REGISTRY_SNAPSHOT: 'REGISTRY_SNAPSHOT',
  BUSINESS_TRUTH:    'BUSINESS_TRUTH',
  CRM_EXPORT:        'CRM_EXPORT',
  LEADS_EXPORT:      'LEADS_EXPORT',
  AGENT_CONFIG:      'AGENT_CONFIG',
  MEDIA_METADATA:    'MEDIA_METADATA',
  SOCIAL_METADATA:   'SOCIAL_METADATA',
  SCHEMA_DEFINITION: 'SCHEMA_DEFINITION',
  AUDIT_LOG:         'AUDIT_LOG',
});

export const ITEM_SIZE_CLASS = Object.freeze({
  TINY:    'TINY',
  SMALL:   'SMALL',
  MEDIUM:  'MEDIUM',
  LARGE:   'LARGE',
  UNKNOWN: 'UNKNOWN',
});

export function createBackupItem(config = {}) {
  const {
    type              = BACKUP_ITEM_TYPE.CONFIG_FILE,
    pathOrLogicalName = '',
    version           = '1.0.0',
    checksum          = null,
    sizeClass         = ITEM_SIZE_CLASS.UNKNOWN,
    required          = true,
    sensitive         = false,
    encrypted         = false,
    restorable        = true,
  } = config;

  return Object.freeze({
    type,
    pathOrLogicalName,
    version,
    checksum,
    sizeClass,
    required,
    sensitive,
    encrypted,
    restorable,
    isReal:   false,
  });
}

export const BACKUP_ITEM_VERSION = '1.0.0';

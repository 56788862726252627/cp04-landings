// DSAR Data Map — ADV-19

export const DATA_SOURCE = Object.freeze({
  CRM:             'CRM',
  LEADS:           'LEADS',
  AGENT_CONVOS:    'AGENT_CONVERSATIONS',
  BUSINESS_DATA:   'BUSINESS_DATA',
  MEDIA_METADATA:  'MEDIA_METADATA',
  SOCIAL_METADATA: 'SOCIAL_METADATA',
  AUDIT_ENTRIES:   'AUDIT_ENTRIES',
  BACKUPS:         'BACKUPS',
  AUTH:            'AUTH',
  CONSENT:         'CONSENT',
});

export function createDSARDataMap(config = {}) {
  const { clientId = null, includedSources = Object.values(DATA_SOURCE) } = config;

  const sourceMap = includedSources.map(source => Object.freeze({
    source,
    containsPII: [
      DATA_SOURCE.CRM, DATA_SOURCE.LEADS, DATA_SOURCE.AGENT_CONVOS,
      DATA_SOURCE.AUTH, DATA_SOURCE.CONSENT,
    ].includes(source),
    searchable: source !== DATA_SOURCE.BACKUPS,
    exportable: [DATA_SOURCE.CRM, DATA_SOURCE.LEADS, DATA_SOURCE.BUSINESS_DATA].includes(source),
    deletable: ![DATA_SOURCE.AUDIT_ENTRIES, DATA_SOURCE.BACKUPS].includes(source),
    notes: source === DATA_SOURCE.BACKUPS
      ? 'BACKUP_DELETION_REQUIRES_SEPARATE_PROCESS'
      : source === DATA_SOURCE.AUDIT_ENTRIES
        ? 'AUDIT_LOG_RETENTION_MAY_APPLY'
        : null,
  }));

  return Object.freeze({
    clientId,
    sources: Object.freeze(sourceMap),
    totalSources: sourceMap.length,
    piiSources: sourceMap.filter(s => s.containsPII).length,
    isReal: false,
  });
}

export const DSAR_DATA_MAP_VERSION = '1.0.0';

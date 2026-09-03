// Backup Catalog — ADV-18

export function createBackupCatalog(config = {}) {
  const { clientId = null } = config;
  const entries = [];

  return Object.freeze({
    clientId,

    add(entry = {}) {
      const {
        backupId,
        client    = clientId,
        scope     = [],
        version   = '1.0.0',
        createdAt = new Date().toISOString(),
        status    = 'COMPLETED',
        integrity = 'VALID',
        restoreReady = false,
      } = entry;

      if (client && clientId && client !== clientId) {
        return Object.freeze({ added: false, reason: 'CLIENT_MISMATCH', isReal: false });
      }

      entries.push(Object.freeze({ backupId, client, scope: Object.freeze([...scope]), version, createdAt, status, integrity, restoreReady }));
      return Object.freeze({ added: true, total: entries.length, isReal: false });
    },

    list(filterClientId = null) {
      const filtered = filterClientId
        ? entries.filter(e => e.client === filterClientId)
        : [...entries];
      return Object.freeze({
        entries:  Object.freeze(filtered),
        count:    filtered.length,
        clientId: filterClientId ?? clientId,
        isReal:   false,
      });
    },

    find(backupId = '') {
      return entries.find(e => e.backupId === backupId) ?? null;
    },

    isReal: false,
  });
}

export const BACKUP_CATALOG_VERSION = '1.0.0';

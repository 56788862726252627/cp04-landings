// Restore Catalog — ADV-18
// Maps restore points to backups.

export function createRestoreCatalog(config = {}) {
  const { clientId = null } = config;
  const entries = [];

  return Object.freeze({
    clientId,

    add(entry = {}) {
      const {
        restorePointId,
        backupId,
        client    = clientId,
        scope     = [],
        createdAt = new Date().toISOString(),
        verified  = false,
        status    = 'AVAILABLE',
      } = entry;

      if (client && clientId && client !== clientId) {
        return Object.freeze({ added: false, reason: 'CLIENT_MISMATCH', isReal: false });
      }

      entries.push(Object.freeze({ restorePointId, backupId, client, scope: Object.freeze([...scope]), createdAt, verified, status }));
      return Object.freeze({ added: true, total: entries.length, isReal: false });
    },

    findByBackup(backupId = '') {
      return entries.filter(e => e.backupId === backupId);
    },

    listForClient(filterClientId = null) {
      const target = filterClientId ?? clientId;
      const filtered = target
        ? entries.filter(e => e.client === target)
        : [...entries];
      return Object.freeze({
        entries:  Object.freeze(filtered),
        count:    filtered.length,
        clientId: target,
        isReal:   false,
      });
    },

    isReal: false,
  });
}

export const RESTORE_CATALOG_VERSION = '1.0.0';

// Health History — ADV-20 (foundation, no real DB)

export function createHealthHistory(config = {}) {
  const {
    clientId   = null,
    maxEntries = 100,
  } = config;

  const _entries = [];

  function addSnapshot(snapshot) {
    if (!snapshot) return;
    _entries.push({ ...snapshot, recordedAt: new Date().toISOString() });
    if (_entries.length > maxEntries) _entries.shift();
  }

  function getHistory() {
    return Object.freeze([..._entries]);
  }

  function getLatest() {
    return _entries.length > 0 ? _entries[_entries.length - 1] : null;
  }

  function getWindow(count = 10) {
    return Object.freeze(_entries.slice(-count));
  }

  function clear() {
    _entries.length = 0;
  }

  return Object.freeze({
    clientId,
    maxEntries,
    addSnapshot,
    getHistory,
    getLatest,
    getWindow,
    clear,
    get entryCount() { return _entries.length; },
    noRealDB: true,
    isReal: false,
  });
}

export const HEALTH_HISTORY_VERSION = '1.0.0';

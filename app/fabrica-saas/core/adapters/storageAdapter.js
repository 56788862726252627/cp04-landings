/**
 * CORE V1.3 · StorageAdapter
 * mock: Map en memoria (sin persistencia entre reloads). real-placeholder: falla seguro.
 * Nunca almacena datos personales reales.
 */

import { AUTH_MODE } from '../runtimeConfig.js';

export class StorageAdapter {
  constructor(config = {}) {
    this.mode     = config.authMode ?? AUTH_MODE.MOCK;
    this.clientId = config.clientId ?? 'unknown';
    this.status   = 'initialized';
    this._store   = new Map();
  }

  async saveData(key, value) {
    if (this.mode === AUTH_MODE.MOCK) {
      const scopedKey = `${this.clientId}::${key}`;
      this._store.set(scopedKey, { value, savedAt: new Date().toISOString() });
      return { saved: true, key: scopedKey };
    }
    return this._realPlaceholder('saveData', 'STORAGE_BUCKET, STORAGE_API_KEY');
  }

  async getData(key) {
    if (this.mode === AUTH_MODE.MOCK) {
      const scopedKey = `${this.clientId}::${key}`;
      return this._store.get(scopedKey) ?? null;
    }
    return this._realPlaceholder('getData', 'STORAGE_BUCKET');
  }

  async deleteData(key) {
    if (this.mode === AUTH_MODE.MOCK) {
      const scopedKey = `${this.clientId}::${key}`;
      const existed = this._store.has(scopedKey);
      this._store.delete(scopedKey);
      return { deleted: existed };
    }
    return this._realPlaceholder('deleteData', 'STORAGE_BUCKET');
  }

  async listKeys() {
    if (this.mode === AUTH_MODE.MOCK) {
      const prefix = `${this.clientId}::`;
      return [...this._store.keys()].filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length));
    }
    return this._realPlaceholder('listKeys', 'STORAGE_BUCKET');
  }

  getStatus() {
    return { adapter: 'storage', mode: this.mode, status: this.status, keys: this._store.size };
  }

  _realPlaceholder(method, requiredEnvVars) {
    const err = new Error(`StorageAdapter.${method}: modo real no configurado. Variables: ${requiredEnvVars}.`);
    err.code = 'ADAPTER_NOT_CONFIGURED'; err.adapter = 'storage'; err.method = method;
    throw err;
  }
}

/**
 * CORE V1.3 · CrmAdapter
 * mock: clientes ficticios en memoria. real-placeholder: falla seguro.
 */

import { AUTH_MODE } from '../runtimeConfig.js';

export class CrmAdapter {
  constructor(config = {}) {
    this.mode   = config.authMode ?? AUTH_MODE.MOCK;
    this.status = 'initialized';
    this._store = new Map();
  }

  async getClients(filters = {}) {
    if (this.mode === AUTH_MODE.MOCK) return this._mockGetClients(filters);
    return this._realPlaceholder('getClients', 'CRM_API_URL, CRM_API_KEY');
  }

  async getClient(clientId) {
    if (this.mode === AUTH_MODE.MOCK) return this._store.get(clientId) ?? null;
    return this._realPlaceholder('getClient', 'CRM_API_URL');
  }

  async createClient(data) {
    if (this.mode === AUTH_MODE.MOCK) {
      const id = `mock-client-${Date.now()}`;
      const client = { id, ...data, createdAt: new Date().toISOString(), _ficticio: true };
      this._store.set(id, client);
      return client;
    }
    return this._realPlaceholder('createClient', 'CRM_API_URL, CRM_API_KEY');
  }

  async updateClient(clientId, data) {
    if (this.mode === AUTH_MODE.MOCK) {
      const existing = this._store.get(clientId);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
      this._store.set(clientId, updated);
      return updated;
    }
    return this._realPlaceholder('updateClient', 'CRM_API_URL');
  }

  async searchClients(query) {
    if (this.mode === AUTH_MODE.MOCK) {
      const all = [...this._store.values()];
      const q = (query ?? '').toLowerCase();
      return q ? all.filter(c => JSON.stringify(c).toLowerCase().includes(q)) : all;
    }
    return this._realPlaceholder('searchClients', 'CRM_API_URL');
  }

  getStatus() {
    return { adapter: 'crm', mode: this.mode, status: this.status, storeSize: this._store.size };
  }

  _mockGetClients() {
    return [...this._store.values()];
  }

  _realPlaceholder(method, requiredEnvVars) {
    const err = new Error(`CrmAdapter.${method}: modo real no configurado. Variables: ${requiredEnvVars}.`);
    err.code = 'ADAPTER_NOT_CONFIGURED'; err.adapter = 'crm'; err.method = method;
    throw err;
  }
}

/**
 * CORE V1.3 · IntegrationAdapter
 * Represents external webhook/integration calls (Make, Zapier, etc.).
 * mock: registra llamadas sin enviar. real-placeholder: falla seguro.
 */

import { AUTH_MODE } from '../runtimeConfig.js';

export class IntegrationAdapter {
  constructor(config = {}) {
    this.mode   = config.authMode ?? AUTH_MODE.MOCK;
    this.status = 'initialized';
    this._calls = [];
  }

  async triggerWebhook(webhookName, payload) {
    if (this.mode === AUTH_MODE.MOCK) {
      const call = {
        type: 'webhook', webhookName, payload,
        triggeredAt: new Date().toISOString(), success: true, _ficticio: true,
      };
      this._calls.push(call);
      return { success: true, callId: `mock-wh-${Date.now()}` };
    }
    return this._realPlaceholder('triggerWebhook', 'WEBHOOK_URL, WEBHOOK_SECRET');
  }

  async sendToMake(scenarioHook, data) {
    if (this.mode === AUTH_MODE.MOCK) {
      const call = {
        type: 'make', scenarioHook, data,
        sentAt: new Date().toISOString(), success: true, _ficticio: true,
      };
      this._calls.push(call);
      return { success: true, executionId: `mock-make-${Date.now()}` };
    }
    return this._realPlaceholder('sendToMake', 'MAKE_WEBHOOK_URL');
  }

  async notifyExternalCRM(event, payload) {
    if (this.mode === AUTH_MODE.MOCK) {
      const call = {
        type: 'external_crm', event, payload,
        notifiedAt: new Date().toISOString(), success: true, _ficticio: true,
      };
      this._calls.push(call);
      return { success: true };
    }
    return this._realPlaceholder('notifyExternalCRM', 'CRM_WEBHOOK_URL, CRM_API_KEY');
  }

  getCallHistory() { return [...this._calls]; }

  getStatus() {
    return { adapter: 'integration', mode: this.mode, status: this.status, totalCalls: this._calls.length };
  }

  _realPlaceholder(method, requiredEnvVars) {
    const err = new Error(`IntegrationAdapter.${method}: modo real no configurado. Variables: ${requiredEnvVars}.`);
    err.code = 'ADAPTER_NOT_CONFIGURED'; err.adapter = 'integration'; err.method = method;
    throw err;
  }
}

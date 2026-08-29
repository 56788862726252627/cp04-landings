/**
 * CORE V1.3 · NotificationAdapter
 * mock: registro local sin envío real. real-placeholder: falla seguro.
 */

import { AUTH_MODE } from '../runtimeConfig.js';

export class NotificationAdapter {
  constructor(config = {}) {
    this.mode   = config.authMode ?? AUTH_MODE.MOCK;
    this.status = 'initialized';
    this._sent  = [];
  }

  async sendEmail(to, subject, body) {
    if (this.mode === AUTH_MODE.MOCK) {
      const n = { type: 'email', to, subject, body: body?.slice(0, 100), sentAt: new Date().toISOString(), _ficticio: true };
      this._sent.push(n);
      return { success: true, messageId: `mock-email-${Date.now()}`, ...n };
    }
    return this._realPlaceholder('sendEmail', 'EMAIL_PROVIDER_URL, EMAIL_API_KEY');
  }

  async sendSMS(to, message) {
    if (this.mode === AUTH_MODE.MOCK) {
      const n = { type: 'sms', to, message: message?.slice(0, 50), sentAt: new Date().toISOString(), _ficticio: true };
      this._sent.push(n);
      return { success: true, messageId: `mock-sms-${Date.now()}`, ...n };
    }
    return this._realPlaceholder('sendSMS', 'SMS_PROVIDER_URL, SMS_API_KEY');
  }

  async sendPush(userId, title, body) {
    if (this.mode === AUTH_MODE.MOCK) {
      const n = { type: 'push', userId, title, body: body?.slice(0, 50), sentAt: new Date().toISOString(), _ficticio: true };
      this._sent.push(n);
      return { success: true, messageId: `mock-push-${Date.now()}` };
    }
    return this._realPlaceholder('sendPush', 'PUSH_PROVIDER_URL, PUSH_API_KEY');
  }

  getSentHistory() { return [...this._sent]; }

  getStatus() {
    return { adapter: 'notification', mode: this.mode, status: this.status, totalSent: this._sent.length };
  }

  _realPlaceholder(method, requiredEnvVars) {
    const err = new Error(`NotificationAdapter.${method}: modo real no configurado. Variables: ${requiredEnvVars}.`);
    err.code = 'ADAPTER_NOT_CONFIGURED'; err.adapter = 'notification'; err.method = method;
    throw err;
  }
}

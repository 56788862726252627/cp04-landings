/**
 * CORE V1.3 · AnalyticsAdapter
 * mock: eventos en memoria. real-placeholder: falla seguro.
 */

import { AUTH_MODE } from '../runtimeConfig.js';

export class AnalyticsAdapter {
  constructor(config = {}) {
    this.mode   = config.authMode ?? AUTH_MODE.MOCK;
    this.status = 'initialized';
    this._events = [];
  }

  trackEvent(name, properties = {}) {
    if (this.mode === AUTH_MODE.MOCK) {
      this._events.push({ name, properties, ts: Date.now(), _ficticio: true });
      return { tracked: true };
    }
    return this._realPlaceholder('trackEvent', 'ANALYTICS_DSN, ANALYTICS_KEY');
  }

  trackPageView(path, properties = {}) {
    return this.trackEvent('page_view', { path, ...properties });
  }

  async getMetrics(range = '30d') {
    if (this.mode === AUTH_MODE.MOCK) {
      return {
        range,
        sessions: 142,
        pageViews: 387,
        conversionRate: 0.61,
        topEvents: this._events.slice(-5).map(e => e.name),
        _ficticio: true,
      };
    }
    return this._realPlaceholder('getMetrics', 'ANALYTICS_DSN');
  }

  getEventHistory() { return [...this._events]; }

  getStatus() {
    return { adapter: 'analytics', mode: this.mode, status: this.status, events: this._events.length };
  }

  _realPlaceholder(method, requiredEnvVars) {
    const err = new Error(`AnalyticsAdapter.${method}: modo real no configurado. Variables: ${requiredEnvVars}.`);
    err.code = 'ADAPTER_NOT_CONFIGURED'; err.adapter = 'analytics'; err.method = method;
    throw err;
  }
}

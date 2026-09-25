/**
 * CORE V1.3 · HealthCheck (Phase 5)
 * Comprueba estado de adapters, config runtime y SLO básico.
 * Sin llamadas externas. Todos los checks son locales.
 */

import { MODE } from '../runtimeConfig.js';

export class HealthCheck {
  constructor(runtimeConfig, adapters = {}) {
    this._config   = runtimeConfig ?? {};
    this._adapters = adapters;
    this._history  = [];
  }

  async check() {
    const ts     = new Date().toISOString();
    const checks = {};

    checks.config      = this._checkConfig();
    checks.adapters    = this._checkAdapters();
    checks.production  = this._checkProductionReadiness();

    const overallOk = Object.values(checks).every(c => c.ok);
    const result = { ts, healthy: overallOk, mode: this._config.mode ?? 'unknown', checks };

    this._history.push({ ts, healthy: overallOk });
    if (this._history.length > 100) this._history.shift();

    return result;
  }

  async readiness() {
    const h = await this.check();
    return { ready: h.healthy, ts: h.ts, mode: h.mode };
  }

  _checkConfig() {
    const cfg = this._config;
    const issues = [];

    if (!cfg.clientId)              issues.push('clientId faltante');
    if (!cfg.vertical)              issues.push('vertical faltante');
    if (!cfg.mode && !cfg.environment) issues.push('mode faltante');

    return { ok: issues.length === 0, issues };
  }

  _checkAdapters() {
    const adapterStatuses = {};
    const issues = [];
    for (const [name, adapter] of Object.entries(this._adapters)) {
      try {
        const status = adapter.getStatus();
        adapterStatuses[name] = status;
      } catch (e) {
        issues.push(`adapter '${name}' getStatus() error: ${e.message}`);
        adapterStatuses[name] = { status: 'error' };
      }
    }
    return { ok: issues.length === 0, adapters: adapterStatuses, issues };
  }

  _checkProductionReadiness() {
    const cfg = this._config;
    const effectiveMode = cfg.mode ?? cfg.environment;
    if (effectiveMode !== MODE.PRODUCTION) return { ok: true, skipped: true, reason: 'no es modo producción' };

    const issues = [];
    if (cfg.authMode !== 'real')               issues.push('authMode debe ser real en producción');
    if (!cfg.apiBaseUrl || cfg.apiBaseUrl === 'NOT_CONFIGURED') issues.push('apiBaseUrl no configurado');
    if (!cfg.domain    || cfg.domain    === 'NOT_CONFIGURED') issues.push('domain no configurado');

    return { ok: issues.length === 0, issues };
  }

  getSLO() {
    const total   = this._history.length;
    if (total === 0) return { uptime: null, total: 0 };
    const healthy = this._history.filter(h => h.healthy).length;
    return { uptime: (healthy / total).toFixed(4), healthyChecks: healthy, total };
  }

  getHistory() { return [...this._history]; }
}

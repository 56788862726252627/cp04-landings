/**
 * CORE V1.3 · AdapterFactory
 * Crea todos los adapters a partir de la config runtime.
 * Modo demo → todos en mock. Modo real → placeholder lanza ADAPTER_NOT_CONFIGURED.
 */

import { AuthAdapter }        from './authAdapter.js';
import { CrmAdapter }         from './crmAdapter.js';
import { BookingAdapter }     from './bookingAdapter.js';
import { NotificationAdapter }from './notificationAdapter.js';
import { AnalyticsAdapter }   from './analyticsAdapter.js';
import { StorageAdapter }     from './storageAdapter.js';
import { IntegrationAdapter } from './integrationAdapter.js';

export function createAdapters(runtimeConfig) {
  const cfg = runtimeConfig ?? {};
  return Object.freeze({
    auth:         new AuthAdapter(cfg),
    crm:          new CrmAdapter(cfg),
    booking:      new BookingAdapter(cfg),
    notification: new NotificationAdapter(cfg),
    analytics:    new AnalyticsAdapter(cfg),
    storage:      new StorageAdapter(cfg),
    integration:  new IntegrationAdapter(cfg),
  });
}

export function getAdapterStatus(adapters) {
  const statuses = {};
  for (const [name, adapter] of Object.entries(adapters)) {
    try { statuses[name] = adapter.getStatus(); }
    catch { statuses[name] = { adapter: name, status: 'error' }; }
  }
  return statuses;
}

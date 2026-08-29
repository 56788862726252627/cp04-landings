/**
 * Fábrica SaaS V1.3 · Tests de producción readiness
 * 15 categorías · ~116 tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── Core imports ────────────────────────────────────────────────────────────
import { createRuntimeConfig, MODE, AUTH_MODE, LOG_LEVEL } from
  '../../core/runtimeConfig.js';
import { AuthAdapter }         from '../../core/adapters/authAdapter.js';
import { CrmAdapter }          from '../../core/adapters/crmAdapter.js';
import { BookingAdapter }      from '../../core/adapters/bookingAdapter.js';
import { NotificationAdapter } from '../../core/adapters/notificationAdapter.js';
import { AnalyticsAdapter }    from '../../core/adapters/analyticsAdapter.js';
import { StorageAdapter }      from '../../core/adapters/storageAdapter.js';
import { IntegrationAdapter }  from '../../core/adapters/integrationAdapter.js';
import { createAdapters, getAdapterStatus } from '../../core/adapters/adapterFactory.js';
import { AuthSystem, MOCK_USERS } from '../../core/auth/authSystem.js';
import { RoleSystem, ROLES }    from '../../core/roles/roleSystem.js';
import { EventLogger }          from '../../core/logs/eventLogger.js';
import { HealthCheck }          from '../../core/health/healthCheck.js';
import { validateForStaging, validateForProduction, validateClientReadiness }
  from '../../core/onboarding/clientValidator.js';
import { generateDeploymentManifest } from '../scripts/generate-deployment.mjs';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function demoManifest(overrides = {}) {
  return {
    business: { slug: 'test-client-demo', name: 'Test Client', email: 'info@demo.ficticio' },
    vertical:   'dental',
    modo_demo:  true,
    branding:   { primaryColor: '#0d9488', inicial: 'T', emoji_sector: '🦷' },
    modules:    ['chatbot_ia', 'crm', 'reservas'],
    integraciones: { reales: false, apiBaseUrl: 'NOT_CONFIGURED', domain: 'NOT_CONFIGURED' },
    demoData: {
      sedes: [], profesionales: [], slots: [],
      clientes: [{ id: 'c1', nombre: 'Juan', email: 'juan@demo.ficticio' }],
      leads: [], metricas: {},
    },
    ...overrides,
  };
}

function prodManifest() {
  return {
    business: { slug: 'test-client-prod', name: 'Test Client Real', email: 'info@empresa.com' },
    vertical:   'dental',
    modo_demo:  false,
    branding:   { primaryColor: '#0d9488', inicial: 'T', emoji_sector: '🦷' },
    modules:    ['crm', 'reservas'],
    integraciones: {
      reales:     true,
      apiBaseUrl: 'https://api.empresa.com',
      domain:     'empresa.com',
    },
    demoData: { sedes: [], profesionales: [], slots: [], clientes: [], leads: [], metricas: {} },
  };
}

// ─── 1. RuntimeConfig ─────────────────────────────────────────────────────────
describe('1. RuntimeConfig - modos', () => {
  it('modo demo genera config válida', () => {
    const cfg = createRuntimeConfig(demoManifest());
    assert.equal(cfg.mode, MODE.DEMO);
    assert.equal(cfg.authMode, AUTH_MODE.MOCK);
  });

  it('config es frozen', () => {
    const cfg = createRuntimeConfig(demoManifest());
    assert.throws(() => { cfg.mode = 'hacked'; }, TypeError);
  });

  it('clientId viene del slug', () => {
    const cfg = createRuntimeConfig(demoManifest());
    assert.equal(cfg.clientId, 'test-client-demo');
  });

  it('vertical se propaga', () => {
    const cfg = createRuntimeConfig(demoManifest());
    assert.equal(cfg.vertical, 'dental');
  });

  it('modo staging sin bloquear', () => {
    const m = demoManifest({ modo_demo: false, integraciones: { reales: false, apiBaseUrl: 'NOT_CONFIGURED', domain: 'NOT_CONFIGURED' } });
    const cfg = createRuntimeConfig(m);
    assert.equal(cfg.mode, MODE.STAGING);
  });

  it('modo producción requiere authMode real', () => {
    const m = prodManifest();
    assert.throws(() => createRuntimeConfig(m), /PRODUCTION_BLOCKED/);
  });

  it('sanitize elimina campos prohibidos', () => {
    const m = demoManifest();
    m.apiKey = 'secret-leak';
    const cfg = createRuntimeConfig(m);
    assert.equal(cfg.apiKey, undefined);
  });

  it('logLevel por defecto es info', () => {
    const cfg = createRuntimeConfig(demoManifest());
    assert.equal(cfg.logLevel, LOG_LEVEL.INFO);
  });

  it('modules se propagan', () => {
    const cfg = createRuntimeConfig(demoManifest());
    assert.ok(Array.isArray(cfg.modules));
    assert.ok(cfg.modules.includes('crm'));
  });

  it('_ficticio no se pierde', () => {
    const cfg = createRuntimeConfig(demoManifest());
    assert.equal(cfg._ficticio, true);
  });
});

// ─── 2. AuthAdapter mock ─────────────────────────────────────────────────────
describe('2. AuthAdapter - mock', () => {
  it('login con email válido devuelve token', async () => {
    const a = new AuthAdapter();
    const r = await a.login('admin@demo.ficticio', 'x');
    assert.ok(r.token);
    assert.equal(r.user.email, 'admin@demo.ficticio');
  });

  it('login con email inválido falla', async () => {
    const a = new AuthAdapter();
    await assert.rejects(() => a.login('nope@demo.ficticio', 'x'), /AUTH_INVALID_CREDENTIALS/);
  });

  it('getCurrentUser devuelve usuario con token válido', async () => {
    const a = new AuthAdapter();
    const { token } = await a.login('staff@demo.ficticio', 'x');
    const u = await a.getCurrentUser(token);
    assert.equal(u.email, 'staff@demo.ficticio');
  });

  it('getCurrentUser devuelve null con token inválido', async () => {
    const a = new AuthAdapter();
    const u = await a.getCurrentUser('bad-token');
    assert.equal(u, null);
  });

  it('logout invalida token', async () => {
    const a = new AuthAdapter();
    const { token } = await a.login('user@demo.ficticio', 'x');
    await a.logout(token);
    assert.equal(await a.getCurrentUser(token), null);
  });

  it('hasRole admin tiene todos los roles', async () => {
    const a = new AuthAdapter();
    const { token } = await a.login('admin@demo.ficticio', 'x');
    assert.ok(await a.hasRole(token, 'admin'));
    assert.ok(await a.hasRole(token, 'staff'));
  });

  it('modo real lanza ADAPTER_NOT_CONFIGURED', async () => {
    const a = new AuthAdapter({ authMode: AUTH_MODE.REAL });
    await assert.rejects(() => a.login('x@demo.ficticio', 'y'),
      e => e.code === 'ADAPTER_NOT_CONFIGURED');
  });

  it('getStatus devuelve info', () => {
    const a = new AuthAdapter();
    const s = a.getStatus();
    assert.equal(s.adapter, 'auth');
    assert.ok(typeof s.sessions === 'number');
  });
});

// ─── 3. CrmAdapter mock ──────────────────────────────────────────────────────
describe('3. CrmAdapter - mock', () => {
  it('createClient devuelve cliente con id', async () => {
    const c = new CrmAdapter();
    const r = await c.createClient({ nombre: 'Pepe', email: 'pepe@demo.ficticio' });
    assert.ok(r.id);
    assert.equal(r._ficticio, true);
  });

  it('getClients devuelve array', async () => {
    const c = new CrmAdapter();
    await c.createClient({ nombre: 'Ana' });
    const clients = await c.getClients();
    assert.ok(Array.isArray(clients));
    assert.ok(clients.length >= 1);
  });

  it('getClient por id', async () => {
    const c = new CrmAdapter();
    const r = await c.createClient({ nombre: 'Lola' });
    const got = await c.getClient(r.id);
    assert.equal(got.nombre, 'Lola');
  });

  it('getClient inexistente devuelve null', async () => {
    const c = new CrmAdapter();
    assert.equal(await c.getClient('nope'), null);
  });

  it('updateClient modifica datos', async () => {
    const c = new CrmAdapter();
    const r = await c.createClient({ nombre: 'Original' });
    const u = await c.updateClient(r.id, { nombre: 'Modificado' });
    assert.equal(u.nombre, 'Modificado');
  });

  it('searchClients filtra por query', async () => {
    const c = new CrmAdapter();
    await c.createClient({ nombre: 'Buscable', email: 'buscable@demo.ficticio' });
    const results = await c.searchClients('buscable');
    assert.ok(results.length >= 1);
  });

  it('modo real lanza ADAPTER_NOT_CONFIGURED', async () => {
    const c = new CrmAdapter({ authMode: AUTH_MODE.REAL });
    await assert.rejects(() => c.getClients(), e => e.code === 'ADAPTER_NOT_CONFIGURED');
  });

  it('getStatus devuelve info', () => {
    const c = new CrmAdapter();
    assert.equal(c.getStatus().adapter, 'crm');
  });
});

// ─── 4. BookingAdapter mock ───────────────────────────────────────────────────
describe('4. BookingAdapter - mock', () => {
  it('getSlots devuelve array', async () => {
    const b = new BookingAdapter();
    const slots = await b.getSlots();
    assert.ok(Array.isArray(slots) && slots.length > 0);
  });

  it('createBooking devuelve id', async () => {
    const b = new BookingAdapter();
    const r = await b.createBooking({ slotId: 'slot-001', clienteId: 'c1' });
    assert.ok(r.id);
    assert.equal(r.estado, 'confirmada');
  });

  it('cancelBooking cambia estado', async () => {
    const b = new BookingAdapter();
    const r = await b.createBooking({ slotId: 'slot-001' });
    const c = await b.cancelBooking(r.id);
    assert.equal(c.estado, 'cancelada');
  });

  it('cancelBooking inexistente devuelve null', async () => {
    const b = new BookingAdapter();
    assert.equal(await b.cancelBooking('nope'), null);
  });

  it('rescheduleBooking cambia slot', async () => {
    const b = new BookingAdapter();
    const r = await b.createBooking({ slotId: 'slot-001' });
    const u = await b.rescheduleBooking(r.id, { slotId: 'slot-002' });
    assert.equal(u.estado, 'reprogramada');
    assert.equal(u.slotId, 'slot-002');
  });

  it('modo real lanza ADAPTER_NOT_CONFIGURED', async () => {
    const b = new BookingAdapter({ authMode: AUTH_MODE.REAL });
    await assert.rejects(() => b.getSlots(), e => e.code === 'ADAPTER_NOT_CONFIGURED');
  });

  it('slots marcados _ficticio', async () => {
    const b = new BookingAdapter();
    const slots = await b.getSlots();
    assert.ok(slots.every(s => s._ficticio === true));
  });

  it('getStatus ok', () => {
    const b = new BookingAdapter();
    assert.equal(b.getStatus().adapter, 'booking');
  });
});

// ─── 5. NotificationAdapter mock ─────────────────────────────────────────────
describe('5. NotificationAdapter - mock', () => {
  it('sendEmail devuelve messageId', async () => {
    const n = new NotificationAdapter();
    const r = await n.sendEmail('a@demo.ficticio', 'Asunto', 'Cuerpo');
    assert.ok(r.messageId?.startsWith('mock-email-'));
    assert.equal(r.success, true);
  });

  it('sendSMS registra mensaje', async () => {
    const n = new NotificationAdapter();
    const r = await n.sendSMS('+34600000001', 'Hola ficticio');
    assert.ok(r.messageId?.startsWith('mock-sms-'));
  });

  it('sendPush registra notificación', async () => {
    const n = new NotificationAdapter();
    const r = await n.sendPush('u-001', 'Título', 'Cuerpo');
    assert.ok(r.messageId?.startsWith('mock-push-'));
  });

  it('getSentHistory acumula envíos', async () => {
    const n = new NotificationAdapter();
    await n.sendEmail('a@demo.ficticio', 'S', 'B');
    await n.sendSMS('+34000', 'M');
    assert.equal(n.getSentHistory().length, 2);
  });

  it('modo real lanza ADAPTER_NOT_CONFIGURED', async () => {
    const n = new NotificationAdapter({ authMode: AUTH_MODE.REAL });
    await assert.rejects(() => n.sendEmail('x', 'y', 'z'), e => e.code === 'ADAPTER_NOT_CONFIGURED');
  });

  it('getStatus ok', () => {
    const n = new NotificationAdapter();
    assert.equal(n.getStatus().adapter, 'notification');
  });
});

// ─── 6. AnalyticsAdapter mock ─────────────────────────────────────────────────
describe('6. AnalyticsAdapter - mock', () => {
  it('trackEvent registra evento', () => {
    const a = new AnalyticsAdapter();
    const r = a.trackEvent('page_view', { path: '/demo' });
    assert.equal(r.tracked, true);
  });

  it('trackPageView es alias de trackEvent', () => {
    const a = new AnalyticsAdapter();
    a.trackPageView('/inicio');
    assert.ok(a.getEventHistory().some(e => e.name === 'page_view'));
  });

  it('getMetrics devuelve objeto con range', async () => {
    const a = new AnalyticsAdapter();
    const m = await a.getMetrics('7d');
    assert.equal(m.range, '7d');
    assert.ok(typeof m.sessions === 'number');
  });

  it('getEventHistory devuelve copia', () => {
    const a = new AnalyticsAdapter();
    a.trackEvent('test');
    const h = a.getEventHistory();
    h.push({ extra: true });
    assert.equal(a.getEventHistory().length, 1);
  });

  it('modo real lanza ADAPTER_NOT_CONFIGURED', async () => {
    const a = new AnalyticsAdapter({ authMode: AUTH_MODE.REAL });
    assert.throws(() => a.trackEvent('x'), e => e.code === 'ADAPTER_NOT_CONFIGURED');
  });

  it('getStatus ok', () => {
    const a = new AnalyticsAdapter();
    assert.equal(a.getStatus().adapter, 'analytics');
  });
});

// ─── 7. StorageAdapter mock ───────────────────────────────────────────────────
describe('7. StorageAdapter - mock', () => {
  it('saveData guarda valor', async () => {
    const s = new StorageAdapter({ clientId: 'c1' });
    const r = await s.saveData('prefs', { theme: 'dark' });
    assert.equal(r.saved, true);
  });

  it('getData recupera valor', async () => {
    const s = new StorageAdapter({ clientId: 'c1' });
    await s.saveData('prefs', { theme: 'dark' });
    const r = await s.getData('prefs');
    assert.deepEqual(r.value, { theme: 'dark' });
  });

  it('getData inexistente devuelve null', async () => {
    const s = new StorageAdapter({ clientId: 'c1' });
    assert.equal(await s.getData('noexiste'), null);
  });

  it('deleteData elimina clave', async () => {
    const s = new StorageAdapter({ clientId: 'c1' });
    await s.saveData('tmp', 'x');
    const r = await s.deleteData('tmp');
    assert.equal(r.deleted, true);
    assert.equal(await s.getData('tmp'), null);
  });

  it('listKeys devuelve claves del cliente', async () => {
    const s = new StorageAdapter({ clientId: 'c2' });
    await s.saveData('a', 1);
    await s.saveData('b', 2);
    const keys = await s.listKeys();
    assert.ok(keys.includes('a') && keys.includes('b'));
  });

  it('aislamiento entre clientIds', async () => {
    const s1 = new StorageAdapter({ clientId: 'x' });
    const s2 = new StorageAdapter({ clientId: 'y' });
    await s1.saveData('k', 'v1');
    const r = await s2.getData('k');
    assert.equal(r, null);
  });
});

// ─── 8. IntegrationAdapter mock ──────────────────────────────────────────────
describe('8. IntegrationAdapter - mock', () => {
  it('triggerWebhook devuelve callId', async () => {
    const i = new IntegrationAdapter();
    const r = await i.triggerWebhook('on_booking', { id: '1' });
    assert.ok(r.callId?.startsWith('mock-wh-'));
  });

  it('sendToMake devuelve executionId', async () => {
    const i = new IntegrationAdapter();
    const r = await i.sendToMake('lead_capture', { email: 'x@demo.ficticio' });
    assert.ok(r.executionId?.startsWith('mock-make-'));
  });

  it('notifyExternalCRM devuelve success', async () => {
    const i = new IntegrationAdapter();
    const r = await i.notifyExternalCRM('client_created', {});
    assert.equal(r.success, true);
  });

  it('getCallHistory acumula llamadas', async () => {
    const i = new IntegrationAdapter();
    await i.triggerWebhook('wh1', {});
    await i.sendToMake('sc1', {});
    assert.equal(i.getCallHistory().length, 2);
  });

  it('modo real lanza ADAPTER_NOT_CONFIGURED', async () => {
    const i = new IntegrationAdapter({ authMode: AUTH_MODE.REAL });
    await assert.rejects(() => i.triggerWebhook('x', {}), e => e.code === 'ADAPTER_NOT_CONFIGURED');
  });

  it('calls marcadas _ficticio', async () => {
    const i = new IntegrationAdapter();
    await i.triggerWebhook('wh', {});
    assert.ok(i.getCallHistory().every(c => c._ficticio === true));
  });
});

// ─── 9. AdapterFactory ────────────────────────────────────────────────────────
describe('9. AdapterFactory', () => {
  it('createAdapters devuelve los 7 adapters', () => {
    const adapters = createAdapters({ authMode: AUTH_MODE.MOCK });
    const names = ['auth','crm','booking','notification','analytics','storage','integration'];
    for (const n of names) assert.ok(adapters[n], `falta adapter: ${n}`);
  });

  it('adapters object es frozen', () => {
    const adapters = createAdapters();
    assert.throws(() => { adapters.extra = 'x'; }, TypeError);
  });

  it('getAdapterStatus devuelve estado de todos', () => {
    const adapters = createAdapters();
    const status   = getAdapterStatus(adapters);
    assert.ok(status.auth);
    assert.ok(status.crm);
  });

  it('modo mock por defecto en todos', () => {
    const adapters = createAdapters();
    const status   = getAdapterStatus(adapters);
    for (const s of Object.values(status)) {
      assert.equal(s.mode, AUTH_MODE.MOCK);
    }
  });

  it('createAdapters sin config no explota', () => {
    assert.doesNotThrow(() => createAdapters());
  });

  it('clientId se propaga a storage', () => {
    const adapters = createAdapters({ clientId: 'mi-cliente', authMode: AUTH_MODE.MOCK });
    assert.equal(adapters.storage.clientId, 'mi-cliente');
  });
});

// ─── 10. AuthSystem mock ─────────────────────────────────────────────────────
describe('10. AuthSystem - mock', () => {
  it('login devuelve token y user', async () => {
    const s = new AuthSystem();
    const r = await s.login('admin@demo.ficticio', 'x');
    assert.ok(r.token);
    assert.ok(r.user.roles.includes('admin'));
  });

  it('login email inválido lanza AUTH_INVALID_CREDENTIALS', async () => {
    const s = new AuthSystem();
    await assert.rejects(() => s.login('bad@demo.ficticio', 'x'),
      e => e.code === 'AUTH_INVALID_CREDENTIALS');
  });

  it('getCurrentUser con token válido', async () => {
    const s = new AuthSystem();
    const { token } = await s.login('staff@demo.ficticio', 'x');
    const u = await s.getCurrentUser(token);
    assert.equal(u.email, 'staff@demo.ficticio');
  });

  it('getCurrentUser con token inválido → null', async () => {
    const s = new AuthSystem();
    assert.equal(await s.getCurrentUser('fake-token'), null);
  });

  it('logout invalida sesión', async () => {
    const s = new AuthSystem();
    const { token } = await s.login('user@demo.ficticio', 'x');
    const r = await s.logout(token);
    assert.equal(r.success, true);
    assert.equal(await s.getCurrentUser(token), null);
  });

  it('hasRole con rol correcto', async () => {
    const s = new AuthSystem();
    const { token } = await s.login('admin@demo.ficticio', 'x');
    assert.ok(await s.hasRole(token, 'admin'));
  });

  it('hasRole con rol incorrecto', async () => {
    const s = new AuthSystem();
    const { token } = await s.login('user@demo.ficticio', 'x');
    assert.ok(!(await s.hasRole(token, 'admin')));
  });

  it('refreshToken genera nuevo token', async () => {
    const s = new AuthSystem();
    const { token } = await s.login('admin@demo.ficticio', 'x');
    const r = await s.refreshToken(token);
    assert.ok(r.token !== token);
    assert.equal(await s.getCurrentUser(token), null);
    assert.ok(await s.getCurrentUser(r.token));
  });

  it('MOCK_USERS contiene los 4 usuarios', () => {
    assert.equal(MOCK_USERS.length, 4);
  });

  it('getStatus devuelve activeSessions', async () => {
    const s = new AuthSystem();
    await s.login('admin@demo.ficticio', 'x');
    assert.equal(s.getStatus().activeSessions, 1);
  });
});

// ─── 11. RoleSystem RBAC ─────────────────────────────────────────────────────
describe('11. RoleSystem - RBAC', () => {
  it('admin tiene permiso manage_users', () => {
    const r = new RoleSystem();
    assert.ok(r.hasPermission(['admin'], 'manage_users'));
  });

  it('user no tiene manage_users', () => {
    const r = new RoleSystem();
    assert.ok(!r.hasPermission(['user'], 'manage_users'));
  });

  it('admin es al menos staff', () => {
    const r = new RoleSystem();
    assert.ok(r.isAtLeast(['admin'], ROLES.STAFF));
  });

  it('user no es al menos staff', () => {
    const r = new RoleSystem();
    assert.ok(!r.isAtLeast(['user'], ROLES.STAFF));
  });

  it('getPermissionsForRole admin', () => {
    const r = new RoleSystem();
    const p = r.getPermissionsForRole('admin');
    assert.ok(p.includes('delete'));
  });

  it('canAccess dashboard con rol user', () => {
    const r = new RoleSystem();
    assert.ok(r.canAccess(['user'], 'dashboard'));
  });

  it('canAccess admin_panel requiere manage_users', () => {
    const r = new RoleSystem();
    assert.ok(!r.canAccess(['staff'], 'admin_panel'));
    assert.ok(r.canAccess(['admin'], 'admin_panel'));
  });

  it('customRule se puede agregar y ejecutar', () => {
    const r = new RoleSystem();
    r.addCustomRule('isPremium', ctx => ctx.plan === 'premium');
    assert.ok(r.applyCustomRule('isPremium', { plan: 'premium' }));
    assert.ok(!r.applyCustomRule('isPremium', { plan: 'free' }));
  });
});

// ─── 12. EventLogger ─────────────────────────────────────────────────────────
describe('12. EventLogger - structured logging', () => {
  it('info registra evento', () => {
    const l = new EventLogger({ clientId: 'c1' });
    const e = l.info('user_login', { userId: 'u1' });
    assert.equal(e.event, 'user_login');
    assert.equal(e.level, LOG_LEVEL.INFO);
  });

  it('debug no se registra si level es info', () => {
    const l = new EventLogger({ clientId: 'c1', logLevel: LOG_LEVEL.INFO });
    const e = l.debug('verbose', {});
    assert.equal(e, undefined);
  });

  it('error siempre se registra', () => {
    const l = new EventLogger({ clientId: 'c1', logLevel: LOG_LEVEL.WARN });
    const e = l.error('crash', { msg: 'boom' });
    assert.ok(e);
  });

  it('correlationId incluido', () => {
    const l = new EventLogger({ clientId: 'c1' });
    const e = l.info('test', {});
    assert.ok(e.correlationId?.startsWith('cid-'));
  });

  it('withCorrelationId propaga el id', () => {
    const l = new EventLogger({ clientId: 'c1' });
    const child = l.withCorrelationId('cid-fixed-001');
    child.info('sub_event', {});
    const evs = l.getEvents({ event: 'sub_event' });
    assert.equal(evs[0].correlationId, 'cid-fixed-001');
  });

  it('getEvents filtra por level', () => {
    const l = new EventLogger({ clientId: 'c1', logLevel: LOG_LEVEL.DEBUG });
    l.debug('d'); l.info('i'); l.warn('w');
    const warns = l.getEvents({ level: LOG_LEVEL.WARN });
    assert.equal(warns.length, 1);
  });

  it('maxEvents descarta los más antiguos', () => {
    const l = new EventLogger({ clientId: 'c1', maxEvents: 3, logLevel: LOG_LEVEL.DEBUG });
    for (let i = 0; i < 5; i++) l.info(`ev${i}`);
    assert.equal(l.getEvents().length, 3);
  });

  it('getStatus devuelve info', () => {
    const l = new EventLogger({ clientId: 'c1' });
    l.info('test');
    assert.equal(l.getStatus().system, 'event_logger');
    assert.equal(l.getStatus().storedEvents, 1);
  });
});

// ─── 13. HealthCheck ─────────────────────────────────────────────────────────
describe('13. HealthCheck - local checks', () => {
  function makeAdapters() { return createAdapters({ authMode: AUTH_MODE.MOCK }); }

  it('check demo retorna healthy:true', async () => {
    const cfg      = createRuntimeConfig(demoManifest());
    const adapters = makeAdapters();
    const hc       = new HealthCheck(cfg, adapters);
    const r        = await hc.check();
    assert.equal(r.healthy, true);
  });

  it('check incluye checks.adapters', async () => {
    const hc = new HealthCheck(createRuntimeConfig(demoManifest()), makeAdapters());
    const r  = await hc.check();
    assert.ok(r.checks.adapters);
  });

  it('check config sin clientId falla config check', async () => {
    const cfg = { mode: MODE.DEMO, authMode: AUTH_MODE.MOCK, _ficticio: true };
    const hc  = new HealthCheck(cfg, {});
    const r   = await hc.check();
    assert.equal(r.checks.config.ok, false);
  });

  it('readiness devuelve ready', async () => {
    const hc = new HealthCheck(createRuntimeConfig(demoManifest()), makeAdapters());
    const r  = await hc.readiness();
    assert.equal(r.ready, true);
  });

  it('getSLO devuelve uptime tras checks', async () => {
    const hc = new HealthCheck(createRuntimeConfig(demoManifest()), makeAdapters());
    await hc.check(); await hc.check();
    const slo = hc.getSLO();
    assert.equal(slo.total, 2);
    assert.ok(parseFloat(slo.uptime) >= 0);
  });

  it('historial acumula resultados', async () => {
    const hc = new HealthCheck(createRuntimeConfig(demoManifest()), makeAdapters());
    await hc.check(); await hc.check();
    assert.equal(hc.getHistory().length, 2);
  });

  it('producción con config incompleta falla production check', async () => {
    const cfg = { mode: MODE.PRODUCTION, authMode: AUTH_MODE.MOCK, clientId: 'c', vertical: 'dental', _ficticio: true };
    const hc  = new HealthCheck(cfg, {});
    const r   = await hc.check();
    assert.equal(r.checks.production.ok, false);
  });

  it('demo skip production check', async () => {
    const hc = new HealthCheck(createRuntimeConfig(demoManifest()), makeAdapters());
    const r  = await hc.check();
    assert.equal(r.checks.production.skipped, true);
  });
});

// ─── 14. ClientValidator ─────────────────────────────────────────────────────
describe('14. ClientValidator - staging/production', () => {
  it('demo manifest OK para staging', () => {
    const r = validateForStaging(demoManifest());
    assert.equal(r.ok, true);
    assert.ok(r.warnings?.some(w => w.includes('modo_demo')));
  });

  it('demo manifest NO OK para producción', () => {
    const r = validateForProduction(demoManifest());
    assert.equal(r.ok, false);
    assert.ok(r.errors?.some(e => e.includes('modo_demo')));
  });

  it('manifest con email ficticio bloqueado en producción', () => {
    const m = { ...prodManifest(), business: { ...prodManifest().business, email: 'info@demo.ficticio' } };
    const r = validateForProduction(m);
    assert.equal(r.ok, false);
  });

  it('prodManifest sin reales=true bloqueado', () => {
    const m = { ...prodManifest(), integraciones: { ...prodManifest().integraciones, reales: false } };
    const r = validateForProduction(m);
    assert.equal(r.ok, false);
  });

  it('prodManifest completo OK en staging', () => {
    const r = validateForStaging(prodManifest());
    assert.equal(r.ok, true);
  });

  it('manifest sin slug falla staging', () => {
    const m = demoManifest();
    delete m.business.slug;
    const r = validateForStaging(m);
    assert.equal(r.ok, false);
  });

  it('validateClientReadiness devuelve staging y production', () => {
    const r = validateClientReadiness(demoManifest());
    assert.ok('staging' in r && 'production' in r);
    assert.equal(r.summary.stagingReady, true);
    assert.equal(r.summary.productionReady, false);
  });

  it('clientes con email ficticio en demoData reportados', () => {
    const r = validateForProduction(demoManifest());
    assert.ok(r.errors.some(e => e.includes('ficticio')));
  });

  it('modo_demo false + reales=true + sin email ficticio → OK producción', () => {
    const r = validateForProduction(prodManifest());
    // prodManifest no tiene authMode=real, así que createRuntimeConfig lanzaría,
    // pero clientValidator valida el manifest directamente y aquí debe pasar.
    assert.equal(r.ok, true);
  });

  it('slug se propaga a validateClientReadiness', () => {
    const r = validateClientReadiness(demoManifest());
    assert.equal(r.clientId, 'test-client-demo');
  });
});

// ─── 15. DeploymentManifest generator ────────────────────────────────────────
describe('15. DeploymentManifest generator', () => {
  it('genera manifiesto demo con mode=demo', () => {
    const m = generateDeploymentManifest(demoManifest());
    assert.equal(m.deployment.mode, 'demo');
    assert.equal(m._ficticio, true);
  });

  it('genera manifiesto con slug correcto', () => {
    const m = generateDeploymentManifest(demoManifest());
    assert.equal(m.client.slug, 'test-client-demo');
  });

  it('genera manifiesto staging', () => {
    const manifest = { ...demoManifest(), modo_demo: false };
    const m = generateDeploymentManifest(manifest);
    assert.equal(m.deployment.mode, 'staging');
  });

  it('genera manifiesto producción', () => {
    const manifest = { ...prodManifest() };
    const m = generateDeploymentManifest(manifest);
    assert.equal(m.deployment.mode, 'production');
  });

  it('checklist incluye no_real_credentials=true', () => {
    const m = generateDeploymentManifest(demoManifest());
    assert.equal(m.checklist.no_real_credentials, true);
  });

  it('required_env_vars vacío en demo sin reales', () => {
    const m = generateDeploymentManifest(demoManifest());
    assert.equal(m.required_env_vars.length, 0);
  });

  it('lanza error sin slug', () => {
    const m = { ...demoManifest() };
    delete m.business.slug;
    assert.throws(() => generateDeploymentManifest(m), /slug/);
  });

  it('_version es v1.3', () => {
    const m = generateDeploymentManifest(demoManifest());
    assert.equal(m._version, 'v1.3');
  });
});

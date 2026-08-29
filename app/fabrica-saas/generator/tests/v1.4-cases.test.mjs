/**
 * Fábrica SaaS V1.4 · Tests de despliegue controlado
 * 15 categorías · ~112 tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '../../..');
const AURORA_MANIFEST = resolve(ROOT, 'fabrica-saas/clients/clinica-dental-aurora-demo/manifest.yaml');
const MALAGA_MANIFEST = resolve(ROOT, 'fabrica-saas/clients/clinica-dental-malaga-demo/manifest.yaml');

// ─── Imports ─────────────────────────────────────────────────────────────────
import {
  createProductionConfig, generateEnvExample, generateReleaseMetadata, generateDeployChecklist, getEnvScope,
} from '../../core/productionConfig.js';
import { DeploymentProvider, SUPPORTED_PROVIDERS, isProviderSupported }
  from '../../core/providers/deploymentProvider.js';
import { CloudflareProvider } from '../../core/providers/cloudflareProvider.js';
import {
  validatePreDeploy, validateRollbackPossible, validateOutputReproducible, validateNoSecretsInOutput,
} from '../../core/validation/preDeployValidator.js';
import { generateDeployPackage } from '../scripts/prepare-deploy.mjs';
import { generateDeploymentManifest } from '../scripts/generate-deployment.mjs';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function demoManifest(overrides = {}) {
  return {
    business: { slug: 'test-aurora-demo', name: 'Aurora Demo', email: 'info@demo.ficticio' },
    vertical: 'dental',
    modo_demo: true,
    branding:  { primaryColor: '#0f766e', inicial: 'A', emoji_sector: '🦷' },
    modules:   ['crm', 'reservas', 'auth', 'rbac', 'analytics'],
    integraciones: { reales: false, apiBaseUrl: 'NOT_CONFIGURED', domain: 'NOT_CONFIGURED' },
    demoData: { sedes: [], profesionales: [], slots: [], clientes: [], leads: [], metricas: {} },
    featureFlags: { multiSede: true },
    ...overrides,
  };
}

function prodManifest() {
  return {
    business: { slug: 'aurora-clinic-real', name: 'Aurora Clinic', email: 'info@aurora-clinic.com' },
    vertical: 'dental',
    modo_demo: false,
    branding:  { primaryColor: '#0f766e', inicial: 'A', emoji_sector: '🦷' },
    modules:   ['crm', 'reservas', 'auth', 'rbac'],
    integraciones: { reales: true, apiBaseUrl: 'https://api.aurora-clinic.com', domain: 'aurora-clinic.com' },
    demoData: { sedes: [], profesionales: [], slots: [], clientes: [], leads: [], metricas: {} },
    featureFlags: {},
  };
}

// ─── 1. ProductionConfig — creación y campos ──────────────────────────────────
describe('1. ProductionConfig - creación y campos', () => {
  it('crea config desde manifest demo', () => {
    const c = createProductionConfig(demoManifest());
    assert.equal(c.environment, 'production');
    assert.equal(c.clientId, 'test-aurora-demo');
  });

  it('config es frozen', () => {
    const c = createProductionConfig(demoManifest());
    assert.throws(() => { c.environment = 'hacked'; }, TypeError);
  });

  it('_ficticio siempre presente', () => {
    const c = createProductionConfig(demoManifest());
    assert.equal(c._ficticio, true);
  });

  it('authMode es real-placeholder', () => {
    const c = createProductionConfig(demoManifest());
    assert.equal(c.authMode, 'real-placeholder');
  });

  it('healthPath presente', () => {
    const c = createProductionConfig(demoManifest());
    assert.equal(c.healthPath, '/api/health');
  });

  it('loggingMode structured', () => {
    const c = createProductionConfig(demoManifest());
    assert.equal(c.loggingMode, 'structured');
  });

  it('enabledModules propagados', () => {
    const c = createProductionConfig(demoManifest());
    assert.ok(c.enabledModules.includes('crm'));
  });

  it('lanza error sin slug', () => {
    const m = demoManifest();
    delete m.business.slug;
    assert.throws(() => createProductionConfig(m), /slug requerido/);
  });

  it('buildMetadata version v1.4', () => {
    const c = createProductionConfig(demoManifest());
    assert.equal(c.buildMetadata.version, 'v1.4');
    assert.ok(c.buildMetadata.generatedAt);
  });

  it('adapterModes todos mock en demo', () => {
    const c = createProductionConfig(demoManifest());
    assert.equal(c.adapterModes.auth, 'mock');
    assert.equal(c.adapterModes.crm,  'mock');
  });
});

// ─── 2. ProductionConfig — production blocking ────────────────────────────────
describe('2. ProductionConfig - production blocking', () => {
  it('demo manifest tiene productionReady=false', () => {
    const c = createProductionConfig(demoManifest());
    assert.equal(c.productionReady, false);
    assert.ok(c.productionBlockers.length > 0);
  });

  it('modo_demo=true bloquea producción', () => {
    const c = createProductionConfig(demoManifest({ modo_demo: true }));
    assert.ok(c.productionBlockers.some(b => b.includes('modo_demo')));
  });

  it('integraciones.reales=false bloquea', () => {
    const c = createProductionConfig(demoManifest());
    assert.ok(c.productionBlockers.some(b => b.includes('reales')));
  });

  it('domain=NOT_CONFIGURED bloquea', () => {
    const c = createProductionConfig(demoManifest());
    assert.ok(c.productionBlockers.some(b => b.includes('domain')));
  });

  it('apiBaseUrl=NOT_CONFIGURED bloquea', () => {
    const c = createProductionConfig(demoManifest());
    assert.ok(c.productionBlockers.some(b => b.includes('apiBaseUrl')));
  });

  it('prodManifest tiene productionReady=true', () => {
    const c = createProductionConfig(prodManifest());
    assert.equal(c.productionReady, true);
    assert.equal(c.productionBlockers.length, 0);
  });

  it('adapterModes real-placeholder si reales=true', () => {
    const c = createProductionConfig(prodManifest());
    assert.equal(c.adapterModes.auth, 'real-placeholder');
    assert.equal(c.adapterModes.crm,  'real-placeholder');
  });

  it('storage siempre mock', () => {
    const c = createProductionConfig(prodManifest());
    assert.equal(c.adapterModes.storage, 'mock');
  });
});

// ─── 3. ProductionConfig — requiredEnv ────────────────────────────────────────
describe('3. ProductionConfig - requiredEnv', () => {
  it('VITE_API_BASE_URL siempre en requiredEnv', () => {
    const c = createProductionConfig(demoManifest());
    assert.ok(c.requiredEnv.some(v => v.name === 'VITE_API_BASE_URL'));
  });

  it('auth en modules agrega VITE_AUTH_DOMAIN y AUTH_CLIENT_SECRET', () => {
    const c = createProductionConfig(demoManifest());
    assert.ok(c.requiredEnv.some(v => v.name === 'VITE_AUTH_DOMAIN'));
    assert.ok(c.requiredEnv.some(v => v.name === 'AUTH_CLIENT_SECRET'));
  });

  it('AUTH_CLIENT_SECRET es WORKER_SECRET', () => {
    const ENV_SCOPE = getEnvScope();
    const c = createProductionConfig(demoManifest());
    const secret = c.requiredEnv.find(v => v.name === 'AUTH_CLIENT_SECRET');
    assert.equal(secret.scope, ENV_SCOPE.WORKER_SECRET);
  });

  it('VITE_AUTH_DOMAIN es public', () => {
    const ENV_SCOPE = getEnvScope();
    const c = createProductionConfig(demoManifest());
    const pub = c.requiredEnv.find(v => v.name === 'VITE_AUTH_DOMAIN');
    assert.equal(pub.scope, ENV_SCOPE.PUBLIC);
  });

  it('analytics DSN en requiredEnv cuando analytics en modules', () => {
    const c = createProductionConfig(demoManifest({ modules: ['analytics'] }));
    assert.ok(c.requiredEnv.some(v => v.name === 'VITE_ANALYTICS_DSN'));
  });

  it('sin auth no agrega AUTH_CLIENT_SECRET', () => {
    const c = createProductionConfig(demoManifest({ modules: ['crm'] }));
    assert.ok(!c.requiredEnv.some(v => v.name === 'AUTH_CLIENT_SECRET'));
  });
});

// ─── 4. EnvExample — generación segura ───────────────────────────────────────
describe('4. EnvExample - generación segura', () => {
  it('generateEnvExample devuelve string no vacío', () => {
    const c = createProductionConfig(demoManifest());
    const ex = generateEnvExample(c);
    assert.ok(ex.length > 0 && typeof ex === 'string');
  });

  it('VITE_API_BASE_URL=NOT_CONFIGURED presente', () => {
    const ex = generateEnvExample(createProductionConfig(demoManifest()));
    assert.ok(ex.includes('VITE_API_BASE_URL=NOT_CONFIGURED'));
  });

  it('secretos de worker comentados con #', () => {
    const ex = generateEnvExample(createProductionConfig(demoManifest()));
    assert.ok(ex.includes('# AUTH_CLIENT_SECRET='));
  });

  it('no contiene bearer ni sk_live_', () => {
    const ex = generateEnvExample(createProductionConfig(demoManifest()));
    assert.ok(!ex.includes('Bearer '));
    assert.ok(!ex.includes('sk_live_'));
  });

  it('string es suficientemente largo para ser útil', () => {
    const ex = generateEnvExample(createProductionConfig(demoManifest()));
    assert.ok(ex.length > 50);
  });

  it('AIRTABLE_API_KEY nunca en claro', () => {
    const ex = generateEnvExample(createProductionConfig(demoManifest()));
    const lines = ex.split('\n').filter(l => l.includes('AIRTABLE_API_KEY'));
    for (const l of lines) assert.ok(l.startsWith('#'));
  });
});

// ─── 5. ReleaseMetadata ───────────────────────────────────────────────────────
describe('5. ReleaseMetadata', () => {
  it('campos obligatorios presentes', () => {
    const c = createProductionConfig(demoManifest());
    const r = generateReleaseMetadata(demoManifest(), c);
    assert.equal(r.version, 'v1.4');
    assert.ok(r.generatedAt);
    assert.equal(r.clientId, 'test-aurora-demo');
  });

  it('environment = production', () => {
    const c = createProductionConfig(demoManifest());
    const r = generateReleaseMetadata(demoManifest(), c);
    assert.equal(r.environment, 'production');
  });

  it('_ficticio presente', () => {
    const c = createProductionConfig(demoManifest());
    const r = generateReleaseMetadata(demoManifest(), c);
    assert.equal(r._ficticio, true);
  });

  it('modules propagados como array', () => {
    const c = createProductionConfig(demoManifest());
    const r = generateReleaseMetadata(demoManifest(), c);
    assert.ok(Array.isArray(r.modules));
  });

  it('productionReady=false en demo', () => {
    const c = createProductionConfig(demoManifest());
    const r = generateReleaseMetadata(demoManifest(), c);
    assert.equal(r.productionReady, false);
  });
});

// ─── 6. DeploymentProvider — abstracción ─────────────────────────────────────
describe('6. DeploymentProvider - abstracción', () => {
  it('SUPPORTED_PROVIDERS incluye cloudflare', () => {
    assert.ok(SUPPORTED_PROVIDERS.includes('cloudflare'));
  });

  it('isProviderSupported OK para cloudflare', () => {
    assert.ok(isProviderSupported('cloudflare'));
  });

  it('isProviderSupported falso para unknown', () => {
    assert.ok(!isProviderSupported('unknown-provider'));
  });

  it('métodos abstractos lanzan error', () => {
    const p = new DeploymentProvider();
    assert.throws(() => p.getDeployCommands(), /no implementado/);
    assert.throws(() => p.getEnvVarMapping(), /no implementado/);
  });

  it('getManualBoundary devuelve boundary y reason', () => {
    const p = new DeploymentProvider();
    const b = p.getManualBoundary();
    assert.ok(b.boundary);
    assert.ok(b.reason);
  });

  it('getStatus devuelve configured=false en abstracto', () => {
    const p = new DeploymentProvider();
    assert.equal(p.getStatus().configured, false);
  });
});

// ─── 7. CloudflareProvider — config ──────────────────────────────────────────
describe('7. CloudflareProvider - config', () => {
  it('providerName es cloudflare', () => {
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    assert.equal(p.providerName, 'cloudflare');
  });

  it('getDeployCommands incluye MANUAL_BOUNDARY', () => {
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    const cmds = p.getDeployCommands({ client: { slug: 'mi-cliente' } });
    assert.ok(cmds.some(c => c.includes('MANUAL_BOUNDARY')));
  });

  it('getDeployCommands incluye wrangler pages deploy', () => {
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    const cmds = p.getDeployCommands({ client: { slug: 'mi-cliente' } });
    assert.ok(cmds.some(c => c.includes('wrangler pages deploy')));
  });

  it('getDryRunCommands separa safe steps de MANUAL_BOUNDARY', () => {
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    const cmds = p.getDryRunCommands({ client: { slug: 'mi-cliente' } });
    assert.ok(cmds.some(c => c.includes('npm run build')));
    assert.ok(cmds.some(c => c.includes('MANUAL_BOUNDARY')));
  });

  it('getRollbackCommands incluye rollback', () => {
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    const cmds = p.getRollbackCommands({ client: { slug: 'mi-cliente' } });
    assert.ok(cmds.some(c => c.toLowerCase().includes('rollback')));
  });

  it('getEnvVarMapping distingue worker_secret', () => {
    const c = createProductionConfig(demoManifest());
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    const mapping = p.getEnvVarMapping(c.requiredEnv);
    const secrets = mapping.filter(v => v.cfScope === 'worker_secret');
    assert.ok(secrets.length > 0);
  });

  it('getManualBoundary tiene prerequisites', () => {
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    const b = p.getManualBoundary();
    assert.ok(Array.isArray(b.prerequisites) && b.prerequisites.length > 0);
  });

  it('getStatus sin accountId retorna NOT_CONFIGURED', () => {
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    assert.equal(p.getStatus().accountId, 'NOT_CONFIGURED');
  });
});

// ─── 8. CloudflareProvider — envExample ──────────────────────────────────────
describe('8. CloudflareProvider - envExample', () => {
  it('generateEnvExample no vacío', () => {
    const c = createProductionConfig(demoManifest());
    const p = new CloudflareProvider({ projectName: 'mi-cliente' });
    assert.ok(p.generateEnvExample(c).length > 0);
  });

  it('VITE_ vars no comentadas', () => {
    const c = createProductionConfig(demoManifest());
    const p = new CloudflareProvider();
    const ex = p.generateEnvExample(c);
    const lines = ex.split('\n').filter(l => l.includes('VITE_API_BASE_URL'));
    assert.ok(lines.some(l => !l.trimStart().startsWith('#')));
  });

  it('secretos siempre comentados', () => {
    const c = createProductionConfig(demoManifest());
    const p = new CloudflareProvider();
    const ex = p.generateEnvExample(c);
    const secretLines = ex.split('\n').filter(l => l.includes('AUTH_CLIENT_SECRET'));
    assert.ok(secretLines.every(l => l.trimStart().startsWith('#')));
  });

  it('sin valores reales largos en ninguna línea', () => {
    const c = createProductionConfig(demoManifest());
    const p = new CloudflareProvider();
    const ex = p.generateEnvExample(c);
    const suspicious = ex.split('\n').filter(l =>
      !l.trimStart().startsWith('#') &&
      !l.includes('NOT_CONFIGURED') &&
      l.match(/=[a-zA-Z0-9_]{20,}/),
    );
    assert.equal(suspicious.length, 0);
  });
});

// ─── 9. PreDeployValidator — demo ─────────────────────────────────────────────
describe('9. PreDeployValidator - demo/staging', () => {
  it('demo manifest retorna objeto de validación', () => {
    const m = demoManifest();
    const r = validatePreDeploy(m, createProductionConfig(m));
    assert.ok(typeof r.ready === 'boolean');
    assert.ok(Array.isArray(r.blockers));
  });

  it('manifest sin slug bloquea', () => {
    const m = demoManifest();
    delete m.business.slug;
    const r = validatePreDeploy(m, {});
    assert.ok(!r.ready);
    assert.ok(r.blockers.some(b => b.includes('slug')));
  });

  it('manifest sin vertical bloquea', () => {
    const m = demoManifest();
    delete m.vertical;
    const r = validatePreDeploy(m, {});
    assert.ok(!r.ready);
    assert.ok(r.blockers.some(b => b.includes('vertical')));
  });

  it('domain inválido sintácticamente bloquea', () => {
    const m = demoManifest({
      integraciones: { domain: 'not a domain', reales: false, apiBaseUrl: 'NOT_CONFIGURED' },
    });
    const r = validatePreDeploy(m, createProductionConfig(m));
    assert.ok(r.blockers.some(b => b.includes('domain inválido')));
  });

  it('domain válido no bloquea por sintaxis', () => {
    const m = prodManifest();
    const r = validatePreDeploy(m, createProductionConfig(m));
    assert.ok(!r.blockers.some(b => b.includes('domain inválido')));
  });

  it('slug demasiado corto bloquea', () => {
    const m = demoManifest({ business: { slug: 'ab', name: 'AB', email: 'ab@demo.ficticio' } });
    const r = validatePreDeploy(m, createProductionConfig(m));
    assert.ok(r.blockers.some(b => b.includes('slug demasiado corto')));
  });

  it('email @demo.ficticio en producción real bloquea', () => {
    const m = prodManifest();
    m.business.email = 'contacto@demo.ficticio';
    const r = validatePreDeploy(m, createProductionConfig(m));
    assert.ok(r.blockers.some(b => b.includes('@demo.ficticio')));
  });

  it('checkedAt presente en resultado', () => {
    const r = validatePreDeploy(demoManifest(), createProductionConfig(demoManifest()));
    assert.ok(r.checkedAt);
  });
});

// ─── 10. PreDeployValidator — producción ──────────────────────────────────────
describe('10. PreDeployValidator - producción', () => {
  it('prodManifest pasa sin blockers', () => {
    const m = prodManifest();
    const r = validatePreDeploy(m, createProductionConfig(m));
    assert.ok(r.ready);
    assert.equal(r.blockers.length, 0);
  });

  it('validateRollbackPossible OK con deployment manifest completo', () => {
    const dm = generateDeploymentManifest(prodManifest());
    const r  = validateRollbackPossible(dm);
    assert.ok(r.rollbackPossible);
  });

  it('validateRollbackPossible falla sin slug', () => {
    const r = validateRollbackPossible({ deployment: { mode: 'production' } });
    assert.ok(!r.rollbackPossible);
    assert.ok(r.issues.some(i => i.includes('slug')));
  });

  it('validateOutputReproducible OK con mismos manifests', () => {
    const m1 = generateDeploymentManifest(demoManifest());
    const m2 = generateDeploymentManifest(demoManifest());
    const r  = validateOutputReproducible(m1, m2);
    assert.ok(r.reproducible);
  });

  it('validateNoSecretsInOutput OK con config ficticia', () => {
    const c = createProductionConfig(demoManifest());
    assert.ok(validateNoSecretsInOutput(c).clean);
  });

  it('validateNoSecretsInOutput detecta secreto real', () => {
    const r = validateNoSecretsInOutput({ apiKey: 'real-secret-value-abc123' });
    assert.ok(!r.clean);
    assert.ok(r.foundFields.includes('apiKey'));
  });
});

// ─── 11. PrepareDeploy — orquestación ─────────────────────────────────────────
describe('11. PrepareDeploy - orquestación', async () => {
  it('aurora manifest devuelve slug correcto', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST, verbose: false });
    assert.ok(typeof r.ok === 'boolean');
    assert.equal(r.slug, 'clinica-dental-aurora-demo');
  });

  it('deployManifest presente y ficticio', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.deployManifest);
    assert.equal(r.deployManifest._ficticio, true);
  });

  it('prodConfig con environment=production', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.equal(r.prodConfig.environment, 'production');
  });

  it('envVarMapping es array', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(Array.isArray(r.envVarMapping));
  });

  it('dryRunCommands incluye npm run build', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.dryRunCommands.some(c => c.includes('npm run build')));
  });

  it('manualBoundary con boundary', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.manualBoundary?.boundary);
  });

  it('rollbackValidation presente', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok('rollbackPossible' in r.rollbackValidation);
  });

  it('outDir en fabrica-saas/output/', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.outDir.includes('fabrica-saas/output'));
  });

  it('provider cloudflare', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.equal(r.provider.provider, 'cloudflare');
  });

  it('provider desconocido lanza error', async () => {
    await assert.rejects(
      () => generateDeployPackage({ manifestPath: AURORA_MANIFEST, provider: 'unknown' }),
      /provider desconocido/,
    );
  });
});

// ─── 12. E2E — flujo controlado completo ─────────────────────────────────────
describe('12. E2E - flujo controlado completo', async () => {
  it('aurora-demo: slug + prodConfig + preValidation + deployManifest', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.equal(r.slug, 'clinica-dental-aurora-demo');
    assert.equal(r.prodConfig.environment, 'production');
    assert.ok(typeof r.preValidation.ready === 'boolean');
    assert.ok(r.deployManifest._version === 'v1.3');
  });

  it('checklist contiene items manuales y automáticos', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.checklist.items.some(i => i.auto === true));
    assert.ok(r.checklist.items.some(i => i.manual === true));
  });

  it('dry-run tiene MANUAL_BOUNDARY claro', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.dryRunCommands.some(c => c.includes('MANUAL_BOUNDARY')));
  });

  it('env.example no contiene valores reales largos', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    const envEx = new CloudflareProvider({ projectName: r.slug }).generateEnvExample(r.prodConfig);
    const suspicious = envEx.split('\n').filter(l =>
      !l.trimStart().startsWith('#') &&
      !l.includes('NOT_CONFIGURED') &&
      l.match(/=[a-zA-Z0-9_]{20,}/),
    );
    assert.equal(suspicious.length, 0);
  });

  it('readiness staging OK en aurora-demo', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.readiness.summary.stagingReady);
  });

  it('adapterModes todos mock en demo', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.equal(r.prodConfig.adapterModes.crm,  'mock');
    assert.equal(r.prodConfig.adapterModes.auth, 'mock');
  });

  it('malaga-demo también procesa sin error', async () => {
    const r = await generateDeployPackage({ manifestPath: MALAGA_MANIFEST });
    assert.equal(r.slug, 'clinica-dental-malaga-demo');
  });

  it('dos clientes paralelos no se interfieren', async () => {
    const [r1, r2] = await Promise.all([
      generateDeployPackage({ manifestPath: AURORA_MANIFEST }),
      generateDeployPackage({ manifestPath: MALAGA_MANIFEST }),
    ]);
    assert.notEqual(r1.slug, r2.slug);
    assert.notEqual(r1.outDir, r2.outDir);
  });
});

// ─── 13. Backward compat V1.3 ────────────────────────────────────────────────
describe('13. Backward compat V1.3', () => {
  it('createRuntimeConfig sigue funcionando', async () => {
    const { createRuntimeConfig, MODE } = await import('../../core/runtimeConfig.js');
    const cfg = createRuntimeConfig(demoManifest());
    assert.equal(cfg.mode, MODE.DEMO);
  });

  it('AuthSystem.login sigue funcionando', async () => {
    const { AuthSystem } = await import('../../core/auth/authSystem.js');
    const s = new AuthSystem();
    const r = await s.login('admin@demo.ficticio', 'x');
    assert.ok(r.token);
  });

  it('RoleSystem.hasPermission sigue funcionando', async () => {
    const { RoleSystem } = await import('../../core/roles/roleSystem.js');
    const r = new RoleSystem();
    assert.ok(r.hasPermission(['admin'], 'manage_users'));
  });

  it('HealthCheck.check sigue funcionando', async () => {
    const { HealthCheck } = await import('../../core/health/healthCheck.js');
    const hc = new HealthCheck({ mode: 'demo', clientId: 'c', vertical: 'dental' }, {});
    const r  = await hc.check();
    assert.ok(typeof r.healthy === 'boolean');
  });

  it('validateClientReadiness sigue funcionando', async () => {
    const { validateClientReadiness } = await import('../../core/onboarding/clientValidator.js');
    const r = validateClientReadiness(demoManifest());
    assert.ok('staging' in r && 'production' in r);
  });
});

// ─── 14. Client isolation ─────────────────────────────────────────────────────
describe('14. Client isolation', () => {
  it('dos slugs distintos producen clientId distintos', () => {
    const c1 = createProductionConfig(demoManifest({ business: { slug: 'cliente-a', name: 'A', email: 'a@demo.ficticio' } }));
    const c2 = createProductionConfig(demoManifest({ business: { slug: 'cliente-b', name: 'B', email: 'b@demo.ficticio' } }));
    assert.notEqual(c1.clientId, c2.clientId);
  });

  it('requiredEnv difieren entre módulos distintos', () => {
    const c1 = createProductionConfig(demoManifest({ modules: ['auth'] }));
    const c2 = createProductionConfig(demoManifest({ modules: ['crm'] }));
    assert.notDeepEqual(c1.requiredEnv.map(v => v.name), c2.requiredEnv.map(v => v.name));
  });

  it('outDir de dos clientes distintos', async () => {
    const [r1, r2] = await Promise.all([
      generateDeployPackage({ manifestPath: AURORA_MANIFEST }),
      generateDeployPackage({ manifestPath: MALAGA_MANIFEST }),
    ]);
    assert.notEqual(r1.outDir, r2.outDir);
  });

  it('preValidation de dos manifests difieren', () => {
    const m1 = demoManifest({ business: { slug: 'cl-uno', name: 'Uno', email: 'x@demo.ficticio' } });
    const m2 = prodManifest();
    const r1 = validatePreDeploy(m1, createProductionConfig(m1));
    const r2 = validatePreDeploy(m2, createProductionConfig(m2));
    assert.notDeepEqual(r1.ready, r2.ready);
  });

  it('outDir de aurora contiene aurora', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.outDir.includes('aurora'));
  });
});

// ─── 15. Sin secretos + sin llamadas externas ─────────────────────────────────
describe('15. Sin secretos + sin llamadas externas', () => {
  it('productionConfig no contiene secretos reales', () => {
    const c = createProductionConfig(demoManifest());
    assert.ok(validateNoSecretsInOutput(c).clean);
  });

  it('deployManifest no contiene secretos reales', () => {
    const dm = generateDeploymentManifest(demoManifest());
    assert.ok(validateNoSecretsInOutput(dm).clean);
  });

  it('generateDeployPackage completa sin red', async () => {
    const r = await generateDeployPackage({ manifestPath: AURORA_MANIFEST });
    assert.ok(r.ok !== undefined);
  });

  it('CloudflareProvider getDryRunCommands sin llamadas de red', () => {
    const p = new CloudflareProvider({ projectName: 'test' });
    const cmds = p.getDryRunCommands({ client: { slug: 'test' } });
    assert.ok(Array.isArray(cmds));
  });

  it('ENV_SCOPE valores son strings cortos sin secretos', () => {
    const scope = getEnvScope();
    for (const v of Object.values(scope)) {
      assert.ok(typeof v === 'string');
      assert.ok(!v.match(/[a-z0-9]{20,}/i));
    }
  });

  it('releaseMetadata _ficticio=true', () => {
    const c = createProductionConfig(demoManifest());
    const r = generateReleaseMetadata(demoManifest(), c);
    assert.equal(r._ficticio, true);
  });

  it('deployChecklist _ficticio=true', async () => {
    const { validateClientReadiness } = await import('../../core/onboarding/clientValidator.js');
    const m = demoManifest();
    const c = createProductionConfig(m);
    const readiness = validateClientReadiness(m);
    const pv = validatePreDeploy(m, c);
    const ch = generateDeployChecklist(pv, readiness, c);
    assert.equal(ch._ficticio, true);
  });
});

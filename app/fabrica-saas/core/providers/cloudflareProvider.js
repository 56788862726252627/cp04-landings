/**
 * CORE V1.4 · CloudflareProvider
 * Comandos y config para Cloudflare Pages + Workers.
 * NO hace llamadas reales. Genera comandos que el operador ejecutará manualmente.
 */

import { DeploymentProvider } from './deploymentProvider.js';
import { getEnvScope, generateEnvExample } from '../productionConfig.js';
const ENV_SCOPE = getEnvScope();

export class CloudflareProvider extends DeploymentProvider {
  constructor(config = {}) {
    super({ ...config, providerName: 'cloudflare' });
    this.projectName = config.projectName ?? 'NOT_CONFIGURED';
    this.accountId   = config.accountId   ?? 'NOT_CONFIGURED';
  }

  getDeployCommands(deployManifest) {
    const slug = deployManifest?.client?.slug ?? this.projectName;
    return [
      '# [MANUAL_BOUNDARY] Requiere: CLOUDFLARE_API_TOKEN + proyecto creado en dashboard',
      `wrangler pages deploy dist --project-name ${slug}`,
    ];
  }

  getEnvVarMapping(requiredEnv) {
    return (requiredEnv ?? []).map(v => {
      if (v.scope === ENV_SCOPE.WORKER_SECRET || v.scope === 'worker_secret') {
        return { ...v, command: `wrangler secret put ${v.name}`, cfScope: 'worker_secret', manual: true };
      }
      return { ...v, command: `wrangler pages env add production ${v.name} <value>`, cfScope: 'pages_env', manual: true };
    });
  }

  getDryRunCommands(deployManifest) {
    const slug = deployManifest?.client?.slug ?? this.projectName;
    return [
      '# ═══════════════════════════════════════════════════════════',
      '# PASOS SEGUROS AUTOMATIZADOS (sin credenciales necesarias)',
      '# ═══════════════════════════════════════════════════════════',
      'npm run lint',
      'npm run factory:test:all',
      'npm run build',
      '# Verificar dist/ generado:',
      'ls dist/',
      '',
      '# ═══════════════════════════════════════════════════════════',
      '# [MANUAL_BOUNDARY] A partir de aquí requiere CLOUDFLARE_API_TOKEN',
      '# ═══════════════════════════════════════════════════════════',
      '# 1. Configurar secretos del Worker:',
      '#    wrangler secret put AIRTABLE_API_KEY',
      '#    wrangler secret put AIRTABLE_BASE_ID',
      '#    wrangler secret put AUTH_CLIENT_SECRET',
      '# 2. Desplegar en Cloudflare Pages:',
      `#    wrangler pages deploy dist --project-name ${slug}`,
      '# 3. Verificar health:',
      `#    curl https://<domain>/api/health`,
    ];
  }

  getRollbackCommands(deployManifest) {
    const slug = deployManifest?.client?.slug ?? this.projectName;
    return [
      '# ═══════════════════════════════════════════════════════════',
      '# ROLLBACK — Cloudflare Pages',
      '# [MANUAL_BOUNDARY] Requiere: CLOUDFLARE_API_TOKEN',
      '# ═══════════════════════════════════════════════════════════',
      '',
      '# Opción A — Vía Cloudflare Dashboard (recomendado):',
      `#  1. Ve a: Cloudflare Dashboard → Pages → ${slug} → Deployments`,
      '#  2. Encuentra el deployment previo',
      '#  3. Haz clic en "Rollback to this deployment"',
      '',
      '# Opción B — Vía CLI (requiere deployment ID del deployment anterior):',
      `#  wrangler pages deployment rollback --project-name ${slug} <previous-deployment-id>`,
      '',
      '# Post-rollback — verificar:',
      '#  curl https://<domain>/api/health',
    ];
  }

  generateEnvExample(productionConfig) {
    return generateEnvExample(productionConfig);
  }

  getManualBoundary() {
    return {
      provider:      'cloudflare',
      boundary:      'wrangler pages deploy dist',
      reason:        'Requiere CLOUDFLARE_API_TOKEN y proyecto creado en Cloudflare Dashboard',
      prerequisites: [
        'CLOUDFLARE_API_TOKEN configurado como variable de entorno del operador',
        'Proyecto creado en Cloudflare Pages Dashboard (nombre = slug del cliente)',
        'Dominio personalizado configurado en Cloudflare (opcional para demo)',
        'Secretos configurados vía: wrangler secret put <VAR>',
      ],
      safeStepsBefore: ['npm run lint', 'npm run factory:test:all', 'npm run build'],
      postManualSteps: [
        'Verificar health: curl https://<domain>/api/health',
        'Comprobar adapter status desde panel de admin',
        'Verificar logs en Cloudflare Pages > Functions > Logs',
      ],
    };
  }

  getStatus() {
    return {
      provider:     'cloudflare',
      projectName:  this.projectName,
      accountId:    this.accountId === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : '[CONFIGURED]',
      configured:   this.projectName !== 'NOT_CONFIGURED',
      _ficticio:    true,
    };
  }
}

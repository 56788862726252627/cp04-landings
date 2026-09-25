// Paso 09 · Fase 9 — Lógica compartida del CLI de aprovisionamiento.
//
// Node puro (sin dependencias nuevas), pensado para poder testearse con
// `node --test` igual que el resto del repo. No hace ninguna llamada de
// red y nunca escribe un valor de secreto: solo NOMBRES de variables de
// entorno en un `env.example` vacío.

import { mkdir, readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

import { validateTenantConfig, TENANT_SCHEMA_VERSION } from "../../src/saas-core/tenant/tenantSchema.js";
import { getTemplate, SECTOR_TEMPLATE_IDS } from "../../src/saas-core/templates/templates.js";
import { getPreset, SECTOR_PRESET_IDS } from "../../src/saas-core/templates/presets.js";
import { CLUB_PADEL_04_TENANT } from "../../src/saas-core/tenant/defaultTenant.js";
import { buildSidebarNavigation } from "../../src/saas-core/modules/moduleRegistry.js";
import { buildRegulatoryNotice } from "../../src/saas-core/security/privacyChecklist.js";

export const DEFAULT_TENANTS_DIR = path.join("src", "saas-core", "tenants", "demo");

const ENV_VAR_NAMES_BY_PROVIDER = Object.freeze({
  automation: ["MAKE_WEBHOOK_URL"],
  dataRepository: ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"],
  payments: ["STRIPE_SECRET_KEY"],
  messaging: ["WHATSAPP_BUSINESS_TOKEN"],
  email: ["GMAIL_OAUTH_CLIENT_ID"],
  calendar: ["GOOGLE_CALENDAR_CLIENT_ID"],
  fileStorage: ["FILE_STORAGE_BUCKET_NAME"],
  analytics: ["ANALYTICS_WRITE_KEY"],
});

/** Parser mínimo de `--key=value` / `--key value` / `--flag`, sin dependencias. */
export function parseCliArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const eqIndex = token.indexOf("=");
    if (eqIndex !== -1) {
      args[token.slice(2, eqIndex)] = token.slice(eqIndex + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

export function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // acentos (marcas diacriticas tras NFD)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export class TenantProvisioningError extends Error {}

/**
 * Resuelve qué plantilla/preset usar y construye la config de tenant.
 * No escribe nada a disco: es una función pura para poder testearla sola.
 */
export function buildTenantConfig({ template, preset, name, tenantId, demoDataEnabled = true }) {
  if (!name || !String(name).trim()) {
    throw new TenantProvisioningError('Falta --name (nombre visible del tenant demo, p.ej. --name="Clínica Demo")');
  }
  if (!template && !preset) {
    throw new TenantProvisioningError("Debes indicar --template=<id> o --preset=<id>. Usa tenant:list --catalog para ver opciones.");
  }

  let base; // plantilla o preset ya resuelto
  let sourceKind;
  if (preset) {
    base = getPreset(preset);
    if (!base) {
      throw new TenantProvisioningError(`Preset desconocido: "${preset}". Disponibles: ${SECTOR_PRESET_IDS.join(", ")}`);
    }
    sourceKind = "preset";
    if (template && template !== base.baseTemplateId) {
      throw new TenantProvisioningError(`--template=${template} no coincide con la plantilla base del preset "${preset}" (${base.baseTemplateId}). Omite --template o usa el correcto.`);
    }
  } else {
    base = getTemplate(template);
    if (!base) {
      throw new TenantProvisioningError(`Plantilla desconocida: "${template}". Disponibles: ${SECTOR_TEMPLATE_IDS.join(", ")}`);
    }
    sourceKind = "template";
  }

  const slug = slugify(tenantId || name);
  if (!slug) {
    throw new TenantProvisioningError("No se pudo derivar un slug seguro del nombre proporcionado.");
  }

  const integrations = {};
  for (const provider of base.recommendedIntegrations) {
    integrations[provider] = { status: "not_configured", envVars: ENV_VAR_NAMES_BY_PROVIDER[provider] || [] };
  }

  const tenantConfig = {
    schemaVersion: TENANT_SCHEMA_VERSION,
    tenantId: slug,
    slug,
    legalName: String(name).trim(),
    displayName: String(name).trim(),
    businessType: base.businessType,
    sector: base.sector,
    locale: "es-ES",
    timezone: "Europe/Madrid",
    currency: "EUR",
    country: "ES",
    branding: {
      colors: { accent: "#2f6bff" },
    },
    roles: base.roles,
    permissions: base.permissions,
    modulesEnabled: base.modules,
    terminologyOverrides: base.terminologyOverrides,
    integrations,
    policies: base.policies || { privacyReviewRequired: false, regulatedSector: false, sensitiveDataCategories: [] },
    demoData: { enabled: Boolean(demoDataEnabled), source: sourceKind === "preset" ? `preset:${base.presetId}` : `template:${base.templateId}` },
    flags: {},
    meta: {
      templateId: sourceKind === "preset" ? base.baseTemplateId : base.templateId,
      presetId: sourceKind === "preset" ? base.presetId : null,
      isDefaultTenant: false,
      generatedBy: "tenant:create",
    },
  };

  return { tenantConfig, base, sourceKind };
}

function buildChecklistMarkdown({ tenantConfig, base }) {
  const lines = [
    `# Checklist de puesta en marcha — ${tenantConfig.displayName}`,
    "",
    `Plantilla base: \`${tenantConfig.meta.templateId}\`${tenantConfig.meta.presetId ? ` · Preset: \`${tenantConfig.meta.presetId}\`` : ""}`,
    "",
    "## Pasos del negocio (de la plantilla/preset)",
    ...base.launchChecklist.map((step) => `- [ ] ${step}`),
    "",
    "## Pasos técnicos obligatorios antes de cualquier dato real",
    "- [ ] Rellenar `env.example` con valores reales fuera del repositorio (nunca commitear secretos)",
    "- [ ] Conectar los adaptadores de proveedor reales detrás de las interfaces de `adapters/providerAdapters.js` (siguen siendo mocks)",
    "- [ ] Revisar y, si aplica, sustituir `demoData` por datos reales del cliente",
  ];
  const notice = buildRegulatoryNotice(tenantConfig.sector);
  if (notice) {
    lines.push("", "## Aviso normativo", notice);
  }
  return lines.join("\n") + "\n";
}

function buildEnvExample(tenantConfig) {
  const lines = ["# Generado por tenant:create — SOLO nombres de variables, sin valores.", "# No commitear un archivo .env real con valores."];
  for (const [provider, entry] of Object.entries(tenantConfig.integrations)) {
    lines.push(`# ${provider} (status: ${entry.status})`);
    for (const envVar of entry.envVars) lines.push(`${envVar}=`);
  }
  return lines.join("\n") + "\n";
}

function buildSummaryMarkdown({ tenantConfig, base }) {
  const nav = buildSidebarNavigation(tenantConfig, "ADMIN");
  const lines = [
    `# Resumen — ${tenantConfig.displayName}`,
    "",
    `- tenantId: \`${tenantConfig.tenantId}\``,
    `- businessType: \`${tenantConfig.businessType}\` · sector: \`${tenantConfig.sector}\``,
    `- Plantilla: \`${tenantConfig.meta.templateId}\`${tenantConfig.meta.presetId ? ` · Preset: \`${tenantConfig.meta.presetId}\`` : ""}`,
    `- Roles: ${tenantConfig.roles.join(", ")}`,
    `- Módulos activados (${tenantConfig.modulesEnabled.length}): ${tenantConfig.modulesEnabled.join(", ")}`,
    `- Módulos visibles para ADMIN: ${nav.map((n) => n.id).join(", ")}`,
    `- Integraciones recomendadas: ${base.recommendedIntegrations.join(", ")} (todas en estado \`not_configured\`)`,
    `- Datos demo: ${tenantConfig.demoData.enabled ? "activados" : "desactivados"} (sintéticos, no reales)`,
    `- Sector regulado: ${tenantConfig.policies.regulatedSector ? "SÍ — requiere revisión normativa antes de producción" : "no"}`,
    "",
    "## Pasos manuales pendientes",
    "- Conectar adaptadores reales (Airtable/Make/Stripe/WhatsApp/Gmail/Calendar) cuando exista integración real",
    "- Sustituir datos demo por datos reales del cliente tras alta comercial",
  ];
  return lines.join("\n") + "\n";
}

/**
 * Crea un tenant demo en disco. Falla de forma segura (no sobrescribe) si
 * el directorio ya existe, salvo `force: true`. Solo crea 4 archivos
 * conocidos, nunca archivos arbitrarios.
 */
export async function createTenant({ template, preset, name, tenantId, demoDataEnabled = true, baseDir = DEFAULT_TENANTS_DIR, force = false }) {
  const { tenantConfig, base } = buildTenantConfig({ template, preset, name, tenantId, demoDataEnabled });

  const { valid, errors } = validateTenantConfig(tenantConfig);
  if (!valid) {
    throw new TenantProvisioningError(`La configuración generada no es válida (esto es un bug del CLI, repórtalo): ${JSON.stringify(errors)}`);
  }

  const outputDir = path.join(baseDir, tenantConfig.slug);
  const alreadyExists = await stat(outputDir).then(() => true).catch(() => false);
  if (alreadyExists && !force) {
    throw new TenantProvisioningError(`Ya existe un tenant en "${outputDir}". Usa --force para sobrescribir explícitamente, o elige otro --name/--tenant-id.`);
  }

  await mkdir(outputDir, { recursive: true });

  const files = {
    "tenant.config.json": JSON.stringify(tenantConfig, null, 2) + "\n",
    "env.example": buildEnvExample(tenantConfig),
    "checklist.md": buildChecklistMarkdown({ tenantConfig, base }),
    "summary.md": buildSummaryMarkdown({ tenantConfig, base }),
  };

  const filesWritten = [];
  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(outputDir, filename);
    await writeFile(filePath, content, "utf8");
    filesWritten.push(filePath);
  }

  return { tenantId: tenantConfig.tenantId, slug: tenantConfig.slug, outputDir, filesWritten, tenantConfig };
}

export async function validateTenantOnDisk({ tenantId, baseDir = DEFAULT_TENANTS_DIR }) {
  if (tenantId === CLUB_PADEL_04_TENANT.tenantId) {
    return validateTenantConfig(CLUB_PADEL_04_TENANT);
  }
  const configPath = path.join(baseDir, tenantId, "tenant.config.json");
  let raw;
  try {
    raw = await readFile(configPath, "utf8");
  } catch {
    return { valid: false, errors: [{ path: "$", message: `No se encontró tenant.config.json en ${configPath}` }] };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { valid: false, errors: [{ path: "$", message: `tenant.config.json no es JSON válido: ${err.message}` }] };
  }
  return validateTenantConfig(parsed);
}

export async function listTenantsOnDisk({ baseDir = DEFAULT_TENANTS_DIR } = {}) {
  const entries = [{
    tenantId: CLUB_PADEL_04_TENANT.tenantId,
    displayName: CLUB_PADEL_04_TENANT.displayName,
    businessType: CLUB_PADEL_04_TENANT.businessType,
    sector: CLUB_PADEL_04_TENANT.sector,
    kind: "production_default",
  }];
  let dirNames = [];
  try {
    dirNames = await readdir(baseDir);
  } catch {
    return entries; // sin tenants demo generados todavía: no es un error
  }
  for (const dirName of dirNames.sort()) {
    const configPath = path.join(baseDir, dirName, "tenant.config.json");
    try {
      const raw = await readFile(configPath, "utf8");
      const parsed = JSON.parse(raw);
      entries.push({
        tenantId: parsed.tenantId,
        displayName: parsed.displayName,
        businessType: parsed.businessType,
        sector: parsed.sector,
        kind: "demo",
      });
    } catch {
      // directorio sin tenant.config.json válido: se omite, no rompe el listado
    }
  }
  return entries;
}

export async function previewTenantOnDisk({ tenantId, baseDir = DEFAULT_TENANTS_DIR }) {
  let tenantConfig;
  if (tenantId === CLUB_PADEL_04_TENANT.tenantId) {
    tenantConfig = CLUB_PADEL_04_TENANT;
  } else {
    const configPath = path.join(baseDir, tenantId, "tenant.config.json");
    const raw = await readFile(configPath, "utf8");
    tenantConfig = JSON.parse(raw);
  }
  const { valid, errors } = validateTenantConfig(tenantConfig);
  const navigationByRole = {};
  for (const role of tenantConfig.roles) {
    navigationByRole[role] = buildSidebarNavigation(tenantConfig, role).map((n) => n.id);
  }
  return {
    tenantConfig,
    valid,
    errors,
    navigationByRole,
    regulatoryNotice: buildRegulatoryNotice(tenantConfig.sector),
  };
}

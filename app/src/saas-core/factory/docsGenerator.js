// Paso 10 · Fase 9 — Documentación automática por negocio.
//
// Genera README/guía rápida/onboarding/checklists a partir del Business
// Blueprint + el tenant.config.json derivado. Cada afirmación se etiqueta
// explícitamente: [GENERADO], [PENDIENTE REVISIÓN HUMANA], [PENDIENTE
// PROVEEDOR EXTERNO], [PENDIENTE LEGAL], [VALIDADO], [NO VALIDADO]. Nunca
// se afirma "listo para producción" sin evidencia (tests/validación real).

import { buildRegulatoryNotice } from "../security/privacyChecklist.js";

const TAG = Object.freeze({
  GENERATED: "[GENERADO AUTOMÁTICAMENTE]",
  PENDING_HUMAN: "[PENDIENTE DE REVISIÓN HUMANA]",
  PENDING_PROVIDER: "[PENDIENTE DE PROVEEDOR EXTERNO]",
  PENDING_LEGAL: "[PENDIENTE LEGAL/REGULATORIO]",
  VALIDATED: "[VALIDADO]",
  NOT_VALIDATED: "[NO VALIDADO]",
});

export function buildReadme({ blueprint, tenantConfig, navigationByRole }) {
  const lines = [
    `# ${blueprint.commercialName} ${TAG.GENERATED}`,
    "",
    `Generado por la One Prompt Factory (Paso 10) a partir del Business Blueprint \`${blueprint.businessId}\`.`,
    "",
    "## Datos del negocio",
    `- tenantId: \`${tenantConfig.tenantId}\``,
    `- Sector: \`${blueprint.sector}\`${blueprint.subsector ? ` · Subsector: \`${blueprint.subsector}\`` : ""}`,
    `- País/idioma: ${blueprint.country} / ${blueprint.locale}`,
    `- Plan: \`${blueprint.plan}\``,
    "",
    "## Módulos activados",
    ...tenantConfig.modulesEnabled.map((m) => `- ${m}`),
    "",
    "## Navegación por rol " + TAG.VALIDATED + " (derivada de moduleRegistry.js, mismo motor que Club Pádel 04)",
    ...Object.entries(navigationByRole).map(([role, ids]) => `- **${role}**: ${ids.join(", ") || "(sin módulos visibles)"}`),
  ];
  return lines.join("\n") + "\n";
}

export function buildQuickGuide({ blueprint }) {
  return [
    `# Guía rápida — ${blueprint.commercialName} ${TAG.GENERATED}`,
    "",
    "1. `npm run business:validate -- --business=<businessId>` — confirmar que el blueprint es válido.",
    "2. `npm run business:build -- --business=<businessId>` — generar tenant, landing, branding, datos demo y documentación.",
    "3. `npm run business:report -- --business=<businessId>` — regenerar el informe.",
    "4. `npm run business:doctor` — comprobar salud general de la fábrica.",
    "",
    `Tiempo estimado total: menos de 15 minutos (ver \`docs/paso-10-one-prompt-factory/10-guia-rapida-15-min.md\`).`,
  ].join("\n") + "\n";
}

export function buildOnboarding({ blueprint }) {
  return [
    `# Onboarding — ${blueprint.commercialName} ${TAG.GENERATED}`,
    "",
    `Bienvenido/a al panel de ${blueprint.commercialName}. Este es un tenant de DEMOSTRACIÓN: los datos que verás (clientes, citas, profesionales) son sintéticos.`,
    "",
    "## Primeros pasos",
    "- Revisa el checklist técnico y comercial antes de considerar este negocio listo para un cliente real.",
    `- ${TAG.PENDING_PROVIDER} Ningún proveedor (Airtable/Make/Stripe/WhatsApp/Gmail/Calendar) está conectado todavía.`,
    `- ${TAG.PENDING_HUMAN} Revisa el branding generado y sustitúyelo por assets reales del negocio.`,
  ].join("\n") + "\n";
}

export function buildTechnicalChecklist({ blueprint, tenantConfig }) {
  const notice = buildRegulatoryNotice(blueprint.sector);
  const lines = [
    `# Checklist técnico — ${blueprint.commercialName} ${TAG.GENERATED}`,
    "",
    "## Validado por esta ejecución " + TAG.VALIDATED,
    "- [x] Business Blueprint validado contra el esquema (`businessBlueprintSchema.js`)",
    "- [x] tenant.config.json derivado validado contra el esquema central (`tenantSchema.js`)",
    "- [x] Dataset demo generado y con consistencia referencial verificada",
    "",
    "## Pendiente de proveedor externo " + TAG.PENDING_PROVIDER,
    ...Object.keys(tenantConfig.integrations).map((p) => `- [ ] Conectar ${p} (hoy: mock/not_configured)`),
    "",
    "## Pendiente de revisión humana " + TAG.PENDING_HUMAN,
    "- [ ] Revisar branding generado (colores/tipografías/logo placeholder)",
    "- [ ] Revisar landing generada antes de cualquier publicación real",
    "- [ ] Rellenar `env.example` con valores reales fuera del repositorio",
  ];
  if (notice) {
    lines.push("", "## Pendiente legal/regulatorio " + TAG.PENDING_LEGAL, `- [ ] ${notice}`);
  }
  lines.push("", "## Pasos manuales declarados en el blueprint", ...(blueprint.manualSteps || []).map((s) => `- [ ] ${s}`));
  return lines.join("\n") + "\n";
}

export function buildCommercialChecklist({ blueprint }) {
  return [
    `# Checklist comercial — ${blueprint.commercialName} ${TAG.GENERATED}`,
    "",
    `- [ ] ${TAG.PENDING_HUMAN} Validar propuesta de valor con el cliente real`,
    `- [ ] ${TAG.PENDING_HUMAN} Confirmar plan comercial (\`${blueprint.plan}\`) y precio`,
    `- [ ] ${TAG.PENDING_LEGAL} Confirmar aviso de privacidad/términos reales (los generados son placeholders)`,
    `- [ ] ${TAG.NOT_VALIDATED} Este negocio NO ha sido validado con un cliente real: es una demostración`,
  ].join("\n") + "\n";
}

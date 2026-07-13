// Fusiona las tres capas ya cargadas/validadas (loadCoreConfig,
// loadVerticalConfig, loadClientConfig) en un único "resolved config".
// Precedencia fija: CORE < VERTICAL < CLIENT — implementada aquí solo para
// feature flags (vía resolveFeatureFlags); el resto de campos de CLIENT no
// tiene equivalente en CORE/VERTICAL que "sobrescribir", son complementarios
// (identidad/branding/integraciones vienen solo de CLIENT; vocabulario del
// vertical solo de VERTICAL). Ver docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md
// para la regla de oro de qué pertenece a cada capa.
//
// Campos protegidos (ninguna capa CLIENT puede sobrescribirlos):
// - roles: debe ser subconjunto de core.roles (rbac.js no reconocería un rol fuera de ese conjunto).
// - features.pagos / features.ia / features.whatsapp: forzados a false por CORE,
//   defensa en profundidad además del `const: false` ya presente en los tres schemas.
import { resolveFeatureFlags } from "./resolveFeatureFlags.js";

const FORCED_OFF_FEATURES = ["pagos", "ia", "whatsapp"];

function assertProtectedFields(core, roles, features) {
  const invalidRoles = (roles ?? []).filter((role) => !core.roles.includes(role));
  if (invalidRoles.length > 0) {
    throw new Error(
      `mergeConfigLayers: campo protegido violado — roles fuera del conjunto CORE: ${invalidRoles.join(", ")}`
    );
  }
  for (const feature of FORCED_OFF_FEATURES) {
    if (features[feature]) {
      throw new Error(
        `mergeConfigLayers: campo protegido violado — 'features.${feature}' está forzado a false por CORE, ninguna capa puede activarlo`
      );
    }
  }
}

/**
 * @param {{core: object, vertical: object, client: object}} layers Documentos
 *   ya cargados y validados individualmente contra su propio schema.
 * @returns {object} resolvedConfig — nunca se persiste, se recalcula en cada resolución.
 */
export function mergeConfigLayers({ core, vertical, client }) {
  if (!core || !vertical || !client) {
    throw new Error("mergeConfigLayers requiere { core, vertical, client } ya cargados y validados por capa");
  }
  if (vertical.verticalId && client.tenantId === undefined) {
    throw new Error("mergeConfigLayers: client-config sin tenantId — no se puede resolver un tenant sin identificador");
  }

  const { features, degraded } = resolveFeatureFlags(core, vertical, client);
  assertProtectedFields(core, client.roles, features);

  return {
    layer: "resolved",
    schemaVersion: "1.0.0",
    tenantId: client.tenantId,
    clientId: client.clientId,
    slug: client.slug,
    verticalId: vertical.verticalId,
    resourceType: vertical.resourceType,
    eventType: vertical.eventType,
    brand: client.brand,
    theme: client.theme ?? null,
    locale: client.locale,
    timezone: client.timezone,
    roles: client.roles,
    roleLabels: vertical.roleLabels,
    courts: client.courts ?? [],
    bookingHours: client.bookingHours ?? [],
    bookingModalities: vertical.bookingModalitiesDefault ?? [],
    bookingLevels: vertical.bookingLevelsDefault ?? [],
    features,
    featuresDegraded: degraded,
    integrations: client.integrations,
    plan: client.plan,
    domains: client.domains,
    contact: client.contact,
    support: client.support,
    deploymentProfile: client.deploymentProfile,
  };
}

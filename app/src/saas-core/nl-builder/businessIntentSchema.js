// Paso 11 · Fase 4 — Business Intent: descriptor intermedio versionado.
//
// El Business Intent es la SALIDA de la interpretación de lenguaje natural
// y la ENTRADA del compositor de Business Blueprint (Paso 10). Es un
// concepto deliberadamente distinto del Blueprint: el Blueprint es lo que
// la fábrica sabe construir; el Intent es lo que se entendió de una
// petición humana, con toda su incertidumbre (supuestos, ambigüedades,
// confianza) todavía visible. Nunca contiene secretos: las integraciones
// solo se referencian por nombre/estado, igual que en tenantSchema.js y
// businessBlueprintSchema.js.

export const BUSINESS_INTENT_SCHEMA_VERSION = 1;

export const KNOWN_LANGUAGES = Object.freeze(["es", "en"]);

const SECRET_LOOKALIKE = /(sk_live|sk_test|whsec_|AIza|xox[baprs]-)/;

const TOP_LEVEL_FIELDS = Object.freeze([
  "schemaVersion",
  "requestId",
  "language",
  "locale",
  "country",
  "currency",
  "timezone",
  "business",
  "objectives",
  "problemsToSolve",
  "actors",
  "processes",
  "entities",
  "requestedFeatures",
  "inferredFeatures",
  "rejectedFeatures",
  "modules",
  "roles",
  "permissions",
  "automations",
  "integrations",
  "branding",
  "landing",
  "pwa",
  "analytics",
  "security",
  "complianceNotes",
  "nonFunctionalRequirements",
  "assumptions",
  "ambiguities",
  "recommendedQuestions",
  "confidence",
  "sourceText",
  "normalizedSummary",
  "generationMetadata",
]);

const REQUIRED_TOP_LEVEL_FIELDS = Object.freeze([
  "schemaVersion",
  "requestId",
  "language",
  "locale",
  "country",
  "currency",
  "timezone",
  "business",
  "sourceText",
  "confidence",
]);

const BUSINESS_REQUIRED_FIELDS = Object.freeze(["proposedName", "sector"]);
const BUSINESS_ALLOWED_FIELDS = Object.freeze([
  "proposedName",
  "sector",
  "subsector",
  "businessModel",
  "targetAudience",
  "locations",
  "channels",
]);

function pushError(errors, path, message) {
  errors.push({ path, message });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function validateBusinessSection(business, errors) {
  if (!isPlainObject(business)) {
    pushError(errors, "business", "business debe ser un objeto");
    return;
  }
  for (const key of Object.keys(business)) {
    if (!BUSINESS_ALLOWED_FIELDS.includes(key)) pushError(errors, `business.${key}`, "propiedad de business desconocida");
  }
  for (const field of BUSINESS_REQUIRED_FIELDS) {
    if (!isNonEmptyString(business[field])) pushError(errors, `business.${field}`, "campo obligatorio ausente o vacío");
  }
  if (business.locations !== undefined && !Array.isArray(business.locations)) {
    pushError(errors, "business.locations", "locations debe ser un array");
  }
  if (business.channels !== undefined && !isStringArray(business.channels)) {
    pushError(errors, "business.channels", "channels debe ser un array de strings");
  }
}

function validateFeatureList(list, path, errors) {
  if (list === undefined) return;
  if (!Array.isArray(list)) {
    pushError(errors, path, `${path} debe ser un array`);
    return;
  }
  list.forEach((item, i) => {
    if (!isPlainObject(item) || !isNonEmptyString(item.id)) {
      pushError(errors, `${path}[${i}]`, "cada entrada requiere al menos {id}");
    }
  });
}

function validateModules(modules, errors) {
  if (modules === undefined) return;
  if (!Array.isArray(modules)) {
    pushError(errors, "modules", "modules debe ser un array");
    return;
  }
  const validSources = ["explicit", "inferred", "recommended"];
  const validStatuses = ["enabled", "suggested", "deferred", "rejected"];
  modules.forEach((m, i) => {
    if (!isPlainObject(m) || !isNonEmptyString(m.id)) {
      pushError(errors, `modules[${i}]`, "cada módulo requiere al menos {id}");
      return;
    }
    if (m.source !== undefined && !validSources.includes(m.source)) {
      pushError(errors, `modules[${i}].source`, `source debe ser uno de: ${validSources.join(", ")}`);
    }
    if (m.status !== undefined && !validStatuses.includes(m.status)) {
      pushError(errors, `modules[${i}].status`, `status debe ser uno de: ${validStatuses.join(", ")}`);
    }
    if (m.confidence !== undefined && (typeof m.confidence !== "number" || m.confidence < 0 || m.confidence > 1)) {
      pushError(errors, `modules[${i}].confidence`, "confidence debe ser un número entre 0 y 1");
    }
    if (m.dependsOn !== undefined && !isStringArray(m.dependsOn)) {
      pushError(errors, `modules[${i}].dependsOn`, "dependsOn debe ser un array de ids de módulo");
    }
  });
}

function validateConfidence(confidence, errors) {
  if (!isPlainObject(confidence)) {
    pushError(errors, "confidence", "confidence debe ser un objeto {overall, bySection}");
    return;
  }
  if (typeof confidence.overall !== "number" || confidence.overall < 0 || confidence.overall > 1) {
    pushError(errors, "confidence.overall", "confidence.overall debe ser un número entre 0 y 1");
  }
  if (confidence.bySection !== undefined) {
    if (!isPlainObject(confidence.bySection)) {
      pushError(errors, "confidence.bySection", "confidence.bySection debe ser un objeto");
    } else {
      for (const [section, value] of Object.entries(confidence.bySection)) {
        if (typeof value !== "number" || value < 0 || value > 1) {
          pushError(errors, `confidence.bySection.${section}`, "cada valor debe ser un número entre 0 y 1");
        }
      }
    }
  }
}

function validateAmbiguities(ambiguities, errors) {
  if (ambiguities === undefined) return;
  if (!Array.isArray(ambiguities)) {
    pushError(errors, "ambiguities", "ambiguities debe ser un array");
    return;
  }
  ambiguities.forEach((a, i) => {
    if (!isPlainObject(a) || !isNonEmptyString(a.field) || !isNonEmptyString(a.reason)) {
      pushError(errors, `ambiguities[${i}]`, "cada ambigüedad requiere al menos {field, reason}");
      return;
    }
    if (a.blocking !== undefined && typeof a.blocking !== "boolean") {
      pushError(errors, `ambiguities[${i}].blocking`, "blocking debe ser boolean");
    }
  });
}

function validateAssumptions(assumptions, errors) {
  if (assumptions === undefined) return;
  if (!Array.isArray(assumptions)) {
    pushError(errors, "assumptions", "assumptions debe ser un array");
    return;
  }
  assumptions.forEach((a, i) => {
    if (!isPlainObject(a) || !isNonEmptyString(a.field) || !isNonEmptyString(a.assumedValue !== undefined ? String(a.assumedValue) : "")) {
      pushError(errors, `assumptions[${i}]`, "cada supuesto requiere al menos {field, assumedValue}");
    }
  });
}

/**
 * Valida un Business Intent contra el esquema versionado. Fail-closed:
 * nunca lanza, siempre devuelve {valid, errors}, igual que
 * businessBlueprintSchema.validateBusinessBlueprint.
 * @param {unknown} intent
 * @returns {{valid: boolean, errors: {path: string, message: string}[]}}
 */
export function validateBusinessIntent(intent) {
  const errors = [];

  if (!isPlainObject(intent)) {
    return { valid: false, errors: [{ path: "$", message: "el Business Intent debe ser un objeto" }] };
  }

  for (const key of Object.keys(intent)) {
    if (!TOP_LEVEL_FIELDS.includes(key)) pushError(errors, key, "propiedad de nivel superior desconocida");
  }
  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (intent[field] === undefined || intent[field] === null) {
      pushError(errors, field, "campo obligatorio ausente");
    }
  }

  if (intent.schemaVersion !== undefined && intent.schemaVersion !== BUSINESS_INTENT_SCHEMA_VERSION) {
    pushError(errors, "schemaVersion", `versión de esquema no soportada (esperado ${BUSINESS_INTENT_SCHEMA_VERSION}; usa migrateBusinessIntent())`);
  }
  if (intent.requestId !== undefined && !isNonEmptyString(intent.requestId)) {
    pushError(errors, "requestId", "requestId no puede estar vacío");
  }
  if (intent.language !== undefined && !KNOWN_LANGUAGES.includes(intent.language)) {
    pushError(errors, "language", `language debe ser uno de: ${KNOWN_LANGUAGES.join(", ")}`);
  }
  if (intent.locale !== undefined && !isNonEmptyString(intent.locale)) {
    pushError(errors, "locale", "locale no puede estar vacío");
  }
  if (intent.country !== undefined && !/^[A-Z]{2}$/.test(String(intent.country))) {
    pushError(errors, "country", "country debe ser un código ISO 3166-1 alpha-2");
  }
  if (intent.currency !== undefined && !/^[A-Z]{3}$/.test(String(intent.currency))) {
    pushError(errors, "currency", "currency debe ser un código ISO 4217");
  }
  if (intent.timezone !== undefined && !isNonEmptyString(intent.timezone)) {
    pushError(errors, "timezone", "timezone no puede estar vacío");
  }
  if (intent.sourceText !== undefined && typeof intent.sourceText !== "string") {
    pushError(errors, "sourceText", "sourceText debe ser un string (puede ser vacío)");
  }

  if (intent.business !== undefined) validateBusinessSection(intent.business, errors);
  else pushError(errors, "business", "campo obligatorio ausente");

  for (const listField of ["objectives", "problemsToSolve", "actors", "processes", "entities", "complianceNotes", "nonFunctionalRequirements", "recommendedQuestions"]) {
    if (intent[listField] !== undefined && !isStringArray(intent[listField])) {
      pushError(errors, listField, `${listField} debe ser un array de strings`);
    }
  }

  validateFeatureList(intent.requestedFeatures, "requestedFeatures", errors);
  validateFeatureList(intent.inferredFeatures, "inferredFeatures", errors);
  validateFeatureList(intent.rejectedFeatures, "rejectedFeatures", errors);
  validateModules(intent.modules, errors);
  validateAmbiguities(intent.ambiguities, errors);
  validateAssumptions(intent.assumptions, errors);

  if (intent.confidence !== undefined) validateConfidence(intent.confidence, errors);
  else pushError(errors, "confidence", "campo obligatorio ausente");

  if (intent.roles !== undefined && !isStringArray(intent.roles)) pushError(errors, "roles", "roles debe ser un array de strings");
  if (intent.permissions !== undefined && !isPlainObject(intent.permissions)) pushError(errors, "permissions", "permissions debe ser un objeto {rol: [moduleId,...]}");
  if (intent.automations !== undefined && !Array.isArray(intent.automations)) pushError(errors, "automations", "automations debe ser un array");
  if (intent.integrations !== undefined && !isPlainObject(intent.integrations)) pushError(errors, "integrations", "integrations debe ser un objeto");
  if (intent.branding !== undefined && !isPlainObject(intent.branding)) pushError(errors, "branding", "branding debe ser un objeto");
  if (intent.landing !== undefined && !isPlainObject(intent.landing)) pushError(errors, "landing", "landing debe ser un objeto");
  if (intent.pwa !== undefined && !isPlainObject(intent.pwa)) pushError(errors, "pwa", "pwa debe ser un objeto");
  if (intent.analytics !== undefined && !isPlainObject(intent.analytics)) pushError(errors, "analytics", "analytics debe ser un objeto");
  if (intent.security !== undefined && !isPlainObject(intent.security)) pushError(errors, "security", "security debe ser un objeto");
  if (intent.normalizedSummary !== undefined && typeof intent.normalizedSummary !== "string") pushError(errors, "normalizedSummary", "normalizedSummary debe ser un string");
  if (intent.generationMetadata !== undefined && !isPlainObject(intent.generationMetadata)) pushError(errors, "generationMetadata", "generationMetadata debe ser un objeto");

  const flatValues = JSON.stringify(intent);
  if (SECRET_LOOKALIKE.test(flatValues)) {
    pushError(errors, "$", "el Business Intent parece contener un secreto o credencial; solo se permiten nombres de variables de entorno");
  }

  return { valid: errors.length === 0, errors };
}

/** Lanza si el intent es inválido; falla rápido para CLI/scripts. */
export function assertValidBusinessIntent(intent) {
  const { valid, errors } = validateBusinessIntent(intent);
  if (!valid) {
    const details = errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n");
    throw new Error(`Business Intent inválido:\n${details}`);
  }
  return intent;
}

/**
 * Migra un Business Intent de una versión anterior a
 * BUSINESS_INTENT_SCHEMA_VERSION. No muta la entrada. Sin versiones
 * anteriores conocidas todavía: un intent sin schemaVersion se trata como
 * "legacy" y se le asigna la versión actual sin más cambios (mismo patrón
 * que businessBlueprintSchema.migrateBusinessBlueprint).
 * @param {unknown} raw
 * @returns {{intent: object, migrated: boolean, notes: string[]}}
 */
export function migrateBusinessIntent(raw) {
  if (!isPlainObject(raw)) {
    throw new Error("migrateBusinessIntent requiere un objeto");
  }
  const notes = [];
  const working = { ...raw };

  if (working.schemaVersion === undefined) {
    working.schemaVersion = BUSINESS_INTENT_SCHEMA_VERSION;
    notes.push("legacy→v1: schemaVersion asignado explícitamente");
  }

  if (working.schemaVersion !== BUSINESS_INTENT_SCHEMA_VERSION) {
    throw new Error(`No hay ruta de migración conocida desde schemaVersion=${raw.schemaVersion} hasta ${BUSINESS_INTENT_SCHEMA_VERSION}`);
  }

  return { intent: working, migrated: notes.length > 0, notes };
}

// Mini-validador JSON Schema (subconjunto draft 2020-12), sin dependencias.
// Reemplaza los validadores "scratchpad" desechables mencionados en
// config/CLIENT_CONFIG_SCHEMA_GUIDE.md y config/DEPLOYMENT_PROFILE_GUIDE.md
// (cada uno confiesa haber escrito uno de un solo uso, fuera del repo).
// Implementa EXACTAMENTE las palabras clave que los schemas de este
// proyecto usan hoy: type, required, properties, additionalProperties,
// items, enum, const, pattern, minLength/maxLength, minItems, uniqueItems,
// minimum, format (uri/email/hostname), $ref/$defs (locales), allOf,
// if/then/else. No es un validador JSON Schema completo — no soporta
// palabras clave que este proyecto no usa (oneOf, anyOf, patternProperties,
// $ref externo, etc.), a propósito: cada keyword añadida aquí debe tener
// un uso real y verificable en algún schema del repo.

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  if (isPlainObject(a) || isPlainObject(b)) {
    if (!isPlainObject(a) || !isPlainObject(b)) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

const FORMAT_CHECKS = {
  uri(value) {
    try {
      // eslint-disable-next-line no-new
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  hostname(value) {
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
  },
};

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer"; // integer también matchea "number" abajo
  return typeof value; // "string" | "number" | "boolean" | "object"
}

function matchesType(value, expectedType) {
  const actual = typeOf(value);
  if (expectedType === "number") return actual === "number" || actual === "integer";
  if (expectedType === "integer") return actual === "integer";
  return actual === expectedType;
}

function resolveRef(ref, rootSchema) {
  // Solo soporta referencias locales tipo "#/$defs/nombre".
  if (!ref.startsWith("#/")) {
    throw new Error(`$ref no soportado (solo local): "${ref}"`);
  }
  const parts = ref.slice(2).split("/");
  let node = rootSchema;
  for (const part of parts) {
    node = node?.[part];
  }
  if (!node) throw new Error(`$ref no resuelto: "${ref}"`);
  return node;
}

function pathToString(path) {
  return path.length === 0 ? "$" : "$" + path.map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`)).join("");
}

function validateNode(schema, value, path, rootSchema, errors) {
  if (schema.$ref) {
    validateNode(resolveRef(schema.$ref, rootSchema), value, path, rootSchema, errors);
    return;
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => matchesType(value, t))) {
      errors.push({ path: pathToString(path), message: `tipo inválido: se esperaba ${types.join(" | ")}, llegó ${typeOf(value)}` });
      return; // sin el tipo correcto, el resto de comprobaciones no tiene sentido
    }
  }

  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    errors.push({ path: pathToString(path), message: `valor debe ser exactamente ${JSON.stringify(schema.const)}, llegó ${JSON.stringify(value)}` });
  }

  if (schema.enum && !schema.enum.some((allowed) => deepEqual(value, allowed))) {
    errors.push({ path: pathToString(path), message: `valor ${JSON.stringify(value)} no está en enum ${JSON.stringify(schema.enum)}` });
  }

  if (typeof value === "string") {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push({ path: pathToString(path), message: `no cumple pattern ${schema.pattern}` });
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path: pathToString(path), message: `longitud ${value.length} < minLength ${schema.minLength}` });
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path: pathToString(path), message: `longitud ${value.length} > maxLength ${schema.maxLength}` });
    }
    if (schema.format) {
      const check = FORMAT_CHECKS[schema.format];
      if (check && !check(value)) {
        errors.push({ path: pathToString(path), message: `no cumple format "${schema.format}"` });
      }
    }
  }

  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path: pathToString(path), message: `${value} < minimum ${schema.minimum}` });
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({ path: pathToString(path), message: `${value.length} items < minItems ${schema.minItems}` });
    }
    if (schema.uniqueItems) {
      const seen = [];
      value.forEach((item) => {
        if (seen.some((s) => deepEqual(s, item))) {
          errors.push({ path: pathToString(path), message: `items duplicados (uniqueItems): ${JSON.stringify(item)}` });
        }
        seen.push(item);
      });
    }
    if (schema.items) {
      value.forEach((item, i) => validateNode(schema.items, item, [...path, i], rootSchema, errors));
    }
  }

  if (isPlainObject(value)) {
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in value)) {
          errors.push({ path: pathToString([...path, key]), message: "campo requerido ausente" });
        }
      }
    }
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in value) {
          validateNode(propSchema, value[key], [...path, key], rootSchema, errors);
        }
      }
    }
    if (schema.additionalProperties === false) {
      const known = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) {
        if (!known.has(key)) {
          errors.push({ path: pathToString([...path, key]), message: "propiedad desconocida (additionalProperties: false)" });
        }
      }
    }
  }

  if (schema.allOf) {
    for (const sub of schema.allOf) {
      validateNode(sub, value, path, rootSchema, errors);
    }
  }

  if (schema.if) {
    const ifErrors = [];
    validateNode(schema.if, value, path, rootSchema, ifErrors);
    if (ifErrors.length === 0) {
      if (schema.then) validateNode(schema.then, value, path, rootSchema, errors);
    } else if (schema.else) {
      validateNode(schema.else, value, path, rootSchema, errors);
    }
  }
}

/**
 * Valida `document` contra `schema` (JSON Schema, subconjunto soportado
 * documentado arriba). Nunca lanza por un documento inválido — la
 * invalidez se reporta en `errors`; solo lanza si el propio `schema` usa
 * un $ref no resoluble (error de programación, no de datos de entrada).
 */
export function validateAgainstSchema(schema, document) {
  const errors = [];
  validateNode(schema, document, [], schema, errors);
  return { valid: errors.length === 0, errors };
}

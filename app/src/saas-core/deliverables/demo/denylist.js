// App 3 · Prompt 2/6 — Denylist de seguridad del paquete.
//
// Ningún archivo generado por el flujo demo debe coincidir con estos
// patrones — protege contra que, por error, el paquete final incluya
// secretos, configuración de entorno, control de versiones o
// dependencias. Se valida tanto el nombre de archivo como (para
// contenido de texto) un heurístico simple de "esto parece una clave
// real", igual que `SECRET_LOOKALIKE` ya usado en
// src/saas-core/factory/orchestrator.js y afines.

export const CP04_DENYLIST_PATTERNS = Object.freeze([
  /^\.env(\..+)?$/i,
  /^\.git(\/|$)/i,
  /node_modules(\/|$)/i,
  /\.pem$/i,
  /\.key$/i,
  /credentials?\.json$/i,
  /secrets?\.json$/i,
  /\.DS_Store$/i,
]);

const SECRET_LOOKALIKE = /(sk_live|sk_test|whsec_|AIza[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]+|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;

/** @param {string} relativePath - ruta relativa dentro del paquete (nunca la ruta absoluta del disco). */
export function cp04IsPathDenied(relativePath) {
  const normalized = String(relativePath || "").replace(/\\/g, "/");
  return CP04_DENYLIST_PATTERNS.some((pattern) => pattern.test(normalized));
}

/** @param {string} content - contenido de texto de un archivo ya generado. */
export function cp04ContentLooksLikeSecret(content) {
  return SECRET_LOOKALIKE.test(String(content || ""));
}

/**
 * Valida una lista completa de entradas de paquete antes de escribirlas
 * a disco. Nunca lanza — siempre devuelve un resultado con la lista de
 * violaciones, para que el llamador decida qué hacer.
 * @param {{relativePath:string, content?:string}[]} entries
 */
export function cp04ValidatePackageAgainstDenylist(entries) {
  const violations = [];
  for (const entry of entries || []) {
    if (cp04IsPathDenied(entry.relativePath)) {
      violations.push({ relativePath: entry.relativePath, reason: "ruta coincide con la denylist de archivos técnicos/sensibles" });
      continue;
    }
    if (typeof entry.content === "string" && cp04ContentLooksLikeSecret(entry.content)) {
      violations.push({ relativePath: entry.relativePath, reason: "el contenido parece contener un secreto real (SECRET_LOOKALIKE)" });
    }
  }
  return { valid: violations.length === 0, violations };
}

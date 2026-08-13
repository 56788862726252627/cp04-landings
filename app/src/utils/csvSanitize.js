// Club Pádel 04 · Sanitización defensiva de celdas CSV.
//
// Protege contra CSV injection (OWASP): aplicaciones como Excel y
// LibreOffice interpretan celdas que comienzan por =, +, -, @, TAB o CR
// como fórmulas. Anteponer un apóstrofo fuerza tratamiento como texto.
// Adicionalmente escapa comillas internas según RFC 4180.

const CSV_FORMULA_CHARS = new Set(["=", "+", "-", "@", "\t", "\r"]);

/**
 * Prepara el valor interno de una celda CSV (sin las comillas envolventes).
 * El resultado se debe envolver en comillas dobles en la fila CSV final.
 *
 * @param {unknown} value - Valor a sanitizar (cualquier tipo).
 * @returns {string} Contenido seguro para insertar entre comillas CSV.
 */
export function sanitizeCsvCell(value) {
  const str = value == null ? "" : String(value);
  // Escapar comillas dobles internas (RFC 4180)
  const escaped = str.replaceAll('"', '""');
  // Neutralizar prefijos de fórmula
  if (escaped.length > 0 && CSV_FORMULA_CHARS.has(escaped[0])) {
    return "'" + escaped;
  }
  return escaped;
}

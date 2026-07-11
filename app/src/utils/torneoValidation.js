// Club Pádel 04 · Validaciones de integridad de datos de Torneos (LOTE A).
//
// Puro y reutilizable, mismo patrón que torneoBracket.js/rbac.js: extraído
// para poder testearse con node --test sin arrastrar React/JSX. App.jsx
// importa estas mismas funciones — no hay una segunda copia de esta lógica.
//
// Alcance de este módulo: exclusivamente los campos reales de "torneo"
// (nombre, fecha, hora, categoría, modalidad, número de parejas, estado)
// que hasta ahora no existían en el modelo — ver
// audit/torneos-modulo/TORNEOS_100_COMPLETION_PLAN.md §3 (Lote A). No toca
// el motor de bracket/BYE (torneoBracket.js) ni el gate de rol (rbac.js).
//
// Vocabulario de categoría/modalidad: no inventado — "categoría" reutiliza
// el mismo vocabulario ya presente en el producto para pádel
// (RANKING_PRO.cat en App.jsx: "Masculino"/"Femenino"/"Mixto", con la
// etiqueta i18n "ranking.categoria" ya existente). "Modalidad" se limita
// hoy a la única modalidad que el motor de bracket soporta realmente
// (eliminación directa de un solo cruce por partido) — ampliar esta lista
// el día que exista otro sistema de competición (liga, round robin) sería
// prometer una capacidad que el motor no tiene.

export const TORNEO_CATEGORIAS = Object.freeze(["Masculino", "Femenino", "Mixto"]);
export const TORNEO_MODALIDADES = Object.freeze(["Eliminación directa"]);

export const TORNEO_NOMBRE_MIN = 3;
export const TORNEO_NOMBRE_MAX = 80;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateTorneoNombre(nombre) {
  const v = typeof nombre === "string" ? nombre.trim() : "";
  if (!v) return "El nombre del torneo es obligatorio.";
  if (v.length < TORNEO_NOMBRE_MIN) return `El nombre debe tener al menos ${TORNEO_NOMBRE_MIN} caracteres.`;
  if (v.length > TORNEO_NOMBRE_MAX) return `El nombre no puede superar ${TORNEO_NOMBRE_MAX} caracteres.`;
  return null;
}

// todayISOStr es un parámetro (no Date.now() interno) para mantener la
// función pura y determinista en tests — App.jsx le pasa su propio
// todayISO() ya existente (mismo helper que usa Reservas para "no permitir
// fecha pasada", reutilizado aquí en vez de inventar una segunda regla).
export function validateTorneoFecha(fecha, todayISOStr) {
  if (!fecha) return "La fecha del torneo es obligatoria.";
  if (!ISO_DATE_RE.test(fecha)) return "La fecha no tiene un formato válido.";
  const [y, m, day] = fecha.split("-").map(Number);
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime()) || d.getFullYear() !== y || d.getMonth() + 1 !== m || d.getDate() !== day) {
    return "La fecha no es una fecha real.";
  }
  if (todayISOStr && fecha < todayISOStr) return "La fecha no puede ser anterior a hoy.";
  return null;
}

export function validateTorneoHora(hora) {
  if (!hora) return "La hora del torneo es obligatoria.";
  if (!HORA_RE.test(hora)) return "La hora no tiene un formato válido (HH:MM).";
  return null;
}

export function validateTorneoCategoria(categoria) {
  if (!categoria) return "Selecciona una categoría.";
  if (!TORNEO_CATEGORIAS.includes(categoria)) return "Categoría no válida.";
  return null;
}

export function validateTorneoModalidad(modalidad) {
  if (!modalidad) return "Selecciona una modalidad.";
  if (!TORNEO_MODALIDADES.includes(modalidad)) return "Modalidad no válida.";
  return null;
}

// Extraído tal cual de applyCustom() en App.jsx (mismos límites, mismo
// comportamiento) para que sea testeable de forma aislada — no es una
// segunda regla paralela, App.jsx llama a esta misma función.
export function validateTorneoCustomCount(customMode, rawInput) {
  const raw = parseInt(rawInput, 10);
  if (Number.isNaN(raw) || raw < 1) return { ok: false, error: "Introduce un número válido." };
  if (customMode === "players") {
    if (raw < 2) return { ok: false, error: "Mínimo 2 jugadores." };
    if (raw % 2 !== 0) return { ok: false, error: "El número de jugadores debe ser par." };
    if (raw > 64) return { ok: false, error: "Máximo 64 jugadores." };
    return { ok: true, count: raw / 2 };
  }
  if (raw > 32) return { ok: false, error: "Máximo 32 parejas." };
  return { ok: true, count: raw };
}

// "Número de parejas válido" para publicar: debe haber al menos una pareja
// y ninguna puede estar vacía (sin jugador1/jugador2) — publicar un torneo
// con parejas vacías es exactamente el caso que la misión pide impedir
// ("torneo sin datos reales"). No se valida aquí límite máximo por formato
// (eso ya lo hace handleAddPair/applyCustom en tiempo real, antes de que
// una pareja pueda llegar a existir fuera de rango).
export function validateTorneoParejasCompletas(pairs) {
  const list = Array.isArray(pairs) ? pairs : [];
  if (list.length === 0) return "Añade al menos una pareja antes de publicar.";
  const incompleta = list.some(p => !p?.player1?.trim() || !p?.player2?.trim());
  if (incompleta) return "Todas las parejas deben tener ambos jugadores completados antes de publicar.";
  return null;
}

// Duplicados: mismo jugador en dos parejas distintas (comparación
// case-insensitive y con espacios normalizados para no dar falsos negativos
// por "Juan Pérez" vs "juan   pérez "). Cubre también el caso de dos
// parejas idénticas, ya que si ambos jugadores de una pareja se repiten en
// otra, cada uno de ellos ya dispara esta misma comprobación por separado
// — no hace falta una segunda pasada a nivel de pareja completa. Alcance de
// integridad de datos (Lote A, ver TORNEOS_100_COMPLETION_PLAN.md §3
// "evitar jugador duplicado y pareja duplicada"), no las mejoras de
// UI/límite del Lote B (que quedan fuera de esta misión).
export function validateTorneoParejasDuplicadas(pairs) {
  const list = Array.isArray(pairs) ? pairs : [];
  const norm = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
  const seenPlayers = new Map();
  for (const p of list) {
    for (const raw of [p?.player1, p?.player2]) {
      const name = norm(raw);
      if (!name) continue;
      if (seenPlayers.has(name) && seenPlayers.get(name) !== p.id) {
        return `El jugador "${raw.trim()}" aparece en más de una pareja.`;
      }
      seenPlayers.set(name, p.id);
    }
  }
  return null;
}

// Validación compuesta para PUBLICAR (Fase 3 del encargo): exige integridad
// completa. GUARDAR (autoguardado/borrador) no pasa por aquí — un borrador
// puede estar incompleto por diseño, ver handleSave/handlePublish en
// App.jsx. Devuelve errores por campo (mismo shape que `errors` en
// validateBooking/FieldError, patrón ya usado en Reservas()) para que la UI
// pueda señalar el campo exacto, no solo un mensaje genérico.
export function validateTorneoParaPublicar({ nombre, fecha, hora, categoria, modalidad, pairs, bracket, todayISOStr }) {
  const errors = {};

  const nombreErr = validateTorneoNombre(nombre);
  if (nombreErr) errors.nombre = nombreErr;

  const fechaErr = validateTorneoFecha(fecha, todayISOStr);
  if (fechaErr) errors.fecha = fechaErr;

  const horaErr = validateTorneoHora(hora);
  if (horaErr) errors.hora = horaErr;

  const categoriaErr = validateTorneoCategoria(categoria);
  if (categoriaErr) errors.categoria = categoriaErr;

  const modalidadErr = validateTorneoModalidad(modalidad);
  if (modalidadErr) errors.modalidad = modalidadErr;

  const parejasErr = validateTorneoParejasCompletas(pairs);
  if (parejasErr) errors.parejas = parejasErr;

  if (!parejasErr) {
    const duplicadosErr = validateTorneoParejasDuplicadas(pairs);
    if (duplicadosErr) errors.parejasDuplicadas = duplicadosErr;
  }

  if (!Array.isArray(bracket) || bracket.length === 0) {
    errors.bracket = 'Genera los cruces ("Reordenar cruces") antes de publicar.';
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function torneoFirstErrorMessage(errors) {
  const values = Object.values(errors || {});
  return values.length > 0 ? values[0] : null;
}

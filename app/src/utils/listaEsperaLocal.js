// Lista de espera — persistencia local (localStorage).
// Sin llamadas de red. Actúa como buffer hasta que la integración
// con Make/Airtable esté disponible. La lista local NO es la fuente
// de verdad en producción: queda marcada como "LISTA LOCAL" en la UI.

export const CP04_LISTA_ESPERA_KEY = "cp04-lista-espera-local-v1";

export const LISTA_ESPERA_ESTADOS = Object.freeze([
  "pendiente",
  "contactado",
  "promovido",
  "eliminado",
]);

function generateId() {
  return `le-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listaEsperaLoad() {
  try {
    const raw = window.localStorage.getItem(CP04_LISTA_ESPERA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listaEsperaSave(entries) {
  try {
    window.localStorage.setItem(CP04_LISTA_ESPERA_KEY, JSON.stringify(entries));
  } catch {
    // localStorage no disponible (modo privado extremo u otras restricciones)
  }
}

export function listaEsperaAdd(entries, formData) {
  const entry = {
    id: generateId(),
    nombre: (formData.nombre || "").trim(),
    apellidos: (formData.apellidos || "").trim(),
    email: (formData.email || "").trim().toLowerCase(),
    telefono: (formData.telefono || "").trim(),
    pista_preferida: formData.pista_preferida || "",
    fecha_preferida: formData.fecha_preferida || "",
    observaciones: (formData.observaciones || "").trim(),
    estado: "pendiente",
    createdAt: new Date().toISOString(),
  };
  return [...entries, entry];
}

export function listaEsperaSetEstado(entries, id, estado) {
  if (!LISTA_ESPERA_ESTADOS.includes(estado)) return entries;
  return entries.map((e) => (e.id === id ? { ...e, estado } : e));
}

export function listaEsperaRemove(entries, id) {
  return entries.filter((e) => e.id !== id);
}

export function listaEsperaGetActivos(entries) {
  return entries.filter((e) => e.estado !== "eliminado");
}

// Omnichannel text normalizer — Worker-side, zero external deps.
// Extracts intent + fields from free Spanish text or audio transcription.

function removeAccents(text) {
  return String(text || "")
    .replace(/[áàäâ]/gi, "a")
    .replace(/[éèëê]/gi, "e")
    .replace(/[íìïî]/gi, "i")
    .replace(/[óòöô]/gi, "o")
    .replace(/[úùüû]/gi, "u")
    .replace(/[ñ]/gi, "n")
    .replace(/[ç]/gi, "c");
}

function norm(text) {
  return removeAccents(text.toLowerCase())
    .replace(/[^a-z0-9\s:.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const OMNI_ACTIONS = Object.freeze({
  CONSULTAR_DISPONIBILIDAD: "consultar_disponibilidad",
  CREAR_RESERVA: "crear_reserva",
  CANCELAR_RESERVA: "cancelar_reserva",
  REPROGRAMAR_RESERVA: "reprogramar_reserva",
  CONSULTAR_RESERVAS: "consultar_reservas",
  DESCONOCIDA: "desconocida",
});

export function detectAction(text) {
  const n = norm(text);
  // Order matters: cancel/reprogram checked before generic "reservar"
  if (/\bcancel\w*|\banul\w*|\bborra(r)?\b|\belimin\w+/.test(n)) return OMNI_ACTIONS.CANCELAR_RESERVA;
  if (/\breprogr\w+|\bcambi\w+.*(hora|dia|fecha|pista|horario)\b|\bmover\b|\bnueva hora\b|\botro dia\b/.test(n)) return OMNI_ACTIONS.REPROGRAMAR_RESERVA;
  if (/\bmis reservas\b|\bver mis\b|\bcuantas reservas\b|\bque reservas\b|\btengo reserva\w*|\bhistorial\b/.test(n)) return OMNI_ACTIONS.CONSULTAR_RESERVAS;
  if (/\bdisponib\w+|\bhorario\w*|\bhay (pista|hueco|espacio)|\bcuando puedo\b|\bpistas? libres?\b|\bslots?\b|\bocupad\w+/.test(n)) return OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD;
  if (/\breserv\w+|\bquiero (una|pista)|\bnecesito pista\b|\bpedir pista\b|\bhacer una\b|\bapuntar\w*|\balqui\w+/.test(n)) return OMNI_ACTIONS.CREAR_RESERVA;
  return OMNI_ACTIONS.DESCONOCIDA;
}

const WEEKDAYS_ES = {
  lunes: 1, martes: 2, miercoles: 3,
  jueves: 4, viernes: 5, sabado: 6, domingo: 0,
};

const MONTHS_ES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nextWeekday(from, target) {
  const date = new Date(from);
  const cur = date.getDay();
  let diff = target - cur;
  if (diff <= 0) diff += 7;
  date.setDate(date.getDate() + diff);
  return date;
}

export function extractDate(text, referenceDate = null) {
  const n = norm(text);
  const today = referenceDate ? new Date(referenceDate) : new Date();
  today.setHours(12, 0, 0, 0);

  if (/\bhoy\b/.test(n)) return formatISO(today);

  if (/\bmanana\b/.test(n)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return formatISO(d);
  }

  const iso = n.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dMes = n.match(/(?:el\s+)?(\d{1,2})\s+de\s+([a-z]+)/);
  if (dMes) {
    const day = parseInt(dMes[1]);
    const month = MONTHS_ES[dMes[2]];
    if (month && day >= 1 && day <= 31) {
      const date = new Date(today.getFullYear(), month - 1, day, 12);
      if (date < today) date.setFullYear(today.getFullYear() + 1);
      return formatISO(date);
    }
  }

  for (const [name, num] of Object.entries(WEEKDAYS_ES)) {
    if (new RegExp(`\\b${name}\\b`).test(n)) return formatISO(nextWeekday(today, num));
  }

  return null;
}

const WORD_HOURS = {
  ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13,
  catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
  dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintidos: 22,
};

export function extractTime(text) {
  const n = norm(text);

  // Iterate all numeric matches (first match may be a court number like "2" in "pista 2")
  const re = /(?:a\s+las?\s+)?(\d{1,2})(?::(\d{2}))?(?=\s*h?\b|\s|$)/g;
  let m;
  while ((m = re.exec(n)) !== null) {
    const h = parseInt(m[1]);
    const min = parseInt(m[2] || "0");
    if (h >= 8 && h <= 22) {
      const half = /y\s*media/.test(n) && !m[2] ? 30 : 0;
      return `${String(h).padStart(2, "0")}:${String(min + half).padStart(2, "0")}`;
    }
  }

  for (const [word, h] of Object.entries(WORD_HOURS)) {
    if (new RegExp(`\\b${word}\\b`).test(n)) {
      const half = /y\s*media/.test(n) ? 30 : 0;
      return `${String(h).padStart(2, "0")}:${String(half).padStart(2, "0")}`;
    }
  }

  return null;
}

export function extractCourt(text) {
  const n = norm(text);
  const m = n.match(/pista\s+([1-4])/);
  return m ? `Pista ${m[1]}` : null;
}

export function normalizeOmniInput(text, referenceDate = null) {
  const action = detectAction(text);
  const fecha = extractDate(text, referenceDate);
  const hora = extractTime(text);
  const pista = extractCourt(text);
  return { action, extracted: { fecha, hora, pista }, original: text };
}

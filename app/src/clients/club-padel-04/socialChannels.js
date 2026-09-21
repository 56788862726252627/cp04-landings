// Club Pádel 04 · Configuración declarativa de canales de contacto y redes.
// (Fase 3A — capability CONTACT_AND_SOCIAL de la Fábrica SaaS, aplicada con
// la identidad de Club Pádel 04.)
//
// REGLA CRÍTICA — CERO ENLACES FICTICIOS:
// Este archivo está VACÍO a propósito. La auditoría de la Fase 3A (2026-09-21)
// no encontró NINGÚN canal real del club (ni WhatsApp, ni Instagram, ni email,
// ni teléfono). Mientras un canal no tenga un valor REAL confirmado por el
// dueño, NO se rellena aquí — y sin valor, el componente ContactAndSocial NO
// renderiza nada (regla compartida con la Factory: canal sin value = fuera).
//
// CÓMO ACTIVAR UN CANAL (solo el dueño, con dato real):
//   export const CP04_SOCIAL_CHANNELS = Object.freeze([
//     { id: "whatsapp", value: "+34600000000", priority: 1, placement: "both" },
//     { id: "instagram", value: "@clubpadel04real", placement: "footer" },
//   ]);
//
// IDs válidos: whatsapp, instagram, tiktok, youtube, x, facebook, linkedin,
// email, phone. value = teléfono/handle/URL/email REAL. placement:
// "section" (sección contacto), "footer", o "both" (por defecto).
//
// La ubicación física (PHYSICAL_LOCATION en la Factory) sigue igual: sin
// dirección real confirmada no existe sección "Dónde encontrarnos".
// → ACTUALIZADO en Fase 3B (2026-09-21): el propietario confirmó la dirección
//   real del club (ver CP04_PHYSICAL_LOCATION más abajo).

export const CP04_SOCIAL_CHANNELS = Object.freeze([
  // Canales REALES confirmados por el propietario (Fase 3B, 2026-09-21).
  // URLs exactas aportadas — sin normalización más allá de las dadas.
  { id: "instagram", value: "https://www.instagram.com/clubpadel04?stkn=d2k2bWFndW8ybWt5", priority: 1, placement: "both" },
  { id: "facebook", value: "https://www.facebook.com/share/18N64j8e4P/", priority: 2, placement: "both" },
  { id: "youtube", value: "https://youtube.com/@clubpadel04?si=sGW0rDo7pDA6N_70", priority: 3, placement: "both" },
  { id: "linkedin", value: "https://www.linkedin.com/company/club-padel-04/", priority: 4, placement: "both" },
  // NO activados (sin dato real confirmado por el propietario):
  // whatsapp, tiktok, x, email, phone — mantenerlos ausentes de esta lista.
]);

// Ubicación física REAL confirmada por el propietario (Fase 3B, 2026-09-21).
// SOLO la dirección: sin número de portal inventado, sin coordenadas, sin
// teléfono, horarios, parking ni datos adicionales no confirmados.
// El enlace "Cómo llegar" se construye de forma determinista por búsqueda
// textual en Google Maps (URL pública, sin claves ni API) — no es un embed.
export const CP04_PHYSICAL_LOCATION = Object.freeze({
  hasPhysicalLocation: true,
  address: "Calle Ciudad de Cuenca, Antequera, España, 29200",
});

// Resolución de canales activos (misma lógica que contactSocialLogic.js de la
// Factory, adaptada a este bundle): un canal sin value no se resuelve nunca.
export function resolveCp04SocialChannels(channels = CP04_SOCIAL_CHANNELS) {
  if (!Array.isArray(channels)) return [];
  return channels
    .map((channel) => {
      if (!channel || typeof channel !== "object") return null;
      if (channel.enabled === false) return null;
      const value = typeof channel.value === "string" ? channel.value.trim() : "";
      if (!value) return null;
      let url = null;
      try {
        if (channel.id === "whatsapp") url = /^https?:\/\//i.test(value) ? value : `https://wa.me/${value.replace(/[^\d+]/g, "")}`;
        else if (channel.id === "instagram") url = /^https?:\/\//i.test(value) ? value : `https://instagram.com/${value.replace(/^@/, "")}`;
        else if (channel.id === "tiktok") url = /^https?:\/\//i.test(value) ? value : `https://tiktok.com/@${value.replace(/^@/, "")}`;
        else if (channel.id === "youtube") url = /^https?:\/\//i.test(value) ? value : `https://youtube.com/@${value.replace(/^@/, "")}`;
        else if (channel.id === "x") url = /^https?:\/\//i.test(value) ? value : `https://x.com/${value.replace(/^@/, "")}`;
        else if (channel.id === "facebook") url = /^https?:\/\//i.test(value) ? value : `https://facebook.com/${value}`;
        else if (channel.id === "linkedin") url = /^https?:\/\//i.test(value) ? value : `https://linkedin.com/${value.startsWith("in/") ? value : `in/${value}`}`;
        else if (channel.id === "email") url = /^mailto:/i.test(value) ? value : `mailto:${value}`;
        else if (channel.id === "phone") url = /^tel:/i.test(value) ? value : `tel:${value.replace(/[^\d+]/g, "")}`;
        else return null; // id desconocido: fuera
      } catch { return null; }
      if (typeof url !== "string" || !url) return null;
      return {
        id: channel.id,
        url,
        label: (typeof channel.label === "string" && channel.label) || channel.id,
        priority: Number.isFinite(channel.priority) ? channel.priority : 100,
        placement: channel.placement ?? "both",
        external: !url.startsWith("mailto:") && !url.startsWith("tel:"),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority);
}

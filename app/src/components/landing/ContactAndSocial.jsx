// Club Pádel 04 · Sección "Contacto y redes" — componente nativo.
// (Fase 3A — capability CONTACT_AND_SOCIAL de la Fábrica SaaS adaptada a la
// identidad de Club Pádel 04: tokens T, glass sutil, acento lima.)
//
// REGLA CRÍTICA: sin canales reales configurados (CP04_SOCIAL_CHANNELS vacío)
// este componente devuelve null — la sección NO existe. Cero enlaces muertos.
// Cuando el dueño rellene un canal real en socialChannels.js, aparecerá aquí
// y en el footer (según placement) sin tocar más código.
import { T } from "../../theme.js";
import { resolveCp04SocialChannels } from "../../clients/club-padel-04/socialChannels.js";

const CHANNEL_LABELS = {
  whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube",
  x: "X", facebook: "Facebook", linkedin: "LinkedIn", email: "Email", phone: "Teléfono",
};

const CHANNEL_GLYPHS = {
  whatsapp: "💬", instagram: "📷", tiktok: "🎵", youtube: "▶",
  x: "✕", facebook: "f", linkedin: "in", email: "✉", phone: "☎",
};

export function ContactAndSocial({ title, subtitle, tx }) {
  const channels = resolveCp04SocialChannels().filter(
    (c) => c.placement === "section" || c.placement === "both"
  );
  if (channels.length === 0) return null; // sin datos reales: sin sección

  return (
    <section id="contacto" className="cp04-section cp04-section--contacto">
      <div style={{ width: "min(100%, 1180px)", margin: "0 auto", padding: "0 24px" }}>
        {title && <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.9rem,4vw,2.9rem)", letterSpacing: "-.04em", margin: "0 0 14px" }}>{title}</h2>}
        {subtitle && <p style={{ color: T.textDim, fontSize: "1.02rem", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 640 }}>{subtitle}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {channels.map((channel) => (
            <a
              key={channel.id}
              href={channel.url}
              aria-label={CHANNEL_LABELS[channel.id] ?? channel.label}
              {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "13px 22px", borderRadius: 14,
                border: `1px solid ${T.line}`,
                background: "linear-gradient(160deg, rgba(255,255,255,.045), rgba(255,255,255,.015))",
                color: T.text, textDecoration: "none",
                fontFamily: T.fontDisplay, fontWeight: 700, fontSize: ".92rem",
              }}
            >
              <span aria-hidden="true" style={{ color: T.accent, fontSize: "1.05rem", lineHeight: 1 }}>
                {CHANNEL_GLYPHS[channel.id] ?? "•"}
              </span>
              {CHANNEL_LABELS[channel.id] ?? channel.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Variante compacta para el footer — solo iconos de canales footer/both. */
export function FooterSocial() {
  const channels = resolveCp04SocialChannels().filter(
    (c) => c.placement === "footer" || c.placement === "both"
  );
  if (channels.length === 0) return null;

  return (
    <nav aria-label="Redes del club" style={{ display: "flex", gap: 14, alignItems: "center" }}>
      {channels.map((channel) => (
        <a
          key={channel.id}
          href={channel.url}
          aria-label={CHANNEL_LABELS[channel.id] ?? channel.label}
          {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          style={{ color: T.textDim, display: "inline-flex", padding: 6, borderRadius: 10, minWidth: 32, minHeight: 32, placeItems: "center" }}
        >
          <span aria-hidden="true" style={{ fontSize: "1.15rem", lineHeight: 1 }}>
            {CHANNEL_GLYPHS[channel.id] ?? "•"}
          </span>
        </a>
      ))}
    </nav>
  );
}

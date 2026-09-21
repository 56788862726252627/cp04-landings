// Club Pádel 04 · Sección "Dónde encontrarnos" — componente nativo.
// (Fase 3B — capability PHYSICAL_LOCATION de la Fábrica SaaS aplicada con la
// identidad de Club Pádel 04.)
//
// REGLAS: solo datos reales confirmados por el propietario (dirección textual).
// Sin coordenadas, sin iframe/embed (no existe embedUrl real), sin teléfono,
// horarios, parking ni datos adicionales no confirmados. El enlace "Cómo
// llegar" es una búsqueda textual pública de Google Maps construida de forma
// determinista desde la dirección — sin claves, sin API, sin llamada externa
// desde la app (el enlace se abre en el navegador del visitante).
import { T } from "../../theme.js";
import { CP04_PHYSICAL_LOCATION } from "../../clients/club-padel-04/socialChannels.js";

export function PhysicalLocation({ title, subtitle, howToGetLabel, tx }) {
  const { hasPhysicalLocation, address } = CP04_PHYSICAL_LOCATION;
  if (!hasPhysicalLocation || !address || !address.trim()) return null; // sin dato real: sin sección

  // Enlace "Cómo llegar": búsqueda textual pública (determinista, sin claves).
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <section id="donde-encontrarnos" className="cp04-section cp04-section--donde">
      <div style={{ width: "min(100%, 1180px)", margin: "0 auto", padding: "0 24px" }}>
        {title && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.accent, fontWeight: 900, letterSpacing: ".18em", fontSize: ".72rem", textTransform: "uppercase", marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}` }} />
            {title}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
            alignItems: "center",
            padding: "clamp(20px,3vw,28px)",
            borderRadius: 22,
            border: `1px solid ${T.line}`,
            background: "linear-gradient(160deg, rgba(255,255,255,.045), rgba(255,255,255,.015))",
          }}
        >
          <div>
            {subtitle && (
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.6rem,3.5vw,2.4rem)", letterSpacing: "-.04em", margin: "0 0 10px" }}>
                {subtitle}
              </h2>
            )}
            <address style={{ fontStyle: "normal", color: T.text, fontSize: "1.02rem", lineHeight: 1.7 }}>
              {address}
            </address>
          </div>
          <div style={{ justifySelf: "start" }}>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={howToGetLabel ?? "Cómo llegar"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 24px", borderRadius: 14,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
                color: "#06100a", border: "none",
                fontFamily: T.fontDisplay, fontWeight: 900, fontSize: ".95rem",
                textDecoration: "none",
                boxShadow: "0 16px 36px rgba(182,255,0,.22)",
              }}
            >
              📍 {howToGetLabel ?? "Cómo llegar"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

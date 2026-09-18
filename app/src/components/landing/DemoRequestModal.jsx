// Club Pádel 04 · formulario "Solicitar demo" de la landing comercial.
//
// 100% local: NO llama a ningún backend, NO envía email real, NO toca
// Make/Airtable/Stripe/WhatsApp. Es una demo comercial de la propia
// landing, coherente con el resto de "modo demo" ya existente en la app
// (ver src/components/demo/DemoSafeNotice.jsx). Si algún día se conecta a
// un CRM real, ese cableado se hace explícitamente aparte — este
// componente no debe mutar para "hacerlo real" sin que alguien lo decida.
import { useState } from "react";
import { t } from "../../i18n/translations.js";
import { useLang } from "../../i18n/language.js";
import { T } from "../../theme.js";
import { IconClose, IconCheck } from "../icons/Icons.jsx";

const FIELD_STYLE = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${T.line}`,
  background: "rgba(255,255,255,.05)",
  color: T.text,
  outline: "none",
  fontFamily: T.fontBody,
  fontSize: ".92rem",
};

const LABEL_STYLE = { display: "block", color: T.textDim, fontSize: ".78rem", fontWeight: 700, marginBottom: 6 };

export default function DemoRequestModal({ onClose }) {
  const [form, setForm] = useState({ nombre: "", club: "", pistas: "", localidad: "", email: "", telefono: "", necesidades: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { lang } = useLang();
  const tx = key => t(key, lang);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.nombre.trim() || !form.club.trim() || !form.email.trim()) {
      setError(tx("landing.demo_modal.error"));
      return;
    }
    setError("");
    // DEMO: se guarda solo en este navegador, etiquetado sin ambigüedad,
    // y nunca se envía a ningún sitio. Ver comentario de cabecera.
    try {
      const key = "cp04_demo_solicitudes_demo";
      const existing = JSON.parse(window.localStorage.getItem(key) || "[]");
      existing.push({ ...form, fecha: new Date().toISOString(), origen: "landing_demo" });
      window.localStorage.setItem(key, JSON.stringify(existing));
    } catch {
      // Almacenamiento no disponible: no bloquea la confirmación visual,
      // que es lo único que esta demo promete.
    }
    setSent(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Solicitar demo de Club Pádel 04"
      style={{ position: "fixed", inset: 0, background: "rgba(3,5,9,.78)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 20, zIndex: 200 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "min(560px, 100%)", maxHeight: "88vh", overflowY: "auto", background: T.surface, border: `1px solid ${T.line}`, borderRadius: 26, padding: "clamp(22px,4vw,34px)", boxShadow: "0 30px 100px rgba(0,0,0,.55)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ color: T.accent, fontSize: ".74rem", fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" }}>{tx("landing.planes.cta")}</div>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: "1.7rem", margin: "4px 0 0", letterSpacing: "-.03em" }}>{tx("landing.demo_modal.title")}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" style={{ background: "transparent", border: "none", color: T.textDim, cursor: "pointer", padding: 6 }}>
            <IconClose size={22} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "36px 12px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(182,255,0,.14)", border: `1px solid ${T.accent}`, display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
              <IconCheck size={26} color={T.accent} />
            </div>
            <strong style={{ display: "block", fontSize: "1.15rem", marginBottom: 8 }}>{tx("landing.demo_modal.success")}</strong>
            <p style={{ color: T.textDim, lineHeight: 1.6, margin: "0 auto", maxWidth: 380 }}>{tx("landing.demo_modal.success_detail")}</p>
            <button type="button" onClick={onClose} className="cp04-btn" style={{ marginTop: 22, padding: "12px 22px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#06100a", fontWeight: 900, fontFamily: T.fontDisplay, cursor: "pointer" }}>
              {tx("nav.cerrar_menu")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 18, display: "grid", gap: 14 }}>
            <p style={{ color: T.textDim, fontSize: ".86rem", lineHeight: 1.6, margin: "0 0 4px" }}>
              {tx("landing.demo_modal.subtitle")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              <div>
                <label style={LABEL_STYLE} htmlFor="demo-nombre">{tx("landing.demo_modal.name_label")}</label>
                <input id="demo-nombre" style={FIELD_STYLE} value={form.nombre} onChange={(e) => update("nombre", e.target.value)} autoComplete="name" />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor="demo-club">{tx("landing.demo_modal.club_label")}</label>
                <input id="demo-club" style={FIELD_STYLE} value={form.club} onChange={(e) => update("club", e.target.value)} />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor="demo-pistas">{tx("landing.demo_modal.courts_label")}</label>
                <input id="demo-pistas" type="number" min="1" style={FIELD_STYLE} value={form.pistas} onChange={(e) => update("pistas", e.target.value)} />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor="demo-localidad">{tx("landing.demo_modal.location_label")}</label>
                <input id="demo-localidad" style={FIELD_STYLE} value={form.localidad} onChange={(e) => update("localidad", e.target.value)} />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor="demo-email">{tx("landing.demo_modal.email_label")}</label>
                <input id="demo-email" type="email" style={FIELD_STYLE} value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor="demo-telefono">{tx("landing.demo_modal.phone_label")}</label>
                <input id="demo-telefono" type="tel" style={FIELD_STYLE} value={form.telefono} onChange={(e) => update("telefono", e.target.value)} autoComplete="tel" />
              </div>
            </div>
            <div>
              <label style={LABEL_STYLE} htmlFor="demo-necesidades">{tx("landing.demo_modal.message_label")}</label>
              <textarea id="demo-necesidades" rows={3} style={{ ...FIELD_STYLE, resize: "vertical" }} value={form.necesidades} onChange={(e) => update("necesidades", e.target.value)} placeholder={tx("landing.demo_modal.message_placeholder")} />
            </div>
            {error && <div style={{ color: T.dangerText, fontWeight: 700, fontSize: ".86rem" }}>{error}</div>}
            <button type="submit" className="cp04-btn" style={{ padding: "13px 22px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#06100a", fontWeight: 900, fontFamily: T.fontDisplay, cursor: "pointer", justifySelf: "start" }}>
              {tx("landing.demo_modal.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

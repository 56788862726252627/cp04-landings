// Club Pádel 04 · Landing comercial premium.
//
// Antes de esta pasada (auditoría Premium V2, 2026-09-03) no existía una
// página de venta: el primer contacto con un visitante era directamente la
// pantalla de login/selector de rol. Este componente es una página pública
// separada, sin sesión y sin tocar auth/RBAC/Worker en absoluto — solo lee
// `T` (tokens de diseño) e iconos propios, y expone un único callback
// (`onEnterLogin`) para pasar a la pantalla de acceso real que ya existía.
//
// Traduce funcionalidad técnica a beneficios (nunca "51 escenarios", IDs
// de Make ni nombres de endpoints): un club que visita esta página no debe
// enterarse de que por dentro hay Airtable/Make/Cloudflare, solo de lo que
// eso le resuelve.
import { useState } from "react";
import { t } from "../../i18n/translations.js";
import { useLang } from "../../i18n/language.js";
import { T } from "../../theme.js";
import {
  IconCalendar, IconShieldCheck, IconUsers, IconChartBar, IconQrCode,
  IconTrophy, IconBolt, IconBell, IconClock, IconPlug, IconLock,
  IconArrowRight, IconMenu, IconClose, IconCheck,
} from "../icons/Icons.jsx";
import DemoRequestModal from "./DemoRequestModal.jsx";
import { ContactAndSocial, FooterSocial } from "./ContactAndSocial.jsx";
import { PhysicalLocation } from "./PhysicalLocation.jsx";
import LandingMedia, { LandingHeroBackground } from "../../clients/club-padel-04/LandingMedia.jsx";
import "../../clients/club-padel-04/landingExperience.css";

const MAXW = 1180;

function Container({ children, style = {} }) {
  return <div style={{ width: "min(100%, " + MAXW + "px)", margin: "0 auto", padding: "0 24px", ...style }}>{children}</div>;
}

function Eyebrow({ children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.accent, fontWeight: 900, letterSpacing: ".18em", fontSize: ".72rem", textTransform: "uppercase", marginBottom: 14 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}` }} />
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle, align = "left" }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? 720 : 640, margin: align === "center" ? "0 auto 40px" : "0 0 40px" }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.9rem,4vw,2.9rem)", lineHeight: 1.05, letterSpacing: "-.04em", margin: "0 0 14px" }}>{title}</h2>
      {subtitle && <p style={{ color: T.textDim, fontSize: "1.02rem", lineHeight: 1.7, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

function LandingBtn({ children, onClick, href, variant = "primary", style = {}, ...rest }) {
  const map = {
    primary: { background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#06100a", border: "none", boxShadow: "0 16px 36px rgba(182,255,0,.22)" },
    secondary: { background: "rgba(255,255,255,.06)", color: T.text, border: `1px solid ${T.line}` },
    ghost: { background: "transparent", color: T.text, border: "none" },
  };
  const commonStyle = { padding: "13px 24px", borderRadius: 14, fontFamily: T.fontDisplay, fontWeight: 900, letterSpacing: "-.01em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", fontSize: ".95rem", ...map[variant], ...style };
  if (href) {
    return <a href={href} style={commonStyle} {...rest}>{children}</a>;
  }
  return <button type="button" onClick={onClick} style={commonStyle} {...rest}>{children}</button>;
}

function FeatureCard({ icon, title, children }) {
  return (
    <div style={{ padding: "clamp(20px,3vw,28px)", borderRadius: 22, border: `1px solid ${T.line}`, background: "linear-gradient(160deg, rgba(255,255,255,.045), rgba(255,255,255,.015))", height: "100%" }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(182,255,0,.1)", border: "1px solid rgba(182,255,0,.25)", display: "grid", placeItems: "center", color: T.accent, marginBottom: 16 }}>
        {icon}
      </div>
      <strong style={{ display: "block", fontSize: "1.08rem", marginBottom: 8, fontFamily: T.fontDisplay }}>{title}</strong>
      <p style={{ color: T.textDim, lineHeight: 1.65, margin: 0, fontSize: ".92rem" }}>{children}</p>
    </div>
  );
}

const NAV_LINKS = [
  { href: "#producto", label: "landing.nav.producto" },
  { href: "#automatizaciones", label: "landing.nav.automatizaciones" },
  { href: "#seguridad", label: "landing.nav.seguridad" },
  { href: "#planes", label: "landing.nav.planes" },
  { href: "#faq", label: "landing.nav.faq" },
];

function LandingNav({ onEnterLogin, onOpenDemo }) {
  const [open, setOpen] = useState(false);
  const { lang } = useLang();
  const tx = key => t(key, lang);
  return (
    <header onKeyDown={event => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        event.currentTarget.querySelector(".cp04-landing-nav-mobile-toggle")?.focus();
      }
    }} style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,13,.86)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.fontDisplay, fontWeight: 900, fontSize: "1.1rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.accent, boxShadow: `0 0 10px ${T.accent}` }} />
          Club Pádel 04
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 28, flex: 1, justifyContent: "center", transform: "translateY(17px)" }} className="cp04-landing-nav-desktop">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{ color: T.textDim, textDecoration: "none", fontSize: ".9rem", fontWeight: 600 }}>{tx(l.label)}</a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="cp04-landing-nav-desktop">
          <LandingBtn variant="ghost" onClick={onEnterLogin}>{tx("login.sign_in")}</LandingBtn>
          <LandingBtn variant="primary" onClick={onOpenDemo}>{tx("landing.planes.cta")}</LandingBtn>
        </div>
        <button
          type="button"
          aria-label={open ? tx("landing.nav.close_menu") : tx("landing.nav.open_menu")}
          aria-expanded={open}
          aria-controls="cp04-public-mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="cp04-landing-nav-mobile-toggle"
          style={{ display: "none", background: "transparent", border: "none", color: T.text, cursor: "pointer" }}
        >
          {open ? <IconClose size={26} /> : <IconMenu size={26} />}
        </button>
      </Container>
      {open && (
        <div id="cp04-public-mobile-menu" className="cp04-landing-nav-mobile-panel" style={{ borderTop: `1px solid ${T.line}`, background: T.bg, padding: "18px 24px 26px", display: "grid", gap: 14 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ color: T.text, textDecoration: "none", fontWeight: 700 }}>{tx(l.label)}</a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <LandingBtn variant="secondary" onClick={onEnterLogin} style={{ flex: 1, justifyContent: "center" }}>{tx("login.sign_in")}</LandingBtn>
            <LandingBtn variant="primary" onClick={onOpenDemo} style={{ flex: 1, justifyContent: "center" }}>{tx("landing.planes.cta")}</LandingBtn>
          </div>
        </div>
      )}
    </header>
  );
}

function MockupPanel() {
  // Mockup de la app real (no un inventario técnico): reutiliza la misma
  // identidad visual (T) que Inicio() en la app autenticada, con datos de
  // ejemplo explícitamente marcados como tal.
  const { lang } = useLang();
  const tx = key => t(key, lang);
  return (
    <div style={{ borderRadius: 28, border: `1px solid rgba(182,255,0,.22)`, background: `linear-gradient(160deg,rgba(11,17,29,.97),rgba(47,107,255,.1)), radial-gradient(circle at 80% 0%, rgba(182,255,0,.18), transparent 45%)`, padding: "clamp(18px,3vw,26px)", boxShadow: "0 30px 90px rgba(0,0,0,.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <strong style={{ fontFamily: T.fontDisplay, fontSize: "1rem" }}>{tx("landing.mockup.panel_title")}</strong>
        <span style={{ fontSize: ".68rem", color: T.textDim, border: `1px solid ${T.line}`, borderRadius: 999, padding: "3px 10px" }}>{tx("landing.mockup.demo_badge")}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "landing.mockup.stat_reservas", value: "12" },
          { label: "landing.mockup.stat_ocupacion", value: "79%" },
          { label: "landing.mockup.stat_socios", value: "143" },
          { label: "landing.mockup.stat_ingresos", value: "4.820€" },
        ].map((k) => (
          <div key={k.label} style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${T.line}`, borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ color: T.textDim, fontSize: ".68rem", marginBottom: 4 }}>{tx(k.label)}</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "1.35rem", fontWeight: 900 }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${T.line}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <IconCheck size={18} color={T.accent} />
        <span style={{ fontSize: ".82rem", color: T.textDim }}>{tx("landing.mockup.release_pista")}</span>
      </div>
    </div>
  );
}

const PROBLEM_KEYS = ["one", "two", "three", "four"];

const PROBLEMAS = [
  { icon: <IconClock />, problema: "Recepción saturada al teléfono confirmando horas", solucion: "Reserva de pistas disponible 24/7 desde el móvil, sin llamadas." },
  { icon: <IconCalendar />, problema: "Dobles reservas entre distintas agendas del club", solucion: "Un único calendario sincronizado que evita choques de horario." },
  { icon: <IconBell />, problema: "Horas canceladas que se quedan vacías", solucion: "Lista de espera automática: recupera esa hora sin gestión manual." },
  { icon: <IconChartBar />, problema: "Dirección sin visibilidad real del negocio", solucion: "Un panel con ocupación, ingresos y actividad al día, sin hojas de cálculo." },
];

const PRODUCTO_SECCIONES = [
  { id: "reservas", icon: <IconCalendar />, title: "Reservas inteligentes", body: "Los jugadores reservan pista online a cualquier hora. El sistema evita huecos duplicados y confirma al instante." },
  { id: "gestion", icon: <IconUsers />, title: "Gestión del club", body: "Altas y bajas de socios, cierres temporales de pista por mantenimiento o eventos, todo desde un mismo panel de staff." },
  { id: "jugador", icon: <IconTrophy />, title: "Experiencia del jugador", body: "Cada jugador ve sus reservas, su ranking, sus torneos y su lista de espera — sin depender de llamar al club." },
  { id: "qr", icon: <IconQrCode />, title: "Control de acceso con QR", body: "Cada reserva genera un código de acceso. Menos trabajo de recepción, menos colas en la entrada." },
  { id: "torneos", icon: <IconTrophy />, title: "Torneos y comunidad", body: "Inscripciones, cuadros, resultados y ranking en vivo — el club organiza competiciones sin hojas sueltas." },
  { id: "metricas", icon: <IconChartBar />, title: "Métricas para dirección", body: "Ocupación por pista, ingresos estimados y actividad de socios, siempre actualizado." },
];

const INTEGRACIONES = [
  { name: "Cloudflare", desc: "cloudflare" },
  { name: "Supabase", desc: "supabase" },
  { name: "Airtable", desc: "airtable" },
  { name: "Google Calendar", desc: "google_calendar" },
];

const INTEGRACIONES_FUTURAS = [
  { name: "Pagos online (Stripe)", desc: "stripe" },
  { name: "WhatsApp Business", desc: "whatsapp" },
];

const SEGURIDAD_KEYS = ["sesion_protegida", "permisos_rol", "privacidad"];

const SEGURIDAD_ITEMS = [
  { icon: <IconLock />, title: "Sesión protegida", body: "El token de sesión de larga duración vive en una cookie HttpOnly — nunca accesible desde JavaScript ni guardado en el navegador en claro." },
  { icon: <IconShieldCheck />, title: "Permisos por rol", body: "Cada usuario ve solo lo que su rol permite (jugador, staff, administración, soporte). Denegado por defecto." },
  { icon: <IconUsers />, title: "Privacidad incorporada", body: "Gestión de solicitudes de acceso y baja de datos personales integrada, no un trámite aparte." },
];

const TESTIMONIOS_KEYS = ["one", "two"];

const TESTIMONIOS = [
  { nombre: "Club de ejemplo A", cargo: "Dirección", texto: "Testimonio de ejemplo: dejamos de perder horas por llamadas cruzadas y ahora vemos la ocupación real cada semana." },
  { nombre: "Club de ejemplo B", cargo: "Recepción", texto: "Testimonio de ejemplo: el control de acceso por QR nos quitó las colas de la entrada en fin de semana." },
];

const PLANES_KEYS = ["starter", "club", "multi_club"];

const PLANES = [
  { nombre: "Starter", precio: "Consultar", desc: "Para un club con una o dos pistas empezando a digitalizar reservas.", items: ["Reservas online", "Lista de espera", "Panel básico"] },
  { nombre: "Club", precio: "Consultar", desc: "El plan más habitual: operación diaria completa.", destacado: true, items: ["Todo Starter", "Control de acceso QR", "Torneos y ranking", "Panel de dirección"] },
  { nombre: "Multi-club", precio: "Consultar", desc: "Para cadenas o gestoras con varias instalaciones.", items: ["Todo Club", "Varios clubes", "Soporte prioritario"] },
];

const FAQ_KEYS = ["datos_reales", "instalacion", "probar", "baja", "puesta_marcha"];

const FAQ = [
  { q: "¿Los datos de reservas son reales o de ejemplo?", a: "Esta landing y sus paneles de demostración usan datos de ejemplo. Al contratar, tu club opera con sus propios datos reales desde el primer día." },
  { q: "¿Necesito instalar algo?", a: "No. Es una aplicación web: funciona en el navegador del móvil, tablet u ordenador de recepción." },
  { q: "¿Puedo probarlo antes de decidir?", a: "Sí, solicita una demo y te mostramos el panel de tu rol (dirección, staff o jugador) con tus propios casos de uso." },
  { q: "¿Qué pasa con mis datos si me doy de baja?", a: "La gestión de privacidad está integrada: puedes solicitar acceso o eliminación de tus datos desde la propia plataforma." },
  { q: "¿Cuánto tarda la puesta en marcha?", a: "Depende del número de pistas y de si migras datos de otro sistema. Se concreta en la demo." },
];

const AUTOMATIZACIONES_KEYS = ["item_1", "item_2", "item_3", "item_4"];

// COMPARATIVA (Fase 1 UX 2026-09-21): gestión manual vs gestión con Club
// Pádel 04. Patrón comercial breve y visual — no copia estructura sectorial
// externa, solo el concepto de comparativa por filas con check/cross.
const COMPARATIVA_KEYS = ["reservas", "espera", "acceso", "informes"];

const COMPARATIVA = [
  { aspecto: "Reservar pista", manual: "Llamadas y WhatsApp en horario de recepción", cp04: "Reserva online 24/7 desde el móvil, confirmación inmediata" },
  { aspecto: "Pista cancelada", manual: "Hueco vacío hasta que alguien llama", cp04: "La lista de espera la reofrece automáticamente" },
  { aspecto: "Acceso al club", manual: "Comprobar listas a mano en la entrada", cp04: "QR por reserva: entrada sin colas ni papeles" },
  { aspecto: "Saber cómo va el club", manual: "Hojas de cálculo desactualizadas", cp04: "Ocupación, ingresos y actividad siempre al día" },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.line}`, padding: "18px 0" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "transparent", border: "none", color: T.text, cursor: "pointer", textAlign: "left", padding: 0, fontFamily: T.fontBody }}
      >
        <strong style={{ fontSize: "1rem" }}>{q}</strong>
        <span style={{ color: T.accent, fontSize: "1.3rem", lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform .15s" }}>+</span>
      </button>
      {open && <p style={{ color: T.textDim, lineHeight: 1.7, marginTop: 12, marginBottom: 0, fontSize: ".92rem" }}>{a}</p>}
    </div>
  );
}

export default function Landing({ onEnterLogin }) {
  const [demoOpen, setDemoOpen] = useState(false);
  const lang = useLang();
  const tx = key => t(key, lang);

  return (
    <div className="cp04-public-landing saas-experience" style={{ background: T.bg, color: T.text, fontFamily: T.fontBody, minHeight: "100vh" }}>
      <style>{`
        .cp04-landing-nav-mobile-toggle { }
        @media (max-width: 860px) {
          .cp04-landing-nav-desktop { display: none !important; }
          .cp04-landing-nav-mobile-toggle { display: inline-flex !important; }
        }
      `}</style>

      <LandingNav onEnterLogin={onEnterLogin} onOpenDemo={() => setDemoOpen(true)} />

      {/* HERO */}
      <section id="cp04-public-hero" className="cp04-section cp04-section--hero">
        <LandingHeroBackground />
        <Container style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(32px,5vw,56px)", alignItems: "center" }}>
          <div className="cp04-hero-copy">
            <Eyebrow>{tx("landing.hero.eyebrow")}</Eyebrow>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(2.4rem,6vw,4.2rem)", lineHeight: .98, letterSpacing: "-.05em", margin: "0 0 20px" }}>
              {tx("landing.hero.title")} <span style={{ color: T.accent }}>{tx("landing.hero.title_accent")}</span>
            </h1>
            <p style={{ color: T.textDim, fontSize: "clamp(1rem,1.6vw,1.15rem)", lineHeight: 1.75, maxWidth: 560, margin: "0 0 30px" }}>
              {tx("landing.hero.subtitle")}
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <LandingBtn variant="primary" onClick={() => setDemoOpen(true)}>{tx("landing.planes.cta")} <IconArrowRight size={18} /></LandingBtn>
              <LandingBtn variant="secondary" href="#producto">{tx("landing.hero.cta_secondary")}</LandingBtn>
              <LandingBtn variant="ghost" onClick={onEnterLogin}>{tx("landing.hero.cta_disponibilidad")}</LandingBtn>
            </div>
          </div>
          <div className="cp04-hero-direction"><MockupPanel /></div>
        </Container>
      </section>

      {/* PROBLEMAS QUE RESUELVE */}
      <section className="cp04-section cp04-section--problemas">
        <Container>
          <SectionTitle eyebrow={tx("landing.problem.eyebrow")} title={tx("landing.problem.title")} align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {PROBLEMAS.map((p, index) => (
              <div key={p.problema} style={{ padding: 22, borderRadius: 20, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.03)" }}>
                <div style={{ color: T.accent, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ color: T.textDim, fontSize: ".82rem", textDecoration: "line-through", marginBottom: 8 }}>{tx(`landing.problem.${PROBLEM_KEYS[index]}.before`)}</div>
                <div style={{ fontWeight: 700, fontSize: ".92rem", lineHeight: 1.5 }}>{tx(`landing.problem.${PROBLEM_KEYS[index]}.after`)}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ZONA DE VÍDEOS · D.png (night court) */}
      <LandingMedia blocked={demoOpen} />

      {/* COMPARATIVA: manual vs Club Pádel 04 (Fase 1 UX) */}
      <section id="comparativa" className="cp04-section cp04-section--comparativa">
        <Container>
          <SectionTitle eyebrow={tx("landing.comparativa.eyebrow")} title={tx("landing.comparativa.title")} subtitle={tx("landing.comparativa.subtitle")} align="center" />
          <div style={{ borderRadius: 22, border: `1px solid ${T.line}`, overflow: "hidden", background: "rgba(255,255,255,.02)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(120px,1fr) minmax(150px,1.4fr) minmax(150px,1.4fr)", background: "rgba(255,255,255,.04)", borderBottom: `1px solid ${T.line}`, fontFamily: T.fontDisplay, fontWeight: 800, fontSize: ".8rem" }}>
              <div style={{ padding: "14px 16px", color: T.textDim }}></div>
              <div style={{ padding: "14px 16px", color: T.textDim }}>{tx("landing.comparativa.col_manual")}</div>
              <div style={{ padding: "14px 16px", color: T.accent, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}` }} />
                Club Pádel 04
              </div>
            </div>
            {COMPARATIVA.map((row, index) => (
              <div key={row.aspecto} style={{ display: "grid", gridTemplateColumns: "minmax(120px,1fr) minmax(150px,1.4fr) minmax(150px,1.4fr)", borderBottom: index < COMPARATIVA.length - 1 ? `1px solid ${T.line}` : "none" }}>
                <div style={{ padding: "14px 16px", fontWeight: 700, fontSize: ".84rem" }}>{tx(`landing.comparativa.${COMPARATIVA_KEYS[index]}.aspecto`)}</div>
                <div style={{ padding: "14px 16px", color: T.textDim, fontSize: ".84rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <span aria-hidden="true" style={{ color: T.textDim, fontSize: ".9rem", lineHeight: 1 }}>✕</span>
                  {tx(`landing.comparativa.${COMPARATIVA_KEYS[index]}.manual`)}
                </div>
                <div style={{ padding: "14px 16px", fontSize: ".84rem", display: "flex", alignItems: "center", gap: 8, background: "rgba(182,255,0,.04)" }}>
                  <IconCheck size={15} color={T.accent} style={{ flexShrink: 0 }} />
                  {tx(`landing.comparativa.${COMPARATIVA_KEYS[index]}.cp04`)}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PRODUCTO: reservas / gestión / jugador / qr / torneos / métricas */}
      <section id="producto" className="cp04-section cp04-section--producto">
        <Container>
          <SectionTitle eyebrow={tx("landing.product.eyebrow")} title={tx("landing.product.title")} subtitle={tx("landing.product.desc")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
            {PRODUCTO_SECCIONES.map((s) => (
              <div key={s.id} id={s.id}>
                <FeatureCard icon={s.icon} title={tx(`landing.product.${s.id}.title`)}>{tx(`landing.product.${s.id}.body`)}</FeatureCard>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* AUTOMATIZACIONES */}
      <section id="automatizaciones" className="cp04-section cp04-section--automatizaciones">
        <Container style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <Eyebrow>{tx("landing.automatizaciones.eyebrow")}</Eyebrow>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.9rem,4vw,2.6rem)", lineHeight: 1.08, letterSpacing: "-.03em", margin: "0 0 16px" }}>{tx("landing.automatizaciones.title")}</h2>
            <p style={{ color: T.textDim, lineHeight: 1.75, marginBottom: 22 }}>
              {tx("landing.automatizaciones.body")}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
              {AUTOMATIZACIONES_KEYS.map((key) => (
                <li key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: T.textDim, fontSize: ".92rem" }}>
                  <IconCheck size={18} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                  {tx(`landing.automatizaciones.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ borderRadius: 24, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.03)", padding: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, color: T.accent }}>
              <IconBolt size={22} />
              <strong style={{ fontFamily: T.fontDisplay }}>{tx("landing.automatizaciones.motor_title")}</strong>
            </div>
            <p style={{ color: T.textDim, fontSize: ".88rem", lineHeight: 1.7 }}>
              {tx("landing.automatizaciones.motor_body")}
            </p>
          </div>
        </Container>
      </section>

      {/* INTEGRACIONES — franja estándar (antes --dark, para alternar con Seguridad) */}
      <section className="cp04-section cp04-section--integraciones">
        <Container>
          <SectionTitle eyebrow={tx("landing.integraciones.eyebrow")} title={tx("landing.integraciones.title")} align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 18 }}>
            {INTEGRACIONES.map((i) => (
              <div key={i.name} style={{ padding: "18px 20px", borderRadius: 16, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.03)", display: "flex", alignItems: "center", gap: 12 }}>
                <IconPlug size={20} color={T.accent} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: ".9rem" }}>{i.name}</div>
                  <div style={{ color: T.textDim, fontSize: ".76rem" }}>{tx(`landing.integraciones.${i.desc}.desc`)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            {INTEGRACIONES_FUTURAS.map((i) => (
              <div key={i.name} style={{ padding: "18px 20px", borderRadius: 16, border: `1px dashed ${T.line}`, opacity: .7, display: "flex", alignItems: "center", gap: 12 }}>
                <IconClock size={20} color={T.textDim} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: ".9rem" }}>{i.name}</div>
                  <div style={{ color: T.textDim, fontSize: ".76rem" }}>{tx(`landing.integraciones.${i.desc}.desc`)}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SEGURIDAD / GDPR */}
      <section id="seguridad" className="cp04-section cp04-section--dark">
        <Container>
          <SectionTitle eyebrow={tx("landing.seguridad.eyebrow")} title={tx("landing.seguridad.title")} align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {SEGURIDAD_ITEMS.map((s, index) => (
              <FeatureCard key={s.title} icon={s.icon} title={tx(`landing.seguridad.${SEGURIDAD_KEYS[index]}.title`)}>{tx(`landing.seguridad.${SEGURIDAD_KEYS[index]}.body`)}</FeatureCard>
            ))}
          </div>
        </Container>
      </section>

      {/* TESTIMONIOS (DEMO) */}
      <section className="cp04-section cp04-section--testimonios">
        <Container>
          <SectionTitle eyebrow={tx("landing.testimonios.eyebrow")} title={tx("landing.testimonios.title")} subtitle={tx("landing.testimonios.subtitle")} align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 18 }}>
            {TESTIMONIOS.map((t, index) => (
              <div key={t.nombre} style={{ padding: 24, borderRadius: 20, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.03)", position: "relative" }}>
                <span style={{ position: "absolute", top: 14, right: 18, fontSize: ".64rem", color: T.warning, border: `1px solid ${T.warning}55`, borderRadius: 999, padding: "2px 9px", fontWeight: 800, letterSpacing: ".08em" }}>{tx("landing.testimonios.demo_badge")}</span>
                <p style={{ lineHeight: 1.7, color: T.text, marginTop: 6 }}>&ldquo;{tx(`landing.testimonios.${TESTIMONIOS_KEYS[index]}.texto`)}&rdquo;</p>
                <div style={{ marginTop: 14, fontWeight: 800, fontSize: ".88rem" }}>{tx(`landing.testimonios.${TESTIMONIOS_KEYS[index]}.nombre`)}</div>
                <div style={{ color: T.textDim, fontSize: ".78rem" }}>{tx(`landing.testimonios.${TESTIMONIOS_KEYS[index]}.cargo`)}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PLANES */}
      <section id="planes" className="cp04-section cp04-section--dark">
        <Container>
          <SectionTitle eyebrow={tx("landing.planes.eyebrow")} title={tx("landing.planes.title")} subtitle={tx("landing.planes.subtitle")} align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {PLANES.map((p, index) => (
              <div key={p.nombre} style={{ padding: 26, borderRadius: 22, border: `1px solid ${p.destacado ? T.accent : T.line}`, background: p.destacado ? "linear-gradient(160deg, rgba(182,255,0,.09), rgba(255,255,255,.02))" : "rgba(255,255,255,.03)", position: "relative" }}>
                {p.destacado && (<span style={{ position: "absolute", top: -12, left: 24, background: T.accent, color: "#06100a", fontSize: ".68rem", fontWeight: 900, padding: "4px 12px", borderRadius: 999 }}>{tx("landing.planes.most_chosen")}</span>)}
                <strong style={{ fontFamily: T.fontDisplay, fontSize: "1.2rem", display: "block", marginBottom: 6 }}>{p.nombre}</strong>
                <div style={{ color: T.accent, fontWeight: 900, fontFamily: T.fontDisplay, fontSize: "1.3rem", marginBottom: 10 }}>{tx(`landing.planes.${PLANES_KEYS[index]}.price`)}</div>
                <p style={{ color: T.textDim, fontSize: ".86rem", lineHeight: 1.6, marginBottom: 18 }}>{tx(`landing.planes.${PLANES_KEYS[index]}.desc`)}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "grid", gap: 10 }}>
                  {p.items.map((item, fidx) => (
                    <li key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: ".84rem", color: T.textDim }}>
                      <IconCheck size={16} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                      {tx(`landing.planes.${PLANES_KEYS[index]}.feature_${fidx + 1}`)}
                    </li>
                  ))}
                </ul>
                <LandingBtn variant={p.destacado ? "primary" : "secondary"} onClick={() => setDemoOpen(true)} style={{ width: "100%", justifyContent: "center" }}>{tx("landing.planes.cta")}</LandingBtn>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CÓMO EMPEZAR (Fase 3A — ProcessSection de la Factory, contenido real del producto) */}
      <section id="como-empezar" className="cp04-section cp04-section--como-empezar">
        <Container>
          <SectionTitle eyebrow={tx("landing.como_empezar.eyebrow")} title={tx("landing.como_empezar.title")} subtitle={tx("landing.como_empezar.subtitle")} align="center" />
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {[
              { n: 1, t: tx("landing.como_empezar.paso_1.title"), b: tx("landing.como_empezar.paso_1.body") },
              { n: 2, t: tx("landing.como_empezar.paso_2.title"), b: tx("landing.como_empezar.paso_2.body") },
              { n: 3, t: tx("landing.como_empezar.paso_3.title"), b: tx("landing.como_empezar.paso_3.body") },
            ].map((paso) => (
              <li key={paso.n} style={{ padding: "clamp(20px,3vw,28px)", borderRadius: 22, border: `1px solid ${T.line}`, background: "linear-gradient(160deg, rgba(255,255,255,.045), rgba(255,255,255,.015))", position: "relative" }}>
                <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(182,255,0,.1)", border: "1px solid rgba(182,255,0,.25)", color: T.accent, display: "grid", placeItems: "center", fontWeight: 900, fontFamily: T.fontDisplay, marginBottom: 14 }}>
                  {paso.n}
                </div>
                <strong style={{ display: "block", fontSize: "1.05rem", marginBottom: 8, fontFamily: T.fontDisplay }}>{paso.t}</strong>
                <p style={{ color: T.textDim, lineHeight: 1.65, margin: 0, fontSize: ".92rem" }}>{paso.b}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* CONTACTO Y REDES (Fase 3A — solo si hay canales reales configurados) */}
      <ContactAndSocial
        title={tx("landing.contacto.title")}
        subtitle={tx("landing.contacto.subtitle")}
        tx={tx}
      />

      {/* DÓNDE ENCONTRARNOS (Fase 3B — dirección real del propietario) */}
      <PhysicalLocation
        title={tx("landing.donde.eyebrow")}
        subtitle={tx("landing.donde.title")}
        howToGetLabel={tx("landing.donde.como_llegar")}
        tx={tx}
      />

      {/* FAQ */}
      <section id="faq" className="cp04-section cp04-section--faq">
        <Container style={{ maxWidth: 760 }}>
          <SectionTitle eyebrow={tx("landing.faq.eyebrow")} title={tx("landing.faq.title")} align="center" />
          <div>
            {FAQ.map((f, index) => <FaqItem key={f.q} q={tx(`landing.faq.${FAQ_KEYS[index]}.question`)} a={tx(`landing.faq.${FAQ_KEYS[index]}.answer`)} />)}
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="cp04-section cp04-section--cta">
        <Container>
          <div style={{ borderRadius: 30, border: `1px solid rgba(182,255,0,.28)`, background: `linear-gradient(135deg, rgba(182,255,0,.1), rgba(47,107,255,.08))`, padding: "clamp(32px,6vw,56px)", textAlign: "center" }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.8rem,4vw,2.6rem)", letterSpacing: "-.03em", margin: "0 0 14px" }}>{tx("landing.cta_final.title")}</h2>
            <p style={{ color: T.textDim, maxWidth: 520, margin: "0 auto 26px", lineHeight: 1.7 }}>{tx("landing.cta_final.subtitle")}</p>
            <LandingBtn variant="primary" onClick={() => setDemoOpen(true)}>{tx("landing.planes.cta")} <IconArrowRight size={18} /></LandingBtn>
          </div>
        </Container>
      </section>

      {/* FOOTER enriquecido (Fase 1 UX): marca+tagline / navegación / contacto+acceso */}
      <footer style={{ borderTop: `1px solid ${T.line}`, padding: "44px 0 32px" }}>
        <Container>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 32, marginBottom: 28 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.fontDisplay, fontWeight: 900, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}` }} />
                Club Pádel 04
              </div>
              <p style={{ color: T.textDim, fontSize: ".82rem", lineHeight: 1.6, margin: 0, maxWidth: 260 }}>{tx("landing.footer.tagline")}</p>
              <div style={{ marginTop: 14 }}>
                <FooterSocial />
              </div>
            </div>
            <nav aria-label={tx("landing.footer.nav_label")} style={{ display: "grid", gap: 8, alignContent: "start" }}>
              <strong style={{ fontFamily: T.fontDisplay, fontSize: ".78rem", letterSpacing: ".12em", textTransform: "uppercase", color: T.textDim }}>{tx("landing.footer.nav_title")}</strong>
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} style={{ color: T.textDim, textDecoration: "none", fontSize: ".86rem" }}>{tx(l.label)}</a>
              ))}
            </nav>
            <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
              <strong style={{ fontFamily: T.fontDisplay, fontSize: ".78rem", letterSpacing: ".12em", textTransform: "uppercase", color: T.textDim }}>{tx("landing.footer.access_title")}</strong>
              <button type="button" onClick={onEnterLogin} style={{ background: "transparent", border: "none", color: T.text, fontSize: ".86rem", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, padding: 0, textAlign: "left" }}>
                {tx("landing.footer.clients_access")}
              </button>
              <button type="button" onClick={() => setDemoOpen(true)} style={{ background: "transparent", border: "none", color: T.textDim, fontSize: ".86rem", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, padding: 0, textAlign: "left" }}>
                {tx("landing.planes.cta")}
              </button>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center", color: T.textDim, fontSize: ".76rem" }}>
            <span>© {new Date().getFullYear()} Club Pádel 04</span>
            <span>{tx("landing.footer.legal_note")}</span>
          </div>
        </Container>
      </footer>

      {demoOpen && <DemoRequestModal onClose={() => setDemoOpen(false)} />}
    </div>
  );
}

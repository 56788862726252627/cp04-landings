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
import { T } from "../../theme.js";
import {
  IconCalendar, IconShieldCheck, IconUsers, IconChartBar, IconQrCode,
  IconTrophy, IconBolt, IconBell, IconClock, IconPlug, IconLock,
  IconArrowRight, IconMenu, IconClose, IconCheck,
} from "../icons/Icons.jsx";
import DemoRequestModal from "./DemoRequestModal.jsx";

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
  { href: "#producto", label: "Producto" },
  { href: "#automatizaciones", label: "Automatizaciones" },
  { href: "#seguridad", label: "Seguridad" },
  { href: "#planes", label: "Planes" },
  { href: "#faq", label: "FAQ" },
];

function LandingNav({ onEnterLogin, onOpenDemo }) {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,13,.86)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.fontDisplay, fontWeight: 900, fontSize: "1.1rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.accent, boxShadow: `0 0 10px ${T.accent}` }} />
          Club Pádel 04
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }} className="cp04-landing-nav-desktop">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{ color: T.textDim, textDecoration: "none", fontSize: ".9rem", fontWeight: 600 }}>{l.label}</a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="cp04-landing-nav-desktop">
          <LandingBtn variant="ghost" onClick={onEnterLogin}>Iniciar sesión</LandingBtn>
          <LandingBtn variant="primary" onClick={onOpenDemo}>Solicitar demo</LandingBtn>
        </div>
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="cp04-landing-nav-mobile-toggle"
          style={{ display: "none", background: "transparent", border: "none", color: T.text, cursor: "pointer" }}
        >
          {open ? <IconClose size={26} /> : <IconMenu size={26} />}
        </button>
      </Container>
      {open && (
        <div className="cp04-landing-nav-mobile-panel" style={{ borderTop: `1px solid ${T.line}`, background: T.bg, padding: "18px 24px 26px", display: "grid", gap: 14 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ color: T.text, textDecoration: "none", fontWeight: 700 }}>{l.label}</a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <LandingBtn variant="secondary" onClick={onEnterLogin} style={{ flex: 1, justifyContent: "center" }}>Iniciar sesión</LandingBtn>
            <LandingBtn variant="primary" onClick={onOpenDemo} style={{ flex: 1, justifyContent: "center" }}>Solicitar demo</LandingBtn>
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
  return (
    <div style={{ borderRadius: 28, border: `1px solid rgba(182,255,0,.22)`, background: `linear-gradient(160deg,rgba(11,17,29,.97),rgba(47,107,255,.1)), radial-gradient(circle at 80% 0%, rgba(182,255,0,.18), transparent 45%)`, padding: "clamp(18px,3vw,26px)", boxShadow: "0 30px 90px rgba(0,0,0,.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <strong style={{ fontFamily: T.fontDisplay, fontSize: "1rem" }}>Panel de dirección</strong>
        <span style={{ fontSize: ".68rem", color: T.textDim, border: `1px solid ${T.line}`, borderRadius: 999, padding: "3px 10px" }}>Datos de ejemplo</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Reservas hoy", value: "12" },
          { label: "Ocupación", value: "79%" },
          { label: "Socios activos", value: "143" },
          { label: "Ingresos del mes", value: "4.820€" },
        ].map((k) => (
          <div key={k.label} style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${T.line}`, borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ color: T.textDim, fontSize: ".68rem", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "1.35rem", fontWeight: 900 }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${T.line}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <IconCheck size={18} color={T.accent} />
        <span style={{ fontSize: ".82rem", color: T.textDim }}>Pista 2 liberada — lista de espera notificada automáticamente</span>
      </div>
    </div>
  );
}

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
  { name: "Cloudflare", desc: "Infraestructura y seguridad de borde" },
  { name: "Supabase", desc: "Autenticación real de usuarios" },
  { name: "Airtable", desc: "Base de datos operativa del club" },
  { name: "Google Calendar", desc: "Sincronización de reservas" },
];

const INTEGRACIONES_FUTURAS = [
  { name: "Pagos online (Stripe)", desc: "En hoja de ruta — aún no activo" },
  { name: "WhatsApp Business", desc: "En hoja de ruta — aún no activo" },
];

const SEGURIDAD_ITEMS = [
  { icon: <IconLock />, title: "Sesión protegida", body: "El token de sesión de larga duración vive en una cookie HttpOnly — nunca accesible desde JavaScript ni guardado en el navegador en claro." },
  { icon: <IconShieldCheck />, title: "Permisos por rol", body: "Cada usuario ve solo lo que su rol permite (jugador, staff, administración, soporte). Denegado por defecto." },
  { icon: <IconUsers />, title: "Privacidad incorporada", body: "Gestión de solicitudes de acceso y baja de datos personales integrada, no un trámite aparte." },
];

const TESTIMONIOS = [
  { nombre: "Club de ejemplo A", cargo: "Dirección", texto: "Testimonio de ejemplo: dejamos de perder horas por llamadas cruzadas y ahora vemos la ocupación real cada semana." },
  { nombre: "Club de ejemplo B", cargo: "Recepción", texto: "Testimonio de ejemplo: el control de acceso por QR nos quitó las colas de la entrada en fin de semana." },
];

const PLANES = [
  { nombre: "Starter", precio: "Consultar", desc: "Para un club con una o dos pistas empezando a digitalizar reservas.", items: ["Reservas online", "Lista de espera", "Panel básico"] },
  { nombre: "Club", precio: "Consultar", desc: "El plan más habitual: operación diaria completa.", destacado: true, items: ["Todo Starter", "Control de acceso QR", "Torneos y ranking", "Panel de dirección"] },
  { nombre: "Multi-club", precio: "Consultar", desc: "Para cadenas o gestoras con varias instalaciones.", items: ["Todo Club", "Varios clubes", "Soporte prioritario"] },
];

const FAQ = [
  { q: "¿Los datos de reservas son reales o de ejemplo?", a: "Esta landing y sus paneles de demostración usan datos de ejemplo. Al contratar, tu club opera con sus propios datos reales desde el primer día." },
  { q: "¿Necesito instalar algo?", a: "No. Es una aplicación web: funciona en el navegador del móvil, tablet u ordenador de recepción." },
  { q: "¿Puedo probarlo antes de decidir?", a: "Sí, solicita una demo y te mostramos el panel de tu rol (dirección, staff o jugador) con tus propios casos de uso." },
  { q: "¿Qué pasa con mis datos si me doy de baja?", a: "La gestión de privacidad está integrada: puedes solicitar acceso o eliminación de tus datos desde la propia plataforma." },
  { q: "¿Cuánto tarda la puesta en marcha?", a: "Depende del número de pistas y de si migras datos de otro sistema. Se concreta en la demo." },
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

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: T.fontBody, minHeight: "100vh" }}>
      <style>{`
        .cp04-landing-nav-mobile-toggle { }
        @media (max-width: 860px) {
          .cp04-landing-nav-desktop { display: none !important; }
          .cp04-landing-nav-mobile-toggle { display: inline-flex !important; }
        }
      `}</style>

      <LandingNav onEnterLogin={onEnterLogin} onOpenDemo={() => setDemoOpen(true)} />

      {/* HERO */}
      <section style={{ padding: "clamp(48px,8vw,96px) 0 clamp(40px,6vw,64px)", background: "radial-gradient(circle at 15% 0%, rgba(182,255,0,.14), transparent 38%), radial-gradient(circle at 85% 10%, rgba(47,107,255,.14), transparent 40%)" }}>
        <Container style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(32px,5vw,56px)", alignItems: "center" }}>
          <div>
            <Eyebrow>SaaS para clubes de pádel</Eyebrow>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(2.4rem,6vw,4.2rem)", lineHeight: .98, letterSpacing: "-.05em", margin: "0 0 20px" }}>
              Gestiona tu club. Llena tus pistas. <span style={{ color: T.accent }}>Fideliza a tus jugadores.</span>
            </h1>
            <p style={{ color: T.textDim, fontSize: "clamp(1rem,1.6vw,1.15rem)", lineHeight: 1.75, maxWidth: 560, margin: "0 0 30px" }}>
              Una única plataforma para reservas, jugadores, accesos, torneos, automatizaciones y operación diaria de tu club.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <LandingBtn variant="primary" onClick={() => setDemoOpen(true)}>Solicitar demo <IconArrowRight size={18} /></LandingBtn>
              <LandingBtn variant="secondary" href="#producto">Ver cómo funciona</LandingBtn>
            </div>
          </div>
          <MockupPanel />
        </Container>
      </section>

      {/* TRUST BAR */}
      <section style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, padding: "20px 0", background: "rgba(255,255,255,.02)" }}>
        <Container style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: T.textDim, fontSize: ".82rem" }}>Construido sobre infraestructura real: Cloudflare · Supabase · Airtable · Google Calendar</span>
          <span style={{ fontSize: ".72rem", color: T.textDim, border: `1px solid ${T.line}`, borderRadius: 999, padding: "4px 12px" }}>Vitrina con datos de ejemplo hasta el primer club real</span>
        </Container>
      </section>

      {/* PROBLEMAS QUE RESUELVE */}
      <section style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <Container>
          <SectionTitle eyebrow="El problema" title="Lo que hoy le cuesta tiempo a tu club" align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {PROBLEMAS.map((p) => (
              <div key={p.problema} style={{ padding: 22, borderRadius: 20, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.03)" }}>
                <div style={{ color: T.accent, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ color: T.textDim, fontSize: ".82rem", textDecoration: "line-through", marginBottom: 8 }}>{p.problema}</div>
                <div style={{ fontWeight: 700, fontSize: ".92rem", lineHeight: 1.5 }}>{p.solucion}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PRODUCTO: reservas / gestión / jugador / qr / torneos / métricas */}
      <section id="producto" style={{ padding: "clamp(56px,8vw,88px) 0", background: "rgba(255,255,255,.015)" }}>
        <Container>
          <SectionTitle eyebrow="Producto" title="Todo lo que necesita la operación diaria" subtitle="Cada módulo resuelve una parte del día a día del club — sin hojas de cálculo, sin llamadas cruzadas." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
            {PRODUCTO_SECCIONES.map((s) => (
              <div key={s.id} id={s.id}>
                <FeatureCard icon={s.icon} title={s.title}>{s.body}</FeatureCard>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* AUTOMATIZACIONES */}
      <section id="automatizaciones" style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <Container style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <Eyebrow>Automatizaciones</Eyebrow>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.9rem,4vw,2.6rem)", lineHeight: 1.08, letterSpacing: "-.03em", margin: "0 0 16px" }}>El club funciona solo mientras tú diriges</h2>
            <p style={{ color: T.textDim, lineHeight: 1.75, marginBottom: 22 }}>
              Recordatorios de reserva, avisos de lista de espera, confirmaciones de inscripción a torneos y alertas de incidencias suceden automáticamente, sin que nadie tenga que acordarse de enviarlos.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
              {["Recordatorio de reserva antes de la hora", "Aviso automático cuando se libera una pista", "Confirmación de inscripción a torneos", "Alertas si algo necesita atención humana"].map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: T.textDim, fontSize: ".92rem" }}>
                  <IconCheck size={18} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ borderRadius: 24, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.03)", padding: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, color: T.accent }}>
              <IconBolt size={22} />
              <strong style={{ fontFamily: T.fontDisplay }}>Motor de automatización</strong>
            </div>
            <p style={{ color: T.textDim, fontSize: ".88rem", lineHeight: 1.7 }}>
              Funciona sobre un motor de flujos verificado internamente antes de activarse en tu club — no es un prototipo, es la misma automatización que ya usa el club piloto.
            </p>
          </div>
        </Container>
      </section>

      {/* INTEGRACIONES */}
      <section style={{ padding: "clamp(56px,8vw,88px) 0", background: "rgba(255,255,255,.015)" }}>
        <Container>
          <SectionTitle eyebrow="Integraciones" title="Tecnología real, no una promesa" align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 18 }}>
            {INTEGRACIONES.map((i) => (
              <div key={i.name} style={{ padding: "18px 20px", borderRadius: 16, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.03)", display: "flex", alignItems: "center", gap: 12 }}>
                <IconPlug size={20} color={T.accent} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: ".9rem" }}>{i.name}</div>
                  <div style={{ color: T.textDim, fontSize: ".76rem" }}>{i.desc}</div>
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
                  <div style={{ color: T.textDim, fontSize: ".76rem" }}>{i.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SEGURIDAD / GDPR */}
      <section id="seguridad" style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <Container>
          <SectionTitle eyebrow="Seguridad" title="Seguridad y privacidad incorporadas, no añadidas después" align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {SEGURIDAD_ITEMS.map((s) => (
              <FeatureCard key={s.title} icon={s.icon} title={s.title}>{s.body}</FeatureCard>
            ))}
          </div>
        </Container>
      </section>

      {/* TESTIMONIOS (DEMO) */}
      <section style={{ padding: "clamp(56px,8vw,88px) 0", background: "rgba(255,255,255,.015)" }}>
        <Container>
          <SectionTitle eyebrow="Clubes" title="Lo que dirían clubes como el tuyo" subtitle="Testimonios de ejemplo mientras incorporamos los primeros clubes reales — se sustituirán por testimonios verificados." align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
            {TESTIMONIOS.map((t) => (
              <div key={t.nombre} style={{ padding: 24, borderRadius: 20, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.03)", position: "relative" }}>
                <span style={{ position: "absolute", top: 14, right: 18, fontSize: ".64rem", color: T.warning, border: `1px solid ${T.warning}55`, borderRadius: 999, padding: "2px 9px", fontWeight: 800, letterSpacing: ".08em" }}>DEMO</span>
                <p style={{ lineHeight: 1.7, color: T.text, marginTop: 6 }}>&ldquo;{t.texto}&rdquo;</p>
                <div style={{ marginTop: 14, fontWeight: 800, fontSize: ".88rem" }}>{t.nombre}</div>
                <div style={{ color: T.textDim, fontSize: ".78rem" }}>{t.cargo}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PLANES */}
      <section id="planes" style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <Container>
          <SectionTitle eyebrow="Planes" title="Un plan para cada tamaño de club" subtitle="Precios finales a medida del número de pistas y necesidades — se concretan en la demo." align="center" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {PLANES.map((p) => (
              <div key={p.nombre} style={{ padding: 26, borderRadius: 22, border: `1px solid ${p.destacado ? T.accent : T.line}`, background: p.destacado ? "linear-gradient(160deg, rgba(182,255,0,.09), rgba(255,255,255,.02))" : "rgba(255,255,255,.03)", position: "relative" }}>
                {p.destacado && <span style={{ position: "absolute", top: -12, left: 24, background: T.accent, color: "#06100a", fontSize: ".68rem", fontWeight: 900, padding: "4px 12px", borderRadius: 999 }}>MÁS ELEGIDO</span>}
                <strong style={{ fontFamily: T.fontDisplay, fontSize: "1.2rem", display: "block", marginBottom: 6 }}>{p.nombre}</strong>
                <div style={{ color: T.accent, fontWeight: 900, fontFamily: T.fontDisplay, fontSize: "1.3rem", marginBottom: 10 }}>{p.precio}</div>
                <p style={{ color: T.textDim, fontSize: ".86rem", lineHeight: 1.6, marginBottom: 18 }}>{p.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "grid", gap: 10 }}>
                  {p.items.map((item) => (
                    <li key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: ".84rem", color: T.textDim }}>
                      <IconCheck size={16} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <LandingBtn variant={p.destacado ? "primary" : "secondary"} onClick={() => setDemoOpen(true)} style={{ width: "100%", justifyContent: "center" }}>Solicitar demo</LandingBtn>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: "clamp(56px,8vw,88px) 0", background: "rgba(255,255,255,.015)" }}>
        <Container style={{ maxWidth: 760 }}>
          <SectionTitle eyebrow="Preguntas frecuentes" title="Antes de pedir la demo" align="center" />
          <div>
            {FAQ.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <Container>
          <div style={{ borderRadius: 30, border: `1px solid rgba(182,255,0,.28)`, background: `linear-gradient(135deg, rgba(182,255,0,.1), rgba(47,107,255,.08))`, padding: "clamp(32px,6vw,56px)", textAlign: "center" }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.8rem,4vw,2.6rem)", letterSpacing: "-.03em", margin: "0 0 14px" }}>¿Listo para digitalizar tu club?</h2>
            <p style={{ color: T.textDim, maxWidth: 520, margin: "0 auto 26px", lineHeight: 1.7 }}>Solicita una demo y te mostramos el panel de dirección, staff y jugador con casos reales de tu club.</p>
            <LandingBtn variant="primary" onClick={() => setDemoOpen(true)}>Solicitar demo <IconArrowRight size={18} /></LandingBtn>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${T.line}`, padding: "36px 0" }}>
        <Container style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.fontDisplay, fontWeight: 900 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
            Club Pádel 04
          </div>
          <div style={{ color: T.textDim, fontSize: ".78rem" }}>© {new Date().getFullYear()} Club Pádel 04 · SaaS para clubes de pádel</div>
          <button type="button" onClick={onEnterLogin} style={{ background: "transparent", border: "none", color: T.textDim, fontSize: ".82rem", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Acceso para clubes ya clientes
          </button>
        </Container>
      </footer>

      {demoOpen && <DemoRequestModal onClose={() => setDemoOpen(false)} />}
    </div>
  );
}

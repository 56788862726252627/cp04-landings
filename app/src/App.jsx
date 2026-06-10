import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Club Pádel 04 · SaaS App segura
 *
 * Versión saneada para repositorio público:
 * - No contiene webhooks reales de Make.
 * - No contiene API keys, tokens ni credenciales.
 * - El frontend envía a un endpoint seguro propio: /api/reservas.
 * - La integración con Make/Airtable/Stripe debe hacerse en backend, Edge Function,
 *   server action, Cloudflare Worker o API route usando variables de entorno privadas.
 */

const T = {
  bg: "#05080d",
  surface: "#0b111d",
  surface2: "#111a2b",
  surface3: "#18243a",
  accent: "#b6ff00",
  accent2: "#20e3b2",
  primary: "#2f6bff",
  text: "#ffffff",
  textDim: "#9aa8bd",
  line: "rgba(255,255,255,0.10)",
  danger: "#ff5e3a",
  warning: "#ffad47",
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'DM Sans', sans-serif",
};

const CONFIG = {
  appName: "Club Pádel 04",
  club: "Club Pádel 04",
  origen: "github_safe_frontend",
  bookingEndpoint: import.meta?.env?.VITE_CP04_PUBLIC_BOOKING_ENDPOINT || "/api/reservas",
  contactEmail: import.meta?.env?.VITE_CP04_PUBLIC_CONTACT_EMAIL || "CONFIGURAR_EMAIL_PUBLICO",
  contactPhone: import.meta?.env?.VITE_CP04_PUBLIC_CONTACT_PHONE || "CONFIGURAR_TELEFONO_PUBLICO",
};

const COURTS = [
  { id: 1, name: "Pista 1", type: "Cristal Pro", price60: 10, price90: 18, price120: 24 },
  { id: 2, name: "Pista 2", type: "Cristal Pro", price60: 10, price90: 18, price120: 24 },
  { id: 3, name: "Pista 3", type: "Cristal Central", price60: 12, price90: 20, price120: 26 },
  { id: 4, name: "Pista 4", type: "Cristal Central", price60: 12, price90: 20, price120: 26 },
];

const BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const BOOKING_DURATIONS = [60, 90, 120];
const BOOKING_MODALITIES = ["libre", "partido", "clase", "torneo"];
const BOOKING_LEVELS = ["iniciacion", "intermedio", "avanzado", "competicion"];

const BOOKINGS = [
  { id: "RES-001", player: "Jugador Demo 1", court: "Pista 1", date: "2026-06-10", time: "10:00", status: "confirmed", price: 18 },
  { id: "RES-002", player: "Jugadora Demo 2", court: "Pista 3", date: "2026-06-10", time: "12:00", status: "pending", price: 12 },
  { id: "RES-003", player: "Jugador Demo 3", court: "Pista 2", date: "2026-06-09", time: "18:00", status: "completed", price: 18 },
];

const RANKING = [
  { pos: 1, name: "Jugador Demo 1", elo: 3.85, cat: "3ª FAP", wins: 12, losses: 3 },
  { pos: 2, name: "Jugador Demo 2", elo: 3.72, cat: "3ª FAP", wins: 10, losses: 4 },
  { pos: 3, name: "Jugadora Demo 3", elo: 3.61, cat: "4ª FAP", wins: 9, losses: 5 },
];

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;700;800&display=swap');
  * { box-sizing: border-box; }
  html { background: ${T.bg}; }
  body { margin: 0; min-width: 320px; background: radial-gradient(circle at 20% 0%, rgba(182,255,0,.12), transparent 30%), radial-gradient(circle at 86% 12%, rgba(47,107,255,.22), transparent 36%), linear-gradient(145deg, #05080d 0%, #08111f 48%, #05080d 100%); color: ${T.text}; font-family: ${T.fontBody}; }
  body::before { content: ""; position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 56px 56px; mask-image: linear-gradient(to bottom, rgba(0,0,0,.6), transparent 72%); }
  input, select, textarea { background: rgba(5,8,13,.72); border: 1px solid ${T.line}; color: ${T.text}; border-radius: 14px; padding: 13px 15px; width: 100%; outline: none; min-height: 46px; box-shadow: inset 0 1px 0 rgba(255,255,255,.03); transition: border-color .18s ease, box-shadow .18s ease, background .18s ease; }
  textarea { min-height: 118px; resize: vertical; }
  input::placeholder, textarea::placeholder { color: rgba(154,168,189,.72); }
  input:focus, select:focus, textarea:focus { background: rgba(11,17,29,.94); border-color: ${T.accent}; box-shadow: 0 0 0 4px rgba(182,255,0,.16), 0 18px 40px rgba(0,0,0,.22); }
  button:focus-visible { outline: 3px solid rgba(182,255,0,.9); outline-offset: 3px; }
  h1, h2, h3 { text-wrap: balance; }
  p { margin-top: 0; }
  code { color: ${T.accent}; background: rgba(182,255,0,.08); border: 1px solid rgba(182,255,0,.18); border-radius: 8px; padding: 2px 7px; }
  .cp04-layout { min-height: 100vh; display: grid; grid-template-columns: 292px minmax(0,1fr); }
  .cp04-main { min-width: 0; }
  .cp04-sidebar { position: sticky; top: 0; height: 100vh; padding: 24px; border-right: 1px solid ${T.line}; background: linear-gradient(180deg, rgba(10,16,28,.96), rgba(5,8,13,.90)); overflow: auto; backdrop-filter: blur(18px); }
  .cp04-mobilebar { display: none; }
  .cp04-overlay { display: none; }
  .cp04-sidebar-close { display: none; }
  .cp04-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 24px; }
  .cp04-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; }
  .cp04-card { position: relative; overflow: hidden; background: linear-gradient(150deg, rgba(17,26,43,.94), rgba(8,13,23,.94)); border: 1px solid rgba(255,255,255,.11); border-radius: 26px; padding: 24px; box-shadow: 0 22px 70px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.05); }
  .cp04-card::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 16% 0%, rgba(182,255,0,.08), transparent 32%); }
  .cp04-card > * { position: relative; }
  .cp04-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; transition: transform .18s ease, box-shadow .18s ease, filter .18s ease, border-color .18s ease; }
  .cp04-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); box-shadow: 0 14px 32px rgba(0,0,0,.24); }
  .cp04-badge { display: inline-flex; align-items: center; max-width: 100%; white-space: nowrap; line-height: 1; }
  .cp04-table-wrap { overflow-x: auto; }
  .cp04-table { width: 100%; min-width: 620px; border-collapse: collapse; }
  .cp04-table th, .cp04-table td { padding: 16px 18px; border-bottom: 1px solid ${T.line}; text-align: left; }
  .cp04-table th { color: ${T.textDim}; font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; }
  @media (max-width: 1180px) { .cp04-grid-3 { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 980px) { .cp04-layout { grid-template-columns: 1fr; padding-top: 66px; } .cp04-mobilebar { position: fixed; z-index: 60; top: 0; left: 0; right: 0; height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-bottom: 1px solid ${T.line}; background: rgba(7,10,14,.88); backdrop-filter: blur(18px); } .cp04-menu-button { background: linear-gradient(135deg, ${T.accent}, ${T.accent2}); color: #06100a; border: 0; border-radius: 14px; padding: 10px 14px; font-family: ${T.fontDisplay}; font-weight: 900; cursor: pointer; } .cp04-sidebar-close { display: block; } .cp04-sidebar { position: fixed; z-index: 80; inset: 0 auto 0 0; width: min(88vw, 340px); height: 100dvh; visibility: hidden; transform: translateX(-105%); transition: transform .22s ease, visibility .22s ease; border-right: 1px solid ${T.line}; border-bottom: 0; box-shadow: 24px 0 80px rgba(0,0,0,.45); } .cp04-sidebar[data-open="true"] { visibility: visible; transform: translateX(0); } .cp04-overlay { display: block; position: fixed; z-index: 70; inset: 0; background: rgba(0,0,0,.62); border: 0; padding: 0; cursor: pointer; } .cp04-grid-2, .cp04-grid-3 { grid-template-columns: 1fr; } }
  @media (max-width: 640px) { .cp04-card { border-radius: 22px; padding: 19px; } .cp04-table th, .cp04-table td { padding: 13px 14px; } }
`;

function calcTimeEnd(time, mins) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function priceFor(courtName, duration) {
  const court = COURTS.find((c) => c.name === courtName);
  return court?.[`price${duration}`] || 0;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function validateBooking(form, courtName) {
  const errors = {};
  const duration = Number(form.duracion_minutos);
  const selectedDate = form.fecha ? new Date(`${form.fecha}T00:00:00`) : null;
  const today = new Date(`${todayISO()}T00:00:00`);

  if (cleanText(form.nombre).length < 2) errors.nombre = "Introduce un nombre válido.";
  if (cleanText(form.apellidos).length < 2) errors.apellidos = "Introduce apellidos válidos.";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Introduce un email válido.";
  if (form.telefono.replace(/\D/g, "").length < 9) errors.telefono = "Introduce un teléfono válido.";
  if (!form.fecha) errors.fecha = "Selecciona una fecha.";
  else if (selectedDate < today) errors.fecha = "La fecha no puede ser anterior a hoy.";
  if (!BOOKING_HOURS.includes(form.hora)) errors.hora = "Selecciona una hora disponible.";
  if (!BOOKING_DURATIONS.includes(duration)) errors.duracion_minutos = "Selecciona una duración válida.";
  if (!COURTS.some((court) => court.name === courtName)) errors.pista = "Selecciona una pista válida.";
  if (!BOOKING_MODALITIES.includes(form.modalidad)) errors.modalidad = "Selecciona una modalidad válida.";
  if (!BOOKING_LEVELS.includes(form.nivel)) errors.nivel = "Selecciona un nivel válido.";

  return errors;
}

function prepareBookingPayload(form, courtName) {
  const duration = Number(form.duracion_minutos);
  const horaFin = calcTimeEnd(form.hora, duration);
  const price = priceFor(courtName, duration);

  return {
    accion: "crear_reserva",
    club: CONFIG.club,
    origen: CONFIG.origen,
    jugador: {
      nombre: cleanText(form.nombre),
      apellidos: cleanText(form.apellidos),
      email: form.email.trim().toLowerCase(),
      telefono: form.telefono.trim(),
    },
    reserva: {
      fecha: form.fecha,
      hora: form.hora,
      hora_fin: horaFin,
      duracion_minutos: duration,
      pista: courtName,
      modalidad: form.modalidad,
      nivel: form.nivel,
      precio_total: price,
      comentarios: form.comentarios.trim(),
    },
  };
}

async function sendBooking(payload) {
  const res = await fetch(CONFIG.bookingEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

function Card({ children, style = {} }) {
  return <div className="cp04-card" style={style}>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", disabled = false, type = "button", style = {} }) {
  const map = {
    primary: { background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#06100a", border: "none", boxShadow: "0 16px 36px rgba(182,255,0,.18)" },
    secondary: { background: "rgba(255,255,255,.055)", color: T.text, border: `1px solid ${T.line}` },
    danger: { background: "rgba(255,94,58,.12)", color: T.danger, border: "1px solid rgba(255,94,58,.30)" },
  };
  return <button className="cp04-btn" type={type} onClick={onClick} disabled={disabled} style={{ ...map[variant], padding: "12px 20px", borderRadius: 15, fontFamily: T.fontDisplay, fontWeight: 900, letterSpacing: "-.01em", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .55 : 1, ...style }}>{children}</button>;
}

function SectionTitle({ eyebrow, title, desc }) {
  return <div style={{ marginBottom: 30 }}>{eyebrow && <div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".18em", fontSize: ".76rem", textTransform: "uppercase", marginBottom: 10 }}>{eyebrow}</div>}<h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(2rem,4vw,3.1rem)", lineHeight: .96, margin: 0, letterSpacing: "-.055em" }}>{title}</h2>{desc && <p style={{ color: T.textDim, lineHeight: 1.75, maxWidth: 760, marginTop: 14, fontSize: "1.02rem" }}>{desc}</p>}</div>;
}

function Badge({ status }) {
  const map = { confirmed: ["Confirmada", T.accent], pending: ["Pendiente", T.warning], completed: ["Completada", T.textDim] };
  const [label, color] = map[status] || map.pending;
  return <span className="cp04-badge" style={{ color, background: "rgba(255,255,255,.07)", border: `1px solid ${color}44`, borderRadius: 999, padding: "7px 11px", fontSize: ".74rem", fontWeight: 900 }}>{label}</span>;
}

function FieldError({ children }) {
  if (!children) return null;
  return <div style={{ color: T.danger, fontSize: ".82rem", marginTop: 6 }}>{children}</div>;
}

function Sidebar({ current, mobileOpen, onNavigate, onClose }) {
  const items = [["inicio", "Inicio", "🏠"], ["reservas", "Reservar", "🎾"], ["gestion", "Reservas", "📅"], ["ranking", "Ranking", "🏆"], ["admin", "Admin", "📊"], ["soporte", "Soporte", "🛠️"]];
  return <aside id="cp04-mobile-menu" className="cp04-sidebar" data-open={mobileOpen ? "true" : "false"} aria-label="Navegación principal"><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 26 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 12, height: 12, borderRadius: "50%", background: T.accent, boxShadow: `0 0 18px ${T.accent}` }} /><div><div style={{ fontFamily: T.fontDisplay, fontWeight: 900 }}>CLUB PÁDEL 04</div><div style={{ color: T.textDim, fontSize: ".78rem" }}>SaaS seguro</div></div></div><button className="cp04-menu-button cp04-sidebar-close" type="button" onClick={onClose} aria-label="Cerrar menú">Cerrar</button></div><nav style={{ display: "grid", gap: 8 }}>{items.map(([id, label, icon]) => <button key={id} onClick={() => onNavigate(id)} aria-current={current === id ? "page" : undefined} aria-label={`Ir a ${label}`} style={{ display: "flex", gap: 10, width: "100%", background: current === id ? T.accent : "transparent", color: current === id ? "#07090e" : T.textDim, border: `1px solid ${current === id ? T.accent : T.line}`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", fontWeight: 900 }}><span aria-hidden="true">{icon}</span><span>{label}</span></button>)}</nav><Card style={{ marginTop: 22, padding: 16 }}><strong style={{ color: T.accent }}>Modo seguro</strong><p style={{ color: T.textDim, fontSize: ".84rem", lineHeight: 1.5, marginBottom: 0 }}>Sin webhooks ni claves privadas en frontend.</p></Card></aside>;
}

function Inicio({ setCurrent }) {
  return <div style={{ padding: "clamp(30px,5vw,62px) 24px", maxWidth: 1220, margin: "0 auto" }}><section style={{ minHeight: "min(720px,72vh)", display: "grid", alignItems: "center", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(24px,4vw,54px)" }}><div><div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: T.accent, fontWeight: 900, letterSpacing: ".18em", fontSize: ".78rem", textTransform: "uppercase", marginBottom: 18, padding: "8px 12px", border: `1px solid rgba(182,255,0,.22)`, borderRadius: 999, background: "rgba(182,255,0,.07)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent }} />SaaS premium · reservas inteligentes</div><h1 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(3.1rem,8vw,6.4rem)", lineHeight: .86, margin: 0, letterSpacing: "-.075em" }}>Club de pádel<br /><span style={{ color: T.accent }}>con IA</span></h1><p style={{ color: T.textDim, fontSize: "clamp(1rem,2vw,1.18rem)", lineHeight: 1.78, maxWidth: 680, marginTop: 22 }}>Reservas, CRM, torneos, ranking ELO, automatizaciones, paneles internos e integraciones preparadas para Make, Airtable, Stripe, WhatsApp y Google Calendar.</p><div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 30 }}><Btn onClick={() => setCurrent("reservas")}>🎾 Reservar pista</Btn><Btn variant="secondary" onClick={() => setCurrent("admin")}>Ver panel SaaS</Btn></div></div><Card style={{ minHeight: 360, display: "grid", alignContent: "space-between", background: `linear-gradient(160deg,rgba(17,26,43,.96),rgba(47,107,255,.13)), radial-gradient(circle at 70% 0%, rgba(182,255,0,.22), transparent 34%)` }}><div><Badge status="confirmed" /><h3 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.8rem,4vw,2.55rem)", lineHeight: 1, letterSpacing: "-.05em", margin: "22px 0 14px" }}>Reserva segura</h3><p style={{ color: T.textDim, lineHeight: 1.72 }}>El frontend envía a <code>/api/reservas</code>. Desde ahí conectas Make/Airtable sin exponer secretos.</p></div><div style={{ height: 150, borderRadius: 24, border: `1px solid ${T.line}`, background: `linear-gradient(135deg,rgba(182,255,0,.22),rgba(47,107,255,.14)), repeating-linear-gradient(90deg,rgba(255,255,255,.13) 0 1px,transparent 1px 32px)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)" }} aria-label="Visual abstracto de pista de pádel" /></Card></section><div className="cp04-grid-3"><Card><h3 style={{ marginTop: 0 }}>4 pistas</h3><p style={{ color: T.textDim, lineHeight: 1.6 }}>Cristal Pro y Central.</p></Card><Card><h3 style={{ marginTop: 0 }}>CRM + Ranking</h3><p style={{ color: T.textDim, lineHeight: 1.6 }}>Paneles preparados para datos reales.</p></Card><Card><h3 style={{ marginTop: 0 }}>Integraciones</h3><p style={{ color: T.textDim, lineHeight: 1.6 }}>Make, Airtable, Stripe, WhatsApp y Google Calendar en backend.</p></Card></div></div>;
}

function Reservas() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("pending");
  const [errors, setErrors] = useState({});
  const [court, setCourt] = useState("Pista 1");
  const [form, setForm] = useState({ nombre: "", apellidos: "", email: "", telefono: "", fecha: "", hora: "10:00", duracion_minutos: "90", modalidad: "libre", nivel: "intermedio", comentarios: "" });
  const duration = Number(form.duracion_minutos);
  const horaFin = calcTimeEnd(form.hora, duration);
  const price = priceFor(court, duration);
  const payload = useMemo(() => prepareBookingPayload(form, court), [form, court]);
  const sending = status === "sending";
  const statusMap = {
    pending: ["Pendiente", "Completa los datos y revisa el resumen antes de confirmar.", T.warning],
    sending: ["Enviando", "Estamos enviando la solicitud al endpoint seguro de reservas.", T.warning],
    success: ["Éxito", "Reserva enviada correctamente. Queda pendiente de confirmación por backend.", T.accent],
    error: ["Error", "No se pudo enviar. Revisa los datos o configura /api/reservas en backend.", T.danger],
  };
  const [statusTitle, statusText, statusColor] = statusMap[status];

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status !== "sending") setStatus("pending");
  }

  function review() {
    const nextErrors = validateBooking(form, court);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }
    setStatus("pending");
    setStep(2);
  }

  async function send() {
    if (sending) return;
    const nextErrors = validateBooking(form, court);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setStep(1);
      return;
    }

    setStatus("sending");
    try {
      await sendBooking(payload);
      setStatus("success");
      setStep(3);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  function newBooking() {
    setStep(1);
    setStatus("pending");
    setErrors({});
  }

  return <div style={{ padding: "42px 24px", maxWidth: 1040, margin: "0 auto" }}><SectionTitle eyebrow="Reservas" title="Reservar pista" desc="Formulario preparado para backend seguro. No expone Make ni credenciales en el navegador." /><Card style={{ marginBottom: 20, borderColor: statusColor, color: statusColor }}><strong>{statusTitle}</strong><div style={{ color: T.textDim, marginTop: 6 }}>{statusText}</div></Card>{step === 1 && <div className="cp04-grid-2"><Card><h3>Datos del jugador</h3><input placeholder="Nombre" value={form.nombre} onChange={(e) => updateForm("nombre", e.target.value)} autoComplete="given-name" /><FieldError>{errors.nombre}</FieldError><br /><input placeholder="Apellidos" value={form.apellidos} onChange={(e) => updateForm("apellidos", e.target.value)} autoComplete="family-name" /><FieldError>{errors.apellidos}</FieldError><br /><input placeholder="Email" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} autoComplete="email" /><FieldError>{errors.email}</FieldError><br /><input placeholder="Teléfono" value={form.telefono} onChange={(e) => updateForm("telefono", e.target.value)} autoComplete="tel" /><FieldError>{errors.telefono}</FieldError><br /><select value={form.modalidad} onChange={(e) => updateForm("modalidad", e.target.value)}>{BOOKING_MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}</select><FieldError>{errors.modalidad}</FieldError><br /><select value={form.nivel} onChange={(e) => updateForm("nivel", e.target.value)}>{BOOKING_LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}</select><FieldError>{errors.nivel}</FieldError><br /><textarea placeholder="Comentarios" value={form.comentarios} onChange={(e) => updateForm("comentarios", e.target.value)} /></Card><Card><h3>Fecha, hora y pista</h3><input type="date" min={todayISO()} value={form.fecha} onChange={(e) => updateForm("fecha", e.target.value)} /><FieldError>{errors.fecha}</FieldError><br /><select value={form.hora} onChange={(e) => updateForm("hora", e.target.value)}>{BOOKING_HOURS.map((h) => <option key={h} value={h}>{h}</option>)}</select><FieldError>{errors.hora}</FieldError><br /><select value={form.duracion_minutos} onChange={(e) => updateForm("duracion_minutos", e.target.value)}>{BOOKING_DURATIONS.map((mins) => <option key={mins} value={mins}>{mins} minutos</option>)}</select><FieldError>{errors.duracion_minutos}</FieldError><br /><div className="cp04-grid-2">{COURTS.map((c) => <Btn key={c.id} variant={court === c.name ? "primary" : "secondary"} disabled={sending} onClick={() => setCourt(c.name)}>{c.name}</Btn>)}</div><FieldError>{errors.pista}</FieldError><Card style={{ background: T.bg, marginTop: 16 }}>Hora fin: <strong style={{ color: T.accent }}>{horaFin}</strong> · Total: <strong style={{ color: T.accent }}>{price}€</strong></Card><Btn disabled={sending} onClick={review} style={{ width: "100%", marginTop: 16 }}>Ver resumen</Btn></Card></div>}{step === 2 && <Card style={{ maxWidth: 620, margin: "0 auto" }}><h3>Resumen</h3><p style={{ color: T.textDim }}>{payload.jugador.nombre} {payload.jugador.apellidos} · {payload.jugador.email} · {payload.jugador.telefono}</p><p>{payload.reserva.fecha} · {payload.reserva.hora}-{payload.reserva.hora_fin} · {payload.reserva.pista} · {payload.reserva.duracion_minutos} min</p><p style={{ color: T.textDim }}>Modalidad: {payload.reserva.modalidad} · Nivel: {payload.reserva.nivel}</p><h2 style={{ color: T.accent }}>{payload.reserva.precio_total}€</h2><div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><Btn variant="secondary" disabled={sending} onClick={() => setStep(1)}>Editar</Btn><Btn disabled={sending} onClick={send}>{sending ? "Enviando..." : "Confirmar"}</Btn></div></Card>}{step === 3 && <Card style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}><h3>Reserva registrada</h3><p style={{ color: T.textDim }}>La confirmación real dependerá del backend y de las integraciones configuradas.</p><Btn onClick={newBooking}>Nueva reserva</Btn></Card>}</div>;
}

function Gestion() {
  return <div style={{ padding: "42px 24px" }}><SectionTitle eyebrow="Gestión" title="Reservas" desc="Datos demo. Sustituir por backend real." /><div style={{ display: "grid", gap: 12 }}>{BOOKINGS.map((b) => <Card key={b.id} style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}><div><strong>{b.player}</strong><div style={{ color: T.textDim }}>{b.id} · {b.court} · {b.date} · {b.time}</div></div><div><strong style={{ color: T.accent }}>{b.price}€</strong> <Badge status={b.status} /></div></Card>)}</div></div>;
}

function Ranking() {
  return <div style={{ padding: "42px 24px" }}><SectionTitle eyebrow="Ranking" title="Ranking ELO" desc="Preparado para resultados reales." /><Card><div className="cp04-table-wrap"><table className="cp04-table"><thead><tr><th>Pos</th><th>Jugador</th><th>ELO</th><th>Categoría</th><th>V</th><th>D</th></tr></thead><tbody>{RANKING.map((p) => <tr key={p.pos}><td>{p.pos}</td><td><strong>{p.name}</strong></td><td style={{ color: T.accent, fontWeight: 900 }}>{p.elo}</td><td>{p.cat}</td><td>{p.wins}</td><td>{p.losses}</td></tr>)}</tbody></table></div></Card></div>;
}

function Admin() {
  return <div style={{ padding: "42px 24px" }}><SectionTitle eyebrow="Admin" title="Panel de control" desc="Métricas e integraciones pendientes de conectar en backend." /><div className="cp04-grid-3"><Card><h3>Ingresos mes</h3><strong style={{ color: T.accent, fontSize: 28 }}>4820€</strong></Card><Card><h3>Reservas</h3><strong style={{ color: T.accent, fontSize: 28 }}>268</strong></Card><Card><h3>Ocupación</h3><strong style={{ color: T.accent, fontSize: 28 }}>87%</strong></Card></div><Card style={{ marginTop: 24 }}><h3>Integraciones</h3>{["Make", "Airtable", "Stripe", "WhatsApp", "Google Calendar", "Google Drive"].map((name) => <p key={name} style={{ color: T.warning }}>● {name}: pendiente de variables privadas en backend</p>)}</Card></div>;
}

function Soporte() {
  return <div style={{ padding: "42px 24px" }}><SectionTitle eyebrow="Soporte técnico" title="Seguridad y variables" desc="Panel técnico protegido por rol en producción." /><Card><pre style={{ overflow: "auto", color: T.textDim, background: T.bg, padding: 16, borderRadius: 14 }}>{`MAKE_RESERVAS_WEBHOOK=privado_en_backend\nAIRTABLE_API_KEY=privado_en_backend\nSTRIPE_SECRET_KEY=privado_en_backend\nWHATSAPP_PROVIDER_TOKEN=privado_en_backend\nGOOGLE_CALENDAR_CREDENTIALS=privado_en_backend\nVITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas`}</pre></Card></div>;
}

export default function ClubPadel04SaaSApp() {
  const [current, setCurrent] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const modules = { inicio: <Inicio setCurrent={setCurrent} />, reservas: <Reservas />, gestion: <Gestion />, ranking: <Ranking />, admin: <Admin />, soporte: <Soporte /> };

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  function navigate(section) {
    setCurrent(section);
    setMobileMenuOpen(false);
  }

  return <><style>{globalStyles}</style><div className="cp04-mobilebar"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: T.accent }} /><strong style={{ fontFamily: T.fontDisplay }}>CLUB PÁDEL 04</strong></div><button ref={menuButtonRef} className="cp04-menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú de navegación" aria-controls="cp04-mobile-menu" aria-expanded={mobileMenuOpen}>Menú</button></div>{mobileMenuOpen && <button className="cp04-overlay" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú de navegación" />}<div className="cp04-layout"><Sidebar current={current} mobileOpen={mobileMenuOpen} onNavigate={navigate} onClose={() => setMobileMenuOpen(false)} /><main className="cp04-main">{modules[current]}</main></div></>;
}

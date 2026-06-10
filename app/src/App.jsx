import { useMemo, useState } from "react";

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
  bg: "#070a0e",
  surface: "#0e121e",
  surface2: "#161c2e",
  accent: "#b6ff00",
  primary: "#0052cc",
  text: "#ffffff",
  textDim: "#94a3b8",
  line: "rgba(255,255,255,0.08)",
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
  body { margin: 0; background: ${T.bg}; color: ${T.text}; font-family: ${T.fontBody}; }
  input, select, textarea { background: ${T.bg}; border: 1px solid ${T.line}; color: ${T.text}; border-radius: 12px; padding: 12px 14px; width: 100%; outline: none; }
  input:focus, select:focus, textarea:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px rgba(182,255,0,.18); }
  .cp04-layout { min-height: 100vh; display: grid; grid-template-columns: 280px 1fr; }
  .cp04-sidebar { position: sticky; top: 0; height: 100vh; padding: 22px; border-right: 1px solid ${T.line}; background: rgba(7,10,14,.92); overflow: auto; }
  .cp04-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .cp04-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; }
  .cp04-table { width: 100%; border-collapse: collapse; }
  .cp04-table th, .cp04-table td { padding: 14px 16px; border-bottom: 1px solid ${T.line}; text-align: left; }
  .cp04-table th { color: ${T.textDim}; font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; }
  @media (max-width: 980px) { .cp04-layout { grid-template-columns: 1fr; } .cp04-sidebar { position: relative; height: auto; border-right: 0; border-bottom: 1px solid ${T.line}; } .cp04-grid-2, .cp04-grid-3 { grid-template-columns: 1fr; } }
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
  return <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 22, padding: 24, ...style }}>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", disabled = false, type = "button", style = {} }) {
  const map = {
    primary: { background: T.accent, color: "#07090e", border: "none" },
    secondary: { background: T.surface2, color: T.text, border: `1px solid ${T.line}` },
    danger: { background: "rgba(255,94,58,.12)", color: T.danger, border: "1px solid rgba(255,94,58,.30)" },
  };
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...map[variant], padding: "12px 20px", borderRadius: 14, fontFamily: T.fontDisplay, fontWeight: 900, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .55 : 1, ...style }}>{children}</button>;
}

function SectionTitle({ eyebrow, title, desc }) {
  return <div style={{ marginBottom: 28 }}>{eyebrow && <div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".16em", fontSize: ".78rem", textTransform: "uppercase", marginBottom: 8 }}>{eyebrow}</div>}<h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(1.8rem,4vw,2.8rem)", margin: 0, letterSpacing: "-.04em" }}>{title}</h2>{desc && <p style={{ color: T.textDim, lineHeight: 1.7, maxWidth: 720 }}>{desc}</p>}</div>;
}

function Badge({ status }) {
  const map = { confirmed: ["Confirmada", T.accent], pending: ["Pendiente", T.warning], completed: ["Completada", T.textDim] };
  const [label, color] = map[status] || map.pending;
  return <span style={{ color, background: T.surface2, borderRadius: 999, padding: "5px 11px", fontSize: ".76rem", fontWeight: 900 }}>{label}</span>;
}

function FieldError({ children }) {
  if (!children) return null;
  return <div style={{ color: T.danger, fontSize: ".82rem", marginTop: 6 }}>{children}</div>;
}

function Sidebar({ current, setCurrent }) {
  const items = [["inicio", "Inicio", "🏠"], ["reservas", "Reservar", "🎾"], ["gestion", "Reservas", "📅"], ["ranking", "Ranking", "🏆"], ["admin", "Admin", "📊"], ["soporte", "Soporte", "🛠️"]];
  return <aside className="cp04-sidebar" aria-label="Navegación principal"><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}><span style={{ width: 12, height: 12, borderRadius: "50%", background: T.accent, boxShadow: `0 0 18px ${T.accent}` }} /><div><div style={{ fontFamily: T.fontDisplay, fontWeight: 900 }}>CLUB PÁDEL 04</div><div style={{ color: T.textDim, fontSize: ".78rem" }}>SaaS seguro</div></div></div><nav style={{ display: "grid", gap: 8 }}>{items.map(([id, label, icon]) => <button key={id} onClick={() => setCurrent(id)} aria-current={current === id ? "page" : undefined} style={{ display: "flex", gap: 10, width: "100%", background: current === id ? T.accent : "transparent", color: current === id ? "#07090e" : T.textDim, border: `1px solid ${current === id ? T.accent : T.line}`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", fontWeight: 900 }}><span>{icon}</span><span>{label}</span></button>)}</nav><Card style={{ marginTop: 22, padding: 16 }}><strong style={{ color: T.accent }}>Modo seguro</strong><p style={{ color: T.textDim, fontSize: ".84rem", lineHeight: 1.5, marginBottom: 0 }}>Sin webhooks ni claves privadas en frontend.</p></Card></aside>;
}

function Inicio({ setCurrent }) {
  return <div style={{ padding: "48px 24px", maxWidth: 1180, margin: "0 auto" }}><section style={{ minHeight: "65vh", display: "grid", alignItems: "center", gridTemplateColumns: "1.2fr .8fr", gap: 30 }}><div><div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".18em", fontSize: ".82rem", textTransform: "uppercase", marginBottom: 16 }}>SaaS premium · reservas inteligentes</div><h1 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(3rem,7vw,5.4rem)", lineHeight: .9, margin: 0, letterSpacing: "-.06em" }}>Club de pádel<br /><span style={{ color: T.accent }}>con IA</span></h1><p style={{ color: T.textDim, fontSize: "1.12rem", lineHeight: 1.75, maxWidth: 660 }}>Reservas, CRM, torneos, ranking ELO, automatizaciones, paneles internos e integraciones preparadas para Make, Airtable, Stripe, WhatsApp y Google Calendar.</p><div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}><Btn onClick={() => setCurrent("reservas")}>🎾 Reservar pista</Btn><Btn variant="secondary" onClick={() => setCurrent("admin")}>Ver panel SaaS</Btn></div></div><Card style={{ background: `linear-gradient(160deg,${T.surface},rgba(0,82,204,.10))` }}><Badge status="confirmed" /><h3 style={{ fontFamily: T.fontDisplay, fontSize: "1.7rem" }}>Reserva segura</h3><p style={{ color: T.textDim, lineHeight: 1.6 }}>El frontend envía a <code>/api/reservas</code>. Desde ahí conectas Make/Airtable sin exponer secretos.</p></Card></section><div className="cp04-grid-3"><Card><h3>4 pistas</h3><p style={{ color: T.textDim }}>Cristal Pro y Central.</p></Card><Card><h3>CRM + Ranking</h3><p style={{ color: T.textDim }}>Paneles preparados para datos reales.</p></Card><Card><h3>Integraciones</h3><p style={{ color: T.textDim }}>Make, Airtable, Stripe, WhatsApp y Google Calendar en backend.</p></Card></div></div>;
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
  return <div style={{ padding: "42px 24px" }}><SectionTitle eyebrow="Ranking" title="Ranking ELO" desc="Preparado para resultados reales." /><Card><table className="cp04-table"><thead><tr><th>Pos</th><th>Jugador</th><th>ELO</th><th>Categoría</th><th>V</th><th>D</th></tr></thead><tbody>{RANKING.map((p) => <tr key={p.pos}><td>{p.pos}</td><td><strong>{p.name}</strong></td><td style={{ color: T.accent }}>{p.elo}</td><td>{p.cat}</td><td>{p.wins}</td><td>{p.losses}</td></tr>)}</tbody></table></Card></div>;
}

function Admin() {
  return <div style={{ padding: "42px 24px" }}><SectionTitle eyebrow="Admin" title="Panel de control" desc="Métricas e integraciones pendientes de conectar en backend." /><div className="cp04-grid-3"><Card><h3>Ingresos mes</h3><strong style={{ color: T.accent, fontSize: 28 }}>4820€</strong></Card><Card><h3>Reservas</h3><strong style={{ color: T.accent, fontSize: 28 }}>268</strong></Card><Card><h3>Ocupación</h3><strong style={{ color: T.accent, fontSize: 28 }}>87%</strong></Card></div><Card style={{ marginTop: 24 }}><h3>Integraciones</h3>{["Make", "Airtable", "Stripe", "WhatsApp", "Google Calendar", "Google Drive"].map((name) => <p key={name} style={{ color: T.warning }}>● {name}: pendiente de variables privadas en backend</p>)}</Card></div>;
}

function Soporte() {
  return <div style={{ padding: "42px 24px" }}><SectionTitle eyebrow="Soporte técnico" title="Seguridad y variables" desc="Panel técnico protegido por rol en producción." /><Card><pre style={{ overflow: "auto", color: T.textDim, background: T.bg, padding: 16, borderRadius: 14 }}>{`MAKE_RESERVAS_WEBHOOK=privado_en_backend\nAIRTABLE_API_KEY=privado_en_backend\nSTRIPE_SECRET_KEY=privado_en_backend\nWHATSAPP_PROVIDER_TOKEN=privado_en_backend\nGOOGLE_CALENDAR_CREDENTIALS=privado_en_backend\nVITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas`}</pre></Card></div>;
}

export default function ClubPadel04SaaSApp() {
  const [current, setCurrent] = useState("inicio");
  const modules = { inicio: <Inicio setCurrent={setCurrent} />, reservas: <Reservas />, gestion: <Gestion />, ranking: <Ranking />, admin: <Admin />, soporte: <Soporte /> };
  return <><style>{globalStyles}</style><div className="cp04-layout"><Sidebar current={current} setCurrent={setCurrent} /><main>{modules[current]}</main></div></>;
}

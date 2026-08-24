import './tournament-module.css';
import './internal-module-backgrounds.css';
import './cp04-legibility-polish.css';
import './torcal-role-background.css';

const GALLERY_REAL_IMAGE_STYLES = `
  .cp04-gallery-card,
  .cp04-gallery-main,
  .cp04-gallery-side {
    position: relative !important;
    overflow: hidden !important;
    background-size: cover !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
  }

  .cp04-gallery-card img,
  .cp04-gallery-main img,
  .cp04-gallery-side img {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
    object-fit: cover !important;
    object-position: center center !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
`;



import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import LazyLoadBoundary from "./components/lazy/LazyLoadBoundary.jsx";
import { LazyCP04GuidedTutorial } from "./components/lazy/lazyGuidedTutorial.js";
import { useAuth } from "./auth/useAuth.js";
import { verifyDemoRolePassword } from "./auth/demoAuthAdapter.js";
import { authFetch } from "./auth/authService.js";
import { evaluateSlotAvailability, AVAILABILITY_STATUS } from "./utils/availability.js";
import { cp04BuildReservationError, cp04ReservationErrorMessage } from "./utils/reservationErrors.js";
import { cp04ShouldBlockAnonymousReservaSubmit, cp04IsSessionExpiredReservaResponse } from "./utils/reservaAuthGate.js";
import {
  CP04_ROLE_PERMISSIONS,
  CP04_PROTECTED_SECTIONS,
  cp04NormalizeRole,
  cp04CanAccessSection,
  cp04GetSafeStartSection,
} from "./utils/rbac.js";
import { cp04ComputeScreenState } from "./utils/screenState.js";
import { cp04Can } from "./utils/permissions.js";
import { computeMasterCounters } from "./data/makeMasterRegistry.js";
import {
  buildRoundRobinMatches,
  getRoundRobinRestingPairId,
  getRoundRobinTotalRounds,
  applyRoundRobinResult,
  computeRoundRobinStandings,
  sortRoundRobinStandings,
  isRoundRobinComplete,
  getRoundRobinChampion,
} from "./utils/roundRobin.js";
import { cp04ApplyScreenState } from "./cp04-apply-screen-state.js";
import { LazyCentroTecnico } from "./components/lazy/lazyCentroTecnico.js";
import { LazyComunidad } from "./components/lazy/lazyComunidad.js";
import { T } from "./theme.js";
/**
 * Club Pádel 04 · SaaS App segura
 *
 * Versión saneada para repositorio público:
 * - No contiene webhooks reales de Make.
 * - No contiene API keys, tokens ni credenciales.
 * - un endpoint seguro propio: /api/reservas.
 * - La integración con Make/Airtable/Stripe debe hacerse en backend, Edge Function,
 *   server action, Cloudflare Worker o API route usando variables de entorno privadas.
 */

// T (tokens de diseño) vive en ./theme.js: lo usan tanto App.jsx como
// componentes externos (p. ej. CentroTecnico.jsx) sin crear un import
// circular entre ambos.

const CONFIG = {
  appName: "Club Pádel 04",
  club: "Club Pádel 04",
  origen: "github_safe_frontend",
  bookingEndpoint: import.meta?.env?.VITE_CP04_PUBLIC_BOOKING_ENDPOINT || "/api/reservas",
  contactEmail: import.meta?.env?.VITE_CP04_PUBLIC_CONTACT_EMAIL || "Pendiente de configurar",
  contactPhone: import.meta?.env?.VITE_CP04_PUBLIC_CONTACT_PHONE || "Pendiente de configurar",
};

const GALLERY = [
  {
    key: "pistas",
    title: "Pistas",
    label: "Pistas Club Pádel 04",
    src: "/optimized/gallery/cp04/pistas.webp?v=cp04FotosSeparadasFinal2",
  },
  {
    key: "recepcion",
    title: "Recepción",
    label: "Recepción Club Pádel 04",
    src: "/optimized/gallery/cp04/recepcion.webp?v=cp04FotosSeparadasFinal2",
  },
  {
    key: "cafeteria",
    title: "Cafetería",
    label: "Cafetería Club Pádel 04",
    src: "/optimized/gallery/cp04/cafeteria.webp?v=cp04FotosSeparadasFinal2",
  },
  {
    key: "torneos",
    title: "Torneos",
    label: "Torneos Club Pádel 04",
    src: "/optimized/gallery/cp04/torneos.webp?v=cp04FotosSeparadasFinal2",
  },
  {
    key: "instalaciones",
    title: "Instalaciones",
    label: "Instalaciones Club Pádel 04",
    src: "/optimized/gallery/cp04/instalaciones.webp?v=cp04FotosSeparadasFinal2",
  },
];

const COURTS = [
  { id: 1, name: "Pista 1", type: "Cristal Pro", price60: 10, price90: 18, price120: 24 },
  { id: 2, name: "Pista 2", type: "Cristal Pro", price60: 10, price90: 18, price120: 24 },
  { id: 3, name: "Pista 3", type: "Cristal Central", price60: 12, price90: 20, price120: 26 },
  { id: 4, name: "Pista 4", type: "Cristal Central", price60: 12, price90: 20, price120: 26 },
];

const BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const BOOKING_DURATIONS = [60, 90, 120];
const BOOKING_MODALITIES = ["libre", "partido", "clase", "torneo"];
const BOOKING_LEVELS = ["iniciacion", "intermedio", "avanzado", "competicion"];

const RANKING_PRO = [
  { pos: 1, pareja: "García / Martínez", p1: "Carlos García", p2: "Pedro Martínez", pts: 1250, pj: 24, v: 19, d: 5, racha: 5, nivel: "Avanzado", cat: "Masculino", mov: 0, temporada: "2026" },
  { pos: 2, pareja: "López / Fernández", p1: "Ana López",     p2: "Elena Fernández", pts: 1180, pj: 22, v: 17, d: 5, racha: 3, nivel: "Avanzado", cat: "Femenino",  mov: 1, temporada: "2026" },
  { pos: 3, pareja: "Ruiz / Sánchez",   p1: "Javier Ruiz",   p2: "David Sánchez",  pts: 1120, pj: 20, v: 15, d: 5, racha: -2, nivel: "Avanzado", cat: "Masculino", mov: -1, temporada: "2026" },
  { pos: 4, pareja: "Torres / Navarro", p1: "Marta Torres",  p2: "Sofía Navarro",  pts: 1045, pj: 19, v: 14, d: 5, racha: 2, nivel: "Avanzado", cat: "Femenino",  mov: 2, temporada: "2026" },
  { pos: 5, pareja: "Moreno / Jiménez", p1: "Luis Moreno",   p2: "Óscar Jiménez",  pts: 990,  pj: 21, v: 13, d: 8, racha: 0, nivel: "Avanzado", cat: "Masculino", mov: -2, temporada: "2026" },
  { pos: 6, pareja: "Díaz / Romero",    p1: "Laura Díaz",    p2: "Isabel Romero",  pts: 920,  pj: 18, v: 12, d: 6, racha: 1, nivel: "Medio",    cat: "Femenino",  mov: 1, temporada: "2026" },
  { pos: 7, pareja: "Molina / Vega",    p1: "Miguel Molina", p2: "Raúl Vega",      pts: 870,  pj: 17, v: 11, d: 6, racha: -1, nivel: "Medio",   cat: "Masculino", mov: 0, temporada: "2026" },
  { pos: 8, pareja: "Herrero / Blanco", p1: "Patricia Herrero", p2: "Lucía Blanco", pts: 810, pj: 16, v: 10, d: 6, racha: 2, nivel: "Medio",    cat: "Mixto",     mov: 3, temporada: "2026" },
  { pos: 9, pareja: "Serrano / Cruz",   p1: "Álvaro Serrano", p2: "Roberto Cruz",  pts: 750,  pj: 16, v: 9, d: 7, racha: -1, nivel: "Medio",    cat: "Masculino", mov: -1, temporada: "2026" },
  { pos: 10, pareja: "Gil / Muñoz",     p1: "Carmen Gil",    p2: "Pilar Muñoz",   pts: 690,  pj: 15, v: 8, d: 7, racha: 1, nivel: "Medio",    cat: "Femenino",  mov: 0, temporada: "2026" },
  { pos: 11, pareja: "Marín / Ibáñez",  p1: "Pablo Marín",   p2: "Tomás Ibáñez",  pts: 620,  pj: 14, v: 7, d: 7, racha: 0, nivel: "Medio",    cat: "Masculino", mov: 1, temporada: "2026" },
  { pos: 12, pareja: "Ortiz / Delgado", p1: "Sandra Ortiz",  p2: "Nuria Delgado", pts: 560,  pj: 13, v: 6, d: 7, racha: -2, nivel: "Iniciación", cat: "Femenino", mov: -1, temporada: "2026" },
  { pos: 13, pareja: "Rubio / Castillo",p1: "Marcos Rubio",  p2: "Felipe Castillo",pts: 490, pj: 12, v: 5, d: 7, racha: 1, nivel: "Iniciación", cat: "Masculino", mov: 2, temporada: "2026" },
  { pos: 14, pareja: "Vargas / Méndez", p1: "Cristina Vargas",p2: "Jorge Méndez", pts: 420,  pj: 11, v: 4, d: 7, racha: 0, nivel: "Iniciación", cat: "Mixto",    mov: 0, temporada: "2026" },
  { pos: 15, pareja: "Guerrero / Reyes",p1: "Antonio Guerrero",p2: "Sergio Reyes",pts: 350, pj: 10, v: 3, d: 7, racha: -1, nivel: "Iniciación", cat: "Masculino", mov: -2, temporada: "2026" },
];

const INTEGRATIONS = [
  { name: "Automatización de procesos", status: "Activo", detail: "Canal interno seguro configurado", flow: "Reservas → Procesos → Base de datos" },
  { name: "Base de datos", status: "Preparado", detail: "Estructura documentada y validada", flow: "Procesos internos → Base de datos" },
  { name: "Pagos", status: "Listo para conexión", detail: "Reservas, bonos, membresías y torneos", flow: "Sistema → Pagos" },
  { name: "Notificaciones", status: "Listo para conexión", detail: "Confirmaciones y recordatorios automáticos", flow: "Sistema → Canal de mensajería" },
  { name: "Calendario", status: "Listo para conexión", detail: "Reservas, disponibilidad y eventos", flow: "Sistema → Calendario" },
  { name: "Documentación", status: "Activo", detail: "Backups e informes de operativa", flow: "Sistema → Almacenamiento" },
];

const ROLES = [
  { id: "PLAYER", label: "Jugador / cliente", access: "Activo", sections: "Inicio, Reservas, Ranking", permissions: ["Crear solicitud de reserva", "Consultar ranking del club", "Ver participación en torneos"] },
  { id: "STAFF", label: "Staff / recepción", access: "Activo", sections: "Gestión", permissions: ["Ver reservas", "Consultar disponibilidad", "Gestionar incidencias", "Ayudar a clientes"] },
  { id: "ADMIN", label: "Administrador / jefe", access: "Protegido", sections: "Admin", permissions: ["Ver métricas del club", "Gestionar pistas y clientes", "Configurar torneos", "Revisar procesos y automatizaciones"] },
  { id: "SUPPORT", label: "Soporte técnico", access: "Protegido", sections: "Soporte", permissions: ["Ver estado técnico", "Revisar configuración de conexiones", "Consultar registros del sistema", "Auditar integraciones"] },
];

const PROTECTED_SECTIONS = ["Gestión", "Admin", "Soporte"];

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
  .cp04-card { position: relative; overflow: hidden; background: linear-gradient(150deg, rgba(17,26,43,.94), rgba(8,13,15,.94)); border: 1px solid rgba(255,255,255,.11); border-radius: 26px; padding: 24px; box-shadow: 0 22px 70px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.05); }
  .cp04-card::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 16% 0%, rgba(182,255,0,.08), transparent 32%); }
  .cp04-card > * { position: relative; }
  .cp04-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; transition: transform .18s ease, box-shadow .18s ease, filter .18s ease, border-color .18s ease; }
  .cp04-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); box-shadow: 0 14px 32px rgba(0,0,0,.24); }
  .cp04-badge { display: inline-flex; align-items: center; max-width: 100%; white-space: nowrap; line-height: 1; }
  .cp04-table-wrap { overflow-x: auto; }
  .cp04-table { width: 100%; min-width: 620px; border-collapse: collapse; }
  .cp04-table th, .cp04-table td { padding: 16px 18px; border-bottom: 1px solid ${T.line}; text-align: left; }
  .cp04-table th { color: ${T.textDim}; font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; }
  .cp04-gallery { display: grid; grid-template-columns: 1.15fr .85fr; gap: 20px; align-items: stretch; }
  .cp04-gallery-side { display: grid; grid-template-columns: 1fr; gap: 20px; }
  .cp04-gallery-item { min-height: 230px; border-radius: 28px; overflow: hidden; position: relative; border: 1px solid ${T.line}; background: radial-gradient(circle at 20% 18%, rgba(182,255,0,.26), transparent 28%), linear-gradient(135deg, rgba(47,107,255,.18), rgba(17,26,43,.96)); }
  .cp04-gallery-item.featured { min-height: 480px; }
  .cp04-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cp04-gallery-fallback { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(182,255,0,.18), rgba(47,107,255,.12)), repeating-linear-gradient(90deg, rgba(255,255,255,.10) 0 1px, transparent 1px 34px); }
  .cp04-gallery-caption { position: absolute; left: 18px; right: 18px; bottom: 18px; padding: 14px 16px; border-radius: 18px; background: rgba(5,8,13,.74); border: 1px solid rgba(255,255,255,.12); backdrop-filter: blur(14px); }
  @media (max-width: 1180px) { .cp04-grid-3 { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 980px) { .cp04-layout { grid-template-columns: 1fr; padding-top: 66px; } .cp04-mobilebar { position: fixed; z-index: 60; top: 0; left: 0; right: 0; height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-bottom: 1px solid ${T.line}; background: rgba(7,10,14,.88); backdrop-filter: blur(18px); } .cp04-menu-button { background: linear-gradient(135deg, ${T.accent}, ${T.accent2}); color: #06100a; border: 0; border-radius: 14px; padding: 10px 14px; font-family: ${T.fontDisplay}; font-weight: 900; cursor: pointer; } .cp04-sidebar-close { display: block; } .cp04-sidebar { position: fixed; z-index: 80; inset: 0 auto 0 0; width: min(88vw, 340px); height: 100dvh; visibility: hidden; transform: translateX(-105%); transition: transform .22s ease, visibility .22s ease; border-right: 1px solid ${T.line}; border-bottom: 0; box-shadow: 24px 0 80px rgba(0,0,0,.45); } .cp04-sidebar[data-open="true"] { visibility: visible; transform: translateX(0); } .cp04-overlay { display: block; position: fixed; z-index: 70; inset: 0; background: rgba(0,0,0,.62); border: 0; padding: 0; cursor: pointer; } .cp04-grid-2, .cp04-grid-3, .cp04-gallery { grid-template-columns: 1fr; } .cp04-gallery-item.featured { min-height: 340px; } }
  @media (max-width: 640px) { .cp04-card { border-radius: 22px; padding: 19px; } .cp04-table th, .cp04-table td { padding: 13px 14px; } .cp04-gallery-item, .cp04-gallery-item.featured { min-height: 245px; border-radius: 22px; } }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
    .cp04-btn:hover:not(:disabled) { transform: none; }
  }
`;


const GALLERY_FORCE_STYLES = `
.cp04-gallery-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(8,13,15,.94);
  min-height: 220px;
}

.cp04-gallery-card img,
.cp04-gallery-img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
  object-position: center;
  border-radius: inherit;
}

.cp04-gallery-card::before {
  display: none !important;
}

.cp04-gallery-card .cp04-gallery-label,
.cp04-gallery-label {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 16px;
  z-index: 3;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(6,10,16,.88);
  backdrop-filter: blur(8px);
}

.cp04-gallery-label strong {
  display: block;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.15;
}

.cp04-gallery-label span {
  display: block;
  margin-top: 4px;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.2;
}
`;

function calcTimeEnd(time, mins) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function getAvailableDurationsForHour(hora) {
  if (!hora || !hora.includes(":")) return BOOKING_DURATIONS;
  const [h, m] = hora.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return BOOKING_DURATIONS;
  const startMins = h * 60 + m;
  return BOOKING_DURATIONS.filter((d) => startMins + d <= CLUB_CLOSING_MINUTES);
}

function priceFor(courtName, duration) {
  const court = COURTS.find((c) => c.name === courtName);
  return court?.[`price${duration}`] || 0;
}

const MADRID_TIME_ZONE = "Europe/Madrid";
const CLUB_CLOSING_MINUTES = 23 * 60;

function madridDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MADRID_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function todayISO() {
  const { year, month, day } = madridDateParts();
  return `${year}-${month}-${day}`;
}

function parseISODateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function isSundayISO(value) {
  const parts = parseISODateParts(value);
  if (!parts) return false;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay() === 0;
}

function isPastDateISO(value) {
  return Boolean(value) && value < todayISO();
}

// "Ahora" de Madrid, representado como un Date UTC cuyos campos coinciden
// con la hora local de Madrid (mismo truco que ya usa isSundayISO con
// Date.UTC): así evaluateSlotAvailability puede comparar por valores sin
// preocuparse de zonas horarias reales.
function madridNowAsUtcTrick() {
  const { year, month, day, hour, minute } = madridDateParts();
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
}

// Horario del club ya existente en el proyecto (BOOKING_HOURS/BOOKING_DURATIONS/
// CLUB_CLOSING_MINUTES): no se inventa ninguna franja nueva, solo se agrupa
// para pasarlo como config a evaluateSlotAvailability.
const CLUB_OPENING_HOURS = {
  closingMinutes: CLUB_CLOSING_MINUTES,
  allowedStartTimes: BOOKING_HOURS,
  allowedDurations: BOOKING_DURATIONS,
};

// Wrapper de compatibilidad: mantiene la firma y los valores de retorno que
// ya consumían validateBooking/validateReschedule/Reservas
// ("invalid"|"closed"|"past"|"outside_hours"|"available"), pero delega el
// cálculo real en evaluateSlotAvailability (src/utils/availability.js) para
// no duplicar las reglas de negocio. No comprueba ocupación (no recibe
// courtId ni existingBookings): igual que antes, la ocupación se evalúa
// aparte donde sí hay contexto de pista y reservas (CalendarioDisponibilidad).
function getSlotStatus(fecha, hora, duration = 90) {
  const { status, reason } = evaluateSlotAvailability({
    date: fecha,
    startTime: hora,
    durationMinutes: Number(duration),
    courtId: null,
    existingBookings: [],
    openingHours: CLUB_OPENING_HOURS,
    currentDateTime: madridNowAsUtcTrick(),
  });

  if (status === AVAILABILITY_STATUS.AVAILABLE) return "available";

  switch (reason) {
    case "club_closed":
      return "closed";
    case "past_time":
      return "past";
    case "insufficient_remaining_time":
    case "outside_opening_hours":
      return "outside_hours";
    default:
      return "invalid";
  }
}

function formatDateEs(value) {
  const parts = parseISODateParts(value);
  if (!parts) return value || "";
  return `${String(parts.day).padStart(2, "0")}/${String(parts.month).padStart(2, "0")}/${parts.year}`;
}

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function validateBooking(form, courtName, tx) {
  const errors = {};
  const duration = Number(form.duracion_minutos);
  const selectedDate = form.fecha ? new Date(`${form.fecha}T00:00:00`) : null;
  const today = new Date(`${todayISO()}T00:00:00`);

  const _t = typeof tx === "function" ? tx : (k => k);
  if (cleanText(form.nombre).length < 2) errors.nombre = _t("errors.nombre");
  if (cleanText(form.apellidos).length < 2) errors.apellidos = _t("errors.apellidos");
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = _t("errors.email");
  if (form.telefono.replace(/\D/g, "").length < 9) errors.telefono = _t("errors.telefono");
  if (!form.fecha) errors.fecha = _t("errors.fecha");
  else if (selectedDate < today) errors.fecha = _t("errors.fecha_pasado");
  else if (isSundayISO(form.fecha)) errors.fecha = _t("errors.fecha_domingo");
  if (!BOOKING_HOURS.includes(form.hora)) errors.hora = _t("errors.hora");
  if (!BOOKING_DURATIONS.includes(duration)) errors.duracion_minutos = _t("errors.duracion");
  if (!errors.fecha && !errors.hora && !errors.duracion_minutos) {
    const slotStatus = getSlotStatus(form.fecha, form.hora, duration);
    if (slotStatus === "past") errors.hora = _t("errors.hora_pasada");
    if (slotStatus === "outside_hours") errors.hora = _t("errors.hora_cierre");
    if (slotStatus === "closed") errors.fecha = _t("errors.fecha_domingo");
  }
  if (!COURTS.some((court) => court.name === courtName)) errors.pista = _t("errors.pista");
  if (!BOOKING_MODALITIES.includes(form.modalidad)) errors.modalidad = _t("errors.modalidad");
  if (!BOOKING_LEVELS.includes(form.nivel)) errors.nivel = _t("errors.nivel");

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

function validateReschedule(form, courtName, tx) {
  const _t = typeof tx === "function" ? tx : (k => k);
  const errors = {};
  const cleanKey = form.clave_reserva.trim();
  const duration = Number(form.duracion_minutos);
  const selectedDate = form.nueva_fecha_reserva
    ? new Date(`${form.nueva_fecha_reserva}T00:00:00`)
    : null;
  const today = new Date(`${todayISO()}T00:00:00`);

  if (!cleanKey) {
    errors.clave_reserva = _t("errors.clave");
  } else if (cleanKey.length < 8) {
    errors.clave_reserva = _t("errors.clave_incompleta");
  }

  if (!form.nueva_fecha_reserva) {
    errors.nueva_fecha_reserva = _t("errors.nueva_fecha");
  } else if (selectedDate < today) {
    errors.nueva_fecha_reserva = _t("errors.nueva_fecha_pasado");
  } else if (isSundayISO(form.nueva_fecha_reserva)) {
    errors.nueva_fecha_reserva = _t("errors.fecha_domingo");
  }

  if (!BOOKING_HOURS.includes(form.nueva_hora_inicio)) {
    errors.nueva_hora_inicio = _t("errors.hora");
  }

  if (!BOOKING_DURATIONS.includes(duration)) {
    errors.duracion_minutos = _t("errors.duracion");
  }

  if (!errors.nueva_fecha_reserva && !errors.nueva_hora_inicio && !errors.duracion_minutos) {
    const slotStatus = getSlotStatus(form.nueva_fecha_reserva, form.nueva_hora_inicio, duration);
    if (slotStatus === "past") errors.nueva_hora_inicio = _t("errors.hora_pasada");
    if (slotStatus === "outside_hours") errors.nueva_hora_inicio = _t("errors.hora_cierre");
    if (slotStatus === "closed") errors.nueva_fecha_reserva = _t("errors.fecha_domingo");
  }

  if (!COURTS.some((court) => court.name === courtName)) {
    errors.nueva_pista = _t("errors.pista");
  }

  if (!form.confirmado) {
    errors.confirmado = _t("errors.confirmado_reprog");
  }

  return errors;
}

function prepareReschedulePayload(form, courtName) {
  const duration = Number(form.duracion_minutos);
  const horaFin = calcTimeEnd(form.nueva_hora_inicio, duration);

  return {
    accion: "reprogramar_reserva",
    clave_reserva: form.clave_reserva.trim(),
    nueva_fecha_reserva: form.nueva_fecha_reserva,
    nueva_hora_inicio: form.nueva_hora_inicio,
    nueva_hora_fin: horaFin,
    nueva_pista: courtName,
    pista_nueva: courtName,
    club: CONFIG.club,
    origen: "app_publica_reprogramar_reserva",
  };
}

function Card({ children, style = {} }) {
  return <div className="cp04-card" style={style}>{children}</div>;
}

// PASO 07M (2026-07-19): `className` opcional, mezclada con la ya
// existente "cp04-btn" — por defecto (sin pasar className) el
// comportamiento es idéntico al de antes de este paso, para no afectar a
// ningún llamador existente.
function Btn({ children, onClick, variant = "primary", disabled = false, type = "button", style = {}, className = "" }) {
  const map = {
    primary: { background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#06100a", border: "none", boxShadow: "0 16px 36px rgba(182,255,0,.18)" },
    secondary: { background: "rgba(255,255,255,.055)", color: T.text, border: `1px solid ${T.line}` },
    danger: { background: "rgba(255,94,58,.12)", color: T.danger, border: "1px solid rgba(255,94,58,.30)" },
  };
  return <button className={`cp04-btn${className ? ` ${className}` : ""}`} type={type} onClick={onClick} disabled={disabled} style={{ ...map[variant], padding: "12px 20px", borderRadius: 15, fontFamily: T.fontDisplay, fontWeight: 900, letterSpacing: "-.01em", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .55 : 1, ...style }}>{children}</button>;
}


const DISPONIBILIDAD_ENDPOINT = "/api/disponibilidad";
const DISPONIBILIDAD_UPDATE_EVENT = "cp04:disponibilidad-actualizar";

async function readSafeResponse(res) {
  const text = await res.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

async function fetchDisponibilidad(fecha) {
  const params = new URLSearchParams({ fecha, t: String(Date.now()) });
  const res = await fetch(`${DISPONIBILIDAD_ENDPOINT}?${params.toString()}`);
  const data = await readSafeResponse(res);

  if (!res.ok || data?.ok === false) {
    throw new Error("availability_request_failed");
  }

  return data || {};
}

function emitDisponibilidadUpdate(fecha) {
  window.dispatchEvent(new CustomEvent(DISPONIBILIDAD_UPDATE_EVENT, { detail: { fecha } }));
}

function refreshDisponibilidadAfterChange(fecha) {
  emitDisponibilidadUpdate(fecha);
  window.setTimeout(() => emitDisponibilidadUpdate(fecha), 1500);
  window.setTimeout(() => emitDisponibilidadUpdate(fecha), 4000);
}

function CalendarioDisponibilidad({
  initialDate,
  selectedCourt,
  onSelectSlot,
  onDisponibilidadChange,
  duration = 90,
  title = "Calendario de disponibilidad",
  description = "Elige fecha, hora y pista disponibles.",
}) {
  const [fecha, setFecha] = useState(initialDate || todayISO());
  const [ocupadas, setOcupadas] = useState([]);
  const [ocupadasDetalle, setOcupadasDetalle] = useState([]);
  const [estado, setEstado] = useState("idle");
  const [mensaje, setMensaje] = useState("");
  const lastInitialDateRef = useRef(initialDate);

  const ocupadasSet = useMemo(() => new Set(ocupadas), [ocupadas]);
  const pistas = COURTS.map((c) => c.name);

  // existingBookings para evaluateSlotAvailability: se prefiere
  // ocupadas_detalle (hora_inicio + hora_fin reales, cuando el Worker ya lo
  // devuelve) para detectar solapamientos por intervalo real. Si el Worker
  // desplegado todavía no lo incluye, se cae a una aproximación derivada de
  // la lista plana `ocupadas` asumiendo que cada slot ocupado dura lo mismo
  // que la duración seleccionada actualmente — la misma limitación que ya
  // existía antes de este cambio, no una regresión nueva.
  const existingBookings = useMemo(() => {
    if (Array.isArray(ocupadasDetalle) && ocupadasDetalle.length > 0) {
      return ocupadasDetalle.map((item) => ({
        courtId: item.pista,
        date: item.fecha,
        startTime: item.hora_inicio,
        endTime: item.hora_fin || calcTimeEnd(item.hora_inicio, duration),
      }));
    }

    return ocupadas.map((clave) => {
      const [claveFecha, clavePista, claveHora] = clave.split("|");
      return {
        courtId: clavePista,
        date: claveFecha,
        startTime: claveHora,
        endTime: calcTimeEnd(claveHora, duration),
      };
    });
  }, [ocupadasDetalle, ocupadas, duration]);

  const consultarDisponibilidad = useCallback(async (fechaConsulta) => {
    if (!fechaConsulta) return;

    if (isSundayISO(fechaConsulta)) {
      setOcupadas([]);
      setOcupadasDetalle([]);
      setEstado("closed");
      setMensaje("Club cerrado los domingos · no se admiten reservas durante todo el día.");
      return;
    }

    if (isPastDateISO(fechaConsulta)) {
      setOcupadas([]);
      setOcupadasDetalle([]);
      setEstado("past");
      setMensaje("La fecha seleccionada ya ha pasado.");
      return;
    }

    setEstado("loading");
    setMensaje("");

    try {
      const data = await fetchDisponibilidad(fechaConsulta);

      if (data.cerrado === true) {
        setOcupadas([]);
        setOcupadasDetalle([]);
        setEstado("closed");
        setMensaje(data.motivo || "Club cerrado los domingos.");
        return;
      }

      setOcupadas(data.ocupadas || []);
      setOcupadasDetalle(Array.isArray(data.ocupadas_detalle) ? data.ocupadas_detalle : []);
      setEstado("success");
      setMensaje(`Disponibilidad actualizada · ${data.total || 0} slot(s) ocupado(s)`);
    } catch {
      setEstado("error");
      setMensaje("No se pudo actualizar la disponibilidad. Inténtalo de nuevo.");
      setOcupadas([]);
      setOcupadasDetalle([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => consultarDisponibilidad(fecha), 0);
    return () => window.clearTimeout(timer);
  }, [consultarDisponibilidad, fecha]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (initialDate && initialDate !== lastInitialDateRef.current) {
        lastInitialDateRef.current = initialDate;
        setFecha(initialDate);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialDate]);

  useEffect(() => {
    function handleDisponibilidadUpdate(event) {
      const fechaEvento = event.detail?.fecha;
      if (fechaEvento && fechaEvento !== fecha) {
        setFecha(fechaEvento);
        consultarDisponibilidad(fechaEvento);
        return;
      }
      consultarDisponibilidad(fecha);
    }

    window.addEventListener(DISPONIBILIDAD_UPDATE_EVENT, handleDisponibilidadUpdate);

    return () => {
      window.removeEventListener(DISPONIBILIDAD_UPDATE_EVENT, handleDisponibilidadUpdate);
    };
  }, [consultarDisponibilidad, fecha]);

  // Notifica al padre (Reservas) cuando cambia la disponibilidad real del backend,
  // para que pueda sincronizar el ocupadasSet del formulario con la misma fuente.
  useEffect(() => {
    if (typeof onDisponibilidadChange === "function") {
      onDisponibilidadChange({ ocupadas, ocupadasDetalle });
    }
  }, [ocupadas, ocupadasDetalle, onDisponibilidadChange]);

  const cambiarFecha = (value) => {
    setFecha(value);
    consultarDisponibilidad(value);
  };

  return (
    <Card style={{ marginBottom: 20, borderColor: `${T.accent}55` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <p style={{ color: T.textDim, margin: "8px 0 0", lineHeight: 1.55 }}>
            {description}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            aria-label="Fecha disponibilidad"
            type="date"
            min={todayISO()}
            value={fecha}
            onChange={(e) => cambiarFecha(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: `1px solid ${T.line}`,
              background: T.bg,
              color: T.text,
              fontWeight: 800
            }}
          />
          <Btn
            variant="secondary"
            disabled={estado === "loading"}
            onClick={() => consultarDisponibilidad(fecha)}
          >
            {estado === "loading" ? "Consultando..." : "Actualizar"}
          </Btn>
        </div>
      </div>

      {mensaje && (
        <div style={{
          color: estado === "error" ? T.danger : estado === "closed" ? T.warning : T.textDim,
          marginBottom: 16,
          fontWeight: 800
        }}>
          {mensaje}
        </div>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {pistas.map((pista) => (
          <div key={pista} style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: 14, background: "rgba(255,255,255,.035)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <strong style={{ color: pista === selectedCourt ? T.accent : T.text }}>{pista}</strong>
              <span style={{ color: T.textDim, fontSize: ".8rem" }}>
                {isSundayISO(fecha)
                  ? "Cerrado"
                  : `${BOOKING_HOURS.filter((hora) => ocupadasSet.has(`${fecha}|${pista}|${hora}`)).length} ocupadas`}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 8 }}>
              {BOOKING_HOURS.map((hora) => {
                const clave = `${fecha}|${pista}|${hora}`;

                // Mientras la disponibilidad se está consultando o falló al
                // cargar, NUNCA se muestra un slot como si estuviera libre
                // (fail-safe): se trata como no disponible y el aviso real
                // ("Comprobando…" / error de red) vive en el banner
                // `mensaje` de arriba, no en cada botón individual.
                const datosNoVerificados = estado === "loading" || estado === "error";

                // Siempre usa la duración mínima válida (normalmente 60 min).
                // La pregunta del calendario es "¿puede INICIARSE alguna reserva aquí?"
                // no "¿cabe mi duración seleccionada aquí?". Esto evita dos problemas:
                // 1. 22:00 + 90min → INSUFFICIENT_REMAINING_TIME (cierre a las 23:00)
                // 2. Reserva [22:00,23:00) bloquea visualmente 21:00 cuando dur=90
                //    porque 21:00+90=22:30 solapa con la reserva; con 60min
                //    21:00+60=22:00, que es el límite semiabierto, no hay solapamiento.
                const slotDuration = getAvailableDurationsForHour(hora)[0] ?? 60;

                const evaluacion = datosNoVerificados
                  ? { status: AVAILABILITY_STATUS.UNAVAILABLE, reason: null }
                  : evaluateSlotAvailability({
                      date: fecha,
                      startTime: hora,
                      durationMinutes: slotDuration,
                      courtId: pista,
                      existingBookings,
                      openingHours: CLUB_OPENING_HOURS,
                      currentDateTime: madridNowAsUtcTrick(),
                    });

                const disabled = evaluacion.status !== AVAILABILITY_STATUS.AVAILABLE;
                const occupiedLike = evaluacion.status === AVAILABILITY_STATUS.OCCUPIED;
                const unavailableLike = evaluacion.status === AVAILABILITY_STATUS.UNAVAILABLE;

                // El usuario solo ve estos tres estados. El motivo interno
                // (reason) queda solo en el title/tooltip, para soporte.
                const label = evaluacion.status === AVAILABILITY_STATUS.AVAILABLE
                  ? "Libre"
                  : occupiedLike
                    ? "Ocupado"
                    : "No disponible";

                const borderColor = unavailableLike ? T.warning : occupiedLike ? T.danger : T.accent;
                const background = unavailableLike
                  ? "rgba(255,184,77,.12)"
                  : occupiedLike
                    ? "rgba(255,80,80,.13)"
                    : "rgba(185,245,0,.12)";
                const textColor = unavailableLike ? T.warning : occupiedLike ? T.danger : T.accent;
                const tooltip = evaluacion.reason ? `${label} (${evaluacion.reason})` : label;

                return (
                  <button
                    key={clave}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      onSelectSlot({ fecha, pista, hora });
                    }}
                    title={tooltip}
                    style={{
                      cursor: disabled ? "not-allowed" : "pointer",
                      border: `1px solid ${borderColor}`,
                      background,
                      color: textColor,
                      borderRadius: 14,
                      padding: "10px 8px",
                      fontWeight: 900,
                      opacity: disabled ? .72 : 1
                    }}
                  >
                    <div>{hora}</div>
                    <small style={{ color: unavailableLike ? T.warning : occupiedLike ? T.danger : T.textDim }}>
                      {label}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}


function SectionTitle({ eyebrow, title, desc }) {
  return <div style={{ marginBottom: 30 }}>{eyebrow && <div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".18em", fontSize: ".76rem", textTransform: "uppercase", marginBottom: 10 }}>{eyebrow}</div>}<h2 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(2rem,4vw,3.1rem)", lineHeight: .96, margin: 0, letterSpacing: "-.055em" }}>{title}</h2>{desc && <p style={{ color: T.textDim, lineHeight: 1.75, maxWidth: 760, marginTop: 14, fontSize: "1.02rem" }}>{desc}</p>}</div>;
}

function FieldError({ children }) {
  if (!children) return null;
  return <div style={{ color: T.danger, fontSize: ".82rem", marginTop: 6 }}>{children}</div>;
}

function PanelList({ items }) {
  return <div style={{ display: "grid", gap: 10 }}>{items.map((item) => <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: T.textDim, lineHeight: 1.55 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, marginTop: 8, flex: "0 0 auto" }} /><span>{item}</span></div>)}</div>;
}

function RolePanel({ eyebrow, title, desc, items, action }) {
  return <Card><div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".14em", fontSize: ".72rem", textTransform: "uppercase", marginBottom: 10 }}>{eyebrow}</div><h3 style={{ fontFamily: T.fontDisplay, fontSize: "1.45rem", letterSpacing: "-.04em", margin: "0 0 10px" }}>{title}</h3><p style={{ color: T.textDim, lineHeight: 1.65, marginBottom: 18 }}>{desc}</p><PanelList items={items} />{action && <div style={{ marginTop: 20 }}>{action}</div>}</Card>;
}

function GalleryItem({ item, featured = false }) {
  return <div className={`cp04-gallery-item${featured ? " featured" : ""}`}>{item.src ? <img src={item.src} alt={`${item.title} de Club Pádel 04`} loading="lazy" /> : <div className="cp04-gallery-fallback" aria-hidden="true" />}<div className="cp04-gallery-caption"><strong style={{ display: "block", fontFamily: T.fontDisplay, letterSpacing: "-.03em" }}>{item.title}</strong><span style={{ color: T.textDim, fontSize: ".88rem" }}>{item.src ? "" : item.label}</span></div></div>;
}

function Gallery() {
  const lang = useLang();
  const tx = key => t(key, lang);
  const [featured, ...rest] = GALLERY;
  return <section style={{ marginTop: 42 }}><SectionTitle eyebrow={tx("home.galeria_eyebrow")} title={tx("home.galeria")} desc={tx("home.galeria_desc")} /><div className="cp04-gallery"><GalleryItem item={featured} featured /><div className="cp04-gallery-side">{rest.map((item) => <GalleryItem key={item.key} item={item} />)}</div></div></section>;
}

function IntegrationMatrix({ compact = false }) {
  const colorFor = (status) => status === "Preparada" ? T.accent : status === "Pendiente de credenciales" ? T.warning : T.textDim;
  return <div style={{ display: "grid", gap: 12 }}>{INTEGRATIONS.map((item) => <Card key={item.name} style={{ padding: compact ? 18 : 22 }}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}><div><h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.035em" }}>{item.name}</h3><p style={{ color: T.textDim, marginTop: 8, lineHeight: 1.6 }}>{item.detail}</p></div><span className="cp04-badge" style={{ color: colorFor(item.status), border: `1px solid ${colorFor(item.status)}55`, borderRadius: 999, padding: "7px 11px", fontWeight: 900, fontSize: ".74rem", whiteSpace: "nowrap" }}>{item.status}</span></div>{!compact && <p style={{ color: T.textDim, marginTop: 12, lineHeight: 1.6 }}>Flujo: <code>{item.flow}</code></p>}</Card>)}</div>;
}

function AuthStatusPanel({ compact = false }) {
  const lang = useLang();
  const tx = key => t(key, lang);
  return <Card><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}><div><h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.04em" }}>{tx("auth.roles_title")}</h3><p style={{ color: T.textDim, lineHeight: 1.65, marginTop: 8 }}>{tx("auth.pending_desc")}</p></div><span className="cp04-badge" style={{ color: T.warning, border: `1px solid ${T.warning}55`, borderRadius: 999, padding: "7px 11px", fontWeight: 900, fontSize: ".74rem", whiteSpace: "nowrap" }}>{tx("auth.pending_badge")}</span></div><div className={compact ? undefined : "cp04-grid-2"} style={compact ? { display: "grid", gap: 12 } : undefined}>{ROLES.map((role) => <div key={role.id} style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: 16, background: "rgba(255,255,255,.035)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><strong style={{ color: T.accent }}>{role.id}</strong><span style={{ color: T.warning, fontSize: ".82rem", fontWeight: 900 }}>{role.access}</span></div><div style={{ marginTop: 8, fontWeight: 900 }}>{role.label}</div><div style={{ color: T.textDim, marginTop: 6, lineHeight: 1.55 }}>{tx("auth.secciones")} {role.sections}</div>{!compact && <PanelList items={role.permissions} />}</div>)}</div></Card>;
}



// ============================================================
// SISTEMA GLOBAL DE RELOJ EN TIEMPO REAL
// ============================================================
function useClock() {
  const [now, setNow] = useState(() => new Date());
  const [langCode, setLangCode] = useState(() => {
    try {
      const raw = localStorage.getItem("cp04_language");
      if (!raw) return "es-ES";
      const p = JSON.parse(raw);
      return p?.code || "es-ES";
    } catch { return "es-ES"; }
  });
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    function handler(e) { setLangCode(e.detail?.lang?.code || "es-ES"); }
    window.addEventListener("cp04:lang-change", handler);
    return () => window.removeEventListener("cp04:lang-change", handler);
  }, []);
  const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const pad = n => String(n).padStart(2,"0");
  try {
    const d = now;
    let dayStr, dateStr;
    const sep = langCode.startsWith("de") ? "." : "/";
    try {
      dayStr = new Intl.DateTimeFormat(langCode, { weekday: "long", timeZone: MADRID_TIME_ZONE }).format(d);
      dayStr = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
      const parts = new Intl.DateTimeFormat(langCode, { day: "2-digit", month: "2-digit", year: "numeric", timeZone: MADRID_TIME_ZONE }).formatToParts(d);
      const pDay = parts.find(p => p.type === "day")?.value || pad(d.getDate());
      const pMon = parts.find(p => p.type === "month")?.value || pad(d.getMonth()+1);
      const pYr = parts.find(p => p.type === "year")?.value || String(d.getFullYear());
      dateStr = `${pDay}${sep}${pMon}${sep}${pYr}`;
    } catch {
      dayStr = dias[d.getDay()];
      dateStr = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
    }
    return {
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      date: dateStr,
      day: dayStr,
      full: `${dayStr}, ${dateStr} · ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      hour: d.getHours(),
    };
  } catch { return { time:"--:--:--", date:"--/--/----", day:"--", full:"--", hour:0 }; }
}

function ClockDisplay({ compact = false }) {
  const clk = useClock();
  if (compact) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"monospace" }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:T.accent, flexShrink:0, boxShadow:`0 0 6px ${T.accent}` }} />
        <span style={{ color:T.textDim, fontSize:".75rem" }}>{clk.day.slice(0,3)}</span>
        <span style={{ color:T.text, fontWeight:700, fontSize:".82rem" }}>{clk.date}</span>
        <span style={{ color:T.accent, fontWeight:900, fontSize:".85rem" }}>{clk.time}</span>
      </div>
    );
  }
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontFamily:"monospace", fontSize:"clamp(2.2rem,6vw,3.8rem)", fontWeight:900, letterSpacing:".04em", color:T.accent, lineHeight:1 }}>{clk.time}</div>
      <div style={{ color:T.textDim, fontSize:".92rem", marginTop:6 }}>{clk.day}, {clk.date}</div>
    </div>
  );
}

// ============================================================
// SISTEMA DE GRÁFICAS SVG PREMIUM (sin dependencias externas)
// ============================================================

function MetricCard({ label, value, sub, trend, color, icon }) {
  const col = color || T.accent;
  const trendUp = trend && trend > 0;
  const trendDown = trend && trend < 0;
  const valStr = String(value);
  const isRatio = valStr.includes("/");
  const longVal = valStr.length > 6 || isRatio;
  const valFontSize = isRatio
    ? "clamp(1.1rem,2.2vw,1.55rem)"
    : longVal
      ? "clamp(1.3rem,3vw,1.8rem)"
      : "clamp(1.6rem,3.5vw,2.2rem)";
  return (
    <div style={{ borderRadius:18, border:`1px solid rgba(255,255,255,.09)`, background:"rgba(11,17,29,.85)", padding:"14px 16px", display:"flex", flexDirection:"column", gap:5, position:"relative", overflow:"hidden", minWidth:0 }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${col},transparent)` }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:4 }}>
        <span style={{ color:T.textDim, fontSize:".68rem", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", lineHeight:1.3, flex:1, minWidth:0 }}>{label}</span>
        {icon && <span style={{ fontSize:"1rem", opacity:.65, flexShrink:0 }}>{icon}</span>}
      </div>
      <div style={{ fontFamily:T.fontDisplay, fontSize:valFontSize, fontWeight:900, color:col, lineHeight:1.1, letterSpacing:"-.02em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"clip", minWidth:0 }}>{value}</div>
      {sub && <div style={{ color:T.textDim, fontSize:".72rem", lineHeight:1.35, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</div>}
      {trend !== undefined && trend !== null && (
        <div style={{ marginTop:2 }}>
          <span style={{ fontSize:".72rem", fontWeight:700, color: trendUp ? T.accent : trendDown ? T.danger : T.textDim }}>
            {trendUp ? "▲" : trendDown ? "▼" : "—"} {trend !== 0 ? Math.abs(trend)+"%" : "Sin cambios"}
          </span>
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ data, height = 60, color, label, unit = "reservas" }) {
  const col = color || T.accent;
  const [tip, setTip] = useState(null);
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 200, H = height;
  const barW = Math.max(4, Math.floor((W - data.length * 2) / data.length));
  return (
    <div style={{ position:"relative" }}>
      {label && <div style={{ color:T.textDim, fontSize:".7rem", marginBottom:4, fontWeight:700 }}>{label}</div>}
      {tip && (
        <div style={{ position:"absolute", left:`${tip.px}%`, top:-38, transform:"translateX(-50%)", pointerEvents:"none", zIndex:50, background:"rgba(7,11,20,.96)", border:"1px solid rgba(182,255,0,.4)", borderRadius:9, padding:"5px 10px", whiteSpace:"nowrap", boxShadow:"0 6px 20px rgba(0,0,0,.55)", fontSize:".75rem" }}>
          <span style={{ color:T.textDim }}>{tip.l} · </span>
          <strong style={{ color:T.accent }}>{tip.v} {unit}</strong>
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible", display:"block" }} aria-label={label || "Gráfica de barras"}
        onMouseLeave={() => setTip(null)} onTouchEnd={() => setTimeout(() => setTip(null), 2000)}>
        {data.map((d, i) => {
          const bh = Math.max(2, (d.v / max) * (H - 14));
          const x = i * (barW + 2);
          const cx = x + barW / 2;
          const pxPct = (cx / W) * 100;
          return (
            <g key={i} onMouseEnter={() => setTip({ l: d.l, v: d.v, px: pxPct })} onTouchStart={() => setTip({ l: d.l, v: d.v, px: pxPct })}>
              <rect x={x} y={H - bh - 12} width={barW} height={bh} rx={2} fill={col}
                opacity={tip?.l === d.l ? 1 : .7} style={{ cursor:"crosshair", transition:"opacity .15s" }} />
              {data.length <= 8 && <text x={cx} y={H - 1} textAnchor="middle" fill={T.textDim} fontSize="8">{d.l}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MiniLineChart({ data, height = 60, color, labels, unit = "" }) {
  const col = color || T.accent;
  const [tip, setTip] = useState(null);
  if (!data || data.length < 2) return null;
  const W = 200, H = height;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (v / max) * H + 2,
    v, l: labels?.[i] ?? `Día ${i + 1}`,
  }));
  const pts = points.map(p => `${p.x},${p.y}`).join(" ");
  const area = `0,${H} ` + pts + ` ${W},${H}`;
  return (
    <div style={{ position:"relative" }}>
      {tip && (
        <div style={{ position:"absolute", left:`${(tip.x / W) * 100}%`, top:-38, transform:"translateX(-50%)", pointerEvents:"none", zIndex:50, background:"rgba(7,11,20,.96)", border:"1px solid rgba(182,255,0,.4)", borderRadius:9, padding:"5px 10px", whiteSpace:"nowrap", boxShadow:"0 6px 20px rgba(0,0,0,.55)", fontSize:".75rem" }}>
          <span style={{ color:T.textDim }}>{tip.l} · </span>
          <strong style={{ color:T.accent }}>{tip.v}{unit}</strong>
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block", overflow:"visible" }} aria-label="Gráfica de líneas"
        onMouseLeave={() => setTip(null)}>
        <defs>
          <linearGradient id="lgArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity=".22" />
            <stop offset="100%" stopColor={col} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#lgArea)" />
        <polyline points={pts} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={tip?.l === p.l ? 4 : 2.5} fill={col} opacity={tip?.l === p.l ? 1 : .6}
            style={{ cursor:"crosshair" }}
            onMouseEnter={() => setTip(p)} onTouchStart={() => setTip(p)} />
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ segments, size = 120, label }) {
  const [tip, setTip] = useState(null);
  if (!segments || !segments.length) return null;
  const total = segments.reduce((s, x) => s + x.v, 0) || 1;
  const r = 40, cx = 60, cy = 60, stroke = 14;
  const arcs = segments.reduce((acc, seg) => {
    const pct = seg.v / total;
    const a1 = (acc.angle * Math.PI) / 180;
    const a2 = ((acc.angle + pct * 360) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const la = pct > 0.5 ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2}`;
    acc.list.push({ ...seg, d, pct });
    acc.angle += pct * 360;
    return acc;
  }, { angle: -90, list: [] }).list;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
      <div style={{ position:"relative", flexShrink:0 }}>
        {tip && (
          <div style={{ position:"absolute", top:-36, left:"50%", transform:"translateX(-50%)", pointerEvents:"none", zIndex:50, background:"rgba(7,11,20,.96)", border:"1px solid rgba(182,255,0,.4)", borderRadius:9, padding:"4px 9px", whiteSpace:"nowrap", fontSize:".74rem" }}>
            <span style={{ color:T.textDim }}>{tip.l}: </span>
            <strong style={{ color:tip.c || T.accent }}>{tip.v}</strong>
            <span style={{ color:T.textDim }}> ({Math.round(tip.v/total*100)}%)</span>
          </div>
        )}
        <svg width={size} height={size} viewBox="0 0 120 120" aria-label={label || "Donut"} onMouseLeave={() => setTip(null)}>
          {arcs.map((arc, i) => (
            <path key={i} d={arc.d} fill="none" stroke={arc.c || T.accent} strokeWidth={tip?.l === arc.l ? stroke + 3 : stroke}
              strokeLinecap="round" opacity={tip ? (tip.l === arc.l ? 1 : .45) : .9}
              style={{ cursor:"pointer", transition:"all .2s" }}
              onMouseEnter={() => setTip(arc)} onTouchStart={() => setTip(arc)} />
          ))}
          {label && <text x="60" y="64" textAnchor="middle" fill={T.textDim} fontSize="9" fontWeight="700">{label}</text>}
        </svg>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, cursor:"default" }}
            onMouseEnter={() => setTip(s)} onMouseLeave={() => setTip(null)}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:s.c || T.accent, flexShrink:0 }} />
            <span style={{ color:T.textDim, fontSize:".75rem" }}>{s.l}</span>
            <span style={{ color:T.text, fontSize:".8rem", fontWeight:700, marginLeft:"auto", paddingLeft:8 }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBarChart({ data, color, unit = "" }) {
  const [tip, setTip] = useState(null);
  if (!data || !data.length) return null;
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9, position:"relative" }}>
      {tip && (
        <div style={{ position:"absolute", top:-36, right:0, pointerEvents:"none", zIndex:50, background:"rgba(7,11,20,.96)", border:"1px solid rgba(182,255,0,.4)", borderRadius:9, padding:"4px 10px", whiteSpace:"nowrap", fontSize:".74rem" }}>
          <span style={{ color:T.textDim }}>{tip.l}: </span>
          <strong style={{ color:tip.c || color || T.accent }}>{tip.v}{unit}</strong>
        </div>
      )}
      {data.map((d, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"center", cursor:"default" }}
          onMouseEnter={() => setTip(d)} onMouseLeave={() => setTip(null)} onTouchStart={() => setTip(d)}>
          <div>
            <div style={{ fontSize:".78rem", color:T.text, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.l}</div>
            <div style={{ height:6, borderRadius:3, background:"rgba(255,255,255,.07)", overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:3, background:d.c || color || T.accent, width:`${(d.v/max)*100}%`, transition:"width .6s ease, background .2s" }} />
            </div>
          </div>
          <span style={{ color:d.c || color || T.accent, fontWeight:700, fontSize:".82rem", minWidth:30, textAlign:"right" }}>{d.v}{unit}</span>
        </div>
      ))}
    </div>
  );
}

function FlowStatusBadge({ status }) {
  const map = {
    ok:      { label:"OK",     col:T.accent,   dot:T.accent },
    warn:    { label:"Revisar",col:T.warning,  dot:T.warning },
    error:   { label:"Error",  col:T.danger,   dot:T.danger },
    paused:  { label:"Pausa",  col:"#9aa8bd",  dot:"#9aa8bd" },
    pending: { label:"Pend.",  col:"#9aa8bd",  dot:"#9aa8bd" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:`${s.dot}18`, border:`1px solid ${s.dot}55`, borderRadius:999, padding:"2px 9px", fontSize:".7rem", fontWeight:800, color:s.col }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, boxShadow:`0 0 5px ${s.dot}` }} />
      {s.label}
    </span>
  );
}

function ChartCard({ title, sub, children, action, demo = false, style: cs = {} }) {
  const cleanSub = sub ? sub.replace(/ ?·? ?demo/gi, "").replace(/Make/gi, "Procesos").trim() : sub;
  return (
    <div style={{ borderRadius:20, border:`1px solid rgba(255,255,255,.09)`, background:"rgba(11,17,29,.82)", padding:"16px 18px", ...cs }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontWeight:800, fontSize:".88rem", color:T.text }}>{title}</div>
            {demo && (
              <span style={{ color:T.warning, border:`1px solid ${T.warning}66`, borderRadius:999, padding:"1px 7px", fontSize:".62rem", fontWeight:800, textTransform:"uppercase", letterSpacing:".04em" }}>
                Demo
              </span>
            )}
          </div>
          {cleanSub && <div style={{ color:T.textDim, fontSize:".73rem", marginTop:2 }}>{cleanSub}</div>}
        </div>
        {action && <div style={{ flexShrink:0 }}>{action}</div>}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// DATOS DEMO DASHBOARD (separados y etiquetados)
// ============================================================
// TODO producción: alimentar este dashboard desde backend/proxy seguro.
// Los datos de Make deben venir de un endpoint propio o webhook,
// NUNCA de llamadas directas con clave privada desde el frontend.

const DEMO_RESERVAS_HOY = [
  { l:"8h", v:1 },{ l:"9h", v:3 },{ l:"10h", v:5 },{ l:"11h", v:4 },
  { l:"12h", v:6 },{ l:"13h", v:2 },{ l:"14h", v:0 },{ l:"15h", v:1 },
  { l:"16h", v:4 },{ l:"17h", v:7 },{ l:"18h", v:8 },{ l:"19h", v:5 },
];

const DEMO_RESERVAS_SEMANA = [12, 18, 24, 19, 27, 31, 22];

const DEMO_OCUPACION_PISTAS = [
  { l:"Pista 1", v:87, c:"#b6ff00" },
  { l:"Pista 2", v:72, c:T.accent2 },
  { l:"Pista 3", v:65, c:"#2f6bff" },
  { l:"Pista 4", v:91, c:"#ffad47" },
];

const DEMO_KPI = {
  reservasHoy: 12,
  reservasSemana: 68,
  ocupacionMedia: 79,
  jugadoresActivos: 143,
  nuevosJugadores: 8,
  torneosActivos: 2,
  ingresosMes: 4820,
  alertasCriticas: 0,
  incidenciasAbiertas: 1,
  makeErrores: 2,
  tasaExitoMake: 97.4,
  ultimoBackup: "Lun 07:00",
  qrGenerados: 24,
  exportaciones: 7,
};

// Fuente única de verdad de los 50 flujos Make (src/data/makeMasterRegistry.js).
// Nunca hardcodear el total ni el desglose aquí — siempre derivado.
const MAKE_FLUJOS_COUNTERS = computeMasterCounters();



// ============================================================
// i18n — Language Selector
// ============================================================

function normalizeSearchText(value) {
  if (value == null) return "";
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

const LANGUAGES_RAW = [
  // Recomendados (padel/sport/reservas context)
  { code: "es-ES", label: "Español", country: "España", countryEs: "España", countryEn: "Spain", flag: "🇪🇸", recommended: true, aliases: ["España","Spain","Español","Spanish","Castellano","ES","es","es-ES","🇪🇸","espana","spain","español","spanish","castellano"] },
  { code: "en-GB", label: "English", country: "United Kingdom", countryEs: "Reino Unido", countryEn: "United Kingdom", flag: "🇬🇧", recommended: true, aliases: ["English","Inglés","United Kingdom","Reino Unido","Great Britain","Britain","UK","GB","en","en-GB","🇬🇧","ingles","united kingdom","reino unido"] },
  { code: "fr-FR", label: "Français", country: "France", countryEs: "Francia", countryEn: "France", flag: "🇫🇷", recommended: true, aliases: ["Français","Francés","French","France","Francia","FR","fr","fr-FR","🇫🇷","francais","frances","french","france","francia"] },
  { code: "de-DE", label: "Deutsch", country: "Deutschland", countryEs: "Alemania", countryEn: "Germany", flag: "🇩🇪", recommended: true, aliases: ["Deutsch","Alemán","German","Deutschland","Alemania","Germany","DE","de","de-DE","🇩🇪","aleman","german","alemania","deutschland"] },
  { code: "it-IT", label: "Italiano", country: "Italia", countryEs: "Italia", countryEn: "Italy", flag: "🇮🇹", recommended: true, aliases: ["Italiano","Italian","Italia","Italy","IT","it","it-IT","🇮🇹","italiano","italian","italia","italy"] },
  { code: "pt-PT", label: "Português", country: "Portugal", countryEs: "Portugal", countryEn: "Portugal", flag: "🇵🇹", recommended: true, aliases: ["Português","Portugués","Portuguese","Portugal","PT","pt","pt-PT","🇵🇹","portugues","portuguese","portugal"] },
  { code: "pt-BR", label: "Português", country: "Brasil", countryEs: "Brasil", countryEn: "Brazil", flag: "🇧🇷", recommended: true, aliases: ["Português","Portugués","Portuguese","Brasil","Brazil","BR","pt-BR","🇧🇷","portugues","portuguese","brasil","brazil"] },
  { code: "nl-NL", label: "Nederlands", country: "Nederland", countryEs: "Países Bajos", countryEn: "Netherlands", flag: "🇳🇱", recommended: true, aliases: ["Nederlands","Neerlandés","Dutch","Nederland","Países Bajos","Netherlands","NL","nl","nl-NL","🇳🇱","neerlandes","dutch","paises bajos","netherlands","nederland"] },
  { code: "ru-RU", label: "Русский", country: "Россия", countryEs: "Rusia", countryEn: "Russia", flag: "🇷🇺", recommended: false, aliases: ["Русский","Ruso","Russian","Россия","Rusia","Russia","RU","ru","ru-RU","🇷🇺","ruso","russian","rusia","russia"] },
  { code: "ar-SA", label: "العربية", country: "السعودية", countryEs: "Arabia Saudí", countryEn: "Saudi Arabia", flag: "🇸🇦", recommended: false, aliases: ["العربية","Árabe","Arabic","السعودية","Arabia Saudí","Saudi Arabia","AR","ar","ar-SA","🇸🇦","arabe","arabic","arabia saudi","saudi arabia"] },
  // All 100 languages/variants
  { code: "af-ZA", label: "Afrikaans", country: "South Africa", countryEs: "Sudáfrica", countryEn: "South Africa", flag: "🇿🇦", recommended: false, aliases: ["Afrikaans","South Africa","Sudáfrica","ZA","af","af-ZA","🇿🇦","sudafrica","south africa"] },
  { code: "sq-AL", label: "Shqip", country: "Shqipëri", countryEs: "Albania", countryEn: "Albania", flag: "🇦🇱", recommended: false, aliases: ["Shqip","Albanés","Albanian","Shqipëri","Albania","AL","sq","sq-AL","🇦🇱","albanes","albanian","albania"] },
  { code: "am-ET", label: "አማርኛ", country: "ኢትዮጵያ", countryEs: "Etiopía", countryEn: "Ethiopia", flag: "🇪🇹", recommended: false, aliases: ["አማርኛ","Amhárico","Amharic","ኢትዮጵያ","Etiopía","Ethiopia","ET","am","am-ET","🇪🇹","amharico","amharic","etiopia","ethiopia"] },
  { code: "ar-EG", label: "العربية", country: "مصر", countryEs: "Egipto", countryEn: "Egypt", flag: "🇪🇬", recommended: false, aliases: ["العربية","Árabe","Arabic","مصر","Egipto","Egypt","EG","ar-EG","🇪🇬","arabe","arabic","egipto","egypt"] },
  { code: "ar-MA", label: "العربية", country: "المغرب", countryEs: "Marruecos", countryEn: "Morocco", flag: "🇲🇦", recommended: false, aliases: ["العربية","Árabe","Arabic","المغرب","Marruecos","Morocco","MA","ar-MA","🇲🇦","arabe","arabic","marruecos","morocco"] },
  { code: "hy-AM", label: "Հայերեն", country: "Հայաստան", countryEs: "Armenia", countryEn: "Armenia", flag: "🇦🇲", recommended: false, aliases: ["Հայերեն","Armenio","Armenian","Հայաստան","Armenia","AM","hy","hy-AM","🇦🇲","armenio","armenian","armenia"] },
  { code: "az-AZ", label: "Azərbaycan", country: "Azərbaycan", countryEs: "Azerbaiyán", countryEn: "Azerbaijan", flag: "🇦🇿", recommended: false, aliases: ["Azərbaycan","Azerbaiyano","Azerbaijani","Azerbaiyán","Azerbaijan","AZ","az","az-AZ","🇦🇿","azerbaiyano","azerbaijani","azerbaiyan","azerbaijan"] },
  { code: "eu-ES", label: "Euskara", country: "Euskal Herria", countryEs: "País Vasco", countryEn: "Basque Country", flag: "🏴", recommended: false, aliases: ["Euskara","Vasco","Basque","Euskal Herria","País Vasco","Basque Country","eu","eu-ES","🏴","vasco","basque","pais vasco"] },
  { code: "be-BY", label: "Беларуская", country: "Беларусь", countryEs: "Bielorrusia", countryEn: "Belarus", flag: "🇧🇾", recommended: false, aliases: ["Беларуская","Bielorruso","Belarusian","Беларусь","Bielorrusia","Belarus","BY","be","be-BY","🇧🇾","bielorruso","belarusian","bielorrusia","belarus"] },
  { code: "bn-BD", label: "বাংলা", country: "বাংলাদেশ", countryEs: "Bangladés", countryEn: "Bangladesh", flag: "🇧🇩", recommended: false, aliases: ["বাংলা","Bengalí","Bengali","বাংলাদেশ","Bangladés","Bangladesh","BD","bn","bn-BD","🇧🇩","bengali","bangla","bangladesh"] },
  { code: "bs-BA", label: "Bosanski", country: "Bosna i Hercegovina", countryEs: "Bosnia y Herzegovina", countryEn: "Bosnia and Herzegovina", flag: "🇧🇦", recommended: false, aliases: ["Bosanski","Bosnio","Bosnian","Bosna i Hercegovina","Bosnia y Herzegovina","Bosnia and Herzegovina","BA","bs","bs-BA","🇧🇦","bosnio","bosnian","bosnia"] },
  { code: "bg-BG", label: "Български", country: "България", countryEs: "Bulgaria", countryEn: "Bulgaria", flag: "🇧🇬", recommended: false, aliases: ["Български","Búlgaro","Bulgarian","България","Bulgaria","BG","bg","bg-BG","🇧🇬","bulgaro","bulgarian","bulgaria"] },
  { code: "ca-ES", label: "Català", country: "Catalunya", countryEs: "Cataluña", countryEn: "Catalonia", flag: "🏴", recommended: false, aliases: ["Català","Catalán","Catalan","Catalunya","Cataluña","Catalonia","ca","ca-ES","🏴","catalan","catalunya","cataluna","catalonia"] },
  { code: "zh-CN", label: "中文", country: "中国", countryEs: "China", countryEn: "China (Simplified)", flag: "🇨🇳", recommended: false, aliases: ["中文","Chino","Chinese","中国","China","Simplified Chinese","ZH","zh","zh-CN","🇨🇳","chino","chinese","china"] },
  { code: "zh-TW", label: "中文", country: "台灣", countryEs: "Taiwán", countryEn: "Taiwan (Traditional)", flag: "🇹🇼", recommended: false, aliases: ["中文","Chino","Chinese","台灣","Taiwán","Taiwan","Traditional Chinese","zh-TW","🇹🇼","taiwan","taiwán"] },
  { code: "hr-HR", label: "Hrvatski", country: "Hrvatska", countryEs: "Croacia", countryEn: "Croatia", flag: "🇭🇷", recommended: false, aliases: ["Hrvatski","Croata","Croatian","Hrvatska","Croacia","Croatia","HR","hr","hr-HR","🇭🇷","croata","croatian","croacia","croatia"] },
  { code: "cs-CZ", label: "Čeština", country: "Česká republika", countryEs: "República Checa", countryEn: "Czech Republic", flag: "🇨🇿", recommended: false, aliases: ["Čeština","Checo","Czech","Česká republika","República Checa","Czech Republic","CZ","cs","cs-CZ","🇨🇿","checo","czech","republica checa"] },
  { code: "da-DK", label: "Dansk", country: "Danmark", countryEs: "Dinamarca", countryEn: "Denmark", flag: "🇩🇰", recommended: false, aliases: ["Dansk","Danés","Danish","Danmark","Dinamarca","Denmark","DK","da","da-DK","🇩🇰","danes","danish","dinamarca","denmark"] },
  { code: "nl-BE", label: "Nederlands", country: "België", countryEs: "Bélgica", countryEn: "Belgium (Dutch)", flag: "🇧🇪", recommended: false, aliases: ["Nederlands","Neerlandés","Dutch","België","Bélgica","Belgium","BE","nl-BE","🇧🇪","belgica","belgium"] },
  { code: "en-AU", label: "English", country: "Australia", countryEs: "Australia", countryEn: "Australia", flag: "🇦🇺", recommended: false, aliases: ["English","Inglés","Australia","AU","en-AU","🇦🇺","ingles","australia"] },
  { code: "en-CA", label: "English", country: "Canada", countryEs: "Canadá", countryEn: "Canada", flag: "🇨🇦", recommended: false, aliases: ["English","Inglés","Canada","Canadá","CA","en-CA","🇨🇦","canada","ingles"] },
  { code: "en-IN", label: "English", country: "India", countryEs: "India", countryEn: "India", flag: "🇮🇳", recommended: false, aliases: ["English","Inglés","India","IN","en-IN","🇮🇳","india","ingles"] },
  { code: "en-NZ", label: "English", country: "New Zealand", countryEs: "Nueva Zelanda", countryEn: "New Zealand", flag: "🇳🇿", recommended: false, aliases: ["English","Inglés","New Zealand","Nueva Zelanda","NZ","en-NZ","🇳🇿","nueva zelanda","new zealand"] },
  { code: "en-US", label: "English", country: "United States", countryEs: "Estados Unidos", countryEn: "United States", flag: "🇺🇸", recommended: false, aliases: ["English","Inglés","United States","Estados Unidos","USA","US","en-US","en","🇺🇸","estados unidos","united states"] },
  { code: "et-EE", label: "Eesti", country: "Eesti", countryEs: "Estonia", countryEn: "Estonia", flag: "🇪🇪", recommended: false, aliases: ["Eesti","Estonio","Estonian","Estonia","EE","et","et-EE","🇪🇪","estonio","estonian","estonia"] },
  { code: "fo-FO", label: "Føroyskt", country: "Færøerne", countryEs: "Islas Feroe", countryEn: "Faroe Islands", flag: "🇫🇴", recommended: false, aliases: ["Føroyskt","Feroés","Faroese","Færøerne","Islas Feroe","Faroe Islands","FO","fo","fo-FO","🇫🇴","feroes","faroese","islas feroe"] },
  { code: "fi-FI", label: "Suomi", country: "Suomi", countryEs: "Finlandia", countryEn: "Finland", flag: "🇫🇮", recommended: false, aliases: ["Suomi","Finlandés","Finnish","Finlandia","Finland","FI","fi","fi-FI","🇫🇮","finlandes","finnish","finlandia","finland"] },
  { code: "fr-BE", label: "Français", country: "Belgique", countryEs: "Bélgica (francés)", countryEn: "Belgium (French)", flag: "🇧🇪", recommended: false, aliases: ["Français","Francés","French","Belgique","Bélgica","Belgium","fr-BE","🇧🇪","frances","french","belgica"] },
  { code: "fr-CA", label: "Français", country: "Canada", countryEs: "Canadá (francés)", countryEn: "Canada (French)", flag: "🇨🇦", recommended: false, aliases: ["Français","Francés","French","Canada","Canadá","fr-CA","🇨🇦","frances","french","canada"] },
  { code: "fr-CH", label: "Français", country: "Suisse", countryEs: "Suiza (francés)", countryEn: "Switzerland (French)", flag: "🇨🇭", recommended: false, aliases: ["Français","Francés","French","Suisse","Suiza","Switzerland","fr-CH","🇨🇭","frances","french","suiza","switzerland"] },
  { code: "gl-ES", label: "Galego", country: "Galicia", countryEs: "Galicia", countryEn: "Galicia", flag: "🏴", recommended: false, aliases: ["Galego","Gallego","Galician","Galicia","gl","gl-ES","🏴","gallego","galician","galicia"] },
  { code: "ka-GE", label: "ქართული", country: "საქართველო", countryEs: "Georgia", countryEn: "Georgia", flag: "🇬🇪", recommended: false, aliases: ["ქართული","Georgiano","Georgian","საქართველო","Georgia","GE","ka","ka-GE","🇬🇪","georgiano","georgian","georgia"] },
  { code: "de-AT", label: "Deutsch", country: "Österreich", countryEs: "Austria", countryEn: "Austria", flag: "🇦🇹", recommended: false, aliases: ["Deutsch","Alemán","German","Österreich","Austria","AT","de-AT","🇦🇹","aleman","german","austria"] },
  { code: "de-CH", label: "Deutsch", country: "Schweiz", countryEs: "Suiza (alemán)", countryEn: "Switzerland (German)", flag: "🇨🇭", recommended: false, aliases: ["Deutsch","Alemán","German","Schweiz","Suiza","Switzerland","de-CH","🇨🇭","aleman","german","suiza"] },
  { code: "el-GR", label: "Ελληνικά", country: "Ελλάδα", countryEs: "Grecia", countryEn: "Greece", flag: "🇬🇷", recommended: false, aliases: ["Ελληνικά","Griego","Greek","Ελλάδα","Grecia","Greece","GR","el","el-GR","🇬🇷","griego","greek","grecia","greece"] },
  { code: "gu-IN", label: "ગુજરાતી", country: "India", countryEs: "India (gujarati)", countryEn: "India (Gujarati)", flag: "🇮🇳", recommended: false, aliases: ["ગુજરાતી","Gujarati","India","gu","gu-IN","🇮🇳","gujarati","india"] },
  { code: "he-IL", label: "עברית", country: "ישראל", countryEs: "Israel", countryEn: "Israel", flag: "🇮🇱", recommended: false, aliases: ["עברית","Hebreo","Hebrew","ישראל","Israel","IL","he","he-IL","🇮🇱","hebreo","hebrew","israel"] },
  { code: "hi-IN", label: "हिन्दी", country: "भारत", countryEs: "India (hindi)", countryEn: "India (Hindi)", flag: "🇮🇳", recommended: false, aliases: ["हिन्दी","Hindi","भारत","India","hi","hi-IN","🇮🇳","hindi","india"] },
  { code: "hu-HU", label: "Magyar", country: "Magyarország", countryEs: "Hungría", countryEn: "Hungary", flag: "🇭🇺", recommended: false, aliases: ["Magyar","Húngaro","Hungarian","Magyarország","Hungría","Hungary","HU","hu","hu-HU","🇭🇺","hungaro","hungarian","hungria","hungary"] },
  { code: "is-IS", label: "Íslenska", country: "Ísland", countryEs: "Islandia", countryEn: "Iceland", flag: "🇮🇸", recommended: false, aliases: ["Íslenska","Islandés","Icelandic","Ísland","Islandia","Iceland","IS","is","is-IS","🇮🇸","islandes","icelandic","islandia","iceland"] },
  { code: "id-ID", label: "Bahasa Indonesia", country: "Indonesia", countryEs: "Indonesia", countryEn: "Indonesia", flag: "🇮🇩", recommended: false, aliases: ["Bahasa Indonesia","Indonesio","Indonesian","Indonesia","ID","id","id-ID","🇮🇩","indonesio","indonesian","indonesia"] },
  { code: "ga-IE", label: "Gaeilge", country: "Éire", countryEs: "Irlanda", countryEn: "Ireland", flag: "🇮🇪", recommended: false, aliases: ["Gaeilge","Irlandés","Irish","Éire","Irlanda","Ireland","IE","ga","ga-IE","🇮🇪","irlandes","irish","irlanda","ireland"] },
  { code: "xh-ZA", label: "isiXhosa", country: "South Africa", countryEs: "Sudáfrica", countryEn: "South Africa", flag: "🇿🇦", recommended: false, aliases: ["isiXhosa","Xhosa","South Africa","Sudáfrica","xh","xh-ZA","🇿🇦","xhosa","sudafrica"] },
  { code: "zu-ZA", label: "isiZulu", country: "South Africa", countryEs: "Sudáfrica", countryEn: "South Africa", flag: "🇿🇦", recommended: false, aliases: ["isiZulu","Zulú","Zulu","South Africa","Sudáfrica","zu","zu-ZA","🇿🇦","zulu","sudafrica"] },
  { code: "ja-JP", label: "日本語", country: "日本", countryEs: "Japón", countryEn: "Japan", flag: "🇯🇵", recommended: false, aliases: ["日本語","Japonés","Japanese","日本","Japón","Japan","JP","ja","ja-JP","🇯🇵","japones","japanese","japon","japan"] },
  { code: "kn-IN", label: "ಕನ್ನಡ", country: "India", countryEs: "India (kannada)", countryEn: "India (Kannada)", flag: "🇮🇳", recommended: false, aliases: ["ಕನ್ನಡ","Kannada","India","kn","kn-IN","🇮🇳","kannada","india"] },
  { code: "kk-KZ", label: "Қазақ тілі", country: "Қазақстан", countryEs: "Kazajistán", countryEn: "Kazakhstan", flag: "🇰🇿", recommended: false, aliases: ["Қазақ тілі","Kazajo","Kazakh","Қазақстан","Kazajistán","Kazakhstan","KZ","kk","kk-KZ","🇰🇿","kazajo","kazakh","kazajistan","kazakhstan"] },
  { code: "km-KH", label: "ខ្មែរ", country: "កម្ពុជា", countryEs: "Camboya", countryEn: "Cambodia", flag: "🇰🇭", recommended: false, aliases: ["ខ្មែរ","Jemer","Khmer","កម្ពុជា","Camboya","Cambodia","KH","km","km-KH","🇰🇭","jemer","khmer","camboya","cambodia"] },
  { code: "ko-KR", label: "한국어", country: "대한민국", countryEs: "Corea del Sur", countryEn: "South Korea", flag: "🇰🇷", recommended: false, aliases: ["한국어","Coreano","Korean","대한민국","Corea del Sur","South Korea","KR","ko","ko-KR","🇰🇷","coreano","korean","corea del sur","south korea"] },
  { code: "ky-KG", label: "Кыргызча", country: "Кыргызстан", countryEs: "Kirguistán", countryEn: "Kyrgyzstan", flag: "🇰🇬", recommended: false, aliases: ["Кыргызча","Kirguís","Kyrgyz","Кыргызстан","Kirguistán","Kyrgyzstan","KG","ky","ky-KG","🇰🇬","kirguis","kyrgyz","kirguistan","kyrgyzstan"] },
  { code: "lo-LA", label: "ລາວ", country: "ລາວ", countryEs: "Laos", countryEn: "Laos", flag: "🇱🇦", recommended: false, aliases: ["ລາວ","Lao","Laos","LA","lo","lo-LA","🇱🇦","lao","laos"] },
  { code: "lv-LV", label: "Latviešu", country: "Latvija", countryEs: "Letonia", countryEn: "Latvia", flag: "🇱🇻", recommended: false, aliases: ["Latviešu","Letón","Latvian","Latvija","Letonia","Latvia","LV","lv","lv-LV","🇱🇻","leton","latvian","letonia","latvia"] },
  { code: "lt-LT", label: "Lietuvių", country: "Lietuva", countryEs: "Lituania", countryEn: "Lithuania", flag: "🇱🇹", recommended: false, aliases: ["Lietuvių","Lituano","Lithuanian","Lietuva","Lituania","Lithuania","LT","lt","lt-LT","🇱🇹","lituano","lithuanian","lituania","lithuania"] },
  { code: "lb-LU", label: "Lëtzebuergesch", country: "Lëtzebuerg", countryEs: "Luxemburgo", countryEn: "Luxembourg", flag: "🇱🇺", recommended: false, aliases: ["Lëtzebuergesch","Luxemburgués","Luxembourgish","Lëtzebuerg","Luxemburgo","Luxembourg","LU","lb","lb-LU","🇱🇺","luxemburgo","luxembourg"] },
  { code: "mk-MK", label: "Македонски", country: "Македонија", countryEs: "Macedonia del Norte", countryEn: "North Macedonia", flag: "🇲🇰", recommended: false, aliases: ["Македонски","Macedonio","Macedonian","Македонија","Macedonia del Norte","North Macedonia","MK","mk","mk-MK","🇲🇰","macedonio","macedonian","macedonia"] },
  { code: "ms-MY", label: "Bahasa Melayu", country: "Malaysia", countryEs: "Malasia", countryEn: "Malaysia", flag: "🇲🇾", recommended: false, aliases: ["Bahasa Melayu","Malayo","Malay","Malaysia","Malasia","MY","ms","ms-MY","🇲🇾","malayo","malay","malasia","malaysia"] },
  { code: "ml-IN", label: "മലയാളം", country: "India", countryEs: "India (malabar)", countryEn: "India (Malayalam)", flag: "🇮🇳", recommended: false, aliases: ["മലയാളം","Malayalam","India","ml","ml-IN","🇮🇳","malayalam","india"] },
  { code: "mt-MT", label: "Malti", country: "Malta", countryEs: "Malta", countryEn: "Malta", flag: "🇲🇹", recommended: false, aliases: ["Malti","Maltés","Maltese","Malta","MT","mt","mt-MT","🇲🇹","maltes","maltese","malta"] },
  { code: "mr-IN", label: "मराठी", country: "भारत", countryEs: "India (marathi)", countryEn: "India (Marathi)", flag: "🇮🇳", recommended: false, aliases: ["मराठी","Maratí","Marathi","भारत","India","mr","mr-IN","🇮🇳","marati","marathi","india"] },
  { code: "mn-MN", label: "Монгол", country: "Монгол", countryEs: "Mongolia", countryEn: "Mongolia", flag: "🇲🇳", recommended: false, aliases: ["Монгол","Mongol","Mongolian","Mongolia","MN","mn","mn-MN","🇲🇳","mongol","mongolian","mongolia"] },
  { code: "ne-NP", label: "नेपाली", country: "नेपाल", countryEs: "Nepal", countryEn: "Nepal", flag: "🇳🇵", recommended: false, aliases: ["नेपाली","Nepalés","Nepali","नेपाल","Nepal","NP","ne","ne-NP","🇳🇵","nepales","nepali","nepal"] },
  { code: "nb-NO", label: "Norsk", country: "Norge", countryEs: "Noruega", countryEn: "Norway", flag: "🇳🇴", recommended: false, aliases: ["Norsk","Noruego","Norwegian","Norge","Noruega","Norway","NO","nb","nb-NO","🇳🇴","noruego","norwegian","noruega","norway"] },
  { code: "nn-NO", label: "Nynorsk", country: "Norge", countryEs: "Noruega (nynorsk)", countryEn: "Norway (Nynorsk)", flag: "🇳🇴", recommended: false, aliases: ["Nynorsk","Noruego","Norwegian","Norge","Noruega","Norway","nn","nn-NO","🇳🇴","noruego","norwegian","noruega"] },
  { code: "or-IN", label: "ଓଡ଼ିଆ", country: "India", countryEs: "India (odia)", countryEn: "India (Odia)", flag: "🇮🇳", recommended: false, aliases: ["ଓଡ଼ିଆ","Odia","Oriya","India","or","or-IN","🇮🇳","odia","oriya","india"] },
  { code: "ps-AF", label: "پښتو", country: "افغانستان", countryEs: "Afganistán", countryEn: "Afghanistan", flag: "🇦🇫", recommended: false, aliases: ["پښتو","Pastún","Pashto","افغانستان","Afganistán","Afghanistan","AF","ps","ps-AF","🇦🇫","pastun","pashto","afganistan","afghanistan"] },
  { code: "fa-IR", label: "فارسی", country: "ایران", countryEs: "Irán", countryEn: "Iran", flag: "🇮🇷", recommended: false, aliases: ["فارسی","Persa","Persian","Farsi","ایران","Irán","Iran","IR","fa","fa-IR","🇮🇷","persa","persian","farsi","iran"] },
  { code: "pl-PL", label: "Polski", country: "Polska", countryEs: "Polonia", countryEn: "Poland", flag: "🇵🇱", recommended: false, aliases: ["Polski","Polaco","Polish","Polska","Polonia","Poland","PL","pl","pl-PL","🇵🇱","polaco","polish","polonia","poland"] },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ", country: "India", countryEs: "India (punjabi)", countryEn: "India (Punjabi)", flag: "🇮🇳", recommended: false, aliases: ["ਪੰਜਾਬੀ","Punjabí","Punjabi","India","pa","pa-IN","🇮🇳","punjabi","india"] },
  { code: "ro-RO", label: "Română", country: "România", countryEs: "Rumanía", countryEn: "Romania", flag: "🇷🇴", recommended: false, aliases: ["Română","Rumano","Romanian","România","Rumanía","Romania","RO","ro","ro-RO","🇷🇴","rumano","romanian","rumania","romania"] },
  { code: "sr-RS", label: "Српски", country: "Србија", countryEs: "Serbia", countryEn: "Serbia", flag: "🇷🇸", recommended: false, aliases: ["Српски","Serbio","Serbian","Србија","Serbia","RS","sr","sr-RS","🇷🇸","serbio","serbian","serbia"] },
  { code: "si-LK", label: "සිංහල", country: "ශ්‍රී ලංකා", countryEs: "Sri Lanka", countryEn: "Sri Lanka", flag: "🇱🇰", recommended: false, aliases: ["සිංහල","Cingalés","Sinhala","ශ්‍රී ලංකා","Sri Lanka","LK","si","si-LK","🇱🇰","cingales","sinhala","sri lanka"] },
  { code: "sk-SK", label: "Slovenčina", country: "Slovensko", countryEs: "Eslovaquia", countryEn: "Slovakia", flag: "🇸🇰", recommended: false, aliases: ["Slovenčina","Eslovaco","Slovak","Slovensko","Eslovaquia","Slovakia","SK","sk","sk-SK","🇸🇰","eslovaco","slovak","eslovaquia","slovakia"] },
  { code: "sl-SI", label: "Slovenščina", country: "Slovenija", countryEs: "Eslovenia", countryEn: "Slovenia", flag: "🇸🇮", recommended: false, aliases: ["Slovenščina","Esloveno","Slovenian","Slovenija","Eslovenia","Slovenia","SI","sl","sl-SI","🇸🇮","esloveno","slovenian","eslovenia","slovenia"] },
  { code: "so-SO", label: "Soomaali", country: "Soomaaliya", countryEs: "Somalia", countryEn: "Somalia", flag: "🇸🇴", recommended: false, aliases: ["Soomaali","Somalí","Somali","Soomaaliya","Somalia","SO","so","so-SO","🇸🇴","somali","somalia"] },
  { code: "es-AR", label: "Español", country: "Argentina", countryEs: "Argentina", countryEn: "Argentina", flag: "🇦🇷", recommended: false, aliases: ["Español","Spanish","Argentina","AR","es-AR","🇦🇷","espanol","spanish","argentina"] },
  { code: "es-CL", label: "Español", country: "Chile", countryEs: "Chile", countryEn: "Chile", flag: "🇨🇱", recommended: false, aliases: ["Español","Spanish","Chile","CL","es-CL","🇨🇱","espanol","spanish","chile"] },
  { code: "es-CO", label: "Español", country: "Colombia", countryEs: "Colombia", countryEn: "Colombia", flag: "🇨🇴", recommended: false, aliases: ["Español","Spanish","Colombia","CO","es-CO","🇨🇴","espanol","spanish","colombia"] },
  { code: "es-MX", label: "Español", country: "México", countryEs: "México", countryEn: "Mexico", flag: "🇲🇽", recommended: false, aliases: ["Español","Spanish","México","Mexico","MX","es-MX","🇲🇽","espanol","spanish","mexico","méxico"] },
  { code: "es-US", label: "Español", country: "Estados Unidos", countryEs: "Estados Unidos", countryEn: "United States (Spanish)", flag: "🇺🇸", recommended: false, aliases: ["Español","Spanish","Estados Unidos","United States","US","es-US","🇺🇸","espanol","spanish","estados unidos"] },
  { code: "sw-KE", label: "Kiswahili", country: "Kenya", countryEs: "Kenia", countryEn: "Kenya", flag: "🇰🇪", recommended: false, aliases: ["Kiswahili","Suajili","Swahili","Kenya","Kenia","KE","sw","sw-KE","🇰🇪","suajili","swahili","kenia","kenya"] },
  { code: "sv-SE", label: "Svenska", country: "Sverige", countryEs: "Suecia", countryEn: "Sweden", flag: "🇸🇪", recommended: false, aliases: ["Svenska","Sueco","Swedish","Sverige","Suecia","Sweden","SE","sv","sv-SE","🇸🇪","sueco","swedish","suecia","sweden"] },
  { code: "tl-PH", label: "Filipino", country: "Pilipinas", countryEs: "Filipinas", countryEn: "Philippines", flag: "🇵🇭", recommended: false, aliases: ["Filipino","Tagalog","Pilipinas","Filipinas","Philippines","PH","tl","tl-PH","🇵🇭","tagalog","filipino","filipinas","philippines"] },
  { code: "tg-TJ", label: "Тоҷикӣ", country: "Тоҷикистон", countryEs: "Tayikistán", countryEn: "Tajikistan", flag: "🇹🇯", recommended: false, aliases: ["Тоҷикӣ","Tayiko","Tajik","Тоҷикистон","Tayikistán","Tajikistan","TJ","tg","tg-TJ","🇹🇯","tayiko","tajik","tayikistan","tajikistan"] },
  { code: "ta-IN", label: "தமிழ்", country: "India", countryEs: "India (tamil)", countryEn: "India (Tamil)", flag: "🇮🇳", recommended: false, aliases: ["தமிழ்","Tamil","India","ta","ta-IN","🇮🇳","tamil","india"] },
  { code: "te-IN", label: "తెలుగు", country: "India", countryEs: "India (telugu)", countryEn: "India (Telugu)", flag: "🇮🇳", recommended: false, aliases: ["తెలుగు","Telugu","India","te","te-IN","🇮🇳","telugu","india"] },
  { code: "th-TH", label: "ภาษาไทย", country: "ประเทศไทย", countryEs: "Tailandia", countryEn: "Thailand", flag: "🇹🇭", recommended: false, aliases: ["ภาษาไทย","Tailandés","Thai","ประเทศไทย","Tailandia","Thailand","TH","th","th-TH","🇹🇭","tailandes","thai","tailandia","thailand"] },
  { code: "ti-ER", label: "ትግርኛ", country: "ኤርትራ", countryEs: "Eritrea", countryEn: "Eritrea", flag: "🇪🇷", recommended: false, aliases: ["ትግርኛ","Tigrinya","ኤርትራ","Eritrea","ER","ti","ti-ER","🇪🇷","tigrinya","eritrea"] },
  { code: "tr-TR", label: "Türkçe", country: "Türkiye", countryEs: "Turquía", countryEn: "Turkey", flag: "🇹🇷", recommended: false, aliases: ["Türkçe","Turco","Turkish","Türkiye","Turquía","Turkey","TR","tr","tr-TR","🇹🇷","turco","turkish","turquia","turkey"] },
  { code: "tk-TM", label: "Türkmen", country: "Türkmenistan", countryEs: "Turkmenistán", countryEn: "Turkmenistan", flag: "🇹🇲", recommended: false, aliases: ["Türkmen","Turcomano","Turkmen","Türkmenistan","Turkmenistán","Turkmenistan","TM","tk","tk-TM","🇹🇲","turcomano","turkmen","turkmenistan"] },
  { code: "uk-UA", label: "Українська", country: "Україна", countryEs: "Ucrania", countryEn: "Ukraine", flag: "🇺🇦", recommended: false, aliases: ["Українська","Ucraniano","Ukrainian","Україна","Ucrania","Ukraine","UA","uk","uk-UA","🇺🇦","ucraniano","ukrainian","ucrania","ukraine"] },
  { code: "ur-PK", label: "اردو", country: "پاکستان", countryEs: "Pakistán", countryEn: "Pakistan", flag: "🇵🇰", recommended: false, aliases: ["اردو","Urdu","پاکستان","Pakistán","Pakistan","PK","ur","ur-PK","🇵🇰","urdu","pakistan","pakistán"] },
  { code: "uz-UZ", label: "Oʻzbekcha", country: "Oʻzbekiston", countryEs: "Uzbekistán", countryEn: "Uzbekistan", flag: "🇺🇿", recommended: false, aliases: ["Oʻzbekcha","Uzbeko","Uzbek","Oʻzbekiston","Uzbekistán","Uzbekistan","UZ","uz","uz-UZ","🇺🇿","uzbeko","uzbek","uzbekistan"] },
  { code: "vi-VN", label: "Tiếng Việt", country: "Việt Nam", countryEs: "Vietnam", countryEn: "Vietnam", flag: "🇻🇳", recommended: false, aliases: ["Tiếng Việt","Vietnamita","Vietnamese","Việt Nam","Vietnam","VN","vi","vi-VN","🇻🇳","vietnamita","vietnamese","vietnam"] },
  { code: "cy-GB", label: "Cymraeg", country: "Cymru", countryEs: "Gales", countryEn: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", recommended: false, aliases: ["Cymraeg","Galés","Welsh","Cymru","Gales","Wales","cy","cy-GB","🏴󠁧󠁢󠁷󠁬󠁳󠁿","gales","welsh","wales"] },
  { code: "yi-001", label: "ייִדיש", country: "World", countryEs: "Internacional", countryEn: "International", flag: "🌍", recommended: false, aliases: ["ייִדיש","Yídish","Yiddish","International","Internacional","yi","yi-001","🌍","yidish","yiddish"] },
  { code: "yo-NG", label: "Yorùbá", country: "Nigeria", countryEs: "Nigeria", countryEn: "Nigeria", flag: "🇳🇬", recommended: false, aliases: ["Yorùbá","Yoruba","Nigeria","NG","yo","yo-NG","🇳🇬","yoruba","nigeria"] },
];

function sortLanguages(list) {
  return [...list].sort((a, b) => {
    const la = normalizeSearchText(a.label);
    const lb = normalizeSearchText(b.label);
    if (la !== lb) return la.localeCompare(lb, "es", { sensitivity: "base" });
    return normalizeSearchText(a.country).localeCompare(normalizeSearchText(b.country), "es", { sensitivity: "base" });
  });
}

const LANGUAGES_ALL = sortLanguages(LANGUAGES_RAW);
const LANGUAGES_RECOMMENDED = sortLanguages(LANGUAGES_RAW.filter(l => l.recommended));

function loadSavedLanguage() {
  try {
    const raw = localStorage.getItem("cp04_language");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.code && LANGUAGES_RAW.find(l => l.code === parsed.code)) return parsed;
    return null;
  } catch {
    return null;
  }
}

// ============================================================
// i18n — Sistema de traducciones global
// ============================================================

const LANG_CHANGE_EVENT = "cp04:lang-change";

const _defaultLang = LANGUAGES_RAW.find(l => l.code === "es-ES");

let _globalLang = (() => {
  try {
    const raw = localStorage.getItem("cp04_language");
    if (!raw) return _defaultLang;
    const parsed = JSON.parse(raw);
    if (parsed?.code && LANGUAGES_RAW.find(l => l.code === parsed.code)) return parsed;
  } catch {
    // localStorage puede lanzar en modo privado/Safari; usar el idioma por defecto.
  }
  return _defaultLang;
})();

function setGlobalLang(lang) {
  _globalLang = lang || _defaultLang;
  try {
    localStorage.setItem("cp04_language", JSON.stringify(_globalLang));
  } catch {
    // localStorage puede lanzar en modo privado/Safari; el idioma sigue en memoria.
  }
  window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT, { detail: { lang: _globalLang } }));
}

function useLang() {
  const [lang, setLang] = useState(() => _globalLang);
  useEffect(() => {
    function handler(e) { setLang(e.detail?.lang || _defaultLang); }
    window.addEventListener(LANG_CHANGE_EVENT, handler);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, handler);
  }, []);
  return lang;
}


/* AUDITORIA 20 · AUTH REAL HELPERS
   Preparación para autenticación real sin romper modo demo/local.
   El backend/Worker debe ser la autoridad final en producción. */

const CP04_AUTH_MODES = {
  DEMO: "demo",
  LOCAL_DEMO: "universal_demo",
  BACKEND_READY: "backend_ready",
  PRODUCTION: "production"
};

// RBAC movido a src/utils/rbac.js (fuente única, testeada con node --test,
// también consumida por Sidebar). Ver import al inicio del archivo.

function cp04GetStoredAuthMode() {
  try {
    return localStorage.getItem("cp04_auth_mode") || CP04_AUTH_MODES.DEMO;
  } catch {
    return CP04_AUTH_MODES.DEMO;
  }
}


const TRANSLATIONS = {
  "es-ES": {
    "nav.inicio":"Inicio","nav.reservar":"Reservar","nav.alta_jugador":"Alta de jugador",
    "nav.reprogramar":"Reprogramar reserva","nav.cancelar":"Cancelar reserva",
    // PASO 07G/07I/07N (2026-07-19/20): solo se añaden a es-ES
    // deliberadamente — t() ya hace fallback a es-ES cuando un idioma no
    // tiene la clave (ver función t() más abajo), así que el resto de
    // idiomas mostrará este mismo texto en español hasta que se traduzca,
    // en vez de la clave cruda o un string vacío.
    "nav.cierre_pistas":"Cierre temporal",
    "nav.baja_jugador":"Baja de jugador",
    "nav.lista_espera":"Lista de espera",
    "nav.control_qr":"Control QR / Accesos",
    "nav.pistas_recordatorios":"Pistas libres y recordatorios",
    "nav.dashboard_kpi":"Dashboard KPI y NPS",
    "nav.backups_seguridad":"Backups y seguridad",
    "nav.comunicaciones_socio":"Comunicaciones y ciclo de socio",
    "nav.calendario_disponibilidad":"Calendario y disponibilidad",
    "nav.facturacion_pagos":"Facturación y pagos",
    "nav.automatizaciones_bots":"Automatizaciones y bots",
    "nav.gestion":"Reservas","nav.torneos":"Torneos","nav.ranking":"Ranking",
    "nav.admin":"Admin","nav.flujos_make":"Centro técnico","nav.soporte":"Soporte",
    "nav.comunidad":"Comunidad",
    "nav.cerrar_sesion":"Cerrar sesión","nav.saas_label":"SaaS seguro","nav.cerrar_menu":"Cerrar","nav.abrir_menu":"Menú",
    "login.title":"Iniciar como rol","login.entrar":"Entrar","login.cancelar":"Cancelar",
    "login.password":"Contraseña","login.ver_pwd":"👁️ Ver contraseña","login.ocultar_pwd":"🙈 Ocultar contraseña",
    "login.guardar_sesion":"Guardar sesión en este dispositivo","login.acceder_como":"Acceder como",
    "login.intro_pwd":"Introduce la contraseña asignada a este rol.",
    "login.error_rol":"Selecciona un rol válido.","login.error_pwd":"Contraseña incorrecta para este rol.",
    "login.sesion_label":"Club Pádel 04 · Inicio de sesión",
    "login.legal":"Acceso local protegido por contraseña. Puedes guardar sesión solo en este dispositivo. Para producción real, las credenciales deberán validarse desde backend/autenticación segura.",
    "login.olvide_pwd":"¿Has olvidado tu contraseña?","login.recuperar_title":"Recuperar acceso","login.recuperar_desc":"Introduce tu correo electrónico y, si la cuenta existe, recibirás instrucciones para restablecer el acceso.","login.recuperar_email":"Correo electrónico","login.recuperar_btn":"Enviar instrucciones","login.recuperar_enviado":"Si esa dirección está registrada en el sistema, recibirás instrucciones en breve. Revisa también la carpeta de spam.","login.recuperar_volver":"Volver al inicio de sesión","login.recuperar_preparado":"Preparado para endpoint: /api/auth/forgot-password","login.recuperar_no_disponible":"Recuperación de contraseña aún no disponible en este entorno: pendiente de activar el proveedor de autenticación.","login.recuperar_cargando":"Enviando instrucciones…",
    "perfil.title":"Perfil y ajustes","perfil.eyebrow":"Mi cuenta","perfil.sesion":"Sesión activa","perfil.rol_actual":"Rol actual","perfil.cerrar_sesion":"Cerrar sesión","perfil.cambiar_pwd":"Cambiar contraseña","perfil.pwd_actual":"Contraseña actual","perfil.pwd_nueva":"Nueva contraseña","perfil.pwd_confirmar":"Confirmar nueva contraseña","perfil.pwd_guardada":"Contraseña actualizada (modo demo local).","perfil.pwd_error_vacia":"Introduce la contraseña actual.","perfil.pwd_error_nueva":"Mínimo 8 caracteres, mayúscula, minúscula y número.","perfil.pwd_error_coincide":"Las contraseñas no coinciden.","perfil.idioma":"Idioma de la interfaz","perfil.info_demo":"Perfil en modo local. Los datos se guardan únicamente en este dispositivo.","perfil.privacidad":"Privacidad","perfil.privacidad_desc":"En producción real, los datos personales se gestionarán conforme al RGPD.","perfil.notificaciones":"Notificaciones","perfil.notif_desc":"Preparado para notificaciones por correo y mensajería en producción.","perfil.avatar_cambiar":"Cambiar foto de perfil","perfil.avatar_eliminar":"Eliminar foto","perfil.avatar_confirmar_del":"¿Eliminar tu foto de perfil?","perfil.avatar_guardada":"Foto actualizada.","perfil.avatar_eliminada":"Foto eliminada.","perfil.avatar_error_tipo":"Solo imágenes (JPG, PNG, WEBP).","perfil.avatar_error_size":"Máximo 5 MB.","perfil.bio_titulo":"Tu presentación","perfil.bio_placeholder":"Cuéntanos algo sobre tu juego, nivel o disponibilidad...","perfil.bio_guardar":"Guardar","perfil.bio_cancelar":"Cancelar","perfil.bio_guardada":"Presentación guardada.","perfil.bio_editar":"Editar presentación","perfil.bio_chars":"caracteres","perfil.deporte_titulo":"Datos deportivos","perfil.deporte_guardar":"Guardar datos","perfil.deporte_guardados":"Datos guardados.","perfil.deporte_mano":"Mano dominante","perfil.deporte_posicion":"Posición preferida","perfil.deporte_nivel":"Nivel de juego","perfil.deporte_disponibilidad":"Disponibilidad habitual","perfil.deporte_tipo_partida":"Tipo de partida","perfil.deporte_objetivo":"Objetivo principal","perfil.deporte_busqueda":"Estado de búsqueda","perfil.metricas_titulo":"Mi actividad","perfil.metricas_partidos":"Partidos jugados","perfil.metricas_reservas":"Reservas realizadas","perfil.metricas_torneos":"Torneos disputados","perfil.metricas_ranking":"Ranking actual","perfil.metricas_actividad":"Nivel de actividad","perfil.metricas_valoracion":"Valoración deportiva","perfil.metricas_fiabilidad":"Fiabilidad","perfil.metricas_racha":"Racha activa","perfil.historial_titulo":"Momentos del jugador","perfil.insignias_titulo":"Logros del jugador","perfil.privacidad_config":"Configuración de privacidad","perfil.privacidad_guardada":"Privacidad actualizada.","perfil.privacidad_perfil_visible":"Perfil visible para otros jugadores","perfil.privacidad_nivel":"Mostrar nivel de juego","perfil.privacidad_disponibilidad":"Mostrar disponibilidad","perfil.privacidad_stats":"Mostrar estadísticas","perfil.privacidad_invitaciones":"Permitir invitaciones a partidos","perfil.privacidad_recomendaciones":"Permitir recomendaciones de pareja","perfil.completitud_titulo":"Completitud del perfil","nav.perfil":"Perfil y ajustes",
    "login.subtitle":"Selecciona cómo quieres entrar a la aplicación. Cada rol tendrá una experiencia orientada a sus permisos: jugador, recepción, administrador o soporte técnico.",
    "login.idioma":"Idioma",
    "role.PLAYER.label":"Jugador / cliente","role.PLAYER.desc":"Reservar pistas, consultar reservas y ranking.",
    "role.STAFF.label":"Staff / recepción","role.STAFF.desc":"Gestión diaria de reservas, altas y atención al jugador.",
    "role.ADMIN.label":"Administrador / jefe","role.ADMIN.desc":"Panel de dirección, métricas y control operativo.",
    "role.SUPPORT.label":"Soporte técnico","role.SUPPORT.desc":"Zona técnica, integraciones y diagnóstico interno.",
    "home.reservas_hoy":"Reservas hoy","home.ocupacion_media":"Ocupación media",
    "home.socios_activos":"Socios activos","home.procesos_activos":"Procesos activos",
    "home.ingresos_mes":"Ingresos mes","home.torneos_activos":"Torneos activos",
    "home.estado_operativo":"Estado operativo","home.reservar":"Reservar",
    "home.torneo":"Torneo","home.alta":"Alta","home.procesos":"Procesos",
    "home.avisos_activos":"Avisos activos","home.ver_procesos":"Ver procesos",
    "home.vs_ayer":"vs ayer","home.pistas_activas":"4 pistas activas",
    "home.estimacion_mensual":"Estimación mensual","home.en_curso":"En curso",
    "home.este_mes":"este mes","home.incidencia":"incidencia","home.incidencias_s":"incidencias",
    "home.franja_horaria":"Franja horaria","home.tendencia_semanal":"Tendencia semanal",
    "home.porcentaje_uso":"Porcentaje de uso","home.procesos_conectados":"procesos conectados",
    "home.activos":"Activos","home.pausados":"Pausados","home.incidencias":"Incidencias","home.flujos_totales":"flujos totales","home.operativo_probado":"operativo (probado E2E)",
    "home.reservas_hora":"Reservas por hora — hoy","home.reservas_7dias":"Reservas últimos 7 días",
    "home.ocupacion_pista":"Ocupación por pista","home.estado_procesos":"Estado de procesos",
    "home.club_operativo":"Club de pádel","home.hero_accent":"operativo",
    "home.hero_subtitle":"SaaS separado por roles: jugador, recepción, administración y soporte.",
    "home.btn_torneos":"Torneos","home.btn_admin":"Admin",
    "home.ir_reservas":"Ir a reservas","home.ver_gestion":"Ver gestión",
    "home.ver_admin":"Ver admin","home.ver_soporte":"Ver soporte",
    "home.galeria":"Galería del club",
    "home.dias_semana":"L,M,X,J,V,S,D",
    "home.dias_largo":"Lun,Mar,Mié,Jue,Vie,Sáb,Dom",
    "admin.panel":"Panel de dirección","admin.metricas":"Métricas globales del club.",
    "admin.reservas_mes":"Reservas mes","admin.ocupacion":"Ocupación media",
    "admin.socios":"Socios activos","admin.procesos":"Procesos activos",
    "admin.backup":"Último backup","admin.ingr_mes":"Ingresos mes",
    "admin.vs_mes_anterior":"vs mes anterior","admin.prox_lunes":"Próximo: lunes 07:00",
    "admin.graf_hoy":"Reservas por hora — hoy","admin.graf_semana":"Evolución semanal",
    "admin.graf_pista":"Ocupación por pista","admin.sub_hoy":"Franja horaria · demo",
    "admin.sub_semana":"Reservas últimos 7 días · demo","admin.sub_pista":"Porcentaje de uso · demo",
    "admin.backup_semana":"Backup semanal","admin.integraciones":"Estado de integraciones",
    "admin.integ_desc":"Preparadas, pendientes de credenciales o pendientes de despliegue.",
    "soporte.title":"Soporte técnico","soporte.desc":"Control técnico de la aplicación.",
    "soporte.proteccion":"Protección requerida en producción",
    "soporte.vars":"Variables privadas",
    "flujos.title":"Centro técnico","flujos.desc":"Estado de automatizaciones del sistema.",
    "torneos.title":"Torneos","torneos.bracket":"Bracket interactivo",
    "torneos.anyadir":"Añadir pareja","torneos.reordenar":"Reordenar cruces",
    "torneos.autoasignar":"Autoasignar","torneos.guardar":"Guardar cuadro",
    "torneos.publicar":"Publicar","torneos.exportar":"Exportar",
    "torneos.ver_ranking":"Ver ranking completo","torneos.personalizado":"Personalizado",
    "torneos.jugadores":"Jugadores","torneos.parejas":"Parejas","torneos.ganador":"Ganador",
    "torneos.eliminada":"Eliminada","torneos.avanza":"Avanza","torneos.bye":"BYE",
    "torneos.pase_directo":"Pase directo","torneos.campeon":"Campeón",
    "torneos.subcampeon":"Subcampeón","torneos.tercer_puesto":"Tercer puesto",
    "reservas.nueva":"Nueva reserva","reservas.fecha":"Fecha","reservas.hora":"Hora",
    "reservas.pista":"Pista","reservas.duracion":"Duración","reservas.confirmar":"Confirmar reserva",
    "reservas.resumen":"Resumen","reservas.disponible":"Disponible","reservas.no_disponible":"No disponible",
    "reprog.clave":"Clave de reserva","reprog.nueva_fecha":"Nueva fecha",
    "reprog.nueva_hora":"Nueva hora de inicio","reprog.nueva_pista":"Nueva pista",
    "reprog.resumen":"Resumen del cambio","reprog.confirmo":"Confirmo que quiero trasladar esta reserva",
    "reprog.btn":"Reprogramar reserva","reprog.volver":"Volver a Reservas",
    "cancelar.motivo":"Motivo","cancelar.confirmar":"Confirmar cancelación","cancelar.volver":"Volver",
    "ranking.title":"Ranking","ranking.subtitle":"Clasificación general de jugadores y parejas",
    "ranking.categoria":"Categoría","ranking.nivel":"Nivel","ranking.puntos":"Puntos",
    "ranking.pts":"Pts","ranking.pareja":"Pareja","ranking.jugadores":"Jugadores",
    "ranking.v":"V","ranking.d":"D","ranking.pj":"PJ","ranking.racha":"Racha",
    "ranking.mov":"Mov.","ranking.pos":"#","ranking.ultima_act":"Última actualización",
    "ranking.filtrar":"Buscar jugador o pareja...","ranking.general":"General",
    "ranking.masculino":"Masculino","ranking.femenino":"Femenino","ranking.mixto":"Mixto",
    "ranking.iniciacion":"Iniciación","ranking.medio":"Medio","ranking.avanzado":"Avanzado",
    "ranking.podio":"Podio — Top 3","ranking.tabla":"Clasificación completa",
    "ranking.datos_ejemplo":"Datos de ejemplo","ranking.sistema_puntos":"Sistema de puntos del club configurable.",
    "ranking.temporada":"Temporada","ranking.buscar":"Buscar...",
    "ranking.campeon":"Campeón","ranking.subcampeon":"Subcampeón","ranking.tercero":"3er puesto",
    "ranking.mejor_pareja":"Mejor pareja","ranking.pts_totales":"pts totales",
    "ranking.sin_resultados":"Sin resultados con esos filtros.",
    "ranking.estado":"Estado","ranking.activo":"Activo",
    "common.cargando":"Cargando...","common.error":"Error","common.cancelar":"Cancelar",
    "common.confirmar":"Confirmar","common.guardar":"Guardar","common.volver":"Volver",
    "common.editar":"Editar","common.modo_seguro":"Modo seguro","common.entorno":"Entorno protegido",
    "common.sin_cambios":"Sin cambios",
    "alta.title":"Alta de jugador","alta.eyebrow":"Jugadores","alta.desc":"Añade un jugador al club.",
    "alta.nombre":"Nombre","alta.apellidos":"Apellidos","alta.email":"Email","alta.telefono":"Teléfono",
    "alta.fecha_nac":"Fecha de nacimiento","alta.nivel":"Nivel","alta.genero":"Género",
    "alta.comentarios":"Comentarios","alta.seleccionar":"Seleccionar",
    "alta.acepta":"Acepto las condiciones y privacidad.",
    "alta.exito":"✅ Jugador registrado correctamente.","alta.registrando":"Registrando...","alta.btn":"Dar de alta",
    "cancelar.title":"Cancelar reserva","cancelar.eyebrow":"Reservas","cancelar.desc":"Solicita la cancelación de una reserva.",
    "cancelar.clave":"Clave de reserva","cancelar.clave_ph":"Introduce tu clave de reserva",
    "cancelar.confirmo_check":"Confirmo que quiero solicitar la cancelación de esta reserva.",
    "cancelar.btn":"Cancelar reserva","cancelar.enviando":"Enviando...","cancelar.volver_reservas":"Volver a Reservas",
    "cancelar.que_ocurre":"Qué ocurre después",
    "reservas.title":"Reservar pista","reservas.eyebrow":"Reservas","reservas.desc":"Reserva tu pista en segundos.",
    "reservas.datos_jugador":"Datos del jugador","reservas.fecha_pista":"Fecha, hora y pista",
    "reservas.hora_fin":"Hora fin","reservas.total":"Total","reservas.ver_resumen":"Ver resumen",
    "reservas.editar":"Editar","reservas.confirmar_btn":"Confirmar","reservas.enviando":"Enviando...",
    "reservas.registrada":"Reserva registrada","reservas.nueva_btn":"Nueva reserva",
    "reservas.nombre":"Nombre","reservas.apellidos":"Apellidos","reservas.modalidad":"Modalidad",
    "reservas.nivel_form":"Nivel","reservas.comentarios":"Comentarios","reservas.minutos":"minutos",
    "reservas.confirmacion_desc":"La confirmación real dependerá del backend y de las integraciones configuradas.",
    "reprog.title":"Reprogramar reserva","reprog.eyebrow":"Reservas","reprog.desc":"Cambia la fecha u horario de tu reserva.",
    "reprog.hora_fin":"Hora fin","reprog.que_ocurre":"Qué ocurre después","reprog.enviando":"Enviando...","reprog.editar":"Editar",
    "soporte.eyebrow":"Soporte",
    "lang.buscar":"Buscar idioma, país, código, bandera…","lang.no_encontrados":"No se encontraron idiomas.",
    "lang.hint":"Prueba con el país, idioma, código o bandera. Ejemplo: España, Spain, es-ES o 🇪🇸","lang.recomendados":"Recomendados","lang.todos":"Todos los idiomas",
    "status.reserva.pendiente":"Pendiente","status.reserva.pendiente_txt":"Revisa los datos antes de confirmar.",
    "status.reserva.enviando":"Enviando","status.reserva.enviando_txt":"Estamos enviando la solicitud al servicio seguro de reservas.",
    "status.reserva.exito":"Éxito","status.reserva.exito_txt":"Reserva enviada correctamente. La disponibilidad se está actualizando.",
    "status.reserva.error":"Error","status.reserva.error_txt":"No se pudo completar la reserva. Revisa los datos e inténtalo de nuevo.",
    "status.cancelar.idle":"Pendiente","status.cancelar.idle_txt":"Confirma la cancelación de tu reserva.",
    "status.cancelar.enviando":"Enviando","status.cancelar.enviando_txt":"Estamos enviando la solicitud al servicio seguro de reservas.",
    "status.cancelar.exito":"Solicitud enviada","status.cancelar.exito_txt":"Solicitud de cancelación enviada correctamente.",
    "status.cancelar.error":"No se pudo enviar","status.cancelar.error_txt":"Revisa la clave e inténtalo de nuevo.",
    "status.reprog.idle":"Pendiente","status.reprog.idle_txt":"Elige una nueva fecha u horario.",
    "status.reprog.enviando":"Reprogramando","status.reprog.enviando_txt":"Estamos comprobando la disponibilidad y actualizando tu reserva.",
    "status.reprog.exito":"Reserva reprogramada","status.reprog.exito_txt":"La reserva se ha actualizado correctamente.",
    "status.reprog.error":"No se pudo reprogramar","status.reprog.error_txt":"Revisa los datos y vuelve a intentarlo.",
    "errors.nombre":"Introduce un nombre válido.","errors.apellidos":"Introduce apellidos válidos.",
    "errors.email":"Introduce un email válido.","errors.telefono":"Introduce un teléfono válido.",
    "errors.fecha":"Selecciona una fecha.","errors.fecha_pasado":"La fecha no puede ser anterior a hoy.",
    "errors.fecha_domingo":"El club está cerrado los domingos.",
    "errors.hora":"Selecciona una hora disponible.","errors.duracion":"Selecciona una duración válida.",
    "errors.hora_pasada":"La franja seleccionada ya ha pasado.",
    "errors.hora_cierre":"La reserva terminaría después del cierre del club.",
    "errors.pista":"Selecciona una pista válida.","errors.modalidad":"Selecciona una modalidad válida.",
    "errors.nivel":"Selecciona un nivel válido.",
    "errors.clave":"Introduce la clave de reserva.","errors.clave_incompleta":"La clave de reserva parece incompleta.",
    "errors.nueva_fecha":"Selecciona la nueva fecha.","errors.nueva_fecha_pasado":"La nueva fecha no puede ser anterior a hoy.",
    "errors.confirmado_reprog":"Confirma que quieres reprogramar la reserva.",
    "errors.confirmado_cancelar":"Confirma que quieres solicitar la cancelación antes de enviar.",
    "errors.datos_incompletos":"Hay datos incompletos o no válidos. Corrígelos antes de confirmar.",
    "errors.horario_ocupado":"Ese horario acaba de ocuparse. Elige otro hueco libre.",
    "errors.reserva_error":"No se pudo completar la reserva. Inténtalo de nuevo en unos segundos.",
    "errors.cancelar_error":"No se pudo enviar la solicitud. Revisa la clave e inténtalo de nuevo.",
    "errors.reprog_campos":"Completa correctamente todos los campos obligatorios.",
    "errors.reprog_ocupado":"Ese horario acaba de ocuparse. Selecciona otra franja libre.",
    "errors.reprog_error":"No se pudo completar la reprogramación. Comprueba la clave y vuelve a intentarlo.",
    "badge.confirmed":"Confirmada","badge.pending":"Pendiente","badge.completed":"Completada",
    "home.galeria_eyebrow":"Galería","home.galeria_desc":"Galería visual del club.","home.sistema":"Sistema",
    "cancelar.info1":"Procesaremos tu solicitud de forma segura.",
    "cancelar.info2":"La cancelación quedará registrada.",
    "cancelar.info3":"Puedes volver al calendario cuando quieras.",
    "reprog.info1":"La clave identifica la reserva que quieres cambiar.",
    "reprog.info2":"Se mantiene la misma clave después de reprogramar.",
    "reprog.info3":"Recibirás la confirmación por correo una vez procesado el cambio.",
    "reprog.info4":"Las notificaciones se activarán en una fase posterior.",
    "reprog.nueva_disponibilidad":"Nueva disponibilidad","reprog.selecciona_franja":"Selecciona una nueva franja disponible.",
    "flujos.exportar_json":"⬇ Exportar JSON","flujos.total_procesos":"Total procesos","flujos.auditados":"Auditados",
    "flujos.activos_label":"Activos","flujos.conectados":"Conectados","flujos.pausados_label":"Pausados",
    "flujos.en_pausa":"En pausa","flujos.incidencias_label":"Incidencias","flujos.ultimas_24h":"Últimas 24h",
    "flujos.tasa_exito":"Tasa de éxito","flujos.global_sistema":"Global del sistema",
    "flujos.ultimo_backup":"Último backup","flujos.automatico":"Automático",
    "flujos.estado_procesos_label":"Estado de procesos","flujos.por_estado":"Por estado de conexión",
    "flujos.actividad_24h":"Actividad últimas 24h","flujos.por_hora":"Por hora del día",
    "flujos.total_24h_label":"Total 24h","flujos.ejecuciones":"ejecuciones",
    "flujos.por_categoria":"Procesos por categoría","flujos.distribucion":"Distribución de los 50 procesos",
    "flujos.mas_activos":"Procesos más activos","flujos.con_incidencias":"Procesos con incidencias",
    "flujos.sin_errores":"✅ Sin errores registrados","flujos.criticos":"Estado de procesos críticos",
    "flujos.estado_op":"Estado operativo","flujos.todos_flujos":"Todos los flujos",
    "flujos.ocultar_tabla":"▲ Ocultar tabla","flujos.ver_tabla":"▼ Ver tabla completa",
    "flujos.col_flujo":"Flujo","flujos.col_categoria":"Categoría","flujos.col_estado":"Estado",
    "flujos.nota_integracion":"Integración técnica conectada. Los datos en tiempo real requieren conexión al backend del club.",
    "admin.gestion_eyebrow":"Gestión","admin.gestion_title":"Pistas y clientes",
    "admin.gestion_desc":"Módulos preparados para dirección operativa.",
    "admin.gestion_item1":"Gestión de pistas","admin.gestion_item2":"Clientes y perfiles",
    "admin.gestion_item3":"Histórico de reservas","admin.gestion_item4":"Reglas de disponibilidad",
    "admin.crec_eyebrow":"Crecimiento","admin.crec_title":"Torneos y procesos",
    "admin.crec_desc":"Zona preparada para activar procesos cuando exista backend.",
    "admin.crec_item1":"Torneos","admin.crec_item2":"Ranking y categorías",
    "admin.crec_item3":"Sistema de clasificación","admin.crec_item4":"Pagos futuros",
    "admin.backup_eyebrow":"Sistema activo","admin.backup_desc":"Copia automática de reservas y socios activos.",
    "admin.backup_item1":"Programación: lunes 07:00","admin.backup_item2":"Origen: Base de datos",
    "admin.backup_item3":"Destino: Almacenamiento","admin.backup_item4":"Confirmación: Notificaciones",
    "admin.sistema_eyebrow":"Sistema","admin.exito_label":"Éxito:",
    "auth.roles_title":"Roles y accesos","auth.pending_badge":"Pendiente de configurar",
    "auth.pending_desc":"Sistema de acceso configurado por roles. En producción debe protegerse por autenticación y backend de usuarios.",
    "auth.secciones":"Secciones:",
    "soporte.proteccion_h3":"Protección requerida en producción",
    "soporte.estado_tec_eyebrow":"Estado de integraciones","soporte.estado_tec_title":"Estado técnico",
    "soporte.estado_tec_desc":"Checklist de conexión backend.",
    "soporte.worker_item":"Worker de reservas preparado",
    "soporte.make_item":"Automatizaciones pendientes de secreto privado",
    "soporte.airtable_item":"Base de datos preparada sin escritura activa",
    "soporte.stripe_item":"Pagos y mensajería pendientes de configuración",
    "soporte.obs_eyebrow":"Observabilidad","soporte.obs_title":"Logs y errores",
    "soporte.obs_desc":"Zona reservada para diagnóstico cuando exista backend real.",
    "soporte.logs_worker":"Logs del Worker","soporte.logs_validaciones":"Validaciones",
    "soporte.logs_errores":"Errores de integraciones","soporte.logs_alertas":"Alertas técnicas futuras",
    "soporte.vars_h3":"Estado de seguridad: variables protegidas",
    "soporte.vars_no_names":"Los nombres y valores internos no se muestran en la interfaz.",
    "soporte.vars_validacion":"Validación disponible solo en documentación interna o consola segura.",
  },
  "en-GB": {
    "nav.inicio":"Home","nav.reservar":"Book","nav.alta_jugador":"Player registration",
    "nav.reprogramar":"Reschedule","nav.cancelar":"Cancel booking",
    "nav.gestion":"Bookings","nav.torneos":"Tournaments","nav.ranking":"Ranking",
    "nav.admin":"Admin","nav.flujos_make":"Tech centre","nav.soporte":"Support",
    "nav.comunidad":"Community",
    "nav.cerrar_sesion":"Sign out","nav.saas_label":"Secure SaaS","nav.cerrar_menu":"Close","nav.abrir_menu":"Menu",
    "login.title":"Log in as role","login.entrar":"Enter","login.cancelar":"Cancel",
    "login.password":"Password","login.ver_pwd":"👁️ Show password","login.ocultar_pwd":"🙈 Hide password",
    "login.guardar_sesion":"Remember me on this device","login.acceder_como":"Log in as",
    "login.intro_pwd":"Enter the password assigned to this role.",
    "login.error_rol":"Please select a valid role.","login.error_pwd":"Incorrect password for this role.",
    "login.sesion_label":"Club Pádel 04 · Login",
    "login.legal":"Local access protected by password. Session can be saved on this device only. For production, credentials must be validated from secure backend.",
    "login.olvide_pwd":"Forgot your password?","login.recuperar_title":"Recover access","login.recuperar_desc":"Enter your email address and, if the account exists, you will receive instructions to reset your access.","login.recuperar_email":"Email address","login.recuperar_btn":"Send instructions","login.recuperar_enviado":"If that address is registered in the system, you will receive instructions shortly. Also check your spam folder.","login.recuperar_volver":"Back to login","login.recuperar_preparado":"Ready for endpoint: /api/auth/forgot-password","login.recuperar_no_disponible":"Password recovery is not available in this environment yet: pending activation of the authentication provider.","login.recuperar_cargando":"Sending instructions…",
    "perfil.title":"Profile & settings","perfil.eyebrow":"My account","perfil.sesion":"Active session","perfil.rol_actual":"Current role","perfil.cerrar_sesion":"Log out","perfil.cambiar_pwd":"Change password","perfil.pwd_actual":"Current password","perfil.pwd_nueva":"New password","perfil.pwd_confirmar":"Confirm new password","perfil.pwd_guardada":"Password updated (local demo mode).","perfil.pwd_error_vacia":"Enter current password.","perfil.pwd_error_nueva":"Minimum 8 characters, uppercase, lowercase and number.","perfil.pwd_error_coincide":"Passwords do not match.","perfil.idioma":"Interface language","perfil.info_demo":"Profile in local mode. Data is saved on this device only.","perfil.privacidad":"Privacy","perfil.privacidad_desc":"In production, personal data will be managed in compliance with GDPR.","perfil.notificaciones":"Notifications","perfil.notif_desc":"Ready for email and messaging notifications in production.","perfil.avatar_cambiar":"Change profile photo","perfil.avatar_eliminar":"Remove photo","perfil.avatar_confirmar_del":"Remove your profile photo?","perfil.avatar_guardada":"Photo updated.","perfil.avatar_eliminada":"Photo removed.","perfil.avatar_error_tipo":"Images only (JPG, PNG, WEBP).","perfil.avatar_error_size":"Maximum 5 MB.","perfil.bio_titulo":"Your introduction","perfil.bio_placeholder":"Tell us about your game, level or availability...","perfil.bio_guardar":"Save","perfil.bio_cancelar":"Cancel","perfil.bio_guardada":"Introduction saved.","perfil.bio_editar":"Edit introduction","perfil.bio_chars":"characters","perfil.deporte_titulo":"Sports profile","perfil.deporte_guardar":"Save data","perfil.deporte_guardados":"Sports data saved.","perfil.deporte_mano":"Dominant hand","perfil.deporte_posicion":"Preferred position","perfil.deporte_nivel":"Skill level","perfil.deporte_disponibilidad":"Usual availability","perfil.deporte_tipo_partida":"Match type","perfil.deporte_objetivo":"Main goal","perfil.deporte_busqueda":"Search status","perfil.metricas_titulo":"My activity","perfil.metricas_partidos":"Matches played","perfil.metricas_reservas":"Bookings made","perfil.metricas_torneos":"Tournaments played","perfil.metricas_ranking":"Current ranking","perfil.metricas_actividad":"Activity level","perfil.metricas_valoracion":"Sports rating","perfil.metricas_fiabilidad":"Reliability","perfil.metricas_racha":"Active streak","perfil.historial_titulo":"Player moments","perfil.insignias_titulo":"Player achievements","perfil.privacidad_config":"Privacy settings","perfil.privacidad_guardada":"Privacy updated.","perfil.privacidad_perfil_visible":"Profile visible to other players","perfil.privacidad_nivel":"Show skill level","perfil.privacidad_disponibilidad":"Show availability","perfil.privacidad_stats":"Show statistics","perfil.privacidad_invitaciones":"Allow match invitations","perfil.privacidad_recomendaciones":"Allow partner recommendations","perfil.completitud_titulo":"Profile completeness","nav.perfil":"Profile & settings",
    "login.subtitle":"Select how you want to enter the application. Each role has an experience tailored to its permissions: player, reception, administrator or technical support.",
    "login.idioma":"Language",
    "role.PLAYER.label":"Player / client","role.PLAYER.desc":"Book courts, check bookings and ranking.",
    "role.STAFF.label":"Staff / reception","role.STAFF.desc":"Daily management of bookings, sign-ups and player assistance.",
    "role.ADMIN.label":"Administrator","role.ADMIN.desc":"Management panel, metrics and operational control.",
    "role.SUPPORT.label":"Technical support","role.SUPPORT.desc":"Technical zone, integrations and internal diagnostics.",
    "home.reservas_hoy":"Bookings today","home.ocupacion_media":"Avg. occupancy",
    "home.socios_activos":"Active members","home.procesos_activos":"Active processes",
    "home.ingresos_mes":"Monthly revenue","home.torneos_activos":"Active tournaments",
    "home.estado_operativo":"Operational status","home.reservar":"Book",
    "home.torneo":"Tournament","home.alta":"Sign up","home.procesos":"Processes",
    "home.avisos_activos":"Active alerts","home.ver_procesos":"View processes",
    "home.vs_ayer":"vs yesterday","home.pistas_activas":"4 active courts",
    "home.estimacion_mensual":"Monthly estimate","home.en_curso":"In progress",
    "home.este_mes":"this month","home.incidencia":"incident","home.incidencias_s":"incidents",
    "home.franja_horaria":"Time slot","home.tendencia_semanal":"Weekly trend",
    "home.porcentaje_uso":"Usage %","home.procesos_conectados":"connected processes",
    "home.activos":"Active","home.pausados":"Paused","home.incidencias":"Incidents","home.flujos_totales":"total flows","home.operativo_probado":"operational (E2E tested)",
    "home.reservas_hora":"Bookings by hour — today","home.reservas_7dias":"Bookings last 7 days",
    "home.ocupacion_pista":"Court occupancy","home.estado_procesos":"Process status",
    "home.club_operativo":"Padel club","home.hero_accent":"operational",
    "home.hero_subtitle":"SaaS by roles: player, reception, administration and support.",
    "home.btn_torneos":"Tournaments","home.btn_admin":"Admin",
    "home.ir_reservas":"Go to bookings","home.ver_gestion":"Manage bookings",
    "home.ver_admin":"View admin","home.ver_soporte":"View support",
    "home.galeria":"Club gallery",
    "home.dias_semana":"M,T,W,T,F,S,S",
    "home.dias_largo":"Mon,Tue,Wed,Thu,Fri,Sat,Sun",
    "admin.panel":"Management panel","admin.metricas":"Club global metrics.",
    "admin.reservas_mes":"Monthly bookings","admin.ocupacion":"Avg. occupancy",
    "admin.socios":"Active members","admin.procesos":"Active processes",
    "admin.backup":"Last backup","admin.ingr_mes":"Monthly revenue",
    "admin.vs_mes_anterior":"vs previous month","admin.prox_lunes":"Next: Monday 07:00",
    "admin.graf_hoy":"Bookings by hour — today","admin.graf_semana":"Weekly evolution",
    "admin.graf_pista":"Court occupancy","admin.sub_hoy":"Time slot · demo",
    "admin.sub_semana":"Bookings last 7 days · demo","admin.sub_pista":"Usage % · demo",
    "admin.backup_semana":"Weekly backup","admin.integraciones":"Integration status",
    "admin.integ_desc":"Ready, pending credentials or pending deployment.",
    "soporte.title":"Technical support","soporte.desc":"Application technical control.",
    "soporte.proteccion":"Production protection required",
    "soporte.vars":"Private variables",
    "flujos.title":"Tech centre","flujos.desc":"System automation status.",
    "torneos.title":"Tournaments","torneos.bracket":"Interactive bracket",
    "torneos.anyadir":"Add pair","torneos.reordenar":"Reorder matches",
    "torneos.autoasignar":"Auto-assign","torneos.guardar":"Save bracket",
    "torneos.publicar":"Publish","torneos.exportar":"Export",
    "torneos.ver_ranking":"View full ranking","torneos.personalizado":"Custom",
    "torneos.jugadores":"Players","torneos.parejas":"Pairs","torneos.ganador":"Winner",
    "torneos.eliminada":"Eliminated","torneos.avanza":"Advances","torneos.bye":"BYE",
    "torneos.pase_directo":"Direct pass","torneos.campeon":"Champion",
    "torneos.subcampeon":"Runner-up","torneos.tercer_puesto":"Third place",
    "reservas.nueva":"New booking","reservas.fecha":"Date","reservas.hora":"Time",
    "reservas.pista":"Court","reservas.duracion":"Duration","reservas.confirmar":"Confirm booking",
    "reservas.resumen":"Summary","reservas.disponible":"Available","reservas.no_disponible":"Unavailable",
    "reprog.clave":"Booking key","reprog.nueva_fecha":"New date",
    "reprog.nueva_hora":"New start time","reprog.nueva_pista":"New court",
    "reprog.resumen":"Change summary","reprog.confirmo":"I confirm I want to reschedule this booking",
    "reprog.btn":"Reschedule booking","reprog.volver":"Back to bookings",
    "cancelar.motivo":"Reason","cancelar.confirmar":"Confirm cancellation","cancelar.volver":"Back",
    "ranking.title":"Ranking","ranking.subtitle":"General ranking of players and pairs",
    "ranking.categoria":"Category","ranking.nivel":"Level","ranking.puntos":"Points",
    "ranking.pts":"Pts","ranking.pareja":"Pair","ranking.jugadores":"Players",
    "ranking.v":"W","ranking.d":"L","ranking.pj":"P","ranking.racha":"Streak",
    "ranking.mov":"Mov.","ranking.pos":"#","ranking.ultima_act":"Last updated",
    "ranking.filtrar":"Search player or pair...","ranking.general":"General",
    "ranking.masculino":"Men's","ranking.femenino":"Women's","ranking.mixto":"Mixed",
    "ranking.iniciacion":"Beginner","ranking.medio":"Intermediate","ranking.avanzado":"Advanced",
    "ranking.podio":"Podium — Top 3","ranking.tabla":"Full ranking",
    "ranking.datos_ejemplo":"Sample data","ranking.sistema_puntos":"Club configurable points system.",
    "ranking.temporada":"Season","ranking.buscar":"Search...",
    "ranking.campeon":"Champion","ranking.subcampeon":"Runner-up","ranking.tercero":"3rd place",
    "ranking.mejor_pareja":"Best pair","ranking.pts_totales":"total pts",
    "ranking.sin_resultados":"No results with those filters.",
    "ranking.estado":"Status","ranking.activo":"Active",
    "common.cargando":"Loading...","common.error":"Error","common.cancelar":"Cancel",
    "common.confirmar":"Confirm","common.guardar":"Save","common.volver":"Back",
    "common.editar":"Edit","common.modo_seguro":"Safe mode","common.entorno":"Protected environment",
    "common.sin_cambios":"No change",
    "alta.title":"Player registration","alta.eyebrow":"Players","alta.desc":"Add a player to the club.",
    "alta.nombre":"First name","alta.apellidos":"Surname","alta.email":"Email","alta.telefono":"Phone",
    "alta.fecha_nac":"Date of birth","alta.nivel":"Level","alta.genero":"Gender",
    "alta.comentarios":"Comments","alta.seleccionar":"Select",
    "alta.acepta":"I accept the terms and privacy policy.",
    "alta.exito":"✅ Player registered successfully.","alta.registrando":"Registering...","alta.btn":"Register player",
    "cancelar.title":"Cancel booking","cancelar.eyebrow":"Bookings","cancelar.desc":"Request cancellation of a booking.",
    "cancelar.clave":"Booking key","cancelar.clave_ph":"Enter your booking key",
    "cancelar.confirmo_check":"I confirm I want to request cancellation of this booking.",
    "cancelar.btn":"Cancel booking","cancelar.enviando":"Sending...","cancelar.volver_reservas":"Back to bookings",
    "cancelar.que_ocurre":"What happens next",
    "reservas.title":"Book a court","reservas.eyebrow":"Bookings","reservas.desc":"Book your court in seconds.",
    "reservas.datos_jugador":"Player details","reservas.fecha_pista":"Date, time and court",
    "reservas.hora_fin":"End time","reservas.total":"Total","reservas.ver_resumen":"Review",
    "reservas.editar":"Edit","reservas.confirmar_btn":"Confirm","reservas.enviando":"Sending...",
    "reservas.registrada":"Booking registered","reservas.nueva_btn":"New booking",
    "reservas.nombre":"First name","reservas.apellidos":"Surname","reservas.modalidad":"Mode",
    "reservas.nivel_form":"Level","reservas.comentarios":"Comments","reservas.minutos":"minutes",
    "reservas.confirmacion_desc":"Real confirmation depends on the backend and configured integrations.",
    "reprog.title":"Reschedule booking","reprog.eyebrow":"Bookings","reprog.desc":"Change the date or time of your booking.",
    "reprog.hora_fin":"End time","reprog.que_ocurre":"What happens next","reprog.enviando":"Sending...","reprog.editar":"Edit",
    "soporte.eyebrow":"Support",
    "lang.buscar":"Search language, country, code, flag…","lang.no_encontrados":"No languages found.",
    "lang.hint":"Try country, language, code or flag. Example: Spain, Español, es-ES or 🇪🇸","lang.recomendados":"Recommended","lang.todos":"All languages",
    "status.reserva.pendiente":"Pending","status.reserva.pendiente_txt":"Review your details before confirming.",
    "status.reserva.enviando":"Sending","status.reserva.enviando_txt":"We are sending your booking request.",
    "status.reserva.exito":"Success","status.reserva.exito_txt":"Booking sent successfully. Availability is being updated.",
    "status.reserva.error":"Error","status.reserva.error_txt":"Could not complete the booking. Check your details and try again.",
    "status.cancelar.idle":"Pending","status.cancelar.idle_txt":"Confirm the cancellation of your booking.",
    "status.cancelar.enviando":"Sending","status.cancelar.enviando_txt":"We are sending your cancellation request.",
    "status.cancelar.exito":"Request sent","status.cancelar.exito_txt":"Cancellation request sent successfully.",
    "status.cancelar.error":"Could not send","status.cancelar.error_txt":"Check the key and try again.",
    "status.reprog.idle":"Pending","status.reprog.idle_txt":"Choose a new date or time.",
    "status.reprog.enviando":"Rescheduling","status.reprog.enviando_txt":"Checking availability and updating your booking.",
    "status.reprog.exito":"Booking rescheduled","status.reprog.exito_txt":"Your booking has been updated successfully.",
    "status.reprog.error":"Could not reschedule","status.reprog.error_txt":"Check your details and try again.",
    "errors.nombre":"Please enter a valid first name.","errors.apellidos":"Please enter a valid surname.",
    "errors.email":"Please enter a valid email.","errors.telefono":"Please enter a valid phone number.",
    "errors.fecha":"Please select a date.","errors.fecha_pasado":"The date cannot be in the past.",
    "errors.fecha_domingo":"The club is closed on Sundays.",
    "errors.hora":"Please select an available time.","errors.duracion":"Please select a valid duration.",
    "errors.hora_pasada":"The selected slot has already passed.",
    "errors.hora_cierre":"The booking would end after club closing time.",
    "errors.pista":"Please select a valid court.","errors.modalidad":"Please select a valid mode.",
    "errors.nivel":"Please select a valid level.",
    "errors.clave":"Please enter the booking key.","errors.clave_incompleta":"The booking key seems incomplete.",
    "errors.nueva_fecha":"Please select the new date.","errors.nueva_fecha_pasado":"The new date cannot be in the past.",
    "errors.confirmado_reprog":"Please confirm you want to reschedule the booking.",
    "errors.confirmado_cancelar":"Please confirm you want to request cancellation before sending.",
    "errors.datos_incompletos":"Some details are incomplete or invalid. Please correct them before confirming.",
    "errors.horario_ocupado":"That slot has just been taken. Please choose another.",
    "errors.reserva_error":"Could not complete the booking. Please try again in a few seconds.",
    "errors.cancelar_error":"Could not send the request. Check the key and try again.",
    "errors.reprog_campos":"Please fill in all required fields correctly.",
    "errors.reprog_ocupado":"That slot has just been taken. Please select another.",
    "errors.reprog_error":"Could not complete the reschedule. Check the key and try again.",
    "badge.confirmed":"Confirmed","badge.pending":"Pending","badge.completed":"Completed",
    "home.galeria_eyebrow":"Gallery","home.galeria_desc":"Visual gallery of the club.","home.sistema":"System",
    "cancelar.info1":"We will process your request securely.",
    "cancelar.info2":"The cancellation will be recorded.",
    "cancelar.info3":"You can return to the calendar whenever you like.",
    "reprog.info1":"The key identifies the booking you want to change.",
    "reprog.info2":"The same key is kept after rescheduling.",
    "reprog.info3":"You will receive confirmation by email once the change is processed.",
    "reprog.info4":"Notifications will be activated in a later phase.",
    "reprog.nueva_disponibilidad":"New availability","reprog.selecciona_franja":"Select a new available slot.",
    "flujos.exportar_json":"⬇ Export JSON","flujos.total_procesos":"Total processes","flujos.auditados":"Audited",
    "flujos.activos_label":"Active","flujos.conectados":"Connected","flujos.pausados_label":"Paused",
    "flujos.en_pausa":"On pause","flujos.incidencias_label":"Incidents","flujos.ultimas_24h":"Last 24h",
    "flujos.tasa_exito":"Success rate","flujos.global_sistema":"System global",
    "flujos.ultimo_backup":"Last backup","flujos.automatico":"Automatic",
    "flujos.estado_procesos_label":"Process status","flujos.por_estado":"By connection status",
    "flujos.actividad_24h":"Activity last 24h","flujos.por_hora":"By time of day",
    "flujos.total_24h_label":"Total 24h","flujos.ejecuciones":"executions",
    "flujos.por_categoria":"Processes by category","flujos.distribucion":"Distribution of 50 processes",
    "flujos.mas_activos":"Most active processes","flujos.con_incidencias":"Processes with incidents",
    "flujos.sin_errores":"✅ No errors recorded","flujos.criticos":"Critical process status",
    "flujos.estado_op":"Operational status","flujos.todos_flujos":"All processes",
    "flujos.ocultar_tabla":"▲ Hide table","flujos.ver_tabla":"▼ View full table",
    "flujos.col_flujo":"Process","flujos.col_categoria":"Category","flujos.col_estado":"Status",
    "flujos.nota_integracion":"Technical integration connected. Real-time data requires connection to the club backend.",
    "admin.gestion_eyebrow":"Management","admin.gestion_title":"Courts and clients",
    "admin.gestion_desc":"Modules ready for operational management.",
    "admin.gestion_item1":"Court management","admin.gestion_item2":"Clients and profiles",
    "admin.gestion_item3":"Booking history","admin.gestion_item4":"Availability rules",
    "admin.crec_eyebrow":"Growth","admin.crec_title":"Tournaments and processes",
    "admin.crec_desc":"Area ready to activate processes when backend is available.",
    "admin.crec_item1":"Tournaments","admin.crec_item2":"Ranking and categories",
    "admin.crec_item3":"Classification system","admin.crec_item4":"Future payments",
    "admin.backup_eyebrow":"Active system","admin.backup_desc":"Automatic backup of bookings and active members.",
    "admin.backup_item1":"Schedule: Monday 07:00","admin.backup_item2":"Source: Database",
    "admin.backup_item3":"Destination: Storage","admin.backup_item4":"Confirmation: Notifications",
    "admin.sistema_eyebrow":"System","admin.exito_label":"Success:",
    "auth.roles_title":"Roles and access","auth.pending_badge":"Pending configuration",
    "auth.pending_desc":"Role-based access system. In production it must be protected by an authentication provider and user backend.",
    "auth.secciones":"Sections:",
    "soporte.proteccion_h3":"Production protection required",
    "soporte.estado_tec_eyebrow":"Integration status","soporte.estado_tec_title":"Technical status",
    "soporte.estado_tec_desc":"Backend connection checklist.",
    "soporte.worker_item":"Booking worker ready",
    "soporte.make_item":"Automations pending private secret",
    "soporte.airtable_item":"Database ready without active writes",
    "soporte.stripe_item":"Payments and messaging pending configuration",
    "soporte.obs_eyebrow":"Observability","soporte.obs_title":"Logs and errors",
    "soporte.obs_desc":"Reserved area for diagnostics when real backend is available.",
    "soporte.logs_worker":"Worker logs","soporte.logs_validaciones":"Validations",
    "soporte.logs_errores":"Integration errors","soporte.logs_alertas":"Future technical alerts",
    "soporte.vars_h3":"Security status: protected variables",
    "soporte.vars_no_names":"Internal names and values are not shown in the interface.",
    "soporte.vars_validacion":"Validation available only in internal documentation or a secure console.",
  },
  "en-US": {
    "nav.inicio":"Home","nav.reservar":"Book","nav.alta_jugador":"Player registration",
    "nav.reprogramar":"Reschedule","nav.cancelar":"Cancel booking",
    "nav.gestion":"Bookings","nav.torneos":"Tournaments","nav.ranking":"Ranking",
    "nav.admin":"Admin","nav.flujos_make":"Tech center","nav.soporte":"Support",
    "nav.comunidad":"Community",
    "nav.cerrar_sesion":"Sign out","nav.saas_label":"Secure SaaS","nav.cerrar_menu":"Close","nav.abrir_menu":"Menu",
    "login.title":"Sign in as role","login.entrar":"Sign in","login.cancelar":"Cancel",
    "login.password":"Password","login.ver_pwd":"👁️ Show password","login.ocultar_pwd":"🙈 Hide password",
    "login.guardar_sesion":"Remember me on this device","login.acceder_como":"Sign in as",
    "login.intro_pwd":"Enter the password assigned to this role.",
    "login.error_rol":"Please select a valid role.","login.error_pwd":"Incorrect password for this role.",
    "login.sesion_label":"Club Pádel 04 · Sign In",
    "login.legal":"Local access protected by password. Session can be saved on this device only.",
    "login.olvide_pwd":"Forgot your password?","login.recuperar_title":"Recover access","login.recuperar_desc":"Enter your email address and, if the account exists, you will receive instructions to reset your access.","login.recuperar_email":"Email address","login.recuperar_btn":"Send instructions","login.recuperar_enviado":"If that address is registered in the system, you will receive instructions shortly. Also check your spam folder.","login.recuperar_volver":"Back to login","login.recuperar_preparado":"Ready for endpoint: /api/auth/forgot-password","login.recuperar_no_disponible":"Password recovery is not available in this environment yet: pending activation of the authentication provider.","login.recuperar_cargando":"Sending instructions…",
    "perfil.title":"Profile & settings","perfil.eyebrow":"My account","perfil.sesion":"Active session","perfil.rol_actual":"Current role","perfil.cerrar_sesion":"Log out","perfil.cambiar_pwd":"Change password","perfil.pwd_actual":"Current password","perfil.pwd_nueva":"New password","perfil.pwd_confirmar":"Confirm new password","perfil.pwd_guardada":"Password updated (local demo mode).","perfil.pwd_error_vacia":"Enter current password.","perfil.pwd_error_nueva":"Minimum 8 characters, uppercase, lowercase and number.","perfil.pwd_error_coincide":"Passwords do not match.","perfil.idioma":"Interface language","perfil.info_demo":"Profile in local mode. Data is saved on this device only.","perfil.privacidad":"Privacy","perfil.privacidad_desc":"In production, personal data will be managed in compliance with applicable privacy law.","perfil.notificaciones":"Notifications","perfil.notif_desc":"Ready for email and messaging notifications in production.","perfil.avatar_cambiar":"Change profile photo","perfil.avatar_eliminar":"Remove photo","perfil.avatar_confirmar_del":"Remove your profile photo?","perfil.avatar_guardada":"Photo updated.","perfil.avatar_eliminada":"Photo removed.","perfil.avatar_error_tipo":"Images only (JPG, PNG, WEBP).","perfil.avatar_error_size":"Maximum 5 MB.","perfil.bio_titulo":"Your introduction","perfil.bio_placeholder":"Tell us about your game, level or availability...","perfil.bio_guardar":"Save","perfil.bio_cancelar":"Cancel","perfil.bio_guardada":"Introduction saved.","perfil.bio_editar":"Edit introduction","perfil.bio_chars":"characters","perfil.deporte_titulo":"Sports profile","perfil.deporte_guardar":"Save data","perfil.deporte_guardados":"Sports data saved.","perfil.deporte_mano":"Dominant hand","perfil.deporte_posicion":"Preferred position","perfil.deporte_nivel":"Skill level","perfil.deporte_disponibilidad":"Usual availability","perfil.deporte_tipo_partida":"Match type","perfil.deporte_objetivo":"Main goal","perfil.deporte_busqueda":"Search status","perfil.metricas_titulo":"My activity","perfil.metricas_partidos":"Matches played","perfil.metricas_reservas":"Bookings made","perfil.metricas_torneos":"Tournaments played","perfil.metricas_ranking":"Current ranking","perfil.metricas_actividad":"Activity level","perfil.metricas_valoracion":"Sports rating","perfil.metricas_fiabilidad":"Reliability","perfil.metricas_racha":"Active streak","perfil.historial_titulo":"Player moments","perfil.insignias_titulo":"Player achievements","perfil.privacidad_config":"Privacy settings","perfil.privacidad_guardada":"Privacy updated.","perfil.privacidad_perfil_visible":"Profile visible to other players","perfil.privacidad_nivel":"Show skill level","perfil.privacidad_disponibilidad":"Show availability","perfil.privacidad_stats":"Show statistics","perfil.privacidad_invitaciones":"Allow match invitations","perfil.privacidad_recomendaciones":"Allow partner recommendations","perfil.completitud_titulo":"Profile completeness","nav.perfil":"Profile & settings",
    "login.subtitle":"Select how you want to enter the app. Each role has an experience tailored to its permissions.",
    "login.idioma":"Language",
    "role.PLAYER.label":"Player / client","role.PLAYER.desc":"Book courts, view bookings and ranking.",
    "role.STAFF.label":"Staff / front desk","role.STAFF.desc":"Daily management of bookings and player assistance.",
    "role.ADMIN.label":"Administrator","role.ADMIN.desc":"Dashboard, metrics and operational control.",
    "role.SUPPORT.label":"Technical support","role.SUPPORT.desc":"Technical zone, integrations and internal diagnostics.",
    "home.reservas_hoy":"Bookings today","home.ocupacion_media":"Avg. occupancy",
    "home.socios_activos":"Active members","home.procesos_activos":"Active processes",
    "home.ingresos_mes":"Monthly revenue","home.torneos_activos":"Active tournaments",
    "home.estado_operativo":"System status","home.reservar":"Book",
    "home.torneo":"Tournament","home.alta":"Register","home.procesos":"Processes",
    "home.avisos_activos":"Active alerts","home.ver_procesos":"View processes",
    "home.vs_ayer":"vs yesterday","home.pistas_activas":"4 active courts",
    "home.estimacion_mensual":"Monthly estimate","home.en_curso":"In progress",
    "home.este_mes":"this month","home.incidencia":"incident","home.incidencias_s":"incidents",
    "home.franja_horaria":"Time slot","home.tendencia_semanal":"Weekly trend",
    "home.porcentaje_uso":"Usage %","home.procesos_conectados":"connected processes",
    "home.activos":"Active","home.pausados":"Paused","home.incidencias":"Incidents","home.flujos_totales":"total flows","home.operativo_probado":"operational (E2E tested)",
    "home.reservas_hora":"Bookings by hour — today","home.reservas_7dias":"Bookings last 7 days",
    "home.ocupacion_pista":"Court occupancy","home.estado_procesos":"Process status",
    "home.club_operativo":"Padel club","home.hero_accent":"operational",
    "home.hero_subtitle":"SaaS by roles: player, front desk, administration and support.",
    "home.btn_torneos":"Tournaments","home.btn_admin":"Admin",
    "home.ir_reservas":"Go to bookings","home.ver_gestion":"Manage bookings",
    "home.ver_admin":"View admin","home.ver_soporte":"View support",
    "home.galeria":"Club gallery",
    "home.dias_semana":"M,T,W,T,F,S,S",
    "home.dias_largo":"Mon,Tue,Wed,Thu,Fri,Sat,Sun",
    "admin.panel":"Management panel","admin.metricas":"Club global metrics.",
    "admin.reservas_mes":"Monthly bookings","admin.ocupacion":"Avg. occupancy",
    "admin.socios":"Active members","admin.procesos":"Active processes",
    "admin.backup":"Last backup","admin.ingr_mes":"Monthly revenue",
    "admin.vs_mes_anterior":"vs previous month","admin.prox_lunes":"Next: Monday 07:00",
    "admin.graf_hoy":"Bookings by hour — today","admin.graf_semana":"Weekly evolution",
    "admin.graf_pista":"Court occupancy","admin.sub_hoy":"Time slot · demo",
    "admin.sub_semana":"Bookings last 7 days · demo","admin.sub_pista":"Usage % · demo",
    "admin.backup_semana":"Weekly backup","admin.integraciones":"Integration status",
    "admin.integ_desc":"Ready, pending credentials or pending deployment.",
    "soporte.title":"Technical support","soporte.desc":"Application technical control.",
    "soporte.proteccion":"Production protection required",
    "soporte.vars":"Private variables",
    "flujos.title":"Tech center","flujos.desc":"System automation status.",
    "torneos.title":"Tournaments","torneos.bracket":"Interactive bracket",
    "torneos.anyadir":"Add pair","torneos.reordenar":"Reorder matches",
    "torneos.autoasignar":"Auto-assign","torneos.guardar":"Save bracket",
    "torneos.publicar":"Publish","torneos.exportar":"Export",
    "torneos.ver_ranking":"View full ranking","torneos.personalizado":"Custom",
    "torneos.jugadores":"Players","torneos.parejas":"Pairs","torneos.ganador":"Winner",
    "torneos.eliminada":"Eliminated","torneos.avanza":"Advances","torneos.bye":"BYE",
    "torneos.pase_directo":"Direct pass","torneos.campeon":"Champion",
    "torneos.subcampeon":"Runner-up","torneos.tercer_puesto":"Third place",
    "reservas.nueva":"New booking","reservas.fecha":"Date","reservas.hora":"Time",
    "reservas.pista":"Court","reservas.duracion":"Duration","reservas.confirmar":"Confirm booking",
    "reservas.resumen":"Summary","reservas.disponible":"Available","reservas.no_disponible":"Unavailable",
    "reprog.clave":"Booking key","reprog.nueva_fecha":"New date",
    "reprog.nueva_hora":"New start time","reprog.nueva_pista":"New court",
    "reprog.resumen":"Change summary","reprog.confirmo":"I confirm I want to reschedule this booking",
    "reprog.btn":"Reschedule booking","reprog.volver":"Back to bookings",
    "cancelar.motivo":"Reason","cancelar.confirmar":"Confirm cancellation","cancelar.volver":"Back",
    "ranking.title":"Ranking","ranking.subtitle":"General ranking of players and pairs",
    "ranking.categoria":"Category","ranking.nivel":"Level","ranking.puntos":"Points",
    "ranking.pts":"Pts","ranking.pareja":"Pair","ranking.jugadores":"Players",
    "ranking.v":"W","ranking.d":"L","ranking.pj":"P","ranking.racha":"Streak",
    "ranking.mov":"Mov.","ranking.pos":"#","ranking.ultima_act":"Last updated",
    "ranking.filtrar":"Search player or pair...","ranking.general":"General",
    "ranking.masculino":"Men's","ranking.femenino":"Women's","ranking.mixto":"Mixed",
    "ranking.iniciacion":"Beginner","ranking.medio":"Intermediate","ranking.avanzado":"Advanced",
    "ranking.podio":"Podium — Top 3","ranking.tabla":"Full ranking",
    "ranking.datos_ejemplo":"Sample data","ranking.sistema_puntos":"Club configurable points system.",
    "ranking.temporada":"Season","ranking.buscar":"Search...",
    "ranking.campeon":"Champion","ranking.subcampeon":"Runner-up","ranking.tercero":"3rd place",
    "ranking.mejor_pareja":"Best pair","ranking.pts_totales":"total pts",
    "ranking.sin_resultados":"No results with those filters.",
    "ranking.estado":"Status","ranking.activo":"Active",
    "common.cargando":"Loading...","common.error":"Error","common.cancelar":"Cancel",
    "common.confirmar":"Confirm","common.guardar":"Save","common.volver":"Back",
    "common.editar":"Edit","common.modo_seguro":"Safe mode","common.entorno":"Protected environment",
    "common.sin_cambios":"No change",
    "alta.title":"Player registration","alta.eyebrow":"Players","alta.desc":"Add a player to the club.",
    "alta.nombre":"First name","alta.apellidos":"Last name","alta.email":"Email","alta.telefono":"Phone",
    "alta.fecha_nac":"Date of birth","alta.nivel":"Level","alta.genero":"Gender",
    "alta.comentarios":"Comments","alta.seleccionar":"Select",
    "alta.acepta":"I accept the terms and privacy policy.",
    "alta.exito":"✅ Player registered successfully.","alta.registrando":"Registering...","alta.btn":"Register player",
    "cancelar.title":"Cancel booking","cancelar.eyebrow":"Bookings","cancelar.desc":"Request cancellation of a booking.",
    "cancelar.clave":"Booking key","cancelar.clave_ph":"Enter your booking key",
    "cancelar.confirmo_check":"I confirm I want to cancel this booking.",
    "cancelar.btn":"Cancel booking","cancelar.enviando":"Sending...","cancelar.volver_reservas":"Back to bookings",
    "cancelar.que_ocurre":"What happens next",
    "reservas.title":"Book a court","reservas.eyebrow":"Bookings","reservas.desc":"Book your court in seconds.",
    "reservas.datos_jugador":"Player details","reservas.fecha_pista":"Date, time and court",
    "reservas.hora_fin":"End time","reservas.total":"Total","reservas.ver_resumen":"Review",
    "reservas.editar":"Edit","reservas.confirmar_btn":"Confirm","reservas.enviando":"Sending...",
    "reservas.registrada":"Booking confirmed","reservas.nueva_btn":"New booking",
    "reservas.nombre":"First name","reservas.apellidos":"Last name","reservas.modalidad":"Mode",
    "reservas.nivel_form":"Level","reservas.comentarios":"Comments","reservas.minutos":"minutes",
    "reservas.confirmacion_desc":"Confirmation depends on the backend and configured integrations.",
    "reprog.title":"Reschedule booking","reprog.eyebrow":"Bookings","reprog.desc":"Change the date or time of your booking.",
    "reprog.hora_fin":"End time","reprog.que_ocurre":"What happens next","reprog.enviando":"Sending...","reprog.editar":"Edit",
    "soporte.eyebrow":"Support",
    "lang.buscar":"Search language, country, code, flag…","lang.no_encontrados":"No languages found.",
    "lang.hint":"Try country, language, code or flag. Example: Spain, Español, es-ES or 🇪🇸","lang.recomendados":"Recommended","lang.todos":"All languages",
    "status.reserva.pendiente":"Pending","status.reserva.pendiente_txt":"Review your details before confirming.",
    "status.reserva.enviando":"Sending","status.reserva.enviando_txt":"We are sending your booking request.",
    "status.reserva.exito":"Success","status.reserva.exito_txt":"Booking sent successfully. Availability is being updated.",
    "status.reserva.error":"Error","status.reserva.error_txt":"Could not complete the booking. Check your details and try again.",
    "status.cancelar.idle":"Pending","status.cancelar.idle_txt":"Confirm the cancellation of your booking.",
    "status.cancelar.enviando":"Sending","status.cancelar.enviando_txt":"We are sending your cancellation request.",
    "status.cancelar.exito":"Request sent","status.cancelar.exito_txt":"Cancellation request sent successfully.",
    "status.cancelar.error":"Could not send","status.cancelar.error_txt":"Check the key and try again.",
    "status.reprog.idle":"Pending","status.reprog.idle_txt":"Choose a new date or time.",
    "status.reprog.enviando":"Rescheduling","status.reprog.enviando_txt":"Checking availability and updating your booking.",
    "status.reprog.exito":"Booking rescheduled","status.reprog.exito_txt":"Your booking has been updated successfully.",
    "status.reprog.error":"Could not reschedule","status.reprog.error_txt":"Check your details and try again.",
    "errors.nombre":"Please enter a valid first name.","errors.apellidos":"Please enter a valid last name.",
    "errors.email":"Please enter a valid email.","errors.telefono":"Please enter a valid phone number.",
    "errors.fecha":"Please select a date.","errors.fecha_pasado":"The date cannot be in the past.",
    "errors.fecha_domingo":"The club is closed on Sundays.",
    "errors.hora":"Please select an available time.","errors.duracion":"Please select a valid duration.",
    "errors.hora_pasada":"The selected slot has already passed.",
    "errors.hora_cierre":"The booking would end after club closing time.",
    "errors.pista":"Please select a valid court.","errors.modalidad":"Please select a valid mode.",
    "errors.nivel":"Please select a valid level.",
    "errors.clave":"Please enter the booking key.","errors.clave_incompleta":"The booking key seems incomplete.",
    "errors.nueva_fecha":"Please select the new date.","errors.nueva_fecha_pasado":"The new date cannot be in the past.",
    "errors.confirmado_reprog":"Please confirm you want to reschedule the booking.",
    "errors.confirmado_cancelar":"Please confirm you want to request cancellation before sending.",
    "errors.datos_incompletos":"Some details are incomplete or invalid. Please correct them before confirming.",
    "errors.horario_ocupado":"That slot has just been taken. Please choose another.",
    "errors.reserva_error":"Could not complete the booking. Please try again in a few seconds.",
    "errors.cancelar_error":"Could not send the request. Check the key and try again.",
    "errors.reprog_campos":"Please fill in all required fields correctly.",
    "errors.reprog_ocupado":"That slot has just been taken. Please select another.",
    "errors.reprog_error":"Could not complete the reschedule. Check the key and try again.",
    "badge.confirmed":"Confirmed","badge.pending":"Pending","badge.completed":"Completed",
    "home.galeria_eyebrow":"Gallery","home.galeria_desc":"Visual gallery of the club.","home.sistema":"System",
    "cancelar.info1":"We will process your request securely.",
    "cancelar.info2":"The cancellation will be recorded.",
    "cancelar.info3":"You can return to the calendar whenever you like.",
    "reprog.info1":"The key identifies the booking you want to change.",
    "reprog.info2":"The same key is kept after rescheduling.",
    "reprog.info3":"You will receive confirmation by email once the change is processed.",
    "reprog.info4":"Notifications will be activated in a later phase.",
    "reprog.nueva_disponibilidad":"New availability","reprog.selecciona_franja":"Select a new available slot.",
    "flujos.exportar_json":"⬇ Export JSON","flujos.total_procesos":"Total processes","flujos.auditados":"Audited",
    "flujos.activos_label":"Active","flujos.conectados":"Connected","flujos.pausados_label":"Paused",
    "flujos.en_pausa":"On pause","flujos.incidencias_label":"Incidents","flujos.ultimas_24h":"Last 24h",
    "flujos.tasa_exito":"Success rate","flujos.global_sistema":"System global",
    "flujos.ultimo_backup":"Last backup","flujos.automatico":"Automatic",
    "flujos.estado_procesos_label":"Process status","flujos.por_estado":"By connection status",
    "flujos.actividad_24h":"Activity last 24h","flujos.por_hora":"By time of day",
    "flujos.total_24h_label":"Total 24h","flujos.ejecuciones":"executions",
    "flujos.por_categoria":"Processes by category","flujos.distribucion":"Distribution of 50 processes",
    "flujos.mas_activos":"Most active processes","flujos.con_incidencias":"Processes with incidents",
    "flujos.sin_errores":"✅ No errors recorded","flujos.criticos":"Critical process status",
    "flujos.estado_op":"Operational status","flujos.todos_flujos":"All processes",
    "flujos.ocultar_tabla":"▲ Hide table","flujos.ver_tabla":"▼ View full table",
    "flujos.col_flujo":"Process","flujos.col_categoria":"Category","flujos.col_estado":"Status",
    "flujos.nota_integracion":"Technical integration connected. Real-time data requires connection to the club backend.",
    "admin.gestion_eyebrow":"Management","admin.gestion_title":"Courts and clients",
    "admin.gestion_desc":"Modules ready for operational management.",
    "admin.gestion_item1":"Court management","admin.gestion_item2":"Clients and profiles",
    "admin.gestion_item3":"Booking history","admin.gestion_item4":"Availability rules",
    "admin.crec_eyebrow":"Growth","admin.crec_title":"Tournaments and processes",
    "admin.crec_desc":"Area ready to activate processes when backend is available.",
    "admin.crec_item1":"Tournaments","admin.crec_item2":"Ranking and categories",
    "admin.crec_item3":"Classification system","admin.crec_item4":"Future payments",
    "admin.backup_eyebrow":"Active system","admin.backup_desc":"Automatic backup of bookings and active members.",
    "admin.backup_item1":"Schedule: Monday 07:00","admin.backup_item2":"Source: Database",
    "admin.backup_item3":"Destination: Storage","admin.backup_item4":"Confirmation: Notifications",
    "admin.sistema_eyebrow":"System","admin.exito_label":"Success:",
    "auth.roles_title":"Roles and access","auth.pending_badge":"Pending configuration",
    "auth.pending_desc":"Role-based access system. In production it must be protected by an authentication provider and user backend.",
    "auth.secciones":"Sections:",
    "soporte.proteccion_h3":"Production protection required",
    "soporte.estado_tec_eyebrow":"Integration status","soporte.estado_tec_title":"Technical status",
    "soporte.estado_tec_desc":"Backend connection checklist.",
    "soporte.worker_item":"Booking worker ready",
    "soporte.make_item":"Automations pending private secret",
    "soporte.airtable_item":"Database ready without active writes",
    "soporte.stripe_item":"Payments and messaging pending configuration",
    "soporte.obs_eyebrow":"Observability","soporte.obs_title":"Logs and errors",
    "soporte.obs_desc":"Reserved area for diagnostics when real backend is available.",
    "soporte.logs_worker":"Worker logs","soporte.logs_validaciones":"Validations",
    "soporte.logs_errores":"Integration errors","soporte.logs_alertas":"Future technical alerts",
    "soporte.vars_h3":"Security status: protected variables",
    "soporte.vars_no_names":"Internal names and values are not shown in the interface.",
    "soporte.vars_validacion":"Validation available only in internal documentation or a secure console.",
  },
  "fr-FR": {
    "nav.inicio":"Accueil","nav.reservar":"Réserver","nav.alta_jugador":"Inscription joueur",
    "nav.reprogramar":"Reporter","nav.cancelar":"Annuler réservation",
    "nav.gestion":"Réservations","nav.torneos":"Tournois","nav.ranking":"Classement",
    "nav.admin":"Admin","nav.flujos_make":"Centre technique","nav.soporte":"Support",
    "nav.comunidad":"Communauté",
    "nav.cerrar_sesion":"Déconnexion","nav.saas_label":"SaaS sécurisé","nav.cerrar_menu":"Fermer","nav.abrir_menu":"Menu",
    "login.title":"Se connecter en tant que rôle","login.entrar":"Entrer","login.cancelar":"Annuler",
    "login.password":"Mot de passe","login.ver_pwd":"👁️ Voir le mot de passe","login.ocultar_pwd":"🙈 Masquer",
    "login.guardar_sesion":"Mémoriser sur cet appareil","login.acceder_como":"Se connecter en tant que",
    "login.intro_pwd":"Entrez le mot de passe attribué à ce rôle.",
    "login.error_rol":"Veuillez sélectionner un rôle valide.","login.error_pwd":"Mot de passe incorrect.",
    "login.sesion_label":"Club Pádel 04 · Connexion",
    "login.legal":"Accès local protégé par mot de passe. Session sauvegardable sur cet appareil uniquement.",
    "login.olvide_pwd":"Mot de passe oublié ?","login.recuperar_title":"Récupérer l'accès","login.recuperar_desc":"Saisissez votre adresse e-mail et, si le compte existe, vous recevrez des instructions pour réinitialiser l'accès.","login.recuperar_email":"Adresse e-mail","login.recuperar_btn":"Envoyer les instructions","login.recuperar_enviado":"Si cette adresse est enregistrée dans le système, vous recevrez des instructions prochainement. Vérifiez aussi vos spams.","login.recuperar_volver":"Retour à la connexion","login.recuperar_preparado":"Prêt pour l'endpoint : /api/auth/forgot-password","login.recuperar_no_disponible":"La récupération de mot de passe n'est pas encore disponible dans cet environnement : en attente d'activation du fournisseur d'authentification.","login.recuperar_cargando":"Envoi des instructions…",
    "perfil.title":"Profil et paramètres","perfil.eyebrow":"Mon compte","perfil.sesion":"Session active","perfil.rol_actual":"Rôle actuel","perfil.cerrar_sesion":"Déconnexion","perfil.cambiar_pwd":"Changer le mot de passe","perfil.pwd_actual":"Mot de passe actuel","perfil.pwd_nueva":"Nouveau mot de passe","perfil.pwd_confirmar":"Confirmer le nouveau mot de passe","perfil.pwd_guardada":"Mot de passe mis à jour (mode démo local).","perfil.pwd_error_vacia":"Saisissez le mot de passe actuel.","perfil.pwd_error_nueva":"8 caractères minimum, majuscule, minuscule et chiffre.","perfil.pwd_error_coincide":"Les mots de passe ne correspondent pas.","perfil.idioma":"Langue de l'interface","perfil.info_demo":"Profil en mode local. Les données sont sauvegardées uniquement sur cet appareil.","perfil.privacidad":"Confidentialité","perfil.privacidad_desc":"En production, les données personnelles seront traitées conformément au RGPD.","perfil.notificaciones":"Notifications","perfil.notif_desc":"Prêt pour les notifications par e-mail et messagerie en production.","perfil.avatar_cambiar":"Changer la photo de profil","perfil.avatar_eliminar":"Supprimer la photo","perfil.avatar_confirmar_del":"Supprimer votre photo de profil ?","perfil.avatar_guardada":"Photo mise à jour.","perfil.avatar_eliminada":"Photo supprimée.","perfil.avatar_error_tipo":"Images uniquement (JPG, PNG, WEBP).","perfil.avatar_error_size":"Maximum 5 Mo.","perfil.bio_titulo":"Votre présentation","perfil.bio_placeholder":"Parlez-nous de votre jeu, niveau ou disponibilité...","perfil.bio_guardar":"Enregistrer","perfil.bio_cancelar":"Annuler","perfil.bio_guardada":"Présentation enregistrée.","perfil.bio_editar":"Modifier la présentation","perfil.bio_chars":"caractères","perfil.deporte_titulo":"Profil sportif","perfil.deporte_guardar":"Enregistrer les données","perfil.deporte_guardados":"Données sportives enregistrées.","perfil.deporte_mano":"Main dominante","perfil.deporte_posicion":"Position préférée","perfil.deporte_nivel":"Niveau de jeu","perfil.deporte_disponibilidad":"Disponibilité habituelle","perfil.deporte_tipo_partida":"Type de match","perfil.deporte_objetivo":"Objectif principal","perfil.deporte_busqueda":"Statut de recherche","perfil.metricas_titulo":"Mon activité","perfil.metricas_partidos":"Matchs joués","perfil.metricas_reservas":"Réservations effectuées","perfil.metricas_torneos":"Tournois disputés","perfil.metricas_ranking":"Classement actuel","perfil.metricas_actividad":"Niveau d'activité","perfil.metricas_valoracion":"Évaluation sportive","perfil.metricas_fiabilidad":"Fiabilité","perfil.metricas_racha":"Série active","perfil.historial_titulo":"Moments du joueur","perfil.insignias_titulo":"Réussites du joueur","perfil.privacidad_config":"Paramètres de confidentialité","perfil.privacidad_guardada":"Confidentialité mise à jour.","perfil.privacidad_perfil_visible":"Profil visible pour les autres joueurs","perfil.privacidad_nivel":"Afficher le niveau","perfil.privacidad_disponibilidad":"Afficher la disponibilité","perfil.privacidad_stats":"Afficher les statistiques","perfil.privacidad_invitaciones":"Autoriser les invitations","perfil.privacidad_recomendaciones":"Autoriser les recommandations","perfil.completitud_titulo":"Complétude du profil","nav.perfil":"Profil et paramètres",
    "login.subtitle":"Sélectionnez comment vous souhaitez entrer dans l'application.",
    "login.idioma":"Langue",
    "role.PLAYER.label":"Joueur / client","role.PLAYER.desc":"Réserver des courts, consulter les réservations et le classement.",
    "role.STAFF.label":"Staff / accueil","role.STAFF.desc":"Gestion quotidienne des réservations et assistance aux joueurs.",
    "role.ADMIN.label":"Administrateur","role.ADMIN.desc":"Tableau de bord, métriques et contrôle opérationnel.",
    "role.SUPPORT.label":"Support technique","role.SUPPORT.desc":"Zone technique, intégrations et diagnostics internes.",
    "home.reservas_hoy":"Réservations auj.","home.ocupacion_media":"Occupation moy.",
    "home.socios_activos":"Membres actifs","home.procesos_activos":"Processus actifs",
    "home.ingresos_mes":"Revenus du mois","home.torneos_activos":"Tournois actifs",
    "home.estado_operativo":"État opérationnel","home.reservar":"Réserver",
    "home.torneo":"Tournoi","home.alta":"Inscription","home.procesos":"Processus",
    "home.avisos_activos":"Alertes actives","home.ver_procesos":"Voir processus",
    "home.vs_ayer":"vs hier","home.pistas_activas":"4 courts actifs",
    "home.estimacion_mensual":"Estimation mensuelle","home.en_curso":"En cours",
    "home.este_mes":"ce mois","home.incidencia":"incident","home.incidencias_s":"incidents",
    "home.franja_horaria":"Créneau horaire","home.tendencia_semanal":"Tendance hebdomadaire",
    "home.porcentaje_uso":"% d'utilisation","home.procesos_conectados":"processus connectés",
    "home.activos":"Actifs","home.pausados":"En pause","home.incidencias":"Incidents","home.flujos_totales":"flux au total","home.operativo_probado":"opérationnel (testé E2E)",
    "home.reservas_hora":"Réservations par heure — auj.","home.reservas_7dias":"Réservations 7 derniers jours",
    "home.ocupacion_pista":"Occupation par court","home.estado_procesos":"État des processus",
    "home.club_operativo":"Club de padel","home.hero_accent":"opérationnel",
    "home.hero_subtitle":"SaaS par rôles: joueur, accueil, administration et support.",
    "home.btn_torneos":"Tournois","home.btn_admin":"Admin",
    "home.ir_reservas":"Aller aux réservations","home.ver_gestion":"Gérer réservations",
    "home.ver_admin":"Voir admin","home.ver_soporte":"Voir support",
    "home.galeria":"Galerie du club",
    "home.dias_semana":"L,M,M,J,V,S,D","home.dias_largo":"Lun,Mar,Mer,Jeu,Ven,Sam,Dim",
    "admin.panel":"Tableau de bord","admin.metricas":"Métriques globales du club.",
    "admin.reservas_mes":"Réservations du mois","admin.ocupacion":"Occupation moy.",
    "admin.socios":"Membres actifs","admin.procesos":"Processus actifs",
    "admin.backup":"Dernier backup","admin.ingr_mes":"Revenus du mois",
    "admin.vs_mes_anterior":"vs mois précédent","admin.prox_lunes":"Prochain: lundi 07:00",
    "admin.graf_hoy":"Réservations par heure — auj.","admin.graf_semana":"Évolution hebdomadaire",
    "admin.graf_pista":"Occupation par court","admin.sub_hoy":"Créneau · démo",
    "admin.sub_semana":"Réservations 7 jours · démo","admin.sub_pista":"% utilisation · démo",
    "admin.backup_semana":"Backup hebdomadaire","admin.integraciones":"État des intégrations",
    "admin.integ_desc":"Prêtes, en attente de credentials ou de déploiement.",
    "soporte.title":"Support technique","soporte.desc":"Contrôle technique de l'application.",
    "soporte.proteccion":"Protection requise en production","soporte.vars":"Variables privées",
    "flujos.title":"Centre technique","flujos.desc":"État des automatisations du système.",
    "torneos.title":"Tournois","torneos.bracket":"Tableau interactif",
    "torneos.anyadir":"Ajouter paire","torneos.guardar":"Sauvegarder","torneos.publicar":"Publier",
    "torneos.exportar":"Exporter","torneos.campeon":"Champion","torneos.subcampeon":"Finaliste",
    "torneos.tercer_puesto":"3e place","torneos.jugadores":"Joueurs","torneos.parejas":"Paires",
    "torneos.ganador":"Vainqueur","torneos.eliminada":"Éliminé","torneos.avanza":"Avance",
    "torneos.bye":"BYE","torneos.pase_directo":"Passage direct","torneos.personalizado":"Personnalisé",
    "torneos.ver_ranking":"Voir classement complet","torneos.autoasignar":"Auto-assigner","torneos.reordenar":"Réordonner",
    "reservas.nueva":"Nouvelle réservation","reservas.fecha":"Date","reservas.hora":"Heure",
    "reservas.pista":"Court","reservas.duracion":"Durée","reservas.confirmar":"Confirmer réservation",
    "reservas.resumen":"Résumé","reservas.disponible":"Disponible","reservas.no_disponible":"Indisponible",
    "reprog.clave":"Clé de réservation","reprog.nueva_fecha":"Nouvelle date",
    "reprog.nueva_hora":"Nouvelle heure de début","reprog.nueva_pista":"Nouveau court",
    "reprog.resumen":"Résumé du changement","reprog.confirmo":"Je confirme le report de cette réservation",
    "reprog.btn":"Reporter la réservation","reprog.volver":"Retour aux réservations",
    "cancelar.motivo":"Motif","cancelar.confirmar":"Confirmer l'annulation","cancelar.volver":"Retour",
    "ranking.title":"Classement","ranking.subtitle":"Classement général des joueurs et paires",
    "ranking.categoria":"Catégorie","ranking.nivel":"Niveau","ranking.puntos":"Points",
    "ranking.pts":"Pts","ranking.pareja":"Paire","ranking.jugadores":"Joueurs",
    "ranking.v":"V","ranking.d":"D","ranking.pj":"M","ranking.racha":"Série",
    "ranking.mov":"Mouv.","ranking.pos":"#","ranking.ultima_act":"Dernière mise à jour",
    "ranking.filtrar":"Rechercher joueur ou paire...","ranking.general":"Général",
    "ranking.masculino":"Masculin","ranking.femenino":"Féminin","ranking.mixto":"Mixte",
    "ranking.iniciacion":"Débutant","ranking.medio":"Intermédiaire","ranking.avanzado":"Avancé",
    "ranking.podio":"Podium — Top 3","ranking.tabla":"Classement complet",
    "ranking.datos_ejemplo":"Données d'exemple","ranking.sistema_puntos":"Système de points du club configurable.",
    "ranking.temporada":"Saison","ranking.buscar":"Rechercher...",
    "ranking.campeon":"Champion","ranking.subcampeon":"Finaliste","ranking.tercero":"3e place",
    "ranking.mejor_pareja":"Meilleure paire","ranking.pts_totales":"pts totaux",
    "ranking.sin_resultados":"Aucun résultat avec ces filtres.",
    "ranking.estado":"Statut","ranking.activo":"Actif",
    "common.cargando":"Chargement...","common.error":"Erreur","common.cancelar":"Annuler",
    "common.confirmar":"Confirmer","common.guardar":"Sauvegarder","common.volver":"Retour",
    "common.editar":"Modifier","common.modo_seguro":"Mode sécurisé","common.entorno":"Environnement protégé",
    "common.sin_cambios":"Sans changement",
    "alta.title":"Inscription joueur","alta.eyebrow":"Joueurs","alta.desc":"Ajouter un joueur au club.",
    "alta.nombre":"Prénom","alta.apellidos":"Nom","alta.email":"Email","alta.telefono":"Téléphone",
    "alta.fecha_nac":"Date de naissance","alta.nivel":"Niveau","alta.genero":"Genre",
    "alta.comentarios":"Commentaires","alta.seleccionar":"Sélectionner",
    "alta.acepta":"J'accepte les conditions et la politique de confidentialité.",
    "alta.exito":"✅ Joueur enregistré avec succès.","alta.registrando":"Enregistrement...","alta.btn":"Inscrire le joueur",
    "cancelar.title":"Annuler la réservation","cancelar.eyebrow":"Réservations","cancelar.desc":"Demander l'annulation d'une réservation.",
    "cancelar.clave":"Clé de réservation","cancelar.clave_ph":"Entrez votre clé de réservation",
    "cancelar.confirmo_check":"Je confirme que je veux annuler cette réservation.",
    "cancelar.btn":"Annuler la réservation","cancelar.enviando":"Envoi en cours...","cancelar.volver_reservas":"Retour aux réservations",
    "cancelar.que_ocurre":"Que se passe-t-il ensuite",
    "reservas.title":"Réserver un terrain","reservas.eyebrow":"Réservations","reservas.desc":"Réservez votre terrain en quelques secondes.",
    "reservas.datos_jugador":"Données du joueur","reservas.fecha_pista":"Date, heure et terrain",
    "reservas.hora_fin":"Heure de fin","reservas.total":"Total","reservas.ver_resumen":"Voir le résumé",
    "reservas.editar":"Modifier","reservas.confirmar_btn":"Confirmer","reservas.enviando":"Envoi...",
    "reservas.registrada":"Réservation enregistrée","reservas.nueva_btn":"Nouvelle réservation",
    "reservas.nombre":"Prénom","reservas.apellidos":"Nom","reservas.modalidad":"Mode",
    "reservas.nivel_form":"Niveau","reservas.comentarios":"Commentaires","reservas.minutos":"minutes",
    "reservas.confirmacion_desc":"La confirmation dépend du backend et des intégrations configurées.",
    "reprog.title":"Reprogrammer la réservation","reprog.eyebrow":"Réservations","reprog.desc":"Changer la date ou l'heure de votre réservation.",
    "reprog.hora_fin":"Heure de fin","reprog.que_ocurre":"Que se passe-t-il ensuite","reprog.enviando":"Envoi...","reprog.editar":"Modifier",
    "soporte.eyebrow":"Support",
    "lang.buscar":"Rechercher langue, pays, code, drapeau…","lang.no_encontrados":"Aucune langue trouvée.",
    "lang.hint":"Essayez pays, langue, code ou drapeau. Exemple: France, Français, fr-FR ou 🇫🇷","lang.recomendados":"Recommandées","lang.todos":"Toutes les langues",
    "status.reserva.pendiente":"En attente","status.reserva.pendiente_txt":"Vérifiez vos données avant de confirmer.",
    "status.reserva.enviando":"Envoi","status.reserva.enviando_txt":"Nous envoyons votre demande de réservation.",
    "status.reserva.exito":"Succès","status.reserva.exito_txt":"Réservation envoyée avec succès. La disponibilité est mise à jour.",
    "status.reserva.error":"Erreur","status.reserva.error_txt":"Impossible de finaliser la réservation. Vérifiez les données et réessayez.",
    "status.cancelar.idle":"En attente","status.cancelar.idle_txt":"Confirmez l'annulation de votre réservation.",
    "status.cancelar.enviando":"Envoi","status.cancelar.enviando_txt":"Nous envoyons votre demande d'annulation.",
    "status.cancelar.exito":"Demande envoyée","status.cancelar.exito_txt":"Demande d'annulation envoyée avec succès.",
    "status.cancelar.error":"Envoi impossible","status.cancelar.error_txt":"Vérifiez la clé et réessayez.",
    "status.reprog.idle":"En attente","status.reprog.idle_txt":"Choisissez une nouvelle date ou heure.",
    "status.reprog.enviando":"Report en cours","status.reprog.enviando_txt":"Vérification de la disponibilité et mise à jour de votre réservation.",
    "status.reprog.exito":"Réservation reportée","status.reprog.exito_txt":"Votre réservation a été mise à jour avec succès.",
    "status.reprog.error":"Report impossible","status.reprog.error_txt":"Vérifiez les données et réessayez.",
    "errors.nombre":"Veuillez entrer un prénom valide.","errors.apellidos":"Veuillez entrer un nom valide.",
    "errors.email":"Veuillez entrer un email valide.","errors.telefono":"Veuillez entrer un numéro de téléphone valide.",
    "errors.fecha":"Veuillez sélectionner une date.","errors.fecha_pasado":"La date ne peut pas être dans le passé.",
    "errors.fecha_domingo":"Le club est fermé le dimanche.",
    "errors.hora":"Veuillez sélectionner une heure disponible.","errors.duracion":"Veuillez sélectionner une durée valide.",
    "errors.hora_pasada":"Le créneau sélectionné est déjà passé.",
    "errors.hora_cierre":"La réservation se terminerait après la fermeture du club.",
    "errors.pista":"Veuillez sélectionner un terrain valide.","errors.modalidad":"Veuillez sélectionner un mode valide.",
    "errors.nivel":"Veuillez sélectionner un niveau valide.",
    "errors.clave":"Veuillez entrer la clé de réservation.","errors.clave_incompleta":"La clé de réservation semble incomplète.",
    "errors.nueva_fecha":"Veuillez sélectionner la nouvelle date.","errors.nueva_fecha_pasado":"La nouvelle date ne peut pas être dans le passé.",
    "errors.confirmado_reprog":"Veuillez confirmer que vous souhaitez reporter la réservation.",
    "errors.confirmado_cancelar":"Veuillez confirmer que vous souhaitez demander l'annulation.",
    "errors.datos_incompletos":"Certaines données sont incomplètes ou invalides. Corrigez-les avant de confirmer.",
    "errors.horario_ocupado":"Ce créneau vient d'être pris. Veuillez en choisir un autre.",
    "errors.reserva_error":"Impossible de finaliser la réservation. Réessayez dans quelques secondes.",
    "errors.cancelar_error":"Impossible d'envoyer la demande. Vérifiez la clé et réessayez.",
    "errors.reprog_campos":"Veuillez remplir correctement tous les champs obligatoires.",
    "errors.reprog_ocupado":"Ce créneau vient d'être pris. Veuillez en sélectionner un autre.",
    "errors.reprog_error":"Impossible de finaliser le report. Vérifiez la clé et réessayez.",
    "badge.confirmed":"Confirmée","badge.pending":"En attente","badge.completed":"Terminée",
    "home.galeria_eyebrow":"Galerie","home.galeria_desc":"Galerie visuelle du club.","home.sistema":"Système",
    "cancelar.info1":"Nous traiterons votre demande en toute sécurité.",
    "cancelar.info2":"L'annulation sera enregistrée.",
    "cancelar.info3":"Vous pouvez revenir au calendrier quand vous voulez.",
    "reprog.info1":"La clé identifie la réservation que vous souhaitez modifier.",
    "reprog.info2":"La même clé est conservée après le report.",
    "reprog.info3":"Vous recevrez une confirmation par email une fois le changement traité.",
    "reprog.info4":"Les notifications seront activées dans une phase ultérieure.",
    "reprog.nueva_disponibilidad":"Nouvelle disponibilité","reprog.selecciona_franja":"Sélectionnez un nouveau créneau disponible.",
    "flujos.exportar_json":"⬇ Exporter JSON","flujos.total_procesos":"Total processus","flujos.auditados":"Audités",
    "flujos.activos_label":"Actifs","flujos.conectados":"Connectés","flujos.pausados_label":"En pause",
    "flujos.en_pausa":"En pause","flujos.incidencias_label":"Incidents","flujos.ultimas_24h":"Dernières 24h",
    "flujos.tasa_exito":"Taux de succès","flujos.global_sistema":"Global système",
    "flujos.ultimo_backup":"Dernier backup","flujos.automatico":"Automatique",
    "flujos.estado_procesos_label":"État des processus","flujos.por_estado":"Par état de connexion",
    "flujos.actividad_24h":"Activité dernières 24h","flujos.por_hora":"Par heure de la journée",
    "flujos.total_24h_label":"Total 24h","flujos.ejecuciones":"exécutions",
    "flujos.por_categoria":"Processus par catégorie","flujos.distribucion":"Répartition des 50 processus",
    "flujos.mas_activos":"Processus les plus actifs","flujos.con_incidencias":"Processus avec incidents",
    "flujos.sin_errores":"✅ Aucune erreur enregistrée","flujos.criticos":"État des processus critiques",
    "flujos.estado_op":"État opérationnel","flujos.todos_flujos":"Tous les processus",
    "flujos.ocultar_tabla":"▲ Masquer tableau","flujos.ver_tabla":"▼ Voir tableau complet",
    "flujos.col_flujo":"Processus","flujos.col_categoria":"Catégorie","flujos.col_estado":"État",
    "flujos.nota_integracion":"Intégration technique connectée. Les données en temps réel nécessitent une connexion au backend du club.",
    "admin.gestion_eyebrow":"Gestion","admin.gestion_title":"Terrains et clients",
    "admin.gestion_desc":"Modules prêts pour la gestion opérationnelle.",
    "admin.gestion_item1":"Gestion des terrains","admin.gestion_item2":"Clients et profils",
    "admin.gestion_item3":"Historique des réservations","admin.gestion_item4":"Règles de disponibilité",
    "admin.crec_eyebrow":"Croissance","admin.crec_title":"Tournois et processus",
    "admin.crec_desc":"Zone prête à activer des processus quand le backend sera disponible.",
    "admin.crec_item1":"Tournois","admin.crec_item2":"Classement et catégories",
    "admin.crec_item3":"Système de classement","admin.crec_item4":"Paiements futurs",
    "admin.backup_eyebrow":"Système actif","admin.backup_desc":"Sauvegarde automatique des réservations et membres actifs.",
    "admin.backup_item1":"Planification : lundi 07:00","admin.backup_item2":"Source : Base de données",
    "admin.backup_item3":"Destination : Stockage","admin.backup_item4":"Confirmation : Notifications",
    "admin.sistema_eyebrow":"Système","admin.exito_label":"Succès :",
    "auth.roles_title":"Rôles et accès","auth.pending_badge":"Configuration en attente",
    "auth.pending_desc":"Système d'accès par rôles. En production, il doit être protégé par un fournisseur d'authentification.",
    "auth.secciones":"Sections :",
    "soporte.proteccion_h3":"Protection requise en production",
    "soporte.estado_tec_eyebrow":"État des intégrations","soporte.estado_tec_title":"État technique",
    "soporte.estado_tec_desc":"Liste de vérification de connexion backend.",
    "soporte.worker_item":"Worker de réservations prêt",
    "soporte.make_item":"Automatisations en attente de secret privé",
    "soporte.airtable_item":"Base de données prête sans écriture active",
    "soporte.stripe_item":"Paiements et messagerie en attente de configuration",
    "soporte.obs_eyebrow":"Observabilité","soporte.obs_title":"Logs et erreurs",
    "soporte.obs_desc":"Zone réservée au diagnostic quand le backend réel sera disponible.",
    "soporte.logs_worker":"Logs du Worker","soporte.logs_validaciones":"Validations",
    "soporte.logs_errores":"Erreurs d'intégrations","soporte.logs_alertas":"Alertes techniques futures",
    "soporte.vars_h3":"État de sécurité : variables protégées",
    "soporte.vars_no_names":"Les noms et valeurs internes ne sont pas affichés dans l'interface.",
    "soporte.vars_validacion":"Validation disponible uniquement dans la documentation interne ou une console sécurisée.",
  },
  "it-IT": {
    "nav.inicio":"Inizio","nav.reservar":"Prenota","nav.alta_jugador":"Iscrizione giocatore",
    "nav.reprogramar":"Riprogramma","nav.cancelar":"Annulla prenotazione",
    "nav.gestion":"Prenotazioni","nav.torneos":"Tornei","nav.ranking":"Classifica",
    "nav.admin":"Admin","nav.flujos_make":"Centro tecnico","nav.soporte":"Supporto",
    "nav.comunidad":"Comunità",
    "nav.cerrar_sesion":"Disconnetti","nav.saas_label":"SaaS sicuro","nav.cerrar_menu":"Chiudi","nav.abrir_menu":"Menu",
    "login.title":"Accedi come ruolo","login.entrar":"Entra","login.cancelar":"Annulla",
    "login.password":"Password","login.ver_pwd":"👁️ Mostra password","login.ocultar_pwd":"🙈 Nascondi",
    "login.guardar_sesion":"Ricordami su questo dispositivo","login.acceder_como":"Accedi come",
    "login.intro_pwd":"Inserisci la password assegnata a questo ruolo.",
    "login.error_rol":"Seleziona un ruolo valido.","login.error_pwd":"Password errata per questo ruolo.",
    "login.sesion_label":"Club Pádel 04 · Accesso",
    "login.legal":"Accesso locale protetto da password. Sessione salvabile solo su questo dispositivo.",
    "login.olvide_pwd":"Hai dimenticato la password?","login.recuperar_title":"Recupera l'accesso","login.recuperar_desc":"Inserisci il tuo indirizzo e-mail e, se l'account esiste, riceverai le istruzioni per reimpostare l'accesso.","login.recuperar_email":"Indirizzo e-mail","login.recuperar_btn":"Invia istruzioni","login.recuperar_enviado":"Se quell'indirizzo è registrato nel sistema, riceverai le istruzioni a breve. Controlla anche la cartella spam.","login.recuperar_volver":"Torna al login","login.recuperar_preparado":"Pronto per l'endpoint: /api/auth/forgot-password","login.recuperar_no_disponible":"Il recupero della password non è ancora disponibile in questo ambiente: in attesa di attivazione del provider di autenticazione.","login.recuperar_cargando":"Invio delle istruzioni…",
    "perfil.title":"Profilo e impostazioni","perfil.eyebrow":"Il mio account","perfil.sesion":"Sessione attiva","perfil.rol_actual":"Ruolo attuale","perfil.cerrar_sesion":"Disconnetti","perfil.cambiar_pwd":"Cambia password","perfil.pwd_actual":"Password attuale","perfil.pwd_nueva":"Nuova password","perfil.pwd_confirmar":"Conferma nuova password","perfil.pwd_guardada":"Password aggiornata (modalità demo locale).","perfil.pwd_error_vacia":"Inserisci la password attuale.","perfil.pwd_error_nueva":"Minimo 8 caratteri, maiuscola, minuscola e numero.","perfil.pwd_error_coincide":"Le password non corrispondono.","perfil.idioma":"Lingua dell'interfaccia","perfil.info_demo":"Profilo in modalità locale. I dati vengono salvati solo su questo dispositivo.","perfil.privacidad":"Privacy","perfil.privacidad_desc":"In produzione, i dati personali saranno gestiti in conformità al GDPR.","perfil.notificaciones":"Notifiche","perfil.notif_desc":"Pronto per notifiche via e-mail e messaggistica in produzione.","perfil.avatar_cambiar":"Cambia foto profilo","perfil.avatar_eliminar":"Rimuovi foto","perfil.avatar_confirmar_del":"Rimuovere la foto del profilo?","perfil.avatar_guardada":"Foto aggiornata.","perfil.avatar_eliminada":"Foto rimossa.","perfil.avatar_error_tipo":"Solo immagini (JPG, PNG, WEBP).","perfil.avatar_error_size":"Massimo 5 MB.","perfil.bio_titulo":"La tua presentazione","perfil.bio_placeholder":"Raccontaci del tuo gioco, livello o disponibilità...","perfil.bio_guardar":"Salva","perfil.bio_cancelar":"Annulla","perfil.bio_guardada":"Presentazione salvata.","perfil.bio_editar":"Modifica presentazione","perfil.bio_chars":"caratteri","perfil.deporte_titulo":"Profilo sportivo","perfil.deporte_guardar":"Salva dati","perfil.deporte_guardados":"Dati sportivi salvati.","perfil.deporte_mano":"Mano dominante","perfil.deporte_posicion":"Posizione preferita","perfil.deporte_nivel":"Livello di gioco","perfil.deporte_disponibilidad":"Disponibilità abituale","perfil.deporte_tipo_partida":"Tipo di partita","perfil.deporte_objetivo":"Obiettivo principale","perfil.deporte_busqueda":"Stato di ricerca","perfil.metricas_titulo":"La mia attività","perfil.metricas_partidos":"Partite giocate","perfil.metricas_reservas":"Prenotazioni effettuate","perfil.metricas_torneos":"Tornei disputati","perfil.metricas_ranking":"Classifica attuale","perfil.metricas_actividad":"Livello di attività","perfil.metricas_valoracion":"Valutazione sportiva","perfil.metricas_fiabilidad":"Affidabilità","perfil.metricas_racha":"Serie attiva","perfil.historial_titulo":"Momenti del giocatore","perfil.insignias_titulo":"Risultati del giocatore","perfil.privacidad_config":"Impostazioni privacy","perfil.privacidad_guardada":"Privacy aggiornata.","perfil.privacidad_perfil_visible":"Profilo visibile agli altri giocatori","perfil.privacidad_nivel":"Mostra livello di gioco","perfil.privacidad_disponibilidad":"Mostra disponibilità","perfil.privacidad_stats":"Mostra statistiche","perfil.privacidad_invitaciones":"Consenti inviti a partite","perfil.privacidad_recomendaciones":"Consenti raccomandazioni","perfil.completitud_titulo":"Completezza del profilo","nav.perfil":"Profilo e impostazioni",
    "login.subtitle":"Seleziona come vuoi accedere all'applicazione.",
    "login.idioma":"Lingua",
    "role.PLAYER.label":"Giocatore / cliente","role.PLAYER.desc":"Prenota campi, consulta prenotazioni e classifica.",
    "role.STAFF.label":"Staff / reception","role.STAFF.desc":"Gestione quotidiana delle prenotazioni e assistenza ai giocatori.",
    "role.ADMIN.label":"Amministratore","role.ADMIN.desc":"Pannello di gestione, metriche e controllo operativo.",
    "role.SUPPORT.label":"Supporto tecnico","role.SUPPORT.desc":"Zona tecnica, integrazioni e diagnostica interna.",
    "home.reservas_hoy":"Prenotazioni oggi","home.ocupacion_media":"Occupazione media",
    "home.socios_activos":"Soci attivi","home.procesos_activos":"Processi attivi",
    "home.ingresos_mes":"Entrate mensili","home.torneos_activos":"Tornei attivi",
    "home.estado_operativo":"Stato operativo","home.reservar":"Prenota",
    "home.torneo":"Torneo","home.alta":"Iscrizione","home.procesos":"Processi",
    "home.avisos_activos":"Avvisi attivi","home.ver_procesos":"Vedi processi",
    "home.vs_ayer":"vs ieri","home.pistas_activas":"4 campi attivi",
    "home.estimacion_mensual":"Stima mensile","home.en_curso":"In corso",
    "home.este_mes":"questo mese","home.incidencia":"incidente","home.incidencias_s":"incidenti",
    "home.franja_horaria":"Fascia oraria","home.tendencia_semanal":"Tendenza settimanale",
    "home.porcentaje_uso":"% utilizzo","home.procesos_conectados":"processi connessi",
    "home.activos":"Attivi","home.pausados":"In pausa","home.incidencias":"Incidenti","home.flujos_totales":"flussi totali","home.operativo_probado":"operativo (testato E2E)",
    "home.reservas_hora":"Prenotazioni per ora — oggi","home.reservas_7dias":"Prenotazioni ultimi 7 giorni",
    "home.ocupacion_pista":"Occupazione per campo","home.estado_procesos":"Stato processi",
    "home.club_operativo":"Club di padel","home.hero_accent":"operativo",
    "home.hero_subtitle":"SaaS per ruoli: giocatore, reception, amministrazione e supporto.",
    "home.btn_torneos":"Tornei","home.btn_admin":"Admin",
    "home.ir_reservas":"Vai alle prenotazioni","home.ver_gestion":"Gestisci prenotazioni",
    "home.ver_admin":"Vedi admin","home.ver_soporte":"Vedi supporto",
    "home.galeria":"Galleria del club",
    "home.dias_semana":"L,M,M,G,V,S,D","home.dias_largo":"Lun,Mar,Mer,Gio,Ven,Sab,Dom",
    "admin.panel":"Pannello di gestione","admin.metricas":"Metriche globali del club.",
    "admin.reservas_mes":"Prenotazioni mensili","admin.ocupacion":"Occupazione media",
    "admin.socios":"Soci attivi","admin.procesos":"Processi attivi",
    "admin.backup":"Ultimo backup","admin.ingr_mes":"Entrate mensili",
    "admin.vs_mes_anterior":"vs mese precedente","admin.prox_lunes":"Prossimo: lunedì 07:00",
    "admin.graf_hoy":"Prenotazioni per ora — oggi","admin.graf_semana":"Evoluzione settimanale",
    "admin.graf_pista":"Occupazione per campo","admin.sub_hoy":"Fascia oraria · demo",
    "admin.sub_semana":"Prenotazioni 7 giorni · demo","admin.sub_pista":"% utilizzo · demo",
    "admin.backup_semana":"Backup settimanale","admin.integraciones":"Stato integrazioni",
    "admin.integ_desc":"Pronte, in attesa di credenziali o di distribuzione.",
    "soporte.title":"Supporto tecnico","soporte.desc":"Controllo tecnico dell'applicazione.",
    "soporte.proteccion":"Protezione richiesta in produzione","soporte.vars":"Variabili private",
    "flujos.title":"Centro tecnico","flujos.desc":"Stato delle automazioni del sistema.",
    "torneos.title":"Tornei","torneos.bracket":"Tabellone interattivo",
    "torneos.anyadir":"Aggiungi coppia","torneos.guardar":"Salva","torneos.publicar":"Pubblica",
    "torneos.exportar":"Esporta","torneos.campeon":"Campione","torneos.subcampeon":"Finalista",
    "torneos.tercer_puesto":"3° posto","torneos.jugadores":"Giocatori","torneos.parejas":"Coppie",
    "torneos.ganador":"Vincitore","torneos.eliminada":"Eliminato","torneos.avanza":"Avanza",
    "torneos.bye":"BYE","torneos.pase_directo":"Passaggio diretto","torneos.personalizado":"Personalizzato",
    "torneos.ver_ranking":"Vedi classifica completa","torneos.autoasignar":"Auto-assegna","torneos.reordenar":"Riordina",
    "reservas.nueva":"Nuova prenotazione","reservas.fecha":"Data","reservas.hora":"Ora",
    "reservas.pista":"Campo","reservas.duracion":"Durata","reservas.confirmar":"Conferma prenotazione",
    "reservas.resumen":"Riepilogo","reservas.disponible":"Disponibile","reservas.no_disponible":"Non disponibile",
    "reprog.clave":"Chiave prenotazione","reprog.nueva_fecha":"Nuova data",
    "reprog.nueva_hora":"Nuovo orario di inizio","reprog.nueva_pista":"Nuovo campo",
    "reprog.resumen":"Riepilogo cambio","reprog.confirmo":"Confermo che voglio riprogrammare questa prenotazione",
    "reprog.btn":"Riprogramma prenotazione","reprog.volver":"Torna alle prenotazioni",
    "cancelar.motivo":"Motivo","cancelar.confirmar":"Conferma cancellazione","cancelar.volver":"Indietro",
    "ranking.title":"Classifica","ranking.subtitle":"Classifica generale di giocatori e coppie",
    "ranking.categoria":"Categoria","ranking.nivel":"Livello","ranking.puntos":"Punti",
    "ranking.pts":"Pts","ranking.pareja":"Coppia","ranking.jugadores":"Giocatori",
    "ranking.v":"V","ranking.d":"P","ranking.pj":"G","ranking.racha":"Serie",
    "ranking.mov":"Mov.","ranking.pos":"#","ranking.ultima_act":"Ultimo aggiornamento",
    "ranking.filtrar":"Cerca giocatore o coppia...","ranking.general":"Generale",
    "ranking.masculino":"Maschile","ranking.femenino":"Femminile","ranking.mixto":"Misto",
    "ranking.iniciacion":"Principiante","ranking.medio":"Intermedio","ranking.avanzado":"Avanzato",
    "ranking.podio":"Podio — Top 3","ranking.tabla":"Classifica completa",
    "ranking.datos_ejemplo":"Dati di esempio","ranking.sistema_puntos":"Sistema punti del club configurabile.",
    "ranking.temporada":"Stagione","ranking.buscar":"Cerca...",
    "ranking.campeon":"Campione","ranking.subcampeon":"Finalista","ranking.tercero":"3° posto",
    "ranking.mejor_pareja":"Migliore coppia","ranking.pts_totales":"punti totali",
    "ranking.sin_resultados":"Nessun risultato con questi filtri.",
    "ranking.estado":"Stato","ranking.activo":"Attivo",
    "common.cargando":"Caricamento...","common.error":"Errore","common.cancelar":"Annulla",
    "common.confirmar":"Conferma","common.guardar":"Salva","common.volver":"Indietro",
    "common.editar":"Modifica","common.modo_seguro":"Modalità sicura","common.entorno":"Ambiente protetto",
    "common.sin_cambios":"Nessun cambiamento",
    "alta.title":"Registrazione giocatore","alta.eyebrow":"Giocatori","alta.desc":"Aggiungi un giocatore al club.",
    "alta.nombre":"Nome","alta.apellidos":"Cognome","alta.email":"Email","alta.telefono":"Telefono",
    "alta.fecha_nac":"Data di nascita","alta.nivel":"Livello","alta.genero":"Genere",
    "alta.comentarios":"Commenti","alta.seleccionar":"Seleziona",
    "alta.acepta":"Accetto i termini e la politica sulla privacy.",
    "alta.exito":"✅ Giocatore registrato con successo.","alta.registrando":"Registrazione...","alta.btn":"Registra giocatore",
    "cancelar.title":"Cancella prenotazione","cancelar.eyebrow":"Prenotazioni","cancelar.desc":"Richiedi la cancellazione di una prenotazione.",
    "cancelar.clave":"Codice prenotazione","cancelar.clave_ph":"Inserisci il codice prenotazione",
    "cancelar.confirmo_check":"Confermo di voler cancellare questa prenotazione.",
    "cancelar.btn":"Cancella prenotazione","cancelar.enviando":"Invio...","cancelar.volver_reservas":"Torna alle prenotazioni",
    "cancelar.que_ocurre":"Cosa succede dopo",
    "reservas.title":"Prenota un campo","reservas.eyebrow":"Prenotazioni","reservas.desc":"Prenota il tuo campo in pochi secondi.",
    "reservas.datos_jugador":"Dati del giocatore","reservas.fecha_pista":"Data, ora e campo",
    "reservas.hora_fin":"Ora di fine","reservas.total":"Totale","reservas.ver_resumen":"Vedi riepilogo",
    "reservas.editar":"Modifica","reservas.confirmar_btn":"Conferma","reservas.enviando":"Invio...",
    "reservas.registrada":"Prenotazione registrata","reservas.nueva_btn":"Nuova prenotazione",
    "reservas.nombre":"Nome","reservas.apellidos":"Cognome","reservas.modalidad":"Modalità",
    "reservas.nivel_form":"Livello","reservas.comentarios":"Commenti","reservas.minutos":"minuti",
    "reservas.confirmacion_desc":"La conferma dipende dal backend e dalle integrazioni configurate.",
    "reprog.title":"Riprogramma prenotazione","reprog.eyebrow":"Prenotazioni","reprog.desc":"Cambia data o ora della tua prenotazione.",
    "reprog.hora_fin":"Ora di fine","reprog.que_ocurre":"Cosa succede dopo","reprog.enviando":"Invio...","reprog.editar":"Modifica",
    "soporte.eyebrow":"Supporto",
    "lang.buscar":"Cerca lingua, paese, codice, bandiera…","lang.no_encontrados":"Nessuna lingua trovata.",
    "lang.hint":"Prova con paese, lingua, codice o bandiera. Esempio: Italia, Italiano, it-IT o 🇮🇹","lang.recomendados":"Consigliate","lang.todos":"Tutte le lingue",
    "status.reserva.pendiente":"In attesa","status.reserva.pendiente_txt":"Controlla i dati prima di confermare.",
    "status.reserva.enviando":"Invio","status.reserva.enviando_txt":"Stiamo inviando la tua richiesta di prenotazione.",
    "status.reserva.exito":"Successo","status.reserva.exito_txt":"Prenotazione inviata con successo. La disponibilità viene aggiornata.",
    "status.reserva.error":"Errore","status.reserva.error_txt":"Impossibile completare la prenotazione. Controlla i dati e riprova.",
    "status.cancelar.idle":"In attesa","status.cancelar.idle_txt":"Conferma la cancellazione della tua prenotazione.",
    "status.cancelar.enviando":"Invio","status.cancelar.enviando_txt":"Stiamo inviando la tua richiesta di cancellazione.",
    "status.cancelar.exito":"Richiesta inviata","status.cancelar.exito_txt":"Richiesta di cancellazione inviata con successo.",
    "status.cancelar.error":"Invio non riuscito","status.cancelar.error_txt":"Controlla il codice e riprova.",
    "status.reprog.idle":"In attesa","status.reprog.idle_txt":"Scegli una nuova data o orario.",
    "status.reprog.enviando":"Riprogrammazione","status.reprog.enviando_txt":"Verifica disponibilità e aggiornamento prenotazione.",
    "status.reprog.exito":"Prenotazione riprogrammata","status.reprog.exito_txt":"La prenotazione è stata aggiornata con successo.",
    "status.reprog.error":"Riprogrammazione non riuscita","status.reprog.error_txt":"Controlla i dati e riprova.",
    "errors.nombre":"Inserisci un nome valido.","errors.apellidos":"Inserisci un cognome valido.",
    "errors.email":"Inserisci un'email valida.","errors.telefono":"Inserisci un numero di telefono valido.",
    "errors.fecha":"Seleziona una data.","errors.fecha_pasado":"La data non può essere nel passato.",
    "errors.fecha_domingo":"Il club è chiuso la domenica.",
    "errors.hora":"Seleziona un orario disponibile.","errors.duracion":"Seleziona una durata valida.",
    "errors.hora_pasada":"La fascia oraria selezionata è già passata.",
    "errors.hora_cierre":"La prenotazione terminerebbe dopo la chiusura del club.",
    "errors.pista":"Seleziona un campo valido.","errors.modalidad":"Seleziona una modalità valida.",
    "errors.nivel":"Seleziona un livello valido.",
    "errors.clave":"Inserisci il codice prenotazione.","errors.clave_incompleta":"Il codice prenotazione sembra incompleto.",
    "errors.nueva_fecha":"Seleziona la nuova data.","errors.nueva_fecha_pasado":"La nuova data non può essere nel passato.",
    "errors.confirmado_reprog":"Conferma che vuoi riprogrammare la prenotazione.",
    "errors.confirmado_cancelar":"Conferma che vuoi richiedere la cancellazione prima di inviare.",
    "errors.datos_incompletos":"Alcuni dati sono incompleti o non validi. Correggili prima di confermare.",
    "errors.horario_ocupado":"Quella fascia oraria è appena stata occupata. Scegline un'altra.",
    "errors.reserva_error":"Impossibile completare la prenotazione. Riprova tra qualche secondo.",
    "errors.cancelar_error":"Impossibile inviare la richiesta. Controlla il codice e riprova.",
    "errors.reprog_campos":"Compila correttamente tutti i campi obbligatori.",
    "errors.reprog_ocupado":"Quella fascia oraria è appena stata occupata. Selezionane un'altra.",
    "errors.reprog_error":"Impossibile completare la riprogrammazione. Controlla il codice e riprova.",
    "badge.confirmed":"Confermata","badge.pending":"In attesa","badge.completed":"Completata",
    "home.galeria_eyebrow":"Galleria","home.galeria_desc":"Galleria visiva del club.","home.sistema":"Sistema",
    "cancelar.info1":"Elaboreremo la tua richiesta in modo sicuro.",
    "cancelar.info2":"La cancellazione verrà registrata.",
    "cancelar.info3":"Puoi tornare al calendario quando vuoi.",
    "reprog.info1":"Il codice identifica la prenotazione che vuoi modificare.",
    "reprog.info2":"Lo stesso codice viene mantenuto dopo la riprogrammazione.",
    "reprog.info3":"Riceverai conferma via email una volta elaborato il cambiamento.",
    "reprog.info4":"Le notifiche saranno attivate in una fase successiva.",
    "reprog.nueva_disponibilidad":"Nuova disponibilità","reprog.selecciona_franja":"Seleziona una nuova fascia disponibile.",
    "flujos.exportar_json":"⬇ Esporta JSON","flujos.total_procesos":"Totale processi","flujos.auditados":"Verificati",
    "flujos.activos_label":"Attivi","flujos.conectados":"Connessi","flujos.pausados_label":"In pausa",
    "flujos.en_pausa":"In pausa","flujos.incidencias_label":"Incidenti","flujos.ultimas_24h":"Ultime 24h",
    "flujos.tasa_exito":"Tasso di successo","flujos.global_sistema":"Globale sistema",
    "flujos.ultimo_backup":"Ultimo backup","flujos.automatico":"Automatico",
    "flujos.estado_procesos_label":"Stato processi","flujos.por_estado":"Per stato di connessione",
    "flujos.actividad_24h":"Attività ultime 24h","flujos.por_hora":"Per ora del giorno",
    "flujos.total_24h_label":"Totale 24h","flujos.ejecuciones":"esecuzioni",
    "flujos.por_categoria":"Processi per categoria","flujos.distribucion":"Distribuzione dei 50 processi",
    "flujos.mas_activos":"Processi più attivi","flujos.con_incidencias":"Processi con incidenti",
    "flujos.sin_errores":"✅ Nessun errore registrato","flujos.criticos":"Stato processi critici",
    "flujos.estado_op":"Stato operativo","flujos.todos_flujos":"Tutti i processi",
    "flujos.ocultar_tabla":"▲ Nascondi tabella","flujos.ver_tabla":"▼ Vedi tabella completa",
    "flujos.col_flujo":"Processo","flujos.col_categoria":"Categoria","flujos.col_estado":"Stato",
    "flujos.nota_integracion":"Integrazione tecnica connessa. I dati in tempo reale richiedono connessione al backend del club.",
    "admin.gestion_eyebrow":"Gestione","admin.gestion_title":"Campi e clienti",
    "admin.gestion_desc":"Moduli pronti per la gestione operativa.",
    "admin.gestion_item1":"Gestione campi","admin.gestion_item2":"Clienti e profili",
    "admin.gestion_item3":"Storico prenotazioni","admin.gestion_item4":"Regole di disponibilità",
    "admin.crec_eyebrow":"Crescita","admin.crec_title":"Tornei e processi",
    "admin.crec_desc":"Area pronta ad attivare processi quando il backend sarà disponibile.",
    "admin.crec_item1":"Tornei","admin.crec_item2":"Classifica e categorie",
    "admin.crec_item3":"Sistema di classificazione","admin.crec_item4":"Pagamenti futuri",
    "admin.backup_eyebrow":"Sistema attivo","admin.backup_desc":"Backup automatico di prenotazioni e soci attivi.",
    "admin.backup_item1":"Programmazione: lunedì 07:00","admin.backup_item2":"Origine: Database",
    "admin.backup_item3":"Destinazione: Archiviazione","admin.backup_item4":"Conferma: Notifiche",
    "admin.sistema_eyebrow":"Sistema","admin.exito_label":"Successo:",
    "auth.roles_title":"Ruoli e accessi","auth.pending_badge":"Configurazione in attesa",
    "auth.pending_desc":"Sistema di accesso per ruoli. In produzione deve essere protetto da un provider di autenticazione.",
    "auth.secciones":"Sezioni:",
    "soporte.proteccion_h3":"Protezione richiesta in produzione",
    "soporte.estado_tec_eyebrow":"Stato integrazioni","soporte.estado_tec_title":"Stato tecnico",
    "soporte.estado_tec_desc":"Checklist di connessione backend.",
    "soporte.worker_item":"Worker prenotazioni pronto",
    "soporte.make_item":"Automazioni in attesa di segreto privato",
    "soporte.airtable_item":"Database pronto senza scritture attive",
    "soporte.stripe_item":"Pagamenti e messaggistica in attesa di configurazione",
    "soporte.obs_eyebrow":"Osservabilità","soporte.obs_title":"Log ed errori",
    "soporte.obs_desc":"Area riservata alla diagnostica quando il backend reale sarà disponibile.",
    "soporte.logs_worker":"Log del Worker","soporte.logs_validaciones":"Validazioni",
    "soporte.logs_errores":"Errori di integrazioni","soporte.logs_alertas":"Avvisi tecnici futuri",
    "soporte.vars_h3":"Stato di sicurezza: variabili protette",
    "soporte.vars_no_names":"I nomi e i valori interni non vengono mostrati nell'interfaccia.",
    "soporte.vars_validacion":"Convalida disponibile solo nella documentazione interna o in una console sicura.",
  },
  "pt-PT": {
    "nav.inicio":"Início","nav.reservar":"Reservar","nav.alta_jugador":"Registo de jogador",
    "nav.reprogramar":"Reagendar","nav.cancelar":"Cancelar reserva",
    "nav.gestion":"Reservas","nav.torneos":"Torneios","nav.ranking":"Classificação",
    "nav.admin":"Admin","nav.flujos_make":"Centro técnico","nav.soporte":"Suporte",
    "nav.comunidad":"Comunidade",
    "nav.cerrar_sesion":"Terminar sessão","nav.saas_label":"SaaS seguro","nav.cerrar_menu":"Fechar","nav.abrir_menu":"Menu",
    "login.title":"Entrar como função","login.entrar":"Entrar","login.cancelar":"Cancelar",
    "login.password":"Palavra-passe","login.ver_pwd":"👁️ Ver palavra-passe","login.ocultar_pwd":"🙈 Ocultar",
    "login.guardar_sesion":"Guardar sessão neste dispositivo","login.acceder_como":"Entrar como",
    "login.intro_pwd":"Introduza a palavra-passe atribuída a esta função.",
    "login.error_rol":"Selecione uma função válida.","login.error_pwd":"Palavra-passe incorreta.",
    "login.sesion_label":"Club Pádel 04 · Início de sessão",
    "login.legal":"Acesso local protegido por palavra-passe. Sessão guardável apenas neste dispositivo.",
    "login.olvide_pwd":"Esqueceu a palavra-passe?","login.recuperar_title":"Recuperar acesso","login.recuperar_desc":"Introduza o seu e-mail e, se a conta existir, receberá instruções para repor o acesso.","login.recuperar_email":"Endereço de e-mail","login.recuperar_btn":"Enviar instruções","login.recuperar_enviado":"Se esse endereço estiver registado no sistema, receberá instruções em breve. Verifique também a pasta de spam.","login.recuperar_volver":"Voltar ao início de sessão","login.recuperar_preparado":"Preparado para endpoint: /api/auth/forgot-password","login.recuperar_no_disponible":"A recuperação de palavra-passe ainda não está disponível neste ambiente: pendente de ativação do fornecedor de autenticação.","login.recuperar_cargando":"A enviar instruções…",
    "perfil.title":"Perfil e definições","perfil.eyebrow":"A minha conta","perfil.sesion":"Sessão ativa","perfil.rol_actual":"Função atual","perfil.cerrar_sesion":"Terminar sessão","perfil.cambiar_pwd":"Alterar palavra-passe","perfil.pwd_actual":"Palavra-passe atual","perfil.pwd_nueva":"Nova palavra-passe","perfil.pwd_confirmar":"Confirmar nova palavra-passe","perfil.pwd_guardada":"Palavra-passe atualizada (modo demo local).","perfil.pwd_error_vacia":"Introduza a palavra-passe atual.","perfil.pwd_error_nueva":"Mínimo 8 caracteres, maiúscula, minúscula e número.","perfil.pwd_error_coincide":"As palavras-passe não coincidem.","perfil.idioma":"Idioma da interface","perfil.info_demo":"Perfil em modo local. Os dados são guardados apenas neste dispositivo.","perfil.privacidad":"Privacidade","perfil.privacidad_desc":"Em produção, os dados pessoais serão geridos em conformidade com o RGPD.","perfil.notificaciones":"Notificações","perfil.notif_desc":"Preparado para notificações por e-mail e mensagens em produção.","perfil.avatar_cambiar":"Alterar foto de perfil","perfil.avatar_eliminar":"Remover foto","perfil.avatar_confirmar_del":"Remover a sua foto de perfil?","perfil.avatar_guardada":"Foto atualizada.","perfil.avatar_eliminada":"Foto removida.","perfil.avatar_error_tipo":"Apenas imagens (JPG, PNG, WEBP).","perfil.avatar_error_size":"Máximo 5 MB.","perfil.bio_titulo":"A sua apresentação","perfil.bio_placeholder":"Fale-nos do seu jogo, nível ou disponibilidade...","perfil.bio_guardar":"Guardar","perfil.bio_cancelar":"Cancelar","perfil.bio_guardada":"Apresentação guardada.","perfil.bio_editar":"Editar apresentação","perfil.bio_chars":"caracteres","perfil.deporte_titulo":"Perfil desportivo","perfil.deporte_guardar":"Guardar dados","perfil.deporte_guardados":"Dados desportivos guardados.","perfil.deporte_mano":"Mão dominante","perfil.deporte_posicion":"Posição preferida","perfil.deporte_nivel":"Nível de jogo","perfil.deporte_disponibilidad":"Disponibilidade habitual","perfil.deporte_tipo_partida":"Tipo de jogo","perfil.deporte_objetivo":"Objetivo principal","perfil.deporte_busqueda":"Estado de pesquisa","perfil.metricas_titulo":"A minha atividade","perfil.metricas_partidos":"Jogos disputados","perfil.metricas_reservas":"Reservas efetuadas","perfil.metricas_torneos":"Torneios disputados","perfil.metricas_ranking":"Classificação atual","perfil.metricas_actividad":"Nível de atividade","perfil.metricas_valoracion":"Avaliação desportiva","perfil.metricas_fiabilidad":"Fiabilidade","perfil.metricas_racha":"Sequência ativa","perfil.historial_titulo":"Momentos do jogador","perfil.insignias_titulo":"Conquistas do jogador","perfil.privacidad_config":"Definições de privacidade","perfil.privacidad_guardada":"Privacidade atualizada.","perfil.privacidad_perfil_visible":"Perfil visível para outros jogadores","perfil.privacidad_nivel":"Mostrar nível de jogo","perfil.privacidad_disponibilidad":"Mostrar disponibilidade","perfil.privacidad_stats":"Mostrar estatísticas","perfil.privacidad_invitaciones":"Permitir convites para jogos","perfil.privacidad_recomendaciones":"Permitir recomendações de parceiro","perfil.completitud_titulo":"Completude do perfil","nav.perfil":"Perfil e definições",
    "login.subtitle":"Selecione como pretende entrar na aplicação.",
    "login.idioma":"Idioma",
    "role.PLAYER.label":"Jogador / cliente","role.PLAYER.desc":"Reservar campos, consultar reservas e classificação.",
    "role.STAFF.label":"Staff / receção","role.STAFF.desc":"Gestão diária de reservas e assistência a jogadores.",
    "role.ADMIN.label":"Administrador","role.ADMIN.desc":"Painel de gestão, métricas e controlo operacional.",
    "role.SUPPORT.label":"Suporte técnico","role.SUPPORT.desc":"Zona técnica, integrações e diagnóstico interno.",
    "home.reservas_hoy":"Reservas hoje","home.ocupacion_media":"Ocupação média",
    "home.socios_activos":"Sócios ativos","home.procesos_activos":"Processos ativos",
    "home.ingresos_mes":"Receitas do mês","home.torneos_activos":"Torneios ativos",
    "home.estado_operativo":"Estado operacional","home.reservar":"Reservar",
    "home.torneo":"Torneio","home.alta":"Registo","home.procesos":"Processos",
    "home.avisos_activos":"Alertas ativos","home.ver_procesos":"Ver processos",
    "home.vs_ayer":"vs ontem","home.pistas_activas":"4 campos ativos",
    "home.estimacion_mensual":"Estimativa mensal","home.en_curso":"Em curso",
    "home.este_mes":"este mês","home.incidencia":"incidente","home.incidencias_s":"incidentes",
    "home.franja_horaria":"Faixa horária","home.tendencia_semanal":"Tendência semanal",
    "home.porcentaje_uso":"% utilização","home.procesos_conectados":"processos conectados",
    "home.activos":"Ativos","home.pausados":"Pausados","home.incidencias":"Incidentes","home.flujos_totales":"fluxos totais","home.operativo_probado":"operacional (testado E2E)",
    "home.reservas_hora":"Reservas por hora — hoje","home.reservas_7dias":"Reservas últimos 7 dias",
    "home.ocupacion_pista":"Ocupação por campo","home.estado_procesos":"Estado dos processos",
    "home.club_operativo":"Clube de padel","home.hero_accent":"operacional",
    "home.hero_subtitle":"SaaS por funções: jogador, receção, administração e suporte.",
    "home.btn_torneos":"Torneios","home.btn_admin":"Admin",
    "home.ir_reservas":"Ir para reservas","home.ver_gestion":"Gerir reservas",
    "home.ver_admin":"Ver admin","home.ver_soporte":"Ver suporte",
    "home.galeria":"Galeria do clube",
    "home.dias_semana":"S,T,Q,Q,S,S,D","home.dias_largo":"Seg,Ter,Qua,Qui,Sex,Sáb,Dom",
    "admin.panel":"Painel de gestão","admin.metricas":"Métricas globais do clube.",
    "admin.reservas_mes":"Reservas do mês","admin.ocupacion":"Ocupação média",
    "admin.socios":"Sócios ativos","admin.procesos":"Processos ativos",
    "admin.backup":"Último backup","admin.ingr_mes":"Receitas do mês",
    "admin.vs_mes_anterior":"vs mês anterior","admin.prox_lunes":"Próximo: segunda 07:00",
    "admin.graf_hoy":"Reservas por hora — hoje","admin.graf_semana":"Evolução semanal",
    "admin.graf_pista":"Ocupação por campo","admin.sub_hoy":"Faixa horária · demo",
    "admin.sub_semana":"Reservas 7 dias · demo","admin.sub_pista":"% utilização · demo",
    "admin.backup_semana":"Backup semanal","admin.integraciones":"Estado das integrações",
    "admin.integ_desc":"Prontas, pendentes de credenciais ou de implementação.",
    "soporte.title":"Suporte técnico","soporte.desc":"Controlo técnico da aplicação.",
    "soporte.proteccion":"Proteção necessária em produção","soporte.vars":"Variáveis privadas",
    "flujos.title":"Centro técnico","flujos.desc":"Estado das automatizações do sistema.",
    "torneos.title":"Torneios","torneos.bracket":"Tabela interativa",
    "torneos.anyadir":"Adicionar par","torneos.guardar":"Guardar","torneos.publicar":"Publicar",
    "torneos.exportar":"Exportar","torneos.campeon":"Campeão","torneos.subcampeon":"Vice-campeão",
    "torneos.tercer_puesto":"3.º lugar","torneos.jugadores":"Jogadores","torneos.parejas":"Pares",
    "torneos.ganador":"Vencedor","torneos.eliminada":"Eliminado","torneos.avanza":"Avança",
    "torneos.bye":"BYE","torneos.pase_directo":"Passe direto","torneos.personalizado":"Personalizado",
    "torneos.ver_ranking":"Ver classificação completa","torneos.autoasignar":"Auto-atribuir","torneos.reordenar":"Reordenar",
    "reservas.nueva":"Nova reserva","reservas.fecha":"Data","reservas.hora":"Hora",
    "reservas.pista":"Campo","reservas.duracion":"Duração","reservas.confirmar":"Confirmar reserva",
    "reservas.resumen":"Resumo","reservas.disponible":"Disponível","reservas.no_disponible":"Indisponível",
    "reprog.clave":"Chave de reserva","reprog.nueva_fecha":"Nova data",
    "reprog.nueva_hora":"Nova hora de início","reprog.nueva_pista":"Novo campo",
    "reprog.resumen":"Resumo da alteração","reprog.confirmo":"Confirmo que quero reagendar esta reserva",
    "reprog.btn":"Reagendar reserva","reprog.volver":"Voltar às reservas",
    "cancelar.motivo":"Motivo","cancelar.confirmar":"Confirmar cancelamento","cancelar.volver":"Voltar",
    "ranking.title":"Classificação","ranking.subtitle":"Classificação geral de jogadores e pares",
    "ranking.categoria":"Categoria","ranking.nivel":"Nível","ranking.puntos":"Pontos",
    "ranking.pts":"Pts","ranking.pareja":"Par","ranking.jugadores":"Jogadores",
    "ranking.v":"V","ranking.d":"D","ranking.pj":"J","ranking.racha":"Sequência",
    "ranking.mov":"Mov.","ranking.pos":"#","ranking.ultima_act":"Última atualização",
    "ranking.filtrar":"Pesquisar jogador ou par...","ranking.general":"Geral",
    "ranking.masculino":"Masculino","ranking.femenino":"Feminino","ranking.mixto":"Misto",
    "ranking.iniciacion":"Iniciação","ranking.medio":"Intermédio","ranking.avanzado":"Avançado",
    "ranking.podio":"Pódio — Top 3","ranking.tabla":"Classificação completa",
    "ranking.datos_ejemplo":"Dados de exemplo","ranking.sistema_puntos":"Sistema de pontos do clube configurável.",
    "ranking.temporada":"Época","ranking.buscar":"Pesquisar...",
    "ranking.campeon":"Campeão","ranking.subcampeon":"Vice-campeão","ranking.tercero":"3.º lugar",
    "ranking.mejor_pareja":"Melhor par","ranking.pts_totales":"pontos totais",
    "ranking.sin_resultados":"Sem resultados com esses filtros.",
    "ranking.estado":"Estado","ranking.activo":"Ativo",
    "common.cargando":"A carregar...","common.error":"Erro","common.cancelar":"Cancelar",
    "common.confirmar":"Confirmar","common.guardar":"Guardar","common.volver":"Voltar",
    "common.editar":"Editar","common.modo_seguro":"Modo seguro","common.entorno":"Ambiente protegido",
    "common.sin_cambios":"Sem alterações",
    "alta.title":"Registo de jogador","alta.eyebrow":"Jogadores","alta.desc":"Adiciona um jogador ao clube.",
    "alta.nombre":"Nome","alta.apellidos":"Apelido","alta.email":"Email","alta.telefono":"Telefone",
    "alta.fecha_nac":"Data de nascimento","alta.nivel":"Nível","alta.genero":"Género",
    "alta.comentarios":"Comentários","alta.seleccionar":"Selecionar",
    "alta.acepta":"Aceito os termos e política de privacidade.",
    "alta.exito":"✅ Jogador registado com sucesso.","alta.registrando":"A registar...","alta.btn":"Registar jogador",
    "cancelar.title":"Cancelar reserva","cancelar.eyebrow":"Reservas","cancelar.desc":"Solicitar o cancelamento de uma reserva.",
    "cancelar.clave":"Código de reserva","cancelar.clave_ph":"Introduza o seu código de reserva",
    "cancelar.confirmo_check":"Confirmo que quero cancelar esta reserva.",
    "cancelar.btn":"Cancelar reserva","cancelar.enviando":"A enviar...","cancelar.volver_reservas":"Voltar às reservas",
    "cancelar.que_ocurre":"O que acontece a seguir",
    "reservas.title":"Reservar campo","reservas.eyebrow":"Reservas","reservas.desc":"Reserve o seu campo em segundos.",
    "reservas.datos_jugador":"Dados do jogador","reservas.fecha_pista":"Data, hora e campo",
    "reservas.hora_fin":"Hora de fim","reservas.total":"Total","reservas.ver_resumen":"Ver resumo",
    "reservas.editar":"Editar","reservas.confirmar_btn":"Confirmar","reservas.enviando":"A enviar...",
    "reservas.registrada":"Reserva registada","reservas.nueva_btn":"Nova reserva",
    "reservas.nombre":"Nome","reservas.apellidos":"Apelido","reservas.modalidad":"Modalidade",
    "reservas.nivel_form":"Nível","reservas.comentarios":"Comentários","reservas.minutos":"minutos",
    "reservas.confirmacion_desc":"A confirmação depende do backend e das integrações configuradas.",
    "reprog.title":"Reprogramar reserva","reprog.eyebrow":"Reservas","reprog.desc":"Altere a data ou hora da sua reserva.",
    "reprog.hora_fin":"Hora de fim","reprog.que_ocurre":"O que acontece a seguir","reprog.enviando":"A enviar...","reprog.editar":"Editar",
    "soporte.eyebrow":"Suporte",
    "lang.buscar":"Pesquisar idioma, país, código, bandeira…","lang.no_encontrados":"Nenhum idioma encontrado.",
    "lang.hint":"Tente com país, idioma, código ou bandeira. Exemplo: Portugal, Português, pt-PT ou 🇵🇹","lang.recomendados":"Recomendados","lang.todos":"Todos os idiomas",
    "status.reserva.pendiente":"Pendente","status.reserva.pendiente_txt":"Reveja os dados antes de confirmar.",
    "status.reserva.enviando":"A enviar","status.reserva.enviando_txt":"Estamos a enviar o seu pedido de reserva.",
    "status.reserva.exito":"Sucesso","status.reserva.exito_txt":"Reserva enviada com sucesso. A disponibilidade está a ser atualizada.",
    "status.reserva.error":"Erro","status.reserva.error_txt":"Não foi possível completar a reserva. Verifique os dados e tente novamente.",
    "status.cancelar.idle":"Pendente","status.cancelar.idle_txt":"Confirme o cancelamento da sua reserva.",
    "status.cancelar.enviando":"A enviar","status.cancelar.enviando_txt":"Estamos a enviar o seu pedido de cancelamento.",
    "status.cancelar.exito":"Pedido enviado","status.cancelar.exito_txt":"Pedido de cancelamento enviado com sucesso.",
    "status.cancelar.error":"Não foi possível enviar","status.cancelar.error_txt":"Verifique o código e tente novamente.",
    "status.reprog.idle":"Pendente","status.reprog.idle_txt":"Escolha uma nova data ou horário.",
    "status.reprog.enviando":"A reagendar","status.reprog.enviando_txt":"A verificar disponibilidade e a atualizar a sua reserva.",
    "status.reprog.exito":"Reserva reagendada","status.reprog.exito_txt":"A sua reserva foi atualizada com sucesso.",
    "status.reprog.error":"Não foi possível reagendar","status.reprog.error_txt":"Verifique os dados e tente novamente.",
    "errors.nombre":"Introduza um nome válido.","errors.apellidos":"Introduza apelidos válidos.",
    "errors.email":"Introduza um email válido.","errors.telefono":"Introduza um número de telefone válido.",
    "errors.fecha":"Selecione uma data.","errors.fecha_pasado":"A data não pode ser anterior a hoje.",
    "errors.fecha_domingo":"O clube está fechado aos domingos.",
    "errors.hora":"Selecione um horário disponível.","errors.duracion":"Selecione uma duração válida.",
    "errors.hora_pasada":"A faixa horária selecionada já passou.",
    "errors.hora_cierre":"A reserva terminaria depois do encerramento do clube.",
    "errors.pista":"Selecione um campo válido.","errors.modalidad":"Selecione uma modalidade válida.",
    "errors.nivel":"Selecione um nível válido.",
    "errors.clave":"Introduza o código de reserva.","errors.clave_incompleta":"O código de reserva parece incompleto.",
    "errors.nueva_fecha":"Selecione a nova data.","errors.nueva_fecha_pasado":"A nova data não pode ser anterior a hoje.",
    "errors.confirmado_reprog":"Confirme que pretende reagendar a reserva.",
    "errors.confirmado_cancelar":"Confirme que pretende solicitar o cancelamento antes de enviar.",
    "errors.datos_incompletos":"Alguns dados estão incompletos ou inválidos. Corrija-os antes de confirmar.",
    "errors.horario_ocupado":"Esse horário acabou de ser ocupado. Escolha outro.",
    "errors.reserva_error":"Não foi possível completar a reserva. Tente novamente em alguns segundos.",
    "errors.cancelar_error":"Não foi possível enviar o pedido. Verifique o código e tente novamente.",
    "errors.reprog_campos":"Preencha corretamente todos os campos obrigatórios.",
    "errors.reprog_ocupado":"Esse horário acabou de ser ocupado. Selecione outro.",
    "errors.reprog_error":"Não foi possível completar o reagendamento. Verifique o código e tente novamente.",
    "badge.confirmed":"Confirmada","badge.pending":"Pendente","badge.completed":"Concluída",
    "home.galeria_eyebrow":"Galeria","home.galeria_desc":"Galeria visual do clube.","home.sistema":"Sistema",
    "cancelar.info1":"Processaremos o seu pedido de forma segura.",
    "cancelar.info2":"O cancelamento ficará registado.",
    "cancelar.info3":"Pode voltar ao calendário quando quiser.",
    "reprog.info1":"O código identifica a reserva que pretende alterar.",
    "reprog.info2":"O mesmo código é mantido após o reagendamento.",
    "reprog.info3":"Receberá confirmação por email assim que a alteração for processada.",
    "reprog.info4":"As notificações serão ativadas numa fase posterior.",
    "reprog.nueva_disponibilidad":"Nova disponibilidade","reprog.selecciona_franja":"Selecione uma nova faixa disponível.",
    "flujos.exportar_json":"⬇ Exportar JSON","flujos.total_procesos":"Total processos","flujos.auditados":"Auditados",
    "flujos.activos_label":"Ativos","flujos.conectados":"Conectados","flujos.pausados_label":"Pausados",
    "flujos.en_pausa":"Em pausa","flujos.incidencias_label":"Incidentes","flujos.ultimas_24h":"Últimas 24h",
    "flujos.tasa_exito":"Taxa de sucesso","flujos.global_sistema":"Global do sistema",
    "flujos.ultimo_backup":"Último backup","flujos.automatico":"Automático",
    "flujos.estado_procesos_label":"Estado dos processos","flujos.por_estado":"Por estado de ligação",
    "flujos.actividad_24h":"Atividade últimas 24h","flujos.por_hora":"Por hora do dia",
    "flujos.total_24h_label":"Total 24h","flujos.ejecuciones":"execuções",
    "flujos.por_categoria":"Processos por categoria","flujos.distribucion":"Distribuição dos 50 processos",
    "flujos.mas_activos":"Processos mais ativos","flujos.con_incidencias":"Processos com incidentes",
    "flujos.sin_errores":"✅ Sem erros registados","flujos.criticos":"Estado dos processos críticos",
    "flujos.estado_op":"Estado operacional","flujos.todos_flujos":"Todos os processos",
    "flujos.ocultar_tabla":"▲ Ocultar tabela","flujos.ver_tabla":"▼ Ver tabela completa",
    "flujos.col_flujo":"Processo","flujos.col_categoria":"Categoria","flujos.col_estado":"Estado",
    "flujos.nota_integracion":"Integração técnica conectada. Os dados em tempo real requerem ligação ao backend do clube.",
    "admin.gestion_eyebrow":"Gestão","admin.gestion_title":"Campos e clientes",
    "admin.gestion_desc":"Módulos preparados para gestão operacional.",
    "admin.gestion_item1":"Gestão de campos","admin.gestion_item2":"Clientes e perfis",
    "admin.gestion_item3":"Histórico de reservas","admin.gestion_item4":"Regras de disponibilidade",
    "admin.crec_eyebrow":"Crescimento","admin.crec_title":"Torneios e processos",
    "admin.crec_desc":"Zona preparada para ativar processos quando existir backend.",
    "admin.crec_item1":"Torneios","admin.crec_item2":"Classificação e categorias",
    "admin.crec_item3":"Sistema de classificação","admin.crec_item4":"Pagamentos futuros",
    "admin.backup_eyebrow":"Sistema ativo","admin.backup_desc":"Cópia automática de reservas e sócios ativos.",
    "admin.backup_item1":"Programação: segunda 07:00","admin.backup_item2":"Origem: Base de dados",
    "admin.backup_item3":"Destino: Armazenamento","admin.backup_item4":"Confirmação: Notificações",
    "admin.sistema_eyebrow":"Sistema","admin.exito_label":"Sucesso:",
    "auth.roles_title":"Funções e acessos","auth.pending_badge":"Configuração pendente",
    "auth.pending_desc":"Sistema de acesso por funções. Em produção deve ser protegido por fornecedor de autenticação.",
    "auth.secciones":"Secções:",
    "soporte.proteccion_h3":"Proteção necessária em produção",
    "soporte.estado_tec_eyebrow":"Estado das integrações","soporte.estado_tec_title":"Estado técnico",
    "soporte.estado_tec_desc":"Checklist de ligação backend.",
    "soporte.worker_item":"Worker de reservas preparado",
    "soporte.make_item":"Automatizações pendentes de segredo privado",
    "soporte.airtable_item":"Base de dados preparada sem escrita ativa",
    "soporte.stripe_item":"Pagamentos e mensagens pendentes de configuração",
    "soporte.obs_eyebrow":"Observabilidade","soporte.obs_title":"Logs e erros",
    "soporte.obs_desc":"Zona reservada para diagnóstico quando existir backend real.",
    "soporte.logs_worker":"Logs do Worker","soporte.logs_validaciones":"Validações",
    "soporte.logs_errores":"Erros de integrações","soporte.logs_alertas":"Alertas técnicos futuros",
    "soporte.vars_h3":"Estado de segurança: variáveis protegidas",
    "soporte.vars_no_names":"Os nomes e valores internos não são mostrados na interface.",
    "soporte.vars_validacion":"Validação disponível apenas na documentação interna ou numa consola segura.",
  },
  "pt-BR": {
    "nav.inicio":"Início","nav.reservar":"Reservar","nav.alta_jugador":"Cadastro de jogador",
    "nav.reprogramar":"Remarcar","nav.cancelar":"Cancelar reserva",
    "nav.gestion":"Reservas","nav.torneos":"Torneios","nav.ranking":"Ranking",
    "nav.admin":"Admin","nav.flujos_make":"Central técnica","nav.soporte":"Suporte",
    "nav.comunidad":"Comunidade",
    "nav.cerrar_sesion":"Encerrar sessão","nav.saas_label":"SaaS seguro","nav.cerrar_menu":"Fechar","nav.abrir_menu":"Menu",
    "login.title":"Entrar como perfil","login.entrar":"Entrar","login.cancelar":"Cancelar",
    "login.password":"Senha","login.ver_pwd":"👁️ Mostrar senha","login.ocultar_pwd":"🙈 Ocultar",
    "login.guardar_sesion":"Lembrar neste dispositivo","login.acceder_como":"Entrar como",
    "login.intro_pwd":"Digite a senha atribuída a este perfil.",
    "login.error_rol":"Selecione um perfil válido.","login.error_pwd":"Senha incorreta para este perfil.",
    "login.sesion_label":"Club Pádel 04 · Login",
    "login.legal":"Acesso local protegido por senha. Sessão salvável apenas neste dispositivo.",
    "login.olvide_pwd":"Esqueceu a senha?","login.recuperar_title":"Recuperar acesso","login.recuperar_desc":"Insira seu e-mail e, se a conta existir, você receberá instruções para redefinir o acesso.","login.recuperar_email":"Endereço de e-mail","login.recuperar_btn":"Enviar instruções","login.recuperar_enviado":"Se esse endereço estiver cadastrado no sistema, você receberá instruções em breve. Verifique também a pasta de spam.","login.recuperar_volver":"Voltar ao login","login.recuperar_preparado":"Preparado para endpoint: /api/auth/forgot-password","login.recuperar_no_disponible":"A recuperação de senha ainda não está disponível neste ambiente: pendente de ativação do provedor de autenticação.","login.recuperar_cargando":"Enviando instruções…",
    "perfil.title":"Perfil e configurações","perfil.eyebrow":"Minha conta","perfil.sesion":"Sessão ativa","perfil.rol_actual":"Papel atual","perfil.cerrar_sesion":"Sair","perfil.cambiar_pwd":"Alterar senha","perfil.pwd_actual":"Senha atual","perfil.pwd_nueva":"Nova senha","perfil.pwd_confirmar":"Confirmar nova senha","perfil.pwd_guardada":"Senha atualizada (modo demo local).","perfil.pwd_error_vacia":"Insira a senha atual.","perfil.pwd_error_nueva":"Mínimo 8 caracteres, maiúscula, minúscula e número.","perfil.pwd_error_coincide":"As senhas não coincidem.","perfil.idioma":"Idioma da interface","perfil.info_demo":"Perfil em modo local. Os dados são salvos apenas neste dispositivo.","perfil.privacidad":"Privacidade","perfil.privacidad_desc":"Em produção, os dados pessoais serão gerenciados em conformidade com a LGPD.","perfil.notificaciones":"Notificações","perfil.notif_desc":"Preparado para notificações por e-mail e mensagens em produção.","perfil.avatar_cambiar":"Alterar foto de perfil","perfil.avatar_eliminar":"Remover foto","perfil.avatar_confirmar_del":"Remover a sua foto de perfil?","perfil.avatar_guardada":"Foto atualizada.","perfil.avatar_eliminada":"Foto removida.","perfil.avatar_error_tipo":"Apenas imagens (JPG, PNG, WEBP).","perfil.avatar_error_size":"Máximo 5 MB.","perfil.bio_titulo":"A sua apresentação","perfil.bio_placeholder":"Fale-nos do seu jogo, nível ou disponibilidade...","perfil.bio_guardar":"Salvar","perfil.bio_cancelar":"Cancelar","perfil.bio_guardada":"Apresentação salva.","perfil.bio_editar":"Editar apresentação","perfil.bio_chars":"caracteres","perfil.deporte_titulo":"Perfil esportivo","perfil.deporte_guardar":"Salvar dados","perfil.deporte_guardados":"Dados esportivos salvos.","perfil.deporte_mano":"Mão dominante","perfil.deporte_posicion":"Posição preferida","perfil.deporte_nivel":"Nível de jogo","perfil.deporte_disponibilidad":"Disponibilidade habitual","perfil.deporte_tipo_partida":"Tipo de jogo","perfil.deporte_objetivo":"Objetivo principal","perfil.deporte_busqueda":"Status de busca","perfil.metricas_titulo":"Minha atividade","perfil.metricas_partidos":"Partidas jogadas","perfil.metricas_reservas":"Reservas realizadas","perfil.metricas_torneos":"Torneios disputados","perfil.metricas_ranking":"Ranking atual","perfil.metricas_actividad":"Nível de atividade","perfil.metricas_valoracion":"Avaliação esportiva","perfil.metricas_fiabilidad":"Confiabilidade","perfil.metricas_racha":"Sequência ativa","perfil.historial_titulo":"Momentos do jogador","perfil.insignias_titulo":"Conquistas do jogador","perfil.privacidad_config":"Configurações de privacidade","perfil.privacidad_guardada":"Privacidade atualizada.","perfil.privacidad_perfil_visible":"Perfil visível para outros jogadores","perfil.privacidad_nivel":"Mostrar nível de jogo","perfil.privacidad_disponibilidad":"Mostrar disponibilidade","perfil.privacidad_stats":"Mostrar estatísticas","perfil.privacidad_invitaciones":"Permitir convites para partidas","perfil.privacidad_recomendaciones":"Permitir recomendações de parceiro","perfil.completitud_titulo":"Completude do perfil","nav.perfil":"Perfil e configurações",
    "login.subtitle":"Selecione como deseja entrar na aplicação.",
    "login.idioma":"Idioma",
    "role.PLAYER.label":"Jogador / cliente","role.PLAYER.desc":"Reservar quadras, consultar reservas e ranking.",
    "role.STAFF.label":"Staff / recepção","role.STAFF.desc":"Gestão diária de reservas e atendimento aos jogadores.",
    "role.ADMIN.label":"Administrador","role.ADMIN.desc":"Painel de gestão, métricas e controle operacional.",
    "role.SUPPORT.label":"Suporte técnico","role.SUPPORT.desc":"Zona técnica, integrações e diagnóstico interno.",
    "home.reservas_hoy":"Reservas hoje","home.ocupacion_media":"Ocupação média",
    "home.socios_activos":"Sócios ativos","home.procesos_activos":"Processos ativos",
    "home.ingresos_mes":"Receita do mês","home.torneos_activos":"Torneios ativos",
    "home.estado_operativo":"Status operacional","home.reservar":"Reservar",
    "home.torneo":"Torneio","home.alta":"Cadastro","home.procesos":"Processos",
    "home.avisos_activos":"Alertas ativos","home.ver_procesos":"Ver processos",
    "home.vs_ayer":"vs ontem","home.pistas_activas":"4 quadras ativas",
    "home.estimacion_mensual":"Estimativa mensal","home.en_curso":"Em andamento",
    "home.este_mes":"este mês","home.incidencia":"incidente","home.incidencias_s":"incidentes",
    "home.franja_horaria":"Faixa horária","home.tendencia_semanal":"Tendência semanal",
    "home.porcentaje_uso":"% utilização","home.procesos_conectados":"processos conectados",
    "home.activos":"Ativos","home.pausados":"Pausados","home.incidencias":"Incidentes","home.flujos_totales":"fluxos totais","home.operativo_probado":"operacional (testado E2E)",
    "home.reservas_hora":"Reservas por hora — hoje","home.reservas_7dias":"Reservas últimos 7 dias",
    "home.ocupacion_pista":"Ocupação por quadra","home.estado_procesos":"Status dos processos",
    "home.club_operativo":"Clube de padel","home.hero_accent":"operacional",
    "home.hero_subtitle":"SaaS por perfis: jogador, recepção, administração e suporte.",
    "home.btn_torneos":"Torneios","home.btn_admin":"Admin",
    "home.ir_reservas":"Ir para reservas","home.ver_gestion":"Gerenciar reservas",
    "home.ver_admin":"Ver admin","home.ver_soporte":"Ver suporte",
    "home.galeria":"Galeria do clube",
    "home.dias_semana":"S,T,Q,Q,S,S,D","home.dias_largo":"Seg,Ter,Qua,Qui,Sex,Sáb,Dom",
    "admin.panel":"Painel de gestão","admin.metricas":"Métricas globais do clube.",
    "admin.reservas_mes":"Reservas do mês","admin.ocupacion":"Ocupação média",
    "admin.socios":"Sócios ativos","admin.procesos":"Processos ativos",
    "admin.backup":"Último backup","admin.ingr_mes":"Receita do mês",
    "admin.vs_mes_anterior":"vs mês anterior","admin.prox_lunes":"Próximo: segunda 07:00",
    "admin.graf_hoy":"Reservas por hora — hoje","admin.graf_semana":"Evolução semanal",
    "admin.graf_pista":"Ocupação por quadra","admin.sub_hoy":"Faixa horária · demo",
    "admin.sub_semana":"Reservas 7 dias · demo","admin.sub_pista":"% utilização · demo",
    "admin.backup_semana":"Backup semanal","admin.integraciones":"Status das integrações",
    "admin.integ_desc":"Prontas, pendentes de credenciais ou de implantação.",
    "soporte.title":"Suporte técnico","soporte.desc":"Controle técnico da aplicação.",
    "soporte.proteccion":"Proteção necessária em produção","soporte.vars":"Variáveis privadas",
    "flujos.title":"Central técnica","flujos.desc":"Status das automações do sistema.",
    "torneos.title":"Torneios","torneos.bracket":"Chave interativa",
    "torneos.anyadir":"Adicionar dupla","torneos.guardar":"Salvar","torneos.publicar":"Publicar",
    "torneos.exportar":"Exportar","torneos.campeon":"Campeão","torneos.subcampeon":"Vice-campeão",
    "torneos.tercer_puesto":"3.º lugar","torneos.jugadores":"Jogadores","torneos.parejas":"Duplas",
    "torneos.ganador":"Vencedor","torneos.eliminada":"Eliminado","torneos.avanza":"Avança",
    "torneos.bye":"BYE","torneos.pase_directo":"Passe direto","torneos.personalizado":"Personalizado",
    "torneos.ver_ranking":"Ver ranking completo","torneos.autoasignar":"Auto-atribuir","torneos.reordenar":"Reordenar",
    "reservas.nueva":"Nova reserva","reservas.fecha":"Data","reservas.hora":"Horário",
    "reservas.pista":"Quadra","reservas.duracion":"Duração","reservas.confirmar":"Confirmar reserva",
    "reservas.resumen":"Resumo","reservas.disponible":"Disponível","reservas.no_disponible":"Indisponível",
    "reprog.clave":"Código da reserva","reprog.nueva_fecha":"Nova data",
    "reprog.nueva_hora":"Novo horário de início","reprog.nueva_pista":"Nova quadra",
    "reprog.resumen":"Resumo da alteração","reprog.confirmo":"Confirmo que quero remarcar esta reserva",
    "reprog.btn":"Remarcar reserva","reprog.volver":"Voltar às reservas",
    "cancelar.motivo":"Motivo","cancelar.confirmar":"Confirmar cancelamento","cancelar.volver":"Voltar",
    "ranking.title":"Ranking","ranking.subtitle":"Classificação geral de jogadores e duplas",
    "ranking.categoria":"Categoria","ranking.nivel":"Nível","ranking.puntos":"Pontos",
    "ranking.pts":"Pts","ranking.pareja":"Dupla","ranking.jugadores":"Jogadores",
    "ranking.v":"V","ranking.d":"D","ranking.pj":"J","ranking.racha":"Sequência",
    "ranking.mov":"Mov.","ranking.pos":"#","ranking.ultima_act":"Última atualização",
    "ranking.filtrar":"Buscar jogador ou dupla...","ranking.general":"Geral",
    "ranking.masculino":"Masculino","ranking.femenino":"Feminino","ranking.mixto":"Misto",
    "ranking.iniciacion":"Iniciante","ranking.medio":"Intermediário","ranking.avanzado":"Avançado",
    "ranking.podio":"Pódio — Top 3","ranking.tabla":"Ranking completo",
    "ranking.datos_ejemplo":"Dados de exemplo","ranking.sistema_puntos":"Sistema de pontos do clube configurável.",
    "ranking.temporada":"Temporada","ranking.buscar":"Buscar...",
    "ranking.campeon":"Campeão","ranking.subcampeon":"Vice-campeão","ranking.tercero":"3.º lugar",
    "ranking.mejor_pareja":"Melhor dupla","ranking.pts_totales":"pontos totais",
    "ranking.sin_resultados":"Sem resultados com esses filtros.",
    "ranking.estado":"Status","ranking.activo":"Ativo",
    "common.cargando":"Carregando...","common.error":"Erro","common.cancelar":"Cancelar",
    "common.confirmar":"Confirmar","common.guardar":"Salvar","common.volver":"Voltar",
    "common.editar":"Editar","common.modo_seguro":"Modo seguro","common.entorno":"Ambiente protegido",
    "common.sin_cambios":"Sem alterações",
    "alta.title":"Cadastro de jogador","alta.eyebrow":"Jogadores","alta.desc":"Adicione um jogador ao clube.",
    "alta.nombre":"Nome","alta.apellidos":"Sobrenome","alta.email":"Email","alta.telefono":"Telefone",
    "alta.fecha_nac":"Data de nascimento","alta.nivel":"Nível","alta.genero":"Gênero",
    "alta.comentarios":"Comentários","alta.seleccionar":"Selecionar",
    "alta.acepta":"Aceito os termos e política de privacidade.",
    "alta.exito":"✅ Jogador cadastrado com sucesso.","alta.registrando":"Cadastrando...","alta.btn":"Cadastrar jogador",
    "cancelar.title":"Cancelar reserva","cancelar.eyebrow":"Reservas","cancelar.desc":"Solicitar o cancelamento de uma reserva.",
    "cancelar.clave":"Código de reserva","cancelar.clave_ph":"Digite o código da sua reserva",
    "cancelar.confirmo_check":"Confirmo que quero cancelar esta reserva.",
    "cancelar.btn":"Cancelar reserva","cancelar.enviando":"Enviando...","cancelar.volver_reservas":"Voltar para reservas",
    "cancelar.que_ocurre":"O que acontece depois",
    "reservas.title":"Reservar quadra","reservas.eyebrow":"Reservas","reservas.desc":"Reserve sua quadra em segundos.",
    "reservas.datos_jugador":"Dados do jogador","reservas.fecha_pista":"Data, hora e quadra",
    "reservas.hora_fin":"Horário de término","reservas.total":"Total","reservas.ver_resumen":"Ver resumo",
    "reservas.editar":"Editar","reservas.confirmar_btn":"Confirmar","reservas.enviando":"Enviando...",
    "reservas.registrada":"Reserva registrada","reservas.nueva_btn":"Nova reserva",
    "reservas.nombre":"Nome","reservas.apellidos":"Sobrenome","reservas.modalidad":"Modalidade",
    "reservas.nivel_form":"Nível","reservas.comentarios":"Comentários","reservas.minutos":"minutos",
    "reservas.confirmacion_desc":"A confirmação depende do backend e das integrações configuradas.",
    "reprog.title":"Reagendar reserva","reprog.eyebrow":"Reservas","reprog.desc":"Altere a data ou horário da sua reserva.",
    "reprog.hora_fin":"Horário de término","reprog.que_ocurre":"O que acontece depois","reprog.enviando":"Enviando...","reprog.editar":"Editar",
    "soporte.eyebrow":"Suporte",
    "lang.buscar":"Pesquisar idioma, país, código, bandeira…","lang.no_encontrados":"Nenhum idioma encontrado.",
    "lang.hint":"Tente com país, idioma, código ou bandeira. Exemplo: Brasil, Português, pt-BR ou 🇧🇷","lang.recomendados":"Recomendados","lang.todos":"Todos os idiomas",
    "status.reserva.pendiente":"Pendente","status.reserva.pendiente_txt":"Revise os dados antes de confirmar.",
    "status.reserva.enviando":"Enviando","status.reserva.enviando_txt":"Estamos enviando a sua solicitação de reserva.",
    "status.reserva.exito":"Sucesso","status.reserva.exito_txt":"Reserva enviada com sucesso. A disponibilidade está sendo atualizada.",
    "status.reserva.error":"Erro","status.reserva.error_txt":"Não foi possível completar a reserva. Verifique os dados e tente novamente.",
    "status.cancelar.idle":"Pendente","status.cancelar.idle_txt":"Confirme o cancelamento da sua reserva.",
    "status.cancelar.enviando":"Enviando","status.cancelar.enviando_txt":"Estamos enviando a sua solicitação de cancelamento.",
    "status.cancelar.exito":"Solicitação enviada","status.cancelar.exito_txt":"Solicitação de cancelamento enviada com sucesso.",
    "status.cancelar.error":"Não foi possível enviar","status.cancelar.error_txt":"Verifique o código e tente novamente.",
    "status.reprog.idle":"Pendente","status.reprog.idle_txt":"Escolha uma nova data ou horário.",
    "status.reprog.enviando":"Remarcando","status.reprog.enviando_txt":"Verificando disponibilidade e atualizando sua reserva.",
    "status.reprog.exito":"Reserva remarcada","status.reprog.exito_txt":"Sua reserva foi atualizada com sucesso.",
    "status.reprog.error":"Não foi possível remarcar","status.reprog.error_txt":"Verifique os dados e tente novamente.",
    "errors.nombre":"Informe um nome válido.","errors.apellidos":"Informe sobrenomes válidos.",
    "errors.email":"Informe um email válido.","errors.telefono":"Informe um número de telefone válido.",
    "errors.fecha":"Selecione uma data.","errors.fecha_pasado":"A data não pode ser anterior a hoje.",
    "errors.fecha_domingo":"O clube está fechado aos domingos.",
    "errors.hora":"Selecione um horário disponível.","errors.duracion":"Selecione uma duração válida.",
    "errors.hora_pasada":"A faixa horária selecionada já passou.",
    "errors.hora_cierre":"A reserva terminaria depois do fechamento do clube.",
    "errors.pista":"Selecione uma quadra válida.","errors.modalidad":"Selecione uma modalidade válida.",
    "errors.nivel":"Selecione um nível válido.",
    "errors.clave":"Informe o código da reserva.","errors.clave_incompleta":"O código da reserva parece incompleto.",
    "errors.nueva_fecha":"Selecione a nova data.","errors.nueva_fecha_pasado":"A nova data não pode ser anterior a hoje.",
    "errors.confirmado_reprog":"Confirme que deseja remarcar a reserva.",
    "errors.confirmado_cancelar":"Confirme que deseja solicitar o cancelamento antes de enviar.",
    "errors.datos_incompletos":"Alguns dados estão incompletos ou inválidos. Corrija-os antes de confirmar.",
    "errors.horario_ocupado":"Esse horário acabou de ser ocupado. Escolha outro.",
    "errors.reserva_error":"Não foi possível completar a reserva. Tente novamente em alguns segundos.",
    "errors.cancelar_error":"Não foi possível enviar a solicitação. Verifique o código e tente novamente.",
    "errors.reprog_campos":"Preencha corretamente todos os campos obrigatórios.",
    "errors.reprog_ocupado":"Esse horário acabou de ser ocupado. Selecione outro.",
    "errors.reprog_error":"Não foi possível completar a remarcação. Verifique o código e tente novamente.",
    "badge.confirmed":"Confirmada","badge.pending":"Pendente","badge.completed":"Concluída",
    "home.galeria_eyebrow":"Galeria","home.galeria_desc":"Galeria visual do clube.","home.sistema":"Sistema",
    "cancelar.info1":"Processaremos a sua solicitação com segurança.",
    "cancelar.info2":"O cancelamento ficará registrado.",
    "cancelar.info3":"Você pode voltar ao calendário quando quiser.",
    "reprog.info1":"O código identifica a reserva que você quer alterar.",
    "reprog.info2":"O mesmo código é mantido após a remarcação.",
    "reprog.info3":"Você receberá confirmação por email assim que a alteração for processada.",
    "reprog.info4":"As notificações serão ativadas em uma fase posterior.",
    "reprog.nueva_disponibilidad":"Nova disponibilidade","reprog.selecciona_franja":"Selecione uma nova faixa disponível.",
    "flujos.exportar_json":"⬇ Exportar JSON","flujos.total_procesos":"Total processos","flujos.auditados":"Auditados",
    "flujos.activos_label":"Ativos","flujos.conectados":"Conectados","flujos.pausados_label":"Pausados",
    "flujos.en_pausa":"Em pausa","flujos.incidencias_label":"Incidentes","flujos.ultimas_24h":"Últimas 24h",
    "flujos.tasa_exito":"Taxa de sucesso","flujos.global_sistema":"Global do sistema",
    "flujos.ultimo_backup":"Último backup","flujos.automatico":"Automático",
    "flujos.estado_procesos_label":"Status dos processos","flujos.por_estado":"Por status de conexão",
    "flujos.actividad_24h":"Atividade últimas 24h","flujos.por_hora":"Por hora do dia",
    "flujos.total_24h_label":"Total 24h","flujos.ejecuciones":"execuções",
    "flujos.por_categoria":"Processos por categoria","flujos.distribucion":"Distribuição dos 50 processos",
    "flujos.mas_activos":"Processos mais ativos","flujos.con_incidencias":"Processos com incidentes",
    "flujos.sin_errores":"✅ Sem erros registrados","flujos.criticos":"Status dos processos críticos",
    "flujos.estado_op":"Status operacional","flujos.todos_flujos":"Todos os processos",
    "flujos.ocultar_tabla":"▲ Ocultar tabela","flujos.ver_tabla":"▼ Ver tabela completa",
    "flujos.col_flujo":"Processo","flujos.col_categoria":"Categoria","flujos.col_estado":"Status",
    "flujos.nota_integracion":"Integração técnica conectada. Os dados em tempo real requerem conexão ao backend do clube.",
    "admin.gestion_eyebrow":"Gestão","admin.gestion_title":"Quadras e clientes",
    "admin.gestion_desc":"Módulos preparados para gestão operacional.",
    "admin.gestion_item1":"Gestão de quadras","admin.gestion_item2":"Clientes e perfis",
    "admin.gestion_item3":"Histórico de reservas","admin.gestion_item4":"Regras de disponibilidade",
    "admin.crec_eyebrow":"Crescimento","admin.crec_title":"Torneios e processos",
    "admin.crec_desc":"Zona preparada para ativar processos quando existir backend.",
    "admin.crec_item1":"Torneios","admin.crec_item2":"Ranking e categorias",
    "admin.crec_item3":"Sistema de classificação","admin.crec_item4":"Pagamentos futuros",
    "admin.backup_eyebrow":"Sistema ativo","admin.backup_desc":"Cópia automática de reservas e sócios ativos.",
    "admin.backup_item1":"Programação: segunda 07:00","admin.backup_item2":"Origem: Banco de dados",
    "admin.backup_item3":"Destino: Armazenamento","admin.backup_item4":"Confirmação: Notificações",
    "admin.sistema_eyebrow":"Sistema","admin.exito_label":"Sucesso:",
    "auth.roles_title":"Perfis e acessos","auth.pending_badge":"Configuração pendente",
    "auth.pending_desc":"Sistema de acesso por perfis. Em produção deve ser protegido por provedor de autenticação.",
    "auth.secciones":"Seções:",
    "soporte.proteccion_h3":"Proteção necessária em produção",
    "soporte.estado_tec_eyebrow":"Status das integrações","soporte.estado_tec_title":"Status técnico",
    "soporte.estado_tec_desc":"Checklist de conexão backend.",
    "soporte.worker_item":"Worker de reservas pronto",
    "soporte.make_item":"Automações pendentes de segredo privado",
    "soporte.airtable_item":"Banco de dados preparado sem escritas ativas",
    "soporte.stripe_item":"Pagamentos e mensagens pendentes de configuração",
    "soporte.obs_eyebrow":"Observabilidade","soporte.obs_title":"Logs e erros",
    "soporte.obs_desc":"Zona reservada para diagnóstico quando existir backend real.",
    "soporte.logs_worker":"Logs do Worker","soporte.logs_validaciones":"Validações",
    "soporte.logs_errores":"Erros de integrações","soporte.logs_alertas":"Alertas técnicos futuros",
    "soporte.vars_h3":"Estado de segurança: variáveis protegidas",
    "soporte.vars_no_names":"Os nomes e valores internos não são exibidos na interface.",
    "soporte.vars_validacion":"Validação disponível apenas na documentação interna ou em um console seguro.",
  },
  "de-DE": {
    "nav.inicio":"Start","nav.reservar":"Buchen","nav.alta_jugador":"Spieler registrieren",
    "nav.reprogramar":"Umbuchen","nav.cancelar":"Buchung stornieren",
    "nav.gestion":"Buchungen","nav.torneos":"Turniere","nav.ranking":"Rangliste",
    "nav.admin":"Admin","nav.flujos_make":"Technisches Zentrum","nav.soporte":"Support",
    "nav.comunidad":"Gemeinschaft",
    "nav.cerrar_sesion":"Abmelden","nav.saas_label":"Sicheres SaaS","nav.cerrar_menu":"Schließen","nav.abrir_menu":"Menü",
    "login.title":"Als Rolle anmelden","login.entrar":"Eintreten","login.cancelar":"Abbrechen",
    "login.password":"Passwort","login.ver_pwd":"👁️ Passwort anzeigen","login.ocultar_pwd":"🙈 Ausblenden",
    "login.guardar_sesion":"Auf diesem Gerät speichern","login.acceder_como":"Anmelden als",
    "login.intro_pwd":"Geben Sie das dieser Rolle zugewiesene Passwort ein.",
    "login.error_rol":"Bitte wählen Sie eine gültige Rolle.","login.error_pwd":"Falsches Passwort für diese Rolle.",
    "login.sesion_label":"Club Pádel 04 · Anmeldung",
    "login.legal":"Lokaler Zugang durch Passwort geschützt. Sitzung nur auf diesem Gerät speicherbar.",
    "login.olvide_pwd":"Passwort vergessen?","login.recuperar_title":"Zugang wiederherstellen","login.recuperar_desc":"Geben Sie Ihre E-Mail-Adresse ein und, wenn das Konto existiert, erhalten Sie Anweisungen zur Zurücksetzung.","login.recuperar_email":"E-Mail-Adresse","login.recuperar_btn":"Anweisungen senden","login.recuperar_enviado":"Wenn diese Adresse im System registriert ist, erhalten Sie in Kürze Anweisungen. Prüfen Sie auch Ihren Spam-Ordner.","login.recuperar_volver":"Zurück zum Login","login.recuperar_preparado":"Bereit für Endpunkt: /api/auth/forgot-password","login.recuperar_no_disponible":"Die Passwort-Wiederherstellung ist in dieser Umgebung noch nicht verfügbar: Aktivierung des Authentifizierungsanbieters ausstehend.","login.recuperar_cargando":"Anweisungen werden gesendet…",
    "perfil.title":"Profil und Einstellungen","perfil.eyebrow":"Mein Konto","perfil.sesion":"Aktive Sitzung","perfil.rol_actual":"Aktuelle Rolle","perfil.cerrar_sesion":"Abmelden","perfil.cambiar_pwd":"Passwort ändern","perfil.pwd_actual":"Aktuelles Passwort","perfil.pwd_nueva":"Neues Passwort","perfil.pwd_confirmar":"Neues Passwort bestätigen","perfil.pwd_guardada":"Passwort aktualisiert (lokaler Demo-Modus).","perfil.pwd_error_vacia":"Bitte aktuelles Passwort eingeben.","perfil.pwd_error_nueva":"Mindestens 8 Zeichen, Groß-, Kleinbuchstabe und Zahl.","perfil.pwd_error_coincide":"Passwörter stimmen nicht überein.","perfil.idioma":"Schnittstellensprache","perfil.info_demo":"Profil im lokalen Modus. Daten werden nur auf diesem Gerät gespeichert.","perfil.privacidad":"Datenschutz","perfil.privacidad_desc":"Im Produktionsbetrieb werden persönliche Daten DSGVO-konform verarbeitet.","perfil.notificaciones":"Benachrichtigungen","perfil.notif_desc":"Bereit für E-Mail- und Messaging-Benachrichtigungen im Produktionsbetrieb.","perfil.avatar_cambiar":"Profilbild ändern","perfil.avatar_eliminar":"Foto entfernen","perfil.avatar_confirmar_del":"Profilbild entfernen?","perfil.avatar_guardada":"Foto aktualisiert.","perfil.avatar_eliminada":"Foto entfernt.","perfil.avatar_error_tipo":"Nur Bilder (JPG, PNG, WEBP).","perfil.avatar_error_size":"Maximal 5 MB.","perfil.bio_titulo":"Deine Vorstellung","perfil.bio_placeholder":"Erzähl uns von deinem Spiel, Niveau oder Verfügbarkeit...","perfil.bio_guardar":"Speichern","perfil.bio_cancelar":"Abbrechen","perfil.bio_guardada":"Vorstellung gespeichert.","perfil.bio_editar":"Vorstellung bearbeiten","perfil.bio_chars":"Zeichen","perfil.deporte_titulo":"Sportliches Profil","perfil.deporte_guardar":"Daten speichern","perfil.deporte_guardados":"Sportdaten gespeichert.","perfil.deporte_mano":"Dominante Hand","perfil.deporte_posicion":"Bevorzugte Position","perfil.deporte_nivel":"Spielniveau","perfil.deporte_disponibilidad":"Übliche Verfügbarkeit","perfil.deporte_tipo_partida":"Spieltyp","perfil.deporte_objetivo":"Hauptziel","perfil.deporte_busqueda":"Suchstatus","perfil.metricas_titulo":"Meine Aktivität","perfil.metricas_partidos":"Gespielte Partien","perfil.metricas_reservas":"Buchungen","perfil.metricas_torneos":"Turniere","perfil.metricas_ranking":"Aktuelles Ranking","perfil.metricas_actividad":"Aktivitätsniveau","perfil.metricas_valoracion":"Sportliche Bewertung","perfil.metricas_fiabilidad":"Zuverlässigkeit","perfil.metricas_racha":"Aktive Serie","perfil.historial_titulo":"Spielermomente","perfil.insignias_titulo":"Spielererfolge","perfil.privacidad_config":"Datenschutzeinstellungen","perfil.privacidad_guardada":"Datenschutz aktualisiert.","perfil.privacidad_perfil_visible":"Profil für andere Spieler sichtbar","perfil.privacidad_nivel":"Spielniveau anzeigen","perfil.privacidad_disponibilidad":"Verfügbarkeit anzeigen","perfil.privacidad_stats":"Statistiken anzeigen","perfil.privacidad_invitaciones":"Spieleinladungen erlauben","perfil.privacidad_recomendaciones":"Partnerempfehlungen erlauben","perfil.completitud_titulo":"Profilvollständigkeit","nav.perfil":"Profil und Einstellungen",
    "login.subtitle":"Wählen Sie aus, wie Sie die Anwendung betreten möchten.",
    "login.idioma":"Sprache",
    "role.PLAYER.label":"Spieler / Kunde","role.PLAYER.desc":"Plätze buchen, Buchungen und Rangliste einsehen.",
    "role.STAFF.label":"Personal / Empfang","role.STAFF.desc":"Tägliche Buchungsverwaltung und Spielerbetreuung.",
    "role.ADMIN.label":"Administrator","role.ADMIN.desc":"Verwaltungspanel, Metriken und Betriebskontrolle.",
    "role.SUPPORT.label":"Technischer Support","role.SUPPORT.desc":"Technische Zone, Integrationen und interne Diagnose.",
    "home.reservas_hoy":"Buchungen heute","home.ocupacion_media":"Durchschn. Auslastung",
    "home.socios_activos":"Aktive Mitglieder","home.procesos_activos":"Aktive Prozesse",
    "home.ingresos_mes":"Monatseinnahmen","home.torneos_activos":"Aktive Turniere",
    "home.estado_operativo":"Betriebsstatus","home.reservar":"Buchen",
    "home.torneo":"Turnier","home.alta":"Registrierung","home.procesos":"Prozesse",
    "home.avisos_activos":"Aktive Meldungen","home.ver_procesos":"Prozesse anzeigen",
    "home.vs_ayer":"vs gestern","home.pistas_activas":"4 aktive Plätze",
    "home.estimacion_mensual":"Monatliche Schätzung","home.en_curso":"Laufend",
    "home.este_mes":"diesen Monat","home.incidencia":"Vorfall","home.incidencias_s":"Vorfälle",
    "home.franja_horaria":"Zeitfenster","home.tendencia_semanal":"Wöchentlicher Trend",
    "home.porcentaje_uso":"% Nutzung","home.procesos_conectados":"verbundene Prozesse",
    "home.activos":"Aktiv","home.pausados":"Pausiert","home.incidencias":"Vorfälle","home.flujos_totales":"Abläufe insgesamt","home.operativo_probado":"operativ (E2E getestet)",
    "home.reservas_hora":"Buchungen pro Stunde — heute","home.reservas_7dias":"Buchungen letzte 7 Tage",
    "home.ocupacion_pista":"Auslastung je Platz","home.estado_procesos":"Prozessstatus",
    "home.club_operativo":"Padel-Club","home.hero_accent":"in Betrieb",
    "home.hero_subtitle":"SaaS nach Rollen: Spieler, Empfang, Verwaltung und Support.",
    "home.btn_torneos":"Turniere","home.btn_admin":"Admin",
    "home.ir_reservas":"Zu Buchungen","home.ver_gestion":"Buchungen verwalten",
    "home.ver_admin":"Admin anzeigen","home.ver_soporte":"Support anzeigen",
    "home.galeria":"Club-Galerie",
    "home.dias_semana":"Mo,Di,Mi,Do,Fr,Sa,So","home.dias_largo":"Mo,Di,Mi,Do,Fr,Sa,So",
    "admin.panel":"Verwaltungspanel","admin.metricas":"Globale Club-Metriken.",
    "admin.reservas_mes":"Monatliche Buchungen","admin.ocupacion":"Durchschn. Auslastung",
    "admin.socios":"Aktive Mitglieder","admin.procesos":"Aktive Prozesse",
    "admin.backup":"Letztes Backup","admin.ingr_mes":"Monatseinnahmen",
    "admin.vs_mes_anterior":"vs Vormonat","admin.prox_lunes":"Nächstes: Montag 07:00",
    "admin.graf_hoy":"Buchungen pro Stunde — heute","admin.graf_semana":"Wöchentliche Entwicklung",
    "admin.graf_pista":"Auslastung je Platz","admin.sub_hoy":"Zeitfenster · Demo",
    "admin.sub_semana":"Buchungen 7 Tage · Demo","admin.sub_pista":"% Nutzung · Demo",
    "admin.backup_semana":"Wöchentliches Backup","admin.integraciones":"Integrationsstatus",
    "admin.integ_desc":"Bereit, ausstehende Anmeldedaten oder Bereitstellung.",
    "soporte.title":"Technischer Support","soporte.desc":"Technische Kontrolle der Anwendung.",
    "soporte.proteccion":"Schutz in Produktion erforderlich","soporte.vars":"Private Variablen",
    "flujos.title":"Technisches Zentrum","flujos.desc":"Status der Systemautomatisierungen.",
    "torneos.title":"Turniere","torneos.bracket":"Interaktiver Bracket",
    "torneos.anyadir":"Paar hinzufügen","torneos.guardar":"Speichern","torneos.publicar":"Veröffentlichen",
    "torneos.exportar":"Exportieren","torneos.campeon":"Champion","torneos.subcampeon":"Vizemeister",
    "torneos.tercer_puesto":"3. Platz","torneos.jugadores":"Spieler","torneos.parejas":"Paare",
    "torneos.ganador":"Gewinner","torneos.eliminada":"Ausgeschieden","torneos.avanza":"Rückt vor",
    "torneos.bye":"BYE","torneos.pase_directo":"Direktpass","torneos.personalizado":"Benutzerdefiniert",
    "torneos.ver_ranking":"Vollständige Rangliste","torneos.autoasignar":"Auto-zuweisen","torneos.reordenar":"Neuordnen",
    "reservas.nueva":"Neue Buchung","reservas.fecha":"Datum","reservas.hora":"Uhrzeit",
    "reservas.pista":"Platz","reservas.duracion":"Dauer","reservas.confirmar":"Buchung bestätigen",
    "reservas.resumen":"Zusammenfassung","reservas.disponible":"Verfügbar","reservas.no_disponible":"Nicht verfügbar",
    "reprog.clave":"Buchungsschlüssel","reprog.nueva_fecha":"Neues Datum",
    "reprog.nueva_hora":"Neue Startzeit","reprog.nueva_pista":"Neuer Platz",
    "reprog.resumen":"Änderungsübersicht","reprog.confirmo":"Ich bestätige, dass ich diese Buchung umbuchen möchte",
    "reprog.btn":"Buchung umbuchen","reprog.volver":"Zurück zu Buchungen",
    "cancelar.motivo":"Grund","cancelar.confirmar":"Stornierung bestätigen","cancelar.volver":"Zurück",
    "ranking.title":"Rangliste","ranking.subtitle":"Allgemeine Rangliste der Spieler und Paare",
    "ranking.categoria":"Kategorie","ranking.nivel":"Niveau","ranking.puntos":"Punkte",
    "ranking.pts":"Pkt","ranking.pareja":"Paar","ranking.jugadores":"Spieler",
    "ranking.v":"S","ranking.d":"N","ranking.pj":"Sp","ranking.racha":"Serie",
    "ranking.mov":"Bew.","ranking.pos":"#","ranking.ultima_act":"Letzte Aktualisierung",
    "ranking.filtrar":"Spieler oder Paar suchen...","ranking.general":"Allgemein",
    "ranking.masculino":"Herren","ranking.femenino":"Damen","ranking.mixto":"Mixed",
    "ranking.iniciacion":"Anfänger","ranking.medio":"Mittel","ranking.avanzado":"Fortgeschritten",
    "ranking.podio":"Podium — Top 3","ranking.tabla":"Vollständige Rangliste",
    "ranking.datos_ejemplo":"Beispieldaten","ranking.sistema_puntos":"Konfigurierbares Club-Punktesystem.",
    "ranking.temporada":"Saison","ranking.buscar":"Suchen...",
    "ranking.campeon":"Champion","ranking.subcampeon":"Vizemeister","ranking.tercero":"3. Platz",
    "ranking.mejor_pareja":"Bestes Paar","ranking.pts_totales":"Pkt gesamt",
    "ranking.sin_resultados":"Keine Ergebnisse mit diesen Filtern.",
    "ranking.estado":"Status","ranking.activo":"Aktiv",
    "common.cargando":"Laden...","common.error":"Fehler","common.cancelar":"Abbrechen",
    "common.confirmar":"Bestätigen","common.guardar":"Speichern","common.volver":"Zurück",
    "common.editar":"Bearbeiten","common.modo_seguro":"Sicherer Modus","common.entorno":"Geschützte Umgebung",
    "common.sin_cambios":"Keine Änderung",
    "alta.title":"Spieler registrieren","alta.eyebrow":"Spieler","alta.desc":"Einen Spieler zum Club hinzufügen.",
    "alta.nombre":"Vorname","alta.apellidos":"Nachname","alta.email":"E-Mail","alta.telefono":"Telefon",
    "alta.fecha_nac":"Geburtsdatum","alta.nivel":"Niveau","alta.genero":"Geschlecht",
    "alta.comentarios":"Kommentare","alta.seleccionar":"Auswählen",
    "alta.acepta":"Ich akzeptiere die Bedingungen und die Datenschutzrichtlinie.",
    "alta.exito":"✅ Spieler erfolgreich registriert.","alta.registrando":"Wird registriert...","alta.btn":"Spieler registrieren",
    "cancelar.title":"Buchung stornieren","cancelar.eyebrow":"Buchungen","cancelar.desc":"Stornierungsanfrage für eine Buchung stellen.",
    "cancelar.clave":"Buchungsschlüssel","cancelar.clave_ph":"Buchungsschlüssel eingeben",
    "cancelar.confirmo_check":"Ich bestätige, dass ich diese Buchung stornieren möchte.",
    "cancelar.btn":"Buchung stornieren","cancelar.enviando":"Wird gesendet...","cancelar.volver_reservas":"Zurück zu Buchungen",
    "cancelar.que_ocurre":"Was passiert als nächstes",
    "reservas.title":"Platz buchen","reservas.eyebrow":"Buchungen","reservas.desc":"Buchen Sie Ihren Platz in Sekunden.",
    "reservas.datos_jugador":"Spielerdaten","reservas.fecha_pista":"Datum, Uhrzeit und Platz",
    "reservas.hora_fin":"Endzeit","reservas.total":"Gesamt","reservas.ver_resumen":"Zusammenfassung",
    "reservas.editar":"Bearbeiten","reservas.confirmar_btn":"Bestätigen","reservas.enviando":"Wird gesendet...",
    "reservas.registrada":"Buchung registriert","reservas.nueva_btn":"Neue Buchung",
    "reservas.nombre":"Vorname","reservas.apellidos":"Nachname","reservas.modalidad":"Modus",
    "reservas.nivel_form":"Niveau","reservas.comentarios":"Kommentare","reservas.minutos":"Minuten",
    "reservas.confirmacion_desc":"Die Bestätigung hängt vom Backend und den konfigurierten Integrationen ab.",
    "reprog.title":"Buchung umbuchen","reprog.eyebrow":"Buchungen","reprog.desc":"Datum oder Uhrzeit Ihrer Buchung ändern.",
    "reprog.hora_fin":"Endzeit","reprog.que_ocurre":"Was passiert als nächstes","reprog.enviando":"Wird gesendet...","reprog.editar":"Bearbeiten",
    "soporte.eyebrow":"Support",
    "lang.buscar":"Sprache, Land, Code, Flagge suchen…","lang.no_encontrados":"Keine Sprachen gefunden.",
    "lang.hint":"Versuchen Sie Land, Sprache, Code oder Flagge. Beispiel: Deutschland, Deutsch, de-DE oder 🇩🇪","lang.recomendados":"Empfohlen","lang.todos":"Alle Sprachen",
    "status.reserva.pendiente":"Ausstehend","status.reserva.pendiente_txt":"Überprüfen Sie Ihre Daten vor der Bestätigung.",
    "status.reserva.enviando":"Wird gesendet","status.reserva.enviando_txt":"Wir senden Ihre Buchungsanfrage.",
    "status.reserva.exito":"Erfolg","status.reserva.exito_txt":"Buchung erfolgreich gesendet. Die Verfügbarkeit wird aktualisiert.",
    "status.reserva.error":"Fehler","status.reserva.error_txt":"Buchung konnte nicht abgeschlossen werden. Überprüfen Sie die Daten und versuchen Sie es erneut.",
    "status.cancelar.idle":"Ausstehend","status.cancelar.idle_txt":"Bestätigen Sie die Stornierung Ihrer Buchung.",
    "status.cancelar.enviando":"Wird gesendet","status.cancelar.enviando_txt":"Wir senden Ihre Stornierungsanfrage.",
    "status.cancelar.exito":"Anfrage gesendet","status.cancelar.exito_txt":"Stornierungsanfrage erfolgreich gesendet.",
    "status.cancelar.error":"Senden fehlgeschlagen","status.cancelar.error_txt":"Überprüfen Sie den Schlüssel und versuchen Sie es erneut.",
    "status.reprog.idle":"Ausstehend","status.reprog.idle_txt":"Wählen Sie ein neues Datum oder eine neue Uhrzeit.",
    "status.reprog.enviando":"Wird umgebucht","status.reprog.enviando_txt":"Verfügbarkeit wird geprüft und Buchung aktualisiert.",
    "status.reprog.exito":"Buchung umgebucht","status.reprog.exito_txt":"Ihre Buchung wurde erfolgreich aktualisiert.",
    "status.reprog.error":"Umbuchung fehlgeschlagen","status.reprog.error_txt":"Überprüfen Sie die Daten und versuchen Sie es erneut.",
    "errors.nombre":"Bitte geben Sie einen gültigen Vornamen ein.","errors.apellidos":"Bitte geben Sie einen gültigen Nachnamen ein.",
    "errors.email":"Bitte geben Sie eine gültige E-Mail-Adresse ein.","errors.telefono":"Bitte geben Sie eine gültige Telefonnummer ein.",
    "errors.fecha":"Bitte wählen Sie ein Datum.","errors.fecha_pasado":"Das Datum darf nicht in der Vergangenheit liegen.",
    "errors.fecha_domingo":"Der Club ist sonntags geschlossen.",
    "errors.hora":"Bitte wählen Sie eine verfügbare Uhrzeit.","errors.duracion":"Bitte wählen Sie eine gültige Dauer.",
    "errors.hora_pasada":"Das gewählte Zeitfenster ist bereits vergangen.",
    "errors.hora_cierre":"Die Buchung würde nach der Schließzeit des Clubs enden.",
    "errors.pista":"Bitte wählen Sie einen gültigen Platz.","errors.modalidad":"Bitte wählen Sie einen gültigen Modus.",
    "errors.nivel":"Bitte wählen Sie ein gültiges Niveau.",
    "errors.clave":"Bitte geben Sie den Buchungsschlüssel ein.","errors.clave_incompleta":"Der Buchungsschlüssel scheint unvollständig.",
    "errors.nueva_fecha":"Bitte wählen Sie das neue Datum.","errors.nueva_fecha_pasado":"Das neue Datum darf nicht in der Vergangenheit liegen.",
    "errors.confirmado_reprog":"Bitte bestätigen Sie, dass Sie die Buchung umbuchen möchten.",
    "errors.confirmado_cancelar":"Bitte bestätigen Sie, dass Sie eine Stornierung beantragen möchten.",
    "errors.datos_incompletos":"Einige Daten sind unvollständig oder ungültig. Korrigieren Sie diese vor der Bestätigung.",
    "errors.horario_ocupado":"Dieses Zeitfenster wurde gerade belegt. Bitte wählen Sie ein anderes.",
    "errors.reserva_error":"Buchung konnte nicht abgeschlossen werden. Versuchen Sie es in einigen Sekunden erneut.",
    "errors.cancelar_error":"Anfrage konnte nicht gesendet werden. Überprüfen Sie den Schlüssel und versuchen Sie es erneut.",
    "errors.reprog_campos":"Bitte füllen Sie alle Pflichtfelder korrekt aus.",
    "errors.reprog_ocupado":"Dieses Zeitfenster wurde gerade belegt. Bitte wählen Sie ein anderes.",
    "errors.reprog_error":"Umbuchung konnte nicht abgeschlossen werden. Überprüfen Sie den Schlüssel und versuchen Sie es erneut.",
    "badge.confirmed":"Bestätigt","badge.pending":"Ausstehend","badge.completed":"Abgeschlossen",
    "home.galeria_eyebrow":"Galerie","home.galeria_desc":"Bildergalerie des Clubs.","home.sistema":"System",
    "cancelar.info1":"Wir werden Ihre Anfrage sicher bearbeiten.",
    "cancelar.info2":"Die Stornierung wird registriert.",
    "cancelar.info3":"Sie können jederzeit zum Kalender zurückkehren.",
    "reprog.info1":"Der Schlüssel identifiziert die Buchung, die Sie ändern möchten.",
    "reprog.info2":"Derselbe Schlüssel wird nach der Umbuchung beibehalten.",
    "reprog.info3":"Sie erhalten eine Bestätigung per E-Mail, sobald die Änderung verarbeitet wurde.",
    "reprog.info4":"Benachrichtigungen werden in einer späteren Phase aktiviert.",
    "reprog.nueva_disponibilidad":"Neue Verfügbarkeit","reprog.selecciona_franja":"Wählen Sie ein neues verfügbares Zeitfenster.",
    "flujos.exportar_json":"⬇ JSON exportieren","flujos.total_procesos":"Prozesse gesamt","flujos.auditados":"Geprüft",
    "flujos.activos_label":"Aktiv","flujos.conectados":"Verbunden","flujos.pausados_label":"Pausiert",
    "flujos.en_pausa":"In Pause","flujos.incidencias_label":"Vorfälle","flujos.ultimas_24h":"Letzte 24h",
    "flujos.tasa_exito":"Erfolgsrate","flujos.global_sistema":"System global",
    "flujos.ultimo_backup":"Letztes Backup","flujos.automatico":"Automatisch",
    "flujos.estado_procesos_label":"Prozessstatus","flujos.por_estado":"Nach Verbindungsstatus",
    "flujos.actividad_24h":"Aktivität letzte 24h","flujos.por_hora":"Nach Tageszeit",
    "flujos.total_24h_label":"Gesamt 24h","flujos.ejecuciones":"Ausführungen",
    "flujos.por_categoria":"Prozesse nach Kategorie","flujos.distribucion":"Verteilung der 50 Prozesse",
    "flujos.mas_activos":"Aktivste Prozesse","flujos.con_incidencias":"Prozesse mit Vorfällen",
    "flujos.sin_errores":"✅ Keine Fehler registriert","flujos.criticos":"Status kritischer Prozesse",
    "flujos.estado_op":"Betriebsstatus","flujos.todos_flujos":"Alle Prozesse",
    "flujos.ocultar_tabla":"▲ Tabelle ausblenden","flujos.ver_tabla":"▼ Vollständige Tabelle",
    "flujos.col_flujo":"Prozess","flujos.col_categoria":"Kategorie","flujos.col_estado":"Status",
    "flujos.nota_integracion":"Technische Integration verbunden. Echtzeit-Daten erfordern Verbindung zum Club-Backend.",
    "admin.gestion_eyebrow":"Verwaltung","admin.gestion_title":"Plätze und Kunden",
    "admin.gestion_desc":"Module für die Betriebsleitung bereit.",
    "admin.gestion_item1":"Platzverwaltung","admin.gestion_item2":"Kunden und Profile",
    "admin.gestion_item3":"Buchungsverlauf","admin.gestion_item4":"Verfügbarkeitsregeln",
    "admin.crec_eyebrow":"Wachstum","admin.crec_title":"Turniere und Prozesse",
    "admin.crec_desc":"Bereich bereit, Prozesse zu aktivieren, wenn Backend verfügbar ist.",
    "admin.crec_item1":"Turniere","admin.crec_item2":"Rangliste und Kategorien",
    "admin.crec_item3":"Klassifizierungssystem","admin.crec_item4":"Zukünftige Zahlungen",
    "admin.backup_eyebrow":"Aktives System","admin.backup_desc":"Automatische Sicherung von Buchungen und aktiven Mitgliedern.",
    "admin.backup_item1":"Planung: Montag 07:00","admin.backup_item2":"Quelle: Datenbank",
    "admin.backup_item3":"Ziel: Speicher","admin.backup_item4":"Bestätigung: Benachrichtigungen",
    "admin.sistema_eyebrow":"System","admin.exito_label":"Erfolg:",
    "auth.roles_title":"Rollen und Zugriffe","auth.pending_badge":"Konfiguration ausstehend",
    "auth.pending_desc":"Rollenbasiertes Zugriffssystem. In Produktion muss es durch einen Authentifizierungsanbieter geschützt sein.",
    "auth.secciones":"Bereiche:",
    "soporte.proteccion_h3":"Produktionsschutz erforderlich",
    "soporte.estado_tec_eyebrow":"Integrationsstatus","soporte.estado_tec_title":"Technischer Status",
    "soporte.estado_tec_desc":"Backend-Verbindungs-Checkliste.",
    "soporte.worker_item":"Buchungs-Worker bereit",
    "soporte.make_item":"Automatisierungen warten auf privaten Schlüssel",
    "soporte.airtable_item":"Datenbank bereit ohne aktive Schreibvorgänge",
    "soporte.stripe_item":"Zahlungen und Messaging ausstehend",
    "soporte.obs_eyebrow":"Beobachtbarkeit","soporte.obs_title":"Logs und Fehler",
    "soporte.obs_desc":"Bereich für Diagnose wenn echtes Backend verfügbar ist.",
    "soporte.logs_worker":"Worker-Logs","soporte.logs_validaciones":"Validierungen",
    "soporte.logs_errores":"Integrationsfehler","soporte.logs_alertas":"Künftige technische Warnungen",
    "soporte.vars_h3":"Sicherheitsstatus: geschützte Variablen",
    "soporte.vars_no_names":"Interne Namen und Werte werden in der Oberfläche nicht angezeigt.",
    "soporte.vars_validacion":"Validierung nur in der internen Dokumentation oder einer sicheren Konsole verfügbar.",
  },
};

function t(key, lang) {
  try {
    const code = lang?.code || "es-ES";
    const base = code.split("-")[0];
    const dict = TRANSLATIONS[code] || TRANSLATIONS[Object.keys(TRANSLATIONS).find(k => k.startsWith(base))] || {};
    const esDict = TRANSLATIONS["es-ES"] || {};
    return dict[key] ?? esDict[key] ?? key;
  } catch { return key; }
}

// ============================================================
// END i18n sistema
// ============================================================

function LanguageSelector() {
  const lang = useLang();
  const ltx = key => t(key, lang);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => loadSavedLanguage() || LANGUAGES_RAW.find(l => l.code === "es-ES") || LANGUAGES_ALL[0]);
  const dropRef = useRef(null);
  const searchRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onClickOut(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, [open]);

  function filterLanguages(list) {
    if (!search.trim()) return list;
    const q = normalizeSearchText(search);
    const qRaw = search.trim();
    return list.filter(lang => {
      const fields = [lang.label, lang.country, lang.countryEs, lang.countryEn, lang.code, lang.flag, ...(lang.aliases || [])];
      return fields.some(f => f && (normalizeSearchText(f).includes(q) || String(f).includes(qRaw)));
    });
  }

  function selectLang(lang) {
    setSelected(lang);
    setOpen(false);
    setSearch("");
    setGlobalLang(lang);
    triggerRef.current?.focus();
  }

  const filteredRecommended = filterLanguages(LANGUAGES_RECOMMENDED);
  const filteredAll = filterLanguages(LANGUAGES_ALL);
  const hasResults = filteredRecommended.length > 0 || filteredAll.length > 0;

  return (
    <div ref={dropRef} style={{ position: "relative", width: "100%" }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Idioma: ${selected.label} ${selected.flag}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="cp04-lang-listbox"
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "rgba(182,255,0,.06)", border: `1px solid rgba(182,255,0,.18)`, borderRadius: 12, padding: "9px 13px", cursor: "pointer", color: "#fff", fontSize: ".84rem", fontWeight: 700, fontFamily: "inherit" }}
      >
        <span style={{ fontSize: "1.1rem" }}>{selected.flag}</span>
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.label}</span>
        <span style={{ color: "rgba(182,255,0,.7)", fontSize: ".7rem" }}>{selected.code}</span>
        <span style={{ color: "rgba(255,255,255,.4)", fontSize: ".75rem", marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, zIndex: 9999, background: "linear-gradient(160deg,#0b111d,#08101a)", border: "1px solid rgba(182,255,0,.22)", borderRadius: 18, boxShadow: "0 24px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(182,255,0,.06)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: 380 }}>
          <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={ltx("lang.buscar")}
              style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(182,255,0,.2)", borderRadius: 10, color: "#fff", fontSize: ".82rem", padding: "8px 11px", outline: "none", fontFamily: "inherit", minHeight: "unset" }}
            />
          </div>

          <div id="cp04-lang-listbox" role="listbox" aria-label={ltx("lang.buscar")} style={{ overflowY: "auto", flex: 1 }}>
            {!hasResults ? (
              <div style={{ padding: "18px 16px", textAlign: "center" }}>
                <div style={{ color: "rgba(255,255,255,.55)", fontSize: ".84rem", marginBottom: 8 }}>{ltx("lang.no_encontrados")}</div>
                <div style={{ color: "rgba(154,168,189,.5)", fontSize: ".74rem", lineHeight: 1.6 }}>{ltx("lang.hint")}</div>
              </div>
            ) : (
              <>
                {filteredRecommended.length > 0 && (
                  <>
                    <div style={{ padding: "8px 14px 4px", color: "rgba(182,255,0,.7)", fontSize: ".68rem", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" }}>{ltx("lang.recomendados")}</div>
                    {filteredRecommended.map(lang => <LangOption key={lang.code} lang={lang} selected={selected} onSelect={selectLang} />)}
                  </>
                )}
                {filteredAll.length > 0 && (
                  <>
                    <div style={{ padding: "8px 14px 4px", color: "rgba(154,168,189,.6)", fontSize: ".68rem", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", borderTop: filteredRecommended.length > 0 ? "1px solid rgba(255,255,255,.06)" : "none", marginTop: filteredRecommended.length > 0 ? 4 : 0 }}>{ltx("lang.todos")}</div>
                    {filteredAll.map(lang => <LangOption key={lang.code} lang={lang} selected={selected} onSelect={selectLang} />)}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LangOption({ lang, selected, onSelect }) {
  const isSelected = selected.code === lang.code;
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(lang)}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: isSelected ? "rgba(182,255,0,.1)" : "transparent", border: "none", borderLeft: isSelected ? "3px solid rgba(182,255,0,.8)" : "3px solid transparent", padding: "8px 14px", cursor: "pointer", color: "#fff", textAlign: "left", transition: "background .12s ease" }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{lang.flag}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 700, fontSize: ".83rem", color: isSelected ? "rgba(182,255,0,.95)" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lang.label}</span>
        <span style={{ display: "block", fontSize: ".71rem", color: "rgba(154,168,189,.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lang.countryEs || lang.country} · {lang.code}</span>
      </span>
      {isSelected && <span style={{ color: "rgba(182,255,0,.9)", fontSize: ".85rem", flexShrink: 0 }}>✓</span>}
    </button>
  );
}

// ============================================================
// END i18n
// ============================================================

function Sidebar({ current, selectedRole, onClearRole, mobileOpen, onNavigate, onClose }) {
  const lang = useLang();
  const tx = key => t(key, lang);
  const navKeys = [
    ["inicio","nav.inicio","🏠"],["reservas","nav.reservar","🎾"],["alta_jugador","nav.alta_jugador","👤"],
    // PASO 07I (2026-07-19): acceso directo a Baja de Jugador (Paso 07C),
    // justo después de Alta de jugador — mismo componente AltaJugador(),
    // solo cambia la pestaña inicial (ver modules.baja_jugador). Mismo gate
    // de rol que "alta_jugador" (ver CP04_ROLE_PERMISSIONS en rbac.js).
    ["baja_jugador","nav.baja_jugador","🧾"],
    ["reprogramar","nav.reprogramar","↻"],["cancelar","nav.cancelar","✕"],["gestion","nav.gestion","📅"],
    // PASO 07G (2026-07-19): acceso directo al módulo de Cierre Temporal de
    // Pistas (Paso 07E), antes solo visible como card dentro de "gestion".
    // Mismo gate de rol que "gestion" (ver CP04_ROLE_PERMISSIONS en rbac.js).
    ["cierre_pistas","nav.cierre_pistas","🚧"],
    // PASO 07N (2026-07-20): módulo visual preparado para Gestión Lista de
    // Espera (Make ID 5791113, grupo E del mapa App↔Make hasta este paso).
    // No llama a ningún endpoint real todavía — mismo gate de rol que
    // "cierre_pistas" (ver CP04_ROLE_PERMISSIONS en rbac.js).
    ["lista_espera","nav.lista_espera","📋"],
    // PASO 07O (2026-07-20): consolidación de módulos de sidebar para 14
    // escenarios más del inventario Make, agrupados en 4 módulos visuales
    // (ver docs/paso-07o-sidebar-flujos-50/). "control_qr" y
    // "pistas_recordatorios" son operación diaria, mismo gate que
    // "cierre_pistas"/"lista_espera". "dashboard_kpi" y
    // "backups_seguridad" están gateados como "admin" (ADMIN+SUPPORT, sin
    // STAFF) — ver CP04_ROLE_PERMISSIONS en rbac.js.
    ["control_qr","nav.control_qr","🔐"],
    ["pistas_recordatorios","nav.pistas_recordatorios","🔔"],
    // PASO 07P (2026-07-20): ampliación de sidebar para 20 escenarios más
    // del inventario Make (ver docs/paso-07p-ampliacion-sidebar-31-flujos/).
    // "comunicaciones_socio" y "calendario_disponibilidad" son operación
    // diaria, mismo gate que "control_qr"/"pistas_recordatorios"
    // (STAFF/ADMIN/SUPPORT). "facturacion_pagos" y "automatizaciones_bots"
    // están gateados como "admin" (ADMIN+SUPPORT, sin STAFF).
    ["comunicaciones_socio","nav.comunicaciones_socio","💌"],
    ["calendario_disponibilidad","nav.calendario_disponibilidad","🗓️"],
    ["torneos","nav.torneos","🏆"],["ranking","nav.ranking","🏅"],["comunidad","nav.comunidad","👥"],["admin","nav.admin","📊"],
    ["dashboard_kpi","nav.dashboard_kpi","📈"],
    ["backups_seguridad","nav.backups_seguridad","🗂️"],
    ["facturacion_pagos","nav.facturacion_pagos","💳"],
    ["automatizaciones_bots","nav.automatizaciones_bots","🤖"],
    ["flujos_make","nav.flujos_make","🛠️"],["soporte","nav.soporte","🛠️"],["perfil","nav.perfil","⚙️"],
  ];
  // Antes había un mapa de permisos propio y duplicado aquí (menuByRole),
  // mantenido a mano en paralelo a CP04_ROLE_PERMISSIONS. Se ha unificado:
  // ahora la navegación y el guard final de render (más abajo, en
  // ClubPadel04SaaSApp) leen exactamente la misma fuente, para que nunca
  // puedan desincronizarse entre sí.
  const allowedMenu = CP04_ROLE_PERMISSIONS[cp04NormalizeRole(selectedRole)] || CP04_ROLE_PERMISSIONS.PLAYER;
  const visibleItems = navKeys.filter(([id]) => allowedMenu.includes(id));

  return (
    <aside id="cp04-mobile-menu" className="cp04-sidebar" data-open={mobileOpen ? "true" : "false"} aria-label="Navegación principal">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:26 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ width:12, height:12, borderRadius:"50%", background:T.accent, boxShadow:`0 0 18px ${T.accent}` }} />
          <div>
            <div style={{ fontFamily:T.fontDisplay, fontWeight:900 }}>CLUB PÁDEL 04</div>
            <div style={{ color:T.textDim, fontSize:".78rem" }}>{tx("nav.saas_label")}</div>
          </div>
        </div>
        <button className="cp04-menu-button cp04-sidebar-close" type="button" onClick={onClose} aria-label="Cerrar menú">{tx("nav.cerrar_menu")}</button>
      </div>
      <nav style={{ display:"grid", gap:8 }}>
        {visibleItems.map(([id, key, icon]) => {
          const label = tx(key);
          return (
            <button
              key={id}
              data-tour={`sidebar-${id}`}
              onClick={() => onNavigate(id)}
              aria-current={current === id ? "page" : undefined}
              aria-label={`${label}`}
              className={`cp04-menu-button ${current===id ? "is-active" : ""} ${id==="soporte" ? "cp04-sidebar-soporte-btn" : ""}`.replace(/\s+/g," ").trim()}
              style={{
                display:"flex",
                alignItems:"center",
                gap:10,
                width:"100%",
                background: current===id
                  ? "linear-gradient(135deg, #b6ff00 0%, #2df5a3 100%)"
                  : "rgba(7,11,20,.72)",
                color: current===id ? "#05080d" : T.textDim,
                border:`1px solid ${current===id ? "rgba(182,255,0,.92)" : T.line}`,
                borderRadius:14,
                padding:"12px 14px",
                cursor:"pointer",
                fontWeight:900,
                WebkitTapHighlightColor:"rgba(182,255,0,.18)",
                transition:"background .12s ease, border-color .12s ease, color .12s ease, box-shadow .12s ease, transform .1s ease",
                boxShadow: current===id ? "0 0 0 1px rgba(182,255,0,.28), 0 0 18px rgba(182,255,0,.18)" : "none"
              }}>
              <span aria-hidden="true">{icon}</span><span>{label}</span>
            </button>
          );
        })}
      </nav>
      {onClearRole && (
        <button className="cp04-menu-button cp04-sidebar-logout-btn" type="button" onClick={onClearRole}
          style={{ width:"100%", marginTop:14, marginBottom:10, justifyContent:"center", borderColor:"rgba(182,255,0,.32)" }}>
          🚪 {tx("nav.cerrar_sesion")}
        </button>
      )}
      <div style={{ marginTop:18 }}><LanguageSelector /></div>
      <Card style={{ marginTop:14, padding:16 }}>
        <strong style={{ color:T.accent }}>{tx("common.modo_seguro")}</strong>
        <p style={{ color:T.textDim, fontSize:".84rem", lineHeight:1.5, marginBottom:0 }}>{tx("common.entorno")}.</p>
      </Card>
    </aside>
  );
}

function Inicio({ navigate, selectedRole }) {
  const clk = useClock();
  const lang = useLang();
  const tx = key => t(key, lang);
  const kpi = DEMO_KPI;
  const makeOk = MAKE_FLUJOS_COUNTERS.conectados >= MAKE_FLUJOS_COUNTERS.total * 0.5;
  const makeStatus = kpi.makeErrores > 3 ? "error" : kpi.makeErrores > 0 ? "warn" : "ok";
  const diasCortos = tx("home.dias_semana").split(",");
  const diasLargo = tx("home.dias_largo").split(",");
  const canAccess = (section) => cp04CanAccessSection(selectedRole, section);

  return (
    <div style={{ padding: "clamp(24px,4vw,48px) 24px clamp(60px,10vw,96px)", maxWidth: 1220, margin: "0 auto" }}>

      {/* HERO */}
      <section style={{ display: "grid", alignItems: "center", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(20px,4vw,48px)", marginBottom: "clamp(28px,4vw,48px)" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: T.accent, fontWeight: 900, letterSpacing: ".18em", fontSize: ".78rem", textTransform: "uppercase", marginBottom: 16, padding: "7px 12px", border: `1px solid rgba(182,255,0,.22)`, borderRadius: 999, background: "rgba(182,255,0,.07)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}` }} />
            Club Pádel 04
          </div>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: "clamp(2.8rem,7vw,5.6rem)", lineHeight: .88, margin: "0 0 18px", letterSpacing: "-.07em" }}>
            {tx("home.club_operativo")}<br /><span style={{ color: T.accent }}>{tx("home.hero_accent")}</span>
          </h1>
          <p style={{ color: T.textDim, fontSize: "clamp(.95rem,1.8vw,1.1rem)", lineHeight: 1.75, maxWidth: 640, margin: "0 0 24px" }}>
            {tx("home.hero_subtitle")}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn onClick={() => navigate("reservas")}>🎾 {tx("home.reservar")}</Btn>
            <Btn variant="secondary" onClick={() => navigate("torneos")}>🏆 {tx("home.btn_torneos")}</Btn>
            {canAccess("admin") && <Btn variant="secondary" onClick={() => navigate("admin")}>📊 {tx("home.btn_admin")}</Btn>}
          </div>
        </div>

        {/* CENTRO RÁPIDO DEL CLUB */}
        <div style={{ borderRadius: 28, border: `1px solid rgba(182,255,0,.22)`, background: `linear-gradient(160deg,rgba(11,17,29,.97),rgba(47,107,255,.1)), radial-gradient(circle at 80% 0%, rgba(182,255,0,.18), transparent 40%)`, padding: "clamp(18px,3vw,28px)", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Reloj */}
          <div style={{ textAlign: "center", borderBottom: `1px solid rgba(255,255,255,.08)`, paddingBottom: 14 }}>
            <div style={{ fontFamily: "monospace", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: T.accent, lineHeight: 1, letterSpacing: ".06em" }}>{clk.time}</div>
            <div style={{ color: T.textDim, fontSize: ".85rem", marginTop: 5 }}>{clk.day}, {clk.date}</div>
          </div>

          {/* Acciones rápidas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Btn onClick={() => navigate("reservas")} style={{ padding: "10px 12px", fontSize: ".82rem" }}>🎾 {tx("home.reservar")}</Btn>
            <Btn variant="secondary" onClick={() => navigate("torneos")} style={{ padding: "10px 12px", fontSize: ".82rem" }}>🏆 {tx("home.torneo")}</Btn>
            {canAccess("flujos_make") && <Btn variant="secondary" onClick={() => navigate("flujos_make")} style={{ padding: "10px 12px", fontSize: ".82rem" }}>⚙️ {tx("home.procesos")}</Btn>}
            {canAccess("alta_jugador") && <Btn variant="secondary" onClick={() => navigate("alta_jugador")} style={{ padding: "10px 12px", fontSize: ".82rem" }}>👤 {tx("home.alta")}</Btn>}
          </div>

          {/* Estado operativo */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid rgba(255,255,255,.07)`, paddingTop: 12 }}>
            <span style={{ color: T.textDim, fontSize: ".78rem" }}>{tx("home.estado_operativo")}</span>
            <FlowStatusBadge status={makeStatus} />
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 24 }}>
        <MetricCard label={tx("home.reservas_hoy")} value={kpi.reservasHoy} sub={`vs 10 ${tx("home.vs_ayer")}`} trend={20} icon="🎾" />
        <MetricCard label={tx("home.ocupacion_media")} value={kpi.ocupacionMedia+"%"} sub={tx("home.pistas_activas")} trend={4} color={T.accent2} icon="🏟" />
        <MetricCard label={tx("home.socios_activos")} value={kpi.jugadoresActivos} sub={`+${kpi.nuevosJugadores} ${tx("home.este_mes")}`} trend={6} color="#a78bfa" icon="👤" />
        <MetricCard label={tx("home.procesos_activos")} value={`${MAKE_FLUJOS_COUNTERS.conectados}/${MAKE_FLUJOS_COUNTERS.total}`} sub={`${MAKE_FLUJOS_COUNTERS.operativos} ${tx("home.operativo_probado")}`} trend={null} color={makeOk ? T.accent : T.warning} icon="⚡" />
        <MetricCard label={tx("home.ingresos_mes")} value={`${kpi.ingresosMes}€`} sub={tx("home.estimacion_mensual")} trend={12} color={T.metricPositive} icon="💶" />
        <MetricCard label={tx("home.torneos_activos")} value={kpi.torneosActivos} sub={tx("home.en_curso")} trend={null} color={T.warning} icon="🏆" />
      </div>

      {/* GRÁFICAS HOME */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 14, marginBottom: 24 }}>
        <ChartCard title={tx("home.reservas_hora")} sub={tx("home.franja_horaria")}>
          <MiniBarChart data={DEMO_RESERVAS_HOY} height={70} color={T.accent} unit={tx("home.reservas_hoy").toLowerCase()} />
        </ChartCard>
        <ChartCard title={tx("home.reservas_7dias")} sub={tx("home.tendencia_semanal")}>
          <MiniLineChart data={DEMO_RESERVAS_SEMANA} height={70} color={T.accent2} labels={diasLargo} unit="" />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            {diasCortos.map((d,i) => (
              <span key={i} style={{ color:T.textDim, fontSize:".65rem" }}>{d}</span>
            ))}
          </div>
        </ChartCard>
        <ChartCard title={tx("home.ocupacion_pista")} sub={tx("home.porcentaje_uso")}>
          <HorizontalBarChart data={DEMO_OCUPACION_PISTAS} unit="%" />
        </ChartCard>
        <ChartCard title={tx("home.estado_procesos")} sub={`${MAKE_FLUJOS_COUNTERS.total} ${tx("home.flujos_totales")}`}>
          <DonutChart size={100} label="Sistema" segments={[
            { l: tx("home.activos"),      v: MAKE_FLUJOS_COUNTERS.conectados, c: T.accent },
            { l: tx("home.pausados"),     v: MAKE_FLUJOS_COUNTERS.total - MAKE_FLUJOS_COUNTERS.conectados, c: T.warning },
          ]} />
        </ChartCard>
      </div>

      {/* ALERTAS / AVISOS */}
      {(kpi.makeErrores > 0 || kpi.incidenciasAbiertas > 0) && (
        <div style={{ borderRadius: 16, border: `1px solid ${T.warning}55`, background: `rgba(255,173,71,.07)`, padding: "12px 16px", marginBottom: 22, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: T.warning }}>{tx("home.avisos_activos")}</strong>
            <div style={{ color: T.textDim, fontSize: ".82rem", marginTop: 3 }}>
              {kpi.makeErrores > 0 && <span>{kpi.makeErrores} {kpi.makeErrores!==1?tx("home.incidencias_s"):tx("home.incidencia")} · </span>}
              {kpi.incidenciasAbiertas > 0 && <span>{kpi.incidenciasAbiertas} {tx("home.incidencias_s")}</span>}
            </div>
          </div>
          {canAccess("flujos_make") && <Btn variant="secondary" onClick={() => navigate("flujos_make")} style={{ padding: "7px 14px", fontSize: ".8rem" }}>{tx("home.ver_procesos")}</Btn>}
        </div>
      )}

      {/* GALERÍA */}
      <Gallery />
    </div>
  );
}

// Club Pádel 04 · Puerta de login inline para crear/cancelar/reprogramar.
//
// Con el gate de rol del Worker activo (CP04_ENFORCE_ROLE_GATES), las 3
// acciones mutables de /api/reservas exigen un Bearer real verificado por
// Supabase: ya no basta con un rol demo local. En vez de enviar la petición
// igualmente (y recibir un 401 opaco) o simular un éxito falso, los 3
// formularios bloquean el envío ANTES de llamar al Worker y muestran este
// login inline. Se queda dentro del mismo componente (nunca navega ni
// desmonta el formulario): los datos no sensibles que el usuario ya
// escribió (fecha, pista, hora, clave de reserva...) permanecen intactos en
// el estado de React sin necesidad de guardarlos en ningún sitio. Email y
// contraseña de este mini-login viven solo en estado local del componente,
// nunca en localStorage/sessionStorage/URL — authService ya se encarga de
// persistir únicamente el access_token tras un login correcto.
function ReservaAuthGate({ message }) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (sending) return;
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Introduce tu email y contraseña.");
      return;
    }
    setSending(true);
    setError("");
    const result = await auth.login(cleanEmail, password);
    setSending(false);
    if (!result.ok) {
      setError(result.message || "No se pudo iniciar sesión.");
      return;
    }
    // Éxito: auth.isAuthenticated pasa a true, el formulario que envuelve
    // este gate deja de mostrarlo (ver condición `!auth.isAuthenticated` en
    // cada llamador) y conserva sus datos, listo para reintentar el envío.
    setPassword("");
  }

  return (
    <Card style={{ marginBottom: 20, borderColor: `${T.warning}66` }}>
      <strong style={{ color: T.warning }}>Inicia sesión para continuar</strong>
      <p style={{ color: T.textDim, marginTop: 6, marginBottom: 16, lineHeight: 1.55 }}>{message}</p>
      <form onSubmit={submit}>
        <input
          type="email"
          aria-label="Email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          disabled={sending}
        />
        <div style={{ marginTop: 10 }}>
          <input
            type={showPassword ? "text" : "password"}
            aria-label="Contraseña"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={sending}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          style={{ border: "none", background: "transparent", color: T.accent, fontSize: ".82rem", fontWeight: 800, cursor: "pointer", padding: 0, marginTop: 8, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          {showPassword ? "Ocultar contraseña" : "Ver contraseña"}
        </button>
        {error && <FieldError>{error}</FieldError>}
        <Btn type="submit" disabled={sending} style={{ marginTop: 14 }}>
          {sending ? "Entrando..." : "Iniciar sesión"}
        </Btn>
      </form>
    </Card>
  );
}

function Reservas() {
  const lang = useLang();
  const tx = key => t(key, lang);
  const auth = useAuth();
  // No hace falta sincronizar needsLogin a false con un efecto cuando
  // auth.isAuthenticated pasa a true: el gate solo se pinta si
  // `needsLogin && !auth.isAuthenticated` (ver el render más abajo), así
  // que en cuanto hay sesión real deja de mostrarse sin más estado.
  const [needsLogin, setNeedsLogin] = useState(false);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("pending");
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [court, setCourt] = useState("Pista 1");
  // ocupadas: claves "fecha|pista|hora" recibidas del backend vía CalendarioDisponibilidad.
  // Es la misma fuente de verdad que usa el calendario → elimina la divergencia
  // que permitía seleccionar en el formulario slots marcados como "No disponible".
  const [ocupadas, setOcupadas] = useState([]);
  const ocupadasSet = useMemo(() => new Set(ocupadas), [ocupadas]);
  const [form, setForm] = useState({ nombre: "", apellidos: "", email: "", telefono: "", fecha: "", hora: "10:00", duracion_minutos: "90", modalidad: "libre", nivel: "intermedio", comentarios: "" });
  const sendingRef = useRef(false);
  const duration = Number(form.duracion_minutos);
  const horaFin = calcTimeEnd(form.hora, duration);
  const price = priceFor(court, duration);
  const payload = useMemo(() => prepareBookingPayload(form, court), [form, court]);
  const sending = status === "sending";
  const statusMap = {
    pending: [tx("status.reserva.pendiente"), tx("status.reserva.pendiente_txt"), T.warning],
    sending: [tx("status.reserva.enviando"), tx("status.reserva.enviando_txt"), T.warning],
    success: [tx("status.reserva.exito"), tx("status.reserva.exito_txt"), T.accent],
    error: [tx("status.reserva.error"), statusMessage || tx("status.reserva.error_txt"), T.danger],
  };
  const [statusTitle, statusText, statusColor] = statusMap[status];

  function updateForm(field, value) {
    setForm((current) => {
      const updated = { ...current, [field]: value };
      if (field === "hora") {
        const valid = getAvailableDurationsForHour(value);
        if (!valid.includes(Number(current.duracion_minutos))) {
          updated.duracion_minutos = String(valid[0] ?? 60);
        }
      }
      return updated;
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatusMessage("");
    if (status !== "sending") setStatus("pending");
  }

  function review() {
    // Comprueba ocupación antes de validateBooking: getSlotStatus no tiene acceso
    // al inventario del backend, así que este check usa ocupadasSet (misma fuente
    // que el calendario).
    if (ocupadasSet.has(`${form.fecha}|${court}|${form.hora}`)) {
      setErrors({ hora: tx("errors.horario_ocupado") });
      setStatus("error");
      return;
    }
    const nextErrors = validateBooking(form, court, tx);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }
    setStatus("pending");
    setStep(2);
  }

  async function send() {
    if (sending || sendingRef.current) return;
    const nextErrors = validateBooking(form, court, tx);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage(tx("errors.datos_incompletos"));
      setStatus("error");
      setStep(1);
      return;
    }

    // Con el gate de rol del Worker activo, crear_reserva exige un Bearer
    // real: sin sesión, ni se consulta disponibilidad ni se llama al
    // endpoint — se muestra el login inline (ReservaAuthGate) en vez de
    // mandar una petición anónima que solo recibiría un 401. El formulario
    // (paso 2, con todos los datos ya introducidos) permanece tal cual.
    if (cp04ShouldBlockAnonymousReservaSubmit(auth)) {
      setNeedsLogin(true);
      setStatusMessage("Inicia sesión para confirmar tu reserva. Tus datos no se pierden.");
      setStatus("error");
      return;
    }

    sendingRef.current = true;
    setStatus("sending");
    setStatusMessage("");
    try {
      const slotKey = `${form.fecha}|${court}|${form.hora}`;
      const disponibilidad = await fetchDisponibilidad(form.fecha);
      if ((disponibilidad.ocupadas || []).includes(slotKey)) {
        setStatusMessage(tx("errors.horario_ocupado"));
        setStatus("error");
        setStep(1);
        return;
      }

      const res = await authFetch(CONFIG.bookingEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Sesión inválida/caducada en el backend: se limpia la sesión local
      // (deja de mandar un Bearer que el Worker ya rechaza) y se vuelve a
      // pedir login, sin tocar los datos del formulario ya escritos.
      if (cp04IsSessionExpiredReservaResponse(res)) {
        await auth.logout({ scope: "local" });
        setNeedsLogin(true);
        setStatusMessage("Tu sesión ha caducado. Inicia sesión de nuevo para confirmar la reserva.");
        setStatus("error");
        return;
      }

      const data = await readSafeResponse(res);
      if (!res.ok || data?.ok === false) throw cp04BuildReservationError(data, "booking_request_failed");

      refreshDisponibilidadAfterChange(form.fecha);
      setStatus("success");
      setStep(3);
    } catch (err) {
      setStatusMessage(cp04ReservationErrorMessage(err, tx("errors.reserva_error")));
      setStatus("error");
    } finally {
      sendingRef.current = false;
    }
  }

  function newBooking() {
    setStep(1);
    setStatus("pending");
    setStatusMessage("");
    setErrors({});
  }

  // Cuando la fecha o la pista cambia, el calendario refetch y actualiza
  // ocupadasSet. Si la hora seleccionada queda ocupada en el nuevo contexto,
  // se restablece automáticamente a la primera franja libre.
  useEffect(() => {
    setForm((prev) => {
      const key = `${prev.fecha}|${court}|${prev.hora}`;
      if (!ocupadasSet.has(key)) return prev;
      const fallback = BOOKING_HOURS.find(
        (h) =>
          !ocupadasSet.has(`${prev.fecha}|${court}|${h}`) &&
          getAvailableDurationsForHour(h).length > 0
      ) ?? BOOKING_HOURS[0];
      const validDurations = getAvailableDurationsForHour(fallback);
      return {
        ...prev,
        hora: fallback,
        duracion_minutos: validDurations.includes(Number(prev.duracion_minutos))
          ? prev.duracion_minutos
          : String(validDurations[0] ?? 60),
      };
    });
  }, [form.fecha, court, ocupadasSet]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div style={{ padding: "42px 24px", maxWidth: 1040, margin: "0 auto" }}><SectionTitle eyebrow={tx("reservas.eyebrow")} title={tx("reservas.title")} desc={tx("reservas.desc")} /><CalendarioDisponibilidad
  initialDate={form.fecha || todayISO()}
  selectedCourt={court}
  duration={duration}
  onDisponibilidadChange={(data) => setOcupadas(data.ocupadas)}
  onSelectSlot={({ fecha, pista, hora }) => {
    updateForm("fecha", fecha);
    updateForm("hora", hora);
    updateForm("pista", pista);
    setCourt(pista);
    setStep(1);
  }}
/><Card style={{ marginBottom: 20, borderColor: statusColor, color: statusColor }}><strong>{statusTitle}</strong><div style={{ color: T.textDim, marginTop: 6 }}>{statusText}</div></Card>{needsLogin && cp04ShouldBlockAnonymousReservaSubmit(auth) && <ReservaAuthGate message="Necesitas iniciar sesión con tu cuenta para confirmar esta reserva. El resumen que has revisado se mantiene." />}{step===1&&<div className="cp04-grid-2"><Card><h3>{tx("reservas.datos_jugador")}</h3><input aria-label={tx("reservas.nombre")} placeholder={tx("reservas.nombre")} value={form.nombre} onChange={e=>updateForm("nombre",e.target.value)} autoComplete="given-name" /><FieldError>{errors.nombre}</FieldError><br /><input aria-label={tx("reservas.apellidos")} placeholder={tx("reservas.apellidos")} value={form.apellidos} onChange={e=>updateForm("apellidos",e.target.value)} autoComplete="family-name" /><FieldError>{errors.apellidos}</FieldError><br /><input aria-label="Email" placeholder="Email" type="email" value={form.email} onChange={e=>updateForm("email",e.target.value)} autoComplete="email" /><FieldError>{errors.email}</FieldError><br /><input aria-label="Teléfono" placeholder="Teléfono" value={form.telefono} onChange={e=>updateForm("telefono",e.target.value)} autoComplete="tel" /><FieldError>{errors.telefono}</FieldError><br /><select aria-label={tx("reservas.modalidad")} value={form.modalidad} onChange={e=>updateForm("modalidad",e.target.value)}>{BOOKING_MODALITIES.map(m=><option key={m} value={m}>{m}</option>)}</select><FieldError>{errors.modalidad}</FieldError><br /><select aria-label={tx("reservas.nivel_form")} value={form.nivel} onChange={e=>updateForm("nivel",e.target.value)}>{BOOKING_LEVELS.map(n=><option key={n} value={n}>{n}</option>)}</select><FieldError>{errors.nivel}</FieldError><br /><textarea aria-label={tx("reservas.comentarios")} placeholder={tx("reservas.comentarios")} value={form.comentarios} onChange={e=>updateForm("comentarios",e.target.value)} /></Card><Card><h3>{tx("reservas.fecha_pista")}</h3><input aria-label={tx("reservas.fecha")} type="date" min={todayISO()} value={form.fecha} onChange={e=>updateForm("fecha",e.target.value)} /><FieldError>{errors.fecha}</FieldError><br /><select aria-label={tx("reservas.hora")} value={form.hora} onChange={e=>updateForm("hora",e.target.value)} disabled={isSundayISO(form.fecha)}>{BOOKING_HOURS.map(h=><option key={h} value={h} disabled={getSlotStatus(form.fecha,h,getAvailableDurationsForHour(h)[0]??duration)!=="available"||ocupadasSet.has(`${form.fecha}|${court}|${h}`)}>{h}</option>)}</select><FieldError>{errors.hora}</FieldError><br /><select aria-label={tx("reservas.duracion")} value={form.duracion_minutos} onChange={e=>updateForm("duracion_minutos",e.target.value)}>{getAvailableDurationsForHour(form.hora).map(mins=><option key={mins} value={mins}>{mins} {tx("reservas.minutos")}</option>)}</select><FieldError>{errors.duracion_minutos}</FieldError><br /><div className="cp04-grid-2">{COURTS.map(c=><Btn key={c.id} variant={court===c.name?"primary":"secondary"} disabled={sending} onClick={()=>setCourt(c.name)} className={c.id===1?"cp04-fix-white-action-btn cp04-fix-pista-1-btn":undefined}>{c.name}</Btn>)}</div><FieldError>{errors.pista}</FieldError><Card style={{ background:T.bg, marginTop:16 }}>{tx("reservas.hora_fin")}: <strong style={{ color:T.accent }}>{horaFin}</strong> · {tx("reservas.total")}: <strong style={{ color:T.accent }}>{price}€</strong></Card><Btn disabled={sending||getSlotStatus(form.fecha,form.hora,duration)!=="available"||ocupadasSet.has(`${form.fecha}|${court}|${form.hora}`)} onClick={review} style={{ width:"100%", marginTop:16 }}>{tx("reservas.ver_resumen")}</Btn></Card></div>}{step===2&&<Card style={{ maxWidth:620, margin:"0 auto" }}><h3>{tx("reservas.resumen")}</h3><p style={{ color:T.textDim }}>{payload.jugador.nombre} {payload.jugador.apellidos} · {payload.jugador.email} · {payload.jugador.telefono}</p><p>{formatDateEs(payload.reserva.fecha)} · {payload.reserva.hora}-{payload.reserva.hora_fin} · {payload.reserva.pista} · {payload.reserva.duracion_minutos} min</p><p style={{ color:T.textDim }}>{tx("reservas.modalidad")}: {payload.reserva.modalidad} · {tx("reservas.nivel_form")}: {payload.reserva.nivel}</p><h2 style={{ color:T.accent }}>{payload.reserva.precio_total}€</h2><div style={{ display:"flex", gap:12, flexWrap:"wrap" }}><Btn variant="secondary" disabled={sending} onClick={()=>setStep(1)}>{tx("reservas.editar")}</Btn><Btn disabled={sending} onClick={send}>{sending?tx("reservas.enviando"):tx("reservas.confirmar_btn")}</Btn></div></Card>}{step===3&&<Card style={{ maxWidth:560, margin:"0 auto", textAlign:"center" }}><h3>{tx("reservas.registrada")}</h3><p style={{ color:T.textDim }}>{tx("reservas.confirmacion_desc")}</p><Btn onClick={newBooking}>{tx("reservas.nueva_btn")}</Btn></Card>}</div>;
}

function CancelarReserva({ setCurrent }) {
  const lang = useLang();
  const tx = key => t(key, lang);
  const auth = useAuth();
  const [needsLogin, setNeedsLogin] = useState(false);
  const [clave, setClave] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const sendingRef = useRef(false);
  const sending = status === "sending";
  const success = status === "success";

  const statusMap = {
    idle: [tx("status.cancelar.idle"), tx("status.cancelar.idle_txt"), T.warning],
    sending: [tx("status.cancelar.enviando"), tx("status.cancelar.enviando_txt"), T.warning],
    success: [tx("status.cancelar.exito"), tx("status.cancelar.exito_txt"), T.accent],
    error: [tx("status.cancelar.error"), error || tx("status.cancelar.error_txt"), T.danger],
  };
  const [statusTitle, statusText, statusColor] = statusMap[status];

  function updateClave(value) {
    setClave(value);
    setError("");
    if (status !== "sending") setStatus("idle");
  }

  function updateConfirmado(value) {
    setConfirmado(value);
    setError("");
    if (status !== "sending") setStatus("idle");
  }

  async function submit(event) {
    event.preventDefault();
    if (sending || sendingRef.current) return;

    const claveLimpia = clave.trim();
    if (!claveLimpia) {
      setError(tx("errors.clave"));
      setStatus("error");
      return;
    }
    if (!confirmado) {
      setError(tx("errors.confirmado_cancelar"));
      setStatus("error");
      return;
    }

    // Cancelar es operación mutable de /api/reservas: con el gate de rol
    // del Worker activo exige un Bearer real. Sin sesión, no se llama al
    // endpoint (que solo devolvería 401) — se muestra el login inline; la
    // clave de reserva y la confirmación ya escritas se mantienen.
    if (cp04ShouldBlockAnonymousReservaSubmit(auth)) {
      setNeedsLogin(true);
      setError("Inicia sesión para cancelar esta reserva.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError("");
    sendingRef.current = true;

    try {
      // Adjunta el token real de la sesión backend (Supabase) verificada
      // por el Worker (CP04_ENFORCE_ROLE_GATES).
      const res = await authFetch(CONFIG.bookingEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "cancelar_reserva",
          clave_reserva: claveLimpia,
          jugador: {
            nombre: "",
            email: "",
            telefono: "",
          },
          club: "Club Pádel 04",
          origen: "app_publica_cancelar_reserva",
        }),
      });

      // Sesión inválida/caducada en el backend: se limpia la sesión local y
      // se vuelve a pedir login, sin perder la clave de reserva escrita.
      if (cp04IsSessionExpiredReservaResponse(res)) {
        await auth.logout({ scope: "local" });
        setNeedsLogin(true);
        setError("Tu sesión ha caducado. Inicia sesión de nuevo para cancelar la reserva.");
        setStatus("error");
        return;
      }

      const data = await readSafeResponse(res);

      if (!res.ok || data?.ok === false) {
        throw cp04BuildReservationError(data, "cancel_request_failed");
      }

      setClave("");
      setConfirmado(false);
      setStatus("success");
      refreshDisponibilidadAfterChange();
    } catch (err) {
      setError(cp04ReservationErrorMessage(err, tx("errors.cancelar_error")));
      setStatus("error");
    } finally {
      sendingRef.current = false;
    }
  }

  return <div style={{ padding:"42px 24px", maxWidth:940, margin:"0 auto" }}><SectionTitle eyebrow={tx("cancelar.eyebrow")} title={tx("cancelar.title")} desc={tx("cancelar.desc")} />{needsLogin && cp04ShouldBlockAnonymousReservaSubmit(auth) && <ReservaAuthGate message="Necesitas iniciar sesión con tu cuenta para cancelar esta reserva. La clave que has introducido se mantiene." />}<Card style={{ marginBottom:20, borderColor:statusColor, color:statusColor }}><strong>{statusTitle}</strong><div style={{ color:T.textDim, marginTop:6 }}>{statusText}</div></Card><form onSubmit={submit}><div className="cp04-grid-2"><Card><h3 style={{ marginTop:0 }}>{tx("cancelar.title")}</h3><label style={{ display:"block", color:T.textDim, fontWeight:900, marginBottom:8 }} htmlFor="clave-reserva">{tx("cancelar.clave")}</label><input id="clave-reserva" aria-label={tx("cancelar.clave")} placeholder={tx("cancelar.clave_ph")} value={clave} onChange={e => updateClave(e.target.value)} autoComplete="off" disabled={sending} required /><FieldError>{status==="error"&&!clave.trim()?tx("cancelar.clave"):undefined}</FieldError><label style={{ display:"flex", alignItems:"flex-start", gap:12, marginTop:18, color:T.textDim, lineHeight:1.55, cursor:sending?"not-allowed":"pointer" }}><input type="checkbox" checked={confirmado} onChange={e => updateConfirmado(e.target.checked)} disabled={sending} style={{ width:"auto", minHeight:"auto", marginTop:4, accentColor:T.accent, cursor:sending?"not-allowed":"pointer" }} /><span>{tx("cancelar.confirmo_check")}</span></label>{status==="error"&&error&&<FieldError>{error}</FieldError>}<div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:24 }}><Btn type="submit" variant="danger" disabled={sending}>{sending?tx("cancelar.enviando"):tx("cancelar.btn")}</Btn>{success&&<Btn variant="secondary" onClick={()=>setCurrent("reservas")}>{tx("cancelar.volver_reservas")}</Btn>}</div></Card><Card><h3 style={{ marginTop:0 }}>{tx("cancelar.que_ocurre")}</h3><PanelList items={[tx("cancelar.info1"), tx("cancelar.info2"), tx("cancelar.info3")]} />{!success&&<div style={{ marginTop:24 }}><Btn variant="secondary" onClick={()=>setCurrent("reservas")}>{tx("cancelar.volver_reservas")}</Btn></div>}</Card></div></form></div>;
}


function ReprogramarReserva({ setCurrent }) {
  const lang = useLang();
  const tx = key => t(key, lang);
  const auth = useAuth();
  const [needsLogin, setNeedsLogin] = useState(false);
  const [court, setCourt] = useState("Pista 1");
  const [form, setForm] = useState({
    clave_reserva: "",
    nueva_fecha_reserva: todayISO(),
    nueva_hora_inicio: "10:00",
    duracion_minutos: "90",
    confirmado: false,
  });
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState({});
  const sendingRef = useRef(false);
  const sending = status === "sending";
  const success = status === "success";
  const duration = Number(form.duracion_minutos);
  const nuevaHoraFin = calcTimeEnd(form.nueva_hora_inicio, duration);
  const payload = useMemo(
    () => prepareReschedulePayload(form, court),
    [form, court],
  );

  const statusMap = {
    idle: [tx("status.reprog.idle"), tx("status.reprog.idle_txt"), T.warning],
    sending: [tx("status.reprog.enviando"), tx("status.reprog.enviando_txt"), T.warning],
    success: [tx("status.reprog.exito"), statusMessage || tx("status.reprog.exito_txt"), T.accent],
    error: [tx("status.reprog.error"), statusMessage || tx("status.reprog.error_txt"), T.danger],
  };
  const [statusTitle, statusText, statusColor] = statusMap[status];

  function updateForm(field, value) {
    setForm((current) => {
      const updated = { ...current, [field]: value };
      if (field === "nueva_hora_inicio") {
        const valid = getAvailableDurationsForHour(value);
        if (!valid.includes(Number(current.duracion_minutos))) {
          updated.duracion_minutos = String(valid[0] ?? 60);
        }
      }
      return updated;
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatusMessage("");
    if (status !== "sending") setStatus("idle");
  }

  function chooseCourt(value) {
    setCourt(value);
    setErrors((current) => ({ ...current, nueva_pista: undefined }));
    setStatusMessage("");
    if (status !== "sending") setStatus("idle");
  }

  async function submit(event) {
    event.preventDefault();
    if (sending || sendingRef.current) return;

    const nextErrors = validateReschedule(form, court, tx);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage(tx("errors.reprog_campos"));
      setStatus("error");
      return;
    }

    // Reprogramar es operación mutable de /api/reservas: con el gate de rol
    // del Worker activo exige un Bearer real. Sin sesión, no se consulta
    // disponibilidad ni se llama al endpoint (que solo devolvería 401) — se
    // muestra el login inline; los datos de fecha/hora/pista ya elegidos se
    // mantienen.
    if (cp04ShouldBlockAnonymousReservaSubmit(auth)) {
      setNeedsLogin(true);
      setStatusMessage("Inicia sesión para reprogramar esta reserva.");
      setStatus("error");
      return;
    }

    sendingRef.current = true;
    setStatus("sending");
    setStatusMessage("");

    try {
      const slotKey = `${form.nueva_fecha_reserva}|${court}|${form.nueva_hora_inicio}`;
      const disponibilidad = await fetchDisponibilidad(form.nueva_fecha_reserva);

      if ((disponibilidad.ocupadas || []).includes(slotKey)) {
        setStatusMessage(tx("errors.reprog_ocupado"));
        setStatus("error");
        return;
      }

      // Reprogramar, igual que cancelar, adjunta el token real de la sesión
      // backend (Supabase) verificada por el Worker.
      const res = await authFetch(CONFIG.bookingEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Sesión inválida/caducada en el backend: se limpia la sesión local y
      // se vuelve a pedir login, sin perder los datos ya elegidos.
      if (cp04IsSessionExpiredReservaResponse(res)) {
        await auth.logout({ scope: "local" });
        setNeedsLogin(true);
        setStatusMessage("Tu sesión ha caducado. Inicia sesión de nuevo para reprogramar la reserva.");
        setStatus("error");
        return;
      }

      const data = await readSafeResponse(res);

      if (!res.ok || data?.ok === false) {
        throw cp04BuildReservationError(data, "reschedule_request_failed");
      }

      let destinationConfirmed = false;

      for (let attempt = 0; attempt < 15; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        const updatedAvailability = await fetchDisponibilidad(
          form.nueva_fecha_reserva,
        );

        if ((updatedAvailability.ocupadas || []).includes(slotKey)) {
          destinationConfirmed = true;
          break;
        }
      }

      if (!destinationConfirmed) {
        throw new Error("reschedule_not_confirmed");
      }

      setStatusMessage(
        `Nueva fecha ${form.nueva_fecha_reserva} · ${form.nueva_hora_inicio}-${nuevaHoraFin} · ${court}.`,
      );
      setStatus("success");
      refreshDisponibilidadAfterChange(form.nueva_fecha_reserva);
      setForm((current) => ({ ...current, confirmado: false }));
    } catch (err) {
      setStatusMessage(cp04ReservationErrorMessage(err, tx("errors.reprog_error")));
      setStatus("error");
    } finally {
      sendingRef.current = false;
    }
  }

  function resetForm() {
    setForm({
      clave_reserva: "",
      nueva_fecha_reserva: todayISO(),
      nueva_hora_inicio: "10:00",
      duracion_minutos: "90",
      confirmado: false,
    });
    setCourt("Pista 1");
    setErrors({});
    setStatusMessage("");
    setStatus("idle");
  }

  return (
    <div style={{ padding: "42px 24px", maxWidth: 1040, margin: "0 auto" }}>
      <SectionTitle eyebrow={tx("reprog.eyebrow")} title={tx("reprog.title")} desc={tx("reprog.desc")} />

      {needsLogin && cp04ShouldBlockAnonymousReservaSubmit(auth) && (
        <ReservaAuthGate message="Necesitas iniciar sesión con tu cuenta para reprogramar esta reserva. La fecha, hora y pista ya elegidas se mantienen." />
      )}

      <Card
        style={{
          marginBottom: 20,
          borderColor: statusColor,
          color: statusColor,
        }}
      >
        <strong>{statusTitle}</strong>
        <div style={{ color: T.textDim, marginTop: 6 }}>{statusText}</div>
      </Card>

      <CalendarioDisponibilidad
        initialDate={form.nueva_fecha_reserva}
        selectedCourt={court}
        duration={duration}
        title={tx("reprog.nueva_disponibilidad")}
        description={tx("reprog.selecciona_franja")}
        onSelectSlot={({ fecha, pista, hora }) => {
          updateForm("nueva_fecha_reserva", fecha);
          updateForm("nueva_hora_inicio", hora);
          chooseCourt(pista);
        }}
      />

      <form onSubmit={submit}>
        <div className="cp04-grid-2">
          <Card>
            <h3 style={{ marginTop: 0 }}>{tx("reprog.clave")}</h3>

            <label htmlFor="reprogramar-clave" style={{ display:"block", color:T.textDim, fontWeight:900, marginBottom:8 }}>
              {tx("reprog.clave")}
            </label>
            <input
              id="reprogramar-clave"
              aria-label={tx("reprog.clave")}
              placeholder={tx("reprog.clave")}
              value={form.clave_reserva}
              onChange={(event) => updateForm("clave_reserva", event.target.value)}
              autoComplete="off"
              disabled={sending}
              required
            />
            <FieldError>{errors.clave_reserva}</FieldError>

            <div style={{ marginTop: 22 }}>
              <PanelList
                items={[
                  tx("reprog.info1"),
                  tx("reprog.info2"),
                  tx("reprog.info3"),
                  tx("reprog.info4"),
                ]}
              />
            </div>
          </Card>

          <Card>
            <h3 style={{ marginTop: 0 }}>{tx("reprog.nueva_fecha")}</h3>

            <label htmlFor="reprogramar-fecha" style={{ display:"block", color:T.textDim, fontWeight:900, marginBottom:8 }}>
              {tx("reprog.nueva_fecha")}
            </label>
            <input
              id="reprogramar-fecha"
              aria-label={tx("reprog.nueva_fecha")}
              type="date"
              min={todayISO()}
              value={form.nueva_fecha_reserva}
              onChange={(event) => updateForm("nueva_fecha_reserva", event.target.value)}
              disabled={sending}
              required
            />
            <FieldError>{errors.nueva_fecha_reserva}</FieldError>

            <label htmlFor="reprogramar-hora" style={{ display:"block", color:T.textDim, fontWeight:900, margin:"18px 0 8px" }}>
              {tx("reprog.nueva_hora")}
            </label>
            <select
              id="reprogramar-hora"
              aria-label={tx("reprog.nueva_hora")}
              value={form.nueva_hora_inicio}
              onChange={(event) => updateForm("nueva_hora_inicio", event.target.value)}
              disabled={sending || isSundayISO(form.nueva_fecha_reserva)}
            >
              {BOOKING_HOURS.map((hora) => (
                <option
                  key={hora}
                  value={hora}
                  disabled={getSlotStatus(form.nueva_fecha_reserva, hora, duration) !== "available"}
                >
                  {hora}
                </option>
              ))}
            </select>
            <FieldError>{errors.nueva_hora_inicio}</FieldError>

            <label htmlFor="reprogramar-duracion" style={{ display:"block", color:T.textDim, fontWeight:900, margin:"18px 0 8px" }}>
              {tx("reservas.duracion")}
            </label>
            <select
              id="reprogramar-duracion"
              aria-label={tx("reservas.duracion")}
              value={form.duracion_minutos}
              onChange={(event) => updateForm("duracion_minutos", event.target.value)}
              disabled={sending}
            >
              {getAvailableDurationsForHour(form.nueva_hora_inicio).map((minutes) => (
                <option key={minutes} value={minutes}>{minutes} {tx("reservas.minutos")}</option>
              ))}
            </select>
            <FieldError>{errors.duracion_minutos}</FieldError>

            <div style={{ marginTop: 18 }}>
              <strong style={{ display:"block", marginBottom:10 }}>{tx("reprog.nueva_pista")}</strong>
              <div className="cp04-grid-2">
                {COURTS.map((item) => {
                  const isSelected = court === item.name;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={sending}
                      onClick={() => chooseCourt(item.name)}
                      className={item.id === 1 ? "cp04-fix-white-action-btn cp04-fix-pista-1-btn" : undefined}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 14,
                        fontFamily: T.fontDisplay,
                        fontWeight: 900,
                        fontSize: "1rem",
                        cursor: sending ? "not-allowed" : "pointer",
                        opacity: sending ? .55 : 1,
                        border: isSelected ? "none" : `1px solid ${T.line}`,
                        background: isSelected
                          ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})`
                          : "rgba(255,255,255,.055)",
                        color: isSelected ? "#06100a" : T.text,
                        boxShadow: isSelected ? `0 8px 24px rgba(182,255,0,.25)` : "none",
                        transition: "all .2s ease",
                        letterSpacing: "-.01em",
                      }}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
              <FieldError>{errors.nueva_pista}</FieldError>
            </div>

            <Card style={{ background:T.bg, marginTop:18 }}>
              <div style={{ color:T.textDim, marginBottom:6 }}>{tx("reprog.resumen")}</div>
              <strong style={{ color: T.accent }}>
                {formatDateEs(form.nueva_fecha_reserva)} · {form.nueva_hora_inicio}-{nuevaHoraFin} · {court}
              </strong>
            </Card>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginTop: 18,
                color: T.textDim,
                lineHeight: 1.55,
                cursor: sending ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.confirmado}
                onChange={(event) => updateForm("confirmado", event.target.checked)}
                disabled={sending}
                style={{
                  width: "auto",
                  minHeight: "auto",
                  marginTop: 4,
                  accentColor: T.accent,
                  cursor: sending ? "not-allowed" : "pointer",
                }}
              />
              <span>{tx("reprog.confirmo")}</span>
            </label>
            <FieldError>{errors.confirmado}</FieldError>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 24,
              }}
            >
              <Btn
                type="submit"
                disabled={
                  sending ||
                  getSlotStatus(form.nueva_fecha_reserva, form.nueva_hora_inicio, duration) !== "available"
                }
                className="cp04-fix-white-action-btn cp04-fix-reprogramar-reserva-btn"
              >
                {sending ? tx("reprog.enviando") : tx("reprog.btn")}
              </Btn>
              <Btn variant="secondary" disabled={sending} onClick={() => setCurrent("reservas")}>
                {tx("reprog.volver")}
              </Btn>
            </div>
          </Card>
        </div>
      </form>

      {success && (
        <Card
          style={{
            maxWidth: 680,
            margin: "24px auto 0",
            textAlign: "center",
            borderColor: `${T.accent}66`,
          }}
        >
          <h3>Reprogramación enviada correctamente</h3>
          <p style={{ color: T.textDim, lineHeight: 1.65 }}>
            Conserva tu clave de reserva. Recibirás un correo con el nuevo horario confirmado.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Btn onClick={resetForm}>Reprogramar otra reserva</Btn>
            <Btn variant="secondary" onClick={() => setCurrent("reservas")}>
              Consultar disponibilidad
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// PASO 07E (2026-07-19): motivos válidos de cierre temporal de pista,
// compartidos entre el select del formulario y la validación local — deben
// coincidir exactamente con CIERRE_MOTIVOS_VALIDOS en
// worker-reservas/src/index.js (misma lista, duplicada deliberadamente para
// no acoplar el bundle del frontend al código del Worker).
const CIERRE_PISTA_MOTIVOS = [
  ["mantenimiento", "Mantenimiento"],
  ["lluvia", "Lluvia"],
  ["evento", "Evento"],
  ["torneo", "Torneo"],
  ["limpieza", "Limpieza"],
  ["obra", "Obra"],
  ["incidencia", "Incidencia"],
  ["administrativo", "Administrativo"],
  ["otro", "Otro"],
];

// PASO 07E (2026-07-19) + PASO 07G (2026-07-19): Cierre Temporal de Pistas
// — flujo app/API preparado, mismo criterio defensivo que Baja de Jugador
// (Paso 07C): formulario -> validación local -> authFetch -> nunca
// confirma el cierre sin response.ok && data.ok !== false, y ni siquiera
// entonces se afirma "pista cerrada" (el estado enviado y mostrado es
// siempre "pendiente_confirmacion" — la confirmación real depende del
// escenario Make 5791133 procesando el cierre en Airtable, fuera de este
// flujo). Originalmente vivía como card embebido dentro de Gestion(); en
// el Paso 07G se extrajo a su propio componente de nivel superior para
// darle un acceso directo en el sidebar ("cierre_pistas") sin duplicar la
// lógica ni el formulario. Gateado en rbac.js (CP04_ROLE_PERMISSIONS) a
// STAFF/ADMIN/SUPPORT — PLAYER no lo recibe.
function CierreTemporalPista() {
  const auth = useAuth();

  const cierreInitialForm = {
    pista: "",
    fecha_inicio: "",
    hora_inicio: "",
    fecha_fin: "",
    hora_fin: "",
    motivo: "",
    observaciones: "",
    notify_players: true,
  };
  const [cierreForm, setCierreForm] = useState(cierreInitialForm);
  const [cierreErrors, setCierreErrors] = useState({});
  const [cierreSending, setCierreSending] = useState(false);
  const [cierreSuccess, setCierreSuccess] = useState(false);
  const [cierreServerError, setCierreServerError] = useState("");

  function updateCierreForm(field, value) {
    setCierreForm((previous) => ({ ...previous, [field]: value }));
    setCierreErrors((previous) => ({ ...previous, [field]: "" }));
    setCierreSuccess(false);
    setCierreServerError("");
  }

  function validateCierre() {
    const nextErrors = {};

    if (!cierreForm.pista) {
      nextErrors.pista = "Selecciona la pista a cerrar.";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cierreForm.fecha_inicio || "")) {
      nextErrors.fecha_inicio = "Selecciona la fecha de inicio.";
    }
    if (!/^\d{2}:\d{2}$/.test(cierreForm.hora_inicio || "")) {
      nextErrors.hora_inicio = "Selecciona la hora de inicio.";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cierreForm.fecha_fin || "")) {
      nextErrors.fecha_fin = "Selecciona la fecha de fin.";
    }
    if (!/^\d{2}:\d{2}$/.test(cierreForm.hora_fin || "")) {
      nextErrors.hora_fin = "Selecciona la hora de fin.";
    }
    if (
      !nextErrors.fecha_inicio &&
      !nextErrors.fecha_fin &&
      cierreForm.fecha_fin < cierreForm.fecha_inicio
    ) {
      nextErrors.fecha_fin = "La fecha de fin no puede ser anterior a la de inicio.";
    }
    if (
      !nextErrors.fecha_inicio &&
      !nextErrors.fecha_fin &&
      !nextErrors.hora_inicio &&
      !nextErrors.hora_fin &&
      cierreForm.fecha_fin === cierreForm.fecha_inicio &&
      cierreForm.hora_fin <= cierreForm.hora_inicio
    ) {
      nextErrors.hora_fin = "La hora de fin debe ser posterior a la hora de inicio.";
    }
    if (!cierreForm.motivo) {
      nextErrors.motivo = "Selecciona el motivo del cierre.";
    }

    return nextErrors;
  }

  // Nunca marca un cierre como confirmado sin respuesta real del backend.
  // Si el Worker responde 503 "Cierre temporal webhook not configured"
  // (webhook Make todavía sin configurar, ver worker-reservas/src/index.js
  // handleCierreTemporalPista), se traduce a un mensaje honesto para
  // STAFF/ADMIN en vez del texto técnico crudo. Incluso en éxito, el
  // mensaje mostrado nunca dice "pista cerrada": dice que la solicitud se
  // envió y queda pendiente de confirmación real.
  async function submitCierre(event) {
    event.preventDefault();

    const nextErrors = validateCierre();
    setCierreErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setCierreSending(true);
    setCierreServerError("");
    setCierreSuccess(false);

    try {
      const response = await authFetch("/api/pistas/cierre-temporal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pista: cierreForm.pista,
          fecha_inicio: cierreForm.fecha_inicio,
          hora_inicio: cierreForm.hora_inicio,
          fecha_fin: cierreForm.fecha_fin,
          hora_fin: cierreForm.hora_fin,
          motivo: cierreForm.motivo,
          observaciones: cierreForm.observaciones.trim(),
          creado_por: auth.user?.email || "",
          rol_origen: auth.role || "",
          notify_players: cierreForm.notify_players === true,
          origen: "APP_CLUB_PADEL_04",
          estado: "pendiente_confirmacion",
          accion: "cierre_temporal_pista",
        }),
      });

      const data = await readSafeResponse(response);

      if (!response.ok || data?.ok === false) {
        if (data?.error === "Cierre temporal webhook not configured") {
          throw new Error("El cierre temporal de pistas todavía no está configurado en el sistema. Contacta con soporte técnico.");
        }
        throw new Error(data?.message || data?.error || "No se pudo enviar la solicitud de cierre temporal.");
      }

      setCierreSuccess(true);
      setCierreForm(cierreInitialForm);
    } catch (error) {
      setCierreServerError(error?.message || "No se pudo enviar la solicitud de cierre temporal.");
    } finally {
      setCierreSending(false);
    }
  }

  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Gestión de pistas"
        title="Cierre temporal de pista"
        desc="Bloquea una pista (o todas) por mantenimiento, lluvia, evento, torneo, limpieza, obra, incidencia o causa administrativa."
      />
      <Card style={{ marginBottom: 20 }}>
        <p style={{ color: T.textDim, fontSize: ".86rem", marginTop: 0, marginBottom: 18 }}>
          Esta acción prepara el cierre, pero no se considerará confirmada hasta recibir respuesta real del sistema.
        </p>
        <form onSubmit={submitCierre}>
          <div className="cp04-grid-2">
            <div>
              <label htmlFor="cierre-pista">Pista</label>
              <select id="cierre-pista" value={cierreForm.pista} onChange={e => updateCierreForm("pista", e.target.value)}>
                <option value="">Seleccionar…</option>
                <option value="Pista 1">Pista 1</option>
                <option value="Pista 2">Pista 2</option>
                <option value="Pista 3">Pista 3</option>
                <option value="Pista 4">Pista 4</option>
                <option value="todas">Todas</option>
              </select>
              <FieldError>{cierreErrors.pista}</FieldError>
            </div>
            <div>
              <label htmlFor="cierre-motivo">Motivo</label>
              <select id="cierre-motivo" value={cierreForm.motivo} onChange={e => updateCierreForm("motivo", e.target.value)}>
                <option value="">Seleccionar…</option>
                {CIERRE_PISTA_MOTIVOS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <FieldError>{cierreErrors.motivo}</FieldError>
            </div>
            <div>
              <label htmlFor="cierre-fecha-inicio">Fecha de inicio</label>
              <input id="cierre-fecha-inicio" type="date" value={cierreForm.fecha_inicio} onChange={e => updateCierreForm("fecha_inicio", e.target.value)} />
              <FieldError>{cierreErrors.fecha_inicio}</FieldError>
            </div>
            <div>
              <label htmlFor="cierre-hora-inicio">Hora de inicio</label>
              <input id="cierre-hora-inicio" type="time" value={cierreForm.hora_inicio} onChange={e => updateCierreForm("hora_inicio", e.target.value)} />
              <FieldError>{cierreErrors.hora_inicio}</FieldError>
            </div>
            <div>
              <label htmlFor="cierre-fecha-fin">Fecha de fin</label>
              <input id="cierre-fecha-fin" type="date" value={cierreForm.fecha_fin} onChange={e => updateCierreForm("fecha_fin", e.target.value)} />
              <FieldError>{cierreErrors.fecha_fin}</FieldError>
            </div>
            <div>
              <label htmlFor="cierre-hora-fin">Hora de fin</label>
              <input id="cierre-hora-fin" type="time" value={cierreForm.hora_fin} onChange={e => updateCierreForm("hora_fin", e.target.value)} />
              <FieldError>{cierreErrors.hora_fin}</FieldError>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <label htmlFor="cierre-observaciones">Observaciones (opcional)</label>
            <textarea id="cierre-observaciones" value={cierreForm.observaciones} onChange={e => updateCierreForm("observaciones", e.target.value)} rows={3} />
          </div>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 18 }}>
            <input type="checkbox" checked={cierreForm.notify_players} onChange={e => updateCierreForm("notify_players", e.target.checked)} />
            <span>Notificar a los jugadores con reserva en ese horario, si aplica.</span>
          </label>
          {cierreServerError && <p style={{ color: T.danger, marginTop: 16 }}>{cierreServerError}</p>}
          {cierreSuccess && (
            <p style={{ color: T.accent, marginTop: 16 }}>
              Solicitud de cierre temporal enviada correctamente. No se considera confirmada hasta que el sistema lo confirme.
            </p>
          )}
          <div style={{ marginTop: 22 }}>
            {/* PASO 07H (2026-07-19): contraste reforzado a petición de QA
                visual en localhost:5175 — fondo sólido T.accent (en vez del
                degradado lima->menta por defecto de Btn) más un anillo de
                sombra oscuro, para que el texto casi-negro se lea con más
                definición. Solo afecta a este botón (style override local,
                sin tocar el componente Btn compartido ni otros formularios). */}
            <Btn
              type="submit"
              disabled={cierreSending}
              style={{
                width: "100%",
                background: T.accent,
                color: "#06100a",
                fontSize: "1rem",
                boxShadow: "0 16px 36px rgba(182,255,0,.32), 0 0 0 1px rgba(6,16,10,.45)",
              }}
            >
              {cierreSending ? "Enviando…" : "Solicitar cierre temporal de pista"}
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}

// PASO 07N (2026-07-20): módulo visual "Lista de espera" — preparado para
// integrarse con el escenario Make "📋 Gestión Lista de Espera" (ID
// 5791113, INTERNAL_OPERATION que ya corre solo en Make cada hora) cuando
// Airtable esté disponible. A diferencia de Cierre Temporal de Pistas
// (Paso 07E) o Baja de Jugador (Paso 07C), este módulo NO llama a ningún
// endpoint del Worker todavía — no existe backend real que lo respalde, y
// el propio encargo pide explícitamente no llamar endpoints reales ni
// simular éxito real. Todas las acciones (añadir, promocionar, marcar
// contactado, eliminar) solo muestran un mensaje local honesto de "acción
// preparada, pendiente de conexión real" — nunca crean, modifican ni
// confirman nada real. Gateado a STAFF/ADMIN/SUPPORT (ver rbac.js).
const CP04_LISTA_ESPERA_PENDIENTE_MSG =
  "Acción preparada. Pendiente de conexión real cuando Airtable esté disponible.";

function ListaEspera() {
  const addInitialForm = {
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    pista_preferida: "",
    fecha_preferida: "",
    observaciones: "",
  };
  const [addForm, setAddForm] = useState(addInitialForm);
  const [addErrors, setAddErrors] = useState({});
  const [actionMessage, setActionMessage] = useState("");

  function updateAddForm(field, value) {
    setAddForm((previous) => ({ ...previous, [field]: value }));
    setAddErrors((previous) => ({ ...previous, [field]: "" }));
    setActionMessage("");
  }

  function validateAdd() {
    const nextErrors = {};

    if (addForm.nombre.trim().length < 2) {
      nextErrors.nombre = "Introduce un nombre válido.";
    }
    if (addForm.apellidos.trim().length < 2) {
      nextErrors.apellidos = "Introduce apellidos válidos.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
      nextErrors.email = "Introduce un email válido.";
    }
    if (addForm.telefono.replace(/\D/g, "").length < 9) {
      nextErrors.telefono = "Introduce un teléfono válido.";
    }

    return nextErrors;
  }

  // Validación local solo para dar una experiencia de formulario coherente
  // con el resto de la app — no hay ningún envío real: nunca se llama a
  // fetch/authFetch aquí, y el mensaje mostrado nunca dice "añadido" o
  // "confirmado", siempre "preparado, pendiente de conexión real".
  function handleAdd(event) {
    event.preventDefault();

    const nextErrors = validateAdd();
    setAddErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setActionMessage(`Añadir a lista de espera: ${CP04_LISTA_ESPERA_PENDIENTE_MSG}`);
  }

  function handlePreparedAction(label) {
    setActionMessage(`${label}: ${CP04_LISTA_ESPERA_PENDIENTE_MSG}`);
  }

  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Reservas"
        title="Lista de espera"
        desc="Gestiona jugadores pendientes de plaza o promoción."
      />
      <Card style={{ marginBottom: 20, borderColor: `${T.warning}66`, color: T.warning, fontSize: ".85rem" }}>
        Preparado para integración con Make/Airtable. Validación real pendiente por disponibilidad de Airtable.
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Añadir jugador a lista de espera</h3>
        <form onSubmit={handleAdd}>
          <div className="cp04-grid-2">
            <div>
              <label htmlFor="espera-nombre">Nombre</label>
              <input id="espera-nombre" value={addForm.nombre} onChange={e => updateAddForm("nombre", e.target.value)} autoComplete="given-name" />
              <FieldError>{addErrors.nombre}</FieldError>
            </div>
            <div>
              <label htmlFor="espera-apellidos">Apellidos</label>
              <input id="espera-apellidos" value={addForm.apellidos} onChange={e => updateAddForm("apellidos", e.target.value)} autoComplete="family-name" />
              <FieldError>{addErrors.apellidos}</FieldError>
            </div>
            <div>
              <label htmlFor="espera-email">Email</label>
              <input id="espera-email" type="email" value={addForm.email} onChange={e => updateAddForm("email", e.target.value)} autoComplete="email" />
              <FieldError>{addErrors.email}</FieldError>
            </div>
            <div>
              <label htmlFor="espera-telefono">Teléfono</label>
              <input id="espera-telefono" type="tel" value={addForm.telefono} onChange={e => updateAddForm("telefono", e.target.value)} autoComplete="tel" />
              <FieldError>{addErrors.telefono}</FieldError>
            </div>
            <div>
              <label htmlFor="espera-pista">Pista preferida (opcional)</label>
              <select id="espera-pista" value={addForm.pista_preferida} onChange={e => updateAddForm("pista_preferida", e.target.value)}>
                <option value="">Sin preferencia</option>
                <option value="Pista 1">Pista 1</option>
                <option value="Pista 2">Pista 2</option>
                <option value="Pista 3">Pista 3</option>
                <option value="Pista 4">Pista 4</option>
              </select>
            </div>
            <div>
              <label htmlFor="espera-fecha">Fecha preferida (opcional)</label>
              <input id="espera-fecha" type="date" value={addForm.fecha_preferida} onChange={e => updateAddForm("fecha_preferida", e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <label htmlFor="espera-observaciones">Observaciones (opcional)</label>
            <textarea id="espera-observaciones" value={addForm.observaciones} onChange={e => updateAddForm("observaciones", e.target.value)} rows={3} />
          </div>
          <div style={{ marginTop: 22 }}>
            <Btn
              type="submit"
              className="cp04-offboarding-submit-button"
              style={{
                width: "100%",
                background: T.accent,
                color: "#06100a",
                fontSize: "1rem",
                border: "2px solid rgba(6,16,10,.45)",
                boxShadow: "0 16px 36px rgba(182,255,0,.32), 0 0 0 1px rgba(6,16,10,.45)",
              }}
            >
              Añadir a lista de espera
            </Btn>
          </div>
        </form>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Acciones sobre la lista</h3>
        <p style={{ color: T.textDim, fontSize: ".86rem", marginTop: 0, marginBottom: 18 }}>
          Estas acciones están preparadas visualmente. No confirman una promoción real ni crean datos reales hasta que la integración con Make/Airtable esté disponible.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn variant="secondary" onClick={() => handlePreparedAction("Promocionar siguiente jugador")}>Promocionar siguiente jugador</Btn>
          <Btn variant="secondary" onClick={() => handlePreparedAction("Marcar como contactado")}>Marcar como contactado</Btn>
          <Btn variant="secondary" onClick={() => handlePreparedAction("Eliminar de lista")}>Eliminar de lista</Btn>
        </div>
      </Card>

      {actionMessage && (
        <Card style={{ borderColor: `${T.accent}66`, color: T.accent, fontSize: ".86rem" }}>
          {actionMessage}
        </Card>
      )}
    </div>
  );
}

// PASO 07O (2026-07-20): mensaje único y helper compartido para las
// "acciones preparadas" de los 4 módulos nuevos de este paso — evita
// repetir la misma lógica de estado/mensaje 4 veces (uno por módulo). Cada
// botón, al pulsarse, solo actualiza un mensaje local honesto: nunca llama
// a fetch/authFetch, nunca crea/modifica/elimina nada real.
const CP04_PREPARADO_MSG =
  "Acción preparada. Pendiente de conexión real cuando Make/Airtable esté disponible.";

function PreparedActionButtons({ actions }) {
  const [message, setMessage] = useState("");
  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {actions.map((label) => (
          <Btn key={label} variant="secondary" onClick={() => setMessage(`${label}: ${CP04_PREPARADO_MSG}`)}>
            {label}
          </Btn>
        ))}
      </div>
      {message && (
        <p style={{ color: T.accent, fontSize: ".86rem", marginTop: 16, marginBottom: 0 }}>{message}</p>
      )}
    </>
  );
}

// Banner de estado honesto reutilizado por los 4 módulos: mismo patrón
// visual ya usado en Lista de Espera (Paso 07N) y Cierre Temporal (Paso
// 07E) para no prometer una integración que no existe todavía.
function IntegrationStatusBanner({ children }) {
  return (
    <Card style={{ marginBottom: 20, borderColor: `${T.warning}66`, color: T.warning, fontSize: ".85rem" }}>
      {children}
    </Card>
  );
}

// PASO T3 (2026-08-17): "Control QR / Accesos" — panel funcional.
// Dos sub-flujos: PLAYER genera su QR de reserva; STAFF/ADMIN valida.
// Endpoints reales: POST /api/qr/generate y POST /api/qr/validate.
// Make scenarios: Generación QR (6244975) y Control Acceso QR (5291559).
function ControlQrAccesos() {
  const qrReservasEndpoint =
    import.meta?.env?.VITE_CP04_PUBLIC_BOOKING_ENDPOINT || "/api/reservas";

  // ── Búsqueda de reserva real (flujo productivo) ──
  const [lookupEmail, setLookupEmail] = useState(() => {
    try { return window.localStorage.getItem("cp04-reservas-email") || ""; } catch { return ""; }
  });
  const [lookupResults, setLookupResults] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError]     = useState("");
  const [lookupDone, setLookupDone]       = useState(false);

  // ── Subpanel Generación QR ──
  const [genClave, setGenClave]       = useState("");
  const [genPista, setGenPista]       = useState("Pista 1");
  const [genFecha, setGenFecha]       = useState("");
  const [genHora, setGenHora]         = useState("");
  const [genHoraFin, setGenHoraFin]   = useState("");
  const [genPlayerId, setGenPlayerId] = useState("");
  const [genRecordId, setGenRecordId] = useState("");
  const [genNombre, setGenNombre]     = useState("");
  const [genEmail, setGenEmail]       = useState("");
  const [genResult, setGenResult]     = useState(null);
  const [genLoading, setGenLoading]   = useState(false);
  const [genError, setGenError]       = useState("");
  const [genFromReal, setGenFromReal] = useState(false);

  async function handleBuscarReserva(e) {
    e.preventDefault();
    const emailLimpio = lookupEmail.trim().toLowerCase();
    if (!emailLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      setLookupError("Introduce un correo electrónico válido.");
      return;
    }
    setLookupLoading(true);
    setLookupError("");
    setLookupResults([]);
    setLookupDone(false);
    try {
      const sep = qrReservasEndpoint.includes("?") ? "&" : "?";
      const url = `${qrReservasEndpoint}${sep}email=${encodeURIComponent(emailLimpio)}&limit=100&t=${Date.now()}`;
      const response = await authFetch(url, {
        method: "GET",
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      });
      const data = await readSafeResponse(response);
      const resultado = data && typeof data === "object" ? data : {};
      if (!response.ok || resultado.ok !== true) {
        throw new Error(resultado.error || resultado.message || `Error ${response.status}`);
      }
      const lista =
        Array.isArray(resultado.reservas) ? resultado.reservas
        : Array.isArray(resultado.records) ? resultado.records
        : Array.isArray(resultado.data) ? resultado.data
        : [];
      const normalizadas = lista
        .map(normalizarReserva)
        .filter((r) => r.estado === "confirmada" || r.estado === "reprogramada")
        .sort((a, b) => {
          const fa = `${a.fecha}T${a.horaInicio || "00:00"}`;
          const fb = `${b.fecha}T${b.horaInicio || "00:00"}`;
          return fb.localeCompare(fa);
        });
      setLookupResults(normalizadas);
      setLookupDone(true);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "No se pudieron cargar las reservas.");
    } finally {
      setLookupLoading(false);
    }
  }

  function handleSeleccionarReserva(reserva) {
    if (!reserva.horaFin) {
      setGenError(
        "Esta reserva no tiene hora_fin en Airtable. No se puede generar QR hasta que Make registre la hora de fin."
      );
      return;
    }
    setGenClave(reserva.clave || "");
    setGenPlayerId(reserva.email || "");
    setGenRecordId(reserva.id || "");
    setGenNombre(reserva.nombre || "");
    setGenEmail(reserva.email || "");
    setGenFecha(reserva.fecha || "");
    setGenHora(reserva.horaInicio || "");
    setGenHoraFin(reserva.horaFin);
    setGenPista(reserva.pista || "Pista 1");
    setGenError("");
    setGenResult(null);
    setGenFromReal(true);
  }

  async function handleGenerarQr(e) {
    e.preventDefault();
    setGenError("");
    setGenResult(null);
    if (!genClave || !genPlayerId || !genFecha || !genRecordId || !genNombre || !genEmail || !genHoraFin) {
      setGenError("Completa todos los campos requeridos.");
      return;
    }
    setGenLoading(true);
    try {
      const res = await authFetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clave_reserva: genClave,
          player_id:     genPlayerId,
          club_id:       "club-padel-04",
          pista:         genPista,
          fecha:         genFecha,
          hora_inicio:   genHora,
          hora_fin:      genHoraFin,
          record_id:     genRecordId,
          nombre:        genNombre,
          email:         genEmail,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setGenResult(data);
      } else {
        setGenError(data.error || "Error al generar QR.");
      }
    } catch {
      setGenError("Error de red al contactar el servidor.");
    } finally {
      setGenLoading(false);
    }
  }

  // ── Subpanel Validación QR ──
  const [valClave, setValClave]   = useState("");
  const [valPista, setValPista]   = useState("Pista 1");
  const [valStaff, setValStaff]   = useState("");
  const [valResult, setValResult] = useState(null);
  const [valLoading, setValLoading] = useState(false);
  const [valError, setValError]   = useState("");

  async function handleValidarQr(e) {
    e.preventDefault();
    setValError("");
    setValResult(null);
    if (!valClave || !valStaff) {
      setValError("Completa todos los campos requeridos.");
      return;
    }
    setValLoading(true);
    try {
      const res = await authFetch("/api/qr/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clave_reserva: valClave,
          pista:         valPista,
          club_id:       "club-padel-04",
          staff_id:      valStaff,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setValResult(data);
      } else {
        setValError(data.error || "Error al validar QR.");
      }
    } catch {
      setValError("Error de red al contactar el servidor.");
    } finally {
      setValLoading(false);
    }
  }

  const pistasDisponibles = ["Pista 1", "Pista 2", "Pista 3", "Pista 4"];
  const decisionColor = valResult
    ? (valResult.decision === "ALLOW" ? T.success : T.error)
    : T.text;

  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Seguridad y accesos"
        title="Control QR / Accesos"
        desc="Genera y valida códigos QR de acceso para reservas de pistas."
      />

      {/* Flujo productivo: buscar reserva real → precargar datos */}
      <Card style={{ marginBottom: 24, borderColor: T.accent + "55" }}>
        <h3 style={{ marginTop: 0 }}>🔍 Buscar reserva confirmada</h3>
        <p style={{ color: T.textMuted, fontSize: ".87rem", marginTop: 0 }}>
          Flujo productivo: busca por email del jugador y selecciona la reserva para precargar
          record_id, nombre, email, hora_fin y demás campos directamente desde Airtable vía Make.
          Ningún dato se inventa ni hardcodea.
        </p>
        <form onSubmit={handleBuscarReserva} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: ".87rem", flex: "2 1 220px" }}>
            Email del jugador
            <input
              type="email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="jugador@club.es"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
            />
          </label>
          <Btn type="submit" disabled={lookupLoading} variant="secondary">
            {lookupLoading ? "Buscando…" : "Buscar reservas"}
          </Btn>
        </form>
        {lookupError && (
          <p style={{ color: T.error, fontSize: ".86rem", margin: "10px 0 0" }}>{lookupError}</p>
        )}
        {lookupDone && lookupResults.length === 0 && !lookupError && (
          <p style={{ color: T.textMuted, fontSize: ".86rem", margin: "10px 0 0" }}>
            No se encontraron reservas confirmadas para ese email.
          </p>
        )}
        {lookupResults.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: ".85rem", color: T.textMuted, marginBottom: 8 }}>
              Selecciona la reserva para precargar los datos del QR:
            </p>
            {lookupResults.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSeleccionarReserva(r)}
                style={{ padding: "10px 14px", marginBottom: 8, borderRadius: 8, border: `1px solid ${T.border}`, background: T.cardBg, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{r.clave || r.id}</span>
                  <span style={{ color: T.textMuted, fontSize: ".84rem", marginLeft: 12 }}>
                    {r.fecha} · {r.horaInicio}{r.horaFin ? `–${r.horaFin}` : ""} · {r.pista}
                  </span>
                  {!r.horaFin && (
                    <span style={{ color: T.error, fontSize: ".8rem", marginLeft: 8 }}>⚠ sin hora_fin</span>
                  )}
                </div>
                <span style={{ fontSize: ".82rem", color: T.accent, whiteSpace: "nowrap" }}>Precargar →</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Panel Generación QR */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>
          🔑 Generar QR de acceso
          {genFromReal && (
            <span style={{ fontSize: ".76rem", color: T.success, marginLeft: 10, fontWeight: 400 }}>
              ✓ datos desde reserva real
            </span>
          )}
        </h3>
        {!genFromReal && (
          <p style={{ color: T.textMuted, fontSize: ".83rem", marginTop: 0, padding: "6px 10px", borderRadius: 6, background: `${T.accent}14`, border: `1px solid ${T.accent}33` }}>
            ⚠ Entrada manual — usa el buscador anterior para precargar datos reales desde Airtable.
          </p>
        )}
        <p style={{ color: T.textMuted, fontSize: ".87rem", marginTop: 8 }}>
          El QR será procesado por Make y enviado al jugador (WhatsApp/email).
        </p>
        <form onSubmit={handleGenerarQr} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: ".87rem" }}>
            Clave de reserva *
            <input
              value={genClave}
              onChange={(e) => { setGenClave(e.target.value); setGenFromReal(false); }}
              placeholder="CP04-2026-07-20-PISTA2-09"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
            />
          </label>
          <label style={{ fontSize: ".87rem" }}>
            Player ID (email/usuario) *
            <input
              value={genPlayerId}
              onChange={(e) => setGenPlayerId(e.target.value)}
              placeholder="jugador@example.com"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
            />
          </label>
          <label style={{ fontSize: ".87rem" }}>
            Record ID Airtable *
            <input
              value={genRecordId}
              onChange={(e) => setGenRecordId(e.target.value)}
              placeholder="recXXXXXXXXXXXXXX"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
            />
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: ".87rem", flex: "2 1 200px" }}>
              Nombre del jugador *
              <input
                value={genNombre}
                onChange={(e) => setGenNombre(e.target.value)}
                placeholder="Nombre Apellido"
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
              />
            </label>
            <label style={{ fontSize: ".87rem", flex: "2 1 200px" }}>
              Email del jugador *
              <input
                type="email"
                value={genEmail}
                onChange={(e) => setGenEmail(e.target.value)}
                placeholder="jugador@club.es"
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
              />
            </label>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: ".87rem", flex: "1 1 140px" }}>
              Pista
              <select
                value={genPista}
                onChange={(e) => setGenPista(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
              >
                {pistasDisponibles.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label style={{ fontSize: ".87rem", flex: "1 1 140px" }}>
              Fecha *
              <input
                type="date"
                value={genFecha}
                onChange={(e) => setGenFecha(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
              />
            </label>
            <label style={{ fontSize: ".87rem", flex: "1 1 100px" }}>
              Hora inicio *
              <input
                type="time"
                value={genHora}
                onChange={(e) => setGenHora(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
              />
            </label>
            <label style={{ fontSize: ".87rem", flex: "1 1 100px" }}>
              Hora fin *
              <input
                type="time"
                value={genHoraFin}
                onChange={(e) => setGenHoraFin(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
              />
            </label>
          </div>
          {genError && (
            <p style={{ color: T.error, fontSize: ".86rem", margin: 0 }}>{genError}</p>
          )}
          <Btn type="submit" disabled={genLoading} variant="primary">
            {genLoading ? "Generando…" : "Generar QR de acceso"}
          </Btn>
        </form>
        {genResult && (
          <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: `${T.success}18`, border: `1px solid ${T.success}44` }}>
            <p style={{ color: T.success, fontWeight: 700, margin: "0 0 8px" }}>QR generado — pendiente de confirmación Make</p>
            <p style={{ fontSize: ".84rem", margin: "4px 0", color: T.textMuted }}>Clave: <strong>{genResult.clave_reserva}</strong></p>
            <p style={{ fontSize: ".84rem", margin: "4px 0", color: T.textMuted }}>Pista: {genResult.pista} · Fecha: {genResult.fecha} · {genResult.hora_inicio}</p>
            <p style={{ fontSize: ".84rem", margin: "4px 0", color: T.textMuted }}>Válido desde: {genResult.valid_from ? new Date(genResult.valid_from).toLocaleString("es-ES") : "—"}</p>
            <p style={{ fontSize: ".84rem", margin: "4px 0", color: T.textMuted }}>Válido hasta: {genResult.valid_until ? new Date(genResult.valid_until).toLocaleString("es-ES") : "—"}</p>
            <p style={{ fontSize: ".82rem", margin: "8px 0 0", color: T.textMuted }}>Make procesará la entrega del QR al jugador según la configuración del club.</p>
          </div>
        )}
      </Card>

      {/* Panel Control / Validación QR */}
      <Card>
        <h3 style={{ marginTop: 0 }}>🔐 Verificar acceso QR</h3>
        <p style={{ color: T.textMuted, fontSize: ".87rem", marginTop: 0 }}>
          Introduce la clave de reserva escaneada o tecleada manualmente. Make comprobará el estado real en Airtable.
        </p>
        <form onSubmit={handleValidarQr} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: ".87rem" }}>
            Clave de reserva (del QR) *
            <input
              value={valClave}
              onChange={(e) => setValClave(e.target.value)}
              placeholder="CP04-2026-07-20-PISTA2-09"
              style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
            />
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: ".87rem", flex: "1 1 140px" }}>
              Pista
              <select
                value={valPista}
                onChange={(e) => setValPista(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
              >
                {pistasDisponibles.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label style={{ fontSize: ".87rem", flex: "2 1 200px" }}>
              ID del validador (staff) *
              <input
                value={valStaff}
                onChange={(e) => setValStaff(e.target.value)}
                placeholder="staff@cp04.es"
                style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.cardBg, color: T.text, fontSize: ".9rem" }}
              />
            </label>
          </div>
          {valError && (
            <p style={{ color: T.error, fontSize: ".86rem", margin: 0 }}>{valError}</p>
          )}
          <Btn type="submit" disabled={valLoading} variant="primary">
            {valLoading ? "Verificando…" : "Verificar acceso"}
          </Btn>
        </form>
        {valResult && (
          <div style={{ marginTop: 20, padding: 20, borderRadius: 8, background: valResult.decision === "ALLOW" ? `${T.success}18` : `${T.error}18`, border: `2px solid ${decisionColor}` }}>
            <p style={{ color: decisionColor, fontWeight: 800, fontSize: "1.1rem", margin: "0 0 8px" }}>
              {valResult.decision === "ALLOW" ? "✅ ACCESO PERMITIDO" : "❌ ACCESO DENEGADO"}
            </p>
            <p style={{ fontSize: ".87rem", margin: "4px 0", color: T.textMuted }}>
              Motivo: <strong>{valResult.reason}</strong>
            </p>
            <p style={{ fontSize: ".84rem", margin: "4px 0", color: T.textMuted }}>Pista: {valResult.pista}</p>
            <p style={{ fontSize: ".82rem", margin: "8px 0 0", color: T.textMuted }}>
              Validado: {new Date(valResult.scanned_at).toLocaleString("es-ES")}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// PASO 07O (2026-07-20): "Pistas libres y recordatorios" — agrupa 4
// escenarios Make de comunicación proactiva a jugadores: "🚨 Alerta
// Pistas Libres + Flash Promo" (5736472), "🔔 Recordatorio 24h Antes"
// (4942506), "⚡ Recordatorio 2h Antes" (5736463) y "🚫 Seguimiento
// No-Show" (5736797). Gateado a STAFF/ADMIN/SUPPORT.
function PistasLibresRecordatorios() {
  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Reservas"
        title="Pistas libres y recordatorios"
        desc="Alertas de huecos libres y recordatorios automáticos a jugadores."
      />
      <IntegrationStatusBanner>
        Preparado visualmente. Validación real pendiente por disponibilidad de Airtable (429).
      </IntegrationStatusBanner>
      <Card>
        <h3 style={{ marginTop: 0 }}>Escenarios relacionados en Make</h3>
        <PanelList items={[
          "🚨 Alerta Pistas Libres + Flash Promo — avisa cuando queda una pista libre de última hora.",
          "🔔 Recordatorio 24h Antes / ⚡ Recordatorio 2h Antes — recuerdan a un jugador su reserva próxima.",
          "🚫 Seguimiento No-Show — registra cuando un jugador no se presenta a su reserva.",
          "Los 4 escenarios ya corren en Make bloqueados por Airtable 429; este panel no los reactiva ni los sustituye.",
        ]} />
        <div style={{ marginTop: 20 }}>
          <PreparedActionButtons actions={["Enviar alerta de pista libre", "Enviar recordatorio manual", "Marcar no-show"]} />
        </div>
      </Card>
    </div>
  );
}

// PASO 07O (2026-07-20): "Dashboard KPI y NPS" — agrupa 4 escenarios de
// métricas: "📋 Dashboard Ejecutivo Diario" (5736800), "📊 Panel KPI
// Semanal" (5736468), "📊 Informe Mensual" (5791119) y "📊 Análisis NPS
// Semanal" (5811901). Gateado como "admin" (ADMIN+SUPPORT, sin STAFF) —
// mismo nivel que la sección Admin ya existente.
//
// Deliberadamente NO incluye "⭐ Encuesta Post-Partido" (5736466), aunque
// temáticamente sea de NPS: esa auditoría previa (Paso 07B) encontró un
// 89% de tasa de error histórica en Make — integrar su UI ahora
// propagaría un hallazgo roto. Sigue en Grupo E, sin cambios, hasta que
// se diagnostique dentro de Make (fuera de alcance de este paso).
function DashboardKpiNps() {
  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Métricas"
        title="Dashboard KPI y NPS"
        desc="Indicadores operativos y satisfacción de jugadores."
      />
      <IntegrationStatusBanner>
        Preparado visualmente. Validación real pendiente por disponibilidad de Airtable (429).
      </IntegrationStatusBanner>
      <Card>
        <h3 style={{ marginTop: 0 }}>Escenarios relacionados en Make</h3>
        <PanelList items={[
          "📋 Dashboard Ejecutivo Diario / 📊 Panel KPI Semanal / 📊 Informe Mensual — métricas operativas del club.",
          "📊 Análisis NPS Semanal — satisfacción de jugadores.",
          "⭐ Encuesta Post-Partido NO se incluye aquí: auditoría previa detectó 89% de tasa de error en Make — no se reactiva hasta que se diagnostique en Make.",
          "Los escenarios incluidos ya corren en Make; este panel no los reactiva ni los sustituye.",
        ]} />
        <div style={{ marginTop: 20 }}>
          <PreparedActionButtons actions={["Actualizar dashboard", "Exportar informe"]} />
        </div>
      </Card>
    </div>
  );
}

// PASO 07O (2026-07-20): "Backups y seguridad" — agrupa 4 escenarios de
// infraestructura: "🔄 Backup Semanal" (6217724), "🗂️ Backup Plantilla
// Drive" (6216523), "⚖️ Solicitud GDPR Acceso u Olvido de Datos"
// (6323457) y "🛡️ Alerta Seguridad Acceso Sospechoso" (6323450). Gateado
// como "admin" (ADMIN+SUPPORT, sin STAFF).
// PASO T2 (2026-08-21): "Revisar solicitud GDPR" deja de ser un botón
// preparado (PreparedActionButtons) y pasa a ser funcional de verdad,
// reutilizando exactamente los mismos endpoints que Perfil() (POST
// /api/gdpr/acceso y /api/gdpr/olvido, con `email` explícito porque
// ADMIN/SUPPORT puede tramitar la solicitud de otro socio). No se crea
// ninguna tabla/lista de solicitudes nueva: el Worker no tiene ningún
// AIRTABLE_*_TABLE_ID configurado para eso todavía (ver comentario en
// handleGdprAcceso/handleGdprOlvido), así que este panel es de consulta
// puntual por email, no un listado histórico — eso queda documentado como
// limitación, no fingido.
function GdprAdminReview() {
  const [email, setEmail] = useState("");
  const [accesoLoading, setAccesoLoading] = useState(false);
  const [accesoResult, setAccesoResult] = useState(null);
  const [accesoError, setAccesoError] = useState("");
  const [olvidoLoading, setOlvidoLoading] = useState(false);
  const [olvidoResult, setOlvidoResult] = useState(null);
  const [olvidoError, setOlvidoError] = useState("");

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function consultarAcceso() {
    setAccesoLoading(true); setAccesoError(""); setAccesoResult(null);
    try {
      const response = await authFetch("/api/gdpr/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await readSafeResponse(response);
      if (!response.ok || !data?.ok) setAccesoError(data?.message || data?.error || "No se pudo consultar.");
      else setAccesoResult(data);
    } catch {
      setAccesoError("Error de conexión.");
    } finally {
      setAccesoLoading(false);
    }
  }

  async function registrarOlvido() {
    setOlvidoLoading(true); setOlvidoError(""); setOlvidoResult(null);
    try {
      const response = await authFetch("/api/gdpr/olvido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), confirmar: true, motivo: "Tramitación administrativa desde Backups y seguridad." }),
      });
      const data = await readSafeResponse(response);
      if (!response.ok || !data?.ok) setOlvidoError(data?.message || data?.error || "No se pudo registrar.");
      else setOlvidoResult(data);
    } catch {
      setOlvidoError("Error de conexión.");
    } finally {
      setOlvidoLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
      <h3 style={{ marginTop: 0, fontSize: "1rem" }}>⚖️ Revisar solicitud GDPR</h3>
      <p style={{ color: T.textDim, fontSize: ".82rem", marginBottom: 14 }}>
        Consulta o registra una solicitud GDPR (ACCESO u OLVIDO) por email de socio — distinta de una Baja de Jugador.
        La ejecución real del olvido (cancelaciones, salida de lista de espera) requiere el runbook administrativo, no este panel.
      </p>
      <input
        type="email"
        placeholder="email@socio.example"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", maxWidth: 360, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.surface2, color: T.text, marginBottom: 12 }}
      />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Btn variant="secondary" onClick={consultarAcceso} disabled={!emailValido || accesoLoading}>
          {accesoLoading ? "Consultando…" : "Consultar datos (GDPR_ACCESO)"}
        </Btn>
        <Btn variant="danger" onClick={registrarOlvido} disabled={!emailValido || olvidoLoading}>
          {olvidoLoading ? "Registrando…" : "Registrar solicitud de olvido (GDPR_OLVIDO)"}
        </Btn>
      </div>

      {accesoError && <div style={{ color: T.danger, fontSize: ".82rem", marginTop: 10 }}>{accesoError}</div>}
      {accesoResult && (
        <div style={{ marginTop: 12, padding: 12, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: ".82rem", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700 }}>{accesoResult.tipo} — {accesoResult.titular.email}</div>
          <div style={{ color: T.textDim }}>Identidad: {accesoResult.datos.identidad.disponible ? "disponible" : `no disponible (${accesoResult.datos.identidad.motivo})`}</div>
          <div style={{ color: T.textDim }}>Reservas: {accesoResult.datos.reservas.disponible ? `${accesoResult.datos.reservas.registros.length} registro(s)` : `no disponible (${accesoResult.datos.reservas.motivo})`}</div>
        </div>
      )}

      {olvidoError && <div style={{ color: T.danger, fontSize: ".82rem", marginTop: 10 }}>{olvidoError}</div>}
      {olvidoResult && (
        <div style={{ marginTop: 12, padding: 12, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: ".82rem", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700 }}>{olvidoResult.tipo} — {olvidoResult.titular.email} — estado: {olvidoResult.estado}</div>
          {olvidoResult.dependencias?.reservas_futuras?.verificable && (
            <div style={{ color: T.textDim }}>Reservas futuras: {olvidoResult.dependencias.reservas_futuras.cantidad}</div>
          )}
          <div style={{ color: T.textDim }}>Lista de espera: no verificable en este entorno (requiere revisión manual).</div>
        </div>
      )}
    </div>
  );
}

function BackupsSeguridad() {
  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Infraestructura"
        title="Backups y seguridad"
        desc="Copias de seguridad y alertas de seguridad del sistema."
      />
      <IntegrationStatusBanner>
        Preparado visualmente. Pendiente de validación real / credenciales externas.
      </IntegrationStatusBanner>
      <Card>
        <h3 style={{ marginTop: 0 }}>Escenarios relacionados en Make</h3>
        <PanelList items={[
          "🔄 Backup Semanal / 🗂️ Backup Plantilla Drive — copias de seguridad periódicas.",
          "⚖️ Solicitud GDPR Acceso u Olvido de Datos — gestión de solicitudes de privacidad (ver panel funcional debajo).",
          "🛡️ Alerta Seguridad Acceso Sospechoso — aviso de accesos sospechosos.",
          "Backup Semanal, Backup Plantilla Drive y Alerta Seguridad ya corren en Make; este panel no los reactiva ni los sustituye.",
        ]} />
        <div style={{ marginTop: 20 }}>
          <PreparedActionButtons actions={["Solicitar backup manual", "Revisar alerta de seguridad"]} />
        </div>
        <GdprAdminReview />
      </Card>
    </div>
  );
}

// PASO 07P (2026-07-20): "Comunicaciones y ciclo de socio" — agrupa 9
// escenarios de comunicación proactiva ligada al ciclo de vida del socio:
// "🔁 Reactivación Inactivos 30d" (5736470), "🎂 Felicitación Cumpleaños"
// (5811864), "💳 Recordatorio Cuota Mensual" (5791032), "📧 Monitor
// Prueba Gratuita" (5750308), "❄️ Congelación + Reactivación Membresía"
// (5812456), "🎁 Bienvenida Nuevo Socio" (5791022), "🔁 Onboarding
// Secuencial" (5811918), "🎁 Programa de Referidos" (5812297) y "👥
// Emparejamiento Sin Pareja" (5791128). Gateado a STAFF/ADMIN/SUPPORT
// (atención al jugador es tarea diaria de STAFF, ver rbac.js).
function ComunicacionesSocio() {
  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Socios"
        title="Comunicaciones y ciclo de socio"
        desc="Avisos y automatizaciones ligadas al ciclo de vida del socio."
      />
      <IntegrationStatusBanner>
        Preparado visualmente. Validación real pendiente por disponibilidad de Airtable (429).
      </IntegrationStatusBanner>
      <Card>
        <h3 style={{ marginTop: 0 }}>Escenarios relacionados en Make</h3>
        <PanelList items={[
          "🔁 Reactivación Inactivos 30d / ❄️ Congelación + Reactivación Membresía — recuperan socios inactivos o congelados.",
          "🎂 Felicitación Cumpleaños / 🎁 Bienvenida Nuevo Socio / 🔁 Onboarding Secuencial — comunicaciones de ciclo de vida.",
          "💳 Recordatorio Cuota Mensual / 📧 Monitor Prueba Gratuita — recordatorios de facturación y prueba gratuita.",
          "🎁 Programa de Referidos — invita a socios a recomendar el club.",
          "👥 Emparejamiento Sin Pareja — conecta jugadores sin compañero de partido.",
          "Los 9 escenarios ya corren en Make; este panel no los reactiva ni los sustituye.",
        ]} />
        <div style={{ marginTop: 20 }}>
          <PreparedActionButtons actions={["Enviar comunicación preparada", "Revisar socio inactivo", "Emparejar jugador"]} />
        </div>
      </Card>
    </div>
  );
}

// PASO 07P (2026-07-20): "Calendario y disponibilidad" — agrupa "🗓️
// Sincronización Multi-Calendario" (5735907) y "📈 Predicción Ocupación"
// (5799041). Gateado a STAFF/ADMIN/SUPPORT (disponibilidad es tarea
// diaria de STAFF).
function CalendarioDisponibilidadModulo() {
  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Reservas"
        title="Calendario y disponibilidad"
        desc="Sincronización de calendarios externos y previsión de ocupación."
      />
      <IntegrationStatusBanner>
        Preparado visualmente. Pendiente de integración real con Google Calendar y validación por Airtable 429.
      </IntegrationStatusBanner>
      <Card>
        <h3 style={{ marginTop: 0 }}>Escenarios relacionados en Make</h3>
        <PanelList items={[
          "🗓️ Sincronización Multi-Calendario — mantiene coherentes las reservas del club con calendarios externos.",
          "📈 Predicción Ocupación — estima la ocupación futura de las pistas.",
          "Ambos escenarios ya corren en Make; este panel no los reactiva ni los sustituye ni sincroniza ningún calendario real todavía.",
        ]} />
        <div style={{ marginTop: 20 }}>
          <PreparedActionButtons actions={["Sincronizar calendario", "Ver previsión de ocupación"]} />
        </div>
      </Card>
    </div>
  );
}

// PASO 07P (2026-07-20): "Facturación y pagos" — agrupa "💰 Facturación y
// Cobro" (5733370), "💳 Pago Confirmado Stripe → Cuota + Recibo"
// (6323441), "🔄 Dunning Cobro Recurrente Stripe" (6335117) y "💸 Escalado
// Impagos" (5811888). Gateado como "admin" (ADMIN+SUPPORT, sin STAFF).
// No existe ningún código de Stripe en esta rama — este panel nunca debe
// dar a entender que ya hay pagos reales conectados.
function FacturacionPagos() {
  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Negocio"
        title="Facturación y pagos"
        desc="Cobros, recibos y seguimiento de impagos."
      />
      <IntegrationStatusBanner>
        Preparado visualmente. Pendiente de integración real con Stripe — no ejecuta pagos ni cobros reales todavía.
      </IntegrationStatusBanner>
      <Card>
        <h3 style={{ marginTop: 0 }}>Escenarios relacionados en Make</h3>
        <PanelList items={[
          "💰 Facturación y Cobro — genera facturas/cobros de cuotas.",
          "💳 Pago Confirmado Stripe → Cuota + Recibo — confirma un pago y emite el recibo correspondiente.",
          "🔄 Dunning Cobro Recurrente Stripe — reintenta cobros recurrentes fallidos.",
          "💸 Escalado Impagos — escala impagos persistentes.",
          "Los 4 escenarios ya corren en Make; este panel no los reactiva, no los sustituye y no ejecuta ningún cobro real.",
        ]} />
        <div style={{ marginTop: 20 }}>
          <PreparedActionButtons actions={["Ver estado de facturación", "Reintentar cobro", "Revisar impago"]} />
        </div>
      </Card>
    </div>
  );
}

// PASO 07P (2026-07-20): "Automatizaciones y bots" — agrupa "🎧 Atención
// Socio WhatsApp FAQ" (5799031), "🎯 Campaña Flash WhatsApp" (5791124),
// "🤖 Bot IA Reservas WhatsApp" (5798996), "🤖 Bot IA Reservas Telegram"
// (4832095) y "📝 Tally → API Reservas" (5747703). Gateado como "admin"
// (ADMIN+SUPPORT, sin STAFF). No existe integración de WhatsApp Business
// API, Telegram Bot API ni Tally en esta rama — este panel nunca debe dar
// a entender que ya hay mensajes reales conectados.
function AutomatizacionesBots() {
  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle
        eyebrow="Automatizaciones"
        title="Automatizaciones y bots"
        desc="Asistentes de WhatsApp, Telegram y formularios externos."
      />
      <IntegrationStatusBanner>
        Preparado visualmente. Pendiente de integración real con WhatsApp Business API, Telegram Bot API y Tally — no envía mensajes reales todavía.
      </IntegrationStatusBanner>
      <Card>
        <h3 style={{ marginTop: 0 }}>Escenarios relacionados en Make</h3>
        <PanelList items={[
          "🎧 Atención Socio WhatsApp FAQ — responde preguntas frecuentes de socios por WhatsApp.",
          "🎯 Campaña Flash WhatsApp — envía promociones flash por WhatsApp.",
          "🤖 Bot IA Reservas WhatsApp / 🤖 Bot IA Reservas Telegram — asistentes de reserva por chat.",
          "📝 Tally → API Reservas — recoge reservas desde un formulario externo (Tally).",
          "Los 5 escenarios ya corren en Make; este panel no los reactiva, no los sustituye y no envía ningún mensaje real.",
        ]} />
        <div style={{ marginTop: 20 }}>
          <PreparedActionButtons actions={["Revisar conversación preparada", "Enviar campaña de prueba", "Revisar formulario Tally"]} />
        </div>
      </Card>
    </div>
  );
}

function normalizarReserva(item) {
  const reserva =
    item && typeof item === "object" && item.fields
      ? { ...item.fields, record_id: item.id || item.record_id }
      : item || {};

  return {
    id:
      reserva.record_id ||
      reserva.id ||
      reserva.clave_reserva ||
      `${reserva.fecha_reserva || reserva.fecha || "sin-fecha"}-${
        reserva.pista || reserva.Pista || "sin-pista"
      }-${reserva.hora_inicio || reserva.hora || "sin-hora"}`,

    nombre:
      reserva.nombre ||
      reserva.Nombre ||
      reserva.jugador_nombre ||
      "",

    apellidos:
      reserva.apellidos ||
      reserva.Apellidos ||
      reserva.jugador_apellidos ||
      "",

    email:
      reserva.email ||
      reserva.Email ||
      "",

    fecha:
      reserva.fecha_reserva ||
      reserva.fecha ||
      reserva.Fecha ||
      "",

    horaInicio:
      reserva.hora_inicio ||
      reserva.hora ||
      reserva.Hora ||
      "",

    horaFin:
      reserva.hora_fin ||
      "",

    pista:
      reserva.pista ||
      reserva.Pista ||
      "",

    estado: String(
      reserva.estado_reserva ||
      reserva.estado ||
      reserva.Estado ||
      "sin estado",
    ).toLowerCase(),

    clave:
      reserva.clave_reserva ||
      reserva.clave ||
      "",

    fechaCancelacion:
      reserva.fecha_cancelacion ||
      "",

    eventId:
      reserva.event_id ||
      "",
  };
}

function Gestion() {
  const [emailConsulta, setEmailConsulta] = useState(() => {
    try {
      return (
        window.localStorage.getItem("cp04_user_email") ||
        window.localStorage.getItem("cp04-reservas-email") ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [reservasReales, setReservasReales] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [reservasConsultadas, setReservasConsultadas] = useState(false);
  const [errorReservas, setErrorReservas] = useState("");
  const [fuenteReservas, setFuenteReservas] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPista, setFiltroPista] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const reservasEndpoint =
    import.meta?.env?.VITE_CP04_PUBLIC_BOOKING_ENDPOINT ||
    "/api/reservas";

  async function cargarReservas() {
    const emailLimpio = emailConsulta.trim().toLowerCase();

    if (
      !emailLimpio ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)
    ) {
      setErrorReservas(
        "Introduce un correo electrónico válido para consultar las reservas.",
      );
      return;
    }

    if (cargandoReservas) return;

    setCargandoReservas(true);
    setErrorReservas("");

    try {
      const separador = reservasEndpoint.includes("?") ? "&" : "?";

      const url =
        `${reservasEndpoint}${separador}` +
        `email=${encodeURIComponent(emailLimpio)}` +
        `&limit=100&t=${Date.now()}`;

      // GET /api/reservas ya exige sesión real en el Worker (protegido en una
      // fase anterior): sin esta cabecera, esta búsqueda devuelve 401.
      const response = await authFetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      const data = await readSafeResponse(response);
      const resultado =
        data && typeof data === "object" ? data : {};

      if (!response.ok || resultado.ok !== true) {
        throw new Error(
          resultado.error ||
          resultado.message ||
          `No se pudieron consultar las reservas (${response.status}).`,
        );
      }

      const listaOriginal = Array.isArray(resultado.reservas)
        ? resultado.reservas
        : Array.isArray(resultado.records)
          ? resultado.records
          : Array.isArray(resultado.data)
            ? resultado.data
            : [];

      const listaNormalizada = listaOriginal
        .map(normalizarReserva)
        .sort((a, b) => {
          const fechaA = `${a.fecha}T${a.horaInicio || "00:00"}`;
          const fechaB = `${b.fecha}T${b.horaInicio || "00:00"}`;
          return fechaB.localeCompare(fechaA);
        });

      setReservasReales(listaNormalizada);
      setFuenteReservas(resultado.source || "airtable");
      setReservasConsultadas(true);

      try {
        window.localStorage.setItem(
          "cp04-reservas-email",
          emailLimpio,
        );
      } catch {
        // La consulta ya ha terminado correctamente.
      }
    } catch (error) {
      setReservasReales([]);
      setReservasConsultadas(true);
      setFuenteReservas("");
      setErrorReservas(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las reservas.",
      );
    } finally {
      setCargandoReservas(false);
    }
  }

  const pistasDisponibles = useMemo(
    () =>
      [...new Set(
        reservasReales
          .map((reserva) => reserva.pista)
          .filter(Boolean),
      )].sort(),
    [reservasReales],
  );

  const estadosDisponibles = useMemo(
    () =>
      [...new Set(
        reservasReales
          .map((reserva) => reserva.estado)
          .filter(Boolean),
      )].sort(),
    [reservasReales],
  );

  const reservasFiltradas = useMemo(
    () =>
      reservasReales.filter((reserva) => {
        const coincideFecha =
          !filtroFecha || reserva.fecha === filtroFecha;

        const coincidePista =
          !filtroPista || reserva.pista === filtroPista;

        const coincideEstado =
          !filtroEstado || reserva.estado === filtroEstado;

        return (
          coincideFecha &&
          coincidePista &&
          coincideEstado
        );
      }),
    [
      reservasReales,
      filtroFecha,
      filtroPista,
      filtroEstado,
    ],
  );

  const resumenReservas = useMemo(() => {
    const confirmadas = reservasReales.filter(
      (reserva) =>
        reserva.estado === "confirmada" ||
        reserva.estado === "reprogramada",
    ).length;

    const pendientes = reservasReales.filter(
      (reserva) => reserva.estado === "pendiente",
    ).length;

    const canceladas = reservasReales.filter(
      (reserva) => reserva.estado === "cancelada",
    ).length;

    return {
      total: reservasReales.length,
      confirmadas,
      pendientes,
      canceladas,
    };
  }, [reservasReales]);

  function colorEstado(estado) {
    if (
      estado === "confirmada" ||
      estado === "reprogramada"
    ) {
      return T.accent;
    }

    if (estado === "pendiente") {
      return T.warning;
    }

    if (estado === "cancelada") {
      return T.danger;
    }

    return T.textDim;
  }

  return (
    <div
      style={{
        padding: "42px 24px",
        maxWidth: 1180,
        margin: "0 auto",
      }}
    >
      <SectionTitle
        eyebrow="Reservas"
        title="Listado real de reservas"
        desc="Consulta tus reservas."
      />

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>
          Consultar mis reservas
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 1fr) auto",
            gap: 12,
            alignItems: "end",
          }}
        >
          <label>
            <span
              style={{
                display: "block",
                color: T.textDim,
                marginBottom: 7,
              }}
            >
              Email
            </span>

            <input
              aria-label="Correo para consultar reservas"
              type="email"
              placeholder="tu-correo@ejemplo.com"
              value={emailConsulta}
              autoComplete="email"
              onChange={(event) => {
                setEmailConsulta(event.target.value);
                setErrorReservas("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  cargarReservas();
                }
              }}
            />
          </label>

          <Btn
            disabled={
              cargandoReservas ||
              !emailConsulta.trim()
            }
            onClick={cargarReservas}
            className="cp04-fix-white-action-btn cp04-fix-consultar-reservas-btn"
          >
            {cargandoReservas
              ? "Consultando..."
              : "Consultar reservas"}
          </Btn>
        </div>

        {errorReservas && (
          <div
            role="alert"
            style={{
              marginTop: 14,
              color: T.danger,
            }}
          >
            {errorReservas}
          </div>
        )}
      </Card>

      {reservasConsultadas && !errorReservas && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <Card>
              <div style={{ color: T.textDim }}>
                Total
              </div>
              <strong
                style={{
                  display: "block",
                  color: T.accent,
                  fontSize: 28,
                  marginTop: 7,
                }}
              >
                {resumenReservas.total}
              </strong>
            </Card>

            <Card>
              <div style={{ color: T.textDim }}>
                Confirmadas
              </div>
              <strong
                style={{
                  display: "block",
                  color: T.accent,
                  fontSize: 28,
                  marginTop: 7,
                }}
              >
                {resumenReservas.confirmadas}
              </strong>
            </Card>

            <Card>
              <div style={{ color: T.textDim }}>
                Pendientes
              </div>
              <strong
                style={{
                  display: "block",
                  color: T.warning,
                  fontSize: 28,
                  marginTop: 7,
                }}
              >
                {resumenReservas.pendientes}
              </strong>
            </Card>

            <Card>
              <div style={{ color: T.textDim }}>
                Canceladas
              </div>
              <strong
                style={{
                  display: "block",
                  color: T.danger,
                  fontSize: 28,
                  marginTop: 7,
                }}
              >
                {resumenReservas.canceladas}
              </strong>
            </Card>
          </div>

          <Card style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              <label>
                <span
                  style={{
                    display: "block",
                    color: T.textDim,
                    marginBottom: 7,
                  }}
                >
                  Fecha
                </span>

                <input
                  aria-label="Filtrar reservas por fecha"
                  type="date"
                  value={filtroFecha}
                  onChange={(event) =>
                    setFiltroFecha(event.target.value)
                  }
                />
              </label>

              <label>
                <span
                  style={{
                    display: "block",
                    color: T.textDim,
                    marginBottom: 7,
                  }}
                >
                  Pista
                </span>

                <select
                  aria-label="Filtrar reservas por pista"
                  value={filtroPista}
                  onChange={(event) =>
                    setFiltroPista(event.target.value)
                  }
                >
                  <option value="">Todas</option>

                  {pistasDisponibles.map((pista) => (
                    <option key={pista} value={pista}>
                      {pista}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span
                  style={{
                    display: "block",
                    color: T.textDim,
                    marginBottom: 7,
                  }}
                >
                  Estado
                </span>

                <select
                  aria-label="Filtrar reservas por estado"
                  value={filtroEstado}
                  onChange={(event) =>
                    setFiltroEstado(event.target.value)
                  }
                >
                  <option value="">Todos</option>

                  {estadosDisponibles.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div
              style={{
                marginTop: 14,
                color: T.textDim,
              }}
            >
              Mostrando {reservasFiltradas.length} de{" "}
              {reservasReales.length} reservas · Fuente:{" "}
              {fuenteReservas ? "base de datos" : "base de datos"}
            </div>
          </Card>

          {reservasFiltradas.length === 0 ? (
            <Card>
              <strong>
                No se encontraron reservas
              </strong>

              <p
                style={{
                  color: T.textDim,
                  marginBottom: 0,
                }}
              >
                No hay registros que coincidan con los
                filtros seleccionados.
              </p>
            </Card>
          ) : (
            <Card>
              <div className="cp04-table-wrap">
                <table className="cp04-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Pista</th>
                      <th>Jugador</th>
                      <th>Estado</th>
                      <th>Clave</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reservasFiltradas.map((reserva) => (
                      <tr key={reserva.id}>
                        <td>
                          {reserva.fecha
                            ? formatDateEs(reserva.fecha)
                            : "—"}
                        </td>

                        <td>
                          {reserva.horaInicio || "—"}
                          {reserva.horaFin
                            ? `–${reserva.horaFin}`
                            : ""}
                        </td>

                        <td>{reserva.pista || "—"}</td>

                        <td>
                          {[
                            reserva.nombre,
                            reserva.apellidos,
                          ]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </td>

                        <td>
                          <strong
                            style={{
                              color: colorEstado(
                                reserva.estado,
                              ),
                              textTransform: "capitalize",
                            }}
                          >
                            {reserva.estado}
                          </strong>
                        </td>

                        <td>
                          <code
                            style={{
                              color: T.textDim,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {reserva.clave || "—"}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}


// PASO 07I (2026-07-19): Baja de Jugador pasa a tener su propio acceso en
// el sidebar ("baja_jugador"), además del ya existente "alta_jugador".
// Ambos apuntan al MISMO componente `AltaJugador()` (nunca se duplicó el
// formulario ni la lógica del Paso 07C) — `initialModo` solo decide qué
// pestaña se abre primero según desde qué item del sidebar se navegó. El
// usuario sigue pudiendo cambiar de pestaña libremente una vez dentro,
// igual que antes de este paso.
function AltaJugador({ initialModo = "alta" } = {}) {
  const lang = useLang();
  const tx = key => t(key, lang);
  const initialForm = {
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    nivel: "",
    genero: "",
    comentarios: "",
    acepta_condiciones: false,
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  // PASO 07C (2026-07-19): Baja de Jugador + Promoción — misma ruta/gate RBAC
  // que Alta (STAFF/ADMIN/SUPPORT, ver rbac.js CP04_ROLE_PERMISSIONS), sin
  // tocar navegación ni permisos. Réplica deliberada del patrón de Alta:
  // formulario -> validación local -> authFetch -> nunca confirma éxito sin
  // response.ok && data.ok !== false.
  const [modo, setModo] = useState(initialModo === "baja" ? "baja" : "alta");
  const bajaInitialForm = {
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    motivo_baja: "",
    fecha_baja: "",
    promocionar_siguiente_si_aplica: false,
    observaciones: "",
  };
  const [bajaForm, setBajaForm] = useState(bajaInitialForm);
  const [bajaErrors, setBajaErrors] = useState({});
  const [bajaSending, setBajaSending] = useState(false);
  const [bajaSuccess, setBajaSuccess] = useState(false);
  const [bajaServerError, setBajaServerError] = useState("");

  function updateBajaForm(field, value) {
    setBajaForm((previous) => ({ ...previous, [field]: value }));
    setBajaErrors((previous) => ({ ...previous, [field]: "" }));
    setBajaSuccess(false);
    setBajaServerError("");
  }

  function validateBaja() {
    const nextErrors = {};

    if (bajaForm.nombre.trim().length < 2) {
      nextErrors.nombre = "Introduce un nombre válido.";
    }
    if (bajaForm.apellidos.trim().length < 2) {
      nextErrors.apellidos = "Introduce apellidos válidos.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bajaForm.email.trim())) {
      nextErrors.email = "Introduce un email válido.";
    }
    if (bajaForm.telefono.replace(/\D/g, "").length < 9) {
      nextErrors.telefono = "Introduce un teléfono válido.";
    }
    if (!bajaForm.motivo_baja) {
      nextErrors.motivo_baja = "Selecciona el motivo de la baja.";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(bajaForm.fecha_baja || "")) {
      nextErrors.fecha_baja = "Selecciona la fecha de baja.";
    }

    return nextErrors;
  }

  // No confirma ninguna baja como realizada sin respuesta real del backend
  // (response.ok && data.ok !== false) — mismo criterio defensivo que Alta.
  // Si el Worker responde 503 "Baja webhook not configured" (webhook Make
  // todavía sin configurar, ver worker-reservas/src/index.js
  // handleBajaJugador), se traduce a un mensaje honesto para STAFF/ADMIN en
  // vez del texto técnico crudo.
  async function submitBaja(event) {
    event.preventDefault();

    const nextErrors = validateBaja();
    setBajaErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setBajaSending(true);
    setBajaServerError("");
    setBajaSuccess(false);

    try {
      const response = await authFetch("/api/jugadores/baja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: bajaForm.nombre.trim(),
          apellidos: bajaForm.apellidos.trim(),
          email: bajaForm.email.trim().toLowerCase(),
          telefono: bajaForm.telefono.trim(),
          motivo_baja: bajaForm.motivo_baja,
          fecha_baja: bajaForm.fecha_baja,
          promocionar_siguiente_si_aplica: bajaForm.promocionar_siguiente_si_aplica === true,
          observaciones: bajaForm.observaciones.trim(),
          origen: "APP_CLUB_PADEL_04",
          accion: "baja_jugador",
        }),
      });

      const data = await readSafeResponse(response);

      if (!response.ok || data?.ok === false) {
        if (data?.error === "Baja webhook not configured") {
          throw new Error("La baja de jugador todavía no está configurada en el sistema. Contacta con soporte técnico.");
        }
        throw new Error(data?.message || data?.error || "No se pudo completar la baja.");
      }

      setBajaSuccess(true);
      setBajaForm(bajaInitialForm);
    } catch (error) {
      setBajaServerError(error?.message || "No se pudo completar la baja.");
    } finally {
      setBajaSending(false);
    }
  }

  function updateForm(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
    setSuccess(false);
    setServerError("");
  }

  function validate() {
    const nextErrors = {};

    if (form.nombre.trim().length < 2) {
      nextErrors.nombre = "Introduce un nombre válido.";
    }

    if (form.apellidos.trim().length < 2) {
      nextErrors.apellidos = "Introduce apellidos válidos.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Introduce un email válido.";
    }

    if (form.telefono.replace(/\D/g, "").length < 9) {
      nextErrors.telefono = "Introduce un teléfono válido.";
    }

    if (!form.fecha_nacimiento) {
      nextErrors.fecha_nacimiento = "Selecciona la fecha de nacimiento.";
    }

    if (!form.nivel) {
      nextErrors.nivel = "Selecciona el nivel.";
    }

    if (!form.genero) {
      nextErrors.genero = "Selecciona el género.";
    }

    if (!form.acepta_condiciones) {
      nextErrors.acepta_condiciones = "Debes aceptar las condiciones.";
    }

    return nextErrors;
  }

  async function submit(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    setServerError("");
    setSuccess(false);

    try {
      // Alta de jugador es operación de STAFF/ADMIN/SUPPORT: adjunta el
      // token real si existe sesión (preparado para CP04_ENFORCE_ROLE_GATES).
      // request_id: generado en el cliente para idempotencia real (si el
      // envío se reintenta con el mismo request_id, el backend/Make puede
      // reconocerlo como la misma solicitud en vez de crear un duplicado).
      const response = await authFetch("/api/jugadores/alta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          apellidos: form.apellidos.trim(),
          email: form.email.trim().toLowerCase(),
          telefono: form.telefono.trim(),
          fecha_nacimiento: form.fecha_nacimiento,
          nivel: form.nivel,
          genero: form.genero,
          comentarios: form.comentarios.trim(),
          acepta_condiciones: form.acepta_condiciones,
          origen: "app",
          request_id: crypto.randomUUID(),
        }),
      });

      const data = await readSafeResponse(response);

      if (!response.ok || data?.ok === false) {
        throw new Error(data?.message || data?.error || "No se pudo completar el alta.");
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (error) {
      setServerError(error?.message || "No se pudo completar el alta.");
    } finally {
      setSending(false);
    }
  }

  // PASO 07J (2026-07-19): el título/subtítulo de la cabecera antes quedaba
  // fijo en "Alta de jugador" aunque el usuario estuviera en la pestaña de
  // Baja (entrando desde el sidebar en "baja_jugador", o cambiando de
  // pestaña manualmente) — confusión visual detectada en validación en
  // localhost:5175. Se deriva ahora del `modo` activo, igual que ya hacían
  // los botones de pestaña. Texto de Baja en español literal (sin tx()),
  // mismo criterio ya documentado en el Paso 07C para el resto de textos
  // nuevos de esa pestaña.
  const isBajaMode = modo === "baja";
  const playerFormTitle = isBajaMode ? "Baja de jugador" : tx("alta.title");
  const playerFormSubtitle = isBajaMode
    ? "Solicita la baja de un jugador del club."
    : tx("alta.desc");

  return (
    <div style={{ padding: "42px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle eyebrow={tx("alta.eyebrow")} title={playerFormTitle} desc={playerFormSubtitle} />
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Btn type="button" variant={modo === "alta" ? "primary" : "secondary"} onClick={() => setModo("alta")}>
          Alta de jugador
        </Btn>
        <Btn type="button" variant={modo === "baja" ? "primary" : "secondary"} onClick={() => setModo("baja")}>
          Baja de jugador
        </Btn>
      </div>
      {modo === "baja" ? (
        <Card>
          <p style={{ color: T.textDim, fontSize: ".86rem", marginTop: 0, marginBottom: 18 }}>
            Solicitar baja de jugador. Esta acción no se confirmará hasta que el sistema responda correctamente.
          </p>
          <form onSubmit={submitBaja}>
            <div className="cp04-grid-2">
              <div>
                <label htmlFor="baja-nombre">Nombre</label>
                <input id="baja-nombre" value={bajaForm.nombre} onChange={e => updateBajaForm("nombre", e.target.value)} autoComplete="given-name" />
                <FieldError>{bajaErrors.nombre}</FieldError>
              </div>
              <div>
                <label htmlFor="baja-apellidos">Apellidos</label>
                <input id="baja-apellidos" value={bajaForm.apellidos} onChange={e => updateBajaForm("apellidos", e.target.value)} autoComplete="family-name" />
                <FieldError>{bajaErrors.apellidos}</FieldError>
              </div>
              <div>
                <label htmlFor="baja-email">Email</label>
                <input id="baja-email" type="email" value={bajaForm.email} onChange={e => updateBajaForm("email", e.target.value)} autoComplete="email" />
                <FieldError>{bajaErrors.email}</FieldError>
              </div>
              <div>
                <label htmlFor="baja-telefono">Teléfono</label>
                <input id="baja-telefono" type="tel" value={bajaForm.telefono} onChange={e => updateBajaForm("telefono", e.target.value)} autoComplete="tel" />
                <FieldError>{bajaErrors.telefono}</FieldError>
              </div>
              <div>
                <label htmlFor="baja-motivo">Motivo de la baja</label>
                <select id="baja-motivo" value={bajaForm.motivo_baja} onChange={e => updateBajaForm("motivo_baja", e.target.value)}>
                  <option value="">Seleccionar…</option>
                  <option value="Voluntaria">Voluntaria</option>
                  <option value="Impago">Impago</option>
                  <option value="Inactividad">Inactividad</option>
                  <option value="Traslado a otro club">Traslado a otro club</option>
                  <option value="Otro">Otro</option>
                </select>
                <FieldError>{bajaErrors.motivo_baja}</FieldError>
              </div>
              <div>
                <label htmlFor="baja-fecha">Fecha de baja</label>
                <input id="baja-fecha" type="date" value={bajaForm.fecha_baja} onChange={e => updateBajaForm("fecha_baja", e.target.value)} />
                <FieldError>{bajaErrors.fecha_baja}</FieldError>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <label htmlFor="baja-observaciones">Observaciones (opcional)</label>
              <textarea id="baja-observaciones" value={bajaForm.observaciones} onChange={e => updateBajaForm("observaciones", e.target.value)} rows={4} />
            </div>
            <label style={{ display:"flex", gap:10, alignItems:"flex-start", marginTop:18 }}>
              <input type="checkbox" checked={bajaForm.promocionar_siguiente_si_aplica} onChange={e => updateBajaForm("promocionar_siguiente_si_aplica", e.target.checked)} />
              <span>Promocionar al siguiente jugador en lista de espera, si aplica.</span>
            </label>
            {/* PASO 07N (2026-07-20): nota informativa hacia el nuevo módulo
                "Lista de espera" del sidebar — no cambia el payload de Baja
                ni la lógica del checkbox, solo orienta a STAFF/ADMIN/SUPPORT
                sobre dónde se gestionará la promoción cuando exista
                integración real. */}
            <p style={{ color:T.textDim, fontSize:".8rem", marginTop:8, marginBottom:0 }}>
              La promoción se gestionará desde "Lista de espera" cuando la integración real esté disponible.
            </p>
            {bajaServerError && <p style={{ color:T.danger, marginTop:16 }}>{bajaServerError}</p>}
            {bajaSuccess && <p style={{ color:T.accent, marginTop:16 }}>Baja registrada correctamente.</p>}
            <div style={{ marginTop:22 }}>
              {/* PASO 07J/07K/07L/07M (2026-07-19): refuerzo de contraste +
                  clase dedicada `cp04-offboarding-submit-button` con CSS de
                  máxima especificidad (ver cp04-legibility-polish.css) como
                  red de seguridad definitiva — este botón ya fue capturado
                  por 3 orígenes distintos de reglas globales "catch-all"
                  (`button` genérico en 07H/07K, `.cp04-card
                  [style*="background"]` en 07L, su variante
                  `cp04-module-admin` en 07M, esta última específica de
                  SUPPORT por tener "Centro técnico" siempre en su
                  sidebar). Sin cambios en la lógica de envío ni en el
                  componente Btn compartido más allá de aceptar
                  `className` opcional. */}
              <Btn
                type="submit"
                disabled={bajaSending}
                className="cp04-offboarding-submit-button"
                style={{
                  width: "100%",
                  background: T.accent,
                  color: "#06100a",
                  fontSize: "1rem",
                  border: "2px solid rgba(6,16,10,.45)",
                  boxShadow: "0 16px 36px rgba(182,255,0,.32), 0 0 0 1px rgba(6,16,10,.45)",
                }}
              >
                {bajaSending ? "Enviando…" : "Solicitar baja de jugador"}
              </Btn>
            </div>
          </form>
        </Card>
      ) : (
      <Card>
        <form onSubmit={submit}>
          <div className="cp04-grid-2">
            <div>
              <label htmlFor="alta-nombre">{tx("alta.nombre")}</label>
              <input id="alta-nombre" value={form.nombre} onChange={e => updateForm("nombre", e.target.value)} autoComplete="given-name" />
              <FieldError>{errors.nombre}</FieldError>
            </div>
            <div>
              <label htmlFor="alta-apellidos">{tx("alta.apellidos")}</label>
              <input id="alta-apellidos" value={form.apellidos} onChange={e => updateForm("apellidos", e.target.value)} autoComplete="family-name" />
              <FieldError>{errors.apellidos}</FieldError>
            </div>
            <div>
              <label htmlFor="alta-email">{tx("alta.email")}</label>
              <input id="alta-email" type="email" value={form.email} onChange={e => updateForm("email", e.target.value)} autoComplete="email" />
              <FieldError>{errors.email}</FieldError>
            </div>
            <div>
              <label htmlFor="alta-telefono">{tx("alta.telefono")}</label>
              <input id="alta-telefono" type="tel" value={form.telefono} onChange={e => updateForm("telefono", e.target.value)} autoComplete="tel" />
              <FieldError>{errors.telefono}</FieldError>
            </div>
            <div>
              <label htmlFor="alta-fecha-nac">{tx("alta.fecha_nac")}</label>
              <input id="alta-fecha-nac" type="date" value={form.fecha_nacimiento} onChange={e => updateForm("fecha_nacimiento", e.target.value)} />
              <FieldError>{errors.fecha_nacimiento}</FieldError>
            </div>
            <div>
              <label htmlFor="alta-nivel">{tx("alta.nivel")}</label>
              <select id="alta-nivel" value={form.nivel} onChange={e => updateForm("nivel", e.target.value)}>
                <option value="">{tx("alta.seleccionar")}</option>
                <option value="Iniciación">Iniciación</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
                <option value="Competición">Competición</option>
              </select>
              <FieldError>{errors.nivel}</FieldError>
            </div>
            <div>
              <label htmlFor="alta-genero">{tx("alta.genero")}</label>
              <select id="alta-genero" value={form.genero} onChange={e => updateForm("genero", e.target.value)}>
                <option value="">{tx("alta.seleccionar")}</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no indicarlo">Prefiero no indicarlo</option>
              </select>
              <FieldError>{errors.genero}</FieldError>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <label htmlFor="alta-comentarios">{tx("alta.comentarios")}</label>
            <textarea id="alta-comentarios" value={form.comentarios} onChange={e => updateForm("comentarios", e.target.value)} rows={4} />
          </div>
          <label style={{ display:"flex", gap:10, alignItems:"flex-start", marginTop:18 }}>
            <input type="checkbox" checked={form.acepta_condiciones} onChange={e => updateForm("acepta_condiciones", e.target.checked)} />
            <span>{tx("alta.acepta")}</span>
          </label>
          <FieldError>{errors.acepta_condiciones}</FieldError>
          {serverError && <p style={{ color:T.danger, marginTop:16 }}>{serverError}</p>}
          {success && <p style={{ color:T.accent, marginTop:16 }}>{tx("alta.exito")}</p>}
          <div style={{ marginTop:22 }}>
            <Btn type="submit" disabled={sending} className="cp04-fix-white-action-btn cp04-fix-dar-alta-btn">{sending ? tx("alta.registrando") : tx("alta.btn")}</Btn>
          </div>
        </form>
      </Card>
      )}
    </div>
  );
}



const TORNEO_DEMO_NAMES = [
  ["Alejandro Ruiz", "Marcos Pérez"],
  ["Javier Molina", "Álvaro Sánchez"],
  ["David Romero", "Pablo Martín"],
  ["Sergio García", "Daniel Torres"],
  ["Carlos Navarro", "Hugo Fernández"],
  ["Miguel López", "Raúl Jiménez"],
  ["Antonio Moreno", "Iván Castillo"],
  ["Fran Gómez", "Mario Ortega"],
  ["Adrián Vega", "Nico Ramos"],
  ["Lucas Medina", "Diego Santos"],
  ["Álvaro Domínguez", "Jaime Herrera"],
  ["Pablo Cruz", "Rubén León"],
  ["Manuel Prieto", "Óscar Gil"],
  ["José Márquez", "Víctor Cano"],
  ["Samuel Nieto", "Héctor Ríos"],
  ["Bruno Serrano", "Leo Fuentes"],
];

const TORNEO_STORE = "cp04_torneo_v2";
const TORNEO_HIST_STORE = "cp04_torneo_hist_v2";
const FORMAT_MAX = { "16": 8, "32": 16, "64": 32 };
const MATCH_H = 78;
const BASE_GAP = 10;

// Date.now() puede repetir el mismo milisegundo entre dos clics rápidos
// (doble pulsación real u onClick disparado dos veces). Como Date.now()
// se usaba directamente como id de pareja y como key de React en el
// historial, esa colisión duplicaba ids/keys en lugar de crear dos
// entradas distintas. Un contador incremental por módulo garantiza
// unicidad aunque el reloj no avance entre dos llamadas.
let torneoIdSeq = 0;
function torneoUid(prefix) {
  torneoIdSeq += 1;
  return `${prefix}${Date.now()}_${torneoIdSeq}`;
}

function torneoLoadSaved() {
  try {
    const raw = JSON.parse(localStorage.getItem(TORNEO_STORE) || "null");
    if (!raw || typeof raw !== "object") return null;
    const rawPairs = Array.isArray(raw.pairs) ? raw.pairs : [];
    const rawBracket = Array.isArray(raw.bracket) ? raw.bracket : [];
    // If bracket items lack 'round' (old format), discard bracket to avoid crash
    const bracketOk = rawBracket.length === 0 || rawBracket.every(m => typeof m.round === "number");
    const rawRrMatches = Array.isArray(raw.rrMatches) ? raw.rrMatches : [];
    const rrMatchesOk = rawRrMatches.length === 0 || rawRrMatches.every(m => typeof m.round === "number");
    return { ...raw, pairs: rawPairs, bracket: bracketOk ? rawBracket : [], rrMatches: rrMatchesOk ? rawRrMatches : [] };
  } catch { return null; }
}

function torneoLoadHist() {
  try {
    const raw = JSON.parse(localStorage.getItem(TORNEO_HIST_STORE) || "null");
    if (raw && Array.isArray(raw.snaps) && typeof raw.idx === "number") return raw;
    return { snaps: [], idx: -1 };
  } catch { return { snaps: [], idx: -1 }; }
}

function torneoBuildEmptyPairs(count) {
  const ts = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `p${ts}_${i}`,
    player1: "",
    player2: "",
  }));
}

function torneoBuildFullBracket(pairs, byeId) {
  const active = byeId ? pairs.filter(p => p.id !== byeId) : pairs;
  const r1 = [];
  for (let i = 0; i < active.length; i += 2) {
    r1.push({ id: `r1m${Math.floor(i / 2)}`, round: 1, pos: Math.floor(i / 2), pairA: active[i]?.id ?? null, pairB: active[i + 1]?.id ?? null, winner: null, isBye: false });
  }
  if (byeId) {
    r1.push({ id: `byem_${byeId}`, round: 1, pos: r1.length, pairA: byeId, pairB: null, winner: byeId, isBye: true });
  }
  const all = [...r1];
  let prevCount = r1.length;
  let round = 2;
  while (prevCount > 1) {
    const thisCount = Math.ceil(prevCount / 2);
    for (let i = 0; i < thisCount; i++) {
      all.push({ id: `r${round}m${i}`, round, pos: i, pairA: null, pairB: null, winner: null, isBye: false });
    }
    prevCount = thisCount;
    round++;
  }
  r1.forEach(m => {
    if (!m.isBye || !m.winner) return;
    const nPos = Math.floor(m.pos / 2);
    const isTop = m.pos % 2 === 0;
    const next = all.find(x => x.round === 2 && x.pos === nPos);
    if (next) { if (isTop) { next.pairA = m.winner; } else { next.pairB = m.winner; } }
  });
  return all;
}

function torneoGetRoundLabel(rNum, total) {
  const fromEnd = total - rNum;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinal";
  if (fromEnd === 2) return "Cuartos de final";
  if (fromEnd === 3) return "Octavos de final";
  if (fromEnd === 4) return "R32";
  return `Ronda ${rNum}`;
}

function torneoAdvanceWinner(bracket, matchId, winnerId) {
  const match = bracket.find(m => m.id === matchId);
  if (!match) return bracket;
  const nextR = match.round + 1;
  const nextPos = Math.floor(match.pos / 2);
  const isTop = match.pos % 2 === 0;
  return bracket.map(m => {
    if (m.id === matchId) return { ...m, winner: winnerId };
    if (m.round === nextR && m.pos === nextPos) return isTop ? { ...m, pairA: winnerId } : { ...m, pairB: winnerId };
    return m;
  });
}

function torneoGetMatchGap(round) {
  return Math.pow(2, round - 1) * (MATCH_H + BASE_GAP) - MATCH_H;
}

function torneoGetRoundPadding(round) {
  return (Math.pow(2, round - 1) - 1) * (MATCH_H + BASE_GAP) / 2;
}

function Torneos({ selectedRole } = {}) {
  const lang = useLang();
  const tx = key => t(key, lang);
  // Hallazgo prioritario del Prompt 7: los 4 roles con acceso al módulo
  // "torneos" veían y podían ejecutar los mismos controles de gestión. La
  // gestión (crear/editar/eliminar/reordenar/autoasignar/publicar/marcar
  // ganador/exportar/deshacer) queda reservada a quien tenga el permiso de
  // acción "tournaments:manage" (ver src/utils/permissions.js); ver el
  // cuadro, las parejas y la clasificación sigue disponible para todos los
  // roles que ya podían abrir este módulo — eso no cambia.
  const canManage = cp04Can(selectedRole, "tournaments:manage");
  const [hist, setHist] = useState(() => torneoLoadHist());

  const saved = torneoLoadSaved();
  const [formatMode, setFormatMode] = useState(saved?.formatMode ?? "32");
  const [customMode, setCustomMode] = useState(saved?.customMode ?? "pairs");
  const [customInput, setCustomInput] = useState(saved?.customInput ?? "");
  const [customError, setCustomError] = useState("");
  const [pairs, setPairs] = useState(() => saved?.pairs ?? []);
  const [bracket, setBracket] = useState(() => saved?.bracket ?? []);
  const [byePair, setByePair] = useState(() => saved?.byePair ?? null);
  const [byeDrawDate, setByeDrawDate] = useState(() => saved?.byeDrawDate ?? null);
  const [published, setPublished] = useState(() => saved?.published ?? false);
  // Round Robin (liga: todos contra todos) — motor puro en
  // src/utils/roundRobin.js. rrMatches es independiente del `bracket` de
  // eliminación directa: solo se usa cuando formatMode === "roundrobin".
  const [rrMatches, setRrMatches] = useState(() => saved?.rrMatches ?? []);
  const [rrScoreDraft, setRrScoreDraft] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ p1: "", p2: "" });
  const [deleteId, setDeleteId] = useState(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeErr, setNoticeErr] = useState(false);
  const [winnerAnim, setWinnerAnim] = useState(null);

  const isRoundRobin = formatMode === "roundrobin";
  const currentMax = formatMode !== "custom" && !isRoundRobin ? FORMAT_MAX[formatMode] : null;

  const torneoSnapshot = JSON.stringify({
    formatMode, customMode, customInput, pairs, bracket, byePair, byeDrawDate, published, rrMatches,
  });

  useEffect(() => {
    localStorage.setItem(TORNEO_STORE, torneoSnapshot);
  }, [torneoSnapshot]);

  // savedAt es puramente informativo para el indicador "Guardado HH:MM:SS".
  // Se ajusta durante el render (patrón "Storing information from previous
  // renders" de React: https://react.dev/reference/react/useState#storing-information-from-previous-renders),
  // no dentro de un efecto: evita el setState síncrono en efecto sin
  // necesitar un segundo render encadenado ni dependencias artificiales.
  const [prevTorneoSnapshot, setPrevTorneoSnapshot] = useState(torneoSnapshot);
  const [savedAt, setSavedAt] = useState(() => new Date());
  if (torneoSnapshot !== prevTorneoSnapshot) {
    setPrevTorneoSnapshot(torneoSnapshot);
    setSavedAt(new Date());
  }

  const showNotice = (msg, err = false) => {
    setNotice(msg); setNoticeErr(err);
    setTimeout(() => setNotice(""), 4500);
  };

  const pairLabel = (p) => {
    if (!p) return "—";
    if (p.player1 || p.player2) return `${p.player1 || "—"} / ${p.player2 || "—"}`;
    return "Vacía";
  };

  const pushHistory = (action) => {
    try {
      const snap = {
        id: torneoUid("h"),
        ts: new Date().toISOString(),
        action,
        s: { formatMode, customMode, customInput, pairs, bracket, byePair, byeDrawDate, published, rrMatches },
      };
      const snaps = Array.isArray(hist.snaps) ? hist.snaps : [];
      const idx = typeof hist.idx === "number" ? hist.idx : -1;
      const newSnaps = [...snaps.slice(0, idx + 1), snap].slice(-30);
      const newHist = { snaps: newSnaps, idx: newSnaps.length - 1 };
      localStorage.setItem(TORNEO_HIST_STORE, JSON.stringify(newHist));
      setHist(newHist);
    } catch { /* silent */ }
  };

  const restoreSnap = (snap) => {
    if (!snap?.s) return;
    const s = snap.s;
    setFormatMode(s.formatMode ?? "32");
    setCustomMode(s.customMode ?? "pairs");
    setCustomInput(s.customInput ?? "");
    setPairs(Array.isArray(s.pairs) ? s.pairs : []);
    setBracket(Array.isArray(s.bracket) ? s.bracket : []);
    setByePair(s.byePair ?? null);
    setByeDrawDate(s.byeDrawDate ?? null);
    setPublished(s.published ?? false);
    setRrMatches(Array.isArray(s.rrMatches) ? s.rrMatches : []);
  };

  const handleUndo = () => {
    if (!canManage) return;
    const h = hist;
    if (h.idx <= 0) return;
    const ni = h.idx - 1;
    const newHist = { ...h, idx: ni };
    localStorage.setItem(TORNEO_HIST_STORE, JSON.stringify(newHist));
    restoreSnap(h.snaps[ni]);
    setHist(newHist);
    showNotice(`↩ Deshecho: ${h.snaps[ni].action}`);
  };

  const handleRedo = () => {
    if (!canManage) return;
    const h = hist;
    if (h.idx >= h.snaps.length - 1) return;
    const ni = h.idx + 1;
    const newHist = { ...h, idx: ni };
    localStorage.setItem(TORNEO_HIST_STORE, JSON.stringify(newHist));
    restoreSnap(h.snaps[ni]);
    setHist(newHist);
    showNotice(`↪ Rehecho: ${h.snaps[ni].action}`);
  };

  const handleRestoreVersion = (idx) => {
    if (!canManage) return;
    const h = hist;
    const snap = h.snaps[idx];
    if (!snap) return;
    const newHist = { ...h, idx };
    localStorage.setItem(TORNEO_HIST_STORE, JSON.stringify(newHist));
    restoreSnap(snap);
    setHist(newHist);
    setShowHistory(false);
    showNotice(`Versión restaurada: ${snap.action}`);
  };

  const applyFormat = (fmt) => {
    if (!canManage) return;
    pushHistory(`Cambio de formato → ${fmt}`);
    setFormatMode(fmt); setCustomError(""); setRrMatches([]); setRrScoreDraft({});
    if (fmt !== "custom" && fmt !== "roundrobin") {
      const c = FORMAT_MAX[fmt]; const np = torneoBuildEmptyPairs(c);
      setPairs(np); setBracket([]); setByePair(null); setByeDrawDate(null); setPublished(false);
    } else {
      // "custom" y "roundrobin" comparten el mismo panel de configuración
      // por número de jugadores/parejas (ver abajo): al cambiar a
      // cualquiera de los dos se limpian las parejas hasta que se
      // confirme un número con applyCustom().
      setPairs([]); setBracket([]); setByePair(null); setByeDrawDate(null); setPublished(false);
    }
  };

  const applyCustom = () => {
    if (!canManage) return;
    const raw = parseInt(customInput, 10);
    if (isNaN(raw) || raw < 1) { setCustomError("Introduce un número válido."); return; }
    let pc;
    if (customMode === "players") {
      if (raw < 2) { setCustomError("Mínimo 2 jugadores."); return; }
      if (raw % 2 !== 0) { setCustomError("El número de jugadores debe ser par."); return; }
      if (raw > 64) { setCustomError("Máximo 64 jugadores."); return; }
      pc = raw / 2;
    } else {
      if (raw < 1) { setCustomError("Mínimo 1 pareja."); return; }
      if (raw > 32) { setCustomError("Máximo 32 parejas."); return; }
      pc = raw;
    }
    setCustomError("");
    pushHistory(isRoundRobin ? `Round Robin: ${pc} parejas` : `Personalizado: ${pc} parejas`);
    const np = torneoBuildEmptyPairs(pc);
    setPairs(np); setBracket([]); setByePair(null); setByeDrawDate(null); setPublished(false); setRrMatches([]); setRrScoreDraft({});
    showNotice(`Torneo configurado: ${pc} pareja${pc !== 1 ? "s" : ""}.`);
  };

  const handleGenerateRoundRobin = () => {
    if (!canManage) return;
    if (pairs.length < 2) {
      showNotice("Se necesitan al menos 2 parejas para generar el calendario de Round Robin.", true);
      return;
    }
    const hadResults = rrMatches.some(m => m.played);
    pushHistory("Generar calendario Round Robin");
    const matches = buildRoundRobinMatches(pairs);
    setRrMatches(matches);
    setRrScoreDraft({});
    const totalRounds = getRoundRobinTotalRounds(matches);
    const warn = hadResults ? " Los resultados anteriores se han reiniciado." : "";
    showNotice(`📅 Calendario generado: ${matches.length} partido${matches.length !== 1 ? "s" : ""} en ${totalRounds} jornada${totalRounds !== 1 ? "s" : ""}.${warn}`, hadResults);
  };

  const handleRoundRobinScoreChange = (matchId, side, value) => {
    setRrScoreDraft(d => ({ ...d, [matchId]: { ...d[matchId], [side]: value } }));
  };

  const handleRoundRobinSaveResult = (match) => {
    if (!canManage) return;
    const draft = rrScoreDraft[match.id] || {};
    const scoreA = parseInt(draft.a ?? match.scoreA, 10);
    const scoreB = parseInt(draft.b ?? match.scoreB, 10);
    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      showNotice("Introduce un resultado válido (números enteros no negativos) para ambas parejas.", true);
      return;
    }
    if (scoreA === scoreB) {
      showNotice("El resultado no puede ser un empate: el pádel no tiene empates, indica quién ganó.", true);
      return;
    }
    const res = applyRoundRobinResult(rrMatches, match.id, scoreA, scoreB);
    if (!res.ok) {
      showNotice("No se ha podido guardar el resultado.", true);
      return;
    }
    pushHistory(match.played ? "Corregir resultado Round Robin" : "Registrar resultado Round Robin");
    setRrMatches(res.matches);
    showNotice("✅ Resultado guardado. Clasificación actualizada.");
  };

  const handleReorder = () => {
    if (!canManage) return;
    pushHistory("Reordenar cruces");
    const shuffled = [...pairs].sort(() => Math.random() - 0.5);
    let newBye = null; let newByeDate = null;
    if (shuffled.length % 2 !== 0) {
      const idx = Math.floor(Math.random() * shuffled.length);
      newBye = shuffled[idx]; newByeDate = new Date().toISOString();
    }
    const nb = torneoBuildFullBracket(shuffled, newBye ? newBye.id : null);
    setPairs(shuffled); setBracket(nb); setByePair(newBye); setByeDrawDate(newByeDate);
    if (newBye) showNotice(`🎯 Sorteo: "${pairLabel(newBye)}" pasa directamente (BYE) al haber número impar de parejas.`);
    else showNotice("✅ Cruces generados. Bracket listo para jugar.");
  };

  const handleAutoAssign = () => {
    if (!canManage) return;
    pushHistory("Autoasignar nombres");
    const updated = pairs.map((p, i) => {
      if (p.player1 && p.player2) return p;
      const d = TORNEO_DEMO_NAMES[i % TORNEO_DEMO_NAMES.length];
      return { ...p, player1: d[0], player2: d[1] };
    });
    setPairs(updated);
    showNotice("Parejas rellenadas con nombres de ejemplo.");
  };

  const handleSave = () => {
    if (!canManage) return;
    pushHistory("Guardar cuadro");
    showNotice("💾 Cuadro guardado en este dispositivo.");
  };

  const handlePublish = () => {
    if (!canManage) return;
    const next = !published;
    pushHistory(next ? "Publicar torneo" : "Despublicar torneo");
    setPublished(next);
    showNotice(next ? "📢 Torneo publicado." : "📝 Torneo vuelto a borrador.");
  };

  const handleAddPair = () => {
    if (!canManage) return;
    if (currentMax && pairs.length >= currentMax) { showNotice(`Límite alcanzado: ya hay ${currentMax} parejas.`, true); return; }
    if (pairs.length >= 32) { showNotice("Límite: máximo 32 parejas.", true); return; }
    pushHistory("Añadir pareja");
    const np = { id: torneoUid("p"), player1: "", player2: "" };
    const upd = [...pairs, np];
    setPairs(upd);
    if (upd.length % 2 === 0 && byePair) { setByePair(null); setByeDrawDate(null); }
  };

  const handleDeletePair = (id) => {
    if (!canManage) return;
    pushHistory("Eliminar pareja");
    const deleted = pairs.find(p => p.id === id);
    const upd = pairs.filter(p => p.id !== id);
    let nb = byePair; let nd = byeDrawDate;
    if (byePair?.id === id || (byePair && upd.length % 2 === 0)) { nb = null; nd = null; }
    // Cualquier partido donde la pareja eliminada figure como pairA/pairB
    // se retira del cuadro (incluye las rondas posteriores a las que ya
    // hubiera avanzado como ganadora): dejar ese partido a medias
    // mostraría un "ganador" que ya no existe en `pairs`.
    const affectsBracket = bracket.some(m => (m.pairA === id || m.pairB === id) && (m.winner || m.round > 1));
    const newBrk = bracket.filter(m => m.pairA !== id && m.pairB !== id);
    // Round Robin: cualquier partido de la pareja eliminada se retira del
    // calendario (misma razón que en el bracket de eliminación — no tiene
    // sentido conservar un partido jugado contra una pareja que ya no
    // existe en `pairs`).
    const affectsRoundRobin = rrMatches.some(m => (m.pairA === id || m.pairB === id) && m.played);
    const newRrMatches = rrMatches.filter(m => m.pairA !== id && m.pairB !== id);
    setPairs(upd); setBracket(newBrk); setByePair(nb); setByeDrawDate(nd); setDeleteId(null); setRrMatches(newRrMatches);
    if (affectsBracket) {
      showNotice(`⚠️ "${pairLabel(deleted)}" tenía resultados en el cuadro: se han invalidado los partidos y rondas posteriores que dependían de ella.`, true);
    } else if (affectsRoundRobin) {
      showNotice(`⚠️ "${pairLabel(deleted)}" tenía resultados en el calendario de Round Robin: sus partidos se han retirado de la clasificación.`, true);
    }
  };

  const handleEditSave = () => {
    if (!canManage) return;
    pushHistory("Editar pareja");
    const upd = pairs.map(p => p.id === editingId ? { ...p, player1: editForm.p1, player2: editForm.p2 } : p);
    setPairs(upd); setEditingId(null);
    showNotice("Pareja actualizada.");
  };

  const handleMarkWinner = (matchId, winnerId) => {
    if (!canManage) return;
    pushHistory("Marcar ganador");
    const nb = torneoAdvanceWinner(bracket, matchId, winnerId);
    setBracket(nb);
    const w = pairs.find(p => p.id === winnerId);
    if (w) {
      setWinnerAnim(matchId);
      setTimeout(() => setWinnerAnim(null), 1400);
      showNotice(`🏆 ${pairLabel(w)} avanza a la siguiente ronda.`);
    }
  };

  const handleExportJSON = () => {
    if (!canManage) return;
    // Date.now() aquí es seguro: solo se ejecuta dentro de este manejador de
    // clic (nunca durante el render), exactamente el mismo patrón ya usado
    // sin incidentes en handleExportCSV más abajo. El análisis estático del
    // compilador de React solo llega a marcarlo aquí porque, al añadir más
    // código a este componente (Round Robin), progresa más a fondo en su
    // intento de auto-memoizar Torneos; no es un problema real de pureza en
    // ejecución — un timestamp para el nombre del fichero exportado no
    // afecta al resultado del render.
    // eslint-disable-next-line react-hooks/purity
    const exportTs = Date.now();
    const data = {
      nombreTorneo: `Torneo Club Pádel 04 · ${pairs.length} parejas`,
      numJugadores: pairs.length * 2, numParejas: pairs.length, formato: formatMode,
      parejas: pairs.map(p => ({ jugador1: p.player1, jugador2: p.player2 })),
      ranking: isRoundRobin
        ? rrStandingsSorted.map((s, i) => {
            const pair = pairs.find(p => p.id === s.pairId);
            return { pos: i + 1, jugador1: pair?.player1 ?? "", jugador2: pair?.player2 ?? "", jugados: s.played, ganados: s.won, perdidos: s.lost, favor: s.scoreFor, contra: s.scoreAgainst, diferencia: s.diff, puntos: s.points };
          })
        : pairs.map((p, i) => ({ pos: i + 1, jugador1: p.player1, jugador2: p.player2 })),
      bracket: isRoundRobin ? [] : bracket.map(m => {
        const pA = pairs.find(p => p.id === m.pairA);
        const pB = m.pairB ? pairs.find(p => p.id === m.pairB) : null;
        const pW = m.winner ? pairs.find(p => p.id === m.winner) : null;
        return { ronda: m.round, parejaA: pA ? pairLabel(pA) : "—", parejaB: pB ? pairLabel(pB) : "BYE", ganador: pW ? pairLabel(pW) : "—", esBye: m.isBye };
      }),
      calendarioRoundRobin: isRoundRobin ? rrMatches.map(m => {
        const pA = pairs.find(p => p.id === m.pairA);
        const pB = pairs.find(p => p.id === m.pairB);
        return { jornada: m.round, parejaA: pA ? pairLabel(pA) : "—", parejaB: pB ? pairLabel(pB) : "—", resultado: m.played ? `${m.scoreA}-${m.scoreB}` : null };
      }) : [],
      campeonRoundRobin: isRoundRobin && rrChampion ? pairLabel(rrChampion) : null,
      parejaPaseDirecto: byePair ? pairLabel(byePair) : null,
      fechaSorteo: byeDrawDate,
      estadoTorneo: published ? "Publicado" : "En curso",
      fechaExportacion: new Date(exportTs).toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `torneo-cp04-${exportTs}.json`; a.click();
    URL.revokeObjectURL(url);
    showNotice("⬇ JSON descargado correctamente.");
  };

  const handleExportCSV = () => {
    if (!canManage) return;
    const lines = ["#,Jugador 1,Jugador 2"];
    pairs.forEach((p, i) => lines.push(`${i + 1},"${p.player1 || ""}","${p.player2 || ""}"`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `parejas-cp04-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showNotice("⬇ CSV de parejas descargado.");
  };

  const bracketByRound = {};
  bracket.forEach(m => { if (!bracketByRound[m.round]) bracketByRound[m.round] = []; bracketByRound[m.round].push(m); });
  const roundNums = Object.keys(bracketByRound).map(Number).sort((a, b) => a - b);
  const totalRounds = roundNums.length;
  const canUndo = hist.idx > 0;
  const canRedo = hist.idx < (hist.snaps?.length ?? 0) - 1;

  // Round Robin: clasificación derivada de pairs+rrMatches (motor puro en
  // src/utils/roundRobin.js). Recalcula solo cuando cambia alguna de las
  // dos, no en cada render.
  // Derivación simple durante el render, igual que bracketByRound/roundNums
  // más abajo: el volumen de datos (máx. ~32 parejas) hace innecesaria
  // cualquier memoización.
  const rrStandingsSorted = isRoundRobin
    ? sortRoundRobinStandings(computeRoundRobinStandings(pairs, rrMatches), rrMatches)
    : [];
  const rrByRound = {};
  rrMatches.forEach(m => { if (!rrByRound[m.round]) rrByRound[m.round] = []; rrByRound[m.round].push(m); });
  const rrRoundNums = Object.keys(rrByRound).map(Number).sort((a, b) => a - b);
  const rrComplete = isRoundRobin && isRoundRobinComplete(rrMatches);
  const rrChampion = isRoundRobin ? getRoundRobinChampion(pairs, rrMatches) : null;

  return (
    <div style={{ padding: "42px 24px", maxWidth: 1240, margin: "0 auto" }}>
      <style>{`
        @keyframes cp04WinPulse { 0%{box-shadow:0 0 0 0 rgba(182,255,0,.65)} 60%{box-shadow:0 0 0 14px rgba(182,255,0,0)} 100%{box-shadow:0 0 0 0 rgba(182,255,0,0)} }
        @keyframes cp04SlideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cp04FadeOut { from{opacity:1} to{opacity:0} }
        .cp04-win-anim { animation: cp04WinPulse 1.1s ease !important; }
        .cp04-slide-notice { animation: cp04SlideIn .22s ease; }
        .cp04-brk-match { transition: border-color .3s, background .3s, opacity .3s; }
        .cp04-brk-match:hover { border-color: rgba(182,255,0,.28) !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 18, marginBottom: 30 }}>
        <div>
          <div style={{ color:T.accent, fontSize:".72rem", fontWeight:900, letterSpacing:".2em", textTransform:"uppercase", marginBottom:8 }}>{tx("torneos.title")}</div>
          <h1 style={{ fontFamily:T.fontDisplay, fontSize:"clamp(1.9rem,3.8vw,3rem)", lineHeight:.92, margin:"0 0 8px", letterSpacing:"-.04em" }}>
            {tx("torneos.bracket").split(" ").slice(0,-1).join(" ")} <span style={{ color:T.accent }}>{tx("torneos.bracket").split(" ").slice(-1)}</span>
          </h1>
          <p style={{ color: T.textDim, margin: 0, fontSize: ".9rem" }}>Torneos por jugadores o parejas · Pares e impares · Exportación real</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          {published && (
            <span style={{ background: "linear-gradient(135deg,#b6ff00,#2df5a3)", color: "#061000", fontWeight: 900, padding: "6px 14px", borderRadius: 999, fontSize: ".8rem" }}>✅ Publicado</span>
          )}
          {canManage && (
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={handleUndo} disabled={!canUndo} title="Deshacer (Ctrl+Z)"
              style={{ border: `1px solid ${canUndo ? "rgba(182,255,0,.35)" : "rgba(255,255,255,.1)"}`, background: "none", color: canUndo ? "#b6ff00" : "rgba(255,255,255,.25)", borderRadius: 10, padding: "6px 12px", cursor: canUndo ? "pointer" : "default", fontWeight: 700, fontSize: ".8rem" }}>
              ↩ Deshacer
            </button>
            <button type="button" onClick={handleRedo} disabled={!canRedo} title="Rehacer"
              style={{ border: `1px solid ${canRedo ? "rgba(182,255,0,.35)" : "rgba(255,255,255,.1)"}`, background: "none", color: canRedo ? "#b6ff00" : "rgba(255,255,255,.25)", borderRadius: 10, padding: "6px 12px", cursor: canRedo ? "pointer" : "default", fontWeight: 700, fontSize: ".8rem" }}>
              ↪ Rehacer
            </button>
          </div>
          )}
          {savedAt && canManage && (
            <span style={{ color: "rgba(255,255,255,.38)", fontSize: ".7rem" }}>💾 Guardado {savedAt.toLocaleTimeString("es-ES")}</span>
          )}
        </div>
      </div>

      {/* NOTICE */}
      {notice && (
        <div className="cp04-slide-notice" style={{ background: noticeErr ? "rgba(255,60,60,.12)" : "rgba(182,255,0,.09)", border: `1px solid ${noticeErr ? "rgba(255,80,80,.5)" : "rgba(182,255,0,.4)"}`, borderRadius: 14, padding: "11px 18px", marginBottom: 20, color: noticeErr ? T.dangerText : "#b6ff00", fontWeight: 700, fontSize: ".9rem" }}>
          {notice}
        </div>
      )}

      {/* SOLO LECTURA: aviso para roles sin permiso de gestión (todos salvo ADMIN) */}
      {!canManage && (
        <div style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${T.line}`, borderRadius: 14, padding: "11px 16px", marginBottom: 20, color: T.textDim, fontSize: ".86rem" }}>
          👁 Estás viendo este torneo en modo solo lectura. Crear, editar, reordenar, publicar y marcar resultados está reservado a Administración.
        </div>
      )}

      {/* FORMAT SELECTOR */}
      {canManage && (
      <div style={{ marginBottom: 22 }}>
        <p style={{ color: T.textDim, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 10, fontWeight: 700 }}>Formato del torneo</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[{ v: "16", l: "16 jug / 8 parejas" }, { v: "32", l: "32 jug / 16 parejas" }, { v: "64", l: "64 jug / 32 parejas" }, { v: "custom", l: "⚙ Personalizado" }, { v: "roundrobin", l: "🔁 Round Robin (liga)" }].map(o => (
            <button key={o.v} type="button" className={`cp04-format-pill${formatMode === o.v ? " is-active" : ""}`} onClick={() => applyFormat(o.v)}>{o.l}</button>
          ))}
        </div>
      </div>
      )}

      {/* ROUND ROBIN EXPLICATION */}
      {isRoundRobin && (
        <Card style={{ marginBottom: 22 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: "1rem" }}>🔁 Round Robin (liga: todos contra todos)</h3>
          <p style={{ color: T.textDim, fontSize: ".85rem", lineHeight: 1.6, margin: 0 }}>
            Cada pareja juega exactamente una vez contra todas las demás. No hay eliminación: la clasificación
            final se calcula por puntos (3 por partido ganado, 0 por perdido). Con número impar de parejas, una
            pareja distinta descansa cada jornada de forma rotatoria, sin rival ficticio. Desempates, en orden:
            puntos → enfrentamiento directo (si aplica) → diferencia de puntos → puntos a favor → orden de entrada.
          </p>
        </Card>
      )}

      {/* CUSTOM FORMAT PANEL (compartido por "custom" y "roundrobin": ambos configuran el número de jugadores/parejas de la misma forma) */}
      {canManage && (formatMode === "custom" || isRoundRobin) && (
        <Card style={{ marginBottom: 22 }}>
          <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: "1rem" }}>{isRoundRobin ? "Configurar Round Robin" : "Formato personalizado"}</h3>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <p style={{ color: T.textDim, fontSize: ".8rem", marginBottom: 8, marginTop: 0 }}>Configurar por</p>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className={`cp04-format-pill${customMode === "players" ? " is-active" : ""}`} onClick={() => { setCustomMode("players"); setCustomError(""); }}>👤 Jugadores</button>
                <button type="button" className={`cp04-format-pill${customMode === "pairs" ? " is-active" : ""}`} onClick={() => { setCustomMode("pairs"); setCustomError(""); }}>🎾 Parejas</button>
              </div>
            </div>
            <div>
              <p style={{ color: T.textDim, fontSize: ".8rem", marginBottom: 8, marginTop: 0 }}>
                {customMode === "players" ? "Jugadores (par, 2–64)" : "Parejas (1–32, par o impar)"}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={customInput} onChange={e => { setCustomInput(e.target.value); setCustomError(""); }}
                  style={{ padding: "9px 13px", borderRadius: 10, border: `1px solid ${customError ? T.dangerBorder : T.line}`, background: "rgba(255,255,255,.06)", color: T.text, width: 120, outline: "none", fontSize: ".9rem" }}
                  placeholder={customMode === "players" ? "ej: 18" : "ej: 9"} />
                <button type="button" className="cp04-control-btn primary" onClick={applyCustom} style={{ width: "auto", padding: "9px 18px" }}>Aplicar</button>
              </div>
            </div>
          </div>
          {customError && <p style={{ color: T.dangerText, margin: "10px 0 0", fontSize: ".82rem", fontWeight: 700 }}>⚠️ {customError}</p>}
          <p style={{ color: T.textDim, fontSize: ".78rem", marginTop: 12, marginBottom: 0, lineHeight: 1.55 }}>
            {isRoundRobin
              ? "Jugadores: solo pares (2–64). Parejas: 1–32, par o impar. Tras configurar el número, genera el calendario con el botón «📅 Generar calendario» en Controles."
              : "Jugadores: solo pares (2–64). Parejas: 1–32, par o impar. Si el número es impar se sorteará automáticamente un pase directo (BYE)."}
          </p>
        </Card>
      )}

      {/* BYE NOTICE (solo eliminación directa: Round Robin gestiona el descanso por jornada dentro de su propio calendario, no con un BYE fijo) */}
      {byePair && !isRoundRobin && (
        <div style={{ background: "rgba(182,255,0,.07)", border: "1px solid rgba(182,255,0,.3)", borderRadius: 14, padding: "11px 16px", marginBottom: 18, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>🎯</span>
          <div>
            <strong style={{ color: T.accent, fontSize: ".9rem" }}>Pase directo sorteado</strong>
            <span style={{ color: "#fff", marginLeft: 8, fontSize: ".9rem" }}>{pairLabel(byePair)}</span>
            {byeDrawDate && <span style={{ color: T.textDim, fontSize: ".75rem", display: "block", marginTop: 3 }}>{new Date(byeDrawDate).toLocaleString("es-ES")}</span>}
          </div>
        </div>
      )}

      {/* MAIN GRID: pairs + controls */}
      <div className={canManage ? "cp04-tournament-grid" : ""}>

        {/* Pair list */}
        <div className="cp04-tournament-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>
              Parejas{" "}
              <span style={{ color: T.accent, fontSize: ".85rem", fontWeight: 700 }}>{pairs.length}{currentMax ? `/${currentMax}` : ""}</span>
            </h3>
            {canManage && (
              <button type="button" className="cp04-control-btn primary" onClick={handleAddPair} style={{ width: "auto", padding: "7px 14px", fontSize: ".85rem" }}>＋ Añadir</button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 440, overflowY: "auto", paddingRight: 2 }}>
            {pairs.length === 0 && (
              <div style={{ textAlign: "center", padding: "42px 16px", color: T.textDim }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>🎾</div>
                <p style={{ margin: 0, lineHeight: 1.6 }}>Sin parejas. Selecciona un formato<br />o configura uno personalizado.</p>
              </div>
            )}
            {pairs.map((pair, i) => (
              <div key={pair.id} style={{ borderRadius: 10, border: `1px solid ${byePair?.id === pair.id ? "rgba(182,255,0,.42)" : T.line}`, background: byePair?.id === pair.id ? "rgba(182,255,0,.04)" : "rgba(255,255,255,.025)", overflow: "hidden", transition: "border-color .2s" }}>
                {editingId === pair.id ? (
                  <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <input value={editForm.p1} onChange={e => setEditForm(f => ({ ...f, p1: e.target.value }))}
                      placeholder="Jugador 1" autoFocus
                      style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.07)", color: "#fff", outline: "none", fontSize: ".88rem" }} />
                    <input value={editForm.p2} onChange={e => setEditForm(f => ({ ...f, p2: e.target.value }))}
                      placeholder="Jugador 2" onKeyDown={e => e.key === "Enter" && handleEditSave()}
                      style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.07)", color: "#fff", outline: "none", fontSize: ".88rem" }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" onClick={handleEditSave} className="cp04-control-btn primary" style={{ width: "auto", padding: "4px 12px", fontSize: ".8rem" }}>Guardar</button>
                      <button type="button" onClick={() => setEditingId(null)} className="cp04-control-btn" style={{ width: "auto", padding: "4px 12px", fontSize: ".8rem" }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px" }}>
                    <span style={{ color: "rgba(255,255,255,.3)", minWidth: 22, fontSize: ".75rem", fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: ".87rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pair.player1 || pair.player2
                        ? <><strong style={{ color: "#fff" }}>{pair.player1 || "—"}</strong><span style={{ color: T.textDim }}> / {pair.player2 || "—"}</span></>
                        : <span style={{ color: "rgba(255,255,255,.28)", fontStyle: "italic" }}>Vacía</span>}
                      {byePair?.id === pair.id && <span style={{ marginLeft: 6, color: T.accent, fontSize: ".68rem", fontWeight: 800, background: "rgba(182,255,0,.14)", padding: "1px 6px", borderRadius: 4 }}>BYE</span>}
                    </span>
                    {canManage && (
                    <button type="button" title="Editar" onClick={() => { setEditingId(pair.id); setEditForm({ p1: pair.player1, p2: pair.player2 }); }}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,.38)", cursor: "pointer", padding: "2px 5px", fontSize: ".82rem" }}>✏️</button>
                    )}
                    {canManage && (deleteId === pair.id ? (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button type="button" onClick={() => handleDeletePair(pair.id)}
                          style={{ background: "rgba(220,50,50,.85)", border: "none", color: "#fff", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: ".75rem", fontWeight: 700 }}>Eliminar</button>
                        <button type="button" onClick={() => setDeleteId(null)}
                          style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", fontSize: ".75rem" }}>✕</button>
                      </div>
                    ) : (
                      <button type="button" title="Eliminar" onClick={() => setDeleteId(pair.id)}
                        style={{ background: "none", border: "none", color: "rgba(255,100,100,.5)", cursor: "pointer", padding: "2px 5px", fontSize: ".82rem" }}>✕</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Controls sidebar — reservado a quien tenga tournaments:manage (ver canManage) */}
        {canManage && (
        <div className="cp04-tournament-side">
          <div className="cp04-tournament-control">
            <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: ".95rem" }}>Controles</h3>
            <div className="cp04-control-list">
              {isRoundRobin
                ? <button type="button" className="cp04-control-btn" onClick={handleGenerateRoundRobin}>📅 Generar calendario</button>
                : <button type="button" className="cp04-control-btn" onClick={handleReorder}>🔀 {tx("torneos.reordenar")}</button>}
              <button type="button" className="cp04-control-btn" onClick={handleAutoAssign}>👤 {tx("torneos.autoasignar")}</button>
              <button type="button" className="cp04-control-btn" onClick={handleSave}>💾 {tx("torneos.guardar")}</button>
              <button type="button" className="cp04-control-btn primary" onClick={handlePublish}>
                {published ? `📝 ${tx("common.volver")}` : `📢 ${tx("torneos.publicar")}`}
              </button>
            </div>
          </div>

          <div className="cp04-tournament-control">
            <h3 style={{ marginTop:0, marginBottom:12, fontSize:".95rem" }}>{tx("torneos.exportar")}</h3>
            <div className="cp04-control-list">
              <button type="button" className="cp04-control-btn primary" onClick={handleExportJSON}>⬇ JSON completo</button>
              <button type="button" className="cp04-control-btn" onClick={handleExportCSV}>⬇ CSV parejas</button>
              <button type="button" className="cp04-control-btn" onClick={() => window.print()}>🖨 Imprimir / PDF</button>
            </div>
          </div>

          <div className="cp04-tournament-control">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: ".95rem" }}>Historial</h3>
              <span style={{ color: T.textDim, fontSize: ".72rem" }}>{hist.snaps.length} versión{hist.snaps.length !== 1 ? "es" : ""}</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button type="button" onClick={handleUndo} disabled={!canUndo}
                style={{ flex: 1, border: `1px solid ${canUndo ? "rgba(182,255,0,.3)" : "rgba(255,255,255,.1)"}`, background: "none", color: canUndo ? "#b6ff00" : "rgba(255,255,255,.22)", borderRadius: 10, padding: "8px 6px", cursor: canUndo ? "pointer" : "default", fontWeight: 700, fontSize: ".8rem" }}>
                ↩ Deshacer
              </button>
              <button type="button" onClick={handleRedo} disabled={!canRedo}
                style={{ flex: 1, border: `1px solid ${canRedo ? "rgba(182,255,0,.3)" : "rgba(255,255,255,.1)"}`, background: "none", color: canRedo ? "#b6ff00" : "rgba(255,255,255,.22)", borderRadius: 10, padding: "8px 6px", cursor: canRedo ? "pointer" : "default", fontWeight: 700, fontSize: ".8rem" }}>
                ↪ Rehacer
              </button>
            </div>
            {hist.idx >= 0 && <p style={{ color: T.textDim, fontSize: ".72rem", marginBottom: 8, marginTop: 0 }}>Estado actual: versión {hist.idx + 1} de {hist.snaps.length}</p>}
            <button type="button" className="cp04-control-btn" onClick={() => setShowHistory(h => !h)} style={{ fontSize: ".8rem" }}>
              {showHistory ? "▲ Ocultar historial" : "▼ Ver historial completo"}
            </button>
            {showHistory && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4, maxHeight: 210, overflowY: "auto" }}>
                {hist.snaps.length === 0 && <p style={{ color: T.textDim, fontSize: ".8rem", margin: 0 }}>Aún no hay acciones registradas.</p>}
                {[...hist.snaps].reverse().map((snap, ri) => {
                  const realIdx = hist.snaps.length - 1 - ri;
                  const isCur = realIdx === hist.idx;
                  return (
                    <div key={snap.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 8px", borderRadius: 8, background: isCur ? "rgba(182,255,0,.1)" : "rgba(255,255,255,.03)", border: `1px solid ${isCur ? "rgba(182,255,0,.3)" : "rgba(255,255,255,.07)"}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: ".75rem", color: isCur ? T.accent : "#fff", fontWeight: isCur ? 800 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snap.action}</div>
                        <div style={{ fontSize: ".66rem", color: T.textDim }}>{new Date(snap.ts).toLocaleString("es-ES")}</div>
                      </div>
                      {!isCur && (
                        <button type="button" onClick={() => handleRestoreVersion(realIdx)}
                          style={{ border: "1px solid rgba(182,255,0,.3)", background: "none", color: "#b6ff00", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontSize: ".68rem", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                          Restaurar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* BRACKET (solo eliminación directa; Round Robin usa su propia sección de calendario, más abajo) */}
      {!isRoundRobin && roundNums.length > 0 && (
        <div className="cp04-tournament-panel" style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>
            Bracket
            <span style={{ color: T.accent, fontWeight: 400, fontSize: ".82rem", marginLeft: 10 }}>{pairs.length} parejas · {totalRounds} ronda{totalRounds !== 1 ? "s" : ""}</span>
          </h3>
          <div style={{ overflowX: "auto", paddingBottom: 8 }}>
            <div style={{ display: "flex", gap: 0, minWidth: Math.max(totalRounds * 228, 460) }}>
              {roundNums.filter(n => !isNaN(n)).map(rNum => {
                const matches = bracketByRound[rNum] ?? [];
                const gapPx = torneoGetMatchGap(rNum);
                const padPx = torneoGetRoundPadding(rNum);
                const label = torneoGetRoundLabel(rNum, totalRounds);
                return (
                  <div key={rNum} style={{ flex: "0 0 220px", paddingRight: 10, paddingLeft: rNum === 1 ? 0 : 2 }}>
                    <div style={{ color: T.accent, fontWeight: 800, fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".12em", textAlign: "center", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(182,255,0,.18)" }}>
                      {label}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: gapPx, paddingTop: padPx }}>
                      {matches.map(match => {
                        const pA = pairs.find(p => p.id === match.pairA);
                        const pB = match.pairB ? pairs.find(p => p.id === match.pairB) : null;
                        const isAnim = winnerAnim === match.id;
                        const isPlayed = !!match.winner;
                        return (
                          <div key={match.id}
                            className={`cp04-brk-match${isAnim ? " cp04-win-anim" : ""}`}
                            style={{
                              background: isPlayed ? "rgba(182,255,0,.05)" : "rgba(4,9,20,.72)",
                              borderRadius: 12,
                              border: isPlayed ? "1px solid rgba(182,255,0,.35)" : "1px solid rgba(255,255,255,.1)",
                              padding: "9px 11px",
                              minHeight: MATCH_H,
                              display: "flex",
                              flexDirection: "column",
                              gap: 7,
                            }}>
                            {match.isBye ? (
                              <>
                                <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#fff", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pA ? pairLabel(pA) : "—"}</span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(182,255,0,.13)", border: "1px solid rgba(182,255,0,.28)", borderRadius: 5, padding: "2px 8px", fontSize: ".68rem", color: T.accent, fontWeight: 800, alignSelf: "flex-start" }}>✅ Pase directo · BYE</span>
                              </>
                            ) : (
                              <>
                                {/* Pair A row */}
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <span style={{ flex: 1, fontSize: ".78rem", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: match.winner === match.pairA ? 800 : 400, color: match.winner === match.pairA ? T.accent : match.winner ? "rgba(255,255,255,.32)" : "#fff", textDecoration: match.winner && match.winner !== match.pairA ? "line-through" : "none" }}>
                                    {match.winner === match.pairA && "🏆 "}{pA ? pairLabel(pA) : <em style={{ color: "rgba(255,255,255,.28)" }}>Por definir</em>}
                                  </span>
                                  {canManage && !match.winner && pA && pA.player1 && match.pairB && (
                                    <button type="button" onClick={() => handleMarkWinner(match.id, match.pairA)}
                                      style={{ background: "rgba(182,255,0,.1)", border: "1px solid rgba(182,255,0,.25)", color: T.accent, borderRadius: 5, padding: "2px 7px", cursor: "pointer", fontSize: ".66rem", fontWeight: 800, flexShrink: 0 }}>
                                      ✓A
                                    </button>
                                  )}
                                </div>
                                <div style={{ height: 1, background: "rgba(255,255,255,.07)" }} />
                                {/* Pair B row */}
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <span style={{ flex: 1, fontSize: ".78rem", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: match.winner === match.pairB ? 800 : 400, color: match.winner === match.pairB ? T.accent : match.winner ? "rgba(255,255,255,.32)" : "#fff", textDecoration: match.winner && match.winner !== match.pairB ? "line-through" : "none" }}>
                                    {match.winner === match.pairB && "🏆 "}{pB ? pairLabel(pB) : <em style={{ color: "rgba(255,255,255,.28)" }}>Por definir</em>}
                                  </span>
                                  {canManage && !match.winner && pB && pB.player1 && match.pairA && (
                                    <button type="button" onClick={() => handleMarkWinner(match.id, match.pairB)}
                                      style={{ background: "rgba(182,255,0,.1)", border: "1px solid rgba(182,255,0,.25)", color: T.accent, borderRadius: 5, padding: "2px 7px", cursor: "pointer", fontSize: ".66rem", fontWeight: 800, flexShrink: 0 }}>
                                      ✓B
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ROUND ROBIN: calendario por jornadas + registro de resultados */}
      {isRoundRobin && rrMatches.length > 0 && (
        <div className="cp04-tournament-panel" style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>
            Calendario Round Robin
            <span style={{ color: T.accent, fontWeight: 400, fontSize: ".82rem", marginLeft: 10 }}>
              {pairs.length} parejas · {rrMatches.length} partido{rrMatches.length !== 1 ? "s" : ""} · {rrRoundNums.length} jornada{rrRoundNums.length !== 1 ? "s" : ""}
            </span>
          </h3>
          {rrComplete && rrChampion && (
            <div style={{ background: "linear-gradient(135deg, rgba(182,255,0,.16), rgba(49,232,159,.10))", border: "1px solid rgba(182,255,0,.4)", borderRadius: 14, padding: "12px 16px", marginBottom: 18, color: "#fff", fontWeight: 800 }}>
              🏆 Liga completada. Campeón: {pairLabel(rrChampion)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {rrRoundNums.map(rNum => {
              const restingId = getRoundRobinRestingPairId(pairs, rrMatches, rNum);
              const restingPair = restingId ? pairs.find(p => p.id === restingId) : null;
              return (
                <div key={rNum}>
                  <div style={{ color: T.accent, fontWeight: 800, fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(182,255,0,.18)", display: "flex", justifyContent: "space-between" }}>
                    <span>Jornada {rNum}</span>
                    {restingPair && <span style={{ color: T.textDim, textTransform: "none", letterSpacing: "normal", fontWeight: 600 }}>😴 Descansa: {pairLabel(restingPair)}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {rrByRound[rNum].map(match => {
                      const pA = pairs.find(p => p.id === match.pairA);
                      const pB = pairs.find(p => p.id === match.pairB);
                      const draft = rrScoreDraft[match.id] || {};
                      const draftA = draft.a ?? (match.scoreA ?? "");
                      const draftB = draft.b ?? (match.scoreB ?? "");
                      return (
                        <div key={match.id} style={{ background: match.played ? "rgba(182,255,0,.05)" : "rgba(4,9,20,.72)", border: match.played ? "1px solid rgba(182,255,0,.3)" : `1px solid ${T.line}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                          <span style={{ flex: "1 1 auto", minWidth: 160, fontSize: ".85rem", color: "#fff" }}>
                            <strong style={{ color: match.played && match.scoreA > match.scoreB ? T.accent : "#fff" }}>{pA ? pairLabel(pA) : "—"}</strong>
                            <span style={{ color: T.textDim }}> vs </span>
                            <strong style={{ color: match.played && match.scoreB > match.scoreA ? T.accent : "#fff" }}>{pB ? pairLabel(pB) : "—"}</strong>
                          </span>
                          {canManage ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input type="number" min="0" value={draftA} onChange={e => handleRoundRobinScoreChange(match.id, "a", e.target.value)}
                                aria-label={`Puntos de ${pairLabel(pA)}`} placeholder="0"
                                style={{ width: 52, padding: "5px 7px", borderRadius: 8, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.06)", color: "#fff", outline: "none", fontSize: ".82rem" }} />
                              <span style={{ color: T.textDim }}>–</span>
                              <input type="number" min="0" value={draftB} onChange={e => handleRoundRobinScoreChange(match.id, "b", e.target.value)}
                                aria-label={`Puntos de ${pairLabel(pB)}`} placeholder="0"
                                style={{ width: 52, padding: "5px 7px", borderRadius: 8, border: `1px solid ${T.line}`, background: "rgba(255,255,255,.06)", color: "#fff", outline: "none", fontSize: ".82rem" }} />
                              <button type="button" className="cp04-control-btn primary" style={{ width: "auto", padding: "5px 12px", fontSize: ".78rem" }} onClick={() => handleRoundRobinSaveResult(match)}>
                                {match.played ? "Corregir" : "Guardar"}
                              </button>
                            </div>
                          ) : (
                            match.played
                              ? <span style={{ color: T.accent, fontWeight: 800, fontSize: ".85rem" }}>{match.scoreA} – {match.scoreB}</span>
                              : <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".78rem" }}>Pendiente</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RANKING */}
      <div className="cp04-tournament-panel" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showRanking ? 14 : 0 }}>
          <h3 style={{ margin: 0 }}>
            Ranking
            <span style={{ color: T.accent, fontWeight: 400, fontSize: ".82rem", marginLeft: 8 }}>{pairs.length} pareja{pairs.length !== 1 ? "s" : ""}</span>
          </h3>
          <button type="button" className="cp04-tournament-action" onClick={() => setShowRanking(r => !r)}>
            {showRanking ? "▲ Ocultar" : `▼ Ver todas (${pairs.length})`}
          </button>
        </div>
        {showRanking && (
          pairs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: T.textDim }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📋</div>
              <p style={{ margin: 0 }}>Aún no hay parejas configuradas.</p>
            </div>
          ) : isRoundRobin ? (
            <div className="cp04-full-ranking-wrap">
              <table className="cp04-full-ranking-table">
                <thead>
                  <tr><th>#</th><th>Pareja</th><th>PJ</th><th>PG</th><th>PP</th><th>PF</th><th>PC</th><th>Dif</th><th>Pts</th></tr>
                </thead>
                <tbody>
                  {rrStandingsSorted.map((s, i) => {
                    const pair = pairs.find(p => p.id === s.pairId);
                    const isChampion = rrComplete && i === 0;
                    return (
                      <tr key={s.pairId}>
                        <td style={{ color: T.textDim, fontSize: ".82rem" }}>{i + 1}{isChampion ? " 🏆" : ""}</td>
                        <td><strong style={{ color: isChampion ? T.accent : "#fff" }}>{pair ? pairLabel(pair) : "—"}</strong></td>
                        <td>{s.played}</td>
                        <td>{s.won}</td>
                        <td>{s.lost}</td>
                        <td>{s.scoreFor}</td>
                        <td>{s.scoreAgainst}</td>
                        <td style={{ color: s.diff > 0 ? T.accent : s.diff < 0 ? T.dangerText : "inherit" }}>{s.diff > 0 ? `+${s.diff}` : s.diff}</td>
                        <td><strong>{s.points}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="cp04-full-ranking-wrap">
              <table className="cp04-full-ranking-table">
                <thead>
                  <tr><th>#</th><th>Jugador 1</th><th>Jugador 2</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {pairs.map((pair, i) => {
                    const match = bracket.find(m => m.pairA === pair.id || m.pairB === pair.id);
                    const isW = match?.winner === pair.id;
                    const isL = match?.winner && match.winner !== pair.id;
                    const isBye = byePair?.id === pair.id;
                    return (
                      <tr key={pair.id} style={{ opacity: isL ? .48 : 1, transition: "opacity .3s" }}>
                        <td style={{ color: T.textDim, fontSize: ".82rem" }}>{i + 1}</td>
                        <td><strong style={{ color: isW ? T.accent : "#fff" }}>{pair.player1 || <em style={{ color: T.textDim, fontWeight: 400 }}>Sin nombre</em>}</strong></td>
                        <td style={{ color: isW ? T.accent : "rgba(255,255,255,.75)" }}>{pair.player2 || <em style={{ color: T.textDim }}>Sin nombre</em>}</td>
                        <td>
                          {isBye ? <span style={{ background: "rgba(182,255,0,.14)", color: T.accent, fontWeight: 800, padding: "2px 8px", borderRadius: 5, fontSize: ".72rem" }}>BYE</span>
                            : isW ? <span style={{ background: "rgba(182,255,0,.14)", color: T.accent, fontWeight: 800, padding: "2px 8px", borderRadius: 5, fontSize: ".72rem" }}>✅ Avanza</span>
                            : isL ? <span style={{ background: "rgba(255,60,60,.1)", color: T.dangerText, fontWeight: 700, padding: "2px 8px", borderRadius: 5, fontSize: ".72rem" }}>Eliminada</span>
                            : <span style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>Pendiente</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

const RANKING_STYLE = `
@keyframes cp04-fadeUp {
  from { opacity:0; transform:translateY(18px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes cp04-scalePulse {
  0%  { transform: scale(1); }
  50% { transform: scale(1.03); }
  100%{ transform: scale(1); }
}
.cp04-rank-row:hover { background: rgba(182,255,0,.04) !important; transition: background .15s; }
.cp04-rank-avatar { width:34px; height:34px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:900; font-size:.72rem; flex-shrink:0; letter-spacing:.01em; }
.cp04-rank-podio-card { animation: cp04-fadeUp .5s ease both; }
.cp04-rank-podio-card:nth-child(1){ animation-delay:.05s; }
.cp04-rank-podio-card:nth-child(2){ animation-delay:.1s; }
.cp04-rank-podio-card:nth-child(3){ animation-delay:.15s; }
.cp04-rank-tr { animation: cp04-fadeUp .35s ease both; }
.cp04-rank-arrow-up { animation: cp04-scalePulse 2s infinite; }
`;

function RankingAvatar({ name, color = T.accent, size = 34 }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || "")
    .join("");
  const bg = color + "22";
  return (
    <span className="cp04-rank-avatar" style={{ width: size, height: size, background: bg, border: `1.5px solid ${color}55`, color, fontSize: size < 30 ? ".62rem" : ".72rem" }}>
      {initials}
    </span>
  );
}

function MovArrow({ mov }) {
  if (mov > 0) return <span className="cp04-rank-arrow-up" style={{ color: T.trendUp, fontWeight: 900, fontSize: ".8rem" }}>▲{mov}</span>;
  if (mov < 0) return <span style={{ color: T.trendDown, fontWeight: 900, fontSize: ".8rem" }}>▼{Math.abs(mov)}</span>;
  return <span style={{ color: T.textDim, fontWeight: 700, fontSize: ".8rem" }}>—</span>;
}

function RachaBadge({ racha }) {
  if (racha > 0) return <span style={{ color: T.trendUp, fontWeight: 900, fontSize: ".78rem" }}>🔥 +{racha}</span>;
  if (racha < 0) return <span style={{ color: T.trendDown, fontWeight: 900, fontSize: ".78rem" }}>❄️ {racha}</span>;
  return <span style={{ color: T.textDim, fontSize: ".78rem" }}>—</span>;
}

function Ranking() {
  const lang = useLang();
  const tx = key => t(key, lang);

  const CATS = [
    { key:"general",    label: tx("ranking.general") },
    { key:"masculino",  label: tx("ranking.masculino") },
    { key:"femenino",   label: tx("ranking.femenino") },
    { key:"mixto",      label: tx("ranking.mixto") },
    { key:"iniciacion", label: tx("ranking.iniciacion") },
    { key:"medio",      label: tx("ranking.medio") },
    { key:"avanzado",   label: tx("ranking.avanzado") },
  ];
  const NIVEL_COLORS = { "Avanzado":"#b6ff00", "Medio":T.accent2, "Iniciación":"#a78bfa" };

  const [cat, setCat] = useState("general");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = RANKING_PRO.filter(p => {
    const matchCat = cat === "general"
      ? true
      : cat === "masculino" ? p.cat === "Masculino"
      : cat === "femenino"  ? p.cat === "Femenino"
      : cat === "mixto"     ? p.cat === "Mixto"
      : cat === "iniciacion"? p.nivel === "Iniciación"
      : cat === "medio"     ? p.nivel === "Medio"
      : cat === "avanzado"  ? p.nivel === "Avanzado"
      : true;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.pareja.toLowerCase().includes(q) || p.p1.toLowerCase().includes(q) || p.p2.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const top3 = filtered.slice(0, 3);
  const rest = showAll ? filtered.slice(3) : filtered.slice(3, 10);
  const PODIO_COLORS = ["#f59e0b", "#9ca3af", "#b45309"];
  const PODIO_TROFEOS = ["🏆", "🥈", "🥉"];
  const PODIO_LABELS = [tx("ranking.campeon"), tx("ranking.subcampeon"), tx("ranking.tercero")];

  return (
    <div style={{ padding: "clamp(24px,4vw,42px) 24px clamp(40px,8vw,72px)", maxWidth: 1180, margin: "0 auto" }}>
      <style>{RANKING_STYLE}</style>

      {/* CABECERA */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16, marginBottom:24 }}>
        <div>
          <div style={{ color:T.accent, fontWeight:900, letterSpacing:".18em", fontSize:".74rem", textTransform:"uppercase", marginBottom:8 }}>
            {tx("ranking.temporada")} 2026
          </div>
          <h2 style={{ fontFamily:T.fontDisplay, fontSize:"clamp(2rem,5vw,3.4rem)", lineHeight:.9, margin:"0 0 8px", letterSpacing:"-.05em" }}>
            {tx("ranking.title")}
          </h2>
          <p style={{ color:T.textDim, fontSize:".9rem", margin:0 }}>{tx("ranking.subtitle")}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ color:T.textDim, fontSize:".72rem" }}>{tx("ranking.ultima_act")}</div>
          <div style={{ color:T.accent, fontWeight:700, fontSize:".82rem" }}>25/06/2026 · 08:00</div>
          <div style={{ marginTop:6, display:"inline-flex", alignItems:"center", gap:6, background:"rgba(182,255,0,.07)", border:"1px solid rgba(182,255,0,.18)", borderRadius:8, padding:"4px 10px", fontSize:".7rem", color:T.accent, fontWeight:700 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:T.accent, display:"inline-block" }} />
            {tx("ranking.datos_ejemplo")}
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
        <div style={{ flex:1, minWidth:180, maxWidth:280, position:"relative" }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tx("ranking.filtrar")}
            style={{ width:"100%", paddingLeft:32, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, color:"#fff", fontSize:".82rem", padding:"9px 12px 9px 32px", outline:"none", fontFamily:"inherit", minHeight:"unset" }}
          />
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:T.textDim, fontSize:".9rem", pointerEvents:"none" }}>🔍</span>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {CATS.map(c => (
            <button key={c.key} type="button" onClick={() => setCat(c.key)}
              style={{ background: cat===c.key ? T.accent : "rgba(255,255,255,.06)", color: cat===c.key ? "#06100a" : T.textDim, border: `1px solid ${cat===c.key ? T.accent : "rgba(255,255,255,.12)"}`, borderRadius:8, padding:"6px 13px", cursor:"pointer", fontWeight:900, fontSize:".76rem", fontFamily:"inherit", transition:"all .15s" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <Card style={{ textAlign:"center", padding:32, marginBottom:20 }}>
          <div style={{ fontSize:"2rem", marginBottom:8 }}>🔍</div>
          <div style={{ color:T.textDim }}>{tx("ranking.sin_resultados")}</div>
        </Card>
      )}

      {/* PODIO TOP 3 */}
      {top3.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ color:T.textDim, fontSize:".72rem", fontWeight:900, letterSpacing:".1em", textTransform:"uppercase", marginBottom:14 }}>{tx("ranking.podio")}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))", gap:16 }}>
            {top3.map((p, i) => {
              const isChamp = i === 0;
              const pc = PODIO_COLORS[i] || T.textDim;
              return (
                <div key={p.pos} className="cp04-rank-podio-card"
                  style={{ position:"relative", borderRadius:22, border:`1.5px solid ${pc}${isChamp?"":"55"}`, background: isChamp ? `linear-gradient(160deg,rgba(245,158,11,.12),rgba(11,17,29,.97))` : "linear-gradient(160deg,rgba(11,17,29,.94),rgba(8,13,22,.97))", padding:"22px 20px", overflow:"hidden" }}>
                  {isChamp && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${pc},transparent)` }} />}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <span style={{ fontSize: isChamp ? "2rem" : "1.5rem" }}>{PODIO_TROFEOS[i]}</span>
                    <span style={{ fontFamily:T.fontDisplay, fontSize:"2.8rem", fontWeight:900, color:pc, lineHeight:1, opacity:.25, letterSpacing:"-.05em" }}>{p.pos}</span>
                  </div>
                  <div style={{ fontWeight:900, fontSize:".88rem", color:pc, marginBottom:2 }}>{PODIO_LABELS[i]}</div>
                  <div style={{ fontFamily:T.fontDisplay, fontWeight:900, fontSize:"clamp(1.1rem,2.5vw,1.45rem)", color:"#fff", lineHeight:1.15, marginBottom:10 }}>{p.pareja}</div>
                  <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                    <RankingAvatar name={p.p1} color={pc} size={28} />
                    <RankingAvatar name={p.p2} color={pc} size={28} />
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:".72rem", color:T.textDim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.p1}</div>
                      <div style={{ fontSize:".72rem", color:T.textDim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.p2}</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, borderTop:`1px solid rgba(255,255,255,.07)`, paddingTop:12 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:T.fontDisplay, fontWeight:900, color:pc, fontSize:"1.25rem" }}>{p.pts}</div>
                      <div style={{ color:T.textDim, fontSize:".64rem", textTransform:"uppercase", letterSpacing:".06em" }}>{tx("ranking.pts")}</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:T.fontDisplay, fontWeight:900, color:T.trendUp, fontSize:"1.25rem" }}>{p.v}</div>
                      <div style={{ color:T.textDim, fontSize:".64rem", textTransform:"uppercase", letterSpacing:".06em" }}>{tx("ranking.v")}</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:T.fontDisplay, fontWeight:900, color:T.accent2, fontSize:"1.25rem" }}><RachaBadge racha={p.racha} /></div>
                      <div style={{ color:T.textDim, fontSize:".64rem", textTransform:"uppercase", letterSpacing:".06em" }}>{tx("ranking.racha")}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABLA COMPLETA */}
      {filtered.length > 3 && (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${T.line}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:900, fontSize:".88rem" }}>{tx("ranking.tabla")}</span>
            <span style={{ color:T.textDim, fontSize:".75rem" }}>{filtered.length} {tx("ranking.pareja").toLowerCase()}s</span>
          </div>
          <div className="cp04-table-wrap">
            <table className="cp04-table" style={{ minWidth:580 }}>
              <thead>
                <tr>
                  <th style={{ width:36 }}>{tx("ranking.pos")}</th>
                  <th>{tx("ranking.pareja")}</th>
                  <th style={{ textAlign:"center" }}>{tx("ranking.pts")}</th>
                  <th style={{ textAlign:"center" }}>{tx("ranking.pj")}</th>
                  <th style={{ textAlign:"center" }}>{tx("ranking.v")}</th>
                  <th style={{ textAlign:"center" }}>{tx("ranking.d")}</th>
                  <th style={{ textAlign:"center" }}>{tx("ranking.racha")}</th>
                  <th style={{ textAlign:"center", display:"none" }} className="cp04-rank-nivel">{tx("ranking.nivel")}</th>
                  <th style={{ textAlign:"center" }}>{tx("ranking.mov")}</th>
                </tr>
              </thead>
              <tbody>
                {[...(top3.length >= 3 ? [] : top3), ...rest].map((p, idx) => {
                  const nc = NIVEL_COLORS[p.nivel] || T.textDim;
                  const animDelay = `${idx * 0.04}s`;
                  return (
                    <tr key={p.pos} className="cp04-rank-row cp04-rank-tr" style={{ animationDelay: animDelay }}>
                      <td>
                        <span style={{ fontFamily:T.fontDisplay, fontWeight:900, color: p.pos<=3 ? PODIO_COLORS[p.pos-1] : T.textDim, fontSize: p.pos<=3 ? "1.1rem" : ".95rem" }}>{p.pos}</span>
                      </td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                            <RankingAvatar name={p.p1} color={nc} size={26} />
                            <RankingAvatar name={p.p2} color={nc} size={26} />
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:900, fontSize:".84rem", color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.pareja}</div>
                            <div style={{ color:T.textDim, fontSize:".68rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.p1} · {p.p2}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign:"center" }}>
                        <span style={{ fontFamily:T.fontDisplay, fontWeight:900, color:T.accent, fontSize:"1rem" }}>{p.pts}</span>
                      </td>
                      <td style={{ textAlign:"center", color:T.textDim, fontSize:".84rem" }}>{p.pj}</td>
                      <td style={{ textAlign:"center", color:T.trendUp, fontWeight:900, fontSize:".84rem" }}>{p.v}</td>
                      <td style={{ textAlign:"center", color:T.trendDown, fontSize:".84rem" }}>{p.d}</td>
                      <td style={{ textAlign:"center" }}><RachaBadge racha={p.racha} /></td>
                      <td style={{ textAlign:"center" }}><MovArrow mov={p.mov} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 13 && (
            <div style={{ padding:"12px 20px", borderTop:`1px solid ${T.line}`, textAlign:"center" }}>
              <button type="button" onClick={() => setShowAll(v => !v)}
                style={{ background:"transparent", border:`1px solid ${T.line}`, color:T.textDim, borderRadius:10, padding:"8px 20px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:".82rem" }}>
                {showAll ? "▲" : "▼"} {showAll ? tx("common.volver") : `${tx("ranking.ver_completo")} (${filtered.length})`}
              </button>
            </div>
          )}
        </Card>
      )}

      {/* LEYENDA */}
      <div style={{ marginTop:20, display:"flex", gap:16, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {Object.entries(NIVEL_COLORS).map(([nivel, color]) => (
            <span key={nivel} style={{ display:"inline-flex", alignItems:"center", gap:5, color:T.textDim, fontSize:".72rem" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:color, display:"inline-block" }} />{nivel}
            </span>
          ))}
        </div>
        <span style={{ color:T.textDim, fontSize:".7rem", fontStyle:"italic" }}>{tx("ranking.sistema_puntos")}</span>
      </div>
    </div>
  );
}

function Admin() {
  useClock(); // se mantiene la llamada: dispara el refresco periódico interno del hook (setInterval), aunque este panel no lea su valor de retorno.
  const lang = useLang();
  const tx = key => t(key, lang);
  const kpi = DEMO_KPI;
  return (
    <div style={{ padding: "clamp(24px,4vw,42px) 24px", maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16, marginBottom:20 }}>
        <SectionTitle eyebrow={tx("role.ADMIN.label")} title={tx("admin.panel")} desc={tx("admin.metricas")} />
        <ClockDisplay compact />
      </div>

      <AuthStatusPanel compact />

      {/* KPI GRID */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, margin:"18px 0" }}>
        <MetricCard label={tx("admin.ingr_mes")} value={`${kpi.ingresosMes}€`} sub={tx("home.estimacion_mensual")} trend={12} color={T.accent2} icon="💶" />
        <MetricCard label={tx("admin.reservas_mes")} value="268" sub={`vs 241 ${tx("admin.vs_mes_anterior")}`} trend={11} icon="🎾" />
        <MetricCard label={tx("admin.ocupacion")} value={`${kpi.ocupacionMedia}%`} sub={tx("home.pistas_activas")} trend={4} color={T.accent} icon="🏟" />
        <MetricCard label={tx("admin.socios")} value={kpi.jugadoresActivos} sub={`+${kpi.nuevosJugadores} ${tx("home.este_mes")}`} trend={6} color="#a78bfa" icon="👤" />
        <MetricCard label={tx("admin.procesos")} value={`${MAKE_FLUJOS_COUNTERS.conectados}/${MAKE_FLUJOS_COUNTERS.total}`} sub={`${tx("admin.exito_label")} ${kpi.tasaExitoMake}%`} trend={null} color={T.accent} icon="⚡" />
        <MetricCard label={tx("admin.backup")} value={kpi.ultimoBackup} sub={tx("admin.prox_lunes")} trend={null} color={T.metricPositive} icon="💾" />
      </div>

      {/* GRÁFICAS ADMIN */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))", gap:16, marginBottom:20 }}>
        <ChartCard title={tx("admin.graf_hoy")} sub={tx("admin.sub_hoy")} demo>
          <MiniBarChart data={DEMO_RESERVAS_HOY} height={70} />
        </ChartCard>
        <ChartCard title={tx("admin.graf_semana")} sub={tx("admin.sub_semana")} demo>
          <MiniLineChart data={DEMO_RESERVAS_SEMANA} height={70} color={T.accent2} />
        </ChartCard>
        <ChartCard title={tx("admin.graf_pista")} sub={tx("admin.sub_pista")} demo>
          <HorizontalBarChart data={DEMO_OCUPACION_PISTAS} />
        </ChartCard>
      </div>

      <div className="cp04-grid-2" style={{ marginTop:0, marginBottom:20 }}>
        <RolePanel eyebrow={tx("admin.gestion_eyebrow")} title={tx("admin.gestion_title")} desc={tx("admin.gestion_desc")} items={[tx("admin.gestion_item1"), tx("admin.gestion_item2"), tx("admin.gestion_item3"), tx("admin.gestion_item4")]} />
        <RolePanel eyebrow={tx("admin.crec_eyebrow")} title={tx("admin.crec_title")} desc={tx("admin.crec_desc")} items={[tx("admin.crec_item1"), tx("admin.crec_item2"), tx("admin.crec_item3"), tx("admin.crec_item4")]} />
        <RolePanel eyebrow={tx("admin.backup_eyebrow")} title={tx("admin.backup_semana")} desc={tx("admin.backup_desc")} items={[tx("admin.backup_item1"), tx("admin.backup_item2"), tx("admin.backup_item3"), tx("admin.backup_item4")]} />
      </div>

      <div style={{ marginTop:4 }}>
        <SectionTitle eyebrow={tx("admin.sistema_eyebrow")} title={tx("admin.integraciones")} desc={tx("admin.integ_desc")} />
        <IntegrationMatrix compact />
      </div>
    </div>
  );
}


function AuthProductionStatusPanel() {
  const mode = cp04GetStoredAuthMode();
  const isDemo = mode === CP04_AUTH_MODES.DEMO || mode === CP04_AUTH_MODES.LOCAL_DEMO;

  return (
    <Card style={{ marginTop: 24, borderColor: isDemo ? "rgba(255,184,77,.34)" : "rgba(182,255,0,.34)" }}>
      <h3 style={{ marginTop: 0, color: isDemo ? T.warning : T.accent }}>
        Estado de autenticación
      </h3>
      <p style={{ color: T.textDim, lineHeight: 1.7 }}>
        La app está preparada para conectar autenticación real mediante backend/Worker.
        En local puede mantenerse el modo demo para pruebas, pero en producción las secciones sensibles
        deben validarse desde servidor.
      </p>
      <PanelList
        items={[
          `Modo actual: ${mode}`,
          `Secciones protegidas: ${CP04_PROTECTED_SECTIONS.join(", ")}`,
          "Login real pendiente: /api/auth/login",
          "Sesión real pendiente: /api/auth/me",
          "Recuperación real pendiente: /api/auth/forgot-password",
          "Roles reales pendientes de backend: PLAYER, STAFF, ADMIN, SUPPORT"
        ]}
      />
      <p style={{ color: T.textDim, lineHeight: 1.7, marginBottom: 0 }}>
        Regla de producción: el frontend solo debe mostrar la interfaz. La autorización final debe decidirla
        el backend/Worker con sesión válida y rol real.
      </p>
    </Card>
  );
}


function Soporte() {
  const lang = useLang();
  const tx = key => t(key, lang);
  return <div style={{ padding: "42px 24px", maxWidth: 1180, margin: "0 auto" }}><SectionTitle eyebrow={tx("soporte.eyebrow")} title={tx("soporte.title")} desc={tx("soporte.desc")} /><AuthStatusPanel /><Card style={{ marginTop: 24, marginBottom: 24 }}><h3 style={{ marginTop: 0 }}><span style={{ color: T.accent }}>{tx("soporte.proteccion_h3")}</span></h3><PanelList items={[`${tx("auth.secciones")} ${PROTECTED_SECTIONS.join(", ")}`, tx("soporte.proteccion"), tx("soporte.estado_tec_desc"), tx("soporte.worker_item")]} /></Card><div className="cp04-grid-2" style={{ marginBottom: 24 }}><RolePanel eyebrow={tx("soporte.estado_tec_eyebrow")} title={tx("soporte.estado_tec_title")} desc={tx("soporte.estado_tec_desc")} items={[tx("soporte.worker_item"), tx("soporte.make_item"), tx("soporte.airtable_item"), tx("soporte.stripe_item")]} /><RolePanel eyebrow={tx("soporte.obs_eyebrow")} title={tx("soporte.obs_title")} desc={tx("soporte.obs_desc")} items={[tx("soporte.logs_worker"), tx("soporte.logs_validaciones"), tx("soporte.logs_errores"), tx("soporte.logs_alertas")]} /></div><IntegrationMatrix /><AuthProductionStatusPanel /><Card style={{ marginTop: 24 }}><h3 style={{ marginTop: 0 }}><span style={{ color: T.accent }}>{tx("soporte.vars_h3")}</span></h3><PanelList items={[tx("soporte.vars_no_names"), tx("soporte.vars_validacion")]} /></Card></div>;
}

function Perfil({ selectedRole, onClearRole, onOpenTutorial }) {
  const auth = useAuth();
  const lang = useLang();
  const tx = key => t(key, lang);
  const roleLabels = { PLAYER:"Jugador / cliente", STAFF:"Staff / recepción", ADMIN:"Administrador / jefe", SUPPORT:"Soporte técnico" };

  // Perfil preparado para backend real.
  // Actualmente localStorage funciona como fallback local para no romper la demo.
  // Endpoints recomendados (todavía sin implementar en el Worker):
  // GET    /api/profile/me
  // PATCH  /api/profile/me
  // POST   /api/profile/avatar
  // DELETE /api/profile/avatar
  // GET    /api/profile/metrics
  // Login/registro/recuperación/cambio de contraseña ya NO se referencian
  // desde aquí: viven centralizados en src/auth/authService.js.

  function saveProfileFallback(key, value) {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  }

  async function saveProfileField(field, value) {
    // Preparado para backend real. En esta fase solo persiste localmente.
    // Futuro: PATCH /api/profile/me { [field]: value } (endpoint aún no
    // implementado en el Worker).
    const storageMap = {
      avatar: "cp04_avatar",
      bio: "cp04_bio",
      deporte: "cp04_deporte",
      privacidad: "cp04_privacidad",
    };
    const storageKey = storageMap[field];
    if (!storageKey) return false;
    return saveProfileFallback(storageKey, value);
  }

  // Avatar — persiste en localStorage (modo demo)
  // TODO: GET/POST/DELETE /api/profile/avatar — integrar con Supabase Storage, Cloudflare R2 o Airtable Attachments
  const [avatarSrc, setAvatarSrc] = useState(() => { try { return localStorage.getItem("cp04_avatar") || null; } catch { return null; } });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarMsg, setAvatarMsg] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [showDelConfirm, setShowDelConfirm] = useState(false);

  // Bio — persiste en localStorage (modo demo)
  // TODO: GET/PATCH /api/profile/me { bio }
  const [bio, setBio] = useState(() => { try { return localStorage.getItem("cp04_bio") || ""; } catch { return ""; } });
  const [bioEdit, setBioEdit] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bioMsg, setBioMsg] = useState("");
  const BIO_MAX = 220;

  // Datos deportivos — persiste en localStorage (modo demo)
  // TODO: GET/PATCH /api/profile/me { deporteData }
  const [deporteData, setDeporteData] = useState(() => { try { return JSON.parse(localStorage.getItem("cp04_deporte") || "{}"); } catch { return {}; } });
  const [deporteEditing, setDeporteEditing] = useState(false);
  const [deporteDraft, setDeporteDraft] = useState({});
  const [deporteMsg, setDeporteMsg] = useState("");

  // Privacidad — persiste en localStorage (modo demo)
  // TODO: GET/PATCH /api/profile/me { privacy }
  const [privacidad, setPrivacidad] = useState(() => { try { return JSON.parse(localStorage.getItem("cp04_privacidad") || "{}"); } catch { return {}; } });
  const [privMsg, setPrivMsg] = useState("");

  // Derechos GDPR (flujo #9, Make 6323457) — a diferencia del resto de
  // Perfil() (que persiste en localStorage), estos dos botones sí llaman al
  // Worker real (POST /api/gdpr/acceso y /api/gdpr/olvido): son los únicos
  // datos de este componente que existen server-side hoy.
  const [gdprAccesoLoading, setGdprAccesoLoading] = useState(false);
  const [gdprAccesoResult, setGdprAccesoResult] = useState(null);
  const [gdprAccesoError, setGdprAccesoError] = useState("");
  const [gdprOlvidoConfirming, setGdprOlvidoConfirming] = useState(false);
  const [gdprOlvidoLoading, setGdprOlvidoLoading] = useState(false);
  const [gdprOlvidoResult, setGdprOlvidoResult] = useState(null);
  const [gdprOlvidoError, setGdprOlvidoError] = useState("");

  // Contraseña
  const [pwdActual, setPwdActual] = useState("");
  const [pwdNueva, setPwdNueva] = useState("");
  const [pwdConfirmar, setPwdConfirmar] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");

  const roleInitials = { PLAYER:"JG", STAFF:"ST", ADMIN:"AD", SUPPORT:"SP" };
  const initials = roleInitials[selectedRole] || "CP";

  // Completitud del perfil
  function computeCompleteness() {
    let s = 0;
    if (avatarSrc) s += 20;
    if (bio && bio.trim().length > 10) s += 20;
    if (deporteData.mano) s += 15;
    if (deporteData.nivel) s += 15;
    if (deporteData.disponibilidad) s += 15;
    if (deporteData.objetivo) s += 15;
    return Math.min(s, 100);
  }
  const completeness = computeCompleteness();

  // Handlers avatar
  function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarError(""); setAvatarMsg("");
    const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
    if (!allowed.includes(file.type)) { setAvatarError(tx("perfil.avatar_error_tipo")); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarError(tx("perfil.avatar_error_size")); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }
  function handleAvatarSave() {
    if (!avatarPreview) return;
    saveProfileField("avatar", avatarPreview);
    setAvatarSrc(avatarPreview); setAvatarPreview(null);
    setAvatarMsg(tx("perfil.avatar_guardada"));
    setTimeout(() => setAvatarMsg(""), 3000);
  }
  function handleAvatarDelete() {
    try {
      localStorage.removeItem("cp04_avatar");
    } catch {
      // localStorage puede lanzar en modo privado/Safari; se limpia igualmente el estado en memoria.
    }
    setAvatarSrc(null); setAvatarPreview(null); setShowDelConfirm(false);
    setAvatarMsg(tx("perfil.avatar_eliminada"));
    setTimeout(() => setAvatarMsg(""), 3000);
  }

  // Handlers bio
  function startBioEdit() { setBioDraft(bio); setBioEdit(true); setBioMsg(""); }
  function cancelBioEdit() { setBioEdit(false); setBioDraft(""); }
  function saveBio() {
    if (!bioDraft.trim() || bioDraft.length > BIO_MAX) return;
    const saved = bioDraft.trim();
    setBio(saved); saveProfileField("bio", saved);
    setBioEdit(false); setBioMsg(tx("perfil.bio_guardada"));
    setTimeout(() => setBioMsg(""), 3000);
  }

  // Handlers datos deportivos
  function startDeporteEdit() { setDeporteDraft({...deporteData}); setDeporteEditing(true); }
  function cancelDeporteEdit() { setDeporteEditing(false); }
  function saveDeporte() {
    const saved = {...deporteDraft};
    setDeporteData(saved); saveProfileField("deporte", saved);
    setDeporteEditing(false); setDeporteMsg(tx("perfil.deporte_guardados"));
    setTimeout(() => setDeporteMsg(""), 3000);
  }

  // Handlers privacidad
  function togglePriv(key, defaultOn) {
    const current = privacidad[key] !== undefined ? privacidad[key] : defaultOn;
    const updated = { ...privacidad, [key]: !current };
    setPrivacidad(updated); saveProfileField("privacidad", updated);
    setPrivMsg(tx("perfil.privacidad_guardada"));
    setTimeout(() => setPrivMsg(""), 2000);
  }

  // Handlers GDPR (flujo #9) — llaman al Worker real, nunca simulan éxito.
  async function handleGdprAcceso() {
    setGdprAccesoLoading(true);
    setGdprAccesoError("");
    setGdprAccesoResult(null);
    try {
      const response = await authFetch("/api/gdpr/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await readSafeResponse(response);
      if (!response.ok || !data?.ok) {
        setGdprAccesoError(data?.message || data?.error || "No se pudo obtener tus datos ahora mismo.");
      } else {
        setGdprAccesoResult(data);
      }
    } catch {
      setGdprAccesoError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setGdprAccesoLoading(false);
    }
  }

  // "Eliminar mis datos" NUNCA es lo mismo que "darme de baja del club" (ver
  // handleGdprOlvido en el Worker): esto solo registra una solicitud de
  // olvido para revisión, nunca ejecuta un borrado desde el frontend.
  async function handleGdprOlvido() {
    setGdprOlvidoLoading(true);
    setGdprOlvidoError("");
    setGdprOlvidoResult(null);
    try {
      const response = await authFetch("/api/gdpr/olvido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmar: true, motivo: "Solicitud del titular desde su perfil." }),
      });
      const data = await readSafeResponse(response);
      if (!response.ok || !data?.ok) {
        setGdprOlvidoError(data?.message || data?.error || "No se pudo registrar la solicitud ahora mismo.");
      } else {
        setGdprOlvidoResult(data);
      }
    } catch {
      setGdprOlvidoError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setGdprOlvidoLoading(false);
      setGdprOlvidoConfirming(false);
    }
  }

  // Handler contraseña
  async function handleChangePwd(e) {
    e.preventDefault(); setPwdMsg(""); setPwdError("");
    if (!pwdActual) { setPwdError(tx("perfil.pwd_error_vacia")); return; }

    const valid = /[A-Z]/.test(pwdNueva) && /[a-z]/.test(pwdNueva) && /[0-9]/.test(pwdNueva) && pwdNueva.length >= 8;
    if (!valid) { setPwdError(tx("perfil.pwd_error_nueva")); return; }
    if (pwdNueva !== pwdConfirmar) { setPwdError(tx("perfil.pwd_error_coincide")); return; }

    if (auth.isAuthenticated) {
      // Sesión backend real: el cambio de contraseña es real (POST
      // /api/auth/change-password vía authService), no un simulacro.
      const result = await auth.updatePassword(pwdNueva);
      if (!result.ok) {
        setPwdError(result.message || "No se pudo actualizar la contraseña.");
        return;
      }
      setPwdMsg(result.message || "Contraseña actualizada.");
      setPwdActual(""); setPwdNueva(""); setPwdConfirmar("");
      return;
    }

    // Sin sesión backend real (demo): la contraseña "actual" solo se valida
    // contra la contraseña demo del rol, aislada en demoAuthAdapter. El
    // éxito queda etiquetado como local (perfil.pwd_guardada) para no
    // fingir un cambio de contraseña real.
    const demoCheck = verifyDemoRolePassword(selectedRole, pwdActual);
    if (!demoCheck.ok) { setPwdError(tx("perfil.pwd_error_vacia")); return; }

    setPwdMsg(tx("perfil.pwd_guardada"));
    setPwdActual(""); setPwdNueva(""); setPwdConfirmar("");
  }

  // Métricas demo por rol
  const demoMetrics = {
    PLAYER:  { partidos:24, reservas:31, torneos:3,  ranking:12,  actividad:"Alta",     valoracion:4.2, fiabilidad:96, racha:5  },
    STAFF:   { partidos:8,  reservas:187,torneos:1,  ranking:"—", actividad:"Muy alta", valoracion:4.8, fiabilidad:99, racha:12 },
    ADMIN:   { partidos:4,  reservas:312,torneos:5,  ranking:"—", actividad:"Alta",     valoracion:5.0, fiabilidad:100,racha:21 },
    SUPPORT: { partidos:2,  reservas:98, torneos:0,  ranking:"—", actividad:"Media",    valoracion:4.6, fiabilidad:98, racha:7  },
  };
  const metrics = demoMetrics[selectedRole] || demoMetrics.PLAYER;

  // Insignias y logros
  const allBadges = [
    { id:"puntual",    icon:"⏱️",  label:"Jugador puntual",    desc:"Siempre en hora",          earned:true },
    { id:"activo",     icon:"🔥",  label:"Participante activo",desc:"Alto nivel de actividad",  earned:metrics.actividad==="Alta"||metrics.actividad==="Muy alta" },
    { id:"torneo",     icon:"🏆",  label:"Torneo completado",  desc:"Ha participado en torneos",earned:metrics.torneos>0 },
    { id:"companero",  icon:"🤝",  label:"Buen compañero",     desc:"Valoración alta",          earned:metrics.valoracion>=4.0 },
    { id:"racha",      icon:"📅",  label:"Racha semanal",      desc:"7+ días activo",           earned:metrics.racha>=7 },
    { id:"completo",   icon:"✅",  label:"Perfil completo",    desc:"Perfil al 100%",           earned:completeness===100 },
    { id:"verificado", icon:"🎖️", label:"Nivel verificado",   desc:"Nivel confirmado",         earned:!!deporteData.nivel },
    { id:"frecuente",  icon:"📌",  label:"Reserva frecuente",  desc:"10+ reservas realizadas",  earned:metrics.reservas>=10 },
  ];

  // Actividad reciente demo
  const recentActivity = [
    { icon:"🎾", desc:"Pista 1 · 10:00 h · 90 min",       fecha:"Hoy" },
    { icon:"🏆", desc:"Torneo interno · Semifinal",         fecha:"Hace 3 días" },
    { icon:"🎾", desc:"Pista 3 · 18:00 h · 60 min",       fecha:"Hace 5 días" },
    { icon:"🔥", desc:"Racha activa de "+metrics.racha+" días", fecha:"Esta semana" },
  ];

  const isPlayer  = selectedRole === "PLAYER";
  const isStaff   = selectedRole === "STAFF";
  const roleProfileLabel = { PLAYER:"Jugador", STAFF:"Staff · Recepción", ADMIN:"Administración", SUPPORT:"Soporte técnico" }[selectedRole] || "Usuario";
  const sportLevel = deporteData.nivel || (selectedRole==="ADMIN"?"Directivo":selectedRole==="STAFF"?"Interno":selectedRole==="SUPPORT"?"Técnico":"Sin definir");

  // Estilos reutilizables
  const cs = { background:T.surface2, borderRadius:20, padding:"22px 24px", border:`1px solid ${T.line}` };
  const ls = { color:T.textDim, fontWeight:700, fontSize:".8rem", letterSpacing:".06em", textTransform:"uppercase", marginBottom:6, display:"block" };
  const ss = { background:T.surface3, border:`1px solid ${T.line}`, borderRadius:10, color:T.text, padding:"10px 14px", width:"100%", fontSize:".93rem" };
  const hs = { margin:0, color:T.accent, fontFamily:T.fontDisplay, fontSize:"1rem", letterSpacing:".04em" };
  const accentGlow = `0 0 20px ${T.accent}30`;

  const complColor = completeness===100 ? T.accent : completeness>=60 ? T.warning : T.danger;
  const complLabel = completeness===100 ? "✓ Perfil completo" : `${completeness}% completado`;

  return (
    <div style={{ padding:"42px 24px", maxWidth:1180, margin:"0 auto" }}>

      {/* ── CABECERA DE PERFIL PREMIUM ── */}
      <div style={{ background:`linear-gradient(135deg,${T.surface2} 0%,${T.surface3} 100%)`, borderRadius:24, padding:"32px 32px 28px", border:`1px solid ${T.line}`, marginBottom:28, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, right:0, width:240, height:240, background:`radial-gradient(circle,${T.accent}15 0%,transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"flex-start", gap:24, flexWrap:"wrap", position:"relative", zIndex:1 }}>

          {/* Avatar */}
          <div style={{ position:"relative", flexShrink:0 }}>
            {avatarSrc
              ? <img src={avatarSrc} alt="Avatar" style={{ width:96, height:96, borderRadius:"50%", objectFit:"cover", border:`3px solid ${T.accent}`, boxShadow:accentGlow }} />
              : <div style={{ width:96, height:96, borderRadius:"50%", background:`linear-gradient(135deg,${T.accent}30,${T.primary}40)`, border:`3px solid ${T.accent}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", fontWeight:900, color:T.accent, fontFamily:T.fontDisplay, boxShadow:accentGlow }}>
                  {initials}
                </div>
            }
            <div style={{ position:"absolute", bottom:3, right:3, width:16, height:16, borderRadius:"50%", background:T.accent, border:`2px solid ${T.surface2}` }} title="Activo" />
          </div>

          {/* Info principal */}
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:".72rem", color:T.accent, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", marginBottom:4 }}>{roleProfileLabel}</div>
            <h2 style={{ margin:"0 0 4px", fontSize:"1.5rem", fontFamily:T.fontDisplay, color:T.text, fontWeight:900 }}>
              {roleLabels[selectedRole] || selectedRole}
            </h2>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginTop:8 }}>
              <span style={{ background:T.surface3, border:`1px solid ${T.line}`, borderRadius:8, padding:"3px 10px", fontSize:".78rem", color:T.textDim }}>
                Nivel: <strong style={{ color:T.text }}>{sportLevel}</strong>
              </span>
              <span style={{ background:`${complColor}18`, border:`1px solid ${complColor}55`, borderRadius:8, padding:"3px 10px", fontSize:".78rem", color:complColor, fontWeight:700 }}>
                {complLabel}
              </span>
            </div>
            {bio && !bioEdit && (
              <p style={{ color:T.textDim, fontSize:".86rem", lineHeight:1.6, margin:"12px 0 0", maxWidth:520, fontStyle:"italic" }}>"{bio}"</p>
            )}
          </div>

          {/* Barra de completitud */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, minWidth:130, flexShrink:0 }}>
            <span style={{ color:T.textDim, fontSize:".72rem", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>{tx("perfil.completitud_titulo")}</span>
            <div style={{ width:130, height:7, background:T.surface3, borderRadius:8, overflow:"hidden" }}>
              <div style={{ width:`${completeness}%`, height:"100%", background:`linear-gradient(90deg,${T.primary},${T.accent})`, transition:"width .7s cubic-bezier(.4,0,.2,1)" }} />
            </div>
            <span style={{ color:complColor, fontSize:".85rem", fontWeight:800 }}>{completeness}%</span>
          </div>
        </div>
      </div>

      {/* ── GRID PRINCIPAL ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))", gap:20, marginBottom:20 }}>

        {/* FOTO DE PERFIL */}
        <div style={cs}>
          <h3 style={hs}>📷 {tx("perfil.avatar_cambiar")}</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:14 }}>
            {avatarPreview ? (
              <div style={{ textAlign:"center" }}>
                <img src={avatarPreview} alt="Vista previa" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:`2px solid ${T.warning}`, marginBottom:8 }} />
                <div style={{ color:T.warning, fontSize:".75rem", marginBottom:10 }}>Vista previa — aún no guardada</div>
                <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                  <Btn onClick={handleAvatarSave} style={{ fontSize:".82rem", padding:"7px 18px" }}>Guardar foto</Btn>
                  <Btn variant="secondary" onClick={() => setAvatarPreview(null)} style={{ fontSize:".82rem", padding:"7px 18px" }}>Descartar</Btn>
                </div>
              </div>
            ) : (
              <>
                <label style={{ cursor:"pointer", display:"block" }}>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarChange} style={{ display:"none" }} />
                  <div
                    style={{ border:`2px dashed ${T.line}`, borderRadius:14, padding:"18px 14px", textAlign:"center", color:T.textDim, fontSize:".86rem", cursor:"pointer", transition:"border-color .2s,color .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=T.accent; e.currentTarget.style.color=T.text; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=T.line; e.currentTarget.style.color=T.textDim; }}
                  >
                    📁 Seleccionar imagen &nbsp;·&nbsp; JPG, PNG, WEBP &nbsp;·&nbsp; máx 5 MB
                  </div>
                </label>
                {avatarSrc && !showDelConfirm && (
                  <Btn variant="secondary" onClick={() => setShowDelConfirm(true)} style={{ fontSize:".82rem" }}>{tx("perfil.avatar_eliminar")}</Btn>
                )}
                {showDelConfirm && (
                  <div style={{ background:`${T.danger}18`, border:`1px solid ${T.danger}55`, borderRadius:12, padding:"12px 14px" }}>
                    <div style={{ color:T.danger, fontWeight:700, fontSize:".85rem", marginBottom:10 }}>{tx("perfil.avatar_confirmar_del")}</div>
                    <div style={{ display:"flex", gap:8 }}>
                      <Btn variant="danger" onClick={handleAvatarDelete} style={{ fontSize:".82rem", padding:"6px 16px" }}>Sí, eliminar</Btn>
                      <Btn variant="secondary" onClick={() => setShowDelConfirm(false)} style={{ fontSize:".82rem", padding:"6px 16px" }}>Cancelar</Btn>
                    </div>
                  </div>
                )}
              </>
            )}
            {avatarError && <div style={{ color:T.danger, fontWeight:700, fontSize:".83rem" }}>{avatarError}</div>}
            {avatarMsg  && <div style={{ color:T.accent, fontWeight:700, fontSize:".83rem" }}>{avatarMsg}</div>}
          </div>
        </div>

        {/* SESIÓN Y ROL */}
        <div style={cs}>
          <h3 style={hs}>⚡ {tx("perfil.sesion")}</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:T.textDim, fontSize:".86rem" }}>{tx("perfil.rol_actual")}</span>
              <strong style={{ color:T.text, fontSize:".88rem" }}>{roleLabels[selectedRole]||selectedRole}</strong>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:T.textDim, fontSize:".86rem" }}>{tx("perfil.idioma")}</span>
              <strong style={{ color:T.text, fontSize:".88rem" }}>{lang && lang.label ? lang.label : "Español"}</strong>
            </div>
            <div style={{ borderTop:`1px solid ${T.line}`, paddingTop:12, marginTop:4 }}>
              <LanguageSelector />
            </div>
            {auth.isAuthenticated && (
              <div style={{
                marginTop:8,
                marginBottom:6,
                padding:"9px 10px",
                borderRadius:12,
                border:`1px solid rgba(182,255,0,.28)`,
                background:"rgba(182,255,0,.07)",
                color:T.text,
                fontSize:".78rem",
                lineHeight:1.45
              }}>
                <strong style={{ color:T.accent }}>Autenticación real:</strong> Supabase conectado
                {auth.user?.email && (
                  <div style={{ marginTop:6, maxWidth:"100%" }}>
                    <div style={{ color:T.textDim, fontSize:".72rem", marginBottom:2 }}>
                      Email:
                    </div>
                    <div style={{
                      color:T.textDim,
                      fontSize:".72rem",
                      lineHeight:1.35,
                      whiteSpace:"normal",
                      wordBreak:"break-all",
                      overflowWrap:"anywhere",
                      maxWidth:"100%"
                    }}>
                      {auth.user.email}
                    </div>
                  </div>
                )}

                {auth.user && (() => {
                  const realRole = auth.role || "";
                  const realPermissions = Array.isArray(auth.user?.permissions) ? auth.user.permissions : [];

                  return (
                    <div style={{ marginTop:8, maxWidth:"100%" }}>
                      {realRole && (
                        <div style={{ color:T.textDim, fontSize:".72rem", lineHeight:1.35 }}>
                          <strong style={{ color:T.accent }}>Rol real:</strong> {realRole}
                        </div>
                      )}

                      {realPermissions.length > 0 && (
                        <div style={{ marginTop:5 }}>
                          <div style={{ color:T.textDim, fontSize:".72rem", marginBottom:4 }}>
                            Permisos reales:
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {realPermissions.map((permission) => (
                              <span key={permission} style={{
                                padding:"3px 6px",
                                borderRadius:999,
                                border:"1px solid rgba(182,255,0,.22)",
                                background:"rgba(0,0,0,.18)",
                                color:T.textDim,
                                fontSize:".68rem",
                                lineHeight:1.2,
                                maxWidth:"100%",
                                overflowWrap:"anywhere"
                              }}>
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            <Btn variant="secondary" onClick={onClearRole} style={{ marginTop:8, width:"100%" }}>🚪 {tx("perfil.cerrar_sesion")}</Btn>
            {onOpenTutorial && (
              <Btn variant="secondary" data-tour="perfil-tutorial-btn" onClick={onOpenTutorial} style={{ marginTop:6, width:"100%", borderColor:"rgba(182,255,0,.32)", color:"#b6ff00" }}>🎯 Ver tutorial rápido</Btn>
            )}
          </div>
        </div>

        {/* PRESENTACIÓN / BIO — jugador y staff */}
        {(isPlayer || isStaff) && (
          <div style={cs}>
            <h3 style={hs}>✍️ {tx("perfil.bio_titulo")}</h3>
            <div style={{ marginTop:14 }}>
              {!bioEdit ? (
                <>
                  {bio
                    ? <p style={{ color:T.text, fontSize:".9rem", lineHeight:1.65, margin:"0 0 14px" }}>"{bio}"</p>
                    : <p style={{ color:T.textDim, fontSize:".84rem", fontStyle:"italic", margin:"0 0 14px", lineHeight:1.6 }}>{tx("perfil.bio_placeholder")}</p>
                  }
                  {bioMsg && <div style={{ color:T.accent, fontWeight:700, fontSize:".82rem", marginBottom:8 }}>{bioMsg}</div>}
                  <Btn onClick={startBioEdit} variant="secondary" style={{ fontSize:".82rem" }}>{tx("perfil.bio_editar")}</Btn>
                </>
              ) : (
                <>
                  <textarea
                    value={bioDraft}
                    onChange={e => setBioDraft(e.target.value.slice(0,BIO_MAX))}
                    placeholder={tx("perfil.bio_placeholder")}
                    rows={4}
                    style={{ width:"100%", background:T.surface3, border:`1px solid ${T.line}`, borderRadius:10, color:T.text, padding:"10px 12px", fontSize:".9rem", resize:"vertical", lineHeight:1.6, boxSizing:"border-box", fontFamily:T.fontBody }}
                    autoFocus
                  />
                  <div style={{ textAlign:"right", fontSize:".75rem", color:bioDraft.length>BIO_MAX*0.9?T.warning:T.textDim, marginTop:4 }}>
                    {bioDraft.length}/{BIO_MAX} {tx("perfil.bio_chars")}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <Btn onClick={saveBio} disabled={!bioDraft.trim()||bioDraft.length>BIO_MAX} style={{ fontSize:".82rem" }}>{tx("perfil.bio_guardar")}</Btn>
                    <Btn variant="secondary" onClick={cancelBioEdit} style={{ fontSize:".82rem" }}>{tx("perfil.bio_cancelar")}</Btn>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* DATOS DEPORTIVOS — solo jugador */}
        {isPlayer && (
          <div style={cs}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={hs}>🎾 {tx("perfil.deporte_titulo")}</h3>
              {!deporteEditing && (
                <Btn variant="secondary" onClick={startDeporteEdit} style={{ fontSize:".78rem", padding:"4px 12px" }}>Editar</Btn>
              )}
            </div>
            {!deporteEditing ? (
              <div style={{ display:"grid", gap:8 }}>
                {[
                  [tx("perfil.deporte_mano"),           deporteData.mano],
                  [tx("perfil.deporte_posicion"),       deporteData.posicion],
                  [tx("perfil.deporte_nivel"),          deporteData.nivel],
                  [tx("perfil.deporte_disponibilidad"), deporteData.disponibilidad],
                  [tx("perfil.deporte_objetivo"),       deporteData.objetivo],
                  [tx("perfil.deporte_busqueda"),       deporteData.busqueda],
                ].map(([label, val]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${T.line}` }}>
                    <span style={{ color:T.textDim, fontSize:".82rem" }}>{label}</span>
                    <strong style={{ color:val?T.text:T.textDim, fontSize:".85rem" }}>{val || "—"}</strong>
                  </div>
                ))}
                {deporteMsg && <div style={{ color:T.accent, fontWeight:700, fontSize:".82rem", marginTop:4 }}>{deporteMsg}</div>}
              </div>
            ) : (
              <div style={{ display:"grid", gap:10 }}>
                {[
                  { key:"mano",           label:tx("perfil.deporte_mano"),           opts:["Derecha","Izquierda","Ambas"] },
                  { key:"posicion",       label:tx("perfil.deporte_posicion"),       opts:["Derecha","Revés","Ambas"] },
                  { key:"nivel",          label:tx("perfil.deporte_nivel"),          opts:["Iniciación","Intermedio","Avanzado","Competición"] },
                  { key:"disponibilidad", label:tx("perfil.deporte_disponibilidad"), opts:["Mañanas","Tardes","Noches","Fines de semana","Flexible"] },
                  { key:"tipo_partida",   label:tx("perfil.deporte_tipo_partida"),   opts:["Amistosa","Competitiva","Torneo","Entrenamiento"] },
                  { key:"objetivo",       label:tx("perfil.deporte_objetivo"),       opts:["Mejorar nivel","Competir","Jugar socialmente","Encontrar pareja"] },
                  { key:"busqueda",       label:tx("perfil.deporte_busqueda"),       opts:["Disponible para partidos","No disponible","Solo torneos","Buscando pareja"] },
                ].map(({ key, label, opts }) => (
                  <div key={key}>
                    <label style={ls}>{label}</label>
                    <select value={deporteDraft[key]||""} onChange={e => setDeporteDraft(p => ({...p,[key]:e.target.value}))} style={ss}>
                      <option value="">— Sin definir —</option>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ display:"flex", gap:8, marginTop:4 }}>
                  <Btn onClick={saveDeporte} style={{ fontSize:".82rem" }}>{tx("perfil.deporte_guardar")}</Btn>
                  <Btn variant="secondary" onClick={cancelDeporteEdit} style={{ fontSize:".82rem" }}>{tx("perfil.bio_cancelar")}</Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAMBIAR CONTRASEÑA */}
        <div style={cs}>
          <h3 style={hs}>🔐 {tx("perfil.cambiar_pwd")}</h3>
          <p style={{ color:T.textDim, fontSize:".8rem", marginBottom:14, lineHeight:1.5, marginTop:10 }}>
            Modo demo local. En producción se validará desde backend de autenticación segura.
          </p>
          <form onSubmit={handleChangePwd} style={{ display:"grid", gap:10 }}>
            <input type="password" placeholder={tx("perfil.pwd_actual")} value={pwdActual} onChange={e=>setPwdActual(e.target.value)} autoComplete="current-password" />
            <input type="password" placeholder={tx("perfil.pwd_nueva")} value={pwdNueva} onChange={e=>setPwdNueva(e.target.value)} autoComplete="new-password" />
            <input type="password" placeholder={tx("perfil.pwd_confirmar")} value={pwdConfirmar} onChange={e=>setPwdConfirmar(e.target.value)} autoComplete="new-password" />
            {pwdError && <div style={{ color:T.danger, fontWeight:700, fontSize:".85rem" }}>{pwdError}</div>}
            {pwdMsg   && <div style={{ color:T.accent, fontWeight:700, fontSize:".85rem" }}>{pwdMsg}</div>}
            <Btn type="submit" style={{ marginTop:4 }}>{tx("perfil.cambiar_pwd")}</Btn>
          </form>
        </div>
      </div>

      {/* ── MÉTRICAS DEPORTIVAS ── */}
      <div style={{ marginBottom:24 }}>
        <h3 style={{ color:T.text, fontFamily:T.fontDisplay, fontSize:"1.05rem", marginBottom:14, letterSpacing:".04em" }}>📊 {tx("perfil.metricas_titulo")}</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))", gap:12 }}>
          {[
            { icon:"🎾", label:tx("perfil.metricas_partidos"),  value:metrics.partidos },
            { icon:"📋", label:tx("perfil.metricas_reservas"),  value:metrics.reservas },
            { icon:"🏆", label:tx("perfil.metricas_torneos"),   value:metrics.torneos },
            { icon:"📈", label:tx("perfil.metricas_ranking"),   value:typeof metrics.ranking==="number"?"#"+metrics.ranking:metrics.ranking },
            { icon:"⚡", label:tx("perfil.metricas_actividad"), value:metrics.actividad },
            { icon:"⭐", label:tx("perfil.metricas_valoracion"),value:metrics.valoracion+"/5" },
            { icon:"✅", label:tx("perfil.metricas_fiabilidad"),value:metrics.fiabilidad+"%" },
            { icon:"🔥", label:tx("perfil.metricas_racha"),     value:metrics.racha+" días" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background:T.surface2, border:`1px solid ${T.line}`, borderRadius:16, padding:"16px 14px", textAlign:"center" }}>
              <div style={{ fontSize:"1.4rem", marginBottom:6 }}>{icon}</div>
              <div style={{ color:T.text, fontWeight:900, fontSize:"1.1rem", fontFamily:T.fontDisplay }}>{value}</div>
              <div style={{ color:T.textDim, fontSize:".7rem", marginTop:4, letterSpacing:".03em", lineHeight:1.3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MOMENTOS DEL JUGADOR — solo jugador ── */}
      {isPlayer && (
        <div style={{ marginBottom:24 }}>
          <h3 style={{ color:T.text, fontFamily:T.fontDisplay, fontSize:"1.05rem", marginBottom:14, letterSpacing:".04em" }}>🗓️ {tx("perfil.historial_titulo")}</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:12 }}>
            {recentActivity.map((act, i) => (
              <div key={i} style={{ background:T.surface2, border:`1px solid ${T.line}`, borderRadius:14, padding:"14px 16px", display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:"1.4rem", flexShrink:0 }}>{act.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:T.text, fontSize:".86rem", fontWeight:700, marginBottom:2 }}>{act.desc}</div>
                  <div style={{ color:T.textDim, fontSize:".74rem" }}>{act.fecha}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INSIGNIAS Y LOGROS ── */}
      <div style={{ marginBottom:24 }}>
        <h3 style={{ color:T.text, fontFamily:T.fontDisplay, fontSize:"1.05rem", marginBottom:14, letterSpacing:".04em" }}>🎖️ {tx("perfil.insignias_titulo")}</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(138px,1fr))", gap:10 }}>
          {allBadges.map(badge => (
            <div key={badge.id} style={{ background:badge.earned?`${T.accent}12`:T.surface2, border:`1px solid ${badge.earned?T.accent+"44":T.line}`, borderRadius:14, padding:"14px 12px", textAlign:"center", opacity:badge.earned?1:0.4, transition:"all .2s" }}>
              <div style={{ fontSize:"1.6rem", marginBottom:6 }}>{badge.icon}</div>
              <div style={{ color:badge.earned?T.accent:T.textDim, fontWeight:800, fontSize:".77rem", lineHeight:1.35, marginBottom:4 }}>{badge.label}</div>
              <div style={{ color:T.textDim, fontSize:".68rem", lineHeight:1.4 }}>{badge.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRIVACIDAD ── */}
      <div style={{ marginBottom:24 }}>
        <div style={cs}>
          <h3 style={{ ...hs, marginBottom:10 }}>🔒 {tx("perfil.privacidad_config")}</h3>
          <p style={{ color:T.textDim, fontSize:".82rem", marginBottom:18, lineHeight:1.5 }}>{tx("perfil.privacidad_desc")}</p>
          <div style={{ display:"grid", gap:10 }}>
            {[
              { key:"perfil_visible",  label:tx("perfil.privacidad_perfil_visible"),  def:true  },
              { key:"mostrar_nivel",   label:tx("perfil.privacidad_nivel"),            def:true  },
              { key:"mostrar_disp",    label:tx("perfil.privacidad_disponibilidad"),   def:isPlayer },
              { key:"mostrar_stats",   label:tx("perfil.privacidad_stats"),            def:true  },
              { key:"invitaciones",    label:tx("perfil.privacidad_invitaciones"),     def:isPlayer },
              { key:"recomendaciones", label:tx("perfil.privacidad_recomendaciones"), def:isPlayer },
            ].map(({ key, label, def }) => {
              const val = privacidad[key] !== undefined ? privacidad[key] : def;
              return (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.line}` }}>
                  <span style={{ color:T.text, fontSize:".86rem" }}>{label}</span>
                  <button
                    onClick={() => togglePriv(key, def)}
                    style={{ background:val?T.accent:T.surface3, border:`1px solid ${val?T.accent:T.line}`, borderRadius:20, width:44, height:24, cursor:"pointer", position:"relative", transition:"all .2s", flexShrink:0 }}
                    aria-label={label}
                    type="button"
                  >
                    <div style={{ position:"absolute", top:3, left:val?22:3, width:16, height:16, borderRadius:"50%", background:val?T.surface:T.textDim, transition:"left .2s" }} />
                  </button>
                </div>
              );
            })}
          </div>
          {privMsg && <div style={{ color:T.accent, fontWeight:700, fontSize:".82rem", marginTop:12 }}>{privMsg}</div>}
          <p style={{ color:T.textDim, fontSize:".76rem", lineHeight:1.6, marginTop:16, borderTop:`1px solid ${T.line}`, paddingTop:12 }}>
            {tx("perfil.info_demo")} En producción real se aplicará política de privacidad completa conforme al RGPD / normativa aplicable.
          </p>
        </div>
      </div>

      {/* ── MIS DERECHOS GDPR (flujo #9, Make 6323457) ── */}
      <div style={{ marginBottom:24 }}>
        <div style={cs}>
          <h3 style={{ ...hs, marginBottom:10 }}>⚖️ Mis derechos GDPR</h3>
          <p style={{ color:T.textDim, fontSize:".82rem", marginBottom:18, lineHeight:1.5 }}>
            Solicita una copia de tus datos personales o pide su eliminación, conforme al RGPD.
          </p>

          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <Btn variant="secondary" onClick={handleGdprAcceso} disabled={gdprAccesoLoading}>
              {gdprAccesoLoading ? "Consultando…" : "Solicitar mis datos"}
            </Btn>
            <Btn variant="danger" onClick={() => setGdprOlvidoConfirming(true)} disabled={gdprOlvidoLoading}>
              Solicitar eliminación de mis datos
            </Btn>
          </div>

          {gdprAccesoError && <div style={{ color:T.danger, fontSize:".82rem", marginTop:12 }}>{gdprAccesoError}</div>}
          {gdprAccesoResult && (
            <div style={{ marginTop:16, padding:14, border:`1px solid ${T.line}`, borderRadius:12, fontSize:".82rem", lineHeight:1.6 }}>
              <div style={{ color:T.text, fontWeight:700, marginBottom:6 }}>Datos generados el {new Date(gdprAccesoResult.generado_en).toLocaleString()}</div>
              <div style={{ color:T.textDim }}>Identidad: {gdprAccesoResult.datos.identidad.disponible ? "disponible" : `no disponible (${gdprAccesoResult.datos.identidad.motivo})`}</div>
              <div style={{ color:T.textDim }}>Reservas: {gdprAccesoResult.datos.reservas.disponible ? `${gdprAccesoResult.datos.reservas.registros.length} registro(s)` : `no disponible (${gdprAccesoResult.datos.reservas.motivo})`}</div>
              <div style={{ color:T.textDim }}>Lista de espera / competiciones / logs: no disponibles todavía (fuente no configurada en este entorno).</div>
              <div style={{ color:T.textDim, fontSize:".74rem", marginTop:8 }}>
                Registro en Make: {gdprAccesoResult.auditoria.registrado_en_make ? "sí" : `no — ${gdprAccesoResult.auditoria.detalle}`}
              </div>
            </div>
          )}

          {gdprOlvidoConfirming && (
            <div style={{ marginTop:16, padding:14, border:`1px solid ${T.danger}66`, borderRadius:12 }}>
              <p style={{ color:T.text, fontWeight:700, fontSize:".86rem", marginTop:0, marginBottom:6 }}>
                ¿Seguro que quieres solicitar la eliminación de tus datos?
              </p>
              <p style={{ color:T.textDim, fontSize:".8rem", lineHeight:1.5, marginBottom:14 }}>
                Esto NO es lo mismo que darte de baja del club. Se registrará tu solicitud para revisión
                (comprobación de reservas futuras y otras dependencias antes de ejecutar nada) — no se borra nada al instante.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <Btn variant="danger" onClick={handleGdprOlvido} disabled={gdprOlvidoLoading}>
                  {gdprOlvidoLoading ? "Enviando…" : "Sí, solicitar eliminación"}
                </Btn>
                <Btn variant="secondary" onClick={() => setGdprOlvidoConfirming(false)} disabled={gdprOlvidoLoading}>
                  Cancelar
                </Btn>
              </div>
            </div>
          )}

          {gdprOlvidoError && <div style={{ color:T.danger, fontSize:".82rem", marginTop:12 }}>{gdprOlvidoError}</div>}
          {gdprOlvidoResult && (
            <div style={{ marginTop:16, padding:14, border:`1px solid ${T.line}`, borderRadius:12, fontSize:".82rem", lineHeight:1.6 }}>
              <div style={{ color:T.text, fontWeight:700, marginBottom:6 }}>Solicitud registrada — estado: {gdprOlvidoResult.estado}</div>
              {gdprOlvidoResult.dependencias?.reservas_futuras?.verificable && (
                <div style={{ color:T.textDim }}>Reservas futuras detectadas: {gdprOlvidoResult.dependencias.reservas_futuras.cantidad}</div>
              )}
              <div style={{ color:T.textDim }}>Lista de espera: no verificable en este entorno (requiere revisión manual).</div>
              <div style={{ color:T.textDim, fontSize:".74rem", marginTop:8 }}>
                Registro en Make: {gdprOlvidoResult.auditoria.registrado_en_make ? "sí" : `no — ${gdprOlvidoResult.auditoria.detalle}`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── NOTIFICACIONES ── */}
      <div style={cs}>
        <h3 style={{ ...hs, marginBottom:10 }}>🔔 {tx("perfil.notificaciones")}</h3>
        <p style={{ color:T.textDim, lineHeight:1.6, marginBottom:14 }}>{tx("perfil.notif_desc")}</p>
        <div style={{ padding:"12px 16px", border:`1px dashed ${T.line}`, borderRadius:14, color:T.textDim, fontSize:".84rem", lineHeight:1.7 }}>
          Confirmaciones de reserva &nbsp;·&nbsp; recordatorios de partido &nbsp;·&nbsp; torneos &nbsp;·&nbsp; cambios de horario
          <div style={{ marginTop:6, fontSize:".75rem", color:T.textDim }}>
            Preparado para integración con correo y mensajería desde backend real.
          </div>
        </div>
      </div>

    </div>
  );
}

// ============================================================
// PWA status banners: offline / actualización disponible
// ============================================================
// Independientes de auth/rol a propósito: deben poder verse tanto en la
// pantalla de login como dentro de la app ya autenticada. No leen ni
// escriben ningún estado de sesión/rol.
function PwaStatusBanners() {
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState(null);

  useEffect(() => {
    function goOffline() { setIsOffline(true); }
    function goOnline() { setIsOffline(false); }
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  useEffect(() => {
    function onUpdateAvailable(event) { setUpdateRegistration(event.detail?.registration || null); }
    window.addEventListener("cp04:sw-update-available", onUpdateAvailable);
    return () => window.removeEventListener("cp04:sw-update-available", onUpdateAvailable);
  }, []);

  async function retryConnection() {
    setCheckingConnection(true);
    try {
      await fetch("/favicon.svg", { method: "HEAD", cache: "no-store" });
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    } finally {
      setCheckingConnection(false);
    }
  }

  function applyUpdate() {
    const waiting = updateRegistration?.waiting;
    if (!waiting) return;
    waiting.postMessage({ type: "SKIP_WAITING" });
    setUpdateRegistration(null);
  }

  if (!isOffline && !updateRegistration) return null;

  // Prompt 4 (Mejora 2.6, 2026-07-26): el botón interno usaba
  // background:"rgba(0,0,0,.12)" — sobre el fondo de aviso (T.danger o
  // T.accent) eso da contraste 4.02:1, justo por debajo del 4.5:1 de
  // WCAG AA (medido). Quitado el overlay: el texto hereda directamente
  // el color ya elegido a propósito para cada fondo (>6:1 medido).
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 200, display: "flex", flexDirection: "column", gap: 2 }}>
      {isOffline && (
        <div role="status" aria-live="polite" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, padding: "10px 16px", background: T.danger, color: "#2a0700", fontWeight: 800, fontSize: ".85rem", textAlign: "center" }}>
          <span>Sin conexión a internet. Algunas funciones pueden no estar disponibles.</span>
          <button
            type="button"
            onClick={retryConnection}
            disabled={checkingConnection}
            style={{ minHeight: 36, padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,.3)", background: "transparent", color: "inherit", fontWeight: 800, cursor: checkingConnection ? "wait" : "pointer" }}
          >
            {checkingConnection ? "Comprobando…" : "Reintentar"}
          </button>
        </div>
      )}
      {!isOffline && updateRegistration && (
        <div role="status" aria-live="polite" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, padding: "10px 16px", background: T.accent, color: "#06100a", fontWeight: 800, fontSize: ".85rem", textAlign: "center" }}>
          <span>Hay una nueva versión de Club Pádel 04 disponible.</span>
          <button
            type="button"
            onClick={applyUpdate}
            style={{ minHeight: 36, padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,.3)", background: "transparent", color: "inherit", fontWeight: 800, cursor: "pointer" }}
          >
            Actualizar ahora
          </button>
        </div>
      )}
    </div>
  );
}

export default function ClubPadel04SaaSApp() {
  const auth = useAuth();
  const [current, setCurrent] = useState("inicio");
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem("cp04_role") || "");
  const [pendingRole, setPendingRole] = useState("");
  const [rolePassword, setRolePassword] = useState("");
  const [showRolePassword, setShowRolePassword] = useState(false);
  const [rememberRole, setRememberRole] = useState(true);
  const [roleError, setRoleError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tutorialRevision, setTutorialRevision] = useState(0);
  const [forgotPwdStep, setForgotPwdStep] = useState("idle");
  const [forgotPwdEmail, setForgotPwdEmail] = useState("");
  const [forgotPwdEmailError, setForgotPwdEmailError] = useState("");

  // Recovery callback: token capturado del hash de URL (type=recovery).
  // NUNCA se persiste en localStorage/sessionStorage.
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [recoveryStep, setRecoveryStep] = useState("form"); // "form"|"loading"|"success"|"error"
  const [recoveryPwd, setRecoveryPwd] = useState("");
  const [recoveryPwdConfirm, setRecoveryPwdConfirm] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [showRecoveryPwd, setShowRecoveryPwd] = useState(false);
  const [showRecoveryPwdConfirm, setShowRecoveryPwdConfirm] = useState(false);

  // Login universal preparado para producción.
  // Mantiene los perfiles demo internos sin obligar a usuarios reales a usar correos fijos.
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [registerOpen, setRegisterOpen] = useState(() => localStorage.getItem("cp04_register_open") === "true");
  const [registerName, setRegisterName] = useState(() => localStorage.getItem("cp04_register_name") || "");
  const [registerEmail, setRegisterEmail] = useState(() => localStorage.getItem("cp04_register_email") || "");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerDone, setRegisterDone] = useState(() => localStorage.getItem("cp04_register_done") === "true");

  // La restauración de sesión real (¿sigue siendo válido el token guardado?)
  // ya no vive aquí: la posee AuthContext (src/auth/AuthContext.jsx), que la
  // dispara una sola vez al montar la app completa. Este efecto solo hace de
  // puente hacia el `selectedRole` heredado que usa el resto del componente
  // para navegación/menús: si AuthContext confirma una sesión backend real,
  // reflejamos su rol verificado aquí. Si no hay sesión real (auth.role es
  // null, incluyendo todo el flujo de login demo), no tocamos selectedRole:
  // ese caso lo sigue gestionando confirmRoleAccess/clearRole como hasta ahora.
  //
  // Excepción documentada a react-hooks/set-state-in-effect: la alternativa
  // "derivar en render" (sin efecto) rompe selectedRole en el flujo
  // logout→login con el MISMO rol, porque auth.role no cambia de valor entre
  // ambos logins y un cálculo derivado no volvería a disparar el bridge —
  // selectedRole se quedaría vacío tras el logout. El efecto sí lo cubre
  // porque su dependencia auth.isAuthenticated pasa por false en el logout,
  // re-disparando el efecto en el siguiente login aunque el rol se repita.
  // Verificado en sesión 2026-07-29 (revisión P1.3) — evaluado de nuevo en
  // el cierre técnico global del 2026-07-30 antes de aceptar la excepción.
  useEffect(() => {
    if (auth.isAuthenticated && auth.role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza selectedRole con la sesión backend verificada; ver justificación arriba
      setSelectedRole(auth.role);
      setLoginError("");
    }
  }, [auth.isAuthenticated, auth.role]);

  // Detecta el callback de recuperación de Supabase Auth al montar la SPA.
  // Supabase envía el enlace con #access_token=...&type=recovery en el hash.
  // El token se captura SOLO en estado React — nunca en localStorage/sessionStorage.
  // El hash se limpia de inmediato con history.replaceState para no dejar
  // tokens sensibles en la URL visible ni en el historial del navegador.
  useEffect(() => {
    const raw = window.location.hash;
    if (!raw) return;

    const params = new URLSearchParams(raw.slice(1));
    if (params.get("type") !== "recovery") return;

    const token = params.get("access_token");
    if (!token) return;

    setRecoveryToken(token);
    setRecoveryMode(true);
    setRecoveryStep("form");

    try {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch { /* no bloquear si el entorno no permite replaceState */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- solo ejecuta al montar

  const menuButtonRef = useRef(null);
  const modules = { inicio: <Inicio navigate={navigate} selectedRole={selectedRole} />, reservas: <Reservas />, alta_jugador: <AltaJugador />, baja_jugador: <AltaJugador initialModo="baja" />, reprogramar: <ReprogramarReserva setCurrent={setCurrent} />, cancelar: <CancelarReserva setCurrent={setCurrent} />, gestion: <Gestion />, cierre_pistas: <CierreTemporalPista />, lista_espera: <ListaEspera />, control_qr: <ControlQrAccesos />, pistas_recordatorios: <PistasLibresRecordatorios />, comunicaciones_socio: <ComunicacionesSocio />, calendario_disponibilidad: <CalendarioDisponibilidadModulo />, torneos: <Torneos selectedRole={selectedRole} />, ranking: <Ranking />, comunidad: <LazyComunidad selectedRole={selectedRole} />, admin: <Admin />, dashboard_kpi: <DashboardKpiNps />, backups_seguridad: <BackupsSeguridad />, facturacion_pagos: <FacturacionPagos />, automatizaciones_bots: <AutomatizacionesBots />, flujos_make: <LazyCentroTecnico selectedRole={selectedRole} />, soporte: <Soporte />, perfil: <Perfil selectedRole={selectedRole} onClearRole={clearRole} onOpenTutorial={() => setTutorialRevision((v) => v + 1)} /> };
  // Defensa en profundidad: aunque navigate() ya filtra por permisos, el
  // render nunca debe confiar únicamente en que `current` llegó por esa vía.
  // Si en el futuro algo hace setCurrent() directo a una sección protegida,
  // esto la bloquea igualmente en el último paso antes de pintar en pantalla.
  const safeCurrentSection = cp04CanAccessSection(selectedRole, current)
    ? current
    : cp04GetSafeStartSection(selectedRole);

  // Estado de pantalla (rol/módulo activo -> clases y fondo del body) —
  // única fuente de verdad, ver src/utils/screenState.js. Sustituye a los
  // antiguos internal-background-detector.js / role-background-detector.js,
  // que escaneaban document.body.innerText en español y fallaban en
  // idiomas cuya traducción no contuviera esas palabras exactas (ver
  // docs/mejora-2-visual-identity-audit-20260724/14-*.md). Aquí depende
  // solo de selectedRole/safeCurrentSection, nunca del idioma activo.
  useEffect(() => {
    const screenState = cp04ComputeScreenState({ selectedRole, moduleId: safeCurrentSection });
    cp04ApplyScreenState(screenState);
  }, [selectedRole, safeCurrentSection]);

  // Las contraseñas demo ya no viven aquí: están aisladas en
  // src/auth/demoAuthAdapter.js, gateadas por isDemoAuthAllowed() (solo
  // desarrollo). Este objeto solo guarda las etiquetas de UI del selector
  // de rol, que no son sensibles.
  const roleConfig = {
    PLAYER: {
      label: "Jugador / cliente",
      desc: "Reservar pistas, consultar reservas y ranking.",
      start: "inicio",
    },
    STAFF: {
      label: "Staff / recepción",
      desc: "Gestión diaria de reservas, altas y atención al jugador.",
      start: "gestion",
    },
    ADMIN: {
      label: "Administrador / jefe",
      desc: "Panel de dirección, métricas y control operativo.",
      start: "admin",
    },
    SUPPORT: {
      label: "Soporte técnico",
      desc: "Zona técnica, integraciones y diagnóstico interno.",
      start: "soporte",
    },
  };

  function selectRole(roleId) {
    setPendingRole(roleId);
    setRolePassword("");
    setShowRolePassword(false);
    setRoleError("");
  }

  function confirmRoleAccess(event) {
    event.preventDefault();

    const role = roleConfig[pendingRole];
    if (!role) {
      setRoleError("Selecciona un rol válido.");
      return;
    }

    // La verificación de contraseña demo vive en demoAuthAdapter, aislada y
    // gateada a solo-desarrollo: en un build de producción esto se deniega
    // aunque la contraseña sea correcta (fail-closed, no fallback silencioso
    // a demo).
    const demoAuth = verifyDemoRolePassword(pendingRole, rolePassword);
    if (!demoAuth.ok) {
      setRoleError(demoAuth.message || "Contraseña incorrecta para este rol.");
      return;
    }

    if (rememberRole) {
      localStorage.setItem("cp04_role", pendingRole);
    } else {
      localStorage.removeItem("cp04_role");
    }
    setSelectedRole(pendingRole);
    setCurrent(role.start || "inicio");
    setPendingRole("");
    setRolePassword("");
    setShowRolePassword(false);
    setRoleError("");
  }

  function clearRole() {
    // auth.logout() ya limpia la sesión backend real (token/user/rol,
    // best-effort contra /api/auth/logout) a través de authService. Esto de
    // aquí solo limpia lo que sigue siendo estado local de la demo/UI:
    // el rol demo elegido (cp04_role, cuando no vino de un login real) y los
    // formularios en curso. Ningún permiso del siguiente usuario puede
    // heredar nada de esto: todo queda a cero.
    localStorage.removeItem("cp04_role");

    setSelectedRole("");
    setPendingRole("");
    setRolePassword("");
    setRoleError("");
    setShowRolePassword(false);
    setLoginEmail("");
    setLoginPassword("");
    setShowLoginPassword(false);
    setLoginError("");
    setMobileMenuOpen(false);

    auth.logout().catch(() => {});
  }


  async function handleUniversalLogin(event) {
    event.preventDefault();

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setLoginError("Introduce un correo electrónico válido.");
      return;
    }

    if (cleanPassword.length < 4) {
      setLoginError("Introduce una contraseña válida.");
      return;
    }

    try {
      setLoginError("");

      // Toda la lógica de red/token/rol vive ahora en authService a través
      // de AuthContext: el rol SOLO puede venir del backend autenticado
      // (auth.login nunca deriva un rol de patrones en el email).
      const result = await auth.login(cleanEmail, cleanPassword);

      if (!result.ok) {
        setLoginError(result.message || "No se pudo iniciar sesión.");
        return;
      }

      setSelectedRole(cp04NormalizeRole(result.role));
      setLoginError("");
      setLoginPassword("");
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("CP04_LOGIN_FRONTEND_ERROR", error);
      setLoginError(`No se pudo completar el inicio de sesión. Detalle: ${error?.message || "error desconocido"}`);
    }
  }

  async function handleRegisterSubmit(event) {
    event?.preventDefault?.();

    const cleanName = registerName.trim();
    const cleanEmail = registerEmail.trim().toLowerCase();
    const cleanPassword = registerPassword.trim();
    const cleanConfirm = registerConfirm.trim();

    if (cleanName.length < 2) {
      setRegisterError("Introduce tu nombre.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setRegisterError("Introduce un correo electrónico válido.");
      return;
    }

    if (cleanPassword.length < 8) {
      setRegisterError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setRegisterError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setRegisterError("");
      setRegisterDone(false);

      // Misma capa que login/logout/cambio de contraseña: la red, el
      // manejo de errores y la estructura de respuesta viven en
      // authService, no en App.jsx.
      const result = await auth.register({ name: cleanName, email: cleanEmail, password: cleanPassword });

      if (!result.ok) {
        setRegisterError(result.message || "No se pudo crear la cuenta.");
        return;
      }

      localStorage.setItem("cp04_register_open", "true");
      localStorage.setItem("cp04_register_done", "true");
      setRegisterDone(true);
      setLoginEmail(cleanEmail);
      localStorage.setItem("cp04_register_name", cleanName);
      localStorage.setItem("cp04_register_email", cleanEmail);
      setRegisterPassword("");
      setRegisterConfirm("");
    } catch (error) {
      console.error("CP04_REGISTER_FRONTEND_ERROR", error);
      setRegisterError(`No se pudo completar el registro. Detalle: ${error?.message || "error desconocido"}`);
    }
  }

  function openRegister() {
    localStorage.setItem("cp04_register_open", "true");
    localStorage.setItem("cp04_register_done", "false");
    setRegisterOpen(true);
    setRegisterDone(false);
    setRegisterError("");

    const savedName = localStorage.getItem("cp04_register_name") || "";
    const savedEmail = localStorage.getItem("cp04_register_email") || loginEmail || "";

    setRegisterName(savedName);
    setRegisterEmail(savedEmail);
    setRegisterPassword("");
    setRegisterConfirm("");
  }

  function closeRegister() {
    localStorage.setItem("cp04_register_open", "false");
    localStorage.setItem("cp04_register_done", "false");
    setRegisterOpen(false);
    setRegisterDone(false);
    setRegisterError("");
    setRegisterPassword("");
    setRegisterConfirm("");
  }

  function openForgotPwd() {
    setForgotPwdStep("form");
    setForgotPwdEmail("");
    setForgotPwdEmailError("");
  }

  function closeForgotPwd() {
    setForgotPwdStep("idle");
    setForgotPwdEmail("");
    setForgotPwdEmailError("");
  }

  async function handleForgotPwdSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(forgotPwdEmail.trim())) {
      setForgotPwdEmailError("Introduce un email válido.");
      return;
    }

    setForgotPwdStep("loading");

    // Llamada real a auth.recoverPassword (POST /api/auth/forgot-password).
    // result.authReady distingue si el backend tiene proveedor configurado
    // (Supabase) de si sigue en modo backend_stub: NUNCA se muestra el
    // mismo mensaje de éxito en ambos casos, porque en el segundo no se ha
    // enviado ningún email de verdad. Mostrar "sent" ahí sería seguridad de
    // attrezzo (Fase 8 del prompt maestro).
    const result = await auth.recoverPassword(forgotPwdEmail.trim().toLowerCase());

    if (result.authReady) {
      // Respuesta siempre neutra por diseño anti-enumeration: no revela si
      // el email existe o no, tanto si el envío real fue posible como si no.
      setForgotPwdStep("sent");
    } else {
      setForgotPwdStep("unavailable");
    }
  }

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.querySelector("#cp04-mobile-menu button")?.focus();

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
    const safeRole = cp04NormalizeRole(selectedRole);
    const safeSection = String(section || "inicio").trim();

    if (!cp04CanAccessSection(safeRole, safeSection)) {
      setCurrent(cp04GetSafeStartSection(safeRole));
      setMobileMenuOpen(false);
      return;
    }

    setCurrent(safeSection);
    setMobileMenuOpen(false);
  }


  async function handleRecoverySubmit(e) {
    e.preventDefault();
    setRecoveryError("");

    const valid = /[A-Z]/.test(recoveryPwd) && /[a-z]/.test(recoveryPwd) && /[0-9]/.test(recoveryPwd) && recoveryPwd.length >= 8;
    if (!valid) { setRecoveryError("Mínimo 8 caracteres, mayúscula, minúscula y número."); return; }
    if (recoveryPwd !== recoveryPwdConfirm) { setRecoveryError("Las contraseñas no coinciden."); return; }
    if (!recoveryToken) { setRecoveryError("Token de recuperación no disponible. Solicita de nuevo el enlace."); return; }

    setRecoveryStep("loading");

    const result = await auth.updatePasswordWithToken(recoveryPwd, recoveryToken);

    if (!result.ok) {
      setRecoveryError(result.message || "No se pudo actualizar la contraseña.");
      setRecoveryStep("error");
      return;
    }

    // Token consumido: borrar de memoria inmediatamente
    setRecoveryToken(null);
    setRecoveryStep("success");
  }

  function handleRecoveryCancel() {
    setRecoveryMode(false);
    setRecoveryToken(null);
    setRecoveryStep("form");
    setRecoveryPwd("");
    setRecoveryPwdConfirm("");
    setRecoveryError("");
    setShowRecoveryPwd(false);
    setShowRecoveryPwdConfirm(false);
  }

  const loginClock = useClock();
  const loginLang = useLang();
  const ltx = key => t(key, loginLang);

  if (recoveryMode) {
    return (
      <>
        <style>{globalStyles}</style>
        <PwaStatusBanners />
        <main style={{ minHeight:"100vh", display:"grid", placeItems:"center", padding:"42px 24px", background:`radial-gradient(circle at 20% 10%, rgba(182,255,0,.18), transparent 32%), radial-gradient(circle at 80% 20%, rgba(47,107,255,.16), transparent 34%), ${T.bg}`, color:T.text }}>
          <section style={{ width:"min(520px, 100%)", border:`1px solid ${T.line}`, borderRadius:34, padding:"clamp(24px, 4vw, 42px)", background:"linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.03))", boxShadow:"0 24px 90px rgba(0,0,0,.45)" }}>
            <div style={{ color:T.accent, fontSize:".78rem", letterSpacing:".22em", textTransform:"uppercase", fontWeight:900, marginBottom:18 }}>
              Club Pádel 04
            </div>
            <h1 style={{ fontFamily:T.fontDisplay, fontSize:"clamp(1.8rem, 5vw, 2.8rem)", lineHeight:"1.1", letterSpacing:"-.04em", margin:"0 0 8px" }}>
              Nueva contraseña
            </h1>
            <p style={{ color:T.textDim, marginTop:0, marginBottom:24, lineHeight:1.6, fontSize:".95rem" }}>
              Introduce y confirma la nueva contraseña para tu cuenta.
            </p>

            {recoveryStep === "success" ? (
              <>
                <div style={{ color:T.accent, fontWeight:900, fontSize:"1.8rem", marginBottom:12 }}>✓</div>
                <strong style={{ display:"block", marginBottom:8, fontSize:"1.1rem" }}>Contraseña actualizada correctamente.</strong>
                <p style={{ color:T.textDim, marginBottom:24, lineHeight:1.6 }}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
                <button type="button" onClick={handleRecoveryCancel} style={{ padding:"13px 22px", borderRadius:14, border:`1px solid ${T.line}`, background:"transparent", color:T.text, fontWeight:800, cursor:"pointer", fontSize:"1rem" }}>
                  Ir al inicio de sesión
                </button>
              </>
            ) : (
              <form onSubmit={handleRecoverySubmit} style={{ display:"grid", gap:12 }}>
                <div style={{ position:"relative" }}>
                  <input
                    type={showRecoveryPwd ? "text" : "password"}
                    value={recoveryPwd}
                    onChange={e => { setRecoveryPwd(e.target.value); setRecoveryError(""); }}
                    placeholder="Nueva contraseña"
                    autoComplete="new-password"
                    autoFocus
                    disabled={recoveryStep === "loading"}
                    style={{ width:"100%", padding:"14px 48px 14px 16px", borderRadius:14, border:`1px solid ${recoveryError ? T.dangerBorder : T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", boxSizing:"border-box" }}
                  />
                  <button
                    type="button"
                    aria-label={showRecoveryPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowRecoveryPwd(v => !v)}
                    disabled={recoveryStep === "loading"}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:T.textDim, cursor:"pointer", padding:4, display:"flex", alignItems:"center", lineHeight:1 }}
                  >
                    {showRecoveryPwd ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div style={{ position:"relative" }}>
                  <input
                    type={showRecoveryPwdConfirm ? "text" : "password"}
                    value={recoveryPwdConfirm}
                    onChange={e => { setRecoveryPwdConfirm(e.target.value); setRecoveryError(""); }}
                    placeholder="Confirmar nueva contraseña"
                    autoComplete="new-password"
                    disabled={recoveryStep === "loading"}
                    style={{ width:"100%", padding:"14px 48px 14px 16px", borderRadius:14, border:`1px solid ${recoveryError ? T.dangerBorder : T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", boxSizing:"border-box" }}
                  />
                  <button
                    type="button"
                    aria-label={showRecoveryPwdConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowRecoveryPwdConfirm(v => !v)}
                    disabled={recoveryStep === "loading"}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:T.textDim, cursor:"pointer", padding:4, display:"flex", alignItems:"center", lineHeight:1 }}
                  >
                    {showRecoveryPwdConfirm ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {recoveryError && (
                  <div role="alert" style={{ color:T.dangerText, fontSize:".88rem" }}>{recoveryError}</div>
                )}
                <p style={{ color:T.textDim, fontSize:".82rem", margin:"0", lineHeight:1.5 }}>
                  Mínimo 8 caracteres, mayúscula, minúscula y número.
                </p>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:4 }}>
                  <button
                    type="submit"
                    disabled={recoveryStep === "loading"}
                    style={{ padding:"13px 22px", borderRadius:14, border:"none", background:T.accent, color:"#ffffff", fontWeight:900, cursor:recoveryStep === "loading" ? "wait" : "pointer", fontSize:"1rem", opacity:recoveryStep === "loading" ? 0.7 : 1 }}
                  >
                    {recoveryStep === "loading" ? "Actualizando…" : "Establecer contraseña"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRecoveryCancel}
                    disabled={recoveryStep === "loading"}
                    style={{ padding:"13px 22px", borderRadius:14, border:`1px solid ${T.line}`, background:"transparent", color:T.text, fontWeight:800, cursor:recoveryStep === "loading" ? "not-allowed" : "pointer", fontSize:"1rem" }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </section>
        </main>
      </>
    );
  }

  if (!selectedRole) {
    const roleLabels = {
      PLAYER:  { label: ltx("role.PLAYER.label"),  desc: ltx("role.PLAYER.desc")  },
      STAFF:   { label: ltx("role.STAFF.label"),   desc: ltx("role.STAFF.desc")   },
      ADMIN:   { label: ltx("role.ADMIN.label"),   desc: ltx("role.ADMIN.desc")   },
      SUPPORT: { label: ltx("role.SUPPORT.label"), desc: ltx("role.SUPPORT.desc") },
    };
    return (
      <>
        <style>{globalStyles}</style>
        <PwaStatusBanners />
        <main style={{ minHeight:"100vh", display:"grid", placeItems:"center", padding:"42px 24px", background:"radial-gradient(circle at 20% 10%, rgba(182,255,0,.18), transparent 32%), radial-gradient(circle at 80% 20%, rgba(47,107,255,.16), transparent 34%), #050910", color:"white" }}>
          <section style={{ width:"min(1080px, 100%)", border:"1px solid rgba(255,255,255,.12)", borderRadius:34, padding:"clamp(24px, 4vw, 48px)", background:"linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.03))", boxShadow:"0 24px 90px rgba(0,0,0,.45)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:18 }}>
              <div style={{ color:T.accent, fontSize:".78rem", letterSpacing:".22em", textTransform:"uppercase", fontWeight:900 }}>
                {ltx("login.sesion_label")}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div style={{ minWidth:180, maxWidth:220 }}><LanguageSelector /></div>
                <div style={{ fontFamily:"monospace", textAlign:"right" }}>
                  <div style={{ color:T.accent, fontWeight:900, fontSize:"1.15rem", letterSpacing:".05em" }}>{loginClock.time}</div>
                  <div style={{ color:T.textDim, fontSize:".72rem", marginTop:2 }}>{loginClock.day}, {loginClock.date}</div>
                </div>
              </div>
            </div>

            <h1 style={{ fontFamily:T.fontDisplay, fontSize:"clamp(2.6rem, 7vw, 5.8rem)", lineHeight:".9", letterSpacing:"-.07em", margin:"0 0 20px" }}>
              {ltx("login.title").split(" ").slice(0,-1).join(" ")} <span style={{ color:T.accent }}>{ltx("login.title").split(" ").slice(-1)}</span>
            </h1>

            <p style={{ color:T.textDim, maxWidth:760, lineHeight:1.7, fontSize:"clamp(1rem, 2vw, 1.18rem)", marginBottom:34 }}>
              {ltx("login.subtitle")}
            </p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:22, marginBottom:26 }}>
        <form onSubmit={handleUniversalLogin} style={{ padding:22, border:`1px solid ${T.line}`, borderRadius:24, background:"rgba(5,10,18,.72)" }}>
          <div style={{ color:T.accent, fontWeight:900, letterSpacing:".08em", fontSize:".78rem", marginBottom:8 }}>
            ACCESO REAL
          </div>
          <strong style={{ display:"block", fontSize:"1.15rem", marginBottom:8 }}>
            Entrar con correo personal
          </strong>
          <p style={{ color:T.textDim, marginTop:0, marginBottom:16, lineHeight:1.55 }}>
            Usa tu email y contraseña. Los roles internos siguen disponibles abajo solo para validación interna.
          </p>
          <input
            type="email"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1px solid ${loginError ? T.dangerBorder : T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:10 }}
          />
          <input
            type={showLoginPassword ? "text" : "password"}
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            placeholder={ltx("login.password")}
            autoComplete="current-password"
            style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1px solid ${loginError ? T.dangerBorder : T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:10 }}
          />

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:12 }}>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(v => !v)}
                  style={{ border:"none", background:"transparent", color:T.accent, fontSize:".86rem", fontWeight:800, cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:3 }}
                >
                  {showLoginPassword ? "Ocultar contraseña" : "Ver contraseña"}
                </button>
                <button
                    type="button"
                    onClick={openRegister}
                    style={{ border:"none", background:"transparent", color:T.accent, fontSize:".86rem", fontWeight:800, cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:3 }}
                  >
                    Crear cuenta
                  </button>
                  <button
                  type="button"
                  onClick={openForgotPwd}
                  style={{ border:"none", background:"transparent", color:T.textDim, fontSize:".84rem", cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:3 }}
                >
                  {ltx("login.olvide_pwd")}
                </button>
              </div>
          {loginError && <div style={{ color:T.dangerText, marginBottom:12, fontWeight:800 }}>{loginError}</div>}
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
            {/* PASO 07K (2026-07-19): clase cp04-login-submit-btn añadida
                para poder forzar su contraste en torcal-role-background.css
                — esta pantalla activa `body.cp04-role-screen-active`, cuya
                regla genérica de fondo (`button { background-color:
                rgba(5,10,18,.22) !important; background-image: none
                !important }`) anulaba el fondo lima de este botón vía
                `!important`, dejándolo casi invisible. El estilo inline de
                abajo no puede ganarle a un `!important` de hoja de
                estilos, por eso la corrección real vive en el CSS. */}
            <button type="submit" className="cp04-menu-button cp04-login-submit-btn" style={{ width:"auto", borderColor:"rgba(182,255,0,.5)", background:T.accent, color:"#071000", fontWeight:900 }}>
              Iniciar sesión
            </button>

          </div>

              {registerOpen && (
                <div style={{ marginTop:18, padding:18, border:`1px solid ${T.line}`, borderRadius:22, background:"rgba(0,0,0,.28)" }}>
                  {!registerDone ? (
                    <div>
                      <strong style={{ display:"block", marginBottom:6 }}>Crear cuenta</strong>
                      <p style={{ color:T.textDim, marginTop:0, marginBottom:14, lineHeight:1.55, fontSize:".9rem" }}>
                        Crea tu acceso como jugador para reservar pistas, consultar actividad y gestionar tu perfil.
                      </p>

                      <input
                        type="text"
                        value={registerName}
                        onChange={e => { setRegisterName(e.target.value); localStorage.setItem("cp04_register_name", e.target.value); setRegisterError(""); }}
                        placeholder="Nombre completo"
                        autoComplete="name"
                        style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:`1px solid ${registerError?T.danger:T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:8 }}
                      />

                      <input
                        type="email"
                        value={registerEmail}
                        onChange={e => { setRegisterEmail(e.target.value); localStorage.setItem("cp04_register_email", e.target.value); setRegisterError(""); }}
                        placeholder="Correo electrónico"
                        autoComplete="email"
                        style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:`1px solid ${registerError?T.danger:T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:8 }}
                      />

                      <input
                        type="password"
                        value={registerPassword}
                        onChange={e => { setRegisterPassword(e.target.value); setRegisterError(""); }}
                        placeholder="Contraseña"
                        autoComplete="new-password"
                        style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:`1px solid ${registerError?T.danger:T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:8 }}
                      />

                      <input
                        type="password"
                        value={registerConfirm}
                        onChange={e => { setRegisterConfirm(e.target.value); setRegisterError(""); }}
                        placeholder="Confirmar contraseña"
                        autoComplete="new-password"
                        style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:`1px solid ${registerError?T.danger:T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:8 }}
                      />

                      {registerError && <div style={{ color:T.dangerText, marginBottom:10, fontWeight:800, fontSize:".86rem" }}>{registerError}</div>}

                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        <button type="button" onClick={handleRegisterSubmit} className="cp04-menu-button cp04-login-submit-btn" style={{ background:T.accent, color:"#071000", fontWeight:900 }}>
                          Crear cuenta
                        </button>
                        <button type="button" className="cp04-menu-button" onClick={closeRegister} style={{ background:"transparent", border:`1px solid ${T.line}` }}>
                          Volver
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color:T.accent, fontSize:"1.4rem", marginBottom:8 }}>✓</div>
                      <strong style={{ display:"block", marginBottom:8 }}>Cuenta creada correctamente</strong>
                      <p style={{ color:T.textDim, lineHeight:1.55, marginTop:0, fontSize:".9rem" }}>
                        Tu cuenta se ha creado. Puede requerir confirmación por email según la configuración de seguridad. Ya puedes intentar iniciar sesión.
                      </p>
                      <button type="button" className="cp04-menu-button" onClick={closeRegister}>
                        Volver al inicio de sesión
                      </button>
                    </div>
                  )}
                </div>
              )}

<p style={{ color:T.textDim, marginTop:14, marginBottom:0, fontSize:".84rem", lineHeight:1.45 }}>
            Acceso seguro conectado al sistema de autenticación real.
          </p>
        </form>

        <div style={{ padding:22, border:`1px solid ${T.line}`, borderRadius:24, background:"rgba(0,0,0,.28)" }}>
          <div style={{ color:T.accent, fontWeight:900, letterSpacing:".08em", fontSize:".78rem", marginBottom:8 }}>
            ACCESO POR ROLES
          </div>
          <strong style={{ display:"block", fontSize:"1.15rem", marginBottom:8 }}>
            Ver la app por roles
          </strong>
          <p style={{ color:T.textDim, marginTop:0, marginBottom:0, lineHeight:1.55 }}>
            Acceso reservado para pruebas del editor: jugador, staff, administrador y soporte técnico.
          </p>
        </div>
      </div>


            <div className="cp04-grid-2">
              {Object.keys(roleConfig).map((roleId) => {
                const rl = roleLabels[roleId] || roleConfig[roleId];
                return (
                  <button key={roleId} type="button" className={roleId==="PLAYER" ? "cp04-player-role-card" : undefined} onClick={() => selectRole(roleId)}
                    style={{ textAlign:"left", border:`1px solid ${T.line}`, borderRadius:24, padding:22, background:"rgba(5,10,18,.72)", color:T.text, cursor:"pointer", minHeight:122 }}>
                    <div className={roleId==="PLAYER" ? "cp04-role-player-id" : undefined} style={{ color: roleId==="PLAYER" ? "#b6ff00" : T.accent, fontWeight:900, letterSpacing:".12em", fontSize:".78rem", marginBottom:8 }}>{roleId}</div>
                    <strong style={{ display:"block", fontSize:"1.1rem", marginBottom:8 }}>{rl.label}</strong>
                    <span className={roleId==="PLAYER" ? "cp04-role-player-desc" : undefined} style={{ color: roleId==="PLAYER" ? "rgba(226,232,240,.48)" : T.textDim, lineHeight:1.5 }}>{rl.desc}</span>
                  </button>
                );
              })}
            </div>

            {pendingRole && (
              <form onSubmit={confirmRoleAccess} style={{ marginTop:28, padding:22, border:`1px solid ${T.line}`, borderRadius:22, background:"rgba(0,0,0,.28)" }}>
                <strong style={{ display:"block", marginBottom:8 }}>
                  {ltx("login.acceder_como")} {roleLabels[pendingRole]?.label || roleConfig[pendingRole]?.label}
                </strong>
                <p style={{ color:T.textDim, marginTop:0, marginBottom:14 }}>{ltx("login.intro_pwd")}</p>
                <input
                  type={showRolePassword ? "text" : "password"}
                  value={rolePassword}
                  onChange={e => setRolePassword(e.target.value)}
                  placeholder={ltx("login.password")}
                  autoFocus
                  style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1px solid ${roleError?T.dangerBorder:T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:10 }}
                />
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <button type="button" onClick={() => setShowRolePassword(v => !v)}
                    style={{ border:"none", background:"transparent", color:T.accent, fontWeight:900, cursor:"pointer", padding:0 }}>
                    {showRolePassword ? ltx("login.ocultar_pwd") : ltx("login.ver_pwd")}
                  </button>
                  <button type="button" onClick={openForgotPwd}
                    style={{ border:"none", background:"transparent", color:T.textDim, fontSize:".84rem", cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:3 }}>
                    {ltx("login.olvide_pwd")}
                  </button>
                </div>
                <label style={{ display:"flex", alignItems:"center", gap:10, color:T.textDim, marginBottom:12, cursor:"pointer", userSelect:"none" }}>
                  <input type="checkbox" checked={rememberRole} onChange={e => setRememberRole(e.target.checked)} style={{ width:18, height:18, accentColor:T.accent }} />
                  {ltx("login.guardar_sesion")}
                </label>
                {roleError && <div style={{ color:T.dangerText, marginBottom:12, fontWeight:800 }}>{roleError}</div>}
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <button type="submit" className="cp04-menu-button cp04-login-entrar-white-btn"
                    style={{ width:"auto", borderColor:"rgba(182,255,0,.5)", background:T.accent, color:"#ffffff", fontWeight:900 }}>
                    {ltx("login.entrar")}
                  </button>
                  <button type="button" className="cp04-menu-button"
                    onClick={() => { setPendingRole(""); setRolePassword(""); setRoleError(""); }}
                    style={{ width:"auto" }}>
                    {ltx("login.cancelar")}
                  </button>
                </div>
              </form>
            )}

            {forgotPwdStep !== "idle" && (
              <div style={{ marginTop:28, padding:22, border:`1px solid ${T.line}`, borderRadius:22, background:"rgba(0,0,0,.28)" }}>
                {forgotPwdStep === "form" && (
                  <>
                    <strong style={{ display:"block", marginBottom:6 }}>{ltx("login.recuperar_title")}</strong>
                    <p style={{ color:T.textDim, marginTop:0, marginBottom:16, lineHeight:1.6, fontSize:".92rem" }}>{ltx("login.recuperar_desc")}</p>
                    <form onSubmit={handleForgotPwdSubmit}>
                      <input
                        type="email"
                        value={forgotPwdEmail}
                        onChange={e => { setForgotPwdEmail(e.target.value); setForgotPwdEmailError(""); }}
                        placeholder={ltx("login.recuperar_email")}
                        autoFocus
                        style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1px solid ${forgotPwdEmailError?T.danger:T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:10 }}
                      />
                      {forgotPwdEmailError && <div style={{ color:T.danger, marginBottom:10, fontSize:".85rem" }}>{forgotPwdEmailError}</div>}
                      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:8 }}>
                        <button type="submit" className="cp04-menu-button cp04-login-entrar-white-btn"
                          style={{ background:T.accent, color:"#ffffff", fontWeight:900 }}>
                          {ltx("login.recuperar_btn")}
                        </button>
                        <button type="button" className="cp04-menu-button" onClick={closeForgotPwd}
                          style={{ background:"transparent", border:`1px solid ${T.line}` }}>
                          {ltx("login.recuperar_volver")}
                        </button>
                      </div>
                    </form>
                  </>
                )}
                {forgotPwdStep === "loading" && (
                  <p style={{ color:T.textDim, lineHeight:1.6, fontSize:".92rem" }}>{ltx("login.recuperar_cargando")}</p>
                )}
                {forgotPwdStep === "sent" && (
                  <>
                    <div style={{ color:T.accent, fontWeight:900, fontSize:"1.4rem", marginBottom:10 }}>✓</div>
                    <strong style={{ display:"block", marginBottom:8, fontSize:"1.05rem" }}>{ltx("login.recuperar_title")}</strong>
                    <p style={{ color:T.textDim, lineHeight:1.6, marginBottom:18, fontSize:".92rem" }}>{ltx("login.recuperar_enviado")}</p>
                    <button type="button" className="cp04-menu-button" onClick={closeForgotPwd}
                      style={{ background:"transparent", border:`1px solid ${T.line}` }}>
                      {ltx("login.recuperar_volver")}
                    </button>
                  </>
                )}
                {forgotPwdStep === "unavailable" && (
                  <>
                    <div style={{ color:T.warning, fontWeight:900, fontSize:"1.4rem", marginBottom:10 }}>⚠</div>
                    <strong style={{ display:"block", marginBottom:8, fontSize:"1.05rem" }}>{ltx("login.recuperar_title")}</strong>
                    <p style={{ color:T.textDim, lineHeight:1.6, marginBottom:18, fontSize:".92rem" }}>{ltx("login.recuperar_no_disponible")}</p>
                    <button type="button" className="cp04-menu-button" onClick={closeForgotPwd}
                      style={{ background:"transparent", border:`1px solid ${T.line}` }}>
                      {ltx("login.recuperar_volver")}
                    </button>
                  </>
                )}
              </div>
            )}

            <p style={{ color:T.textDim, marginTop:24, fontSize:".9rem" }}>
              {ltx("login.legal")}
            </p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <style>{GALLERY_REAL_IMAGE_STYLES}</style>
      <style>{GALLERY_FORCE_STYLES}</style>
      <PwaStatusBanners />
      <div className="cp04-mobilebar">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ width:10, height:10, borderRadius:"50%", background:T.accent }} />
          <strong style={{ fontFamily:T.fontDisplay }}>CLUB PÁDEL 04</strong>
        </div>
        <ClockDisplay compact />
        <button ref={menuButtonRef} className="cp04-menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú de navegación" aria-controls="cp04-mobile-menu" aria-expanded={mobileMenuOpen}>{ltx("nav.abrir_menu")}</button>
      </div>
      {mobileMenuOpen && <button className="cp04-overlay" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú de navegación" />}
      <div className="cp04-layout">
        <Sidebar current={current} selectedRole={selectedRole} onClearRole={clearRole} mobileOpen={mobileMenuOpen} onNavigate={navigate} onClose={() => setMobileMenuOpen(false)} />
        <main className="cp04-main" data-tour="main-content">
          <LazyLoadBoundary label="Cargando módulo...">
            {modules[safeCurrentSection] || modules.inicio}
          </LazyLoadBoundary>
        </main>
      </div>
      <Suspense fallback={null}>
        <LazyCP04GuidedTutorial
          selectedRole={selectedRole}
          onNavigate={navigate}
          openRevision={tutorialRevision}
          onSetMobileMenuOpen={setMobileMenuOpen}
        />
      </Suspense>
    </>
  );
}


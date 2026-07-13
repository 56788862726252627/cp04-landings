# CSS RESPONSIVE RELEVANTE

## Zona inicial de estilos
```jsx
import './cp04-login-enter-white-final.js';
import './tournament-module.css';
import './internal-background-detector';
import './internal-module-backgrounds.css';
import './cp04-two-buttons-fix';
import './cp04-sidebar-fix';
import './cp04-legibility-polish.css';
import './torcal-role-background.css';
import './role-background-detector';

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



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LazyLoadBoundary from "./components/lazy/LazyLoadBoundary.jsx";
import { LazyClubGallery } from "./components/lazy/lazyGallery.js";
import CP04GuidedTutorial from "./components/CP04GuidedTutorial.jsx";
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

const BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const BOOKING_DURATIONS = [60, 90, 120];
const BOOKING_MODALITIES = ["libre", "partido", "clase", "torneo"];
const BOOKING_LEVELS = ["iniciacion", "intermedio", "avanzado", "competicion"];

const BOOKINGS = [
  { id: "DEMO-001", player: "Reserva demo 1", court: "Pista 1", date: "2026-06-10", time: "10:00", status: "confirmed", price: 18 },
  { id: "DEMO-002", player: "Reserva demo 2", court: "Pista 3", date: "2026-06-10", time: "12:00", status: "pending", price: 12 },
  { id: "DEMO-003", player: "Reserva demo 3", court: "Pista 2", date: "2026-06-09", time: "18:00", status: "completed", price: 18 },
];

const RANKING = [
  { pos: 1, name: "Jugador demo 1", elo: 3.85, cat: "Demo", wins: 12, losses: 3 },
  { pos: 2, name: "Jugador demo 2", elo: 3.72, cat: "Demo", wins: 10, losses: 4 },
  { pos: 3, name: "Jugador demo 3", elo: 3.61, cat: "Demo", wins: 9, losses: 5 },
];

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

function minutesFromTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ""));
  if (!match) return Number.NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

function madridCurrentMinutes() {
  const { hour, minute } = madridDateParts();
  return Number(hour) * 60 + Number(minute);
}

function getSlotStatus(fecha, hora, duration = 90) {
  if (!fecha || !hora) return "invalid";
  if (isSundayISO(fecha)) return "closed";
  if (isPastDateISO(fecha)) return "past";

  const startMinutes = minutesFromTime(hora);
  if (!Number.isFinite(startMinutes)) return "invalid";

  if (fecha === todayISO() && startMinutes <= madridCurrentMinutes()) {
    return "past";
```

## Coincidencias responsive
```text
1:import './cp04-login-enter-white-final.js';
6:import './cp04-sidebar-fix';
8:import './torcal-role-background.css';
9:import './role-background-detector';
187:  .cp04-layout { min-height: 100vh; display: grid; grid-template-columns: 292px minmax(0,1fr); }
189:  .cp04-sidebar { position: sticky; top: 0; height: 100vh; padding: 24px; border-right: 1px solid ${T.line}; background: linear-gradient(180deg, rgba(10,16,28,.96), rgba(5,8,13,.90)); overflow: auto; backdrop-filter: blur(18px); }
190:  .cp04-mobilebar { display: none; }
192:  .cp04-sidebar-close { display: none; }
212:  @media (max-width: 1180px) { .cp04-grid-3 { grid-template-columns: repeat(2, minmax(0,1fr)); } }
213:  @media (max-width: 980px) { .cp04-layout { grid-template-columns: 1fr; padding-top: 66px; } .cp04-mobilebar { position: fixed; z-index: 60; top: 0; left: 0; right: 0; height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-bottom: 1px solid ${T.line}; background: rgba(7,10,14,.88); backdrop-filter: blur(18px); } .cp04-menu-button { background: linear-gradient(135deg, ${T.accent}, ${T.accent2}); color: #06100a; border: 0; border-radius: 14px; padding: 10px 14px; font-family: ${T.fontDisplay}; font-weight: 900; cursor: pointer; } .cp04-sidebar-close { display: block; } .cp04-sidebar { position: fixed; z-index: 80; inset: 0 auto 0 0; width: min(88vw, 340px); height: 100dvh; visibility: hidden; transform: translateX(-105%); transition: transform .22s ease, visibility .22s ease; border-right: 1px solid ${T.line}; border-bottom: 0; box-shadow: 24px 0 80px rgba(0,0,0,.45); } .cp04-sidebar[data-open="true"] { visibility: visible; transform: translateX(0); } .cp04-overlay { display: block; position: fixed; z-index: 70; inset: 0; background: rgba(0,0,0,.62); border: 0; padding: 0; cursor: pointer; } .cp04-grid-2, .cp04-grid-3, .cp04-gallery { grid-template-columns: 1fr; } .cp04-gallery-item.featured { min-height: 340px; } }
214:  @media (max-width: 640px) { .cp04-card { border-radius: 22px; padding: 19px; } .cp04-table th, .cp04-table td { padding: 13px 14px; } .cp04-gallery-item, .cp04-gallery-item.featured { min-height: 245px; border-radius: 22px; } }
809:  return <Card><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}><div><h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.04em" }}>{tx("auth.roles_title")}</h3><p style={{ color: T.textDim, lineHeight: 1.65, marginTop: 8 }}>{tx("auth.pending_desc")}</p></div><span className="cp04-badge" style={{ color: T.warning, border: `1px solid ${T.warning}55`, borderRadius: 999, padding: "7px 11px", fontWeight: 900, fontSize: ".74rem", whiteSpace: "nowrap" }}>{tx("auth.pending_badge")}</span></div><div className={compact ? undefined : "cp04-grid-2"} style={compact ? { display: "grid", gap: 12 } : undefined}>{ROLES.map((role) => <div key={role.id} style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: 16, background: "rgba(255,255,255,.035)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><strong style={{ color: T.accent }}>{role.id}</strong><span style={{ color: T.warning, fontSize: ".82rem", fontWeight: 900 }}>{role.access}</span></div><div style={{ marginTop: 8, fontWeight: 900 }}>{role.label}</div><div style={{ color: T.textDim, marginTop: 6, lineHeight: 1.55 }}>{tx("auth.secciones")} {role.sections}</div>{!compact && <PanelList items={role.permissions} />}</div>)}</div></Card>;
2193:function cp04NormalizeRole(role) {
2194:  const value = String(role || "").trim().toUpperCase();
2203:function cp04CanAccessSection(role, section) {
2204:  const safeRole = cp04NormalizeRole(role);
2209:function cp04GetSafeStartSection(role) {
2210:  const safeRole = cp04NormalizeRole(role);
2221:    return localStorage.getItem("cp04_auth_mode") || CP04_AUTH_MODES.DEMO;
2235:    "login.title":"Iniciar como rol","login.entrar":"Entrar","login.cancelar":"Cancelar",
2236:    "login.password":"Contraseña","login.ver_pwd":"👁️ Ver contraseña","login.ocultar_pwd":"🙈 Ocultar contraseña",
2237:    "login.guardar_sesion":"Guardar sesión en este dispositivo","login.acceder_como":"Acceder como",
2238:    "login.intro_pwd":"Introduce la contraseña asignada a este rol.",
2239:    "login.error_rol":"Selecciona un rol válido.","login.error_pwd":"Contraseña incorrecta para este rol.",
2240:    "login.sesion_label":"Club Pádel 04 · Inicio de sesión",
2241:    "login.legal":"Acceso local protegido por contraseña. Puedes guardar sesión solo en este dispositivo. Para producción real, las credenciales deberán validarse desde backend/autenticación segura.",
2242:    "login.olvide_pwd":"¿Has olvidado tu contraseña?","login.recuperar_title":"Recuperar acceso","login.recuperar_desc":"Introduce tu correo electrónico y, si la cuenta existe, recibirás instrucciones para restablecer el acceso.","login.recuperar_email":"Correo electrónico","login.recuperar_btn":"Enviar instrucciones","login.recuperar_enviado":"Si esa dirección está registrada en el sistema, recibirás instrucciones en breve. Revisa también la carpeta de spam.","login.recuperar_volver":"Volver al inicio de sesión","login.recuperar_preparado":"Preparado para endpoint: /api/auth/forgot-password",
2244:    "login.subtitle":"Selecciona cómo quieres entrar a la aplicación. Cada rol tendrá una experiencia orientada a sus permisos: jugador, recepción, administrador o soporte técnico.",
2245:    "login.idioma":"Idioma",
2246:    "role.PLAYER.label":"Jugador / cliente","role.PLAYER.desc":"Reservar pistas, consultar reservas y ranking.",
2247:    "role.STAFF.label":"Staff / recepción","role.STAFF.desc":"Gestión diaria de reservas, altas y atención al jugador.",
2248:    "role.ADMIN.label":"Administrador / jefe","role.ADMIN.desc":"Panel de dirección, métricas y control operativo.",
2249:    "role.SUPPORT.label":"Soporte técnico","role.SUPPORT.desc":"Zona técnica, integraciones y diagnóstico interno.",
2264:    "home.club_operativo":"Club de pádel","home.hero_accent":"operativo",
2265:    "home.hero_subtitle":"SaaS separado por roles: jugador, recepción, administración y soporte.",
2415:    "auth.roles_title":"Roles y accesos","auth.pending_badge":"Pendiente de configurar",
2416:    "auth.pending_desc":"Sistema de acceso configurado por roles. En producción debe protegerse por autenticación y backend de usuarios.",
2417:    "auth.secciones":"Secciones:",
2437:    "login.title":"Log in as role","login.entrar":"Enter","login.cancelar":"Cancel",
2438:    "login.password":"Password","login.ver_pwd":"👁️ Show password","login.ocultar_pwd":"🙈 Hide password",
2439:    "login.guardar_sesion":"Remember me on this device","login.acceder_como":"Log in as",
2440:    "login.intro_pwd":"Enter the password assigned to this role.",
2441:    "login.error_rol":"Please select a valid role.","login.error_pwd":"Incorrect password for this role.",
2442:    "login.sesion_label":"Club Pádel 04 · Login",
2443:    "login.legal":"Local access protected by password. Session can be saved on this device only. For production, credentials must be validated from secure backend.",
2444:    "login.olvide_pwd":"Forgot your password?","login.recuperar_title":"Recover access","login.recuperar_desc":"Enter your email address and, if the account exists, you will receive instructions to reset your access.","login.recuperar_email":"Email address","login.recuperar_btn":"Send instructions","login.recuperar_enviado":"If that address is registered in the system, you will receive instructions shortly. Also check your spam folder.","login.recuperar_volver":"Back to login","login.recuperar_preparado":"Ready for endpoint: /api/auth/forgot-password",
2445:    "perfil.title":"Profile & settings","perfil.eyebrow":"My account","perfil.sesion":"Active session","perfil.rol_actual":"Current role","perfil.cerrar_sesion":"Log out","perfil.cambiar_pwd":"Change password","perfil.pwd_actual":"Current password","perfil.pwd_nueva":"New password","perfil.pwd_confirmar":"Confirm new password","perfil.pwd_guardada":"Password updated (local demo mode).","perfil.pwd_error_vacia":"Enter current password.","perfil.pwd_error_nueva":"Minimum 8 characters, uppercase, lowercase and number.","perfil.pwd_error_coincide":"Passwords do not match.","perfil.idioma":"Interface language","perfil.info_demo":"Profile in local mode. Data is saved on this device only.","perfil.privacidad":"Privacy","perfil.privacidad_desc":"In production, personal data will be managed in compliance with GDPR.","perfil.notificaciones":"Notifications","perfil.notif_desc":"Ready for email and messaging notifications in production.","perfil.avatar_cambiar":"Change profile photo","perfil.avatar_eliminar":"Remove photo","perfil.avatar_confirmar_del":"Remove your profile photo?","perfil.avatar_guardada":"Photo updated.","perfil.avatar_eliminada":"Photo removed.","perfil.avatar_error_tipo":"Images only (JPG, PNG, WEBP).","perfil.avatar_error_size":"Maximum 5 MB.","perfil.bio_titulo":"Your introduction","perfil.bio_placeholder":"Tell us about your game, level or availability...","perfil.bio_guardar":"Save","perfil.bio_cancelar":"Cancel","perfil.bio_guardada":"Introduction saved.","perfil.bio_editar":"Edit introduction","perfil.bio_chars":"characters","perfil.deporte_titulo":"Sports profile","perfil.deporte_guardar":"Save data","perfil.deporte_guardados":"Sports data saved.","perfil.deporte_mano":"Dominant hand","perfil.deporte_posicion":"Preferred position","perfil.deporte_nivel":"Skill level","perfil.deporte_disponibilidad":"Usual availability","perfil.deporte_tipo_partida":"Match type","perfil.deporte_objetivo":"Main goal","perfil.deporte_busqueda":"Search status","perfil.metricas_titulo":"My activity","perfil.metricas_partidos":"Matches played","perfil.metricas_reservas":"Bookings made","perfil.metricas_torneos":"Tournaments played","perfil.metricas_ranking":"Current ranking","perfil.metricas_actividad":"Activity level","perfil.metricas_valoracion":"Sports rating","perfil.metricas_fiabilidad":"Reliability","perfil.metricas_racha":"Active streak","perfil.historial_titulo":"Player moments","perfil.insignias_titulo":"Player achievements","perfil.privacidad_config":"Privacy settings","perfil.privacidad_guardada":"Privacy updated.","perfil.privacidad_perfil_visible":"Profile visible to other players","perfil.privacidad_nivel":"Show skill level","perfil.privacidad_disponibilidad":"Show availability","perfil.privacidad_stats":"Show statistics","perfil.privacidad_invitaciones":"Allow match invitations","perfil.privacidad_recomendaciones":"Allow partner recommendations","perfil.completitud_titulo":"Profile completeness","nav.perfil":"Profile & settings",
2446:    "login.subtitle":"Select how you want to enter the application. Each role has an experience tailored to its permissions: player, reception, administrator or technical support.",
2447:    "login.idioma":"Language",
2448:    "role.PLAYER.label":"Player / client","role.PLAYER.desc":"Book courts, check bookings and ranking.",
2449:    "role.STAFF.label":"Staff / reception","role.STAFF.desc":"Daily management of bookings, sign-ups and player assistance.",
2450:    "role.ADMIN.label":"Administrator","role.ADMIN.desc":"Management panel, metrics and operational control.",
2451:    "role.SUPPORT.label":"Technical support","role.SUPPORT.desc":"Technical zone, integrations and internal diagnostics.",
2466:    "home.club_operativo":"Padel club","home.hero_accent":"operational",
2467:    "home.hero_subtitle":"SaaS by roles: player, reception, administration and support.",
2617:    "auth.roles_title":"Roles and access","auth.pending_badge":"Pending configuration",
2618:    "auth.pending_desc":"Role-based access system. In production it must be protected by an authentication provider and user backend.",
2619:    "auth.secciones":"Sections:",
2639:    "login.title":"Sign in as role","login.entrar":"Sign in","login.cancelar":"Cancel",
2640:    "login.password":"Password","login.ver_pwd":"👁️ Show password","login.ocultar_pwd":"🙈 Hide password",
2641:    "login.guardar_sesion":"Remember me on this device","login.acceder_como":"Sign in as",
2642:    "login.intro_pwd":"Enter the password assigned to this role.",
2643:    "login.error_rol":"Please select a valid role.","login.error_pwd":"Incorrect password for this role.",
2644:    "login.sesion_label":"Club Pádel 04 · Sign In",
2645:    "login.legal":"Local access protected by password. Session can be saved on this device only.",
2646:    "login.olvide_pwd":"Forgot your password?","login.recuperar_title":"Recover access","login.recuperar_desc":"Enter your email address and, if the account exists, you will receive instructions to reset your access.","login.recuperar_email":"Email address","login.recuperar_btn":"Send instructions","login.recuperar_enviado":"If that address is registered in the system, you will receive instructions shortly. Also check your spam folder.","login.recuperar_volver":"Back to login","login.recuperar_preparado":"Ready for endpoint: /api/auth/forgot-password",
2647:    "perfil.title":"Profile & settings","perfil.eyebrow":"My account","perfil.sesion":"Active session","perfil.rol_actual":"Current role","perfil.cerrar_sesion":"Log out","perfil.cambiar_pwd":"Change password","perfil.pwd_actual":"Current password","perfil.pwd_nueva":"New password","perfil.pwd_confirmar":"Confirm new password","perfil.pwd_guardada":"Password updated (local demo mode).","perfil.pwd_error_vacia":"Enter current password.","perfil.pwd_error_nueva":"Minimum 8 characters, uppercase, lowercase and number.","perfil.pwd_error_coincide":"Passwords do not match.","perfil.idioma":"Interface language","perfil.info_demo":"Profile in local mode. Data is saved on this device only.","perfil.privacidad":"Privacy","perfil.privacidad_desc":"In production, personal data will be managed in compliance with applicable privacy law.","perfil.notificaciones":"Notifications","perfil.notif_desc":"Ready for email and messaging notifications in production.","perfil.avatar_cambiar":"Change profile photo","perfil.avatar_eliminar":"Remove photo","perfil.avatar_confirmar_del":"Remove your profile photo?","perfil.avatar_guardada":"Photo updated.","perfil.avatar_eliminada":"Photo removed.","perfil.avatar_error_tipo":"Images only (JPG, PNG, WEBP).","perfil.avatar_error_size":"Maximum 5 MB.","perfil.bio_titulo":"Your introduction","perfil.bio_placeholder":"Tell us about your game, level or availability...","perfil.bio_guardar":"Save","perfil.bio_cancelar":"Cancel","perfil.bio_guardada":"Introduction saved.","perfil.bio_editar":"Edit introduction","perfil.bio_chars":"characters","perfil.deporte_titulo":"Sports profile","perfil.deporte_guardar":"Save data","perfil.deporte_guardados":"Sports data saved.","perfil.deporte_mano":"Dominant hand","perfil.deporte_posicion":"Preferred position","perfil.deporte_nivel":"Skill level","perfil.deporte_disponibilidad":"Usual availability","perfil.deporte_tipo_partida":"Match type","perfil.deporte_objetivo":"Main goal","perfil.deporte_busqueda":"Search status","perfil.metricas_titulo":"My activity","perfil.metricas_partidos":"Matches played","perfil.metricas_reservas":"Bookings made","perfil.metricas_torneos":"Tournaments played","perfil.metricas_ranking":"Current ranking","perfil.metricas_actividad":"Activity level","perfil.metricas_valoracion":"Sports rating","perfil.metricas_fiabilidad":"Reliability","perfil.metricas_racha":"Active streak","perfil.historial_titulo":"Player moments","perfil.insignias_titulo":"Player achievements","perfil.privacidad_config":"Privacy settings","perfil.privacidad_guardada":"Privacy updated.","perfil.privacidad_perfil_visible":"Profile visible to other players","perfil.privacidad_nivel":"Show skill level","perfil.privacidad_disponibilidad":"Show availability","perfil.privacidad_stats":"Show statistics","perfil.privacidad_invitaciones":"Allow match invitations","perfil.privacidad_recomendaciones":"Allow partner recommendations","perfil.completitud_titulo":"Profile completeness","nav.perfil":"Profile & settings",
2648:    "login.subtitle":"Select how you want to enter the app. Each role has an experience tailored to its permissions.",
2649:    "login.idioma":"Language",
2650:    "role.PLAYER.label":"Player / client","role.PLAYER.desc":"Book courts, view bookings and ranking.",
2651:    "role.STAFF.label":"Staff / front desk","role.STAFF.desc":"Daily management of bookings and player assistance.",
2652:    "role.ADMIN.label":"Administrator","role.ADMIN.desc":"Dashboard, metrics and operational control.",
2653:    "role.SUPPORT.label":"Technical support","role.SUPPORT.desc":"Technical zone, integrations and internal diagnostics.",
2668:    "home.club_operativo":"Padel club","home.hero_accent":"operational",
2669:    "home.hero_subtitle":"SaaS by roles: player, front desk, administration and support.",
2819:    "auth.roles_title":"Roles and access","auth.pending_badge":"Pending configuration",
2820:    "auth.pending_desc":"Role-based access system. In production it must be protected by an authentication provider and user backend.",
2821:    "auth.secciones":"Sections:",
2841:    "login.title":"Se connecter en tant que rôle","login.entrar":"Entrer","login.cancelar":"Annuler",
2842:    "login.password":"Mot de passe","login.ver_pwd":"👁️ Voir le mot de passe","login.ocultar_pwd":"🙈 Masquer",
2843:    "login.guardar_sesion":"Mémoriser sur cet appareil","login.acceder_como":"Se connecter en tant que",
2844:    "login.intro_pwd":"Entrez le mot de passe attribué à ce rôle.",
2845:    "login.error_rol":"Veuillez sélectionner un rôle valide.","login.error_pwd":"Mot de passe incorrect.",
2846:    "login.sesion_label":"Club Pádel 04 · Connexion",
2847:    "login.legal":"Accès local protégé par mot de passe. Session sauvegardable sur cet appareil uniquement.",
2848:    "login.olvide_pwd":"Mot de passe oublié ?","login.recuperar_title":"Récupérer l'accès","login.recuperar_desc":"Saisissez votre adresse e-mail et, si le compte existe, vous recevrez des instructions pour réinitialiser l'accès.","login.recuperar_email":"Adresse e-mail","login.recuperar_btn":"Envoyer les instructions","login.recuperar_enviado":"Si cette adresse est enregistrée dans le système, vous recevrez des instructions prochainement. Vérifiez aussi vos spams.","login.recuperar_volver":"Retour à la connexion","login.recuperar_preparado":"Prêt pour l'endpoint : /api/auth/forgot-password",
2850:    "login.subtitle":"Sélectionnez comment vous souhaitez entrer dans l'application.",
2851:    "login.idioma":"Langue",
2852:    "role.PLAYER.label":"Joueur / client","role.PLAYER.desc":"Réserver des courts, consulter les réservations et le classement.",
2853:    "role.STAFF.label":"Staff / accueil","role.STAFF.desc":"Gestion quotidienne des réservations et assistance aux joueurs.",
2854:    "role.ADMIN.label":"Administrateur","role.ADMIN.desc":"Tableau de bord, métriques et contrôle opérationnel.",
2855:    "role.SUPPORT.label":"Support technique","role.SUPPORT.desc":"Zone technique, intégrations et diagnostics internes.",
2870:    "home.club_operativo":"Club de padel","home.hero_accent":"opérationnel",
2871:    "home.hero_subtitle":"SaaS par rôles: joueur, accueil, administration et support.",
3017:    "auth.roles_title":"Rôles et accès","auth.pending_badge":"Configuration en attente",
3018:    "auth.pending_desc":"Système d'accès par rôles. En production, il doit être protégé par un fournisseur d'authentification.",
3019:    "auth.secciones":"Sections :",
3039:    "login.title":"Accedi come ruolo","login.entrar":"Entra","login.cancelar":"Annulla",
3040:    "login.password":"Password","login.ver_pwd":"👁️ Mostra password","login.ocultar_pwd":"🙈 Nascondi",
3041:    "login.guardar_sesion":"Ricordami su questo dispositivo","login.acceder_como":"Accedi come",
3042:    "login.intro_pwd":"Inserisci la password assegnata a questo ruolo.",
3043:    "login.error_rol":"Seleziona un ruolo valido.","login.error_pwd":"Password errata per questo ruolo.",
3044:    "login.sesion_label":"Club Pádel 04 · Accesso",
3045:    "login.legal":"Accesso locale protetto da password. Sessione salvabile solo su questo dispositivo.",
3046:    "login.olvide_pwd":"Hai dimenticato la password?","login.recuperar_title":"Recupera l'accesso","login.recuperar_desc":"Inserisci il tuo indirizzo e-mail e, se l'account esiste, riceverai le istruzioni per reimpostare l'accesso.","login.recuperar_email":"Indirizzo e-mail","login.recuperar_btn":"Invia istruzioni","login.recuperar_enviado":"Se quell'indirizzo è registrato nel sistema, riceverai le istruzioni a breve. Controlla anche la cartella spam.","login.recuperar_volver":"Torna al login","login.recuperar_preparado":"Pronto per l'endpoint: /api/auth/forgot-password",
3048:    "login.subtitle":"Seleziona come vuoi accedere all'applicazione.",
3049:    "login.idioma":"Lingua",
3050:    "role.PLAYER.label":"Giocatore / cliente","role.PLAYER.desc":"Prenota campi, consulta prenotazioni e classifica.",
3051:    "role.STAFF.label":"Staff / reception","role.STAFF.desc":"Gestione quotidiana delle prenotazioni e assistenza ai giocatori.",
3052:    "role.ADMIN.label":"Amministratore","role.ADMIN.desc":"Pannello di gestione, metriche e controllo operativo.",
3053:    "role.SUPPORT.label":"Supporto tecnico","role.SUPPORT.desc":"Zona tecnica, integrazioni e diagnostica interna.",
3068:    "home.club_operativo":"Club di padel","home.hero_accent":"operativo",
3069:    "home.hero_subtitle":"SaaS per ruoli: giocatore, reception, amministrazione e supporto.",
3215:    "auth.roles_title":"Ruoli e accessi","auth.pending_badge":"Configurazione in attesa",
3216:    "auth.pending_desc":"Sistema di accesso per ruoli. In produzione deve essere protetto da un provider di autenticazione.",
3217:    "auth.secciones":"Sezioni:",
3237:    "login.title":"Entrar como função","login.entrar":"Entrar","login.cancelar":"Cancelar",
3238:    "login.password":"Palavra-passe","login.ver_pwd":"👁️ Ver palavra-passe","login.ocultar_pwd":"🙈 Ocultar",
3239:    "login.guardar_sesion":"Guardar sessão neste dispositivo","login.acceder_como":"Entrar como",
3240:    "login.intro_pwd":"Introduza a palavra-passe atribuída a esta função.",
3241:    "login.error_rol":"Selecione uma função válida.","login.error_pwd":"Palavra-passe incorreta.",
3242:    "login.sesion_label":"Club Pádel 04 · Início de sessão",
3243:    "login.legal":"Acesso local protegido por palavra-passe. Sessão guardável apenas neste dispositivo.",
3244:    "login.olvide_pwd":"Esqueceu a palavra-passe?","login.recuperar_title":"Recuperar acesso","login.recuperar_desc":"Introduza o seu e-mail e, se a conta existir, receberá instruções para repor o acesso.","login.recuperar_email":"Endereço de e-mail","login.recuperar_btn":"Enviar instruções","login.recuperar_enviado":"Se esse endereço estiver registado no sistema, receberá instruções em breve. Verifique também a pasta de spam.","login.recuperar_volver":"Voltar ao início de sessão","login.recuperar_preparado":"Preparado para endpoint: /api/auth/forgot-password",
3246:    "login.subtitle":"Selecione como pretende entrar na aplicação.",
3247:    "login.idioma":"Idioma",
3248:    "role.PLAYER.label":"Jogador / cliente","role.PLAYER.desc":"Reservar campos, consultar reservas e classificação.",
3249:    "role.STAFF.label":"Staff / receção","role.STAFF.desc":"Gestão diária de reservas e assistência a jogadores.",
3250:    "role.ADMIN.label":"Administrador","role.ADMIN.desc":"Painel de gestão, métricas e controlo operacional.",
3251:    "role.SUPPORT.label":"Suporte técnico","role.SUPPORT.desc":"Zona técnica, integrações e diagnóstico interno.",
3266:    "home.club_operativo":"Clube de padel","home.hero_accent":"operacional",
3267:    "home.hero_subtitle":"SaaS por funções: jogador, receção, administração e suporte.",
3413:    "auth.roles_title":"Funções e acessos","auth.pending_badge":"Configuração pendente",
3414:    "auth.pending_desc":"Sistema de acesso por funções. Em produção deve ser protegido por fornecedor de autenticação.",
3415:    "auth.secciones":"Secções:",
3435:    "login.title":"Entrar como perfil","login.entrar":"Entrar","login.cancelar":"Cancelar",
3436:    "login.password":"Senha","login.ver_pwd":"👁️ Mostrar senha","login.ocultar_pwd":"🙈 Ocultar",
3437:    "login.guardar_sesion":"Lembrar neste dispositivo","login.acceder_como":"Entrar como",
3438:    "login.intro_pwd":"Digite a senha atribuída a este perfil.",
3439:    "login.error_rol":"Selecione um perfil válido.","login.error_pwd":"Senha incorreta para este perfil.",
3440:    "login.sesion_label":"Club Pádel 04 · Login",
3441:    "login.legal":"Acesso local protegido por senha. Sessão salvável apenas neste dispositivo.",
3442:    "login.olvide_pwd":"Esqueceu a senha?","login.recuperar_title":"Recuperar acesso","login.recuperar_desc":"Insira seu e-mail e, se a conta existir, você receberá instruções para redefinir o acesso.","login.recuperar_email":"Endereço de e-mail","login.recuperar_btn":"Enviar instruções","login.recuperar_enviado":"Se esse endereço estiver cadastrado no sistema, você receberá instruções em breve. Verifique também a pasta de spam.","login.recuperar_volver":"Voltar ao login","login.recuperar_preparado":"Preparado para endpoint: /api/auth/forgot-password",
3444:    "login.subtitle":"Selecione como deseja entrar na aplicação.",
3445:    "login.idioma":"Idioma",
3446:    "role.PLAYER.label":"Jogador / cliente","role.PLAYER.desc":"Reservar quadras, consultar reservas e ranking.",
3447:    "role.STAFF.label":"Staff / recepção","role.STAFF.desc":"Gestão diária de reservas e atendimento aos jogadores.",
3448:    "role.ADMIN.label":"Administrador","role.ADMIN.desc":"Painel de gestão, métricas e controle operacional.",
3449:    "role.SUPPORT.label":"Suporte técnico","role.SUPPORT.desc":"Zona técnica, integrações e diagnóstico interno.",
3464:    "home.club_operativo":"Clube de padel","home.hero_accent":"operacional",
3465:    "home.hero_subtitle":"SaaS por perfis: jogador, recepção, administração e suporte.",
3481:    "soporte.title":"Suporte técnico","soporte.desc":"Controle técnico da aplicação.",
3611:    "auth.roles_title":"Perfis e acessos","auth.pending_badge":"Configuração pendente",
3612:    "auth.pending_desc":"Sistema de acesso por perfis. Em produção deve ser protegido por provedor de autenticação.",
3613:    "auth.secciones":"Seções:",
3633:    "login.title":"Als Rolle anmelden","login.entrar":"Eintreten","login.cancelar":"Abbrechen",
3634:    "login.password":"Passwort","login.ver_pwd":"👁️ Passwort anzeigen","login.ocultar_pwd":"🙈 Ausblenden",
3635:    "login.guardar_sesion":"Auf diesem Gerät speichern","login.acceder_como":"Anmelden als",
3636:    "login.intro_pwd":"Geben Sie das dieser Rolle zugewiesene Passwort ein.",
3637:    "login.error_rol":"Bitte wählen Sie eine gültige Rolle.","login.error_pwd":"Falsches Passwort für diese Rolle.",
3638:    "login.sesion_label":"Club Pádel 04 · Anmeldung",
3639:    "login.legal":"Lokaler Zugang durch Passwort geschützt. Sitzung nur auf diesem Gerät speicherbar.",
3640:    "login.olvide_pwd":"Passwort vergessen?","login.recuperar_title":"Zugang wiederherstellen","login.recuperar_desc":"Geben Sie Ihre E-Mail-Adresse ein und, wenn das Konto existiert, erhalten Sie Anweisungen zur Zurücksetzung.","login.recuperar_email":"E-Mail-Adresse","login.recuperar_btn":"Anweisungen senden","login.recuperar_enviado":"Wenn diese Adresse im System registriert ist, erhalten Sie in Kürze Anweisungen. Prüfen Sie auch Ihren Spam-Ordner.","login.recuperar_volver":"Zurück zum Login","login.recuperar_preparado":"Bereit für Endpunkt: /api/auth/forgot-password",
3642:    "login.subtitle":"Wählen Sie aus, wie Sie die Anwendung betreten möchten.",
3643:    "login.idioma":"Sprache",
3644:    "role.PLAYER.label":"Spieler / Kunde","role.PLAYER.desc":"Plätze buchen, Buchungen und Rangliste einsehen.",
3645:    "role.STAFF.label":"Personal / Empfang","role.STAFF.desc":"Tägliche Buchungsverwaltung und Spielerbetreuung.",
3646:    "role.ADMIN.label":"Administrator","role.ADMIN.desc":"Verwaltungspanel, Metriken und Betriebskontrolle.",
3647:    "role.SUPPORT.label":"Technischer Support","role.SUPPORT.desc":"Technische Zone, Integrationen und interne Diagnose.",
3662:    "home.club_operativo":"Padel-Club","home.hero_accent":"in Betrieb",
3663:    "home.hero_subtitle":"SaaS nach Rollen: Spieler, Empfang, Verwaltung und Support.",
3809:    "auth.roles_title":"Rollen und Zugriffe","auth.pending_badge":"Konfiguration ausstehend",
3810:    "auth.pending_desc":"Rollenbasiertes Zugriffssystem. In Produktion muss es durch einen Authentifizierungsanbieter geschützt sein.",
3811:    "auth.secciones":"Bereiche:",
3968:function Sidebar({ current, selectedRole, onClearRole, mobileOpen, onNavigate, onClose }) {
3987:    <aside id="cp04-mobile-menu" className="cp04-sidebar" data-open={mobileOpen ? "true" : "false"} aria-label="Navegación principal">
3996:        <button className="cp04-menu-button cp04-sidebar-close" type="button" onClick={onClose} aria-label="Cerrar menú">{tx("nav.cerrar_menu")}</button>
4218:            {tx("home.club_operativo")}<br /><span style={{ color: T.accent }}>{tx("home.hero_accent")}</span>
4221:            {tx("home.hero_subtitle")}
5215:            role="alert"
6229:            <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: ".95rem" }}>Controles</h3>
6712:        <SectionTitle eyebrow={tx("role.ADMIN.label")} title={tx("admin.panel")} desc={tx("admin.metricas")} />
6774:          "Login real pendiente: /api/auth/login",
6775:          "Sesión real pendiente: /api/auth/me",
6776:          "Recuperación real pendiente: /api/auth/forgot-password",
6792:  return <div style={{ padding: "42px 24px", maxWidth: 1180, margin: "0 auto" }}><SectionTitle eyebrow={tx("soporte.eyebrow")} title={tx("soporte.title")} desc={tx("soporte.desc")} /><AuthStatusPanel /><Card style={{ marginTop: 24, marginBottom: 24 }}><h3 style={{ marginTop: 0 }}><span style={{ color: T.accent }}>{tx("soporte.proteccion_h3")}</span></h3><PanelList items={[`${tx("auth.secciones")} ${PROTECTED_SECTIONS.join(", ")}`, tx("soporte.proteccion"), tx("soporte.estado_tec_desc"), tx("soporte.worker_item")]} /></Card><div className="cp04-grid-2" style={{ marginBottom: 24 }}><RolePanel eyebrow={tx("soporte.estado_tec_eyebrow")} title={tx("soporte.estado_tec_title")} desc={tx("soporte.estado_tec_desc")} items={[tx("soporte.worker_item"), tx("soporte.make_item"), tx("soporte.airtable_item"), tx("soporte.stripe_item")]} /><RolePanel eyebrow={tx("soporte.obs_eyebrow")} title={tx("soporte.obs_title")} desc={tx("soporte.obs_desc")} items={[tx("soporte.logs_worker"), tx("soporte.logs_validaciones"), tx("soporte.logs_errores"), tx("soporte.logs_alertas")]} /></div><IntegrationMatrix /><AuthProductionStatusPanel /><Card style={{ marginTop: 24 }}><h3 style={{ marginTop: 0 }}>{tx("soporte.vars_h3")}</h3><pre style={{ overflow: "auto", color: T.textDim, background: "rgba(5,8,13,.72)", padding: 18, borderRadius: 16, border: `1px solid ${T.line}` }}>{`ALLOWED_ORIGIN=privado_en_worker\nRESERVAS_WEBHOOK=privado_en_worker\nDB_API_KEY=privado_en_backend\nDB_BASE_ID=privado_en_backend\nDB_RESERVAS_TABLE=privado_en_backend\nPAGOS_CLAVE_PRIVADA=solo_backend\nPAGOS_FIRMA_WEBHOOK=solo_backend\nMESSAGING_PROVIDER_TOKEN=privado_en_backend\nMESSAGING_PHONE_NUMBER_ID=privado_en_backend\nCALENDAR_CREDENTIALS=privado_en_backend\nSTORAGE_CREDENTIALS=privado_en_backend\nAUTH_PROVIDER=privado_en_backend\nAUTH_ISSUER_URL=privado_en_backend\nAUTH_AUDIENCE=privado_en_backend\nVITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas`}</pre><p style={{ color: T.textDim, lineHeight: 1.6 }}>Documentación: <code>docs/backend-reservas.md</code>, <code>docs/integraciones.md</code> y <code>docs/auth-roles.md</code>. El frontend solo debe recibir variables públicas <code>VITE_</code>.</p></Card></div>;
6798:  const roleLabels = { PLAYER:"Jugador / cliente", STAFF:"Staff / recepción", ADMIN:"Administrador / jefe", SUPPORT:"Soporte técnico" };
6809:  // POST   /api/auth/change-password
6811:  login: "/api/auth/login",
6812:  register: "/api/auth/register",
6813:  forgotPassword: "/api/auth/forgot-password",
6814:    me: "/api/auth/me",
6817:    changePassword: "/api/auth/change-password",
6884:  const roleInitials = { PLAYER:"JG", STAFF:"ST", ADMIN:"AD", SUPPORT:"SP" };
6885:  const initials = roleInitials[selectedRole] || "CP";
6966:    // TODO: POST /api/auth/change-password
7000:  const roleProfileLabel = { PLAYER:"Jugador", STAFF:"Staff · Recepción", ADMIN:"Administración", SUPPORT:"Soporte técnico" }[selectedRole] || "Usuario";
7034:            <div style={{ fontSize:".72rem", color:T.accent, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", marginBottom:4 }}>{roleProfileLabel}</div>
7036:              {roleLabels[selectedRole] || selectedRole}
7115:              <strong style={{ color:T.text, fontSize:".88rem" }}>{roleLabels[selectedRole]||selectedRole}</strong>
7164:                  const realRole = realUser?.role || "";
7430:  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem("cp04_role") || "");
7432:  const [rolePassword, setRolePassword] = useState("");
7435:  const [roleError, setRoleError] = useState("");
7436:  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
7444:  const [loginEmail, setLoginEmail] = useState("");
7445:  const [loginPassword, setLoginPassword] = useState("");
7447:  const [loginError, setLoginError] = useState("");
7481:          localStorage.removeItem("cp04_auth_mode");
7486:        const restoredRole = cp04NormalizeRole(data.role || user.role || localStorage.getItem("cp04_role") || "PLAYER");
7488:        localStorage.setItem("cp04_auth_mode", "supabase_real");
7490:        localStorage.setItem("cp04_role", restoredRole);
7516:  const roleConfig = {
7543:  function selectRole(roleId) {
7544:    setPendingRole(roleId);
7553:    const role = roleConfig[pendingRole];
7554:    if (!role) {
7559:    if (rolePassword.trim() !== role.password) {
7565:      localStorage.setItem("cp04_role", pendingRole);
7567:      localStorage.removeItem("cp04_role");
7570:    setCurrent(role.start || "inicio");
7578:    localStorage.removeItem("cp04_role");
7581:    localStorage.removeItem("cp04_auth_mode");
7613:    const cleanEmail = loginEmail.trim().toLowerCase();
7614:    const cleanPassword = loginPassword.trim();
7629:      const res = await fetch("/api/auth/login", {
7660:      const inferredRole = cp04NormalizeRole(user?.role || inferRoleFromEmail(cleanEmail));
7664:      localStorage.setItem("cp04_auth_mode", "supabase_real");
7665:      localStorage.setItem("cp04_user", JSON.stringify(user || { email: cleanEmail, role: inferredRole }));
7666:      localStorage.setItem("cp04_role", inferredRole);
7711:      const res = await fetch("/api/auth/register", {
7714:        body: JSON.stringify({ email: cleanEmail, password: cleanPassword, name: cleanName, role: "PLAYER" }),
7746:    const savedEmail = localStorage.getItem("cp04_register_email") || loginEmail || "";
7786:    if (!mobileMenuOpen) return undefined;
7790:    document.querySelector("#cp04-mobile-menu button")?.focus();
7805:  }, [mobileMenuOpen]);
7822:  const loginClock = useClock();
7823:  const loginLang = useLang();
7824:  const ltx = key => t(key, loginLang);
7827:    const roleLabels = {
7828:      PLAYER:  { label: ltx("role.PLAYER.label"),  desc: ltx("role.PLAYER.desc")  },
7829:      STAFF:   { label: ltx("role.STAFF.label"),   desc: ltx("role.STAFF.desc")   },
7830:      ADMIN:   { label: ltx("role.ADMIN.label"),   desc: ltx("role.ADMIN.desc")   },
7831:      SUPPORT: { label: ltx("role.SUPPORT.label"), desc: ltx("role.SUPPORT.desc") },
7840:                {ltx("login.sesion_label")}
7845:                  <div style={{ color:T.accent, fontWeight:900, fontSize:"1.15rem", letterSpacing:".05em" }}>{loginClock.time}</div>
7846:                  <div style={{ color:T.textDim, fontSize:".72rem", marginTop:2 }}>{loginClock.day}, {loginClock.date}</div>
7852:              {ltx("login.title").split(" ").slice(0,-1).join(" ")} <span style={{ color:T.accent }}>{ltx("login.title").split(" ").slice(-1)}</span>
7856:              {ltx("login.subtitle")}
7868:            Usa tu email y contraseña. Los roles internos siguen disponibles abajo solo para validación interna.
7872:            value={loginEmail}
7876:            style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1px solid ${loginError ? "#ff6b6b" : T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:10 }}
7880:            value={loginPassword}
7882:            placeholder={ltx("login.password")}
7884:            style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1px solid ${loginError ? "#ff6b6b" : T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:10 }}
7907:                  {ltx("login.olvide_pwd")}
7910:          {loginError && <div style={{ color:"#ff8b8b", marginBottom:12, fontWeight:800 }}>{loginError}</div>}
7999:            Ver la app por roles
8009:              {Object.keys(roleConfig).map((roleId) => {
8010:                const rl = roleLabels[roleId] || roleConfig[roleId];
8012:                  <button key={roleId} type="button" className={roleId==="PLAYER" ? "cp04-player-role-card" : undefined} onClick={() => selectRole(roleId)}
8014:                    <div className={roleId==="PLAYER" ? "cp04-role-player-id" : undefined} style={{ color: roleId==="PLAYER" ? "#b6ff00" : T.accent, fontWeight:900, letterSpacing:".12em", fontSize:".78rem", marginBottom:8 }}>{roleId}</div>
8016:                    <span className={roleId==="PLAYER" ? "cp04-role-player-desc" : undefined} style={{ color: roleId==="PLAYER" ? "rgba(226,232,240,.48)" : T.textDim, lineHeight:1.5 }}>{rl.desc}</span>
8025:                  {ltx("login.acceder_como")} {roleLabels[pendingRole]?.label || roleConfig[pendingRole]?.label}
8027:                <p style={{ color:T.textDim, marginTop:0, marginBottom:14 }}>{ltx("login.intro_pwd")}</p>
8030:                  value={rolePassword}
8032:                  placeholder={ltx("login.password")}
8034:                  style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:`1px solid ${roleError?"#ff6b6b":T.line}`, background:"rgba(255,255,255,.06)", color:T.text, outline:"none", marginBottom:10 }}
8039:                    {showRolePassword ? ltx("login.ocultar_pwd") : ltx("login.ver_pwd")}
8043:                    {ltx("login.olvide_pwd")}
8048:                  {ltx("login.guardar_sesion")}
8050:                {roleError && <div style={{ color:"#ff8b8b", marginBottom:12, fontWeight:800 }}>{roleError}</div>}
8054:                    {ltx("login.entrar")}
8059:                    {ltx("login.cancelar")}
8069:                    <strong style={{ display:"block", marginBottom:6 }}>{ltx("login.recuperar_title")}</strong>
8070:                    <p style={{ color:T.textDim, marginTop:0, marginBottom:16, lineHeight:1.6, fontSize:".92rem" }}>{ltx("login.recuperar_desc")}</p>
8076:                        placeholder={ltx("login.recuperar_email")}
8084:                          {ltx("login.recuperar_btn")}
8088:                          {ltx("login.recuperar_volver")}
8097:                    <strong style={{ display:"block", marginBottom:8, fontSize:"1.05rem" }}>{ltx("login.recuperar_title")}</strong>
8098:                    <p style={{ color:T.textDim, lineHeight:1.6, marginBottom:18, fontSize:".92rem" }}>{ltx("login.recuperar_enviado")}</p>
8101:                      {ltx("login.recuperar_volver")}
8109:              {ltx("login.legal")}
8122:      <div className="cp04-mobilebar">
8128:        <button ref={menuButtonRef} className="cp04-menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú de navegación" aria-controls="cp04-mobile-menu" aria-expanded={mobileMenuOpen}>{ltx("nav.abrir_menu")}</button>
8130:      {mobileMenuOpen && <button className="cp04-overlay" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú de navegación" />}
8131:      <div className="cp04-layout">
8132:        <Sidebar current={current} selectedRole={selectedRole} onClearRole={clearRole} mobileOpen={mobileMenuOpen} onNavigate={navigate} onClose={() => setMobileMenuOpen(false)} />
```

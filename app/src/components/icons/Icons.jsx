// Club Pádel 04 · sistema mínimo de iconos SVG propio.
//
// La auditoría Premium V2 (2026-09-03) detectó iconografía 100% emoji en
// toda la app y cero dependencia de iconos instalada. En vez de añadir una
// librería completa (lucide-react, react-icons...) solo para una veintena
// de usos puntuales, este archivo define ese mismo puñado de iconos como
// componentes SVG propios: cero dependencia nueva, mismo peso que un emoji,
// pero con trazo consistente (stroke, no relleno) y tamaño/color
// controlados por props en vez de la tipografía del sistema operativo.
//
// No sustituye TODOS los emojis de la app (serían cientos de usos
// dispersos, fuera de alcance de esta pasada): cubre la landing comercial
// y el "chrome" del app shell (logout, avatar, badge de rol, flechas de
// navegación) — ver docs/audit/premium-v2-t3.md para el resto pendiente.
import { T } from "../../theme.js";

function IconBase({ size = 20, color = "currentColor", strokeWidth = 1.8, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconCalendar(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </IconBase>
  );
}

export function IconShieldCheck(props) {
  return (
    <IconBase {...props}>
      <path d="M12 2.75 4.5 5.5v6c0 5 3.2 8.4 7.5 10 4.3-1.6 7.5-5 7.5-10v-6z" />
      <path d="m8.75 12 2.3 2.3 4.2-4.6" />
    </IconBase>
  );
}

export function IconUsers(props) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19c.7-3 2.9-4.8 6.2-4.8s5.5 1.8 6.2 4.8" />
      <circle cx="17" cy="7.5" r="2.4" />
      <path d="M16 11.6c2.4.4 3.9 1.9 4.4 4.1" />
    </IconBase>
  );
}

export function IconChartBar(props) {
  return (
    <IconBase {...props}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2.5 20h19" />
    </IconBase>
  );
}

export function IconQrCode(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.2" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" />
      <path d="M14 14h3v3h-3zM20 14h1v1h-1zM14 20h1v1h-1zM20 20h1v1h-1zM17.5 17.5h1v1h-1z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconTrophy(props) {
  return (
    <IconBase {...props}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 5H4.5a2.5 2.5 0 0 0 2.7 4.5M17 5h2.5a2.5 2.5 0 0 1-2.7 4.5" />
      <path d="M12 13v3M9 20h6M9.5 20c0-2 .8-3 2.5-3s2.5 1 2.5 3" />
    </IconBase>
  );
}

export function IconBolt(props) {
  return (
    <IconBase {...props}>
      <path d="M13 2 4.5 14h6l-1 8L19 10h-6z" />
    </IconBase>
  );
}

export function IconBell(props) {
  return (
    <IconBase {...props}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.2 5.4 1.8 6.2H4.2C4.8 15.4 6 14 6 10z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </IconBase>
  );
}

export function IconClock(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.3 2" />
    </IconBase>
  );
}

export function IconPlug(props) {
  return (
    <IconBase {...props}>
      <path d="M9 3v5M15 3v5M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0z" />
      <path d="M12 15.5V21" />
    </IconBase>
  );
}

export function IconLock(props) {
  return (
    <IconBase {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.4" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </IconBase>
  );
}

export function IconArrowRight(props) {
  return (
    <IconBase {...props}>
      <path d="M4 12h16M13.5 5.5 20 12l-6.5 6.5" />
    </IconBase>
  );
}

export function IconMenu(props) {
  return (
    <IconBase {...props}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
    </IconBase>
  );
}

export function IconClose(props) {
  return (
    <IconBase {...props}>
      <path d="M5 5l14 14M19 5 5 19" />
    </IconBase>
  );
}

export function IconUserCircle(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6 18.2c1.1-2.4 3.2-3.7 6-3.7s4.9 1.3 6 3.7" />
    </IconBase>
  );
}

export function IconLogout(props) {
  return (
    <IconBase {...props}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15.5 15.5 20 12l-4.5-3.5M20 12H9" />
    </IconBase>
  );
}

export function IconCheck(props) {
  return (
    <IconBase {...props}>
      <path d="m4.5 12.5 4.5 4.5L19.5 6.5" />
    </IconBase>
  );
}

export function IconAlertTriangle(props) {
  return (
    <IconBase {...props}>
      <path d="M12 4 2.5 20h19z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17.3" r=".18" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconHome(props) {
  return (
    <IconBase {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5v-6h4v6" />
    </IconBase>
  );
}

export function IconGear(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6M17.7 17.7l-1.6-1.6M7.9 7.9 6.3 6.3" />
    </IconBase>
  );
}

export function IconChat(props) {
  return (
    <IconBase {...props}>
      <path d="M4 5.5h16v11H9l-4 3.4v-3.4H4z" />
      <path d="M8 10h8M8 13h5" />
    </IconBase>
  );
}

export function IconRobot(props) {
  return (
    <IconBase {...props}>
      <rect x="5" y="8.5" width="14" height="10" rx="3" />
      <path d="M12 8.5V5M9.5 5h5" />
      <circle cx="9.3" cy="13.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="13.2" r="1" fill="currentColor" stroke="none" />
      <path d="M9 16.3h6" />
    </IconBase>
  );
}

export function IconFolder(props) {
  return (
    <IconBase {...props}>
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l1.6 2H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" />
    </IconBase>
  );
}

export function IconCreditCard(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6" width="18" height="12.5" rx="2.4" />
      <path d="M3 10.2h18" />
      <path d="M6.5 14.7h4" />
    </IconBase>
  );
}

export function IconMail(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
      <path d="m4 7 8 6.2L20 7" />
    </IconBase>
  );
}

export function IconRefresh(props) {
  return (
    <IconBase {...props}>
      <path d="M20 11a8 8 0 0 0-14.6-4.5M4 13a8 8 0 0 0 14.6 4.5" />
      <path d="M5.4 4.5V8h3.6M18.6 19.5V16H15" />
    </IconBase>
  );
}

export function IconWrench(props) {
  return (
    <IconBase {...props}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 4.6L4 16.2l2.8 2.8 5.3-5.3a4 4 0 0 0 4.6-5.4l-2.6 2.6-2-2z" />
    </IconBase>
  );
}

export function IconDocument(props) {
  return (
    <IconBase {...props}>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V8h4M8.5 12h7M8.5 15.5h7" />
    </IconBase>
  );
}

export function IconSpinner({ size = 20, color = T.accent, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...rest}>
      <style>{"@keyframes cp04Spin{to{transform:rotate(360deg)}}"}</style>
      <g style={{ transformOrigin: "12px 12px", animation: "cp04Spin .8s linear infinite" }}>
        <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity=".2" strokeWidth="2.6" fill="none" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

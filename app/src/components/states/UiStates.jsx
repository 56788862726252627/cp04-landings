// Club Pádel 04 · sistema común de estados de UI (T3 §6).
//
// La auditoría Premium V2 detectó estados de carga/éxito/error resueltos
// de forma ad-hoc y distinta en cada módulo (un `<Card>` con color inline
// aquí, un `<div>` suelto allá). Esto NO cambia ninguna lógica de negocio
// ni ningún disparador de estado: cada módulo sigue decidiendo cuándo está
// en pending/sending/success/error exactamente igual que antes — este
// archivo solo unifica CÓMO se pinta ese estado, reutilizando `T` y el
// icon set propio (Icons.jsx) en vez de emoji sueltos.
import { T } from "../../theme.js";
import { IconCheck, IconAlertTriangle, IconSpinner } from "../icons/Icons.jsx";

const VARIANT = {
  pending: { color: T.textDim, border: T.line, icon: null, bg: "rgba(255,255,255,.03)" },
  loading: { color: T.accent2, border: "rgba(32,227,178,.4)", icon: IconSpinner, bg: "rgba(32,227,178,.06)" },
  success: { color: T.accent, border: "rgba(182,255,0,.4)", icon: IconCheck, bg: "rgba(182,255,0,.06)" },
  warning: { color: T.warning, border: `${T.warning}55`, icon: IconAlertTriangle, bg: "rgba(255,173,71,.07)" },
  error:   { color: T.dangerText, border: `${T.dangerBorder}66`, icon: IconAlertTriangle, bg: "rgba(255,94,58,.08)" },
};
// Alias: cada módulo ya tenía su propio nombre de estado "en curso"/"sin
// empezar" antes de esta pasada (idle/pending/sending según el módulo).
// Se mapean aquí en vez de tocar esos nombres en cada componente — cero
// cambio de lógica, solo de presentación.
VARIANT.idle = VARIANT.pending;
VARIANT.sending = VARIANT.loading;

// Reemplazo directo del patrón `<Card style={{borderColor:statusColor}}><strong>{title}</strong><div>{text}</div></Card>`
// repetido en Reservas/Cancelar/Reprogramar y equivalentes ad-hoc en otros
// módulos. Mismo contenido (title/text), misma semántica de color — solo
// añade icono coherente y borde/fondo consistentes.
export function StatusCard({ status = "pending", title, text, style = {} }) {
  const v = VARIANT[status] || VARIANT.pending;
  const Icon = v.icon;
  return (
    <div
      role={status === "error" ? "alert" : status === "warning" ? "status" : undefined}
      style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 16, border: `1px solid ${v.border}`, background: v.bg, color: v.color, ...style }}
    >
      {Icon && <Icon size={20} color={v.color} style={{ flexShrink: 0, marginTop: 1 }} />}
      <div>
        {title && <strong style={{ display: "block" }}>{title}</strong>}
        {text && <div style={{ color: status === "pending" ? T.textDim : v.color, marginTop: title ? 4 : 0, opacity: status === "pending" ? 1 : .92 }}>{text}</div>}
      </div>
    </div>
  );
}

// Línea de error de campo — mismo rol visual que ya cumplía FieldError en
// App.jsx; se ofrece aquí también para módulos que no lo importan, con
// icono en vez de solo color.
export function InlineError({ children }) {
  if (!children) return null;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", color: T.dangerText, fontSize: ".84rem", fontWeight: 700, marginTop: 8 }}>
      <IconAlertTriangle size={15} color={T.dangerText} style={{ flexShrink: 0 }} />
      {children}
    </div>
  );
}

// Botón/acción en curso: icono girando + texto, para sustituir "Enviando..."
// suelto sin indicador visual de progreso.
export function LoadingInline({ label = "Cargando..." }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.textDim, fontSize: ".88rem" }}>
      <IconSpinner size={16} />
      {label}
    </span>
  );
}

// Placeholder de contenido cargando (lista/tabla) — sustituye a un
// "Cargando..." de texto plano sin ocupar el espacio final real.
export function Skeleton({ rows = 3, height = 14 }) {
  return (
    <div style={{ display: "grid", gap: 10 }} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height, borderRadius: 8, background: "linear-gradient(90deg, rgba(255,255,255,.05), rgba(255,255,255,.1), rgba(255,255,255,.05))", backgroundSize: "200% 100%", animation: "cp04Shimmer 1.3s ease-in-out infinite", width: i === rows - 1 ? "70%" : "100%" }} />
      ))}
      <style>{"@keyframes cp04Shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
    </div>
  );
}

// Estado vacío coherente ("sin resultados", "sin reservas todavía"...),
// sustituye a mensajes de texto plano dispersos.
export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 20px", border: `1px dashed ${T.line}`, borderRadius: 18, color: T.textDim }}>
      {Icon && <Icon size={30} color={T.textDim} style={{ marginBottom: 12 }} />}
      {title && <strong style={{ display: "block", color: T.text, marginBottom: 6 }}>{title}</strong>}
      {text && <p style={{ margin: "0 auto", maxWidth: 340, lineHeight: 1.6, fontSize: ".88rem" }}>{text}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// Club Pádel 04 · demoAuthAdapter
//
// Encapsula el login demo por contraseña de rol (PLAYER/STAFF/ADMIN/SUPPORT)
// que existía disperso dentro de App.jsx. Objetivo: aislar las credenciales
// demo en un único archivo claramente marcado, sin extender su vida útil
// más de lo necesario.
//
// Reglas de esta capa (no negociables):
// - SOLO puede operar cuando getAuthMode() === AUTH_MODES.DEMO (que a su vez
//   solo es posible en desarrollo: ver authService.getAuthMode()).
// - NUNCA emite un token de sesión real ni un objeto que parezca una sesión
//   backend verificada. Lo que devuelve es una etiqueta de UI para la demo
//   local, no una autorización.
// - La autoridad real de permisos sigue siendo exclusivamente el Worker
//   (worker-reservas/auth/authorization.js). Este adaptador no la sustituye
//   ni la simula: si algún día las rutas mutables exigen token real
//   (CP04_ENFORCE_ROLE_GATES=true), un login demo seguirá sin poder
//   ejecutar esas acciones, tal y como debe ser.

import { AUTH_MODES } from "./authTypes.js";
import { getAuthMode } from "./authService.js";

const DEMO_ROLE_CREDENTIALS = {
  PLAYER: { password: "jugador04", start: "inicio" },
  STAFF: { password: "staff04", start: "gestion" },
  ADMIN: { password: "admin04", start: "admin" },
  SUPPORT: { password: "soporte04", start: "soporte" },
};

export function isDemoAuthAllowed() {
  return getAuthMode() === AUTH_MODES.DEMO;
}

// Sección de inicio por rol para la demo. Las etiquetas/descripciones
// visibles del selector de rol siguen viviendo en TRANSLATIONS (App.jsx):
// esto es solo lo estrictamente necesario para validar el acceso demo.
export function getDemoRoleStart(roleId) {
  return DEMO_ROLE_CREDENTIALS[roleId]?.start || "inicio";
}

export function verifyDemoRolePassword(roleId, password) {
  if (!isDemoAuthAllowed()) {
    return {
      ok: false,
      error: "DEMO_AUTH_DISABLED",
      message: "El acceso demo no está disponible en este entorno.",
    };
  }

  const role = DEMO_ROLE_CREDENTIALS[roleId];

  if (!role) {
    return { ok: false, error: "UNKNOWN_ROLE", message: "Selecciona un rol válido." };
  }

  if (String(password || "").trim() !== role.password) {
    return { ok: false, error: "INVALID_PASSWORD", message: "Contraseña incorrecta para este rol." };
  }

  return { ok: true, role: roleId, start: role.start };
}

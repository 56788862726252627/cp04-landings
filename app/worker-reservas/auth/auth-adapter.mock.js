// Club Pádel 04 · Auth Adapter Mock
// Adaptador aislado para preparar futura conexión Worker/Auth.
// No está importado en worker-reservas/src/index.js.

import {
  mockLogin,
  mockSession,
  mockRoleCheck,
  sanitizeAuthResponse,
} from "./auth-handlers.mock.js";

export async function handleMockAuthRequest(pathname, payload = {}) {
  if (pathname === "/api/auth/login") {
    return sanitizeAuthResponse(mockLogin(payload));
  }

  if (pathname === "/api/auth/session") {
    return sanitizeAuthResponse(mockSession(payload.role));
  }

  if (pathname === "/api/auth/role-check") {
    return sanitizeAuthResponse(mockRoleCheck(payload.role));
  }

  if (pathname === "/api/auth/logout") {
    return sanitizeAuthResponse({ ok: true, session: "mock-closed" });
  }

  if (pathname === "/api/auth/forgot-password") {
    return sanitizeAuthResponse({
      ok: true,
      message: "Solicitud mock recibida. No se envía email real.",
    });
  }

  return sanitizeAuthResponse({
    ok: false,
    error: "AUTH_ROUTE_NOT_FOUND",
    message: "Ruta Auth mock no encontrada.",
  });
}

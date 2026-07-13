// Club Pádel 04 · Auth Handlers Mock
// Entorno aislado. No conectado todavía al Worker principal.
// Objetivo: validar contrato Auth sin tocar producción ni exponer secretos.

import { AUTH_ROLES, FRONTEND_FORBIDDEN_FIELDS } from "./auth-contract.js";

const MOCK_USERS = [
  {
    role: AUTH_ROLES.PLAYER,
    email: "player.demo@clubpadel04.local",
    displayName: "Jugador Demo",
  },
  {
    role: AUTH_ROLES.STAFF,
    email: "staff.demo@clubpadel04.local",
    displayName: "Recepción Demo",
  },
  {
    role: AUTH_ROLES.ADMIN,
    email: "admin.demo@clubpadel04.local",
    displayName: "Admin Demo",
  },
  {
    role: AUTH_ROLES.SUPPORT,
    email: "support.demo@clubpadel04.local",
    displayName: "Soporte Demo",
  },
];

export function sanitizeAuthResponse(payload = {}) {
  const clean = { ...payload };

  for (const field of FRONTEND_FORBIDDEN_FIELDS) {
    if (field in clean) {
      delete clean[field];
    }
  }

  return clean;
}

export function mockLogin({ role, email } = {}) {
  const user = MOCK_USERS.find(
    (item) => item.role === role && item.email === email
  );

  if (!user) {
    return sanitizeAuthResponse({
      ok: false,
      error: "AUTH_INVALID_CREDENTIALS",
      message: "Credenciales no válidas.",
    });
  }

  return sanitizeAuthResponse({
    ok: true,
    role: user.role,
    displayName: user.displayName,
    session: "mock-active",
  });
}

export function mockSession(role = AUTH_ROLES.PLAYER) {
  return sanitizeAuthResponse({
    authenticated: true,
    role,
    displayName: "Usuario Demo",
    permissions: [],
    session: "mock-active",
  });
}

export function mockRoleCheck(role = AUTH_ROLES.PLAYER) {
  return sanitizeAuthResponse({
    ok: true,
    role,
    allowed: Object.values(AUTH_ROLES).includes(role),
  });
}

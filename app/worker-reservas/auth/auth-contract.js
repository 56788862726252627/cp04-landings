// Club Pádel 04 · Auth Contract
// Archivo aislado de planificación técnica.
// No está conectado todavía al Worker ni al frontend.

export const AUTH_ROLES = {
  PLAYER: "PLAYER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
  SUPPORT: "SUPPORT",
};

export const AUTH_ENDPOINTS = {
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  session: "/api/auth/session",
  roleCheck: "/api/auth/role-check",
  forgotPassword: "/api/auth/forgot-password",
  resetPassword: "/api/auth/reset-password",
};

export const FRONTEND_FORBIDDEN_FIELDS = [
  "password",
  "passwordHash",
  "access_token",
  "refresh_token",
  "paymentSecretKey",
  "staffNotes",
  "auditLogs",
];

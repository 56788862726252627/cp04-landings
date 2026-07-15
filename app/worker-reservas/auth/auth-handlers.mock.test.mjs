import {
  sanitizeAuthResponse,
  mockLogin,
  mockSession,
  mockRoleCheck,
} from "./auth-handlers.mock.js";

console.log("===== TEST AUTH MOCK · CLUB PÁDEL 04 =====");

const unsafe = sanitizeAuthResponse({
  ok: true,
  password: "secret",
  passwordHash: "hash",
  access_token: "token",
  refresh_token: "refresh",
  role: "PLAYER",
});

console.log("sanitizeAuthResponse:", unsafe);

console.log("mockLogin OK:", mockLogin({
  role: "PLAYER",
  email: "player.demo@clubpadel04.local",
}));

console.log("mockLogin FAIL:", mockLogin({
  role: "PLAYER",
  email: "wrong.demo@clubpadel04.local",
}));

console.log("mockSession:", mockSession("STAFF"));
console.log("mockRoleCheck:", mockRoleCheck("ADMIN"));

console.log("===== TEST FINALIZADO SIN CONEXIÓN A PRODUCCIÓN =====");

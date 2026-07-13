import { handleMockAuthRequest } from "./auth-adapter.mock.js";

console.log("===== TEST AUTH ADAPTER MOCK · CLUB PÁDEL 04 =====");

console.log("LOGIN OK:", await handleMockAuthRequest("/api/auth/login", {
  role: "PLAYER",
  email: "player.demo@clubpadel04.local",
}));

console.log("LOGIN FAIL:", await handleMockAuthRequest("/api/auth/login", {
  role: "PLAYER",
  email: "wrong.demo@clubpadel04.local",
}));

console.log("SESSION:", await handleMockAuthRequest("/api/auth/session", {
  role: "STAFF",
}));

console.log("ROLE CHECK:", await handleMockAuthRequest("/api/auth/role-check", {
  role: "ADMIN",
}));

console.log("LOGOUT:", await handleMockAuthRequest("/api/auth/logout", {}));

console.log("FORGOT PASSWORD:", await handleMockAuthRequest("/api/auth/forgot-password", {
  email: "demo@clubpadel04.local",
}));

console.log("UNKNOWN:", await handleMockAuthRequest("/api/auth/unknown", {}));

console.log("===== TEST FINALIZADO SIN CONEXIÓN A PRODUCCIÓN =====");

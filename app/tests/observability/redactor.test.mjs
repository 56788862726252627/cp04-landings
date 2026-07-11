import test from "node:test";
import assert from "node:assert/strict";
import { redactEvent } from "../../scripts/observability/redactor.mjs";

test("elimina por completo una clave prohibida (authorization), no solo enmascara su valor", () => {
  const { redacted, redactions } = redactEvent({ headers: { authorization: "Bearer eyJabc.def.ghi" } });
  assert.equal(Object.prototype.hasOwnProperty.call(redacted.headers, "authorization"), false);
  assert.ok(redactions.some((r) => r.kind === "forbidden_key_removed" && r.path.includes("authorization")));
});

for (const key of ["authorization", "cookie", "set-cookie", "token", "access_token", "refresh_token", "api_key", "secret", "password"]) {
  test(`elimina la clave prohibida "${key}" pedida explícitamente por la misión`, () => {
    const { redacted } = redactEvent({ [key]: "cualquier-valor" });
    assert.equal(Object.prototype.hasOwnProperty.call(redacted, key), false);
  });
}

test("enmascara un Bearer JWT embebido dentro de un mensaje libre, sin eliminar el campo completo", () => {
  const { redacted, redactions } = redactEvent({
    message: "fallo al llamar upstream con cabecera Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  });
  assert.ok(!redacted.message.includes("eyJhbGciOiJIUzI1NiJ9"));
  assert.ok(redacted.message.includes("[REDACTED]"));
  assert.ok(redactions.some((r) => r.kind === "value_pattern"));
});

test("redacta solo el query param sensible de una webhook URL, preservando el resto de la URL", () => {
  const { redacted, redactions } = redactEvent({ webhook_url: "https://hook.eu1.make.com/abc123?token=supersecretvalue123&modo=prueba" });
  assert.ok(redacted.webhook_url.startsWith("https://hook.eu1.make.com/abc123?"));
  assert.ok(redacted.webhook_url.includes("modo=prueba"));
  assert.ok(!redacted.webhook_url.includes("supersecretvalue123"));
  assert.ok(redactions.some((r) => r.kind === "url_query_param"));
});

test("detecta y enmascara PII (email) de forma separada de los secretos, con un marcador distinto", () => {
  const { redacted, redactions } = redactEvent({ contacto: "jugador.demo@example.com" });
  assert.ok(redacted.contacto.includes("[PII_REDACTED]"));
  assert.ok(!redacted.contacto.includes("@example.com"));
  assert.ok(redactions.some((r) => r.kind === "pii"));
});

test("no toca campos legítimos que no contienen secretos ni PII", () => {
  const { redacted, redactions } = redactEvent({ route: "/api/reservas", method: "POST", court: "Pista 2" });
  assert.deepEqual(redacted, { route: "/api/reservas", method: "POST", court: "Pista 2" });
  assert.deepEqual(redactions, []);
});

test("redacta recursivamente dentro de arrays", () => {
  const { redacted } = redactEvent({ logs: [{ password: "x" }, { note: "sin problema" }] });
  assert.equal(Object.prototype.hasOwnProperty.call(redacted.logs[0], "password"), false);
  assert.equal(redacted.logs[1].note, "sin problema");
});

test("nunca muta el objeto original", () => {
  const original = { authorization: "Bearer xyz" };
  redactEvent(original);
  assert.equal(original.authorization, "Bearer xyz");
});

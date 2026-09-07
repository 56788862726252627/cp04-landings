import test from "node:test";
import assert from "node:assert/strict";
import {
  COMMUNITY_ADULT_ONLY_GATE,
  ADULT_ONLY_MIN_AGE,
  AGE_STATUS,
  isCommunityAllowed,
  getCommunityBlockedMessage,
  checkCommunityAccess,
} from "./communityAgePolicy.js";

// Tests del módulo puro de política de edad (P1.3-L).
// Ningún test aquí toca el store, la UI ni servicios externos.

test("constantes: COMMUNITY_ADULT_ONLY_GATE es true (gate activo por defecto)", () => {
  assert.equal(COMMUNITY_ADULT_ONLY_GATE, true);
});

test("constantes: ADULT_ONLY_MIN_AGE es 18 (umbral conservador temporal)", () => {
  assert.equal(ADULT_ONLY_MIN_AGE, 18);
});

test("AGE_STATUS: contiene los cuatro estados definidos", () => {
  assert.equal(AGE_STATUS.ADULT_VERIFIED, "adult_verified");
  assert.equal(AGE_STATUS.AGE_UNKNOWN, "age_unknown");
  assert.equal(AGE_STATUS.MINOR_OR_BELOW_POLICY, "minor_or_below_policy");
  assert.equal(AGE_STATUS.VERIFICATION_PENDING, "verification_pending");
});

test("AGE_STATUS: es inmutable (Object.freeze)", () => {
  assert.throws(() => {
    "use strict";
    AGE_STATUS.ADULT_VERIFIED = "modificado";
  });
});

// --- isCommunityAllowed ---

test("isCommunityAllowed: adult_verified → allowed:true", () => {
  const result = isCommunityAllowed(AGE_STATUS.ADULT_VERIFIED);
  assert.equal(result.allowed, true);
  assert.equal(result.reason, "adult_verified");
});

test("isCommunityAllowed: age_unknown → allowed:false con mensaje de UI", () => {
  const result = isCommunityAllowed(AGE_STATUS.AGE_UNKNOWN);
  assert.equal(result.allowed, false);
  assert.equal(typeof result.reason, "string");
  assert.ok(result.reason.length > 0);
  assert.ok(!result.reason.toLowerCase().includes("ilegal"), "no debe usar el término ilegal");
  assert.ok(!result.reason.toLowerCase().includes("la ley prohíbe"), "no debe citar la ley");
});

test("isCommunityAllowed: minor_or_below_policy → allowed:false", () => {
  const result = isCommunityAllowed(AGE_STATUS.MINOR_OR_BELOW_POLICY);
  assert.equal(result.allowed, false);
  assert.equal(typeof result.reason, "string");
});

test("isCommunityAllowed: verification_pending → allowed:false", () => {
  const result = isCommunityAllowed(AGE_STATUS.VERIFICATION_PENDING);
  assert.equal(result.allowed, false);
  assert.equal(typeof result.reason, "string");
});

test("isCommunityAllowed: status desconocido → allowed:false con fallback de mensaje", () => {
  const result = isCommunityAllowed("status_inventado");
  assert.equal(result.allowed, false);
  assert.equal(typeof result.reason, "string");
  assert.ok(result.reason.length > 0);
});

test("isCommunityAllowed: undefined → allowed:false (sin status = bloqueado)", () => {
  const result = isCommunityAllowed(undefined);
  assert.equal(result.allowed, false);
});

// --- getCommunityBlockedMessage ---

test("getCommunityBlockedMessage: adult_verified → null (no hay bloqueo)", () => {
  assert.equal(getCommunityBlockedMessage(AGE_STATUS.ADULT_VERIFIED), null);
});

test("getCommunityBlockedMessage: age_unknown → string no vacío", () => {
  const msg = getCommunityBlockedMessage(AGE_STATUS.AGE_UNKNOWN);
  assert.equal(typeof msg, "string");
  assert.ok(msg.length > 0);
});

test("getCommunityBlockedMessage: minor_or_below_policy → string no vacío", () => {
  const msg = getCommunityBlockedMessage(AGE_STATUS.MINOR_OR_BELOW_POLICY);
  assert.equal(typeof msg, "string");
  assert.ok(msg.length > 0);
});

test("getCommunityBlockedMessage: verification_pending → string no vacío", () => {
  const msg = getCommunityBlockedMessage(AGE_STATUS.VERIFICATION_PENDING);
  assert.equal(typeof msg, "string");
  assert.ok(msg.length > 0);
});

// --- checkCommunityAccess ---

test("checkCommunityAccess: profile con adult_verified → allowed:true, message:null", () => {
  const result = checkCommunityAccess({ ageStatus: AGE_STATUS.ADULT_VERIFIED });
  assert.equal(result.allowed, true);
  assert.equal(result.ageStatus, AGE_STATUS.ADULT_VERIFIED);
  assert.equal(result.message, null);
});

test("checkCommunityAccess: profile sin ageStatus → allowed:false, ageStatus:age_unknown", () => {
  const result = checkCommunityAccess({});
  assert.equal(result.allowed, false);
  assert.equal(result.ageStatus, AGE_STATUS.AGE_UNKNOWN);
  assert.equal(typeof result.message, "string");
});

test("checkCommunityAccess: perfil null → allowed:false, ageStatus:age_unknown (sin lanzar)", () => {
  const result = checkCommunityAccess(null);
  assert.equal(result.allowed, false);
  assert.equal(result.ageStatus, AGE_STATUS.AGE_UNKNOWN);
});

test("checkCommunityAccess: perfil undefined → allowed:false, ageStatus:age_unknown (sin lanzar)", () => {
  const result = checkCommunityAccess(undefined);
  assert.equal(result.allowed, false);
  assert.equal(result.ageStatus, AGE_STATUS.AGE_UNKNOWN);
});

test("checkCommunityAccess: minor_or_below_policy → allowed:false con mensaje", () => {
  const result = checkCommunityAccess({ ageStatus: AGE_STATUS.MINOR_OR_BELOW_POLICY });
  assert.equal(result.allowed, false);
  assert.equal(result.ageStatus, AGE_STATUS.MINOR_OR_BELOW_POLICY);
  assert.equal(typeof result.message, "string");
});

test("checkCommunityAccess: ageStatus con valor inválido → age_unknown (fallback conservador)", () => {
  const result = checkCommunityAccess({ ageStatus: "status_inventado" });
  assert.equal(result.allowed, false);
  assert.equal(result.ageStatus, AGE_STATUS.AGE_UNKNOWN);
});

test("checkCommunityAccess: los mensajes de bloqueo no usan lenguaje legal inadecuado", () => {
  const statuses = [AGE_STATUS.AGE_UNKNOWN, AGE_STATUS.MINOR_OR_BELOW_POLICY, AGE_STATUS.VERIFICATION_PENDING];
  for (const ageStatus of statuses) {
    const { message } = checkCommunityAccess({ ageStatus });
    assert.ok(message, `debe haber mensaje para ${ageStatus}`);
    assert.ok(!message.toLowerCase().includes("ilegal"), `'${ageStatus}': no debe usar 'ilegal'`);
    assert.ok(!message.toLowerCase().includes("incumplimiento"), `'${ageStatus}': no debe usar 'incumplimiento'`);
    assert.ok(!message.toLowerCase().includes("la ley prohíbe"), `'${ageStatus}': no debe citar la ley`);
  }
});

test("checkCommunityAccess: invariante — allowed:true implica message:null", () => {
  const result = checkCommunityAccess({ ageStatus: AGE_STATUS.ADULT_VERIFIED });
  assert.equal(result.allowed, true);
  assert.equal(result.message, null);
});

test("checkCommunityAccess: invariante — allowed:false implica message no null", () => {
  for (const ageStatus of [AGE_STATUS.AGE_UNKNOWN, AGE_STATUS.MINOR_OR_BELOW_POLICY, AGE_STATUS.VERIFICATION_PENDING]) {
    const result = checkCommunityAccess({ ageStatus });
    assert.equal(result.allowed, false);
    assert.notEqual(result.message, null, `${ageStatus} debe tener mensaje`);
  }
});

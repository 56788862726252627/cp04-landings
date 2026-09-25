import test from "node:test";
import assert from "node:assert/strict";

import {
  cp04ShouldBlockAnonymousReservaSubmit,
  cp04IsSessionExpiredReservaResponse,
} from "./reservaAuthGate.js";

// cp04ShouldBlockAnonymousReservaSubmit -------------------------------------

test("cp04ShouldBlockAnonymousReservaSubmit: sin auth (null/undefined) -> bloquea", () => {
  assert.equal(cp04ShouldBlockAnonymousReservaSubmit(null), true);
  assert.equal(cp04ShouldBlockAnonymousReservaSubmit(undefined), true);
});

test("cp04ShouldBlockAnonymousReservaSubmit: auth.isAuthenticated false -> bloquea", () => {
  assert.equal(cp04ShouldBlockAnonymousReservaSubmit({ isAuthenticated: false }), true);
});

test("cp04ShouldBlockAnonymousReservaSubmit: auth.isAuthenticated true -> no bloquea", () => {
  assert.equal(cp04ShouldBlockAnonymousReservaSubmit({ isAuthenticated: true }), false);
});

// cp04IsSessionExpiredReservaResponse ----------------------------------------

test("cp04IsSessionExpiredReservaResponse: respuesta con status 401 -> true", () => {
  assert.equal(cp04IsSessionExpiredReservaResponse({ status: 401 }), true);
});

test("cp04IsSessionExpiredReservaResponse: cualquier otro status -> false", () => {
  assert.equal(cp04IsSessionExpiredReservaResponse({ status: 200 }), false);
  assert.equal(cp04IsSessionExpiredReservaResponse({ status: 403 }), false);
  assert.equal(cp04IsSessionExpiredReservaResponse({ status: 500 }), false);
});

test("cp04IsSessionExpiredReservaResponse: sin respuesta (null/undefined) -> false, no revienta", () => {
  assert.equal(cp04IsSessionExpiredReservaResponse(null), false);
  assert.equal(cp04IsSessionExpiredReservaResponse(undefined), false);
});

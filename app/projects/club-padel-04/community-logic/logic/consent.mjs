// Comunidad Pádel 04 — Lógica aislada: consentimiento
// Espejo funcional de CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md.
// Ninguna función toca red, disco ni Supabase — opera solo sobre el store en memoria.

import { createConsent, appendAudit } from "../entities/store.mjs";

/**
 * Devuelve true si el usuario tiene el consentimiento indicado vigente
 * (el registro más reciente de ese tipo tiene granted=true).
 *
 * Nota de implementación: el "más reciente" se determina por orden de
 * inserción en el store (grantConsent/revokeConsent siempre hacen push),
 * no por comparación de timestamp — dos registros creados en el mismo
 * milisegundo (habitual en tests síncronos) empatarían en un ordenamiento
 * por fecha y darían un resultado incorrecto. Este bug fue detectado por
 * los propios tests de este módulo antes de mergear.
 */
export function hasConsent(store, userId, consentType) {
  const records = store.consents.filter((c) => c.userId === userId && c.consentType === consentType);
  const latest = records[records.length - 1];
  return Boolean(latest?.granted);
}

/** Otorga (o vuelve a otorgar) un consentimiento — crea un registro nuevo, nunca edita uno previo. */
export function grantConsent(store, { clubId, userId, consentType }) {
  const record = createConsent({ clubId, userId, consentType, granted: true });
  store.consents.push(record);
  appendAudit(store, {
    clubId,
    actorId: userId,
    action: "privacy_consent.granted",
    targetType: "PrivacyConsent",
    targetId: record.id,
    metadata: { consentType },
  });
  return record;
}

/**
 * Retira un consentimiento — crea un registro nuevo con granted=false.
 * El histórico anterior permanece inmutable (coherente con el modelo de datos).
 */
export function revokeConsent(store, { clubId, userId, consentType }) {
  const record = createConsent({ clubId, userId, consentType, granted: false });
  store.consents.push(record);
  appendAudit(store, {
    clubId,
    actorId: userId,
    action: "privacy_consent.revoked",
    targetType: "PrivacyConsent",
    targetId: record.id,
    metadata: { consentType },
  });
  return record;
}

/** Puerta general de la capa social — equivalente al consent-gate de los prototipos. */
export function hasSocialLayerActive(store, userId) {
  return hasConsent(store, userId, "social_layer_opt_in");
}

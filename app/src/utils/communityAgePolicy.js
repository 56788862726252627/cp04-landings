// Club Pádel 04 · Política de edad para la capa social (Comunidad).
//
// READINESS TÉCNICO — no asesoramiento legal ni garantía de cumplimiento.
//
// ADULT_ONLY_MIN_AGE=18 es una decisión conservadora interna TEMPORAL.
// Requiere validación de abogado/DPO y resolución de EIPD/DPIA antes de
// aplicarse con datos reales. El número 18 no afirma que ese sea el umbral
// legal definitivo — solo es el límite conservador elegido provisionalmente
// por el equipo hasta recibir dictamen jurídico externo.
//
// Referencia: docs/club-padel-04/comunidad/P1_3L_MENORES_LEGAL_READINESS_TECNICO.md
// PR #24 (revisión legal externa — sigue DRAFT, sin merge).

// Switch maestro de la política adult-only.
// true  → solo ADULT_VERIFIED puede usar la capa social.
// false → desactiva el gate completo (SOLO con aprobación jurídica explícita).
export const COMMUNITY_ADULT_ONLY_GATE = true;

// Umbral de edad conservador. Requiere validación jurídica antes de producción.
export const ADULT_ONLY_MIN_AGE = 18;

// Estados posibles de un perfil respecto a la política de acceso a Comunidad.
export const AGE_STATUS = Object.freeze({
  ADULT_VERIFIED: "adult_verified",           // mayoría confirmada — acceso permitido
  AGE_UNKNOWN: "age_unknown",                 // sin dato de edad — bloqueado (default conservador)
  MINOR_OR_BELOW_POLICY: "minor_or_below_policy", // menor o por debajo del umbral — bloqueado
  VERIFICATION_PENDING: "verification_pending",   // proceso de verificación iniciado — bloqueado
});

// Mensajes de UI para perfiles bloqueados.
// NO usar términos legales como "ilegal", "incumplimiento" ni "la ley prohíbe".
const _BLOCKED_MESSAGES = {
  [AGE_STATUS.AGE_UNKNOWN]:
    "La Comunidad deportiva no está disponible para este perfil en esta fase. Contactar con el club para más información.",
  [AGE_STATUS.MINOR_OR_BELOW_POLICY]:
    "La Comunidad deportiva no está disponible para este perfil en esta fase. Contactar con el club para más información.",
  [AGE_STATUS.VERIFICATION_PENDING]:
    "La Comunidad deportiva no está disponible hasta confirmar el estado del perfil. Contactar con el club para más información.",
};

const _DEFAULT_BLOCKED_MESSAGE =
  "La Comunidad deportiva no está disponible para este perfil en esta fase. Contactar con el club para más información.";

/**
 * Decide si un ageStatus tiene acceso a la capa social.
 * Conservador por defecto: solo ADULT_VERIFIED tiene acceso cuando el gate está activo.
 *
 * @returns {{ allowed: boolean, reason: string }}
 */
export function isCommunityAllowed(ageStatus) {
  if (!COMMUNITY_ADULT_ONLY_GATE) {
    return { allowed: true, reason: "gate_disabled" };
  }
  if (ageStatus === AGE_STATUS.ADULT_VERIFIED) {
    return { allowed: true, reason: "adult_verified" };
  }
  return {
    allowed: false,
    reason: _BLOCKED_MESSAGES[ageStatus] ?? _DEFAULT_BLOCKED_MESSAGE,
  };
}

/**
 * Devuelve el mensaje de bloqueo para un ageStatus no verificado,
 * o null si el perfil tiene acceso.
 */
export function getCommunityBlockedMessage(ageStatus) {
  if (ageStatus === AGE_STATUS.ADULT_VERIFIED) return null;
  return _BLOCKED_MESSAGES[ageStatus] ?? _DEFAULT_BLOCKED_MESSAGE;
}

/**
 * Evaluación completa de acceso a partir de un objeto profile.
 *
 * profile puede incluir:
 *   - ageStatus: string  (si ya fue resuelto externamente)
 *
 * Sin ageStatus explícito → AGE_UNKNOWN → bloqueado.
 * La postura conservadora exige verificación activa, no la ausencia de contraindicio.
 * No existe DOB en el modelo actual de CP04 — la fecha de nacimiento nunca se almacena aquí.
 *
 * @returns {{ allowed: boolean, ageStatus: string, message: string|null }}
 */
export function checkCommunityAccess(profile = {}) {
  const validStatuses = Object.values(AGE_STATUS);
  const ageStatus = validStatuses.includes(profile?.ageStatus)
    ? profile.ageStatus
    : AGE_STATUS.AGE_UNKNOWN;

  const { allowed, reason } = isCommunityAllowed(ageStatus);
  return { allowed, ageStatus, message: allowed ? null : reason };
}

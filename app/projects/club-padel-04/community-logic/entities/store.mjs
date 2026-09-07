// Comunidad Pádel 04 — Lógica aislada (Prompt "lógica aislada y tests")
// Modelo lógico de entidades mock, en memoria, sin backend real.
//
// Espejo funcional (no 1:1 en tipos de columna) de las 21 entidades ya
// diseñadas en app/docs/club-padel-04/comunidad/MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md.
// Ningún dato de este módulo es real. Ninguna función de este módulo conecta
// a Supabase, Make, Airtable, Stripe, WhatsApp ni a ningún servicio externo.

/** Crea un almacén en memoria vacío con un array por entidad. */
export function createEmptyStore() {
  return {
    userProfiles: [],
    playerSocialProfiles: [],
    playerStats: [],
    friendships: [],
    follows: [],
    posts: [],
    comments: [],
    reactions: [],
    openMatches: [],
    matchInvites: [],
    groups: [],
    groupMembers: [],
    eventRegistrations: [],
    socialRankings: [],
    notifications: [],
    reports: [],
    moderationActions: [],
    consents: [],
    auditLog: [],
  };
}

// crypto.randomUUID() global (Web Crypto API): disponible sin import tanto
// en Node 19+ como en cualquier navegador moderno — a diferencia de
// `import { randomUUID } from "node:crypto"` (built-in de Node que Vite no
// puede resolver para un bundle de navegador, sin polyfill configurado).
// Mismo generador de UUID v4, ningún cambio de comportamiento.
function id() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

/** 1. Usuario social — espejo lógico de UserProfile. */
export function createUserProfile({ clubId, displayName, role = "PLAYER" }) {
  return {
    id: id(),
    clubId,
    authUserId: `mock-auth-${id()}`,
    displayName,
    role,
    createdAt: now(),
    deactivatedAt: null,
  };
}

/** 2. Perfil social — espejo lógico de PlayerSocialProfile. */
export function createPlayerSocialProfile({
  clubId,
  userProfileId,
  levelDeclared = "intermedio",
  bio = "",
  avatarUrl = null,
  visibilityLevel = "friends",
  visibilityMatchesPlayed = "private",
  visibilityAvailability = "private",
}) {
  return {
    id: id(),
    clubId,
    userProfileId,
    levelDeclared,
    bio,
    avatarUrl,
    visibilityLevel,
    visibilityMatchesPlayed,
    visibilityAvailability,
    createdAt: now(),
    updatedAt: now(),
  };
}

/** 3. Amistad/conexión — espejo lógico de Friendship. */
export function createFriendship({ clubId, requesterId, addresseeId, status = "pending" }) {
  return {
    id: id(),
    clubId,
    requesterId,
    addresseeId,
    status, // pending | accepted | rejected | blocked | cancelled (extensión propuesta, ver README)
    createdAt: now(),
    respondedAt: null,
  };
}

/** 4. Seguidor — espejo lógico de Follow. */
export function createFollow({ clubId, followerId, followedId }) {
  return {
    id: id(),
    clubId,
    followerId,
    followedId,
    createdAt: now(),
  };
}

/** 5. Publicación/feed — espejo lógico de CommunityPost. */
export function createPost({
  clubId,
  authorId,
  postType = "player_activity",
  body = "",
  visibility = "friends",
  relatedEntityType = null,
  relatedEntityId = null,
}) {
  return {
    id: id(),
    clubId,
    authorId,
    postType, // club_announcement | player_activity | system_generated
    body,
    visibility, // friends | club
    relatedEntityType,
    relatedEntityId,
    createdAt: now(),
    deletedAt: null,
    hiddenByModeration: false,
  };
}

/** 6. Comentario — espejo lógico de Comment. */
export function createComment({ clubId, postId, authorId, body }) {
  return {
    id: id(),
    clubId,
    postId,
    authorId,
    body,
    createdAt: now(),
    deletedAt: null,
  };
}

/** 7. Reacción — espejo lógico de Reaction. */
export function createReaction({ clubId, targetType, targetId, userId, reactionType = "like" }) {
  return {
    id: id(),
    clubId,
    targetType, // post | comment
    targetId,
    userId,
    reactionType,
    createdAt: now(),
  };
}

/** 8. Partido abierto — espejo lógico de OpenMatch. */
export function createOpenMatch({
  clubId,
  creatorId,
  relatedBookingId = null,
  levelMin = "iniciacion",
  levelMax = "profesional",
  scheduledAt,
  slotsTotal = 4,
  visibility = "club",
}) {
  return {
    id: id(),
    clubId,
    creatorId,
    relatedBookingId,
    levelMin,
    levelMax,
    scheduledAt,
    slotsTotal,
    slotsFilled: 1, // el creador ocupa la primera plaza
    status: "open", // open | full | cancelled | completed
    visibility, // club | friends
    createdAt: now(),
    cancelledAt: null,
  };
}

/** 9. Invitación a partido — espejo lógico de MatchInvite. */
export function createMatchInvite({ clubId, openMatchId, requesterId, status = "pending" }) {
  return {
    id: id(),
    clubId,
    openMatchId,
    requesterId,
    status, // pending | accepted | rejected | cancelled
    createdAt: now(),
    respondedAt: null,
  };
}

/** 10. Grupo — espejo lógico de ClubGroup (fase 2, estructura mínima). */
export function createGroup({ clubId, name, isOfficial = false, visibility = "invite_only", createdBy }) {
  return {
    id: id(),
    clubId,
    name,
    description: "",
    isOfficial,
    visibility,
    createdBy,
    createdAt: now(),
    archivedAt: null,
  };
}

/** 11. Inscripción a evento — espejo lógico de EventRegistration (estructura mínima). */
export function createEventRegistration({ clubId, eventId, userId, status = "registered" }) {
  return {
    id: id(),
    clubId,
    eventId,
    userId,
    status, // registered | waitlisted | cancelled | attended
    registeredAt: now(),
    cancelledAt: null,
  };
}

/** 12. Ranking social — espejo lógico de SocialRanking (estructura mínima). */
export function createSocialRanking({ clubId, userId, seasonId, points = 0 }) {
  return {
    id: id(),
    clubId,
    userId,
    seasonId,
    points,
    position: null,
    updatedAt: now(),
  };
}

/** 13. Notificación — espejo lógico de Notification. */
export function createNotification({ clubId, userId, notificationType, payload = {} }) {
  return {
    id: id(),
    clubId,
    userId,
    notificationType,
    payload,
    readAt: null,
    createdAt: now(),
  };
}

/** 14. Reporte — espejo lógico de Report. */
export function createReport({ clubId, reporterId, targetType, targetId, reason, details = null }) {
  return {
    id: id(),
    clubId,
    reporterId,
    targetType, // user | post | comment | group | event
    targetId,
    reason, // harassment | spam | inappropriate_content | fake_profile | other
    details,
    status: "open", // open | in_review | resolved | dismissed
    createdAt: now(),
    resolvedAt: null,
  };
}

/** 15. Acción de moderación — espejo lógico de ModerationAction. */
export function createModerationAction({ clubId, reportId, moderatorId, actionType, notes = null }) {
  return {
    id: id(),
    clubId,
    reportId,
    moderatorId,
    actionType, // warning | content_removed | user_suspended | user_banned | no_action
    notes,
    createdAt: now(),
  };
}

/** 16. Consentimiento — espejo lógico de PrivacyConsent. */
export function createConsent({ clubId, userId, consentType, granted, consentVersion = "mock-v1" }) {
  return {
    id: id(),
    clubId,
    userId,
    consentType,
    granted,
    grantedAt: granted ? now() : null,
    revokedAt: granted ? null : now(),
    consentVersion,
  };
}

/** Auditoría mínima — espejo lógico de AuditLog. */
export function appendAudit(store, { clubId, actorId = null, action, targetType, targetId, metadata = {} }) {
  const entry = { id: id(), clubId, actorId, action, targetType, targetId, metadata, createdAt: now() };
  store.auditLog.push(entry);
  return entry;
}

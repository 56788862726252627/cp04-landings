// Comunidad Pádel 04 — Lógica aislada: notificaciones sociales (P1.3)
// Gestión de lectura y estado de las notificaciones ya generadas por otros
// módulos (friendship, follow, feed, open-matches, moderation). Este módulo
// no genera notificaciones — solo las lee y gestiona su estado leída/no leída.

/**
 * Lista las notificaciones de un usuario en un club, de más reciente a más
 * antigua. Nunca devuelve notificaciones de otro club (tenant isolation).
 */
export function listNotifications(store, { userId, clubId, limit = 20 } = {}) {
  const validLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  return store.notifications
    .filter((n) => n.userId === userId && n.clubId === clubId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, validLimit);
}

/** Número de notificaciones no leídas de un usuario en un club. */
export function getUnreadCount(store, userId, clubId) {
  return store.notifications.filter(
    (n) => n.userId === userId && n.clubId === clubId && !n.readAt
  ).length;
}

/**
 * Marca una notificación como leída. Solo el destinatario puede marcarla.
 * Devuelve { ok: boolean, error?: string }.
 */
export function markNotificationRead(store, notificationId, userId) {
  const notif = store.notifications.find(
    (n) => n.id === notificationId && n.userId === userId
  );
  if (!notif) return { ok: false, error: "Notificación no encontrada o no autorizado" };
  if (!notif.readAt) notif.readAt = new Date().toISOString();
  return { ok: true };
}

/**
 * Marca como leídas todas las notificaciones no leídas de un usuario en un club.
 * Devuelve { ok: true, count } con el número de notificaciones marcadas.
 */
export function markAllNotificationsRead(store, userId, clubId) {
  const ts = new Date().toISOString();
  let count = 0;
  store.notifications.forEach((n) => {
    if (n.userId === userId && n.clubId === clubId && !n.readAt) {
      n.readAt = ts;
      count++;
    }
  });
  return { ok: true, count };
}

/**
 * Feed paginado: devuelve una página de posts visibles para el viewer.
 *
 * Aplica TODAS las reglas de visibilidad (bloqueo, consentimiento, clubId,
 * moderación) vía getVisibleFeed antes de paginar — nunca expone posts que
 * el viewer no debería ver. El cursor es el id del último post devuelto
 * (opaco para la UI, estable mientras el post exista en el store).
 *
 * Devuelve { ok, items, nextCursor, hasMore } o { ok: false, error }.
 */
export function getPaginatedFeed(store, viewerId, { cursor = null, limit = 10, getVisibleFeed } = {}) {
  if (typeof getVisibleFeed !== "function") {
    return { ok: false, error: "getVisibleFeed requerido", items: [], hasMore: false, nextCursor: null };
  }
  const validLimit = Math.max(1, Math.min(50, Number(limit) || 10));
  const allVisible = getVisibleFeed(store, viewerId);

  // Newest first, id como desempate para orden determinista sin duplicados.
  const sorted = [...allVisible].sort((a, b) => {
    const d = b.createdAt.localeCompare(a.createdAt);
    return d !== 0 ? d : b.id.localeCompare(a.id);
  });

  let startIdx = 0;
  if (cursor !== null) {
    const idx = sorted.findIndex((p) => p.id === cursor);
    if (idx === -1) {
      return { ok: false, error: "cursor_invalid", items: [], hasMore: false, nextCursor: null };
    }
    startIdx = idx + 1;
  }

  const page = sorted.slice(startIdx, startIdx + validLimit);
  const hasMore = startIdx + validLimit < sorted.length;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].id : null;

  return { ok: true, items: page, nextCursor, hasMore };
}

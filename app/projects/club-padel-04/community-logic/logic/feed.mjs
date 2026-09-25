// Comunidad Pádel 04 — Lógica aislada: feed
// Espejo funcional de PROTOTIPO_FEED_SOCIAL_COMUNIDAD_PADEL_04.md.

import { createPost, createComment, createReaction } from "../entities/store.mjs";
import { hasConsent, hasSocialLayerActive } from "./consent.mjs";
import { isBlocked } from "./blocking.mjs";
import { areFriends } from "./friendship.mjs";

/**
 * Crear publicación mock. Reglas de seguridad ya documentadas:
 * - sin social_layer_opt_in, no publicar;
 * - post_type=player_activity requiere appear_in_feed;
 * - club_announcement requiere rol STAFF/ADMIN (contenido oficial).
 */
export function createPostMock(store, { clubId, authorId, body, visibility = "friends", postType = "player_activity" }) {
  if (!hasSocialLayerActive(store, authorId)) {
    throw new Error("social_layer_opt_in requerido para publicar");
  }

  if (postType === "player_activity" && !hasConsent(store, authorId, "appear_in_feed")) {
    throw new Error("appear_in_feed requerido para publicar actividad propia");
  }

  if (postType === "club_announcement") {
    const author = store.userProfiles.find((u) => u.id === authorId);
    if (!author || !["STAFF", "ADMIN"].includes(author.role)) {
      throw new Error("Solo STAFF/ADMIN pueden publicar anuncios oficiales del club");
    }
  }

  const post = createPost({ clubId, authorId, postType, body, visibility });
  store.posts.push(post);
  return post;
}

/**
 * Lista el feed visible para un espectador: mismo club, sin contenido oculto
 * por moderación (salvo STAFF/ADMIN), respetando visibility (club/friends) y
 * excluyendo contenido de usuarios bloqueados en cualquier dirección.
 */
export function getVisibleFeed(store, viewerId) {
  if (!hasSocialLayerActive(store, viewerId)) {
    return []; // estado "sin consentimiento" — el feed no existe todavía para este usuario.
  }

  const viewer = store.userProfiles.find((u) => u.id === viewerId);
  const viewerIsStaff = viewer && ["STAFF", "ADMIN"].includes(viewer.role);

  return store.posts.filter((post) => {
    if (post.deletedAt) return false;
    if (post.hiddenByModeration && !viewerIsStaff) return false;
    if (post.clubId !== viewer?.clubId) return false;
    if (isBlocked(store, viewerId, post.authorId)) return false;

    // Revocación retroactiva (Prompt F, sección 10): si el autor retiró
    // appear_in_feed después de publicar, su actividad deja de mostrarse a
    // terceros de inmediato, aunque el registro no se borra.
    if (post.postType === "player_activity" && post.authorId !== viewerId) {
      if (!hasConsent(store, post.authorId, "appear_in_feed")) return false;
    }

    if (post.visibility === "club") return true;
    if (post.visibility === "friends") {
      return post.authorId === viewerId || areFriends(store, viewerId, post.authorId);
    }
    return false;
  });
}

/** Comentar una publicación — requiere acceso de lectura y ausencia de bloqueo. */
export function commentOnPost(store, { clubId, postId, authorId, body }) {
  const post = store.posts.find((p) => p.id === postId);
  if (!post) throw new Error("Publicación no encontrada");
  if (isBlocked(store, authorId, post.authorId)) {
    throw new Error("No se puede comentar contenido de un usuario bloqueado");
  }
  const visibleToAuthor = getVisibleFeed(store, authorId).some((p) => p.id === postId);
  if (!visibleToAuthor) throw new Error("El usuario no tiene acceso de lectura a esta publicación");

  const comment = createComment({ clubId, postId, authorId, body });
  store.comments.push(comment);
  return comment;
}

/** Reaccionar a una publicación o comentario — un único registro por usuario y objetivo. */
export function reactTo(store, { clubId, targetType, targetId, userId, reactionType = "like" }) {
  const already = store.reactions.find(
    (r) => r.targetType === targetType && r.targetId === targetId && r.userId === userId
  );
  if (already) throw new Error("El usuario ya reaccionó a este contenido");

  const reaction = createReaction({ clubId, targetType, targetId, userId, reactionType });
  store.reactions.push(reaction);
  return reaction;
}

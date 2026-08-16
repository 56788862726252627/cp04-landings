import { useEffect, useState } from "react";
import { T } from "../theme.js";
import {
  COMUNIDAD_DEMO_NOTICE,
  DEMO_PLAYER,
  DEMO_STAFF,
  DEMO_CONTACTS,
} from "../data/comunidadDemoData.js";
import {
  communitySeedDemoRelationships,
  communityHasSocialConsent,
  communityGrantSocialConsent,
  communityRevokeSocialConsent,
  communityGetFriendshipState,
  communitySendFriendRequest,
  communityAcceptFriendRequest,
  communityRejectFriendRequest,
  communityCancelFriendRequest,
  communityRemoveFriend,
  communityIsFollowing,
  communityFollowUser,
  communityUnfollowUser,
  communityCountFollowers,
  communityGetVisibleFeed,
  communityCreatePost,
  communityGetCommentsForPost,
  communityCommentOnPost,
  communityGetReactionsCount,
  communityHasUserReacted,
  communityReactToPost,
  communityCreateOpenMatch,
  communityListVisibleOpenMatches,
  communityRequestToJoin,
  communityAcceptJoinRequest,
  communityRejectJoinRequest,
  communityCancelOpenMatch,
  communityGetPendingInvitesForMatch,
  communityGetMyInviteForMatch,
  DEMO_MODERATOR_IDS,
  communityCanReport,
  communityReportContent,
  communityGetReportsQueue,
  communityMarkInReview,
  communityApplyModerationAction,
  communityDismissReport,
  communityUpdateProfileVisibility,
  communityGetProfileVisibility,
  communityGetFeedPage,
  communityGetNotifications,
  communityGetUnreadCount,
  communityMarkNotificationRead,
  communityMarkAllNotificationsRead,
  COMMUNITY_BRIDGE_CLUB_ID,
  COMMUNITY_BRIDGE_CLUB_B_ID,
} from "../utils/communityBridge.js";

// Club Pádel 04 · Comunidad (demo/mock interno)
//
// Feed, Amigos, Partidos abiertos, Moderación y Consentimiento usan la
// lógica REAL de projects/club-padel-04/community-logic/ a través de
// src/utils/communityBridge.js. El estado vive solo en memoria del navegador
// — se pierde al recargar la página, sin llamadas a Supabase, Make, Airtable,
// Stripe ni WhatsApp.
//
// P0.1 (amistad/follow), P0.2 (feed/posts/comentarios/reacciones),
// P0.3 (partidos abiertos), P0.4 (moderación/reportes/privacidad): CERRADOS.
//
// No debe usarse con menores activos ni datos reales hasta que el PR #24
// (revisión legal externa + decisión de negocio sobre menores) se resuelva.
// Ver DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md.

const ACTOR_ID = DEMO_PLAYER.id;

const DEMO_CLUBS = [
  { id: COMMUNITY_BRIDGE_CLUB_ID, name: "Club Pádel 04" },
  { id: COMMUNITY_BRIDGE_CLUB_B_ID, name: "Club Pádel 05 (demo)" },
];

const NOTIF_TYPE_LABEL = {
  friendship_request: { icon: "🤝", label: "Solicitud de amistad" },
  friendship_accepted: { icon: "✅", label: "Amistad aceptada" },
  new_follower: { icon: "👣", label: "Nuevo seguidor" },
  new_comment: { icon: "💬", label: "Comentario nuevo" },
  new_reaction: { icon: "❤️", label: "Reacción" },
  match_invite: { icon: "🎾", label: "Partido — solicitud/respuesta" },
  moderation_action: { icon: "🛡️", label: "Acción de moderación" },
};

const FRIENDSHIP_STATUS_CHIP = {
  blocked: { tone: "danger", label: "Bloqueado" },
  friends: { tone: "accent", label: "Amistad activa" },
  request_sent: { tone: "warning", label: "Solicitud enviada" },
  request_received: { tone: "warning", label: "Solicitud recibida" },
  none: { tone: "neutral", label: "Sin relación" },
};

const TABS = [
  { id: "feed", label: "Feed", icon: "📰" },
  { id: "notificaciones", label: "Notificaciones", icon: "🔔" },
  { id: "perfil", label: "Perfil", icon: "🙍" },
  { id: "amigos", label: "Amigos", icon: "🤝" },
  { id: "partidos", label: "Partidos abiertos", icon: "🎾" },
  { id: "moderacion", label: "Moderación", icon: "🛡️" },
  { id: "consentimiento", label: "Consentimiento", icon: "📋" },
];

function Chip({ children, tone = "neutral" }) {
  const tones = {
    neutral: { color: T.textDim, border: T.line, background: "rgba(255,255,255,.04)" },
    warning: { color: T.warning, border: "rgba(255,173,71,.4)", background: "rgba(255,173,71,.10)" },
    danger: { color: T.danger, border: "rgba(255,94,58,.4)", background: "rgba(255,94,58,.10)" },
    accent: { color: T.accent, border: "rgba(182,255,0,.4)", background: "rgba(182,255,0,.10)" },
  };
  const s = tones[tone] || tones.neutral;
  return (
    <span
      className="cp04-badge"
      style={{
        color: s.color,
        border: `1px solid ${s.border}`,
        background: s.background,
        borderRadius: 999,
        padding: "5px 11px",
        fontSize: ".72rem",
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

function DemoButton({ children, onClick, variant = "secondary", disabled = false }) {
  const map = {
    primary: { background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#06100a", border: "none" },
    secondary: { background: "rgba(255,255,255,.055)", color: T.text, border: `1px solid ${T.line}` },
    danger: { background: "rgba(255,94,58,.12)", color: T.danger, border: "1px solid rgba(255,94,58,.30)" },
  };
  return (
    <button
      type="button"
      className="cp04-btn"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...map[variant],
        padding: "9px 14px",
        borderRadius: 12,
        fontFamily: T.fontDisplay,
        fontWeight: 800,
        fontSize: ".82rem",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}

function DemoNotice() {
  return (
    <div
      className="cp04-card"
      style={{
        marginBottom: 22,
        borderColor: "rgba(255,173,71,.4)",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: "1.3rem" }}>⚠️</span>
      <div>
        <div style={{ color: T.warning, fontWeight: 900, fontSize: ".8rem", letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 4 }}>
          Aviso — modo demo
        </div>
        <p style={{ margin: 0, color: T.textDim, lineHeight: 1.6 }}>{COMUNIDAD_DEMO_NOTICE}</p>
        <p style={{ margin: "8px 0 0", color: T.textDim, lineHeight: 1.6, fontSize: ".85rem" }}>
          Esta sección no sustituye asesoramiento legal profesional. La integración real con
          datos de personas (incluidos menores) requiere resolver primero el PR #24 de
          revisión legal externa.
        </p>
      </div>
    </div>
  );
}

function FeedTab({ socialConsent, viewerId, feedVersion, onRefresh, setLastAction, reportedPosts = {}, onReportPost, reportedComments = {}, onReportComment, activeClubId }) {
  const [newPostBody, setNewPostBody] = useState("");
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [feedState, setFeedState] = useState({ items: [], cursor: null, hasMore: false, error: null });

  // Carga/recarga al cambiar club, viewerId o feedVersion (bump por onRefresh).
  useEffect(() => {
    const result = communityGetFeedPage(viewerId, { cursor: null, limit: 10, clubId: activeClubId });
    if (result.ok) {
      setFeedState({ items: result.items, cursor: result.nextCursor, hasMore: result.hasMore, error: null });
    } else {
      setFeedState({ items: [], cursor: null, hasMore: false, error: result.error || "Error al cargar el feed" });
    }
    setOpenComments({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerId, activeClubId, feedVersion]);

  function loadMore() {
    if (!feedState.cursor || !feedState.hasMore) return;
    const result = communityGetFeedPage(viewerId, { cursor: feedState.cursor, limit: 10, clubId: activeClubId });
    if (result.ok) {
      setFeedState((prev) => ({
        items: [...prev.items, ...result.items],
        cursor: result.nextCursor,
        hasMore: result.hasMore,
        error: null,
      }));
    } else {
      setFeedState((prev) => ({ ...prev, error: result.error || "Error al cargar más" }));
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { items: visiblePosts } = feedState;

  function handleCreatePost() {
    const body = newPostBody.trim();
    if (!body) return;
    const result = communityCreatePost(viewerId, body);
    if (result.ok) {
      setNewPostBody("");
      onRefresh();
      setLastAction("Publicación creada (en memoria del navegador).");
    } else {
      setLastAction(`Error al publicar: ${result.error}`);
    }
  }

  function handleReact(postId) {
    const result = communityReactToPost(postId, viewerId);
    if (result.ok) {
      onRefresh();
    } else {
      setLastAction(`No se pudo reaccionar: ${result.error}`);
    }
  }

  function toggleComments(postId) {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  function handleComment(postId) {
    const body = (commentInputs[postId] || "").trim();
    if (!body) return;
    const result = communityCommentOnPost(postId, viewerId, body);
    if (result.ok) {
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      onRefresh();
      setLastAction("Comentario añadido (en memoria).");
    } else {
      setLastAction(`Error al comentar: ${result.error}`);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {socialConsent ? (
        <div className="cp04-card" style={{ padding: 16, display: "grid", gap: 10 }}>
          <textarea
            value={newPostBody}
            onChange={(e) => setNewPostBody(e.target.value)}
            placeholder="¿Qué quieres compartir con el club? (en memoria, se pierde al recargar)"
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,.04)",
              border: `1px solid ${T.line}`,
              borderRadius: 10,
              color: T.text,
              padding: "10px 12px",
              fontSize: ".88rem",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <DemoButton variant="primary" onClick={handleCreatePost} disabled={!newPostBody.trim()}>
            Publicar
          </DemoButton>
        </div>
      ) : (
        <p style={{ color: T.textDim, fontSize: ".85rem" }}>
          Activa tu consentimiento social en la pestaña <strong style={{ color: T.text }}>Consentimiento</strong> para
          ver y publicar en el feed.
        </p>
      )}

      {socialConsent && feedState.error && (
        <p style={{ color: T.danger, fontSize: ".85rem" }}>Error: {feedState.error}</p>
      )}

      {socialConsent && visiblePosts.length === 0 && !feedState.error && (
        <p style={{ color: T.textDim, fontSize: ".85rem" }}>
          No hay publicaciones visibles todavía. ¡Sé el primero en publicar!
        </p>
      )}

      {visiblePosts.map((post) => {
        const likeCount = communityGetReactionsCount("post", post.id);
        const hasLiked = communityHasUserReacted("post", post.id, viewerId);
        const comments = communityGetCommentsForPost(post.id);
        const showComments = Boolean(openComments[post.id]);
        const authorLabel = post.authorId === viewerId ? "Tú" : post.authorId;

        return (
          <div key={post.id} className="cp04-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <strong style={{ color: T.accent }}>{authorLabel}</strong>
              <Chip tone="accent">Publicado (en memoria)</Chip>
            </div>
            <p style={{ margin: "0 0 12px", color: T.text, lineHeight: 1.6 }}>{post.body}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <DemoButton onClick={() => handleReact(post.id)} disabled={hasLiked}>
                {hasLiked ? "Me gusta ✓" : "Me gusta"} · {likeCount}
              </DemoButton>
              <DemoButton onClick={() => toggleComments(post.id)}>
                Comentarios · {comments.length}
              </DemoButton>
              <DemoButton
                variant="danger"
                onClick={() => onReportPost && onReportPost(post.id)}
                disabled={Boolean(reportedPosts[post.id])}
              >
                {reportedPosts[post.id] ? "Reportado ✓" : "Reportar"}
              </DemoButton>
            </div>
            {showComments && (
              <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                {comments.length === 0 && (
                  <p style={{ color: T.textDim, fontSize: ".82rem" }}>Sin comentarios todavía.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} style={{ background: "rgba(255,255,255,.03)", borderRadius: 8, padding: "8px 12px", fontSize: ".85rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <strong style={{ color: T.textDim }}>{c.authorId === viewerId ? "Tú" : c.authorId}</strong>
                      {" "}<span style={{ color: T.text }}>{c.body}</span>
                    </div>
                    {c.authorId !== viewerId && onReportComment && (
                      <button
                        type="button"
                        onClick={() => onReportComment(c.id)}
                        disabled={Boolean(reportedComments[c.id])}
                        style={{ background: "none", border: "none", color: reportedComments[c.id] ? T.textDim : T.danger, fontSize: ".72rem", cursor: "pointer", padding: "2px 4px", whiteSpace: "nowrap", opacity: reportedComments[c.id] ? 0.55 : 1 }}
                        title={reportedComments[c.id] ? "Ya reportado" : "Reportar comentario"}
                      >
                        {reportedComments[c.id] ? "Reportado ✓" : "Reportar"}
                      </button>
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input
                    type="text"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleComment(post.id); }}
                    placeholder="Añade un comentario..."
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,.04)",
                      border: `1px solid ${T.line}`,
                      borderRadius: 8,
                      color: T.text,
                      padding: "8px 12px",
                      fontSize: ".85rem",
                    }}
                  />
                  <DemoButton onClick={() => handleComment(post.id)}>Comentar</DemoButton>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {socialConsent && feedState.hasMore && (
        <DemoButton onClick={loadMore}>Cargar más publicaciones</DemoButton>
      )}
      {socialConsent && !feedState.hasMore && visiblePosts.length > 0 && (
        <p style={{ color: T.textDim, fontSize: ".78rem", textAlign: "center", marginTop: 8 }}>
          Has llegado al final del feed.
        </p>
      )}
    </div>
  );
}

function NotificacionesTab({ viewerId, notifVersion, activeClubId, onMarkAll }) {
  const notifications = communityGetNotifications(viewerId, { clubId: activeClubId, limit: 50 });
  const unreadCount = communityGetUnreadCount(viewerId, activeClubId);

  function handleMarkRead(notifId) {
    communityMarkNotificationRead(notifId, viewerId, activeClubId);
    onMarkAll(); // bump notifVersion para re-render
  }

  function handleMarkAll() {
    communityMarkAllNotificationsRead(viewerId, activeClubId);
    onMarkAll();
  }

  if (notifications.length === 0) {
    return (
      <div className="cp04-card" style={{ padding: 22 }}>
        <p style={{ color: T.textDim, fontSize: ".85rem", margin: 0 }}>
          No tienes notificaciones en este club (en memoria).
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ color: T.textDim, fontSize: ".82rem" }}>
          {unreadCount > 0 ? (
            <strong style={{ color: T.warning }}>{unreadCount} sin leer</strong>
          ) : (
            "Todas leídas"
          )}
          {" · "}{notifications.length} total
        </span>
        {unreadCount > 0 && (
          <DemoButton onClick={handleMarkAll}>Marcar todas como leídas</DemoButton>
        )}
      </div>

      {notifications.map((n) => {
        const meta = NOTIF_TYPE_LABEL[n.notificationType] || { icon: "📣", label: n.notificationType };
        const isUnread = !n.readAt;
        const timeLabel = new Date(n.createdAt).toLocaleString("es-ES", {
          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        });
        return (
          <div
            key={n.id}
            className="cp04-card"
            style={{
              padding: "14px 16px",
              borderColor: isUnread ? "rgba(182,255,0,.4)" : undefined,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span aria-hidden="true" style={{ fontSize: "1.15rem", lineHeight: 1 }}>{meta.icon}</span>
              <div>
                <div style={{ color: isUnread ? T.text : T.textDim, fontWeight: isUnread ? 800 : 400, fontSize: ".85rem", marginBottom: 2 }}>
                  {meta.label}
                </div>
                <div style={{ color: T.textDim, fontSize: ".76rem" }}>{timeLabel}</div>
              </div>
            </div>
            {isUnread && (
              <DemoButton onClick={() => handleMarkRead(n.id)}>Marcar leída</DemoButton>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PerfilTab({ player, socialConsent, onTogglePrivacy }) {
  return (
    <div className="cp04-card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.03em" }}>{player.nombre}</h3>
          <p style={{ margin: "6px 0 0", color: T.textDim }}>{player.nivel} · {player.club}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {player.perfilVisible ? <Chip tone="accent">Perfil visible</Chip> : <Chip tone="warning">Perfil privado</Chip>}
          {!socialConsent && <Chip tone="danger">Sin consentimiento social</Chip>}
        </div>
      </div>
      <p style={{ color: T.textDim, fontSize: ".85rem", lineHeight: 1.6, marginBottom: 14 }}>
        Datos íntegramente ficticios (Jugador Demo). La visibilidad es real en memoria — afecta
        a <code>canView()</code> y al listado de partidos. Ningún dato real de clientes se muestra.
      </p>
      <DemoButton onClick={onTogglePrivacy}>
        {player.perfilVisible ? "Hacer perfil privado" : "Hacer perfil visible"}
      </DemoButton>
    </div>
  );
}

function AmigosTab({
  contacts,
  socialConsent,
  followerCount,
  onSendRequest,
  onAccept,
  onReject,
  onCancel,
  onRemove,
  onFollow,
  onUnfollow,
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ color: T.textDim, fontSize: ".85rem" }}>
        Te siguen <strong style={{ color: T.text }}>{followerCount}</strong> jugadores (contador real,
        en memoria del navegador — se pierde al recargar).
      </p>
      {!socialConsent && (
        <p style={{ color: T.warning, fontSize: ".85rem" }}>
          Sin consentimiento social activo: puedes gestionar relaciones ya existentes, pero no enviar
          nuevas solicitudes de amistad ni seguir a nadie hasta activarlo en la pestaña Consentimiento.
        </p>
      )}
      {contacts.map((c) => {
        const state = communityGetFriendshipState(ACTOR_ID, c.id);
        const following = communityIsFollowing(ACTOR_ID, c.id);
        const chip = FRIENDSHIP_STATUS_CHIP[state.status] || FRIENDSHIP_STATUS_CHIP.none;
        return (
          <div key={c.id} className="cp04-card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <strong>{c.nombre}</strong>
              <Chip tone={chip.tone}>{chip.label}</Chip>
              {state.status !== "blocked" && following && <Chip tone="accent">Siguiendo</Chip>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {state.status === "none" && (
                <DemoButton variant="primary" onClick={() => onSendRequest(c.id)}>Añadir amigo</DemoButton>
              )}
              {state.status === "request_received" && (
                <>
                  <DemoButton variant="primary" onClick={() => onAccept(state.friendshipId)}>Aceptar</DemoButton>
                  <DemoButton onClick={() => onReject(state.friendshipId)}>Rechazar</DemoButton>
                </>
              )}
              {state.status === "request_sent" && (
                <DemoButton onClick={() => onCancel(state.friendshipId)}>Cancelar solicitud</DemoButton>
              )}
              {state.status === "friends" && (
                <DemoButton variant="danger" onClick={() => onRemove(c.id)}>Eliminar amigo</DemoButton>
              )}
              {state.status !== "blocked" &&
                (following ? (
                  <DemoButton onClick={() => onUnfollow(c.id)}>Dejar de seguir</DemoButton>
                ) : (
                  <DemoButton onClick={() => onFollow(c.id)}>Seguir</DemoButton>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const LEVEL_LABELS = { iniciacion: "Iniciación", intermedio: "Intermedio", avanzado: "Avanzado", profesional: "Profesional" };
const LEVELS_LIST = ["iniciacion", "intermedio", "avanzado", "profesional"];

const MATCH_STATUS_CHIP = { open: { tone: "accent", label: "Abierto" }, full: { tone: "danger", label: "Completo" }, cancelled: { tone: "neutral", label: "Cancelado" } };

function PartidosTab({ socialConsent, viewerId, matchVersion, onRefresh, setLastAction }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ levelMin: "intermedio", levelMax: "intermedio", slotsTotal: 4, visibility: "club" });

  const visibleMatches = communityListVisibleOpenMatches(viewerId);

  function handleCreate() {
    const result = communityCreateOpenMatch(viewerId, { ...form, scheduledAt: new Date(Date.now() + 86400000).toISOString() });
    if (result.ok) { setShowCreate(false); onRefresh(); setLastAction("Partido creado (en memoria)."); }
    else setLastAction(`Error al crear partido: ${result.error}`);
  }

  function handleRequestJoin(matchId) {
    const result = communityRequestToJoin(matchId, viewerId);
    if (result.ok) { onRefresh(); setLastAction("Solicitud de plaza enviada."); }
    else setLastAction(`Error al solicitar plaza: ${result.error}`);
  }

  function handleAccept(inviteId) {
    const result = communityAcceptJoinRequest(inviteId, viewerId);
    if (result.ok) { onRefresh(); setLastAction("Solicitud aceptada."); }
    else setLastAction(`Error al aceptar: ${result.error}`);
  }

  function handleReject(inviteId) {
    const result = communityRejectJoinRequest(inviteId, viewerId);
    if (result.ok) { onRefresh(); setLastAction("Solicitud rechazada."); }
    else setLastAction(`Error al rechazar: ${result.error}`);
  }

  function handleCancel(matchId) {
    const result = communityCancelOpenMatch(matchId, viewerId);
    if (result.ok) { onRefresh(); setLastAction("Partido cancelado."); }
    else setLastAction(`Error al cancelar: ${result.error}`);
  }

  const inputStyle = { background: "rgba(255,255,255,.04)", border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, padding: "7px 10px", fontSize: ".85rem" };
  const labelStyle = { display: "flex", flexDirection: "column", gap: 4, color: T.textDim, fontSize: ".82rem" };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {!socialConsent && (
        <p style={{ color: T.textDim, fontSize: ".85rem" }}>
          Activa tu consentimiento social en la pestaña <strong style={{ color: T.text }}>Consentimiento</strong> para
          crear y gestionar partidos abiertos.
        </p>
      )}

      {socialConsent && !showCreate && (
        <DemoButton variant="primary" onClick={() => setShowCreate(true)}>+ Crear partido abierto</DemoButton>
      )}

      {showCreate && (
        <div className="cp04-card" style={{ padding: 16, display: "grid", gap: 12 }}>
          <strong style={{ fontFamily: T.fontDisplay }}>Nuevo partido abierto</strong>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={labelStyle}>
              Nivel mínimo
              <select style={inputStyle} value={form.levelMin} onChange={(e) => setForm((p) => ({ ...p, levelMin: e.target.value }))}>
                {LEVELS_LIST.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              Nivel máximo
              <select style={inputStyle} value={form.levelMax} onChange={(e) => setForm((p) => ({ ...p, levelMax: e.target.value }))}>
                {LEVELS_LIST.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              Plazas
              <select style={inputStyle} value={form.slotsTotal} onChange={(e) => setForm((p) => ({ ...p, slotsTotal: Number(e.target.value) }))}>
                {[2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              Visibilidad
              <select style={inputStyle} value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}>
                <option value="club">Todo el club</option>
                <option value="friends">Solo amigos</option>
              </select>
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <DemoButton variant="primary" onClick={handleCreate}>Crear</DemoButton>
            <DemoButton onClick={() => setShowCreate(false)}>Cancelar</DemoButton>
          </div>
        </div>
      )}

      {visibleMatches.length === 0 && socialConsent && (
        <p style={{ color: T.textDim, fontSize: ".85rem" }}>No hay partidos abiertos visibles. ¡Crea el primero!</p>
      )}

      {[...visibleMatches].reverse().map((match) => {
        const isCreator = match.creatorId === viewerId;
        const myInvite = communityGetMyInviteForMatch(match.id, viewerId);
        const pendingInvites = isCreator ? communityGetPendingInvitesForMatch(match.id) : [];
        const chip = MATCH_STATUS_CHIP[match.status] || MATCH_STATUS_CHIP.open;
        const scheduledLabel = new Date(match.scheduledAt).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

        return (
          <div key={match.id} className="cp04-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <strong style={{ color: T.accent }}>{isCreator ? "Tú (organizador)" : match.creatorId}</strong>
                {isCreator && <Chip tone="warning">Organizador</Chip>}
              </div>
              <Chip tone={chip.tone}>{chip.label} (en memoria)</Chip>
            </div>

            <div style={{ color: T.textDim, fontSize: ".85rem", marginBottom: 12, display: "grid", gap: 3 }}>
              <span>Nivel: {LEVEL_LABELS[match.levelMin] || match.levelMin} – {LEVEL_LABELS[match.levelMax] || match.levelMax}</span>
              <span>Plazas: {match.slotsFilled} / {match.slotsTotal} ocupadas</span>
              <span>Visibilidad: {match.visibility === "club" ? "Todo el club" : "Solo amigos"}</span>
              <span>Fecha: {scheduledLabel} (demo)</span>
            </div>

            {isCreator && match.status === "open" && (
              <div style={{ display: "grid", gap: 8 }}>
                {pendingInvites.length === 0 ? (
                  <p style={{ color: T.textDim, fontSize: ".82rem" }}>Sin solicitudes pendientes.</p>
                ) : (
                  <div>
                    <p style={{ color: T.textDim, fontSize: ".82rem", margin: "0 0 6px" }}>Solicitudes pendientes:</p>
                    <div style={{ display: "grid", gap: 6 }}>
                      {pendingInvites.map((inv) => (
                        <div key={inv.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: ".85rem", color: T.text }}>{inv.requesterId}</span>
                          <DemoButton variant="primary" onClick={() => handleAccept(inv.id)}>Aceptar</DemoButton>
                          <DemoButton onClick={() => handleReject(inv.id)}>Rechazar</DemoButton>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <DemoButton variant="danger" onClick={() => handleCancel(match.id)}>Cancelar partido</DemoButton>
              </div>
            )}

            {!isCreator && match.status === "open" && !myInvite && (
              <DemoButton variant="primary" onClick={() => handleRequestJoin(match.id)}>Solicitar plaza</DemoButton>
            )}
            {!isCreator && myInvite?.status === "pending" && <Chip tone="warning">Solicitud enviada — pendiente</Chip>}
            {!isCreator && myInvite?.status === "accepted" && <Chip tone="accent">Plaza confirmada</Chip>}
            {!isCreator && myInvite?.status === "rejected" && <Chip tone="danger">Solicitud rechazada</Chip>}
            {!isCreator && match.status === "full" && !myInvite && <Chip tone="danger">Partido completo — sin plazas</Chip>}
          </div>
        );
      })}
    </div>
  );
}

const REPORT_STATUS_CHIP = {
  open: { tone: "danger", label: "Abierto" },
  in_review: { tone: "warning", label: "En revisión" },
  resolved: { tone: "accent", label: "Resuelto" },
  dismissed: { tone: "neutral", label: "Desestimado" },
};

function ModeracionTab({ moderatorId, selectedRole, onRefresh, setLastAction }) {
  const isModerator = ["STAFF", "ADMIN", "SUPPORT"].includes(selectedRole);
  const isAdmin = selectedRole === "ADMIN";
  const reports = moderatorId ? communityGetReportsQueue(moderatorId) : [];

  function handleMarkInReview(reportId) {
    const r = communityMarkInReview(reportId, moderatorId);
    if (r.ok) { onRefresh(); setLastAction("Reporte marcado en revisión (real, en memoria)."); }
    else setLastAction(`Error al marcar en revisión: ${r.error}`);
  }

  function handleApplyAction(reportId, actionType) {
    const r = communityApplyModerationAction(reportId, moderatorId, actionType);
    if (r.ok) { onRefresh(); setLastAction(`Acción aplicada: ${actionType} (real, en memoria).`); }
    else setLastAction(`Error al aplicar acción: ${r.error}`);
  }

  function handleDismiss(reportId) {
    const r = communityDismissReport(reportId, moderatorId);
    if (r.ok) { onRefresh(); setLastAction("Reporte desestimado (real, en memoria)."); }
    else setLastAction(`Error al desestimar: ${r.error}`);
  }

  return (
    <div>
      {!isModerator && (
        <p style={{ color: T.textDim, fontSize: ".85rem", marginBottom: 14 }}>
          En producción esta cola es visible solo para roles Staff/Admin/Support.
          Cambia el rol en el selector superior para acceder a la moderación real.
        </p>
      )}
      {isModerator && (
        <div style={{ display: "grid", gap: 12 }}>
          {reports.length === 0 && (
            <p style={{ color: T.textDim, fontSize: ".85rem" }}>
              Sin reportes pendientes (cola real, en memoria).
            </p>
          )}
          {reports.map((r) => {
            const chip = REPORT_STATUS_CHIP[r.status] || REPORT_STATUS_CHIP.open;
            return (
              <div key={r.id} className="cp04-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                  <div>
                    <strong style={{ color: T.text }}>{r.targetType}</strong>
                    <span style={{ color: T.textDim, fontSize: ".82rem", marginLeft: 10 }}>Motivo: {r.reason}</span>
                    {isAdmin && r.reporterId && (
                      <span style={{ color: T.textDim, fontSize: ".79rem", marginLeft: 10 }}>
                        (reportante: {r.reporterId})
                      </span>
                    )}
                  </div>
                  <Chip tone={chip.tone}>{chip.label}</Chip>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {r.status === "open" && (
                    <DemoButton onClick={() => handleMarkInReview(r.id)}>Marcar en revisión</DemoButton>
                  )}
                  {r.status === "in_review" && (
                    <>
                      <DemoButton variant="primary" onClick={() => handleApplyAction(r.id, "warning")}>Avisar</DemoButton>
                      <DemoButton variant="danger" onClick={() => handleApplyAction(r.id, "content_removed")}>Retirar contenido</DemoButton>
                      {isAdmin && (
                        <DemoButton variant="danger" onClick={() => handleApplyAction(r.id, "user_suspended")}>
                          Suspender (solo ADMIN)
                        </DemoButton>
                      )}
                      {isAdmin && (
                        <DemoButton variant="danger" onClick={() => handleApplyAction(r.id, "user_banned")}>
                          Banear (solo ADMIN)
                        </DemoButton>
                      )}
                      <DemoButton onClick={() => handleDismiss(r.id)}>Desestimar</DemoButton>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ConsentimientoTab({ socialConsent, onGrant, onRevoke }) {
  return (
    <div className="cp04-card" style={{ padding: 22 }}>
      <h3 style={{ margin: "0 0 10px", fontFamily: T.fontDisplay, letterSpacing: "-.03em" }}>Estado de consentimiento</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {socialConsent ? (
          <Chip tone="accent">Consentimiento otorgado (real, en memoria)</Chip>
        ) : (
          <Chip tone="danger">Sin consentimiento social</Chip>
        )}
      </div>
      <p style={{ color: T.textDim, lineHeight: 1.65, marginBottom: 14 }}>
        Este panel usa la puerta de consentimiento REAL de{" "}
        <code>community-logic</code> (documentada en{" "}
        <code>CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md</code>): sin este consentimiento
        otorgado, ni una solicitud de amistad ni un follow nuevos se pueden crear en la pestaña
        Amigos. El estado vive solo en memoria del navegador — se pierde al recargar la página, no
        hay ninguna base de datos real detrás. Activarlo con usuarios reales (y en particular con
        menores) requiere resolver antes el bloqueo legal externo del PR #24.
      </p>
      <DemoButton variant={socialConsent ? "danger" : "primary"} onClick={socialConsent ? onRevoke : onGrant}>
        {socialConsent ? "Revocar consentimiento" : "Otorgar consentimiento"}
      </DemoButton>
    </div>
  );
}

export default function ComunidadDemo({ selectedRole }) {
  const [tab, setTab] = useState("feed");
  const [player, setPlayer] = useState(DEMO_PLAYER);
  const [lastAction, setLastAction] = useState("");
  const [socialConsent, setSocialConsent] = useState(false);
  const [relationshipTick, setRelationshipTick] = useState(0);
  const [feedVersion, setFeedVersion] = useState(0);
  const [matchVersion, setMatchVersion] = useState(0);
  const [moderationVersion, setModerationVersion] = useState(0);
  const [notifVersion, setNotifVersion] = useState(0);
  const [reportedPosts, setReportedPosts] = useState({});
  const [reportedComments, setReportedComments] = useState({});
  const [activeClubId, setActiveClubId] = useState(COMMUNITY_BRIDGE_CLUB_ID);

  useEffect(() => {
    communitySeedDemoRelationships({
      actorId: ACTOR_ID,
      friendId: "amigo-1",
      pendingReceivedFrom: "amigo-2",
      followingId: "amigo-3",
      blockedId: "amigo-4",
      privateProfileId: "amigo-5",
      publicUnrelatedId: "amigo-6",
    });
    setSocialConsent(communityHasSocialConsent(ACTOR_ID));
    const visibility = communityGetProfileVisibility(ACTOR_ID);
    setPlayer((prev) => ({ ...prev, perfilVisible: visibility !== "private" }));
  }, []);

  function bumpRelationships() {
    setRelationshipTick((v) => v + 1);
  }

  function refreshFeed() {
    setFeedVersion((v) => v + 1);
  }

  function refreshMatches() {
    setMatchVersion((v) => v + 1);
  }

  function refreshModeration() {
    setModerationVersion((v) => v + 1);
  }

  function refreshNotifications() {
    setNotifVersion((v) => v + 1);
  }

  function switchClub(clubId) {
    setActiveClubId(clubId);
    setFeedVersion((v) => v + 1); // reinicia el cursor del feed
    setNotifVersion((v) => v + 1);
  }

  function togglePrivacy() {
    const current = communityGetProfileVisibility(ACTOR_ID);
    const next = current === "private" ? "friends" : "private";
    communityUpdateProfileVisibility(ACTOR_ID, next);
    setPlayer((prev) => ({ ...prev, perfilVisible: next !== "private" }));
    setLastAction(`Perfil ahora ${next === "private" ? "privado" : "visible"} (real, en memoria).`);
  }

  function handleReportPost(postId) {
    if (!communityCanReport(ACTOR_ID)) {
      setLastAction("Activa el consentimiento social para reportar contenido.");
      return;
    }
    if (reportedPosts[postId]) {
      setLastAction("Ya has reportado esta publicación.");
      return;
    }
    const result = communityReportContent(ACTOR_ID, { targetType: "post", targetId: postId, reason: "spam" });
    if (result.ok) {
      setReportedPosts((prev) => ({ ...prev, [postId]: result.reportId }));
      refreshModeration();
      setLastAction("Publicación reportada (real, en memoria del navegador).");
    } else {
      setLastAction(`Error al reportar: ${result.error}`);
    }
  }

  function handleReportComment(commentId) {
    if (!communityCanReport(ACTOR_ID)) {
      setLastAction("Activa el consentimiento social para reportar comentarios.");
      return;
    }
    if (reportedComments[commentId]) {
      setLastAction("Ya has reportado este comentario.");
      return;
    }
    const result = communityReportContent(ACTOR_ID, { targetType: "comment", targetId: commentId, reason: "harassment" });
    if (result.ok) {
      setReportedComments((prev) => ({ ...prev, [commentId]: result.reportId }));
      refreshModeration();
      setLastAction("Comentario reportado (real, en memoria del navegador).");
    } else {
      setLastAction(`Error al reportar comentario: ${result.error}`);
    }
  }

  const moderatorId = DEMO_MODERATOR_IDS[selectedRole] ?? null;

  function grantSocialConsent() {
    const result = communityGrantSocialConsent(ACTOR_ID);
    if (result.ok) { setSocialConsent(true); refreshFeed(); }
    setLastAction(result.ok ? "Consentimiento social otorgado (real, en memoria)." : `No se pudo otorgar el consentimiento: ${result.error}`);
  }

  function revokeSocialConsent() {
    const result = communityRevokeSocialConsent(ACTOR_ID);
    if (result.ok) { setSocialConsent(false); refreshFeed(); }
    setLastAction(result.ok ? "Consentimiento social revocado (real, en memoria)." : `No se pudo revocar el consentimiento: ${result.error}`);
  }

  function sendFriendRequestTo(contactId) {
    const result = communitySendFriendRequest(ACTOR_ID, contactId);
    setLastAction(result.ok ? "Solicitud de amistad enviada." : `No se pudo enviar la solicitud: ${result.error}`);
    bumpRelationships();
  }

  function acceptFriend(friendshipId) {
    const result = communityAcceptFriendRequest(friendshipId, ACTOR_ID);
    setLastAction(result.ok ? "Solicitud de amistad aceptada." : `No se pudo aceptar la solicitud: ${result.error}`);
    bumpRelationships();
  }

  function rejectFriend(friendshipId) {
    const result = communityRejectFriendRequest(friendshipId, ACTOR_ID);
    setLastAction(result.ok ? "Solicitud de amistad rechazada." : `No se pudo rechazar la solicitud: ${result.error}`);
    bumpRelationships();
  }

  function cancelFriendRequestTo(friendshipId) {
    const result = communityCancelFriendRequest(friendshipId, ACTOR_ID);
    setLastAction(result.ok ? "Solicitud de amistad cancelada." : `No se pudo cancelar la solicitud: ${result.error}`);
    bumpRelationships();
  }

  function removeFriendWith(contactId) {
    const result = communityRemoveFriend(ACTOR_ID, contactId);
    setLastAction(result.ok ? "Amistad eliminada." : `No se pudo eliminar la amistad: ${result.error}`);
    bumpRelationships();
  }

  function followContact(contactId) {
    const result = communityFollowUser(ACTOR_ID, contactId);
    setLastAction(result.ok ? "Ahora sigues a este jugador." : `No se pudo seguir: ${result.error}`);
    bumpRelationships();
  }

  function unfollowContact(contactId) {
    const result = communityUnfollowUser(ACTOR_ID, contactId);
    setLastAction(result.ok ? "Has dejado de seguir a este jugador." : `No se pudo dejar de seguir: ${result.error}`);
    bumpRelationships();
  }

  return (
    <div style={{ padding: "42px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: T.accent, fontWeight: 900, letterSpacing: ".14em", fontSize: ".72rem", textTransform: "uppercase", marginBottom: 10 }}>
          Comunidad
        </div>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: "1.9rem", letterSpacing: "-.04em", margin: "0 0 8px" }}>
          Comunidad Pádel 04 (demo)
        </h2>
        <p style={{ color: T.textDim, lineHeight: 1.65, maxWidth: 720 }}>
          Feed, perfil social, amigos/seguidores, partidos abiertos y moderación — en modo demo/mock
          interno, sin backend real.
        </p>
      </div>

      <DemoNotice />

      {DEMO_CLUBS.length > 1 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ color: T.textDim, fontSize: ".78rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
            Club activo:
          </span>
          {DEMO_CLUBS.map((club) => (
            <button
              key={club.id}
              type="button"
              onClick={() => switchClub(club.id)}
              style={{
                background: activeClubId === club.id
                  ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})`
                  : "rgba(255,255,255,.06)",
                color: activeClubId === club.id ? "#06100a" : T.textDim,
                border: `1px solid ${activeClubId === club.id ? "rgba(182,255,0,.7)" : T.line}`,
                borderRadius: 8,
                padding: "6px 12px",
                fontFamily: T.fontDisplay,
                fontWeight: 800,
                fontSize: ".78rem",
                cursor: "pointer",
              }}
            >
              {club.name}
            </button>
          ))}
          {activeClubId !== COMMUNITY_BRIDGE_CLUB_ID && (
            <span style={{ color: T.textDim, fontSize: ".74rem", fontStyle: "italic" }}>
              — feed y notificaciones completamente aisladas del Club 04
            </span>
          )}
        </div>
      )}

      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }} aria-label="Secciones de Comunidad">
        {TABS.map((t) => {
          const isNotifTab = t.id === "notificaciones";
          const unread = isNotifTab ? communityGetUnreadCount(ACTOR_ID, activeClubId) : 0;
          return (
            <button
              key={t.id}
              type="button"
              className="cp04-btn"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              style={{
                background: tab === t.id ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : "rgba(7,11,20,.72)",
                color: tab === t.id ? "#06100a" : T.textDim,
                border: `1px solid ${tab === t.id ? "rgba(182,255,0,.92)" : T.line}`,
                borderRadius: 12,
                padding: "9px 14px",
                fontFamily: T.fontDisplay,
                fontWeight: 800,
                fontSize: ".82rem",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <span aria-hidden="true" style={{ marginRight: 6 }}>{t.icon}</span>
              Ver {t.label.toLowerCase()}
              {unread > 0 && (
                <span
                  aria-label={`${unread} sin leer`}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: T.danger,
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: ".65rem",
                    fontWeight: 900,
                    minWidth: 18,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {lastAction && (
        <p role="status" aria-live="polite" style={{ color: T.textDim, fontSize: ".82rem", marginBottom: 16 }}>
          {lastAction}
        </p>
      )}

      {tab === "feed" && (
        <FeedTab
          socialConsent={socialConsent}
          viewerId={ACTOR_ID}
          feedVersion={feedVersion}
          onRefresh={refreshFeed}
          setLastAction={setLastAction}
          reportedPosts={reportedPosts}
          onReportPost={handleReportPost}
          reportedComments={reportedComments}
          onReportComment={handleReportComment}
          activeClubId={activeClubId}
        />
      )}
      {tab === "notificaciones" && (
        <NotificacionesTab
          key={`${activeClubId}-${notifVersion}`}
          viewerId={ACTOR_ID}
          notifVersion={notifVersion}
          activeClubId={activeClubId}
          onMarkAll={refreshNotifications}
        />
      )}
      {tab === "perfil" && <PerfilTab player={player} socialConsent={socialConsent} onTogglePrivacy={togglePrivacy} />}
      {tab === "amigos" && (
        <AmigosTab
          key={relationshipTick}
          contacts={DEMO_CONTACTS}
          socialConsent={socialConsent}
          followerCount={communityCountFollowers(ACTOR_ID)}
          onSendRequest={sendFriendRequestTo}
          onAccept={acceptFriend}
          onReject={rejectFriend}
          onCancel={cancelFriendRequestTo}
          onRemove={removeFriendWith}
          onFollow={followContact}
          onUnfollow={unfollowContact}
        />
      )}
      {tab === "partidos" && (
        <PartidosTab
          socialConsent={socialConsent}
          viewerId={ACTOR_ID}
          matchVersion={matchVersion}
          onRefresh={refreshMatches}
          setLastAction={setLastAction}
        />
      )}
      {tab === "moderacion" && (
        <ModeracionTab
          moderatorId={moderatorId}
          selectedRole={selectedRole}
          onRefresh={refreshModeration}
          setLastAction={setLastAction}
        />
      )}
      {tab === "consentimiento" && (
        <ConsentimientoTab socialConsent={socialConsent} onGrant={grantSocialConsent} onRevoke={revokeSocialConsent} />
      )}

      <p style={{ marginTop: 32, color: T.textDim, fontSize: ".76rem", lineHeight: 1.6, borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
        Staff demo de referencia: {DEMO_STAFF.nombre} ({DEMO_STAFF.rol}). Todos los nombres, publicaciones,
        partidos y solicitudes de esta pantalla son ficticios y se reinician al recargar — no hay
        persistencia real ni integración con Supabase, Make, Airtable, Stripe o WhatsApp.
      </p>
    </div>
  );
}

import { useState } from "react";
import { T } from "../theme.js";
import {
  COMUNIDAD_DEMO_NOTICE,
  DEMO_PLAYER,
  DEMO_STAFF,
  DEMO_FRIENDS,
  DEMO_POSTS,
  DEMO_OPEN_MATCHES,
  DEMO_MODERATION_QUEUE,
} from "../data/comunidadDemoData.js";
import {
  communityHasSocialConsent,
  communityGrantSocialConsent,
  communityRevokeSocialConsent,
  communityIsBlocked,
  communityBlockUser,
  communityUnblockUser,
} from "../utils/communityBridge.js";

// Club Pádel 04 · Comunidad (demo/mock interno)
//
// Integración SOLO visual del bloque social (Feed, Perfil, Amigos, Partidos
// abiertos, Moderación) documentado en app/docs/club-padel-04/comunidad/.
// Sin persistencia real entre sesiones (se pierde al recargar) y sin
// ninguna llamada a Supabase, Make, Airtable, Stripe ni WhatsApp.
//
// EXCEPCIÓN (Fase 1, 2026-08-13): Consentimiento y Bloqueo YA NO son
// togglés visuales — aplican las reglas reales de
// app/projects/club-padel-04/community-logic/ (ver src/utils/communityBridge.js)
// dentro de la memoria de esta pestaña del navegador. Amistad/seguidores,
// feed y moderación siguen siendo puramente visuales, sin cambios en esta
// fase.
//
// No debe usarse con menores activos ni datos reales hasta que el PR #24
// (revisión legal externa + decisión de negocio sobre menores) se resuelva.
// Ver DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md.

// Semilla del store de community-logic con los datos demo estáticos —
// deliberadamente a nivel de módulo, no dentro del componente ni en un
// useEffect: los módulos ES solo se evalúan una vez (los reimport
// posteriores reutilizan la misma instancia), así que esto corre
// exactamente una vez por carga de página, antes de que exista ningún
// render, sin violar las reglas de pureza de render de React ni necesitar
// ninguna variable de guarda. Mismo criterio de "no inventar reglas
// nuevas" que el resto del puente: solo llama a las funciones reales.
if (DEMO_PLAYER.consentimientoSocial) {
  communityGrantSocialConsent(DEMO_PLAYER.id);
}
for (const f of DEMO_FRIENDS) {
  if (f.estado === "bloqueado") {
    communityBlockUser(DEMO_PLAYER.id, f.id);
  }
}

const TABS = [
  { id: "feed", label: "Feed", icon: "📰" },
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

// isBlockedFn (Fase 1): permite reflejar en el propio Feed si el autor de
// un post ya está bloqueado (barrera 1 — deshabilita la acción antes de
// que se intente), aunque el post en sí siga siendo un dato demo estático.
function FeedTab({ posts, onReport, onBlock, isBlockedFn }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {posts.map((post) => {
        const bloqueado = isBlockedFn(post.autorId);
        return (
          <div key={post.id} className="cp04-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <strong style={{ color: T.accent }}>{post.autor}</strong>
              {bloqueado ? (
                <Chip tone="danger">Bloqueado</Chip>
              ) : post.estado === "reportado" ? (
                <Chip tone="danger">Reportado / en revisión</Chip>
              ) : (
                <Chip tone="accent">Publicado (demo)</Chip>
              )}
            </div>
            <p style={{ margin: "0 0 12px", color: T.textDim, lineHeight: 1.6 }}>{post.texto}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <DemoButton onClick={() => onReport(post.id)}>Reportar demo</DemoButton>
              <DemoButton
                onClick={() => onBlock(post.autorId, post.autor)}
                variant="danger"
                disabled={bloqueado}
              >
                {bloqueado ? "Ya bloqueado" : "Bloquear"}
              </DemoButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// `hasSocial` (Fase 1): sustituye a player.consentimientoSocial como fuente
// de este chip — misma fuente única de verdad que ConsentimientoTab, para
// no mostrar dos estados de consentimiento distintos en la misma pantalla.
function PerfilTab({ player, hasSocial, onTogglePrivacy }) {
  return (
    <div className="cp04-card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: T.fontDisplay, letterSpacing: "-.03em" }}>{player.nombre}</h3>
          <p style={{ margin: "6px 0 0", color: T.textDim }}>{player.nivel} · {player.club}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {player.perfilVisible ? <Chip tone="accent">Perfil visible (demo)</Chip> : <Chip tone="warning">Perfil privado</Chip>}
          {!hasSocial && <Chip tone="danger">Sin consentimiento social</Chip>}
        </div>
      </div>
      <p style={{ color: T.textDim, fontSize: ".85rem", lineHeight: 1.6, marginBottom: 14 }}>
        Datos íntegramente ficticios (Jugador Demo). Ningún dato real de clientes se muestra aquí.
      </p>
      <DemoButton onClick={onTogglePrivacy}>
        {player.perfilVisible ? "Hacer privado (demo)" : "Hacer visible (demo)"}
      </DemoButton>
    </div>
  );
}

// isBlockedFn/onUnblock (Fase 1): el badge "Bloqueado" y la acción de
// desbloquear ya no dependen de `f.estado` (dato demo estático) sino del
// estado real de community-logic — misma fuente única de verdad que
// FeedTab/ConsentimientoTab. `estado` sigue gobernando solicitud/amigo
// (amistad completa queda para una fase posterior).
function AmigosTab({ friends, onAccept, onReject, isBlockedFn, onUnblock }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {friends.map((f) => {
        const bloqueado = isBlockedFn(f.id);
        return (
          <div key={f.id} className="cp04-card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <strong>{f.nombre}</strong>
              {bloqueado ? (
                <Chip tone="danger">Bloqueado</Chip>
              ) : f.estado === "solicitud_pendiente" ? (
                <Chip tone="warning">Solicitud de amistad demo</Chip>
              ) : (
                <Chip tone="accent">Amigo (demo)</Chip>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {bloqueado && (
                <DemoButton onClick={() => onUnblock(f.id, f.nombre)}>Desbloquear</DemoButton>
              )}
              {!bloqueado && f.estado === "solicitud_pendiente" && (
                <>
                  <DemoButton variant="primary" onClick={() => onAccept(f.id)}>Aceptar (demo)</DemoButton>
                  <DemoButton onClick={() => onReject(f.id)}>Rechazar (demo)</DemoButton>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PartidosTab({ matches, joined, onJoin }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {matches.map((m) => (
        <div key={m.id} className="cp04-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <strong>{m.titulo}</strong>
            <Chip tone="accent">Partido abierto demo</Chip>
          </div>
          <p style={{ margin: "0 0 12px", color: T.textDim }}>{m.fecha} · {m.plazas}</p>
          <DemoButton variant="primary" disabled={joined.includes(m.id)} onClick={() => onJoin(m.id)}>
            {joined.includes(m.id) ? "Unido (demo)" : "Unirme (demo)"}
          </DemoButton>
        </div>
      ))}
    </div>
  );
}

function ModeracionTab({ queue, role, onReview }) {
  const isStaffRole = role === "STAFF" || role === "ADMIN" || role === "SUPPORT";
  return (
    <div>
      {!isStaffRole && (
        <p style={{ color: T.textDim, fontSize: ".85rem", marginBottom: 14 }}>
          En producción real esta cola sería visible solo para roles Staff/Admin. Se muestra aquí en modo
          demo para ilustrar el flujo completo.
        </p>
      )}
      <div style={{ display: "grid", gap: 12 }}>
        {queue.map((r) => (
          <div key={r.id} className="cp04-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <strong>{r.objetivo}</strong>
              <Chip tone="danger">Reportado / en revisión</Chip>
            </div>
            <p style={{ margin: "0 0 12px", color: T.textDim }}>{r.motivo}</p>
            <DemoButton onClick={() => onReview(r.id)}>Revisar moderación demo</DemoButton>
          </div>
        ))}
        {queue.length === 0 && <p style={{ color: T.textDim }}>Sin reportes pendientes (demo).</p>}
      </div>
    </div>
  );
}

// Fase 1: hasSocial ya no es un booleano de React — se lee en cada
// render directamente de community-logic vía el puente (fuente única de
// verdad, ver communityBridge.js). onGrant/onRevoke llaman a las mismas
// funciones reales que usa el resto de esta pantalla.
function ConsentimientoTab({ hasSocial, onGrant, onRevoke, error }) {
  return (
    <div className="cp04-card" style={{ padding: 22 }}>
      <h3 style={{ margin: "0 0 10px", fontFamily: T.fontDisplay, letterSpacing: "-.03em" }}>Estado de consentimiento</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {hasSocial ? (
          <Chip tone="accent">Consentimiento otorgado</Chip>
        ) : (
          <Chip tone="danger">Sin consentimiento social</Chip>
        )}
      </div>
      <p style={{ color: T.textDim, lineHeight: 1.65, marginBottom: 14 }}>
        Este estado ya aplica las reglas reales de <code>community-logic</code> (consentimiento
        real, en memoria de esta pestaña — no hay persistencia entre sesiones ni conexión a
        Supabase/Airtable todavía). Coincide con lo documentado en{" "}
        <code>CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md</code>. Activarlo con usuarios reales
        (y en particular con menores) requiere resolver antes el bloqueo legal externo del PR #24.
      </p>
      {error && <p style={{ color: T.danger, marginBottom: 14 }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <DemoButton variant="primary" disabled={hasSocial} onClick={onGrant}>Otorgar consentimiento</DemoButton>
        <DemoButton variant="danger" disabled={!hasSocial} onClick={onRevoke}>Revocar consentimiento</DemoButton>
      </div>
    </div>
  );
}

export default function ComunidadDemo({ selectedRole }) {
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [friends, setFriends] = useState(DEMO_FRIENDS);
  const [player, setPlayer] = useState(DEMO_PLAYER);
  const [joinedMatches, setJoinedMatches] = useState([]);
  const [moderationQueue, setModerationQueue] = useState(DEMO_MODERATION_QUEUE);
  const [lastAction, setLastAction] = useState("");
  const [communityError, setCommunityError] = useState("");
  // Fase 1: el estado real de consentimiento/bloqueo vive en el store de
  // community-logic (vía communityBridge.js), no en useState. Este
  // contador solo fuerza un re-render tras cada mutación real — nunca
  // duplica ni cachea el propio dato de negocio. La semilla inicial (ver
  // arriba, a nivel de módulo) ya está aplicada antes de este primer
  // render, así que no hace falta ningún efecto de arranque aquí.
  const [communityVersion, setCommunityVersion] = useState(0);
  const bumpCommunity = () => setCommunityVersion((v) => v + 1);

  function reportPost(postId) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, estado: "reportado" } : p)));
    setLastAction(`Publicación ${postId} marcada como reportada (demo, solo local).`);
  }

  // Fase 1: bloqueo real vía community-logic (doble barrera + deshace
  // amistad/seguimiento existente, ver communityBridge.js). Un error real
  // (p. ej. ya estaba bloqueado) se muestra tal cual, nunca se convierte
  // en éxito ni se silencia.
  function blockAuthor(autorId, nombre) {
    const result = communityBlockUser(DEMO_PLAYER.id, autorId);
    if (!result.ok) {
      setCommunityError(result.error);
      setLastAction("");
      return;
    }
    setCommunityError("");
    setLastAction(`${nombre} bloqueado (real, en memoria de esta sesión del navegador).`);
    bumpCommunity();
  }

  function unblockFriend(friendId, nombre) {
    const result = communityUnblockUser(DEMO_PLAYER.id, friendId);
    if (!result.ok) {
      setCommunityError(result.error);
      setLastAction("");
      return;
    }
    setCommunityError("");
    setLastAction(`${nombre} desbloqueado (real, en memoria de esta sesión del navegador).`);
    bumpCommunity();
  }

  function grantConsent() {
    const result = communityGrantSocialConsent(DEMO_PLAYER.id);
    if (!result.ok) {
      setCommunityError(result.error);
      return;
    }
    setCommunityError("");
    bumpCommunity();
  }

  function revokeConsent() {
    const result = communityRevokeSocialConsent(DEMO_PLAYER.id);
    if (!result.ok) {
      setCommunityError(result.error);
      return;
    }
    setCommunityError("");
    bumpCommunity();
  }

  function togglePrivacy() {
    setPlayer((prev) => ({ ...prev, perfilVisible: !prev.perfilVisible }));
  }

  function acceptFriend(id) {
    setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, estado: "amigo" } : f)));
  }

  function rejectFriend(id) {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  }

  function joinMatch(id) {
    setJoinedMatches((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function reviewReport(id) {
    setModerationQueue((prev) => prev.filter((r) => r.id !== id));
    setLastAction(`Reporte ${id} revisado en modo demo (solo local, sin efecto real).`);
  }

  // communityVersion se lee aquí (sin usarlo directamente) solo para que
  // React sepa que debe re-renderizar tras cada mutación real del store —
  // el valor real siempre se pide de nuevo al puente, nunca se cachea.
  void communityVersion;
  const hasSocial = communityHasSocialConsent(DEMO_PLAYER.id);
  const isBlockedByMe = (userId) => communityIsBlocked(DEMO_PLAYER.id, userId);

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

      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }} aria-label="Secciones de Comunidad">
        {TABS.map((t) => (
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
            }}
          >
            <span aria-hidden="true" style={{ marginRight: 6 }}>{t.icon}</span>
            Ver {t.label.toLowerCase()}
          </button>
        ))}
      </nav>

      {lastAction && (
        <p role="status" aria-live="polite" style={{ color: T.textDim, fontSize: ".82rem", marginBottom: 16 }}>
          {lastAction}
        </p>
      )}
      {communityError && (
        <p role="alert" style={{ color: T.danger, fontSize: ".82rem", marginBottom: 16 }}>
          {communityError}
        </p>
      )}

      {tab === "feed" && <FeedTab posts={posts} onReport={reportPost} onBlock={blockAuthor} isBlockedFn={isBlockedByMe} />}
      {tab === "perfil" && <PerfilTab player={player} hasSocial={hasSocial} onTogglePrivacy={togglePrivacy} />}
      {tab === "amigos" && (
        <AmigosTab
          friends={friends}
          onAccept={acceptFriend}
          onReject={rejectFriend}
          isBlockedFn={isBlockedByMe}
          onUnblock={unblockFriend}
        />
      )}
      {tab === "partidos" && <PartidosTab matches={DEMO_OPEN_MATCHES} joined={joinedMatches} onJoin={joinMatch} />}
      {tab === "moderacion" && <ModeracionTab queue={moderationQueue} role={selectedRole} onReview={reviewReport} />}
      {tab === "consentimiento" && (
        <ConsentimientoTab hasSocial={hasSocial} onGrant={grantConsent} onRevoke={revokeConsent} error={communityError} />
      )}

      <p style={{ marginTop: 32, color: T.textDim, fontSize: ".76rem", lineHeight: 1.6, borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
        Staff demo de referencia: {DEMO_STAFF.nombre} ({DEMO_STAFF.rol}). Todos los nombres, publicaciones,
        partidos y solicitudes de esta pantalla son ficticios y se reinician al recargar — no hay
        persistencia real ni integración con Supabase, Make, Airtable, Stripe o WhatsApp.
      </p>
    </div>
  );
}

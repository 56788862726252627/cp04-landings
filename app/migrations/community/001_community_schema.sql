-- Club Pádel 04 · Community Schema — migración 001
-- Orden: tablas base primero, luego las que tienen FK hacia ellas.
--
-- Estado: CONTRACTUAL/LOCAL — NO ejecutar contra producción.
-- Backend remoto bloqueado por configuración de entorno (ver P1_4 docs).
--
-- Convenciones:
--   - Toda tabla tenant-scoped lleva club_id (no puede ser NULL).
--   - PK: UUID generado por gen_random_uuid() o pasado desde la app.
--   - Timestamps: created_at / updated_at en UTC, NOT NULL con DEFAULT.
--   - deleted_at: soft-delete opcional donde aplique.
--   - Ninguna columna almacena datos sensibles (DOB, tokens, credenciales).

-- ---------------------------------------------------------------------------
-- EXTENSIONES
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. community_profiles — usuario social del club
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_profiles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id         TEXT        NOT NULL,
  auth_user_id    TEXT        NOT NULL,
  display_name    TEXT        NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  role            TEXT        NOT NULL DEFAULT 'PLAYER'
                              CHECK (role IN ('PLAYER', 'STAFF', 'ADMIN', 'SUPPORT')),
  deactivated_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT community_profiles_club_auth_unique UNIQUE (club_id, auth_user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_profiles_club_id ON community_profiles (club_id);
CREATE INDEX IF NOT EXISTS idx_community_profiles_auth_user ON community_profiles (auth_user_id);

-- ---------------------------------------------------------------------------
-- 2. community_player_social_profiles — perfil social y privacidad
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_player_social_profiles (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id                   TEXT        NOT NULL,
  user_profile_id           UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  level_declared            TEXT        NOT NULL DEFAULT 'intermedio',
  bio                       TEXT        NOT NULL DEFAULT '',
  avatar_url                TEXT,
  visibility_level          TEXT        NOT NULL DEFAULT 'friends'
                                        CHECK (visibility_level IN ('public', 'friends', 'private')),
  visibility_matches_played TEXT        NOT NULL DEFAULT 'private'
                                        CHECK (visibility_matches_played IN ('public', 'friends', 'private')),
  visibility_availability   TEXT        NOT NULL DEFAULT 'private'
                                        CHECK (visibility_availability IN ('public', 'friends', 'private')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT community_psp_club_user_unique UNIQUE (club_id, user_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_community_psp_club_id ON community_player_social_profiles (club_id);
CREATE INDEX IF NOT EXISTS idx_community_psp_user_profile ON community_player_social_profiles (user_profile_id);

-- ---------------------------------------------------------------------------
-- 3. community_consents — consentimientos RGPD/LOPD por usuario y tipo
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_consents (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id          TEXT        NOT NULL,
  user_profile_id  UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  consent_type     TEXT        NOT NULL,
  granted          BOOLEAN     NOT NULL,
  consent_version  TEXT        NOT NULL DEFAULT 'v1',
  granted_at       TIMESTAMPTZ,
  revoked_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Solo puede existir un consentimiento activo por usuario/tipo dentro del club.
  CONSTRAINT community_consents_club_user_type_unique UNIQUE (club_id, user_profile_id, consent_type)
);

CREATE INDEX IF NOT EXISTS idx_community_consents_club_user ON community_consents (club_id, user_profile_id);
CREATE INDEX IF NOT EXISTS idx_community_consents_type ON community_consents (consent_type);

-- ---------------------------------------------------------------------------
-- 4. community_friendships — relaciones de amistad
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_friendships (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id       TEXT        NOT NULL,
  requester_id  UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  addressee_id  UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  responded_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un par solo puede tener una solicitud activa a la vez por club.
  CONSTRAINT community_friendships_pair_unique UNIQUE (club_id, requester_id, addressee_id),
  -- El solicitante no puede ser el mismo que el destinatario.
  CONSTRAINT community_friendships_no_self CHECK (requester_id <> addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_community_friendships_club ON community_friendships (club_id);
CREATE INDEX IF NOT EXISTS idx_community_friendships_requester ON community_friendships (requester_id);
CREATE INDEX IF NOT EXISTS idx_community_friendships_addressee ON community_friendships (addressee_id);
CREATE INDEX IF NOT EXISTS idx_community_friendships_status ON community_friendships (status);

-- ---------------------------------------------------------------------------
-- 5. community_follows — relaciones de seguimiento
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_follows (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      TEXT        NOT NULL,
  follower_id  UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  followed_id  UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT community_follows_pair_unique UNIQUE (club_id, follower_id, followed_id),
  CONSTRAINT community_follows_no_self CHECK (follower_id <> followed_id)
);

CREATE INDEX IF NOT EXISTS idx_community_follows_club ON community_follows (club_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_follower ON community_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_followed ON community_follows (followed_id);

-- ---------------------------------------------------------------------------
-- 6. community_posts — publicaciones del feed
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_posts (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id              TEXT        NOT NULL,
  author_id            UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  post_type            TEXT        NOT NULL DEFAULT 'player_activity'
                                   CHECK (post_type IN ('club_announcement', 'player_activity', 'system_generated')),
  body                 TEXT        NOT NULL CHECK (char_length(body) >= 1),
  visibility           TEXT        NOT NULL DEFAULT 'friends'
                                   CHECK (visibility IN ('friends', 'club')),
  related_entity_type  TEXT,
  related_entity_id    TEXT,
  hidden_by_moderation BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_club ON community_posts (club_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts (author_id);
-- Cursor estable para feed paginado: (created_at DESC, id DESC)
CREATE INDEX IF NOT EXISTS idx_community_posts_feed_cursor ON community_posts (club_id, created_at DESC, id DESC)
  WHERE deleted_at IS NULL AND hidden_by_moderation = FALSE;

-- ---------------------------------------------------------------------------
-- 7. community_comments — comentarios en publicaciones
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     TEXT        NOT NULL,
  post_id     UUID        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  body        TEXT        NOT NULL CHECK (char_length(body) >= 1),
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_club ON community_comments (club_id);

-- ---------------------------------------------------------------------------
-- 8. community_reactions — reacciones a posts y comentarios
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_reactions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id        TEXT        NOT NULL,
  target_type    TEXT        NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id      UUID        NOT NULL,
  user_id        UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  reaction_type  TEXT        NOT NULL DEFAULT 'like',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un usuario solo puede reaccionar una vez del mismo tipo por target.
  CONSTRAINT community_reactions_unique UNIQUE (club_id, target_type, target_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_community_reactions_target ON community_reactions (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_club ON community_reactions (club_id);

-- ---------------------------------------------------------------------------
-- 9. community_open_matches — partidos abiertos
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_open_matches (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id             TEXT        NOT NULL,
  creator_id          UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  related_booking_id  TEXT,
  level_min           TEXT        NOT NULL DEFAULT 'iniciacion',
  level_max           TEXT        NOT NULL DEFAULT 'profesional',
  scheduled_at        TIMESTAMPTZ NOT NULL,
  slots_total         INTEGER     NOT NULL CHECK (slots_total BETWEEN 2 AND 8),
  slots_filled        INTEGER     NOT NULL DEFAULT 1 CHECK (slots_filled >= 0),
  status              TEXT        NOT NULL DEFAULT 'open'
                                  CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  visibility          TEXT        NOT NULL DEFAULT 'club'
                                  CHECK (visibility IN ('club', 'friends')),
  cancelled_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT community_open_matches_slots CHECK (slots_filled <= slots_total)
);

CREATE INDEX IF NOT EXISTS idx_community_open_matches_club ON community_open_matches (club_id);
CREATE INDEX IF NOT EXISTS idx_community_open_matches_creator ON community_open_matches (creator_id);
CREATE INDEX IF NOT EXISTS idx_community_open_matches_status ON community_open_matches (status);

-- ---------------------------------------------------------------------------
-- 10. community_match_invites — solicitudes de plaza en partido
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_match_invites (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id        TEXT        NOT NULL,
  open_match_id  UUID        NOT NULL REFERENCES community_open_matches(id) ON DELETE CASCADE,
  requester_id   UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  responded_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un usuario no puede tener más de una solicitud activa por partido.
  CONSTRAINT community_match_invites_unique UNIQUE (club_id, open_match_id, requester_id)
);

CREATE INDEX IF NOT EXISTS idx_community_match_invites_match ON community_match_invites (open_match_id);
CREATE INDEX IF NOT EXISTS idx_community_match_invites_requester ON community_match_invites (requester_id);

-- ---------------------------------------------------------------------------
-- 11. community_reports — reportes de contenido
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      TEXT        NOT NULL,
  reporter_id  UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  target_type  TEXT        NOT NULL CHECK (target_type IN ('user', 'post', 'comment', 'group', 'event')),
  target_id    TEXT        NOT NULL,
  reason       TEXT        NOT NULL CHECK (reason IN ('harassment', 'spam', 'inappropriate_content', 'fake_profile', 'other')),
  details      TEXT,
  status       TEXT        NOT NULL DEFAULT 'open'
                           CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_reports_club ON community_reports (club_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter ON community_reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports (status);
CREATE INDEX IF NOT EXISTS idx_community_reports_target ON community_reports (target_type, target_id);

-- ---------------------------------------------------------------------------
-- 12. community_moderation_actions — acciones de moderación
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_moderation_actions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id       TEXT        NOT NULL,
  report_id     UUID        NOT NULL REFERENCES community_reports(id) ON DELETE CASCADE,
  moderator_id  UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE RESTRICT,
  action_type   TEXT        NOT NULL
                            CHECK (action_type IN ('warning', 'content_removed', 'user_suspended', 'user_banned', 'no_action')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_moderation_actions_report ON community_moderation_actions (report_id);
CREATE INDEX IF NOT EXISTS idx_community_moderation_actions_moderator ON community_moderation_actions (moderator_id);

-- ---------------------------------------------------------------------------
-- 13. community_notifications — notificaciones persistentes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_notifications (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id           TEXT        NOT NULL,
  user_id           UUID        NOT NULL REFERENCES community_profiles(id) ON DELETE CASCADE,
  notification_type TEXT        NOT NULL,
  -- payload: datos mínimos seguros, sin datos sensibles. JSON reducido.
  payload           JSONB       NOT NULL DEFAULT '{}',
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_notifications_user ON community_notifications (club_id, user_id);
-- Cursor para unread count y paginación
CREATE INDEX IF NOT EXISTS idx_community_notifications_unread ON community_notifications (club_id, user_id, read_at)
  WHERE read_at IS NULL;

-- ---------------------------------------------------------------------------
-- 14. community_idempotency — registro de operaciones idempotentes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_idempotency (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     TEXT        NOT NULL,
  idem_key    TEXT        NOT NULL,
  -- result almacena el resultado original (JSON reducido, sin datos sensibles).
  result      JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,

  CONSTRAINT community_idempotency_club_key_unique UNIQUE (club_id, idem_key)
);

CREATE INDEX IF NOT EXISTS idx_community_idempotency_club_key ON community_idempotency (club_id, idem_key);
CREATE INDEX IF NOT EXISTS idx_community_idempotency_expires ON community_idempotency (expires_at)
  WHERE expires_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 15. community_audit_log — auditoría de acciones relevantes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_audit_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      TEXT        NOT NULL,
  actor_id     UUID        REFERENCES community_profiles(id) ON DELETE SET NULL,
  action       TEXT        NOT NULL,
  target_type  TEXT,
  target_id    TEXT,
  -- metadata: contexto mínimo para auditoría (IP omitida, sin datos de sesión).
  metadata     JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_audit_log_club ON community_audit_log (club_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_audit_log_actor ON community_audit_log (actor_id);
CREATE INDEX IF NOT EXISTS idx_community_audit_log_target ON community_audit_log (target_type, target_id);

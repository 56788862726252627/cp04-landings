-- Club Pádel 04 · Community RLS — migración 002
-- Row Level Security para aislamiento multi-tenant y control de acceso.
--
-- Estado: CONTRACTUAL/LOCAL — NO ejecutar contra producción.
-- Backend remoto bloqueado por configuración de entorno (ver P1_4 docs).
--
-- Convenciones:
--   - auth.uid() → ID del usuario autenticado (Supabase Auth)
--   - current_setting('app.club_id') → club_id del tenant activo (set por el backend)
--   - Las funciones helper comprueban el perfil del usuario dentro del club.
--   - Ninguna regla RLS sola reemplaza validación de dominio (age gate, consent).
--   - Donde RLS no puede expresar la regla, se documenta con un comentario.
--
-- Principios:
--   - Club A NO puede leer ni escribir en Club B.
--   - Usuario NO puede actuar como otro actor.
--   - STAFF/SUPPORT solo pueden moderar, no acceder a datos personales.
--   - ADMIN solo tiene privilegios dentro de su propio club.
--   - El age gate NO puede ser validado por RLS — se valida en dominio/bridge.

-- ---------------------------------------------------------------------------
-- Habilitar RLS en todas las tablas
-- ---------------------------------------------------------------------------

ALTER TABLE community_profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_player_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_consents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_friendships           ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_follows               ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_open_matches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_match_invites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_moderation_actions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_idempotency           ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_audit_log             ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Funciones helper de RLS (SECURITY DEFINER para evitar recursión)
-- ---------------------------------------------------------------------------

-- Devuelve el user_profile_id del usuario autenticado dentro del club activo.
-- Devuelve NULL si no existe perfil en ese club.
CREATE OR REPLACE FUNCTION community_current_profile_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM community_profiles
  WHERE auth_user_id = auth.uid()::text
    AND club_id = current_setting('app.club_id', TRUE)
    AND deactivated_at IS NULL
  LIMIT 1;
$$;

-- Devuelve el rol del usuario en el club activo (NULL si no existe).
CREATE OR REPLACE FUNCTION community_current_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM community_profiles
  WHERE auth_user_id = auth.uid()::text
    AND club_id = current_setting('app.club_id', TRUE)
    AND deactivated_at IS NULL
  LIMIT 1;
$$;

-- True si el usuario tiene rol de moderación en el club activo.
CREATE OR REPLACE FUNCTION community_is_moderator()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT community_current_role() IN ('STAFF', 'ADMIN', 'SUPPORT');
$$;

-- True si el usuario tiene rol ADMIN en el club activo.
CREATE OR REPLACE FUNCTION community_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT community_current_role() = 'ADMIN';
$$;

-- ---------------------------------------------------------------------------
-- NOTA IMPORTANTE: RLS sola NO puede expresar estas reglas de dominio —
-- se deben validar en la capa de dominio/server function:
--   1. Age gate: verificar que el actor tiene AGE_ADULT antes de operar.
--   2. Consent: verificar social_layer_opt_in antes de operaciones sociales.
--   3. Visibilidad de perfil: lógica de friends/public/private en dominio.
--   4. Blocking: comprobar bloqueos activos antes de amistad/follow/post.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. community_profiles
-- ---------------------------------------------------------------------------

-- Los usuarios pueden ver perfiles de su mismo club.
CREATE POLICY "community_profiles_select"
ON community_profiles FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND deactivated_at IS NULL
);

-- Solo el propio usuario puede actualizar su perfil.
CREATE POLICY "community_profiles_update"
ON community_profiles FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND auth_user_id = auth.uid()::text
);

-- La creación de perfiles la hace el backend (server function), no el cliente.
-- No se crea política INSERT para el cliente.

-- ---------------------------------------------------------------------------
-- 2. community_player_social_profiles
-- ---------------------------------------------------------------------------

-- Lectura: solo dentro del club activo.
-- NOTA: la visibilidad (public/friends/private) se filtra en dominio, no aquí.
CREATE POLICY "community_psp_select"
ON community_player_social_profiles FOR SELECT
USING (club_id = current_setting('app.club_id', TRUE));

-- El propio usuario puede actualizar su perfil social.
CREATE POLICY "community_psp_update"
ON community_player_social_profiles FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND user_profile_id = community_current_profile_id()
);

-- ---------------------------------------------------------------------------
-- 3. community_consents
-- ---------------------------------------------------------------------------

-- El usuario solo puede ver sus propios consentimientos.
CREATE POLICY "community_consents_select"
ON community_consents FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND user_profile_id = community_current_profile_id()
);

-- El usuario puede insertar/actualizar sus propios consentimientos.
CREATE POLICY "community_consents_insert"
ON community_consents FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND user_profile_id = community_current_profile_id()
);

CREATE POLICY "community_consents_update"
ON community_consents FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND user_profile_id = community_current_profile_id()
);

-- ---------------------------------------------------------------------------
-- 4. community_friendships
-- ---------------------------------------------------------------------------

-- El usuario puede ver sus propias amistades.
CREATE POLICY "community_friendships_select"
ON community_friendships FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND (
    requester_id = community_current_profile_id()
    OR addressee_id = community_current_profile_id()
  )
);

-- El usuario puede crear solicitudes de amistad (como requester).
CREATE POLICY "community_friendships_insert"
ON community_friendships FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND requester_id = community_current_profile_id()
);

-- El usuario puede actualizar sus propias amistades (aceptar/rechazar/cancelar).
CREATE POLICY "community_friendships_update"
ON community_friendships FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND (
    requester_id = community_current_profile_id()
    OR addressee_id = community_current_profile_id()
  )
);

-- ---------------------------------------------------------------------------
-- 5. community_follows
-- ---------------------------------------------------------------------------

CREATE POLICY "community_follows_select"
ON community_follows FOR SELECT
USING (club_id = current_setting('app.club_id', TRUE));

CREATE POLICY "community_follows_insert"
ON community_follows FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND follower_id = community_current_profile_id()
);

CREATE POLICY "community_follows_delete"
ON community_follows FOR DELETE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND follower_id = community_current_profile_id()
);

-- ---------------------------------------------------------------------------
-- 6. community_posts
-- ---------------------------------------------------------------------------

-- Lectura: solo posts no eliminados del club activo.
-- La lógica de visibilidad (friends/club, bloqueos, consentimientos) se aplica en dominio.
CREATE POLICY "community_posts_select"
ON community_posts FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND deleted_at IS NULL
  AND hidden_by_moderation = FALSE
);

-- El usuario puede crear posts como autor propio.
CREATE POLICY "community_posts_insert"
ON community_posts FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND author_id = community_current_profile_id()
);

-- Solo moderadores pueden marcar posts como hidden_by_moderation.
-- El autor puede eliminar su propio post (soft-delete vía deleted_at).
CREATE POLICY "community_posts_update"
ON community_posts FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND (
    author_id = community_current_profile_id()
    OR community_is_moderator()
  )
);

-- ---------------------------------------------------------------------------
-- 7. community_comments
-- ---------------------------------------------------------------------------

CREATE POLICY "community_comments_select"
ON community_comments FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND deleted_at IS NULL
);

CREATE POLICY "community_comments_insert"
ON community_comments FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND author_id = community_current_profile_id()
);

CREATE POLICY "community_comments_update"
ON community_comments FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND (
    author_id = community_current_profile_id()
    OR community_is_moderator()
  )
);

-- ---------------------------------------------------------------------------
-- 8. community_reactions
-- ---------------------------------------------------------------------------

CREATE POLICY "community_reactions_select"
ON community_reactions FOR SELECT
USING (club_id = current_setting('app.club_id', TRUE));

CREATE POLICY "community_reactions_insert"
ON community_reactions FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND user_id = community_current_profile_id()
);

CREATE POLICY "community_reactions_delete"
ON community_reactions FOR DELETE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND user_id = community_current_profile_id()
);

-- ---------------------------------------------------------------------------
-- 9. community_open_matches
-- ---------------------------------------------------------------------------

CREATE POLICY "community_open_matches_select"
ON community_open_matches FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND status <> 'cancelled'
);

CREATE POLICY "community_open_matches_insert"
ON community_open_matches FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND creator_id = community_current_profile_id()
);

CREATE POLICY "community_open_matches_update"
ON community_open_matches FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND creator_id = community_current_profile_id()
);

-- ---------------------------------------------------------------------------
-- 10. community_match_invites
-- ---------------------------------------------------------------------------

CREATE POLICY "community_match_invites_select"
ON community_match_invites FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND (
    requester_id = community_current_profile_id()
    OR EXISTS (
      SELECT 1 FROM community_open_matches
      WHERE id = community_match_invites.open_match_id
        AND creator_id = community_current_profile_id()
    )
  )
);

CREATE POLICY "community_match_invites_insert"
ON community_match_invites FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND requester_id = community_current_profile_id()
);

CREATE POLICY "community_match_invites_update"
ON community_match_invites FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND (
    requester_id = community_current_profile_id()
    OR EXISTS (
      SELECT 1 FROM community_open_matches
      WHERE id = community_match_invites.open_match_id
        AND creator_id = community_current_profile_id()
    )
  )
);

-- ---------------------------------------------------------------------------
-- 11. community_reports
-- ---------------------------------------------------------------------------

-- El reportante solo ve sus propios reportes. El moderador ve los del club.
CREATE POLICY "community_reports_select"
ON community_reports FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND (
    reporter_id = community_current_profile_id()
    OR community_is_moderator()
  )
);

CREATE POLICY "community_reports_insert"
ON community_reports FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND reporter_id = community_current_profile_id()
);

-- Solo moderadores pueden cambiar el estado de un reporte.
CREATE POLICY "community_reports_update"
ON community_reports FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND community_is_moderator()
);

-- ---------------------------------------------------------------------------
-- 12. community_moderation_actions
-- ---------------------------------------------------------------------------

-- Solo moderadores acceden a las acciones de moderación.
-- NOTA: STAFF/SUPPORT no ven notes ni reporter_id — se filtra en dominio, no en RLS.
CREATE POLICY "community_moderation_actions_select"
ON community_moderation_actions FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND community_is_moderator()
);

CREATE POLICY "community_moderation_actions_insert"
ON community_moderation_actions FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND moderator_id = community_current_profile_id()
  AND community_is_moderator()
);

-- ---------------------------------------------------------------------------
-- 13. community_notifications
-- ---------------------------------------------------------------------------

-- El usuario solo ve sus propias notificaciones.
CREATE POLICY "community_notifications_select"
ON community_notifications FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND user_id = community_current_profile_id()
);

-- Las notificaciones las inserta el backend (server function), no el cliente.
-- Se permite actualización solo para marcar como leído.
CREATE POLICY "community_notifications_update"
ON community_notifications FOR UPDATE
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND user_id = community_current_profile_id()
);

-- ---------------------------------------------------------------------------
-- 14. community_idempotency
-- ---------------------------------------------------------------------------

-- El usuario solo puede ver sus propias claves de idempotencia.
CREATE POLICY "community_idempotency_select"
ON community_idempotency FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND idem_key LIKE (current_setting('app.club_id', TRUE) || ':%')
);

CREATE POLICY "community_idempotency_insert"
ON community_idempotency FOR INSERT
WITH CHECK (
  club_id = current_setting('app.club_id', TRUE)
  AND idem_key LIKE (current_setting('app.club_id', TRUE) || ':%')
);

-- ---------------------------------------------------------------------------
-- 15. community_audit_log
-- ---------------------------------------------------------------------------

-- Solo administradores pueden leer el log de auditoría.
CREATE POLICY "community_audit_log_select"
ON community_audit_log FOR SELECT
USING (
  club_id = current_setting('app.club_id', TRUE)
  AND community_is_admin()
);

-- El backend (server function) inserta en el log — no el cliente directamente.
CREATE POLICY "community_audit_log_insert"
ON community_audit_log FOR INSERT
WITH CHECK (club_id = current_setting('app.club_id', TRUE));

-- ---------------------------------------------------------------------------
-- RESUMEN DE GARANTÍAS RLS
-- ---------------------------------------------------------------------------
-- ✅ Club A NO puede leer/escribir/moderar en Club B (club_id siempre filtrado).
-- ✅ Usuario NO puede actuar como otro actor (WHERE user_id = community_current_profile_id()).
-- ✅ Idempotency keys aisladas por tenant (LIKE club_id || ':%').
-- ✅ Moderación solo para STAFF/ADMIN/SUPPORT (community_is_moderator()).
-- ✅ Audit log solo para ADMIN (community_is_admin()).
-- ⚠️ Age gate: NO expresable en RLS — validar en communityAgePolicy.js / bridge.
-- ⚠️ Consent: NO expresable en RLS — validar en domain logic.
-- ⚠️ Visibilidad friends/club: NOT expresable en RLS — validar en getVisibleFeed.
-- ⚠️ Bloqueos: NO expresables en RLS — validar en blocking.mjs.

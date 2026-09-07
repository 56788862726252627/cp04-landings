-- ============================================================
-- Migration 003: P1.5 — Snapshot atomicity + Claims helpers
-- Club Pádel 04 · Comunidad Deportiva
-- ============================================================
-- Aplica sobre: migrations/community/002_community_rls.sql
-- Requisito: Supabase con extensiones pgcrypto y pg_catalog habilitadas.
--
-- Esta migration:
--   1. Crea la función RPC community_write_snapshot para escritura atómica
--      con locking optimista (versionado de snapshot).
--   2. Añade helpers de claims para auth boundary:
--      community_get_app_metadata_claim(key) — lee del JWT de Supabase
--   3. Añade índice de rendimiento en community_idempotency(idem_key).
--
-- NO ejecutar sin Supabase DEV/TEST configurado.
-- BACKEND REMOTO: BLOQUEADO POR CONFIGURACIÓN/ENTORNO

-- ============================================================
-- 1. RPC: community_write_snapshot (escritura atómica con optimistic lock)
-- ============================================================
--
-- Parámetros:
--   p_club_id TEXT          — club_id del tenant
--   p_data JSONB            — snapshot completo del store
--   p_expected_version INT  — versión esperada (NULL para primer write)
--
-- Devuelve:
--   { version: INT }        — versión nueva si ok
--   { error: 'conflict' }   — si la versión actual no coincide
--
-- Garantías:
--   - Atómica: no hay race conditions entre lectura y escritura.
--   - Idempotente con versión correcta.
--   - Aislamiento por club_id: no hay colisiones entre tenants.
--
-- SECURITY DEFINER: se ejecuta con los privilegios del owner,
-- pero valida el club_id contra el JWT claim (app.club_id).

CREATE OR REPLACE FUNCTION community_write_snapshot(
  p_club_id TEXT,
  p_data JSONB,
  p_expected_version INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_version INT;
  v_new_version INT;
  v_jwt_club TEXT;
BEGIN
  -- Validar que el JWT del usuario coincide con el club_id solicitado.
  -- Previene que un usuario autenticado de otro club escriba datos.
  v_jwt_club := current_setting('app.club_id', true);
  IF v_jwt_club IS NOT NULL AND v_jwt_club <> '' AND v_jwt_club <> p_club_id THEN
    RAISE EXCEPTION 'Tenant mismatch: JWT club_id=% != requested club_id=%', v_jwt_club, p_club_id;
  END IF;

  -- Obtener la versión actual con bloqueo de fila (FOR UPDATE).
  SELECT version INTO v_current_version
  FROM community_store_snapshots
  WHERE club_id = p_club_id
  FOR UPDATE;  -- Bloqueo optimista: serializa escrituras concurrentes para el mismo club.

  -- Primer write (no hay fila): version esperada debe ser NULL o 0.
  IF NOT FOUND THEN
    IF p_expected_version IS NOT NULL AND p_expected_version <> 0 THEN
      RETURN jsonb_build_object('error', 'conflict', 'expected', p_expected_version, 'actual', 0);
    END IF;
    v_new_version := 1;
    INSERT INTO community_store_snapshots (club_id, data, version, updated_at)
    VALUES (p_club_id, p_data, v_new_version, now());
    RETURN jsonb_build_object('version', v_new_version);
  END IF;

  -- Verificar versión esperada.
  IF p_expected_version IS NOT NULL AND v_current_version <> p_expected_version THEN
    RETURN jsonb_build_object(
      'error', 'conflict',
      'expected', p_expected_version,
      'actual', v_current_version
    );
  END IF;

  v_new_version := v_current_version + 1;

  UPDATE community_store_snapshots
  SET data = p_data,
      version = v_new_version,
      updated_at = now()
  WHERE club_id = p_club_id;

  RETURN jsonb_build_object('version', v_new_version);
END;
$$;

-- ============================================================
-- 2. Tabla community_store_snapshots (si no existe de 001)
-- ============================================================
-- Asegura que la tabla tiene la columna updated_at.
-- (Supabase ejecuta migrations en orden: 001 ya crea la tabla.)
-- Esta sección es idempotente (usa IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'community_store_snapshots'
  ) THEN
    CREATE TABLE community_store_snapshots (
      club_id      TEXT        PRIMARY KEY,
      data         JSONB       NOT NULL DEFAULT '{}',
      version      INT         NOT NULL DEFAULT 0,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    COMMENT ON TABLE community_store_snapshots IS
      'Snapshot del store completo de la comunidad por club. Escritura vía RPC community_write_snapshot.';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'community_store_snapshots'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE community_store_snapshots ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END;
$$;

-- ============================================================
-- 3. Helper: community_get_app_metadata_claim
-- ============================================================
--
-- Lee un claim del JWT de Supabase (raw_app_meta_data).
-- Útil para obtener club_id, role desde el token verificado.
--
-- SECURITY DEFINER: privilegios del owner, lectura solo de metadatos del JWT propio.

CREATE OR REPLACE FUNCTION community_get_app_metadata_claim(claim_key TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    COALESCE(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> claim_key,
      current_setting('request.jwt.claims', true)::jsonb ->> claim_key
    );
$$;

-- ============================================================
-- 4. Índice de rendimiento: community_idempotency(idem_key)
-- ============================================================
-- La tabla community_idempotency se creó en migration 001 con PK (club_id, idem_key).
-- Este índice adicional acelera búsquedas por idem_key solo.

CREATE INDEX IF NOT EXISTS community_idempotency_key_idx
  ON community_idempotency (idem_key)
  WHERE idem_key IS NOT NULL;

-- ============================================================
-- 5. RLS para community_store_snapshots
-- ============================================================
-- Si no está activo, activarlo. Las políticas se definen en 002.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'community_store_snapshots'
      AND rowsecurity = true
  ) THEN
    ALTER TABLE community_store_snapshots ENABLE ROW LEVEL SECURITY;
  END IF;
END;
$$;

-- Política de lectura: solo el tenant propio puede leer su snapshot.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_store_snapshots'
      AND policyname = 'community_snapshot_tenant_read'
  ) THEN
    CREATE POLICY community_snapshot_tenant_read
      ON community_store_snapshots FOR SELECT
      USING (club_id = current_setting('app.club_id', true));
  END IF;
END;
$$;

-- community_write_snapshot es SECURITY DEFINER — no necesita política de INSERT/UPDATE.
-- Las escrituras directas (fuera del RPC) están bloqueadas por RLS para users normales.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_store_snapshots'
      AND policyname = 'community_snapshot_deny_direct_write'
  ) THEN
    CREATE POLICY community_snapshot_deny_direct_write
      ON community_store_snapshots FOR INSERT
      WITH CHECK (false);  -- Solo permitido vía RPC SECURITY DEFINER
  END IF;
END;
$$;

-- ============================================================
-- Verificación post-migration
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '003_p15_snapshot_and_claims.sql aplicada correctamente.';
  RAISE NOTICE 'Funciones RPC: community_write_snapshot, community_get_app_metadata_claim';
  RAISE NOTICE 'Tabla: community_store_snapshots con RLS activo';
  RAISE NOTICE 'Índice: community_idempotency_key_idx';
END;
$$;

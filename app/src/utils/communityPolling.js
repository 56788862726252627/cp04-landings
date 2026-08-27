// Club Pádel 04 · CommunityPoller — polling controlado para Comunidad.
//
// Usado como alternativa a Realtime cuando el stack no soporta WebSocket.
// Realtime con Supabase sería la opción 1; este poller es la opción 2.
//
// Garantías:
//   - backoff exponencial en errores (hasta maxIntervalMs)
//   - reset de intervalo al primer tick exitoso
//   - cleanup explícito: stop() / destroy()
//   - sin timers duplicados — idempotente en start()
//   - switching de club cancela el tick anterior via destroy()
//   - age gate externo: el caller decide si iniciar o no (el poller no sabe de edad)
//   - no hay estado cross-tenant: cada instancia es un poller independiente

/**
 * Crea un poller controlado para actualizaciones de comunidad.
 *
 * @param {object} options
 * @param {function} options.onTick — función async llamada en cada tick
 * @param {number}  [options.intervalMs=15000] — intervalo base en ms
 * @param {number}  [options.maxIntervalMs=120000] — techo de backoff
 * @param {number}  [options.backoffFactor=2] — factor de backoff exponencial
 * @param {function} [options.onError] — callback (err, errorCount) en error de tick
 */
export function createCommunityPoller({
  onTick,
  intervalMs = 15000,
  maxIntervalMs = 120000,
  backoffFactor = 2,
  onError = null,
} = {}) {
  if (typeof onTick !== "function") {
    throw new Error("createCommunityPoller: onTick es requerido y debe ser función");
  }
  if (intervalMs <= 0) throw new Error("createCommunityPoller: intervalMs debe ser > 0");
  if (maxIntervalMs < intervalMs) throw new Error("createCommunityPoller: maxIntervalMs debe ser >= intervalMs");

  let _timerId = null;
  let _running = false;
  let _destroyed = false;
  let _currentInterval = intervalMs;
  let _tickCount = 0;
  let _errorCount = 0;
  let _tickInProgress = false;

  async function _executeTick() {
    if (_destroyed || !_running) return;
    if (_tickInProgress) return; // evitar solapamiento
    _tickInProgress = true;
    _tickCount++;

    try {
      await onTick();
      _currentInterval = intervalMs; // reset backoff en éxito
      _errorCount = 0;
    } catch (err) {
      _errorCount++;
      _currentInterval = Math.min(_currentInterval * backoffFactor, maxIntervalMs);
      if (typeof onError === "function") {
        try { onError(err, _errorCount); } catch { /* ignorar errores en onError */ }
      }
    } finally {
      _tickInProgress = false;
    }

    if (_running && !_destroyed) {
      _timerId = setTimeout(_executeTick, _currentInterval);
    }
  }

  return {
    /**
     * Inicia el poller. Idempotente — llamar dos veces no crea dos timers.
     * Lanza si el poller ya fue destruido.
     */
    start() {
      if (_destroyed) throw new Error("Poller destruido — crear una nueva instancia");
      if (_running) return; // ya corriendo, no hacer nada
      _running = true;
      _timerId = setTimeout(_executeTick, _currentInterval);
    },

    /**
     * Para el poller. El poller puede reiniciarse con start().
     * Si hay un tick en progreso, lo deja terminar pero no encola el siguiente.
     */
    stop() {
      _running = false;
      if (_timerId !== null) {
        clearTimeout(_timerId);
        _timerId = null;
      }
    },

    /**
     * Destruye el poller permanentemente. Llamar start() después lanza.
     * Usar al cambiar de club o al desmontar el componente.
     */
    destroy() {
      this.stop();
      _destroyed = true;
    },

    /** True si el poller está corriendo (entre ticks o esperando el siguiente). */
    isRunning() { return _running; },

    /** Número total de ticks ejecutados (incluyendo fallidos). */
    getTickCount() { return _tickCount; },

    /** Número de errores consecutivos actuales (reset en éxito). */
    getErrorCount() { return _errorCount; },

    /** Intervalo actual en ms (puede ser mayor al base si hay backoff activo). */
    getCurrentInterval() { return _currentInterval; },

    /** True si el poller fue destruido permanentemente. */
    isDestroyed() { return _destroyed; },
  };
}

/**
 * createClubAwarePoller — wrapper que gestiona el ciclo de vida del poller
 * al cambiar de club. Garantiza que el poller anterior se destruye antes
 * de crear uno nuevo para el club entrante.
 *
 * Uso típico:
 *   const mgr = createClubAwarePollerManager({ onTick: fetchUpdates });
 *   mgr.switchToClub("club-a");
 *   // ... más tarde, al cambiar de club:
 *   mgr.switchToClub("club-b"); // destruye el poller de club-a automáticamente
 *   mgr.stop(); // destruye el poller activo sin arrancar otro
 */
export function createClubAwarePollerManager({ onTick, ...pollerOptions } = {}) {
  if (typeof onTick !== "function") {
    throw new Error("createClubAwarePollerManager: onTick es requerido");
  }

  let _activePoller = null;
  let _activeClubId = null;

  return {
    /** Activa el polling para el club indicado, destruyendo el anterior si lo hay. */
    switchToClub(clubId) {
      if (!clubId) throw new Error("switchToClub: clubId es requerido");
      if (_activeClubId === clubId && _activePoller?.isRunning()) return; // ya activo

      if (_activePoller) {
        _activePoller.destroy();
        _activePoller = null;
      }

      _activeClubId = clubId;
      _activePoller = createCommunityPoller({
        onTick: () => onTick(clubId),
        ...pollerOptions,
      });
      _activePoller.start();
    },

    /** Para el poller activo sin destruirlo (permite restart con switchToClub). */
    stop() {
      if (_activePoller) {
        _activePoller.destroy();
        _activePoller = null;
        _activeClubId = null;
      }
    },

    getActiveClubId() { return _activeClubId; },
    getActivePoller() { return _activePoller; },
  };
}

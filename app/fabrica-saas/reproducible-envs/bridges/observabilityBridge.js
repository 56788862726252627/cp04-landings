// Observability Bridge — ADV-15 → ADV-01

export const ENV_OBS_EVENT = Object.freeze({
  ENVIRONMENT_VALIDATED:    'environment.validated',
  CONTAINER_BUILD_STARTED:  'container.build.started',
  CONTAINER_BUILD_COMPLETED: 'container.build.completed',
  CONTAINER_BUILD_FAILED:   'container.build.failed',
  CONTAINER_STARTED:        'container.started',
  HEALTH_CHANGED:           'container.health.changed',
  CONTAINER_STOPPED:        'container.stopped',
  FALLBACK_ACTIVATED:       'environment.fallback.activated',
});

export function emitEnvironmentEvent(event, payload = {}) {
  if (!ENV_OBS_EVENT[event.replace(/\./g, '_').toUpperCase()] && !Object.values(ENV_OBS_EVENT).includes(event)) {
    throw new Error(`emitEnvironmentEvent: unknown event '${event}'`);
  }

  return Object.freeze({
    adv01Bridge: 'OBSERVABILITY_LAYER_CONNECTED',
    event,
    payload:     Object.freeze({ ...payload, isReal: false }),
    timestamp:   new Date().toISOString(),
    noRealEmit:  true,
    isReal:      false,
  });
}

export const OBSERVABILITY_BRIDGE_VERSION = '1.0.0';

// MCP Server Health — ADV-12

export const HEALTH_STATUS = Object.freeze({
  HEALTHY:     'HEALTHY',
  DEGRADED:    'DEGRADED',
  UNAVAILABLE: 'UNAVAILABLE',
  UNKNOWN:     'UNKNOWN',
});

export function evaluateMCPHealth(server, metrics = {}) {
  if (!server) return Object.freeze({ status: HEALTH_STATUS.UNKNOWN, isReal: false });

  const { latencyMs = 0, successCount = 0, failureCount = 0 } = metrics;
  const total = successCount + failureCount;
  const rate  = total > 0 ? failureCount / total : 0;

  let status;
  if (server.status === 'DISABLED' || server.status === 'BLOCKED') {
    status = HEALTH_STATUS.UNAVAILABLE;
  } else if (rate > 0.5 || latencyMs > 10000) {
    status = HEALTH_STATUS.UNAVAILABLE;
  } else if (rate > 0.1 || latencyMs > 3000) {
    status = HEALTH_STATUS.DEGRADED;
  } else {
    status = HEALTH_STATUS.HEALTHY;
  }

  return Object.freeze({
    status,
    serverId:    server.id,
    errorRate:   rate,
    latencyMs,
    successCount,
    failureCount,
    isReal: false,
  });
}

export const MCP_SERVER_HEALTH_VERSION = '1.0.0';

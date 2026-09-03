// Backup Bridge — ADV-20 (consumes ADV-18 health bridge)

export function createHealthBackupBridge(config = {}) {
  const { clientId = null } = config;

  function evaluate(backupSignal) {
    if (!backupSignal) return Object.freeze({ healthy: false, reason: 'NO_SIGNAL', isReal: false });
    return Object.freeze({
      healthy: backupSignal.status === 'HEALTHY',
      status: backupSignal.status,
      score: backupSignal.score,
      dimension: backupSignal.dimension,
      adv18Consumed: true,
      isReal: false,
    });
  }

  return Object.freeze({ clientId, evaluate, adv18Connected: true, isReal: false });
}

export const HEALTH_BACKUP_BRIDGE_VERSION = '1.0.0';

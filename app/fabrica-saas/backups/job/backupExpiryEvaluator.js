// Backup Expiry Evaluator — ADV-18

export const EXPIRY_STATE = Object.freeze({
  ACTIVE:   'ACTIVE',
  EXPIRING: 'EXPIRING',
  EXPIRED:  'EXPIRED',
  HOLD:     'HOLD',
});

const EXPIRING_THRESHOLD_DAYS = 7;

export function createBackupExpiryEvaluator() {
  return Object.freeze({
    evaluate(config = {}) {
      const {
        createdAt      = new Date().toISOString(),
        retentionDays  = 30,
        legalHold      = false,
        referenceDate  = new Date().toISOString(),
      } = config;

      if (legalHold) {
        return Object.freeze({ state: EXPIRY_STATE.HOLD, daysRemaining: Infinity, isReal: false });
      }

      if (retentionDays === Infinity) {
        return Object.freeze({ state: EXPIRY_STATE.HOLD, daysRemaining: Infinity, isReal: false });
      }

      const created  = new Date(createdAt).getTime();
      const now      = new Date(referenceDate).getTime();
      const expireAt = created + retentionDays * 86400000;
      const daysRemaining = Math.ceil((expireAt - now) / 86400000);

      let state;
      if (daysRemaining <= 0)                      state = EXPIRY_STATE.EXPIRED;
      else if (daysRemaining <= EXPIRING_THRESHOLD_DAYS) state = EXPIRY_STATE.EXPIRING;
      else                                          state = EXPIRY_STATE.ACTIVE;

      return Object.freeze({ state, daysRemaining: Math.max(0, daysRemaining), isReal: false });
    },

    isReal: false,
  });
}

export const BACKUP_EXPIRY_EVALUATOR_VERSION = '1.0.0';

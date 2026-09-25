// Health Business Impact — ADV-20 (impact assessment, no real revenue data)

export const BUSINESS_IMPACT_LEVEL = Object.freeze({
  NONE:     'NONE',
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export function createHealthBusinessImpact(config = {}) {
  const {
    affectedUsers   = 0,
    revenueAtRisk   = false,
    bookingBlocked  = false,
    dataAtRisk      = false,
    slaBreached     = false,
    complianceRisk  = false,
  } = config;

  let level = BUSINESS_IMPACT_LEVEL.NONE;

  if (complianceRisk || dataAtRisk) {
    level = BUSINESS_IMPACT_LEVEL.CRITICAL;
  } else if (bookingBlocked || slaBreached) {
    level = BUSINESS_IMPACT_LEVEL.HIGH;
  } else if (revenueAtRisk || affectedUsers > 10) {
    level = BUSINESS_IMPACT_LEVEL.MEDIUM;
  } else if (affectedUsers > 0) {
    level = BUSINESS_IMPACT_LEVEL.LOW;
  }

  const impactReasons = [];
  if (complianceRisk) impactReasons.push('COMPLIANCE_RISK');
  if (dataAtRisk)     impactReasons.push('DATA_AT_RISK');
  if (bookingBlocked) impactReasons.push('BOOKING_BLOCKED');
  if (slaBreached)    impactReasons.push('SLA_BREACHED');
  if (revenueAtRisk)  impactReasons.push('REVENUE_AT_RISK');

  return Object.freeze({
    level,
    affectedUsers,
    impactReasons: Object.freeze(impactReasons),
    requiresEscalation: level === BUSINESS_IMPACT_LEVEL.CRITICAL || level === BUSINESS_IMPACT_LEVEL.HIGH,
    noRealRevenueData: true,
    isReal: false,
  });
}

export const HEALTH_BUSINESS_IMPACT_VERSION = '1.0.0';

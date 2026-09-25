// Service Fact Evaluator — ADV-10b

export const SERVICE_GROUNDING_STATUS = Object.freeze({
  VERIFIED:    'VERIFIED',
  NOT_OFFERED: 'NOT_OFFERED',
  FABRICATED:  'FABRICATED',
  UNKNOWN:     'UNKNOWN',
  MISMATCH:    'MISMATCH',
});

export function evaluateServiceFact(serviceClaim = {}, serviceFacts = []) {
  const { name: claimedName, detail: claimedDetail } = serviceClaim;

  if (!claimedName) {
    return Object.freeze({ status: SERVICE_GROUNDING_STATUS.UNKNOWN, isCritical: false, isReal: false });
  }

  const normalizedClaim = claimedName.trim().toLowerCase();

  if (serviceFacts.length === 0) {
    return Object.freeze({
      status:     SERVICE_GROUNDING_STATUS.FABRICATED,
      serviceName: claimedName,
      note:       'No authorized service catalog available — service claim is fabricated',
      isCritical: true,
      isReal:     false,
    });
  }

  const matchingService = serviceFacts.find(f => {
    const normalized = (f.value?.name ?? f.key ?? '').trim().toLowerCase();
    return normalized === normalizedClaim || normalized.includes(normalizedClaim) || normalizedClaim.includes(normalized);
  });

  if (!matchingService) {
    return Object.freeze({
      status:     SERVICE_GROUNDING_STATUS.NOT_OFFERED,
      serviceName: claimedName,
      note:       `Service "${claimedName}" is not in the authorized service catalog`,
      isCritical: true,
      isReal:     false,
    });
  }

  if (claimedDetail && matchingService.value?.detail) {
    const authorizedDetail = matchingService.value.detail;
    if (claimedDetail !== authorizedDetail) {
      return Object.freeze({
        status:          SERVICE_GROUNDING_STATUS.MISMATCH,
        serviceName:     claimedName,
        claimedDetail,
        authorizedDetail,
        note:            `Service detail mismatch for "${claimedName}"`,
        isCritical:      true,
        isReal:          false,
      });
    }
  }

  return Object.freeze({
    status:      SERVICE_GROUNDING_STATUS.VERIFIED,
    serviceName: claimedName,
    source:      matchingService.source,
    isCritical:  false,
    isReal:      false,
  });
}

export function evaluateServiceList(agentList = [], authorizedList = []) {
  const results = agentList.map(svc => evaluateServiceFact(
    typeof svc === 'string' ? { name: svc } : svc,
    authorizedList,
  ));
  const fabricated = results.filter(r => r.status === SERVICE_GROUNDING_STATUS.FABRICATED);
  const notOffered = results.filter(r => r.status === SERVICE_GROUNDING_STATUS.NOT_OFFERED);
  const verified   = results.filter(r => r.status === SERVICE_GROUNDING_STATUS.VERIFIED);

  return Object.freeze({
    results:    Object.freeze(results),
    fabricated: Object.freeze(fabricated),
    notOffered: Object.freeze(notOffered),
    verified:   Object.freeze(verified),
    isCritical: fabricated.length > 0 || notOffered.length > 0,
    isReal:     false,
  });
}

export const SERVICE_FACT_EVALUATOR_VERSION = '1.0.0';

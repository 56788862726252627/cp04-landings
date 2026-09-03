// Runtime Health Adapter — ADV-20 (connects ADV-15)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createRuntimeHealthAdapter(config = {}) {
  const {
    runtimeCompatible  = true,
    lockfilePresent    = false,
    dockerReady        = false,
    healthEndpointPass = false,
    artifactValid      = true,
    securityPolicyPass = true,
    clientId           = null,
    environment        = 'LOCAL',
  } = config;

  const criticalFail = !runtimeCompatible || !securityPolicyPass || !artifactValid;

  let status, score;
  if (criticalFail) {
    status = HEALTH_STATUS.CRITICAL;
    score = !runtimeCompatible ? 0 : !securityPolicyPass ? 10 : 20;
  } else if (!lockfilePresent) {
    status = HEALTH_STATUS.WARNING;
    score = 60;
  } else if (!healthEndpointPass) {
    status = HEALTH_STATUS.DEGRADED;
    score = 70;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = dockerReady ? 100 : 90;
  }

  const evidence = [];
  if (!lockfilePresent)    evidence.push('NO_LOCKFILE');
  if (!securityPolicyPass) evidence.push('SECURITY_POLICY_FAILED');
  if (!runtimeCompatible)  evidence.push('RUNTIME_INCOMPATIBLE');

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.RUNTIME,
    status,
    score,
    source: 'ADV-15',
    clientId,
    environment,
    message: !runtimeCompatible ? 'Runtime incompatibility detected' : `Runtime health ${score}`,
    evidence,
    recommendedAction: !lockfilePresent ? 'Add dependency lockfile' :
      !healthEndpointPass ? 'Fix health endpoint' : null,
  });

  return Object.freeze({
    runtimeCompatible,
    lockfilePresent,
    dockerReady,
    healthEndpointPass,
    artifactValid,
    securityPolicyPass,
    status,
    score,
    signal,
    adv15Connected: true,
    isReal: false,
  });
}

export const RUNTIME_HEALTH_ADAPTER_VERSION = '1.0.0';

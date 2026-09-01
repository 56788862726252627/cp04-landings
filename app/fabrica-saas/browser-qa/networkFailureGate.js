// Network Failure Gate — ADV-06
// Detects and classifies network failures during browser QA.

export const NETWORK_FAILURE_TYPE = Object.freeze({
  RESOURCE_404:    'RESOURCE_404',
  API_ERROR:       'API_ERROR',
  TIMEOUT:         'TIMEOUT',
  CORS_BLOCK:      'CORS_BLOCK',
  DNS_FAIL:        'DNS_FAIL',
  SSL_ERROR:       'SSL_ERROR',
  ABORT:           'ABORT',
  UNKNOWN:         'UNKNOWN',
});

export const NETWORK_GATE_STATUS = Object.freeze({
  PASS:  'PASS',
  WARN:  'WARN',
  FAIL:  'FAIL',
});

export const RESOURCE_TYPE = Object.freeze({
  SCRIPT:     'script',
  STYLESHEET: 'stylesheet',
  IMAGE:      'image',
  FONT:       'font',
  XHR:        'xhr',
  FETCH:      'fetch',
  DOCUMENT:   'document',
  OTHER:      'other',
});

export function classifyNetworkFailure(request = {}) {
  const { status = 0, url = '', errorText = '' } = request;
  if (errorText.includes('net::ERR_NAME_NOT_RESOLVED')) return NETWORK_FAILURE_TYPE.DNS_FAIL;
  if (errorText.includes('net::ERR_CONNECTION_TIMED_OUT')) return NETWORK_FAILURE_TYPE.TIMEOUT;
  if (errorText.includes('net::ERR_ABORTED'))              return NETWORK_FAILURE_TYPE.ABORT;
  if (errorText.includes('SSL') || errorText.includes('CERT')) return NETWORK_FAILURE_TYPE.SSL_ERROR;
  if (status === 404) return NETWORK_FAILURE_TYPE.RESOURCE_404;
  if (status >= 400 && status < 500) return NETWORK_FAILURE_TYPE.API_ERROR;
  if (url.includes('cors') || errorText.includes('CORS')) return NETWORK_FAILURE_TYPE.CORS_BLOCK;
  return NETWORK_FAILURE_TYPE.UNKNOWN;
}

export function evaluateNetworkRequests(requests = [], policy = {}) {
  const {
    blockOn404Script   = true,
    blockOn404Css      = false,
    blockOnApiError    = false,
    blockOnTimeout     = true,
    allowedDomains     = ['localhost', '127.0.0.1'],
  } = policy;

  const failures = requests.filter(r => r.failed);
  const classified = failures.map(r => ({
    ...r,
    failureType: classifyNetworkFailure(r),
  }));

  const blocking = classified.filter(r => {
    if (r.failureType === NETWORK_FAILURE_TYPE.TIMEOUT && blockOnTimeout) return true;
    if (r.failureType === NETWORK_FAILURE_TYPE.RESOURCE_404) {
      if (r.resourceType === RESOURCE_TYPE.SCRIPT && blockOn404Script) return true;
      if (r.resourceType === RESOURCE_TYPE.STYLESHEET && blockOn404Css) return true;
    }
    if (r.failureType === NETWORK_FAILURE_TYPE.API_ERROR && blockOnApiError) return true;
    return false;
  });

  const externalRequests = requests.filter(r => {
    try {
      const domain = new URL(r.url).hostname;
      return !allowedDomains.some(d => domain.includes(d));
    } catch { return false; }
  });

  const status = blocking.length > 0 ? NETWORK_GATE_STATUS.FAIL
    : failures.length > 0            ? NETWORK_GATE_STATUS.WARN
    : NETWORK_GATE_STATUS.PASS;

  return Object.freeze({
    valid:             true,
    status,
    totalRequests:     requests.length,
    failedCount:       failures.length,
    blockingCount:     blocking.length,
    externalCount:     externalRequests.length,
    classified,
    blocking,
    isReal:            false,
  });
}

export function createNetworkCollector() {
  const requests = [];
  return {
    record(req) { requests.push({ ...req, at: new Date().toISOString() }); },
    getAll()    { return [...requests]; },
    getFailed() { return requests.filter(r => r.failed); },
    clear()     { requests.length = 0; },
  };
}

export const NETWORK_FAILURE_GATE_VERSION = '1.0.0';

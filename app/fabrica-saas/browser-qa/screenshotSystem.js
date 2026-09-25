// Screenshot System — ADV-06
// Manages screenshot capture metadata and policies for browser QA.

export const SCREENSHOT_TYPE = Object.freeze({
  FULL_PAGE:       'FULL_PAGE',
  VIEWPORT:        'VIEWPORT',
  ELEMENT:         'ELEMENT',
  ERROR_CAPTURE:   'ERROR_CAPTURE',
  BASELINE:        'BASELINE',
  DIFF:            'DIFF',
});

export const SCREENSHOT_TRIGGER = Object.freeze({
  ON_LOAD:         'ON_LOAD',
  ON_ERROR:        'ON_ERROR',
  ON_INTERACTION:  'ON_INTERACTION',
  MANUAL:          'MANUAL',
  SCHEDULED:       'SCHEDULED',
});

export function createScreenshotPolicy(options = {}) {
  const {
    captureOnError   = true,
    captureOnLoad    = false,
    captureBaseline  = false,
    outputDir        = 'browser-qa/screenshots',
    maxPerRun        = 50,
    format           = 'png',
  } = options;
  return Object.freeze({
    valid:           true,
    captureOnError,
    captureOnLoad,
    captureBaseline,
    outputDir,
    maxPerRun,
    format,
    isReal:          false,
  });
}

export function createScreenshotRequest(params = {}) {
  const { route, type = SCREENSHOT_TYPE.VIEWPORT, trigger = SCREENSHOT_TRIGGER.MANUAL, viewport, selector } = params;
  if (!route) return { valid: false, error: 'route required' };

  const slug = route.replace(/\//g, '-').replace(/^-/, '') || 'root';
  const filename = `${trigger.toLowerCase()}-${type.toLowerCase()}-${slug}-${Date.now()}.png`;

  return Object.freeze({
    valid:    true,
    route,
    type,
    trigger,
    viewport: viewport ?? null,
    selector: selector ?? null,
    filename,
    isReal:   false,
  });
}

export function buildScreenshotManifest(requests = [], policy = {}) {
  if (!Array.isArray(requests)) return { valid: false, error: 'requests array required' };
  const safePolicy = { maxPerRun: 50, outputDir: 'browser-qa/screenshots', ...policy };
  const capped = requests.slice(0, safePolicy.maxPerRun);

  return Object.freeze({
    valid:        true,
    outputDir:    safePolicy.outputDir,
    totalPlanned: requests.length,
    willCapture:  capped.length,
    capped:       requests.length > safePolicy.maxPerRun,
    requests:     capped,
    isReal:       false,
  });
}

export function groupScreenshotsByTrigger(requests = []) {
  const groups = {};
  for (const r of requests) {
    if (!groups[r.trigger]) groups[r.trigger] = [];
    groups[r.trigger].push(r);
  }
  return { valid: true, groups, triggerCount: Object.keys(groups).length, isReal: false };
}

export const SCREENSHOT_SYSTEM_VERSION = '1.0.0';

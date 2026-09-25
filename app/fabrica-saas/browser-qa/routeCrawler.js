// Route Crawler — ADV-06
// Defines route discovery and crawling logic for browser QA.

export const ROUTE_STATUS = Object.freeze({
  OK:           'OK',
  NOT_FOUND:    'NOT_FOUND',
  ERROR:        'ERROR',
  REDIRECT:     'REDIRECT',
  TIMEOUT:      'TIMEOUT',
  AUTH_WALL:    'AUTH_WALL',
});

export const CRAWL_DEPTH = Object.freeze({
  SHALLOW:  1,
  MEDIUM:   2,
  DEEP:     3,
});

export function createRouteDefinition(path, options = {}) {
  if (!path || typeof path !== 'string') return { valid: false, error: 'path required' };
  return Object.freeze({
    valid:          true,
    path,
    label:          options.label ?? path,
    requiresAuth:   options.requiresAuth ?? false,
    expectedStatus: options.expectedStatus ?? 200,
    timeout:        options.timeout ?? 5000,
    isReal:         false,
  });
}

export function createCrawlPlan(routes = [], baseUrl = '') {
  if (!Array.isArray(routes) || routes.length === 0) return { valid: false, error: 'routes required' };
  if (!baseUrl) return { valid: false, error: 'baseUrl required' };

  const publicRoutes = routes.filter(r => !r.requiresAuth);
  const authRoutes   = routes.filter(r => r.requiresAuth);

  return Object.freeze({
    valid:        true,
    baseUrl,
    routes,
    publicRoutes,
    authRoutes,
    totalRoutes:  routes.length,
    publicCount:  publicRoutes.length,
    authCount:    authRoutes.length,
    estimatedSeconds: routes.length * 3,
    isReal:       false,
  });
}

export function evaluateCrawlResults(results = []) {
  if (!Array.isArray(results)) return { valid: false, error: 'results array required' };

  const ok       = results.filter(r => r.status === ROUTE_STATUS.OK);
  const notFound = results.filter(r => r.status === ROUTE_STATUS.NOT_FOUND);
  const errors   = results.filter(r => r.status === ROUTE_STATUS.ERROR || r.status === ROUTE_STATUS.TIMEOUT);
  const authWall = results.filter(r => r.status === ROUTE_STATUS.AUTH_WALL);

  const blocking = [...notFound, ...errors];
  return Object.freeze({
    valid:       true,
    total:       results.length,
    okCount:     ok.length,
    notFound:    notFound.length,
    errors:      errors.length,
    authWalled:  authWall.length,
    blocking:    blocking.length,
    allOk:       blocking.length === 0,
    results,
    isReal:      false,
  });
}

export function discoverLinksFromHtml(html = '', baseUrl = '') {
  const hrefPattern = /href=["']([^"']+)["']/g;
  const links = [];
  let m;
  while ((m = hrefPattern.exec(html)) !== null) {
    const href = m[1];
    if (href.startsWith('#') || href.startsWith('javascript:')) continue;
    if (href.startsWith('http') && !href.startsWith(baseUrl)) continue;
    links.push(href.startsWith('/') ? href : `/${href}`);
  }
  return [...new Set(links)];
}

export const ROUTE_CRAWLER_VERSION = '1.0.0';

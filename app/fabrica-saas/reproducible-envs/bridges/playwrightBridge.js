// Playwright Bridge — ADV-15 → ADV-06

export const QA_TARGET = Object.freeze({
  CONTAINERIZED: 'CONTAINERIZED',
  NATIVE:        'NATIVE',
  FALLBACK:      'FALLBACK',
});

export function createPlaywrightBridge(config = {}) {
  const { dockerAvailable = false, port = 5180 } = config;

  const target = dockerAvailable ? QA_TARGET.CONTAINERIZED : QA_TARGET.NATIVE;

  return Object.freeze({
    adv06Bridge:    'BROWSER_QA_LAYER_CONNECTED',
    target,
    baseUrl:        `http://localhost:${port}`,
    port,
    dockerAvailable,
    configTemplate: Object.freeze({
      baseURL:     `http://localhost:${port}`,
      webServer: Object.freeze({
        command: dockerAvailable
          ? `docker run -p ${port}:${port} app:local`
          : `npm run preview -- --port ${port}`,
        port,
        reuseExistingServer: true,
      }),
    }),
    noRealBrowser:  true,
    isReal:         false,
  });
}

export const PLAYWRIGHT_BRIDGE_VERSION = '1.0.0';

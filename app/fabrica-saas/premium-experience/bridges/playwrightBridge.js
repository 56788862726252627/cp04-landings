// Playwright Bridge — ADV-07 → ADV-06

export const PREMIUM_QA_VIEWPORTS = Object.freeze([
  { name: 'mobile-s',  width: 375,  height: 667  },
  { name: 'mobile-m',  width: 390,  height: 844  },
  { name: 'tablet',    width: 768,  height: 1024 },
  { name: 'desktop',   width: 1366, height: 768  },
  { name: 'desktop-l', width: 1920, height: 1080 },
]);

export const PREMIUM_QA_PHASES = Object.freeze([
  'RENDER', 'CONSOLE', 'NETWORK', 'CONTROLS',
  'RESPONSIVE', 'ACCESSIBILITY', 'CRITICAL_FLOWS', 'VISUAL',
]);

export function buildPremiumQAPlan(fixture = {}) {
  return Object.freeze({
    fixtureId:   fixture.appId ?? 'unknown',
    viewports:   [...PREMIUM_QA_VIEWPORTS],
    phases:      [...PREMIUM_QA_PHASES],
    screenshotPerViewport: true,
    useRealChromium:       true,
    port:                  5181,
    noRealAuth:            true,
    noRealPayments:        true,
    isReal:                false,
  });
}

export function mapQAResultToPremiumScore(qaResult = {}) {
  const phaseScores = {
    RENDER:       qaResult.RENDER       === 'PASS' ? 100 : qaResult.RENDER       === 'WARN' ? 60 : 0,
    CONSOLE:      qaResult.CONSOLE      === 'PASS' ? 100 : qaResult.CONSOLE      === 'WARN' ? 60 : 0,
    RESPONSIVE:   qaResult.RESPONSIVE   === 'PASS' ? 100 : qaResult.RESPONSIVE   === 'WARN' ? 60 : 0,
    ACCESSIBILITY:qaResult.ACCESSIBILITY=== 'PASS' ? 100 : qaResult.ACCESSIBILITY=== 'WARN' ? 60 : 0,
    CONTROLS:     qaResult.CONTROLS     === 'PASS' ? 100 : qaResult.CONTROLS     === 'WARN' ? 60 : 0,
  };
  const avg = Object.values(phaseScores).reduce((s, v) => s + v, 0) / Object.values(phaseScores).length;
  return Object.freeze({ score: Math.round(avg), phaseScores, isReal: false });
}

export const PLAYWRIGHT_BRIDGE_VERSION = '1.0.0';

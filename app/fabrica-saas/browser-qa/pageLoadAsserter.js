// Page Load Asserter — ADV-06
// Defines and evaluates page load assertions for browser QA.

export const LOAD_ASSERT_TYPE = Object.freeze({
  TITLE_NOT_EMPTY:      'TITLE_NOT_EMPTY',
  HEADING_PRESENT:      'HEADING_PRESENT',
  NAV_PRESENT:          'NAV_PRESENT',
  MAIN_CONTENT_PRESENT: 'MAIN_CONTENT_PRESENT',
  NO_ERROR_TEXT:        'NO_ERROR_TEXT',
  CTA_PRESENT:          'CTA_PRESENT',
  FOOTER_PRESENT:       'FOOTER_PRESENT',
  LOGO_PRESENT:         'LOGO_PRESENT',
  PAGE_LANG_SET:        'PAGE_LANG_SET',
  META_DESCRIPTION:     'META_DESCRIPTION',
});

export const ASSERT_RESULT = Object.freeze({
  PASS:    'PASS',
  FAIL:    'FAIL',
  SKIPPED: 'SKIPPED',
});

export function createPageAssertion(type, selector, options = {}) {
  if (!LOAD_ASSERT_TYPE[type]) return { valid: false, error: `unknown type: ${type}` };
  return Object.freeze({
    valid:    true,
    type,
    selector: selector ?? null,
    required: options.required ?? true,
    message:  options.message ?? `Assert ${type}`,
    isReal:   false,
  });
}

export function buildDefaultAssertions(appConfig = {}) {
  const { hasNav = true, hasFooter = true, hasLogo = true } = appConfig;
  const assertions = [
    createPageAssertion(LOAD_ASSERT_TYPE.TITLE_NOT_EMPTY, 'title'),
    createPageAssertion(LOAD_ASSERT_TYPE.HEADING_PRESENT, 'h1, h2'),
    createPageAssertion(LOAD_ASSERT_TYPE.MAIN_CONTENT_PRESENT, 'main, [role="main"], #root > *'),
    createPageAssertion(LOAD_ASSERT_TYPE.NO_ERROR_TEXT, null, { required: true }),
    createPageAssertion(LOAD_ASSERT_TYPE.PAGE_LANG_SET, 'html[lang]'),
  ];
  if (hasNav)    assertions.push(createPageAssertion(LOAD_ASSERT_TYPE.NAV_PRESENT, 'nav, [role="navigation"]'));
  if (hasFooter) assertions.push(createPageAssertion(LOAD_ASSERT_TYPE.FOOTER_PRESENT, 'footer'));
  if (hasLogo)   assertions.push(createPageAssertion(LOAD_ASSERT_TYPE.LOGO_PRESENT, 'img[alt*="logo" i], .logo, #logo'));
  return { valid: true, assertions, count: assertions.length, isReal: false };
}

export function evaluatePageAssertions(assertions = [], pageSnapshot = {}) {
  const results = assertions.map(a => {
    const found = pageSnapshot[a.type] ?? false;
    return {
      type:     a.type,
      selector: a.selector,
      result:   found ? ASSERT_RESULT.PASS : ASSERT_RESULT.FAIL,
      required: a.required,
    };
  });

  const failed   = results.filter(r => r.result === ASSERT_RESULT.FAIL);
  const required = failed.filter(r => r.required);

  return Object.freeze({
    valid:        true,
    passed:       results.filter(r => r.result === ASSERT_RESULT.PASS).length,
    failed:       failed.length,
    requiredFail: required.length,
    blocking:     required.length > 0,
    results,
    isReal:       false,
  });
}

export const PAGE_LOAD_ASSERTER_VERSION = '1.0.0';

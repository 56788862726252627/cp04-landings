// Cookie Banner Model — ADV-19

export const BANNER_ACTION = Object.freeze({
  ACCEPT:    'ACCEPT',
  REJECT:    'REJECT',
  CONFIGURE: 'CONFIGURE',
});

export const BANNER_ISSUE = Object.freeze({
  NO_REJECT_OPTION:        'NO_REJECT_OPTION',
  PRESELECTED_MARKETING:   'PRESELECTED_MARKETING',
  ACCEPT_ONLY:             'ACCEPT_ONLY',
  MISLEADING_UI:           'MISLEADING_UI',
  EQUAL_PROMINENCE_ABSENT: 'EQUAL_PROMINENCE_ABSENT',
});

export function createCookieBannerModel(config = {}) {
  const {
    actions = [BANNER_ACTION.ACCEPT, BANNER_ACTION.REJECT, BANNER_ACTION.CONFIGURE],
    preselectedCategories = [],
    acceptAndRejectEqualProminence = true,
    clientId = null,
  } = config;

  const issues = [];

  if (!actions.includes(BANNER_ACTION.REJECT)) {
    issues.push(BANNER_ISSUE.NO_REJECT_OPTION);
  }
  if (actions.length === 1 && actions[0] === BANNER_ACTION.ACCEPT) {
    issues.push(BANNER_ISSUE.ACCEPT_ONLY);
  }
  if (preselectedCategories.some(c => c === 'MARKETING' || c === 'ANALYTICS')) {
    issues.push(BANNER_ISSUE.PRESELECTED_MARKETING);
  }
  if (!acceptAndRejectEqualProminence) {
    issues.push(BANNER_ISSUE.EQUAL_PROMINENCE_ABSENT);
  }

  return Object.freeze({
    clientId,
    actions: Object.freeze([...actions]),
    preselectedCategories: Object.freeze([...preselectedCategories]),
    acceptAndRejectEqualProminence,
    issues: Object.freeze([...issues]),
    compliant: issues.length === 0,
    noCP04Banner: true,
    isReal: false,
  });
}

export const COOKIE_BANNER_VERSION = '1.0.0';

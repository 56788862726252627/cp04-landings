// Responsive Transformation Engine — ADV-07

export const RESPONSIVE_TRANSFORM = Object.freeze({
  TABLE_TO_CARDS:         'TABLE_TO_CARDS',
  SIDEBAR_TO_DRAWER:      'SIDEBAR_TO_DRAWER',
  MULTI_COL_TO_STACKED:   'MULTI_COL_TO_STACKED',
  ACTIONS_TO_OVERFLOW:    'ACTIONS_TO_OVERFLOW',
  NAV_TO_BOTTOM:          'NAV_TO_BOTTOM',
  FORM_TO_SINGLE_COL:     'FORM_TO_SINGLE_COL',
  SPLIT_TO_TABBED:        'SPLIT_TO_TABBED',
});

export function resolveResponsiveTransform(source = '', viewport = 'mobile') {
  const transforms = [];
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  if (source === 'TABLE' && isMobile) transforms.push(RESPONSIVE_TRANSFORM.TABLE_TO_CARDS);
  if (source === 'SIDEBAR_APP' && (isMobile || isTablet)) transforms.push(RESPONSIVE_TRANSFORM.SIDEBAR_TO_DRAWER);
  if (source === 'FORM_MULTI' && isMobile) transforms.push(RESPONSIVE_TRANSFORM.FORM_TO_SINGLE_COL);
  if (source === 'MULTI_COL' && isMobile) transforms.push(RESPONSIVE_TRANSFORM.MULTI_COL_TO_STACKED);
  if (source === 'TOP_NAV' && isMobile) transforms.push(RESPONSIVE_TRANSFORM.NAV_TO_BOTTOM);
  if (source === 'ACTIONS' && isMobile) transforms.push(RESPONSIVE_TRANSFORM.ACTIONS_TO_OVERFLOW);
  if (source === 'SPLIT' && (isMobile || isTablet)) transforms.push(RESPONSIVE_TRANSFORM.SPLIT_TO_TABBED);

  return Object.freeze({ source, viewport, transforms, cssOnly: true, isReal: false });
}

export function buildTransformMatrix(layoutPattern = 'TOP_NAV') {
  const mobile = {
    tables:   RESPONSIVE_TRANSFORM.TABLE_TO_CARDS,
    sidebar:  layoutPattern === 'SIDEBAR_APP' ? RESPONSIVE_TRANSFORM.SIDEBAR_TO_DRAWER : null,
    nav:      RESPONSIVE_TRANSFORM.NAV_TO_BOTTOM,
    forms:    RESPONSIVE_TRANSFORM.FORM_TO_SINGLE_COL,
    actions:  RESPONSIVE_TRANSFORM.ACTIONS_TO_OVERFLOW,
  };
  const tablet = {
    sidebar:  layoutPattern === 'SIDEBAR_APP' || layoutPattern === 'CRM_FIRST'
      ? RESPONSIVE_TRANSFORM.SIDEBAR_TO_DRAWER : null,
    split:    RESPONSIVE_TRANSFORM.SPLIT_TO_TABBED,
  };
  return Object.freeze({ layoutPattern, mobile, tablet, isReal: false });
}

export const RESPONSIVE_TRANSFORMATION_ENGINE_VERSION = '1.0.0';

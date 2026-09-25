// Nexo Vet QA Fixture — ADV-06
// Fixture data for Clínica Veterinaria Nexo — isolated, no real client data.

export const NEXO_VET_APP = Object.freeze({
  appId:    'nexo-vet',
  appName:  'Clínica Veterinaria Nexo',
  vertical: 'veterinary',
  locale:   'es',
  port:     5180,
  isFixture:  true,
  isReal:     false,
});

export const NEXO_VET_ROUTES = Object.freeze([
  { path: '/',         label: 'Inicio',     requiresAuth: false },
  { path: '/#servicios', label: 'Servicios', requiresAuth: false },
  { path: '/#contacto',  label: 'Contacto',  requiresAuth: false },
  { path: '/#equipo',    label: 'Equipo',    requiresAuth: false },
]);

export const NEXO_VET_FORMS = Object.freeze([
  {
    id:       'form-contacto',
    name:     'Formulario de Contacto',
    selector: '#form-contacto, form[data-form="contacto"]',
    fields: [
      { name: 'nombre',   type: 'text',  required: true },
      { name: 'email',    type: 'email', required: true },
      { name: 'telefono', type: 'tel',   required: false },
      { name: 'mensaje',  type: 'textarea', required: true },
    ],
    submitSelector: 'button[type="submit"]',
  },
]);

export const NEXO_VET_CRITICAL_ELEMENTS = Object.freeze({
  hero:       'h1, .hero, [data-section="hero"]',
  nav:        'nav, [role="navigation"]',
  cta:        '.btn-primary, [data-cta], a[href="#contacto"]',
  logo:       '.logo, img[alt*="Nexo" i], img[alt*="logo" i]',
  footer:     'footer',
  services:   '#servicios, [data-section="servicios"]',
  contact:    '#contacto, [data-section="contacto"]',
});

export const NEXO_VET_PERFORMANCE_BUDGET = Object.freeze({
  LCP_MS:    2500,
  FCP_MS:    1800,
  CLS:       0.1,
  TTI_MS:    3800,
  BUNDLE_KB: 200,
});

export const NEXO_VET_A11Y_CONFIG = Object.freeze({
  level:       'AA',
  lang:        'es',
  hasSkipLink: false,
  hasLandmarks:true,
});

export const NEXO_VET_VIEWPORT_CONFIG = Object.freeze({
  primary:    { width: 390, height: 844, name: 'MOBILE_M', label: 'iPhone 14' },
  secondary:  { width: 1280, height: 800, name: 'DESKTOP', label: 'Desktop' },
  tablet:     { width: 768, height: 1024, name: 'TABLET',  label: 'iPad' },
});

export function buildNexoVetQAPlan() {
  return Object.freeze({
    app:        NEXO_VET_APP,
    routes:     NEXO_VET_ROUTES,
    forms:      NEXO_VET_FORMS,
    elements:   NEXO_VET_CRITICAL_ELEMENTS,
    perf:       NEXO_VET_PERFORMANCE_BUDGET,
    a11y:       NEXO_VET_A11Y_CONFIG,
    viewports:  NEXO_VET_VIEWPORT_CONFIG,
    isFixture:  true,
    isReal:     false,
  });
}

export const NEXO_VET_FIXTURE_VERSION = '1.0.0';

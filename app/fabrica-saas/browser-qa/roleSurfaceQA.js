// Role Surface QA — ADV-06
// Validates that correct UI surfaces are shown per role (fixture-only, no real auth).

export const ROLE_FIXTURE = Object.freeze({
  VISITOR:   'VISITOR',
  PATIENT:   'PATIENT',
  STAFF:     'STAFF',
  ADMIN:     'ADMIN',
  ANONYMOUS: 'ANONYMOUS',
});

export const SURFACE_VISIBILITY = Object.freeze({
  VISIBLE:  'VISIBLE',
  HIDDEN:   'HIDDEN',
  DISABLED: 'DISABLED',
});

export const ROLE_QA_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

export function createRoleSurface(role, elements = []) {
  if (!ROLE_FIXTURE[role]) return { valid: false, error: `unknown role: ${role}` };
  if (elements.length === 0) return { valid: false, error: 'elements required' };

  return Object.freeze({
    valid:    true,
    role,
    elements,
    isFixture:  true,
    usesRealAuth: false,
    isReal:     false,
  });
}

export function createSurfaceElement(selector, expectedVisibility, label = '') {
  if (!SURFACE_VISIBILITY[expectedVisibility]) {
    return { valid: false, error: `unknown visibility: ${expectedVisibility}` };
  }
  return Object.freeze({
    valid: true, selector, expectedVisibility, label, isReal: false,
  });
}

export function evaluateRoleSurface(surface = {}, snapshot = {}) {
  if (!surface.valid) return { valid: false, error: 'invalid surface definition' };

  const results = surface.elements.map(el => {
    const actual = snapshot[el.selector] ?? SURFACE_VISIBILITY.HIDDEN;
    const match  = actual === el.expectedVisibility;
    return {
      selector:   el.selector,
      label:      el.label,
      expected:   el.expectedVisibility,
      actual,
      match,
    };
  });

  const failed   = results.filter(r => !r.match);
  const status   = failed.length > 0 ? ROLE_QA_STATUS.FAIL : ROLE_QA_STATUS.PASS;

  return Object.freeze({
    valid:       true,
    role:        surface.role,
    status,
    totalChecks: results.length,
    passedChecks:results.filter(r => r.match).length,
    failedChecks:failed.length,
    results,
    isReal:      false,
  });
}

export function buildNexoVetRoleSurfaces() {
  return [
    createRoleSurface(ROLE_FIXTURE.VISITOR, [
      createSurfaceElement('nav',           SURFACE_VISIBILITY.VISIBLE, 'Main nav'),
      createSurfaceElement('.hero',         SURFACE_VISIBILITY.VISIBLE, 'Hero section'),
      createSurfaceElement('.admin-panel',  SURFACE_VISIBILITY.HIDDEN,  'Admin panel hidden from visitors'),
      createSurfaceElement('.patient-area', SURFACE_VISIBILITY.HIDDEN,  'Patient area hidden from visitors'),
    ]),
    createRoleSurface(ROLE_FIXTURE.STAFF, [
      createSurfaceElement('.staff-tools',  SURFACE_VISIBILITY.VISIBLE, 'Staff tools visible'),
      createSurfaceElement('.admin-delete', SURFACE_VISIBILITY.HIDDEN,  'Delete controls hidden from staff'),
    ]),
  ];
}

export const ROLE_SURFACE_QA_VERSION = '1.0.0';

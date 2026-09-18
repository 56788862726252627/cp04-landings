// Declarative extension request for the existing Factory registry, not a new selector.
// Only user-supplied identities and purposes are recorded; no SKILL.md is reconstructed.
export const PRIORITY_SKILL_REQUESTS = Object.freeze([
  ['auditoria-web', 'Experiencia, accesibilidad, SEO y conversión'],
  ['campana-visual', 'Coherencia de imágenes y activos'],
  ['guion-a-storyboard', 'Planificación de cada vídeo'],
  ['contenido-multiformato', 'Reutilización de vídeos y contenido'],
  ['feedback-a-plan', 'Convertir pruebas y opiniones en backlog'],
].map(([name, requestedPurpose]) => Object.freeze({
  name, requestedPurpose, status: 'SOURCE_PENDING', source: null, autoExecute: false,
})));
export const REQUESTED_PRINCIPLE_SOURCES = Object.freeze([
  'fabrica-agencia-ia', 'fabrica-saas-multisectorial', 'produccion-saas-rigurosa',
]);
// Known verified capability stays in its original registry; do not duplicate it here.
export const VERIFIED_MENU_CAPABILITY_REF = Object.freeze({
  name: 'crear-menu-interactivo-saas-local', version: '1.0.0',
  rootRef: 'factory-workspace',
  path: 'fabrica-saas/skills/crear-menu-interactivo-saas-local/SKILL.md',
});

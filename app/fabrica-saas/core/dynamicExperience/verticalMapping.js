/**
 * Factory Dynamic Experience Engine — Vertical Experience Mapping V1.7
 *
 * Maps each of the 10 supported verticals (+ aliases + education) to:
 *   - a recommended experience preset
 *   - motion level
 *   - hero type
 *   - recommended interactions
 *   - interactions to avoid
 *   - emotional tone
 *
 * This mapping drives the default experience for new generated apps.
 * Client manifests can override any field via `experience:` section.
 */

// ─── Hero types ───────────────────────────────────────────────────────────────

export const HERO_TYPES = [
  'centered-text',     // Full-width centered text + CTA
  'split-content',     // Left text, right image
  'video-background',  // Full-bleed video with overlay text
  'gradient-hero',     // Gradient background + text
  'image-overlay',     // Background image with overlay + text
  'minimal-bar',       // Minimal top bar, content-first
];

// ─── Interaction catalog ──────────────────────────────────────────────────────

export const INTERACTION_CATALOG = [
  'animated-metrics',
  'expandable-cards',
  'interactive-calendar',
  'filterable-gallery',
  'sortable-table',
  'interactive-timeline',
  'progress-indicators',
  'before-after-slider',
  'accordion-faq',
  'service-carousel',
  'team-grid-hover',
  'testimonial-slider',
  'animated-counters',
  'booking-form-stepper',
  'case-study-reveal',
  'price-table-toggle',
  'map-embed',
  'live-chat-trigger',
];

// ─── Vertical map ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} VerticalExperienceConfig
 * @property {string}   defaultPreset          - preset from EXPERIENCE_PRESETS
 * @property {string}   [secondaryPreset]      - alternative for clients wanting more/less motion
 * @property {string}   motionLevel            - 'none'|'low'|'medium'|'high'
 * @property {string}   heroType               - from HERO_TYPES
 * @property {string}   recommendedVideo       - type of video most useful for this vertical
 * @property {string[]} recommendedInteractions - from INTERACTION_CATALOG
 * @property {string[]} avoidInteractions      - patterns to avoid for this vertical
 * @property {string}   density                - 'compact'|'comfortable'|'spacious'
 * @property {string}   emotionalTone          - free text describing the emotional goal
 */

export const VERTICAL_EXPERIENCE_MAP = Object.freeze({

  dental: {
    defaultPreset:            'clinical',
    secondaryPreset:          'subtle',
    motionLevel:              'low',
    heroType:                 'split-content',
    recommendedVideo:         'service',
    recommendedInteractions:  ['animated-metrics', 'expandable-cards', 'interactive-calendar', 'before-after-slider', 'accordion-faq'],
    avoidInteractions:        ['video-background', 'full-page-transitions', 'parallax-aggressive', 'animated-counters'],
    density:                  'comfortable',
    emotionalTone:            'confianza, salud, limpieza, profesionalidad',
    notes:                    'Antes/después dental funciona bien; evitar efectos agresivos que generen ansiedad al paciente',
  },

  legal: {
    defaultPreset:            'professional',
    secondaryPreset:          'editorial',
    motionLevel:              'low',
    heroType:                 'minimal-bar',
    recommendedVideo:         'explainer',
    recommendedInteractions:  ['interactive-timeline', 'sortable-table', 'accordion-faq', 'expandable-cards', 'animated-metrics'],
    avoidInteractions:        ['before-after-slider', 'video-background', 'animated-counters', 'service-carousel'],
    density:                  'compact',
    emotionalTone:            'seriedad, autoridad, precisión, confianza institucional',
    notes:                    'Motion mínimo. Timelines para mostrar procesos legales. Tablas ordenables para tarifas.',
  },

  physio: {
    defaultPreset:            'calm',
    secondaryPreset:          'professional',
    motionLevel:              'low',
    heroType:                 'split-content',
    recommendedVideo:         'service',
    recommendedInteractions:  ['animated-metrics', 'expandable-cards', 'before-after-slider', 'progress-indicators', 'interactive-timeline'],
    avoidInteractions:        ['energetic-transitions', 'rapid-counters', 'intense-parallax'],
    density:                  'comfortable',
    emotionalTone:            'recuperación, tranquilidad, cuidado, profesionalidad clínica',
    notes:                    'Progreso de recuperación como métrica visual. Antes/después de tratamiento.',
  },

  fisioterapia: {
    defaultPreset:            'calm',
    secondaryPreset:          'professional',
    motionLevel:              'low',
    heroType:                 'split-content',
    recommendedVideo:         'service',
    recommendedInteractions:  ['animated-metrics', 'expandable-cards', 'before-after-slider', 'progress-indicators'],
    avoidInteractions:        ['energetic-transitions', 'rapid-counters', 'intense-parallax'],
    density:                  'comfortable',
    emotionalTone:            'recuperación, tranquilidad, cuidado',
    notes:                    'Alias de physio',
  },

  psychology: {
    defaultPreset:            'calm',
    secondaryPreset:          'subtle',
    motionLevel:              'low',
    heroType:                 'gradient-hero',
    recommendedVideo:         'explainer',
    recommendedInteractions:  ['expandable-cards', 'accordion-faq', 'testimonial-slider', 'booking-form-stepper'],
    avoidInteractions:        ['animated-counters', 'aggressive-motion', 'before-after-slider', 'energetic-transitions'],
    density:                  'spacious',
    emotionalTone:            'seguridad, calidez, escucha, discreción, apoyo emocional',
    notes:                    'Espaciado generoso, sin estimulación visual excesiva. Discreción es clave.',
  },

  'speech-therapy': {
    defaultPreset:            'friendly',
    secondaryPreset:          'calm',
    motionLevel:              'medium',
    heroType:                 'centered-text',
    recommendedVideo:         'service',
    recommendedInteractions:  ['expandable-cards', 'accordion-faq', 'animated-metrics', 'testimonial-slider', 'interactive-timeline'],
    avoidInteractions:        ['aggressive-motion', 'rapid-flicker', 'intense-video'],
    density:                  'comfortable',
    emotionalTone:            'calidez, evolución, comunicación, esperanza, acompañamiento',
    notes:                    'Amable y accesible. Métricas de progreso del paciente. Familiar-friendly.',
  },

  sports: {
    defaultPreset:            'energetic',
    secondaryPreset:          'sports',
    motionLevel:              'high',
    heroType:                 'video-background',
    recommendedVideo:         'hero',
    recommendedInteractions:  ['animated-counters', 'animated-metrics', 'sortable-table', 'progress-indicators', 'filterable-gallery', 'testimonial-slider'],
    avoidInteractions:        ['slow-transitions', 'minimal-motion', 'accordion-only'],
    density:                  'compact',
    emotionalTone:            'energía, rendimiento, superación, competición, comunidad deportiva',
    notes:                    'Rankings, estadísticas, actividad reciente. Transiciones rápidas. Métricas animadas son clave.',
  },

  veterinary: {
    defaultPreset:            'friendly',
    secondaryPreset:          'calm',
    motionLevel:              'medium',
    heroType:                 'image-overlay',
    recommendedVideo:         'team',
    recommendedInteractions:  ['expandable-cards', 'service-carousel', 'team-grid-hover', 'accordion-faq', 'interactive-calendar'],
    avoidInteractions:        ['intense-parallax', 'aggressive-counters'],
    density:                  'comfortable',
    emotionalTone:            'amor por los animales, cuidado, confianza, profesionalidad cercana',
    notes:                    'Fotos del equipo con mascotas funcionan muy bien. Carrusel de servicios.',
  },

  hairdresser: {
    defaultPreset:            'luxury',
    secondaryPreset:          'friendly',
    motionLevel:              'medium',
    heroType:                 'image-overlay',
    recommendedVideo:         'service',
    recommendedInteractions:  ['before-after-slider', 'filterable-gallery', 'service-carousel', 'booking-form-stepper', 'team-grid-hover'],
    avoidInteractions:        ['data-heavy-tables', 'clinical-grids'],
    density:                  'comfortable',
    emotionalTone:            'estilo, transformación, creatividad, bienestar, exclusividad accesible',
    notes:                    'Antes/después es el formato de contenido más potente. Galería rich.',
  },

  beauty: {
    defaultPreset:            'luxury',
    secondaryPreset:          'immersive',
    motionLevel:              'medium',
    heroType:                 'gradient-hero',
    recommendedVideo:         'hero',
    recommendedInteractions:  ['before-after-slider', 'filterable-gallery', 'service-carousel', 'testimonial-slider', 'booking-form-stepper'],
    avoidInteractions:        ['clinical-tables', 'text-heavy-accordions'],
    density:                  'spacious',
    emotionalTone:            'lujo, transformación, autoestima, bienestar premium',
    notes:                    'Espaciado generoso, rich media, antes/después. Hero de video o gradient sofisticado.',
  },

  estetica: {
    defaultPreset:            'luxury',
    secondaryPreset:          'immersive',
    motionLevel:              'medium',
    heroType:                 'gradient-hero',
    recommendedVideo:         'hero',
    recommendedInteractions:  ['before-after-slider', 'filterable-gallery', 'service-carousel', 'testimonial-slider'],
    avoidInteractions:        ['clinical-tables', 'text-heavy-accordions'],
    density:                  'spacious',
    emotionalTone:            'lujo, transformación, autoestima',
    notes:                    'Alias de beauty',
  },

  fertility: {
    defaultPreset:            'calm',
    secondaryPreset:          'clinical',
    motionLevel:              'low',
    heroType:                 'gradient-hero',
    recommendedVideo:         'explainer',
    recommendedInteractions:  ['interactive-timeline', 'accordion-faq', 'animated-metrics', 'booking-form-stepper', 'case-study-reveal'],
    avoidInteractions:        ['aggressive-motion', 'rapid-counters', 'energetic-transitions', 'before-after-slider'],
    density:                  'spacious',
    emotionalTone:            'esperanza, calidez, discreción, apoyo médico, viaje emocional compartido',
    notes:                    'Motion muy suave. Sin estímulos visuales agresivos. Timeline de proceso médico funciona muy bien.',
  },

  abogados: {
    defaultPreset:            'professional',
    secondaryPreset:          'editorial',
    motionLevel:              'low',
    heroType:                 'minimal-bar',
    recommendedVideo:         'explainer',
    recommendedInteractions:  ['interactive-timeline', 'sortable-table', 'accordion-faq', 'expandable-cards'],
    avoidInteractions:        ['before-after-slider', 'video-background', 'animated-counters'],
    density:                  'compact',
    emotionalTone:            'seriedad, autoridad, precisión',
    notes:                    'Alias de legal',
  },

  education: {
    defaultPreset:            'friendly',
    secondaryPreset:          'tech-premium',
    motionLevel:              'medium',
    heroType:                 'centered-text',
    recommendedVideo:         'explainer',
    recommendedInteractions:  ['animated-metrics', 'interactive-timeline', 'progress-indicators', 'accordion-faq', 'filterable-gallery', 'animated-counters'],
    avoidInteractions:        ['luxury-motion', 'immersive-parallax'],
    density:                  'comfortable',
    emotionalTone:            'aprendizaje, progreso, comunidad, claridad, motivación',
    notes:                    'Vertical reservado para futura implementación. Roles: alumno, profesor, familia. Sin currículo concreto todavía.',
    readyForFutureImplementation: true,
    futureSubTypes: ['primaria', 'eso', 'bachillerato', 'fp', 'cursos', 'universitario'],
    futureFeatures: [
      'roles: alumno, profesor, familia, tutor',
      'cursos, asignaturas, unidades, contenido',
      'videos educativos, ejercicios, cuestionarios',
      'progreso, calendario, tareas, exámenes',
      'tutor IA, gamificación ligera, seguimiento',
    ],
  },

});

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get experience mapping for a vertical.
 * Returns safe defaults if vertical is unknown.
 */
export function getVerticalExperience(vertical) {
  return VERTICAL_EXPERIENCE_MAP[vertical] ?? VERTICAL_EXPERIENCE_MAP.dental;
}

/**
 * List all verticals with experience mappings.
 */
export function getMappedVerticals() {
  return Object.keys(VERTICAL_EXPERIENCE_MAP);
}

/**
 * Get the default preset name for a vertical.
 */
export function getDefaultPresetForVertical(vertical) {
  return VERTICAL_EXPERIENCE_MAP[vertical]?.defaultPreset ?? 'professional';
}

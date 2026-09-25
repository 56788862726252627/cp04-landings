// UX Copy Resolver — ADV-07

export const UX_COPY_TONE = Object.freeze({
  WARM_PROFESSIONAL:  'WARM_PROFESSIONAL',
  FORMAL_PRECISE:     'FORMAL_PRECISE',
  ASPIRATIONAL:       'ASPIRATIONAL',
  ENERGETIC:          'ENERGETIC',
  ENCOURAGING:        'ENCOURAGING',
  CLINICAL:           'CLINICAL',
  PROFESSIONAL:       'PROFESSIONAL',
});

const COPY_TEMPLATES = Object.freeze({
  [UX_COPY_TONE.WARM_PROFESSIONAL]: {
    saveButton:    'Guardar',
    deleteButton:  'Eliminar',
    cancelButton:  'Cancelar',
    emptyList:     'Aún no hay registros. ¡Comienza añadiendo el primero!',
    errorGeneric:  'Algo no ha ido bien. Por favor, inténtalo de nuevo.',
    successSave:   'Guardado correctamente.',
    loadingData:   'Cargando...',
    searchPlaceholder: 'Buscar...',
    confirmDelete: '¿Eliminar este registro? Esta acción no se puede deshacer.',
  },
  [UX_COPY_TONE.FORMAL_PRECISE]: {
    saveButton:    'Confirmar',
    deleteButton:  'Eliminar registro',
    cancelButton:  'Cancelar operación',
    emptyList:     'No se encontraron registros.',
    errorGeneric:  'Se ha producido un error. Inténtelo de nuevo.',
    successSave:   'Registro guardado.',
    loadingData:   'Cargando datos...',
    searchPlaceholder: 'Buscar expediente o cliente...',
    confirmDelete: 'Confirme la eliminación del registro. Esta operación es irreversible.',
  },
  [UX_COPY_TONE.ASPIRATIONAL]: {
    saveButton:    'Guardar',
    deleteButton:  'Eliminar',
    cancelButton:  'Volver',
    emptyList:     'Empieza a construir tu experiencia.',
    errorGeneric:  'Algo ha fallado. Vuelve a intentarlo.',
    successSave:   'Perfecto.',
    loadingData:   'Un momento...',
    searchPlaceholder: 'Buscar...',
    confirmDelete: '¿Seguro que quieres eliminarlo?',
  },
  [UX_COPY_TONE.ENCOURAGING]: {
    saveButton:    'Guardar',
    deleteButton:  'Borrar',
    cancelButton:  'Cancelar',
    emptyList:     '¡Aquí empezará toda la acción! Añade tu primer elemento.',
    errorGeneric:  'Ups, algo falló. No te preocupes, inténtalo de nuevo.',
    successSave:   '¡Listo! Todo guardado.',
    loadingData:   'Preparando...',
    searchPlaceholder: '¿Qué buscas?',
    confirmDelete: '¿Seguro que quieres borrarlo?',
  },
  [UX_COPY_TONE.PROFESSIONAL]: {
    saveButton:    'Guardar',
    deleteButton:  'Eliminar',
    cancelButton:  'Cancelar',
    emptyList:     'No hay datos disponibles.',
    errorGeneric:  'Error. Por favor, inténtalo de nuevo.',
    successSave:   'Guardado.',
    loadingData:   'Cargando...',
    searchPlaceholder: 'Buscar...',
    confirmDelete: '¿Confirmar eliminación?',
  },
});

export function resolveUXCopy(tone = UX_COPY_TONE.PROFESSIONAL, overrides = {}) {
  const base = COPY_TEMPLATES[tone] ?? COPY_TEMPLATES[UX_COPY_TONE.PROFESSIONAL];
  return Object.freeze({ ...base, ...overrides, tone, noTechJargon: true, isReal: false });
}

export function evaluateCopyQuality(copy = {}) {
  const techJargon = ['undefined', 'null', 'NaN', '404', '500', 'Error:', 'Exception'];
  const found = techJargon.filter(j =>
    Object.values(copy).some(v => typeof v === 'string' && v.includes(j))
  );
  return Object.freeze({ valid: found.length === 0, techJargonFound: found, isReal: false });
}

export const UX_COPY_RESOLVER_VERSION = '1.0.0';

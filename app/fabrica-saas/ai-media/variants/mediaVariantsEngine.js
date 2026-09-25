// Media Variants Engine — ADV-13

export const VARIANT_DIMENSION = Object.freeze({
  HOOK:     'HOOK',
  CTA:      'CTA',
  DURATION: 'DURATION',
  CHANNEL:  'CHANNEL',
  TONE:     'TONE',
  VISUAL:   'VISUAL',
});

export function generateMediaVariants(baseProject, dimensions = []) {
  if (!baseProject) throw new Error('generateMediaVariants requires baseProject');
  const variants = dimensions.map((dim, i) => {
    const suffix = `_variant_${dim}_${i + 1}`;
    return Object.freeze({
      id:              `${baseProject.id}${suffix}`,
      baseProjectId:   baseProject.id,
      dimension:       dim,
      variantIndex:    i + 1,
      clientId:        baseProject.clientId,
      businessId:      baseProject.businessId,
      isReal: false,
    });
  });
  return Object.freeze(variants);
}

export const MEDIA_VARIANTS_ENGINE_VERSION = '1.0.0';

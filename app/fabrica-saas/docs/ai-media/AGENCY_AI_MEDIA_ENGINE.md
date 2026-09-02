# AI Media Engine V1 — Resumen del Sistema (ADV-13)

## Qué es
Motor de generación de contenido audiovisual con avatar IA, voz sintética y vídeo compuesto.
Alcance: agencia / SaaS. Todos los outputs son simulados (`isReal: false`).

## Módulos principales
- **core/**: Proyecto, objetivo, avatar, consentimiento, voz, perfiles de voz en español
- **script/**: Motor de script (HOOK/VALUE/PROOF/CTA), política de claims, longitud
- **channel/**: Perfil de canal (11 canales), formato, safe-area
- **visual/**: Storyboard, estilo visual (11 estilos), brand bridge
- **providers/**: Avatar, TTS, LipSync, composición de vídeo
- **routing/**: Derechos, coste, estimación, router de proveedores, aprobación humana
- **social/**: Plan de publicación (NO_REAL), calendario, manifiesto de automatización
- **variants/**: Motor de variantes (6 dimensiones), experimentos A/B
- **captions/**: Engine de captions (5 tipos), plan de subtítulos (SRT/VTT/BURNED_IN)
- **quality/**: 8 evaluadores (hook, CTA, script, voz, lipsync, avatar, score, gate)
- **accessibility/**: Política WCAG AA, perfil de rendimiento
- **bridges/**: 6 bridges (ADV-01/03/07/10/11/12)
- **privacy/**: Privacidad, retención, provenance, disclosure
- **output/**: Paquete de salida, plan de miniaturas
- **fixtures/**: 6 negocios, 7 proyectos, 7 good fixtures, 13 failure fixtures

## Restricciones de producción
```
FACTORY_AGENCY_SCOPE_ONLY=SI
NO_REAL_SOCIAL_PUBLISH=SI
NO_REAL_AD_SPEND=SI
NO_REAL_EXTERNAL_COST=SI
NO_REAL_PERSONAL_MEDIA=SI
```

## Versión de registro
`REGISTRY_VERSION=3.7.0`

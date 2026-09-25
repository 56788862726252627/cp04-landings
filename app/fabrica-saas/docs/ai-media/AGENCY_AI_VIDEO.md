# Generación de Vídeo IA (ADV-13)

## Pipeline de generación
1. Script (HOOK → VALUE → PROOF → CTA)
2. Storyboard (escenas con duración, avatarAction, voiceLine, overlay)
3. TTS → AudioManifest
4. AvatarProvider → VideoManifest
5. LipSync → SyncedVideo
6. Composición (10 capas: background/avatar/broll/brand/captions/headline/CTA/music/transition/end_card)

## Proveedores
| Proveedor | Estado |
|-----------|--------|
| FixtureAvatarProvider | FIXTURE_ONLY — seguro para tests |
| LocalAvatarProviderFoundation | CONFIG_REQUIRED |
| ExternalAvatarProviderFoundation | CONFIG_REQUIRED |
| FixtureLipSyncProvider | FIXTURE_ONLY — seguro para tests |

## Canales soportados (11)
TIKTOK / INSTAGRAM_REEL / INSTAGRAM_STORY / FACEBOOK / YOUTUBE_SHORT / YOUTUBE / LINKEDIN / X / LANDING / EMAIL_EMBED / INTERNAL

## Restricción: NO_REAL_SOCIAL_PUBLISH=SI
Ningún plan de publicación genera llamadas reales a APIs sociales.

# Adaptadores de Plataforma — ADV-14

## Plataformas soportadas (7)
| Canal | Adaptador | Ratio | Max chars |
|-------|-----------|-------|-----------|
| Instagram Reel | adaptForInstagramReel | 9:16 | 2200 |
| Instagram Story | adaptForInstagramStory | 9:16 | 150 |
| Facebook | adaptForFacebook | 1.91:1 | 480 (recomendado) |
| TikTok | adaptForTikTok | 9:16 | 2200 |
| YouTube Short | adaptForYouTubeShort | 9:16 | 60s |
| LinkedIn | adaptForLinkedIn | — | 1300 (recomendado) |
| X (Twitter) | adaptForX | 16:9 | 280 |
| Threads | adaptForThreads | — | 500 |

## resolveSocialMediaType()
Mapea canal + pillar → formato recomendado (TEXT/IMAGE/CAROUSEL/SHORT_VIDEO/LONG_VIDEO/STORY/THREAD)

## repurposeContent()
Adapta un post a múltiples canales en una sola llamada.

## evaluateChannelDifferentiation()
Detecta copia idéntica en múltiples plataformas → penalización de score.

## Norma
`noRealPublish: true` siempre en todos los adaptadores.

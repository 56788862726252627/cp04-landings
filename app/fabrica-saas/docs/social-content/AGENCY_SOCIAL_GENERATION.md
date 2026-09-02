# Generación de Contenido Social — ADV-14

## Hook Engine (9 tipos)
| Tipo | Plantilla |
|------|-----------|
| QUESTION | ¿Sabías que {{topic}}? |
| PROBLEM | ¿Te pasa que {{topic}}? |
| BENEFIT | Consigue {{topic}} más rápido. |
| CURIOSITY | Lo que nadie te cuenta sobre {{topic}}. |
| MYTH | Mito o realidad: "{{topic}}". |
| LOCAL | En {{locality}}, {{topic}} es posible. |
| HOW_TO | Cómo {{topic}} en 3 pasos. |
| CONTRAST | Antes: {{problem}}. Ahora: {{solution}}. |
| STORY | Hoy quiero contarte cómo {{topic}} cambió todo. |

## CTA Engine (10 tipos)
BOOK, CONTACT, LEARN, COMMENT, SAVE, SHARE, VISIT, DISCOVER, DM_FUTURE, NONE

## Estilos de copy (10)
CONVERSATIONAL, PROFESSIONAL, EDUCATIONAL, MOTIVATIONAL, PLAYFUL,
STORYTELLING, DIRECT, EMPATHETIC, LOCAL_PRIDE, EXPERT

## generateSocialPost()
Ensambla: hook + body + CTA + hashtags → fullText completo
`noRealPublish: true` siempre en el resultado.

## Hashtag Strategy
Límites por canal: Instagram 30, TikTok 6, X 2, LinkedIn 5
Formato: hashtag local + sector + custom

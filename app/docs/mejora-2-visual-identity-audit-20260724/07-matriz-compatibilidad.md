# 07 — Matriz de compatibilidad

| Plataforma | Icono/favicon | PWA | Fondos (WebP) | Contraste barra lateral | Validado físicamente |
|---|---|---|---|---|---|
| **Android** (Chrome/WebView) | ✅ maskable 192/512 | ✅ instalación confirmada | ✅ WebP soportado | ✅ corregido | ✅ Sí (Mejora 1) |
| **iOS** (Safari) | ✅ apple-touch-icon 180/152 | ⚠️ generado, no probado en dispositivo | ✅ WebP soportado (iOS 14+) | ✅ corregido (código) | ❌ No — pendiente |
| **Escritorio** (Chrome/Firefox/Edge) | ✅ favicon.ico + PNG | ✅ instalable | ✅ WebP soportado | ✅ corregido (código) | ❌ No verificado visualmente en esta sesión |
| **Tablet** (el dispositivo real de validación del usuario) | ✅ | ✅ | ✅ | ✅ corregido (código) | ⏳ Pendiente — ver doc. 08 |

## Notas de compatibilidad

- `image-set()` (usado en la optimización de fondos, doc. 04): soportado en Chrome/Edge/Safari/Firefox modernos (Firefox desde la v88, con prefijo `-webkit-` histórico ya no necesario en versiones actuales) — en navegadores muy antiguos sin soporte, cae de forma segura al PNG (ver doc. 04, mecanismo de descarte de declaración completa).
- Iconos `maskable`: soportados en Android/Chrome; iOS ignora `purpose: "maskable"` y usa `apple-touch-icon` en su lugar — por eso ambos se mantienen en el manifest y en `index.html` simultáneamente.
- Ningún cambio de esta mejora introduce una dependencia nueva ni una llamada de red externa.

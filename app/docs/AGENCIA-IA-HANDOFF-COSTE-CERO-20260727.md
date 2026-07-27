# Handoff documental — Agencia de IA (coste cero)

**No se implementa nada de este documento en este prompt.** Es únicamente el punto de enlace documental hacia una futura fase de desarrollo de la "Agencia de IA" (el negocio de servicios que replica el stack de Club Pádel 04 para otros sectores), tal como pide explícitamente la FASE 14 del Prompt 9. Ningún adaptador, conector o dependencia se ha añadido al repositorio.

## Condición permanente

Todo lo que se describa aquí, cuando se implemente en una fase futura, debe cumplir:

- Coste operativo autorizado: **0 €**.
- Ningún plan de pago activado por defecto.
- Todo conector con modalidad de pago obligatoria (sin tier gratuito real) queda **deshabilitado por defecto** hasta que exista una decisión de negocio explícita de asumir ese coste.
- Variables de configuración en `.env.example`, nunca credenciales reales en el repositorio.
- Mocks y tests para cada adaptador antes de conectar credenciales reales — mismo patrón ya usado en esta app para Stripe/WhatsApp/Airtable (adaptadores aislados, `NOT_CONFIGURED` por defecto).
- Fallback gratuito documentado explícitamente cuando exista, y ausencia de fallback documentada honestamente cuando no exista.

## Las 15 herramientas/capacidades requeridas

| # | Herramienta | Rol previsto | Modalidad gratuita | Clasificación coste-cero | Notas |
|---|---|---|---|---|---|
| 1 | ChatGPT | Generación de contenido/investigación de apoyo | Sí (tier free con límites) | Viable en free | Sin API key en este repo; uso vía interfaz web si se necesita, no integrado en código |
| 2 | Claude | Motor principal de esta propia agencia (ya en uso: esta sesión) | Vía Claude Code / suscripción ya existente | Ya operativo | No requiere nueva integración — es la herramienta que ejecuta este mismo trabajo |
| 3 | Gemini | Alternativa/contraste de modelo para tareas puntuales | Sí (tier free con límites) | Viable en free | Sin integración en código; uso puntual vía interfaz si se decide |
| 4 | NotebookLM | Síntesis de documentación extensa (p. ej. este propio cierre) | Sí (gratuito hoy) | Viable en free | Uso manual, sin API en este repo |
| 5 | ElevenLabs | Voz sintética para materiales de marketing/demo | Tier free muy limitado | Viable solo para pruebas puntuales | Coste real si el volumen crece — vigilar |
| 6 | Claude Code | Desarrollo asistido (herramienta usada en toda la Mejora 2) | Ya operativo | Ya operativo | Sin cambios necesarios |
| 7 | Replit | Hosting/entornos de prueba rápidos para demos de clientes potenciales | Tier free con límites de cómputo/inactividad | Viable para demos, no para producción | No sustituye al hosting real de producción |
| 8 | ManyChat | Automatización de mensajería (equivalente/complemento a WhatsApp Bot ya diseñado) | Tier free muy limitado (contactos) | Viable solo a escala mínima | Solapa con el adaptador WhatsApp ya diseñado (`payments-messaging-adapters`) — evaluar cuál usar antes de duplicar esfuerzo |
| 9 | MCP tools | Conectores de este propio Claude Code (Airtable, Figma, Gmail, Calendar, Drive, Make, etc., ya listados en el sistema) | Ya disponibles en esta sesión | Ya operativo | Usar los ya expuestos en vez de reconstruir adaptadores propios cuando el MCP ya cubre el caso |
| 10 | Codex | Alternativa de asistente de código | Depende del plan | A evaluar | No usado en este trabajo — Claude Code ya cubre el rol |
| 11 | Stripe | Cobros a clientes de la agencia | Modo test gratuito; comisión por transacción en real | Viable en test, coste real en producción | Adaptador aislado ya construido (`stripeAdapter.js`, 56 tests) — reutilizable, bloquea claves `sk_live_` por diseño |
| 12 | Metricool | Analítica/gestión de redes sociales de la agencia | Tier free limitado | Viable a escala mínima | Sin integración en este repo |
| 13 | Clay | Enriquecimiento de datos de prospección comercial | Sin tier gratuito real de producción | **Bloqueada por coste** hasta decisión explícita | No activar sin autorización de gasto |
| 14 | Apify | Scraping/automatización de recolección de datos públicos | Tier free con créditos limitados | Viable a escala mínima; **scraping explícitamente fuera de alcance de los prompts de este bloque** | Cualquier uso real requiere revisar términos de servicio del sitio objetivo antes de activar |
| 15 | Supabase | Backend/auth para clientes futuros de la agencia (mismo patrón que Club Pádel 04) | Sí (plan free) | Viable en free | Ya integrado como patrón reutilizable (`authService.js`, `authorization.js`) — replicable por tenant |

## Arquitectura prevista (sin implementar)

Siguiendo el mismo patrón ya validado en esta app para Stripe/WhatsApp (`src/saas-core/commercial/`, `src/saas-core/nl-builder/`) y en las auditorías previas de "agencia comercial" (ver memoria de sesión: `agency-commercial-system`, `agency-growth-marketing-system`, `unit-economics`): cada herramienta de pago (Clay, ElevenLabs a escala, ManyChat a escala) debe entrar como un **adaptador aislado** con:

1. Contrato/interfaz explícito (qué entrada, qué salida).
2. Mock local con fixtures para tests sin llamar al servicio real.
3. Variable de entorno documentada en `.env.example` (nunca la clave real en el repo).
4. Modo degradado: si la variable no está configurada, el adaptador responde `NOT_CONFIGURED` de forma explícita, nunca simula éxito.
5. Tests que cubran tanto el modo mock como el modo `NOT_CONFIGURED`.

## Próximo paso exacto (cuando se autorice)

No definido en este documento — corresponde a un prompt futuro dedicado, no a este cierre técnico. Este documento es solo el punto de enlace.

# Paso 10 · Fase 13 — Puntos de extensión para pasos posteriores

Código: `app/src/saas-core/factory/extensionPoints.js`. Tests:
`extensionPoints.test.mjs` (6 tests). Mismo patrón que
`adapters/providerAdapters.js` de Paso 09: interfaz + mock ejecutable +
estado explícito, sin ninguna llamada de red.

## Los 19 puntos registrados

| id | Categoría | Credenciales necesarias |
|---|---|---|
| `publicResearch` | research | — |
| `googleMaps` | integration | `GOOGLE_MAPS_API_KEY` |
| `websiteAudit` | research | — |
| `customerDataImport` | data | — |
| `commercialDiagnosis` | advisory | — |
| `automationRecommendations` | advisory | — |
| `advancedBrandingGeneration` | creative | — |
| `imageGeneration` | creative | `IMAGE_GENERATION_API_KEY` |
| `pdfBeforeAfterGeneration` | reporting | — |
| `mockupCapture` | tooling | — (requiere Playwright u otra herramienta local) |
| `deployment` | ops | — |
| `make` | provider | `MAKE_WEBHOOK_URL` |
| `airtable` | provider | `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` |
| `supabase` | provider | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `stripe` | provider | `STRIPE_SECRET_KEY` |
| `whatsappBusiness` | provider | `WHATSAPP_BUSINESS_TOKEN` |
| `gmail` | provider | `GMAIL_OAUTH_CLIENT_ID` |
| `googleCalendar` | provider | `GOOGLE_CALENDAR_CLIENT_ID` |
| `analytics` | provider | `ANALYTICS_WRITE_KEY` |

Todos con `status: "not_implemented"` (verificado en test — ninguno puede
"colarse" como implementado sin cambiar el test). Los 8 puntos `provider`
usan literalmente los mismos nombres de método que sus contrapartes en
`adapters/providerAdapters.js` (p. ej. `stripe.createPaymentIntent`) para
que conectar uno real, en un paso futuro, sea sustituir la implementación
detrás del mismo contrato — no rediseñar la interfaz.

## Mock ejecutable

`getExtensionPointWithMock(id)` añade una implementación donde cada método
del contrato resuelve, de forma asíncrona y determinista, a
`{status: "not_implemented", extensionPointId, method, message}` — útil
para que `business:doctor` (o un test) pueda "invocar" el contrato sin
fingir que hay integración real ni hacer I/O.

## Seguridad

Ningún punto de extensión almacena una credencial: `credentialsNeeded` es
siempre una lista de **nombres** de variable de entorno (verificado en
test, mismo patrón `SECRET_LOOKALIKE` que el resto del núcleo).

## Contrato de conversión lenguaje natural → Business Blueprint

`app/src/saas-core/factory/nlToBlueprintContract.js` (Fase 15) es un punto
de extensión adicional, documentado aparte por su naturaleza (no es un
proveedor externo sino el futuro reemplazo de la extracción por palabras
clave por un LLM real): `draftBlueprintFromInstruction(instruction)` usa
coincidencia de palabras clave (sector/ciudad/número de profesionales/
features), nunca comprensión de lenguaje natural real
(`isRealLanguageUnderstanding: false` siempre). Ver
`10-guia-rapida-15-min.md` para el ejemplo completo pedido en la Fase 15.

# 05 — CLI, factory, limitaciones y proceso de producción

## Los 9 comandos

| Comando | Qué hace |
|---|---|
| `commercial:assess` | Construye y muestra un `CommercialAssessment` |
| `commercial:roi` | Calcula los 3 escenarios ROI |
| `commercial:proposal` | Genera la propuesta comercial (JSON/Markdown/HTML) |
| `commercial:preview` | Genera 1..21 previews de dispositivo (`--view`/`--device`, `all` por defecto) |
| `commercial:integrations` | Estado de las 10 integraciones |
| `commercial:readiness` | Resumen combinado integraciones+sandbox ("doctor" comercial) |
| `factory:package` | `DeliverableGenerator`: bundle completo + 21 previews en un directorio |
| `factory:preview` | Atajo: siempre las 21 combinaciones, a un `--output-dir` |
| `factory:proposal` | Atajo: propuesta lista para cliente, HTML por defecto |

Opciones comunes: `--profile`, `--input=<ruta.json>`, `--scenario`,
`--format=json|markdown|html`, `--output`/`--output-dir`,
`--device=mobile|tablet|desktop|all`, `--mock-integrations`,
`--dry-run`, `--strict` (solo `commercial:readiness`).

## `--dry-run` — garantía verificada

Todos los comandos que escriben en disco (`commercial:preview`,
`factory:package`, `factory:preview`) soportan `--dry-run`: calculan
todo el pipeline pero informan cuántos archivos se generarían **sin
escribir ni un byte** — probado manualmente en la Fase 9/11 de este
paso. Ningún comando de este paso realiza NUNCA una petición de red
(verificado por test: `commercialPipeline.e2e.test.mjs`, escenario 24).

## `--mock-integrations`

Simula credenciales de TEST (`sk_test_mock_cli_preview`,
`mock_cli_preview_token`) únicamente para que el panel/CLI muestre el
estado `SANDBOX` en vez de `NOT_CONFIGURED` al generar una demo — estas
credenciales de mentira nunca llegan a `fetch` porque
`commercial-preview.mjs`/`factory-package.mjs` usan
`commercialSandbox.js` (que no importa `fetch`), no
`stripeAdapter.js`/`whatsappAdapter.js` directamente.

## `factory:*` vs `commercial:*`

`factory:package/preview/proposal` son atajos de conveniencia: generan
"todo de una vez" (el `CommercialPackage` completo, las 21 previews, o
la propuesta lista para cliente) sin tener que encadenar varios
comandos `commercial:*` — reutilizan exactamente las mismas funciones,
sin lógica duplicada.

## Limitaciones explícitas de este paso

- El motor ROI usa supuestos sectoriales declarados, no datos de
  mercado verificados — cada supuesto está marcado como tal.
- La propuesta comercial no sustituye una revisión humana antes de
  enviarse a un cliente real (`pendingInformation` señala qué revisar).
- Los mockups son HTML/CSS estático — no hay interactividad real (no se
  ha construido React ni ningún framework de UI en este paso, por
  decisión de alcance: "prioriza componentes reales o previews HTML/CSS
  reutilizables", "no instales herramientas pesadas si no son
  necesarias").
- La vista de PWA es una declaración de compatibilidad, no una PWA
  instalable (sin manifest/Service Worker).
- Ninguna integración real (Airtable/Make/Stripe/WhatsApp/dominio) se ha
  probado con datos reales en este paso.

## Proceso de producción (cuándo y en qué orden, según la secuencia confirmada por el usuario)

1. Completar Pasos 20 y 21 y toda mejora posible desde terminal (este
   paso cumple su parte).
2. Esperar la renovación de la cuota gratuita de Airtable.
3. Validar Airtable y los 50 flujos de Make con llamadas reales.
4. Contratar y configurar WhatsApp Business.
5. Configurar Stripe completamente en producción.
6. Comprar el dominio en Hostinger.
7. Desplegar y validar la producción real.

Este paso no adelanta ni se salta ninguno de estos pasos — solo deja
listo el código y la documentación para cuando lleguen.

## Cómo actualizar el PDF vivo

Ver documento 07 (`07-pdf-vivo-fuente-editable.md`) — es la fuente
Markdown editable. Para actualizarlo en el siguiente paso: añadir una
fila nueva a la tabla maestra, actualizar el resumen ejecutivo/
porcentajes/horas restantes, y (opcionalmente) regenerar el PDF real con
Pandoc o "Imprimir a PDF" desde el navegador — ningún paso de este
proceso requiere una herramienta nueva instalada en el repositorio.

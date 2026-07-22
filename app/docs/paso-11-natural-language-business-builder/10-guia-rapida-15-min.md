# 10 — Guía rápida: de una frase a un SaaS generado (< 15 minutos)

## 0. Requisitos

```
cd app
npm install     # solo la primera vez
```

## 1. Describe el negocio en una frase (1 minuto)

```
npm run business:interpret -- --prompt="Crea un SaaS para una clínica de fisioterapia de Málaga con reservas, expedientes de pacientes, recordatorios, bonos, facturación, panel de administración, landing premium, PWA y automatizaciones de captación y seguimiento." --seed=mi-negocio-001 --format=summary
```

Salida (ejemplo real, ver 07 para la traza completa):

```
Clínica De Fisioterapia Málaga (borrador) — sector: physiotherapy
Ubicación: Málaga (ES)
Confianza global: 0.75 (alta)
Módulos habilitados: 17 · Ambigüedades: 0 (0 bloqueante(s)) · Preguntas recomendadas: 1
```

## 2. Revisa preguntas y ambigüedades antes de generar (2 minutos)

```
npm run business:interpret -- --prompt="..." --seed=mi-negocio-001 --output=./intent.json
npm run business:ask -- --intent=./intent.json
```

Si hay preguntas importantes, respóndelas de forma no interactiva:

```json
// answers.json
{ "business.locations": "Málaga, ES" }
```

```
npm run business:interpret -- --prompt="..." --seed=mi-negocio-001 --answers=./answers.json --output=./intent.json
```

## 3. Entiende por qué se eligió cada cosa (2 minutos, opcional)

```
npm run business:explain -- --intent=./intent.json
npm run business:recommend -- --intent=./intent.json
```

## 4. Genera el negocio (5-10 minutos)

Vista previa sin escribir nada:

```
npm run business:from-prompt -- --prompt="..." --seed=mi-negocio-001 --dry-run
```

Generación real (idempotente — puedes repetir el comando sin miedo):

```
npm run business:from-prompt -- --prompt="..." --seed=mi-negocio-001 --execute
```

## 5. Verifica (2 minutos)

```
npm run business:doctor
npm run business:diff -- --business=<businessId-mostrado-en-el-paso-anterior>
```

## Ejemplo de instrucción natural → Business Blueprint (contrato, sin LLM externo)

Instrucción de ejemplo del enunciado del Paso 11:

> "Crear una solución SaaS para una clínica dental de Málaga, con tres odontólogos,
> agenda, pacientes, recordatorios, formularios, landing page, PWA y branding premium."

Traducción real hoy (modo determinista, Capa A; salida real de
`business:interpret --prompt="..." --format=json`, no un ejemplo inventado):

```json
{
  "business": { "proposedName": "Clínica Dental Málaga (borrador)", "sector": "dental",
                "locations": [{ "city": "Málaga", "country": "ES" }] },
  "modules": [
    { "id": "clientes", "source": "explicit", "status": "enabled" },
    { "id": "citas", "source": "explicit", "status": "enabled" },
    { "id": "profesionales", "source": "explicit", "status": "enabled" },
    { "id": "recordatorios", "source": "explicit", "status": "enabled" },
    { "id": "formularios", "source": "explicit", "status": "enabled" },
    { "id": "landing", "source": "explicit", "status": "enabled" },
    { "id": "pwa", "source": "explicit", "status": "enabled" }
  ],
  "assumptions": [],
  "ambiguities": [],
  "recommendedQuestions": [],
  "confidence": { "overall": 0.75, "bySection": { "sector": 0.81, "modules": 0.75, "branding": 0.65 } }
}
```

Nota honesta: "tres odontólogos" **no se traduce hoy a tres fichas de profesional con
nombre** — el sistema solo reconoce que un número de profesionales fue mencionado
(por eso no aparece ninguna pregunta recomendada al respecto: el patrón de detección
lo considera "ya respondido" en el texto) y activa el módulo `profesionales`, pero no
extrae el valor `3` a ningún campo estructurado ni genera automáticamente tres
registros de personal. Esto es intencional: el modo determinista nunca inventa datos
que no puede verificar. El contrato de la Capa B (`aiProviderContract.js`, ver 03) deja
preparado el punto exacto donde un modelo de lenguaje real podría, en un paso futuro,
extraer ese detalle con mayor precisión — sin cambiar nada de lo que ya funciona sin él.

## Limitaciones honestas

- El intérprete es heurístico (keywords/regex), no comprensión de lenguaje natural real.
- No conecta ningún proveedor de IA, Airtable, Stripe, WhatsApp, Maps, Gmail, Calendar,
  Supabase o Make — todo queda en `not_configured`/contrato (ver
  `docs/paso-10-one-prompt-factory/08-puntos-extension-futuro.md`, que sigue siendo la
  referencia; el único punto de extensión añadido en este paso es `aiLanguageProvider`).
- `blueprintToTenantConfig` (Paso 10) no usa todavía `blueprint.roles`/`permissions` del
  compositor de Paso 11 para los sectores con preset/plantilla propios (ver 01):
  el tenant final usa la nomenclatura de rol del preset/plantilla base, no la de
  `roleEngine.js`. El Blueprint en sí sí lleva los roles ricos y pasa su validación.
- No se generan binarios de branding/PWA (favicon, iconos) — contrato ya preparado
  desde Paso 10, sin cambios en este paso.
- Ningún mockup real se captura (Playwright no está instalado en este entorno) — el
  manifest de mockups de Paso 10 se reutiliza tal cual.

## Siguiente paso recomendado

Conectar un proveedor real detrás de `aiProviderContract.js` (Capa B) para mejorar la
extracción de detalles finos (número de profesionales, horarios, nombres de servicios)
que el modo determinista de hoy no puede inferir sin que el usuario los confirme
explícitamente, y decidir si `blueprintToTenantConfig` debe empezar a respetar
`blueprint.roles`/`permissions` cuando vienen informados desde el compositor.

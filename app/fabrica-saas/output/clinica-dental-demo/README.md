# Clínica Dental Demo · Prototipo Fábrica SaaS v1

**Generado por:** Fábrica SaaS · Generador de Prototipos v1  
**Manifiesto:** `fabrica-saas/clients/clinica-dental-demo/manifest.yaml`  
**Vertical:** dental  
**Modo:** DEMO INTERNA — datos ficticios — sin conexiones externas

---

## Cómo abrir la demo localmente

```bash
# Desde el directorio app/
cd /root/cp04-fabrica-saas-prototipos/app
npm install   # solo la primera vez
npm run dev
```

Luego abrir en el navegador:

```
http://localhost:5173/dental-demo.html
```

(La app principal CP04 sigue disponible en `http://localhost:5173/`)

---

## Regenerar la demo

```bash
npm run factory:generate
```

La generación es idempotente: si el manifiesto no ha cambiado, no sobreescribe nada.

---

## Pantallas

| Pantalla         | Ruta de archivo                     | Descripción                                  |
|------------------|-------------------------------------|----------------------------------------------|
| Asistente IA     | `DentalChatbot.jsx`                 | Flujo multi-paso: intención → sede → cita    |
| CRM simulado     | `DentalCrm.jsx`                     | Tabla de leads ficticios con estados         |
| Recuperación     | `DentalRecovery.jsx`                | Secuencias de recuperación simuladas         |
| Dashboard        | `DentalDashboard.jsx`               | Métricas y gráficas ficticias                |

---

## Casos de prueba cubiertos

1. ✅ Implantes/cirugía + financiación — el chatbot muestra opciones de financiación
2. ✅ Primera visita — flujo sin financiación
3. ✅ Consulta fuera de horario — mensaje informativo
4. ✅ Abandono antes de reservar — secuencia de recuperación visible
5. ✅ Consulta clínica sensible — derivación a profesional sin diagnóstico

---

## Arquitectura CORE → VERTICAL → CLIENTE

```
CORE        fabrica-saas/core/
              AppShell.jsx      (layout, banner demo, navegación)
              mockData.js       (funciones base de datos ficticios)

VERTICAL    fabrica-saas/verticals/dental/
              config.js         (intenciones, sedes, seguridad clínica)
              mockData.js       (pacientes, slots, métricas ficticias)

CLIENTE     fabrica-saas/clients/clinica-dental-demo/
              manifest.yaml     (configuración del cliente)

GENERADOR   fabrica-saas/generator/
              schema/           (validación del manifiesto)
              scripts/          (generate.mjs — idempotente)
              tests/            (generator.test.mjs, dental-cases.test.mjs)

OUTPUT      fabrica-saas/output/clinica-dental-demo/
              DentalApp.jsx     (composición principal)
              DentalChatbot.jsx
              DentalCrm.jsx
              DentalRecovery.jsx
              DentalDashboard.jsx
              main.jsx
```

---

## Aviso de seguridad

- **Sin secretos:** 0 credenciales, 0 tokens, 0 webhooks reales en este directorio
- **Sin llamadas externas:** modo_demo=true, integraciones.reales=false
- **Sin datos reales:** todos los pacientes, citas y métricas son ficticios
- **No indexable:** `<meta name="robots" content="noindex, nofollow">`

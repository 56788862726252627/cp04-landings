# Prompt Claude Code · Fábrica SaaS · Generador de Prototipos v1

Usar en una terminal de trabajo dedicada, dentro de `/root/cp04-landings`, sobre una rama aislada basada en `main`.

---

Estás trabajando en el repositorio `/root/cp04-landings` para implementar la **Fábrica SaaS · Generador de Prototipos v1** de Edu.Rodríguez.IA.

## OBJETIVO

Crear la primera versión funcional de un generador interno capaz de producir prototipos SaaS navegables desde un manifiesto YAML, sin depender de Lovable ni de créditos externos de generación.

La arquitectura lógica obligatoria es:

`CORE → VERTICAL → CLIENTE`

El primer caso de aceptación es una demo interna de clínica dental con:

`Asistente IA → CRM simulado → Reservas simuladas → Recuperación de leads → Dashboard`

Todo debe funcionar con datos ficticios/locales. Nada debe contactar sistemas o personas reales.

## REGLAS CRÍTICAS

1. **Primero AUDITA, luego implementa.**
2. Lee antes de tocar nada:
   - `app/.ai-context/PROJECTS/fabrica-saas-prototipos-v1.md`
   - `app/.ai-context/templates/fabrica-saas-manifest.example.yaml`
   - `app/.ai-context/CURRENT_STATE.md`
   - `app/.ai-context/DECISIONS.md`
   - `app/.ai-context/TOOL_REGISTRY.md`
3. Revisa el repo para detectar componentes, hooks, servicios, módulos, rutas, design system, auth, RBAC, chatbot, CRM, reservas, métricas y tests reutilizables.
4. NO modifiques módulos certificados estables de Auth/Omnichannel/CP04 salvo que sea absolutamente necesario y lo justifiques primero.
5. NO borres ni muevas archivos existentes.
6. NO uses credenciales, webhooks, tokens, secretos ni `.env` reales.
7. NO hagas llamadas a email, WhatsApp, SMS, HubSpot, Airtable, Supabase, Calendar, Stripe ni ninguna API externa para la demo dental.
8. NO despliegues a producción.
9. NO hagas commit ni push. Trabaja localmente y entrega diff/evidencia.
10. NO toques cambios locales ajenos.
11. Mantén el alcance aislado de esta tarea.

## FASE 1 · AUDITORÍA READ-ONLY

Antes de editar:

- identifica stack real del repo/app;
- localiza piezas reutilizables;
- identifica conflictos de nombres y rutas;
- propone la estructura física mínima que respete CORE/VERTICAL/CLIENTE sin reestructurar innecesariamente CP04;
- confirma que la solución puede ejecutarse sin servicios externos;
- enumera exactamente los archivos que planeas crear/modificar.

Después de la auditoría, continúa automáticamente si el plan es seguro y no destructivo.

## FASE 2 · GENERADOR V1

Implementa una estructura mínima y mantenible para:

- esquema/validación del manifiesto;
- lectura del manifiesto;
- selección de módulos;
- composición CORE + VERTICAL + CLIENTE;
- generación idempotente;
- modo demo obligatorio para el caso dental;
- comando único de generación.

El comando objetivo debe ser sencillo, por ejemplo:

```bash
npm run factory:generate -- --manifest <ruta-manifest>
```

Si el stack actual recomienda otra forma, puedes adaptarla, pero debe existir **un único comando claro**.

## FASE 3 · CASO DENTAL 001

Genera una app/prototipo aislado con estas pantallas:

1. **Asistente IA**
   - intenciones: primera visita, implantes/cirugía, ortodoncia, estética, urgencia, consulta general;
   - recoge solo datos ficticios mínimos;
   - sede y franja horaria;
   - financiación ficticia cuando proceda;
   - ante consulta clínica sensible: NO diagnostica, NO prescribe, NO aconseja tratamiento y deriva a profesional;
   - muestra 2–3 huecos de cita simulados.

2. **CRM simulado**
   - lead ficticio;
   - origen;
   - tratamiento;
   - sede;
   - estado;
   - prioridad;
   - siguiente acción;
   - valor estimado marcado explícitamente como ficticio.

3. **Recuperación de leads**
   - visualiza secuencia simulada por pasos;
   - no envía nada realmente;
   - caso de abandono antes de reservar.

4. **Dashboard**
   - consultas;
   - % precalificadas;
   - % con cita;
   - origen;
   - tratamiento;
   - sede;
   - oportunidades recuperadas;
   - todas las métricas ficticias.

Debe existir banner visible:

`DEMO INTERNA · DATOS FICTICIOS · NO ENVIAR · NO CONECTADO A SISTEMAS REALES`

## CASOS DE PRUEBA OBLIGATORIOS

1. Implantes/cirugía + financiación.
2. Primera visita.
3. Consulta fuera de horario.
4. Abandono antes de reservar.
5. Consulta clínica sensible con derivación a profesional.

## UX

- responsive móvil/tablet/desktop;
- aspecto sanitario premium, limpio y moderno;
- no copiar marcas reales;
- navegación completa entre las 4 pantallas;
- demo enseñable en menos de 5 minutos.

## CALIDAD

Ejecuta al final:

- tests relevantes;
- lint si existe;
- build;
- auditoría rápida de secretos y llamadas externas;
- comprobación de que el generador es idempotente ejecutándolo dos veces sobre un destino de prueba cuando sea seguro.

## EVIDENCIA FINAL OBLIGATORIA

Devuelve exactamente:

1. `AUDITORÍA PREVIA: PASS/FAIL`
2. arquitectura física elegida;
3. archivos creados/modificados;
4. comando único de generación;
5. resultado primera generación;
6. resultado segunda generación/idempotencia;
7. tests `X/X`;
8. lint `PASS/FAIL/NO EXISTE`;
9. build `PASS/FAIL`;
10. llamadas externas reales detectadas: `0` o detalle;
11. secretos añadidos: `0` o detalle;
12. módulos del prototipo: estado individual;
13. casos de prueba: estado individual;
14. URL/puerto local de preview si se levanta;
15. riesgos o pendientes reales;
16. porcentaje estimado del **módulo Generador de Prototipos v1** al terminar.

No declares 100% si falta cualquier pantalla, test, build, idempotencia o caso obligatorio.

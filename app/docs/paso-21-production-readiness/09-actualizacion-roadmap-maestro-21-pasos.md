# 09 — Actualización del roadmap maestro vivo (21 pasos) — VERSIÓN FINAL

## Aviso de alcance (léase antes de la tabla)

Igual que en los documentos equivalentes de Pasos 15-20: este
repositorio **no contiene** un archivo único con los 21 pasos oficiales
— el roadmap maestro vive fuera del repo. Esta es la reconstrucción
honesta final desde `git log`, con los 21 pasos completos.

## Tabla completa de los 21 pasos

| # | Paso | Estado | Evidencia |
|---|---|---|---|
| 1 | (no identificado explícitamente en git log) | Presumiblemente base de la app Club Pádel 04 | — |
| 2-8 | Integración App↔Make 50/50 | Hecho | Ver documento equivalente de Paso 15 |
| 9 | Núcleo SaaS replicable multisector | Hecho | `d19f258`, PR #37 |
| 10 | Fábrica SaaS de un solo prompt | Hecho | `c8f3ff0`, PR #38 |
| 11 | Agente constructor de negocios en lenguaje natural | Hecho | `412d604`/`8302780`, PR #39 |
| 12 | Motor de investigación pública y auditoría digital | Hecho | `f59b516`, PR #40 |
| 13 | Proveedor real `publicWebsiteFetcher` + validación E2E | Hecho | `fc57e62`, PR #41 |
| 14 | Arquitectura de fábrica multiproveedor | Hecho | `7e4ce42`, PR #42 |
| 15 | Integración del pipeline multiproveedor con orchestrator/scoring/perfiles | Hecho | `7f4fb84`, PR #43 |
| 16 | SEO Provider real + auditoría multiproveedor (2 fuentes reales) | Hecho | `09d722f`, PR #44 |
| 17 | Accessibility Provider real (3 fuentes reales) | Hecho | `c4629cb`, PR #45 |
| 18 | Performance Provider real (4 fuentes reales) | Hecho | `6194ca8`, PR #46 |
| 19 | Adaptadores aislados Stripe/WhatsApp (sin credenciales) | Hecho | `be10a95`, PR #47 |
| 20 | Generación visual multidispositivo + panel ROI/comercial | Hecho | `26a734f`, PR #48 |
| **21** | **Auditoría de producción + 7 checklists + preparación final** | **Hecho (este paso, último del roadmap de 21)** | Esta rama, PR nuevo |

## Los 21 pasos están completos. Qué significa "completo" aquí

Significa: **todo el desarrollo técnico planificado en el roadmap de 21
pasos está construido, probado y documentado.** No significa que el
producto esté en producción ni que tenga un cliente real — esas dos
cosas dependen explícitamente de:

1. Renovación de cuota de Airtable.
2. Validación de los 50 flujos de Make con llamadas reales.
3. Contratación y configuración de WhatsApp Business.
4. Configuración de Stripe en producción.
5. Compra del dominio en Hostinger.
6. Despliegue y validación de producción real.
7. Además, dos decisiones de seguridad NO bloqueadas por credenciales
   (ver documento 05): migrar la sesión a cookies HttpOnly, y sustituir
   el adaptador de autenticación mock por un proveedor real.

## Porcentajes finales

| | Paso 20 | Paso 21 (final) |
|---|---|---|
| Club Pádel 04 | ~71-74% | **~74-77%** |
| Agencia de IA | ~55-62% | **~58-65%** |

El pequeño incremento en ambos refleja que el roadmap completo de 21
pasos ya está construido y auditado con checklists accionables — no un
salto de funcionalidad nueva (este paso no añadió código).

## Horas restantes estimadas (orden de magnitud, final)

| | Estimación | Base |
|---|---|---|
| Club Pádel 04 hasta MVP comercializable en producción real | **40-70 horas** | Incluye: migrar sesión a cookies HttpOnly (~8-15h), conectar un proveedor de auth real (~10-20h), configurar CI/CD básico (~4-8h), y el resto en validación/ajustes tras conectar Airtable/Make/dominio/despliegue real (~18-27h) |
| Agencia de IA hasta el primer piloto real | **30-55 horas** | Ya no incluye desarrollo de la capa comercial (Paso 20 lo completó) — el tiempo restante es: obtención de credenciales reales (Stripe/WhatsApp, tiempo de terceros no controlable), validación real de los 50 flujos de Make, y el propio proceso comercial con el primer cliente |

No hay un "Paso 22" — el roadmap de 21 pasos queda completo con este
documento. El trabajo restante es de integración/producción, no de
desarrollo de producto nuevo.

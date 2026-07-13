# ONBOARDING NOTES — `<slug-cliente>`

Plantilla de notas operativas de alta. Complementa (no sustituye) `audit/agency-platform-architecture/AGENCY_CLIENT_ONBOARDING_PIPELINE.md`.

## Datos de contexto comercial

| Campo | Valor |
|---|---|
| Vertical | `<padel / deportivo_generico / clinico_* / legal / ... >` (ver `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md` — este campo no existe todavía en `client-config.json` v1, se documenta solo aquí) |
| Plan contratado | `<starter / pro / premium>` (debe coincidir con `plan.name` en `client-config.json`) |
| Fecha de contrato | `<fecha>` |
| Responsable de onboarding | `<nombre>` |

## Checklist de fases (ver Fase 6 de la entrega de este Quick Win para el flujo completo)

- [ ] DISCOVERY completado — necesidades del cliente registradas.
- [ ] PRE-SALE HANDOFF recibido — comercial entrega contexto al equipo técnico.
- [ ] CLIENT PROFILE creado (esta carpeta).
- [ ] CONFIG VALIDATION superada (`client-config.json` válido).
- [ ] BRANDING cerrado.
- [ ] INTEGRATIONS documentadas y coordinadas.
- [ ] QA superado.
- [ ] DEPLOYMENT realizado.
- [ ] GO-LIVE confirmado.
- [ ] CUSTOMER SUCCESS informado del alta.

## Notas libres

`<espacio para incidencias, decisiones o excepciones específicas de este cliente durante el onboarding>`

## Qué NO hacer aquí

- No usar este documento como sustituto de `SECRETS_REFERENCES.md` — ninguna nota debe contener un valor de secreto.
- No registrar aquí datos de facturación/pricing negociado si ese dato es sensible — referenciar el documento comercial correspondiente en vez de copiarlo.

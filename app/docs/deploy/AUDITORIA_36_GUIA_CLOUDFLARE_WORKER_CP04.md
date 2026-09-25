# Club Pádel 04 · Auditoría 36 · Guía Cloudflare Worker sin ejecutar

## Auditoría 36

35%

## Avance real estimado del proyecto completo

89.8%

## Objetivo

Dejar preparada la guía exacta del Worker sin publicar todavía.

## Pasos recomendados en Cloudflare Worker

1. Confirmar nombre final del Worker.
2. Confirmar archivo principal del Worker.
3. Confirmar wrangler.toml.
4. Configurar secrets privados.
5. Configurar ALLOWED_ORIGIN con dominio de Pages.
6. Validar CORS.
7. Probar OPTIONS.
8. Probar POST de reserva en modo demo.
9. Probar errores controlados.
10. Revisar logs.
11. Publicar solo cuando Pages preview funcione.

## Secrets privados recomendados

- ALLOWED_ORIGIN
- RESERVAS_WEBHOOK
- DB_API_KEY
- DB_BASE_ID
- DB_RESERVAS_TABLE
- PAGOS_CLAVE_PRIVADA
- PAGOS_FIRMA_WEBHOOK
- MESSAGING_PROVIDER_TOKEN
- MESSAGING_PHONE_NUMBER_ID
- CALENDAR_CREDENTIALS
- STORAGE_CREDENTIALS
- AUTH_PROVIDER
- AUTH_ISSUER_URL
- AUTH_AUDIENCE

## Reglas

- No exponer secrets en frontend.
- No imprimir secrets en logs.
- No conectar pagos reales todavía.
- No ejecutar cancelaciones reales todavía.
- No activar producción definitiva sin checklist final.

## Estado

Guía preparada sin publicar.

## Riesgo

Bajo.

# Club Pádel 04 · Mapa de acciones demo vs reales

## Auditoría 49

50%

| Acción | En demo | En producción futura |
|---|---|---|
| Reservar pista | Simulada | Real |
| Cancelar reserva | Simulada | Real con validaciones |
| Reprogramar reserva | Simulada | Real con validaciones |
| Alta de jugador | Simulada | Real |
| Enviar email | Simulado o controlado | Real |
| Enviar WhatsApp | Simulado | Real si WhatsApp Business activo |
| Pago Stripe | Desactivado | Real cuando Stripe esté auditado |
| Panel admin | Datos ficticios | Datos reales del club |
| Métricas | Simuladas | Reales |
| Torneos | Demo | Reales |
| Ranking | Demo | Real |
| Logs | Demo | Reales |
| Soporte | Demo | Real |
| Dominio | No conectado | app.clubpadel04.com futuro |
| DNS | No tocar | Solo manual auditado |
| Make | No exponer | Webhooks reales separados |
| Airtable | No exponer | Base real separada o tablas por club |
| Terminal | No mostrar | Solo soporte interno |

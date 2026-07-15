# MATRIZ DE REUTILIZACIÓN · Club Pádel 04 a Veterinaria

## Objetivo

Definir qué partes de Club Pádel 04 pueden reutilizarse, adaptarse o deben evitarse al crear un SaaS para veterinaria.

## Reutilizar directamente

| Elemento Club Pádel 04 | Uso en Veterinaria |
|---|---|
| Login | Acceso cliente/veterinario/admin |
| Perfil | Perfil cliente |
| Sidebar | Navegación principal |
| Dashboard | Panel de clínica |
| Reservas | Citas |
| Admin | Gestión del centro |
| Soporte | Soporte técnico |
| Emails | Confirmaciones y recordatorios |
| Automatizaciones | Citas, altas, avisos |
| Checklists | Adaptación y entrega |
| Documentación comercial | Base de propuesta |
| Roles | Cliente, profesional, admin, soporte |

## Adaptar

| Elemento actual | Adaptación |
|---|---|
| Jugador | Cliente / propietario |
| Perfil jugador | Cliente + mascota |
| Pista | Consulta / sala / veterinario |
| Reserva | Cita veterinaria |
| Torneo | Campaña preventiva / revisión |
| Ranking | Historial / seguimiento |
| Ocupación por pista | Ocupación de agenda |
| Socios activos | Clientes y mascotas activas |
| Club deportivo | Clínica veterinaria |
| Staff deportivo | Veterinario / recepción |
| Tarifa pista | Precio servicio veterinario |

## Crear solo si falta

| Elemento | Crear solo si... |
|---|---|
| Módulo mascotas | Siempre que se adapte a veterinaria |
| Módulo vacunas | La clínica quiere recordatorios preventivos |
| Módulo revisiones | La clínica quiere campañas recurrentes |
| Módulo campañas | Se busca captación/fidelización |
| Módulo reseñas | Se quiere captar opiniones |
| Agente IA | Solo administrativo/informativo, nunca diagnóstico |

## No hacer todavía

- No duplicar App.jsx.
- No duplicar App.css.
- No crear una app nueva.
- No tocar automatizaciones reales.
- No tocar Airtable real.
- No tratar datos clínicos reales.
- No prometer diagnóstico veterinario con IA.
- No prometer recomendaciones médicas automáticas.
- No adaptar código hasta cerrar la documentación conceptual.

## Conclusión

La adaptación a veterinaria es viable porque la reserva se convierte en cita, el jugador se separa en cliente + mascota y las automatizaciones se orientan a recordatorios, revisiones y vacunas.

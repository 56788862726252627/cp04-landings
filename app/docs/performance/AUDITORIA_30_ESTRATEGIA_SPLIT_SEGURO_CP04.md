# Club Pádel 04 · Auditoría 30 · Estrategia de code splitting seguro

## Objetivo

Reducir el bundle JS principal sin romper diseño ni funcionalidad.

## Orden recomendado de separación

1. Datos estáticos y catálogos.
2. Traducciones / textos i18n.
3. Componentes visuales grandes no críticos.
4. Centro técnico.
5. Perfil y ajustes.
6. Ranking.
7. Torneos.
8. Admin.
9. Reserva y flujos críticos, solo al final.

## Regla principal

No separar primero la lógica crítica de reservas, auth, Make, Worker o disponibilidad.

## Primer candidato seguro

Extraer datos estáticos y constantes a un archivo separado dentro de:

src/data/

## Segundo candidato seguro

Extraer helpers puros a:

src/utils/

## Riesgo

Bajo si se empieza por constantes y datos estáticos.
Medio si se separan vistas grandes.
Alto si se toca reserva, auth o integración backend sin pruebas E2E.

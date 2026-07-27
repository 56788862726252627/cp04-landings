# 08 — Checklist de validación humana (tablet)

Ninguno de estos puntos se ha marcado como validado sin tu confirmación
visual explícita.

## Contraste corregido (lo más importante de esta mejora)

- [ ] Abrir la barra lateral y comprobar que el módulo **activo** (el
      que estás viendo ahora mismo) muestra el texto en **oscuro**
      sobre el fondo lima/menta — no en blanco casi invisible.
- [ ] Pasar el cursor/dedo sobre otros ítems de la barra lateral y
      confirmar que el texto sigue siendo legible en todos los estados.

## Fondos optimizados (deberían verse igual, solo cargar más rápido)

- [ ] Confirmar que el fondo de la pantalla de login (Torcal) se ve
      exactamente igual que antes.
- [ ] Confirmar que los fondos de los módulos internos (admin,
      reservas, general) se ven exactamente igual que antes.
- [ ] (Opcional, si sabes revisar la pestaña "Red" del navegador)
      confirmar que se descarga un archivo `.webp` en vez del `.png`
      pesado para estos fondos.

## General (sin relación directa con esta mejora, pero pedido en el checklist)

- [ ] Comprobar en móvil que no hay desbordamiento horizontal en
      ninguna pantalla habitual (reservas, torneos, ranking, admin).
- [ ] Comprobar en tablet la misma ausencia de desbordamiento.
- [ ] Comprobar en escritorio (si tienes acceso) el mismo punto.
- [ ] Confirmar que el icono oficial (Mejora 1) se sigue viendo
      correctamente tras este cambio (no debería haberse tocado).

## Pendiente explícito, no validable desde este entorno

- [ ] Validación física en un dispositivo **iOS** real (iPhone/iPad) —
      no se ha podido comprobar en esta sesión.
- [ ] Confirmación visual de que el botón "Perfil" y el selector de
      idioma en la pantalla de login **no** muestran el mismo problema
      de contraste (aplazado, ver doc. 04) — si SÍ lo muestran, es la
      prueba de que la Fase 3 identificó correctamente que ese caso
      queda pendiente de una corrección dedicada futura.

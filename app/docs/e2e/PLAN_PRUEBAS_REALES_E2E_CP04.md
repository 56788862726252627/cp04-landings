# Club Pádel 04 · Auditoría 24 · Plan de pruebas reales E2E por fases

## Objetivo

Definir el orden correcto de pruebas antes de producción comercial real.

---

## Fase 1 · Pruebas locales sin credenciales reales

Estado esperado:

- Frontend carga en localhost.
- Worker puede responder en modo stub/fallback.
- No hay secretos reales.
- Build correcto.

Pruebas:

- npm run build
- Abrir http://localhost:5173
- Navegar por todos los módulos.
- Probar roles visuales.
- Probar soporte.
- Revisar que no hay pantalla en blanco.
- Confirmar que los endpoints auth devuelven fallback seguro.

Resultado esperado:

- App estable.
- Sin secretos.
- Sin errores críticos.

---

## Fase 2 · Pruebas Cloudflare Pages sin backend real

Estado esperado:

- Frontend desplegado.
- Variables VITE públicas configuradas.
- Worker todavía puede estar sin secrets reales.

Pruebas:

- Abrir URL Cloudflare Pages.
- Revisar diseño.
- Revisar sidebar.
- Revisar responsive.
- Revisar módulos.
- Revisar consola del navegador.
- Confirmar que no aparecen tokens ni secretos.

Resultado esperado:

- Frontend público funciona.
- No hay credenciales privadas expuestas.

---

## Fase 3 · Pruebas Worker sin Supabase real

Estado esperado:

- Worker desplegado.
- CORS configurado.
- Secrets de reservas/Airtable/Make según proceda.
- Supabase todavía sin credenciales o en fallback.

Pruebas:

- GET /api/disponibilidad.
- GET /api/reservas.
- POST /api/reservas.
- POST /api/jugadores/alta.
- GET /api/auth/me.
- POST /api/auth/login.
- POST /api/auth/forgot-password.
- OPTIONS /api/auth/login.

Resultado esperado:

- Reservas/disponibilidad responden según configuración.
- Auth responde backend_stub seguro si Supabase no está configurado.
- OPTIONS responde correctamente.
- CORS permite solo origen correcto.

---

## Fase 4 · Pruebas Supabase Auth real

Estado esperado:

- Supabase creado.
- SUPABASE_URL configurada en Worker.
- SUPABASE_ANON_KEY configurada en Worker.
- APP_PUBLIC_URL configurada.
- Redirect URLs configuradas.

Pruebas:

- Crear usuario real de prueba.
- POST /api/auth/register.
- POST /api/auth/login.
- GET /api/auth/me con Bearer token.
- POST /api/auth/logout.
- POST /api/auth/forgot-password.
- POST /api/auth/change-password.

Resultado esperado:

- Login real funciona.
- Token válido.
- Usuario real devuelto.
- Recuperación de contraseña preparada.
- No se exponen secretos.

---

## Fase 5 · Pruebas roles reales

Estado esperado:

- Usuario real autenticado.
- Rol obtenido desde backend o metadata.
- Admin/Staff/Support protegidos.

Pruebas:

- Login PLAYER.
- Login STAFF.
- Login ADMIN.
- Login SUPPORT.
- Intentar acceder a módulos no permitidos.
- Confirmar redirección segura.
- Confirmar que localStorage no concede permisos reales por sí solo.

Resultado esperado:

- Los roles protegidos dependen del backend.
- No basta manipular localStorage.

---

## Fase 6 · Pruebas reservas desde frontend desplegado

Estado esperado:

- Frontend en Cloudflare Pages.
- Worker desplegado.
- Make/Airtable conectados.
- CORS correcto.

Pruebas:

- Crear reserva desde app desplegada.
- Consultar disponibilidad.
- Consultar reservas.
- Reprogramar reserva si aplica.
- Cancelar reserva si aplica.
- Revisar respuesta visual.
- Revisar registros en Airtable/Make.

Resultado esperado:

- Flujo de reserva real estable.
- Errores controlados.
- Datos correctos.

---

## Fase 7 · Pruebas finales comerciales

Validar:

- Demo completa para club.
- Sin secretos expuestos.
- Sin pantallas rotas.
- Sin errores visibles.
- Dominio correcto.
- Auth real.
- Reservas reales.
- Disponibilidad real.
- Admin/Staff/Support protegidos.
- Backups finales.
- Documentación final.

## Estado

Plan de pruebas reales E2E preparado.

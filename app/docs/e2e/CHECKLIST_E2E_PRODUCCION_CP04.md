# Club Pádel 04 · Auditoría 24 · Checklist E2E producción/preproducción

## Objetivo

Validar la app completa de extremo a extremo antes de producción comercial real.

## Estado de partida

- Frontend estable.
- Worker preparado.
- Supabase Auth preparado.
- Cloudflare Pages preparado.
- Cloudflare Worker preparado.
- Secrets reales pendientes.
- Deploy real pendiente.

---

## 1 · Pruebas frontend visuales

Validar en escritorio/tablet/móvil:

- Home carga correctamente.
- Fondo visual carga correctamente.
- Sidebar se ve correctamente.
- Solo el botón activo queda destacado.
- Perfil y ajustes no aparece en rojo.
- Soporte no queda con filo verde si no está activo.
- Idioma visible correctamente.
- Cards principales legibles.
- Gráficas visibles.
- Scroll correcto.
- Responsive correcto.

---

## 2 · Pruebas navegación por módulos

Validar acceso y navegación:

- Inicio.
- Reservar.
- Alta de jugador.
- Reprogramar reserva.
- Cancelar reserva.
- Reservas.
- Torneos.
- Ranking.
- Admin.
- Centro técnico.
- Soporte.
- Perfil y ajustes.
- Cerrar sesión.

Resultado esperado:

- Ningún módulo rompe la app.
- Ningún módulo muestra pantalla en blanco.
- La navegación vuelve correctamente a Inicio/Reservas cuando corresponde.

---

## 3 · Pruebas roles

Roles:

- PLAYER.
- STAFF.
- ADMIN.
- SUPPORT.

Validar:

- Cada rol ve sus módulos permitidos.
- Cada rol vuelve a su sección segura.
- Admin/Staff/Support no deben quedar expuestos en producción real sin backend auth.
- La app no debe confiar solo en localStorage para permisos reales.

---

## 4 · Pruebas autenticación

Endpoints:

- GET /api/auth/me.
- POST /api/auth/login.
- POST /api/auth/logout.
- POST /api/auth/register.
- POST /api/auth/forgot-password.
- POST /api/auth/change-password.
- OPTIONS /api/auth/login.

Sin Supabase real:

- Debe responder backend_stub seguro.
- No debe romper frontend.
- No debe exponer secretos.

Con Supabase real:

- Registro correcto.
- Login correcto.
- Token válido.
- /api/auth/me devuelve usuario real.
- Recuperación de contraseña funciona.
- Logout funciona.
- Cambio de contraseña funciona.

---

## 5 · Pruebas reservas

Endpoints:

- POST /api/reservas.
- GET /api/reservas.
- GET /api/disponibilidad.

Validar:

- Crear reserva desde frontend desplegado.
- Confirmar respuesta correcta del Worker.
- Confirmar entrada en Airtable/Make si aplica.
- Validar disponibilidad.
- Validar errores controlados.
- Validar CORS desde dominio final.

---

## 6 · Pruebas alta jugador

Endpoint:

- POST /api/jugadores/alta.

Validar:

- Alta desde frontend.
- Datos enviados correctamente.
- Respuesta correcta del Worker.
- Registro en Airtable/Make si aplica.
- Email/notificación si aplica.

---

## 7 · Pruebas seguridad

Validar:

- No hay claves privadas en src.
- No hay claves privadas en dist.
- No hay tokens en variables VITE_.
- Secrets solo en Cloudflare Worker.
- CORS limitado al dominio final.
- Admin/Staff/Support protegidos por backend real.
- Errores no muestran secretos.
- Logs no muestran tokens.

---

## 8 · Pruebas Cloudflare Pages

Validar:

- Frontend desplegado.
- Dist correcto.
- Cache no rompe assets.
- Enlaces funcionan.
- Refresh no rompe la app.
- Variables públicas correctas.
- Dominio Pages funciona.

---

## 9 · Pruebas Cloudflare Worker

Validar:

- Worker desplegado.
- Rutas responden.
- Secrets disponibles.
- CORS correcto.
- OPTIONS correcto.
- Errores controlados.
- Logs revisados.

---

## 10 · Pruebas Supabase

Validar:

- Proyecto creado.
- Auth email activo.
- Redirect URLs correctas.
- Site URL correcta.
- Usuarios de prueba creados.
- Recuperación de contraseña activa.
- Tokens aceptados por Worker.

---

## 11 · Pruebas finales antes de venta

Validar:

- Demo completa para club.
- Flujo reserva completo.
- Flujo cancelación/reprogramación.
- Alta jugador.
- Login.
- Perfil.
- Soporte.
- Admin.
- Sin errores visibles.
- Sin secretos expuestos.
- Documentación lista.
- Backup final creado.

## Estado

Checklist E2E preparado para pruebas reales cuando existan deploy y credenciales.

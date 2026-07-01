# Auditoría 21 · Auth Backend · Club Pádel 04

## Estado
Auditoría 21 al 80%.

## Resultado principal
Las rutas de autenticación ya existen en el Worker remoto y responden mediante el proxy local `/api`.

## Rutas comprobadas

- GET `/api/auth/me` → 200
- POST `/api/auth/login` → 501 controlado
- POST `/api/auth/register` → 501 controlado
- POST `/api/auth/forgot-password` → 200
- POST `/api/auth/change-password` → 501 controlado
- POST `/api/auth/logout` → 200

## Interpretación

No aparece ningún 404 en rutas Auth.

Los códigos 501 son esperados en esta fase porque el backend real de autenticación todavía no tiene proveedor/secrets configurados.

## Validaciones superadas

- Worker remoto desplegado.
- Proxy Vite `/api` funcionando.
- CORS con localhost funcionando.
- Rutas Auth preparadas.
- Modo `backend_stub` seguro.
- Sin credenciales privadas en frontend.
- Build correcto.
- Git limpio antes de crear este reporte.

## Pendiente para cerrar Auditoría 21 al 100%

1. Configurar proveedor real de autenticación.
2. Definir secrets reales en Cloudflare Worker.
3. Probar login real.
4. Probar registro real.
5. Probar recuperación de contraseña real.
6. Probar cambio de contraseña real con token válido.
7. Validar roles PLAYER, STAFF, ADMIN y SUPPORT.
8. Validar permisos por rol.
9. Confirmar protección de rutas sensibles.

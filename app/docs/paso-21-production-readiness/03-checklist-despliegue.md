# 03 — Checklist de despliegue

## Frontend (Vite/React → estático)

- [x] `npm run build` verificado sin errores en esta sesión.
- [x] `docs/deployment.md` documenta el proceso completo (Cloudflare Pages/Vercel/Netlify).
- [ ] **Depende del dominio**: apuntar DNS al hosting elegido.
- [ ] **Depende de decisión externa**: elegir proveedor de hosting definitivo entre las 3 opciones documentadas.
- [ ] Ejecutar el despliegue real (acción irreversible/de producción — no realizada en este audit por diseño).

## Backend (Cloudflare Worker — `worker-reservas`)

- [x] `wrangler.toml` presente y correcto (vars públicas separadas de secretos).
- [x] 173/173 tests del Worker en verde en esta sesión.
- [ ] **Depende de credenciales reales**: `wrangler secret put MAKE_RESERVAS_WEBHOOK` / `AIRTABLE_TOKEN`.
- [ ] Ejecutar `wrangler deploy` (acción irreversible/de producción — no realizada en este audit).
- [ ] Verificar `ALLOWED_ORIGIN` actualizado con el dominio de producción final (actualmente apunta a `club-padel-04.pages.dev` + localhost).

## CI/CD

- [ ] **No existe ningún pipeline de CI/CD** en este árbol (sin `.github/workflows`). Recomendado antes de producción: un workflow mínimo que ejecute `npm test && npm run lint && npm run build` en cada PR — no crítico para el primer despliegue manual, pero reduce el riesgo de regresiones futuras.

## Tras el despliegue

- [ ] Verificar que la app carga en la URL de producción.
- [ ] Verificar que el flujo de reserva llama correctamente al Worker.
- [ ] Verificar CORS contra el dominio real (no solo `localhost`/`pages.dev`).
- [ ] Configurar backups (depende de que exista ya un hosting/almacenamiento elegido).
- [ ] Configurar monitorización básica (depende de que exista ya una URL de producción que monitorizar).

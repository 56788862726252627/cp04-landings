# QA CHECKLIST — `<slug-cliente>`

Plantilla. Marcar cada ítem con una de estas cuatro categorías, nunca dejarlo ambiguo (mismo criterio usado en el resto de este proyecto):
**Probado automáticamente** · **Verificado por build** · **Inspeccionado estáticamente** · **Pendiente de prueba manual**

## Configuración

- [ ] `client-config.json` valida contra `config/client-config.schema.json` — _(verificable automáticamente, ver `config/CLIENT_CONFIG_SCHEMA_GUIDE.md`)_
- [ ] Ningún secreto real presente en `client-config.json` ni en esta carpeta — _(inspección manual obligatoria antes de cada commit de un cliente real)_

## RBAC / roles

- [ ] Cada rol de `client-config.json.roles` navega solo a las secciones permitidas — _(pendiente de prueba manual, no hay tests de render React en este proyecto)_
- [ ] Ningún rol puede autoasignarse un rol más privilegiado — _(cubierto por los tests de `src/utils/rbac.test.mjs`, que no son específicos de cliente pero validan el mecanismo)_

## Branding

- [ ] Colores/tipografías del cliente se aplican correctamente si hay override — _(pendiente de prueba manual)_
- [ ] Sin override, la identidad visual por defecto (`CORE_THEME`) se mantiene intacta — _(cubierto por `src/theme.test.mjs`)_

## Build y tests

- [ ] `node --test` en verde — _(probado automáticamente)_
- [ ] `npm run build` sin errores — _(verificado por build)_
- [ ] `git diff --check` limpio — _(verificado por build)_

## Integraciones

- [ ] Estado de `integrations.*` en `client-config.json` coincide con `INTEGRATIONS.md` — _(inspección manual)_
- [ ] Ninguna integración marcada activa sin confirmación del equipo responsable de esa integración — _(pendiente de coordinación externa a esta plantilla)_

## Qué NO hacer aquí

- No marcar un ítem como "probado automáticamente" si en realidad se verificó a mano — la distinción existe precisamente para no confundir ambas cosas.
- No cerrar este checklist para pasar `deploymentProfile` a `production` si algún ítem sigue "pendiente de prueba manual" sin haberse ejecutado esa prueba.

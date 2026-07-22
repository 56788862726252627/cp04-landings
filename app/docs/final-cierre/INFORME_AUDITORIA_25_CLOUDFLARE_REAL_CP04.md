# Club Pádel 04 · Auditoría 25 · Informe Cloudflare real seguro

## Estado

Auditoría 25 preparada al 90%.

## Objetivo

Preparar Cloudflare real sin exponer credenciales y sin ejecutar todavía acciones irreversibles.

## Completado

- Check inicial Cloudflare real seguro.
- Checklist Cloudflare real segura.
- Guía segura de secrets Cloudflare Worker.
- Comandos Cloudflare reales en modo seguro.
- Build frontend correcto.
- Worker revisado.
- Wrangler presente.
- Checkpoints parciales creados.

## Checkpoints creados

- backups/checkpoint-auditoria25-inicial
- backups/checkpoint-auditoria25-cloudflare-checklist
- backups/checkpoint-auditoria25-secrets-guide
- backups/checkpoint-auditoria25-cloudflare-commands
- backups/checkpoint-auditoria25-cloudflare-90

## Estado técnico

Frontend:

- Estable.
- Build correcto.
- Dist generado.
- Preparado para Cloudflare Pages.
- Pendiente deploy real.

Worker:

- Presente.
- Wrangler configurado.
- Comandos seguros documentados.
- Pendiente secrets reales.
- Pendiente deploy real.

Cloudflare Pages:

- Proyecto recomendado: club-padel-04.
- Build command: npm run build.
- Output directory: dist.
- Variables públicas VITE_ documentadas.

Cloudflare Worker:

- Worker recomendado: cp04-reservas-proxy.
- Secrets documentados.
- CORS documentado.
- Deploy real pendiente.

## Pendiente antes de producción real

- Confirmar cuenta Cloudflare correcta.
- Confirmar proyecto Pages correcto.
- Confirmar Worker correcto.
- Configurar variables públicas en Pages.
- Configurar secrets privados en Worker.
- Confirmar Supabase real.
- Confirmar dominio final.
- Ejecutar deploy Worker.
- Ejecutar deploy frontend.
- Ejecutar pruebas E2E reales.

## Seguridad

No se han introducido credenciales reales.

Reglas confirmadas:

- Secrets privados solo en Cloudflare Worker.
- Variables públicas solo VITE_.
- Nada privado en src.
- Nada privado en dist.
- Nada privado en docs.
- Nada privado en backups.
- No compartir secrets en capturas ni chat.

## Observación

Se detectaron backups antiguos dentro de src/ y worker-reservas/src/.
No bloquean, pero conviene moverlos fuera de src en una auditoría futura de limpieza.

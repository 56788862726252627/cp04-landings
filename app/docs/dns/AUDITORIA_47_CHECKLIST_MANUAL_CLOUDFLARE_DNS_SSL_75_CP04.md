# Club Pádel 04 · Auditoría 47 · Checklist manual Cloudflare DNS/SSL 75%

## Auditoría 47

75%

## Avance real estimado del proyecto completo

99.7%

## Dominios oficiales

- SaaS comercial: clubpadel04.com
- App reservas: app.clubpadel04.com

## URL preview fallback

https://c4403e7d.club-padel-04.pages.dev

## Objetivo

Dejar preparada la checklist manual exacta para conectar app.clubpadel04.com en Cloudflare Pages con DNS y SSL/TLS controlados.

## Orden recomendado

Primero conectar:

app.clubpadel04.com

Después, en auditoría posterior, preparar:

clubpadel04.com

## Checklist antes de tocar Cloudflare

- [ ] Confirmar que clubpadel04.com está comprado.
- [ ] Confirmar que clubpadel04.com aparece en Cloudflare.
- [ ] Confirmar que los nameservers están correctamente apuntando a Cloudflare.
- [ ] Confirmar que la cuenta Cloudflare usada es la correcta.
- [ ] Confirmar que la preview fallback sigue activa.
- [ ] Confirmar que el ZIP final está guardado.
- [ ] Confirmar que el plan rollback está disponible.

## Checklist en Cloudflare Pages

- [ ] Entrar en Cloudflare.
- [ ] Ir a Workers & Pages.
- [ ] Abrir el proyecto correcto de Club Pádel 04.
- [ ] Confirmar que el deployment activo corresponde al paquete validado.
- [ ] Ir a Custom Domains.
- [ ] Añadir app.clubpadel04.com.
- [ ] Revisar la instrucción exacta que Cloudflare proponga.
- [ ] No aceptar cambios si el proyecto no coincide.
- [ ] No tocar clubpadel04.com hasta tener app.clubpadel04.com controlado.

## Checklist DNS

Si Cloudflare pide registro CNAME:

- [ ] Crear CNAME para app.
- [ ] Apuntar al destino exacto indicado por Cloudflare.
- [ ] Mantener proxy según recomiende Cloudflare Pages.
- [ ] No crear registros duplicados.
- [ ] No borrar registros existentes sin revisar.
- [ ] No tocar MX/correo.
- [ ] No tocar registros ajenos al proyecto.

## Checklist SSL/TLS

- [ ] Esperar validación de certificado.
- [ ] Confirmar HTTPS activo.
- [ ] Confirmar que no aparece error de certificado.
- [ ] Confirmar que app.clubpadel04.com carga sin pantalla blanca.
- [ ] Confirmar que CSS e imágenes cargan.
- [ ] Confirmar que rutas internas funcionan.
- [ ] Confirmar responsive móvil/tablet.

## Checklist posterior a conexión

Comprobar:

- [ ] https://app.clubpadel04.com/
- [ ] https://app.clubpadel04.com/reservar
- [ ] https://app.clubpadel04.com/alta-jugador
- [ ] https://app.clubpadel04.com/reprogramar-reserva
- [ ] https://app.clubpadel04.com/cancelar-reserva
- [ ] https://app.clubpadel04.com/reservas
- [ ] https://app.clubpadel04.com/torneos
- [ ] https://app.clubpadel04.com/ranking
- [ ] https://app.clubpadel04.com/admin
- [ ] https://app.clubpadel04.com/centro-tecnico
- [ ] https://app.clubpadel04.com/soporte
- [ ] https://app.clubpadel04.com/perfil

## Rollback

Si falla:

1. Mantener activa la preview fallback.
2. Quitar el custom domain app.clubpadel04.com si queda mal.
3. Restaurar registro DNS anterior si se modificó.
4. No borrar el proyecto Pages.
5. No borrar el ZIP final.
6. Volver al checkpoint Auditoría 47.
7. No activar producción comercial hasta resolver.

## No hacer todavía

- No activar pagos reales.
- No activar producción comercial.
- No tocar automatizaciones destructivas.
- No exponer webhooks completos.
- No publicar claves ni tokens.
- No conectar clubpadel04.com hasta validar primero app.clubpadel04.com.

## Riesgo

Bajo si se sigue la checklist manual.

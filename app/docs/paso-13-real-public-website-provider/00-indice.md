# Paso 13 — Real Public Website Provider + End-to-End Digital Audit Validation

Conecta el motor de investigación de [Paso 12](../paso-12-public-research-audit/00-indice.md)
a un proveedor real de obtención de contenido web público
(`publicWebsiteFetcher`), con protección SSRF en dos capas, y valida una
auditoría real de extremo a extremo contra `example.com` (dominio
reservado por IANA/RFC 2606 para documentación y pruebas — nunca un
negocio ni competidor real).

1. [Arquitectura, configuración y CLI](./01-arquitectura-y-configuracion.md)
2. [Amenazas SSRF y mitigaciones](./02-amenazas-ssrf-y-mitigaciones.md)
3. [Política de robots, privacidad y consentimiento](./03-politica-robots-privacidad-consentimiento.md)
4. [Errores y troubleshooting](./04-solucion-errores-troubleshooting.md)
5. [Contratos de extensión y cómo implementar futuros proveedores](./05-contratos-extension-y-futuros-proveedores.md)
6. [Prueba end-to-end real](./06-prueba-end-to-end-real.md)
7. [Informe técnico del Paso 13](./07-informe-tecnico-paso-13.md)
8. [Informe de seguridad](./08-informe-seguridad.md)
9. [Checklist de producción y decisiones pendientes](./09-checklist-produccion-decisiones-pendientes.md)
10. [Actualización del roadmap maestro vivo](./10-actualizacion-roadmap-maestro.md)

## Resumen ejecutivo

- Proveedor real `publicWebsiteFetcher` implementado y probado, gateado
  por una bandera de tiempo de ejecución inequívoca (`--allow-network`)
  que nunca se activa por defecto ni se infiere de un archivo guardado.
- SSRF bloqueado en dos capas independientes: (1) el hostname/esquema tal
  como aparece en la URL, (2) las IPs a las que ese hostname resuelve
  realmente por DNS — con la conexión TCP/TLS forzada ("pinneada") a la
  IP ya validada, para no volver a resolver DNS en el momento de conectar
  (defensa razonable contra DNS rebinding en este entorno).
- Cada redirección se revalida por las dos capas antes de seguirse, con
  límite estricto (`--max-redirects` / `maxRedirects`, por defecto 3).
- Los 13 adaptadores offline de Paso 12 permanecen exactamente iguales;
  el motor sigue funcionando 100% offline si no se pasa
  `--allow-network`.
- Validado con una auditoría real completa contra `https://example.com/`:
  planificación → recolección real → análisis → scoring → recomendaciones
  → informes → idempotencia (repetida dos veces, 0 archivos
  creados/actualizados en la segunda) → degradación controlada ante un
  404 real.
- 47 tests nuevos (41 del motor + 6 del CLI) + 720 preexistentes =
  **767/767 en verde**. Build y lint sin regresiones.

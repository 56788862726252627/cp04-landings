# README — Sincronización con Google Drive

**Uso**: explica qué se copia a Google Drive, cómo, y cómo mantener el repositorio de GitHub como fuente principal de verdad para todo el trabajo de la Agencia IA (Club Pádel 04 y negocios nuevos).

---

## 1. Principio general

**GitHub es la fuente principal.** Google Drive es una **copia ordenada** para compartir con clientes, hacer backup legible sin necesidad de git, o dar acceso a personas que no usan el repositorio. Nunca se edita directamente en Drive un documento que también existe en GitHub — se edita en el repo y se vuelve a copiar.

## 2. Qué copiar a Google Drive

- Documentos de propuesta y pricing ya cerrados por cliente (`08_propuesta/`, `07_pricing/` rellenados — no las plantillas vacías).
- Entregables visuales finales (exportaciones de Figma, logo final, brand system cerrado).
- Documentos de onboarding y soporte que el cliente necesita consultar.
- Las plantillas genéricas (`drive-export/templates/`) para que estén accesibles sin necesidad de clonar el repo.

## 3. Qué NO copiar a Google Drive

- Código fuente (`04_landing/src/`, núcleo técnico) — vive solo en GitHub.
- CRM con leads en bruto de prospección (datos de contacto de terceros) — mantener en GitHub o en hoja de cálculo con acceso restringido, no en una carpeta de Drive ampliamente compartida.
- Credenciales, tokens o cualquier dato de integración (Make, Airtable, Stripe, WhatsApp).
- Borradores intermedios sin cerrar — solo se sube la versión final de cada documento.

## 4. Qué carpetas crear en Drive

Estructura espejo de `projects/`, separando siempre por negocio:

```
Google Drive/
  Agencia IA/
    club-padel-04/          (existente, no tocar desde este proceso)
    templates/               (espejo de drive-export/templates/)
    <slug-del-negocio-1>/
    <slug-del-negocio-2>/
    ...
```

- Una carpeta de Drive por negocio, con el mismo nombre/slug que su carpeta en `projects/`.
- Dentro de cada carpeta de negocio, mantener subcarpetas equivalentes a las relevantes de la plantilla (identidad visual, propuesta, onboarding) — no es necesario replicar carpetas de trabajo interno como CRM en bruto.

## 5. Cómo hacer la copia manual

1. Cerrar y revisar el documento en GitHub (versión final, sin placeholders sin rellenar).
2. Exportar a PDF o Google Doc según el uso (PDF para propuestas enviadas a cliente; Google Doc si el cliente necesita comentar/editar).
3. Subir a la carpeta de Drive correspondiente al negocio.
4. Verificar permisos de la carpeta antes de compartir el enlace (ver §6).

## 6. Qué revisar antes de compartir

- Que el documento no contenga datos de otro cliente/negocio (comparaciones internas, pricing de otro cliente, notas internas de diagnóstico comercial).
- Que los permisos de la carpeta/archivo sean los correctos (solo el cliente destinatario, no "cualquiera con el enlace" salvo que sea intencional).
- Que no se incluyan credenciales, tokens o URLs internas de administración.

## 7. Cómo no duplicar carpetas

- Antes de crear una carpeta nueva en Drive, buscar si ya existe una con nombre similar (mismo problema que en GitHub — ver `docs/agencia-ia/checklists/CHECKLIST_NO_DUPLICAR_ANTES_DE_CREAR.md`).
- Usar exactamente el mismo slug que la carpeta de `projects/` para evitar ambigüedad entre "clinica-dental-antequera" y "clínica dental Antequera (2)".

## 8. Cómo separar Club Pádel 04 de nuevos negocios

- La carpeta `club-padel-04/` en Drive no se reorganiza ni se renombra desde este proceso.
- Ningún documento de un negocio nuevo se sube dentro de la carpeta de Club Pádel 04, ni viceversa.
- Si se necesita mostrar Club Pádel 04 como caso de referencia a un cliente nuevo (ej. en una propuesta), se enlaza o se adjunta una captura/PDF suelto — no se comparte acceso a la carpeta completa de Club Pádel 04.

## 9. Ver también

- `drive-export/templates/README_EXPORT_TEMPLATES_NEGOCIO_REPLICABLE.md` — detalle de qué plantillas exportar y cómo.
- `docs/agencia-ia/replicacion/GUIA_SEPARACION_PROYECTOS_GITHUB_DRIVE.md` — reglas de separación de proyectos.

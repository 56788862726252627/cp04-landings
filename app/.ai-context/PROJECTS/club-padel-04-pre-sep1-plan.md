# Club Pádel 04 · Plan de trabajo antes del 1 de septiembre

Fecha: 2026-08-27
Objetivo: avanzar solo en flujos que puedan cerrarse sin depender de Airtable, WhatsApp Business API ni Stripe.

## Candidatos auditados

### 1. ⚠️ Alerta Crítica Fallos Make — PRIORIDAD ALTA
Estado Make actual: error / inactivo.
Apps actuales: HTTP, Tools, Router, OpenAI, Gmail.
Hallazgo: el módulo HTTP consulta la API de Make y tenía una credencial/token incrustado en la configuración. No debe mantenerse ese patrón.
Mejora recomendada: sustituir la llamada HTTP autenticada manualmente por el módulo oficial de Make `List scenarios` usando una conexión Make gestionada por Make. Mantener OpenAI solo como redactor; la detección debe ser determinista.
Bloqueo actual: requiere autorizar una conexión interna de Make para el módulo oficial `List scenarios`.
Dependencias prohibidas: ninguna de Airtable/WhatsApp/Stripe.

### 2. 🗺️ Mapa de Flujos — PRIORIDAD ALTA
Estado Make actual: error / inactivo.
Apps actuales: HTTP, Tools, JSON, Iterator, Text Aggregator, Gmail.
Hallazgo: también consulta la API de Make por HTTP. Debe reutilizar la misma conexión oficial de Make que `⚠️ Alerta Crítica Fallos Make`, evitando tokens manuales/hardcodeados.
Dependencias prohibidas: ninguna de Airtable/WhatsApp/Stripe.

### 3. 🗂️ Backup Plantilla Drive — PRIORIDAD MEDIA
Estado Make actual: inactivo.
Apps actuales: Google Drive únicamente.
Conexión Drive: OK.
Configuración actual: sube un archivo `prueba-backup.json` con contenido `{}` a una carpeta de Drive y está programado cada 15 minutos.
Mejora necesaria antes de producción: definir qué plantilla real debe respaldar, nombre definitivo, contenido real y cadencia adecuada; no activar en producción con un archivo de prueba vacío cada 15 minutos.
Dependencias prohibidas: ninguna de Airtable/WhatsApp/Stripe.

## Flujos auditados y BLOQUEADOS hasta Airtable

### 🔔 Notificación Push PWA
Incluye Airtable directamente. No intentar cerrar al 100% antes del reset.

### 📸 Instagram Borrador con IA
Incluye Airtable directamente. No intentar cerrar al 100% antes del reset.

### 🔄 Backup Semanal
Incluye varios módulos Airtable. Bloqueado.

### 📧 Monitor Prueba Gratuita
Incluye Airtable. Bloqueado.

### 🤖 Bot IA Reservas Telegram
No usa Airtable directamente, pero llama como subescenario a `📡 API Reservas`; su capacidad de reservas depende funcionalmente de Airtable. Puede auditarse parcialmente, pero no certificar E2E de reservas al 100% antes del reset.

### 💬 Chatbot Web Reservas
No usa Airtable directamente, pero llama como subescenario a `📡 API Reservas`; su capacidad de reservas depende funcionalmente de Airtable. Puede auditarse parcialmente, pero no certificar E2E de reservas al 100% antes del reset.

## Orden recomendado

1. ⚠️ Alerta Crítica Fallos Make
2. 🗺️ Mapa de Flujos
3. 🗂️ Backup Plantilla Drive
4. Auditorías parciales sin consumo de Airtable de Telegram y Chatbot Web, dejando su E2E de reservas diferido.

## Regla temporal

Hasta el 1 de septiembre:
- No consumir Airtable para pruebas salvo emergencia.
- No activar dependencias WhatsApp Business API.
- No trabajar en Stripe.
- Priorizar seguridad, infraestructura, monitorización, documentación, Drive, email, Telegram/Chatbot solo en capas no dependientes de reservas reales.

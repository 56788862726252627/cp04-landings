# MAPA · Plantilla SaaS Deportiva Clonable

## Objetivo

Convertir Club Pádel 04 en una base SaaS adaptable a otros clubes deportivos sin duplicar trabajo innecesario.

## Principio principal

No crear una app nueva desde cero para cada cliente.  
Usar Club Pádel 04 como base y separar:

1. Núcleo reutilizable.
2. Configuración por club.
3. Configuración por deporte.
4. Textos comerciales.
5. Imágenes y marca.
6. Automatizaciones.
7. Base de datos.
8. Entregables.

---

## 1. Núcleo reutilizable

Elementos que deben mantenerse para casi cualquier club deportivo:

- login
- recuperación de contraseña
- perfil de usuario
- roles
- sidebar
- dashboard
- reservas
- cancelaciones
- reprogramaciones
- administración
- métricas
- alertas
- soporte
- automatizaciones
- emails
- base de datos
- documentación
- backups
- commits
- checklists de entrega

---

## 2. Elementos configurables por club

Para cada nuevo club debe poder cambiarse:

- nombre del club
- logo
- colores
- imágenes
- ciudad
- provincia
- descripción
- servicios
- horarios
- tarifas
- número de pistas/salas/recursos
- textos de bienvenida
- textos comerciales
- datos de contacto
- enlaces
- política de cancelación
- emails
- automatizaciones activas

---

## 3. Elementos configurables por deporte

Según el deporte o centro, deben cambiarse términos:

| Base Club Pádel 04 | Tenis | Gimnasio | Yoga/Pilates | Centro deportivo |
|---|---|---|---|---|
| Pista | Pista | Sala | Clase/Sala | Instalación |
| Jugador | Jugador | Socio | Alumno/Socio | Usuario |
| Torneo | Torneo | Reto/Evento | Taller | Evento |
| Ranking | Ranking | Progreso | Nivel | Clasificación |
| Reserva | Reserva | Clase/Reserva | Clase | Reserva |

---

## 4. Lo que NO debe duplicarse

No crear duplicados de:

- App.jsx
- App.css
- documentos de auditorías cerradas
- backups innecesarios
- prompts maestros ya existentes
- paquetes comerciales ya creados
- matrices SaaS ya creadas
- checklists ya existentes

Si algo ya existe, se amplía o se referencia.

---

## 5. Flujo recomendado para adaptar un club

1. Revisar Auditorías 30 y 31.
2. Revisar este mapa.
3. Crear ficha del nuevo club.
4. Definir deporte/sector.
5. Definir qué módulos se activan.
6. Definir qué textos cambian.
7. Definir qué imágenes cambian.
8. Definir qué automatizaciones se reutilizan.
9. Crear checklist de adaptación.
10. Solo entonces tocar código/configuración si hace falta.


# CHECKLIST · Clonación segura SaaS deportivo

## Objetivo

Evitar errores y duplicados al adaptar Club Pádel 04 a otro club.

---

## 1. Antes de crear nada

Comprobar:

- docs/auditoria30 existe
- docs/auditoria31 existe
- docs/agencia-ia existe
- docs/agencia-ia/plantilla-deportiva-clonable existe
- hay commits limpios
- git status está limpio
- la app base compila
- no hay cambios pendientes

---

## 2. Revisar documentación existente

Leer o revisar:

- ROADMAP_AGENCIA_IA_REPLICABLE.md
- MATRIZ_REUTILIZACION_SAAS.md
- MAPA_MODULOS_REUTILIZABLES_CP04.md
- MATRIZ_SECTORES_SAAS_AGENCIA_IA.md
- CHECKLIST_NO_DUPLICAR_ANTES_DE_CREAR.md
- PLAN_PRODUCTO_VENDIBLE_AGENCIA_IA.md
- PROPUESTA_COMERCIAL_CLUB_PADEL_04.md

---

## 3. Crear ficha del nuevo club

No tocar código hasta tener:

- nombre
- deporte
- servicios
- recursos
- horarios
- colores
- imágenes
- módulos activos
- automatizaciones necesarias
- paquete comercial

---

## 4. Separar cambios

Clasificar cada cambio:

- visual
- texto
- datos
- módulos
- automatizaciones
- base de datos
- roles
- comercial
- técnico

---

## 5. Reglas de seguridad

- No modificar App.jsx directamente sin backup.
- No tocar CSS delicado sin objetivo claro.
- No usar JS global agresivo para estilos.
- No borrar backups.
- No mover carpetas base.
- No crear duplicados si se puede ampliar.
- Hacer build después de cualquier cambio técnico.
- Hacer commit por bloque estable.

---

## 6. Resultado esperado

Cada adaptación debe producir:

- ficha del cliente
- checklist completado
- documentación de cambios
- build correcto
- commit limpio
- propuesta comercial adaptada
- demo lista


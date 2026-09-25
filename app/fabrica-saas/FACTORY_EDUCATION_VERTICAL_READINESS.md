# FACTORY — Education Vertical Readiness

**Estado:** ARQUITECTURA LISTA — Sin implementación de contenido educativo
**Versión:** V1.7
**Implementación completa prevista:** V1.8+

---

## Qué está implementado (V1.7)

El vertical `education` está registrado en todos los sistemas de la fábrica
para permitir su activación futura sin cambios estructurales:

### Registros actuales

| Módulo                          | Estado     | Detalles                              |
|---------------------------------|------------|---------------------------------------|
| `v1.7Schema.js`                 | ✓ READY    | `V17_SUPPORTED_VERTICALS` incluye education |
| `designSystem.js`               | ✓ READY    | Tokens de color amber/yellow completos |
| `verticalMapping.js`            | ✓ READY    | Preset `professional`, motionLevel `low` |
| `mediaEngine.js`                | ✓ READY    | Colores poster `#fef9c3`              |

### Design tokens education

```js
education: {
  colors: {
    primary:       '#ca8a04',  // amber cálido
    primaryLight:  '#fef9c3',
    primaryDark:   '#713f12',
    secondary:     '#0891b2',
    accent:        '#f59e0b',
    surface:       '#fefce8',
  },
  sector: {
    icon: '📚', label: 'Centro Educativo', entity: 'Alumno',
    service: 'Módulo', booking: 'Matrícula',
  },
}
```

---

## Qué NO está implementado

- **Sin curriculum específico**: No hay módulos de asignatura ni normativa educativa.
- **Sin roles implementados**: Alumno/Profesor/Familia están declarados pero sin
  lógica de acceso ni permisos.
- **Sin contenido educativo**: No hay ejercicios, cuestionarios, videoclases ni
  seguimiento de progreso.
- **Sin integración de tutor IA**: Prevista para V1.8+ con separación clara de alcance.

---

## Plan para V1.8+

### Sub-tipos previstos

| Sub-tipo     | Descripción                        |
|--------------|------------------------------------|
| primaria     | Ed. primaria (6-12 años)           |
| eso          | ESO (12-16 años)                   |
| bachillerato | Bachillerato (16-18 años)          |
| fp           | Formación profesional              |
| cursos       | Academia / cursos libres           |
| universitario| Formación universitaria            |

### Roles previstos

| Rol     | Descripción                        |
|---------|------------------------------------|
| alumno  | Acceso a contenido y progreso      |
| profesor| Gestión de clases y materiales     |
| familia | Seguimiento de alumnos menores     |
| tutor   | Tutoría IA / académica             |
| admin   | Gestión del centro                 |

### Features previstas para V1.8

1. **Módulos de contenido**: video-lección, ejercicio interactivo, cuestionario
2. **Progreso del alumno**: porcentaje completado, nota, tiempo dedicado
3. **Panel familiar**: visualización de progreso de hijos menores
4. **Tutor IA**: asistente contextual con límites de alcance claros
5. **Calendario académico**: horario, entregas, exámenes

---

## Cómo usar education en V1.7

El vertical es funcional para generar una app genérica de centro educativo,
pero sin funcionalidades educativas específicas:

```yaml
version: "1.7"
vertical: education

branding:
  nombre: "Mi Centro Educativo"
  primaryColor: "#ca8a04"

experience:
  preset: professional
  motion: low
```

La app generada tendrá diseño amber/amarillo, estructura de negocio estándar,
y podrá mostrar información del centro, servicios (cursos), equipo, etc.

---

## Nota importante

```
educationMeta.status = 'FUTURE_VERTICAL'
educationMeta.notesCurriculum = 'Sin currículum concreto ni normativa educativa
  implementada. Arquitectura lista para V1.8+'
```

Este estado evita que se generen apps educativas con contenido fictional
que pueda confundirse con información normativa real.

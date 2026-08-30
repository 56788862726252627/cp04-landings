# Arquitectura de Privacidad — Plataforma Educativa con Menores
# Fábrica SaaS — Vertical Educativo
# Versión: 1.0 · Diseño conceptual (NO implementación real)

## Principios de Diseño

1. **Privacy by Design**: la privacidad como requisito de arquitectura, no un add-on
2. **Data Minimization**: recopilar solo los datos estrictamente necesarios por función
3. **Purpose Limitation**: cada dato se usa solo para el fin declarado
4. **Storage Limitation**: retención mínima, destrucción automatizada
5. **Age-Appropriate Design**: interfaz y datos diferenciados por edad
6. **Parental Control**: tutores legales tienen acceso y control sobre datos de menores <14

## Roles y Datos por Rol

### Alumno (menor < 18)
- Datos mínimos: identificador interno, curso, grupo, progreso académico
- Sin número de teléfono propio (para menores <14)
- Sin dirección personal
- Sin datos biométricos
- Acceso: solo sus propios datos
- Retención: vigencia matrícula + 2 años (a definir con centro)

### Alumno (mayor de 18, Bachillerato)
- Mismos principios + autonomía de consentimiento propio
- Puede gestionar sus propios permisos de comunicación

### Familia / Tutor Legal
- Acceso: datos académicos (progreso, asistencia, evaluaciones) de sus hijos
- No acceso a datos de otros alumnos
- Derecho a solicitar exportación o borrado de datos de su hijo
- Comunicaciones: vía canal cifrado (no SMS sin cifrar)

### Profesor
- Acceso: datos académicos de su grupo (no datos personales no académicos)
- Sin acceso a historial médico, situación familiar, etc.
- Logs de acceso auditables

### Admin de Centro
- Acceso amplio pero auditado
- Separación de datos académicos vs personales vs de salud
- Exportación debe ser trazable

## Flujos de Consentimiento

### Menores < 14 años
- Consentimiento obligatorio de tutor legal
- No registro autónomo del menor
- Tutor puede retirar consentimiento en cualquier momento

### Menores 14-17 años
- Consentimiento del propio menor (Ley 3/2018) para datos propios
- Notificación a tutor recomendada para datos académicos
- Centro puede requerir firma de tutor por política propia

### Mayores de 18
- Consentimiento propio suficiente

## Separación Demo / Producción

En la demo EducaArchidona:
- Cero datos reales de alumnos
- Todos los datos son ficticios y generados en código
- No hay base de datos real
- No hay cookies de tracking
- No hay analytics personales

En producción (futura):
- Arquitectura de roles con RLS (Row Level Security) en base de datos
- Cifrado en tránsito (TLS 1.3) y en reposo
- Separación de tenant por centro educativo
- Log de acceso a datos sensibles
- Canal de reporte de incidencias de privacidad

## Control Parental en Demo

La demo muestra el panel Familia como acceso de solo lectura:
- Progreso académico (por materia, por período)
- Calendario de evaluaciones
- Asistencia (demo/ficticia)
- Comunicaciones del tutor/profesor (mock)

Sin acceso a conversaciones con el tutor IA (política de confidencialidad educativa).

## Notas RGPD relevantes para implementación real

- Base jurídica de tratamiento: ejecución de contrato educativo + interés público
- Responsable de tratamiento: el centro educativo (no la plataforma)
- Encargado de tratamiento: proveedor de la plataforma (requiere DPA)
- Transferencias internacionales: solo con garantías adecuadas
- DPO: obligatorio si tratamiento a gran escala de menores
- EIPD: recomendada para datos de menores

*Fábrica SaaS — Diseño conceptual. No constituye compliance legal certificado. Requiere auditoría jurídica antes de producción.*

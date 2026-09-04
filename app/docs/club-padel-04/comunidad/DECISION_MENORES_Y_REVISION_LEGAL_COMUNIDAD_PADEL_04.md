# Decisión sobre menores de edad y revisión legal — Comunidad Pádel 04

**Estado:** documento de preparación de decisión. **Borrador técnico/legal revisable, pendiente de validación por abogado/DPO real. No sustituye asesoramiento legal profesional. Ningún punto de este documento afirma cumplimiento normativo al 100%.** No es una validación legal real — es la preparación documental para que un abogado/DPO pueda revisarla y para decidir si Comunidad Pádel puede activarse primero como demo/mock interna, sin menores activos.

**Fecha:** 2026-07-15
**Depende de:** `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md`, `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md`, `MATRIZ_READINESS_INTEGRACION_COMUNIDAD_PADEL_04.md` (todos ya mergeados en `main`).
**Documentos hermanos:** `CHECKLIST_REVISION_LEGAL_EXTERNA_COMUNIDAD_PADEL_04.md`, `MATRIZ_BLOQUEOS_NO_TECNICOS_COMUNIDAD_PADEL_04.md` (mismo directorio).

---

## 1. Estado actual

El riesgo de menores de edad es, desde la primera auditoría de privacidad (`MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, riesgo #1), el **único marcado como crítico** en todo el catálogo de Comunidad Pádel 04, y sigue sin resolver tras 10 PRs mergeados (#14-#23). No es un olvido: cada documento que lo toca (`CONSENTIMIENTO_PRIVACIDAD...md` sección 14, `MODERACION_REPORTES_ROLES...md` sección 18, `QA_SEGURIDAD_CIERRE_CALIDAD...md` sección 12) lo señala explícitamente como una decisión de negocio pendiente, no técnica, que este equipo no puede tomar por su cuenta.

## 2. Decisiones pendientes

1. **¿Se permite el alta de menores en la capa social de Comunidad Pádel 04, en algún club, en alguna fase?**
2. **Si se permite, ¿bajo qué mecanismo de consentimiento parental verificado?**
3. **¿Quién asume la responsabilidad operativa de verificar la edad y el consentimiento parental — la Agencia IA (SaaS) o el club?**
4. **¿Se puede activar Comunidad Pádel 04 como demo/mock interna (sin datos reales, sin menores reales) mientras se resuelven las tres preguntas anteriores?** — ver `MATRIZ_BLOQUEOS_NO_TECNICOS_COMUNIDAD_PADEL_04.md` para la respuesta técnica a esta pregunta concreta.

## 3. Opción A — No permitir menores en fase inicial

**Descripción:** la capa social de Comunidad Pádel 04 se activa solo para socios mayores de edad (18+, o el umbral que determine el abogado/DPO tras revisar la normativa aplicable — este documento no fija una edad concreta como definitiva). Un club con socios menores puede seguir usando reservas/torneos/perfil premium normalmente; la capa social se desactiva por completo para esos perfiles, o para el club entero si no puede segmentar por edad de forma fiable.

### Riesgos
- Bajo riesgo legal (evita el problema en origen).
- Riesgo de producto: excluye a un segmento de usuarios que en pádel es habitual (familias, jugadores adolescentes) — puede debilitar el argumento comercial de "comunidad para todo el club".
- Riesgo operativo: requiere un mecanismo fiable de saber qué perfiles son menores, que hoy no existe en el sistema de auth real (fuera del alcance de este documento resolverlo).

### Impacto en producto
Mínimo — es la opción de menor esfuerzo de implementación y la más alineada con "más vale no ofrecer una función que ofrecerla mal".

### Impacto en UX
Un menor (o su tutor) vería la comunidad social como "no disponible para tu perfil", con un mensaje honesto, no un error técnico.

### Impacto en datos personales
El más bajo de las tres opciones — ningún dato social de un menor se trata en absoluto.

### Impacto en moderación
Ninguno adicional — el flujo de moderación ya diseñado (Prompt E) no necesita ningún caso especial.

### Impacto en soporte
Bajo — la única gestión de soporte es explicar por qué la comunidad no está disponible para ese perfil.

### Impacto en futuras integraciones
Ninguno — es la opción más simple de revertir más adelante si se decide ampliar.

## 4. Opción B — Permitir menores solo con consentimiento/verificación del tutor

**Descripción:** un menor puede activar la capa social solo tras un flujo de consentimiento parental verificado (mecanismo exacto a definir por el abogado/DPO — p. ej. doble opt-in por email del tutor, verificación de documento, o un proceso híbrido club+plataforma). Sin ese consentimiento verificado, el perfil del menor se comporta como en la Opción A.

### Riesgos
- Riesgo legal medio-alto si el mecanismo de verificación no es robusto (un simple checkbox "soy mayor de edad" o "tengo permiso de mis padres" no es una verificación real, y podría considerarse insuficiente).
- Riesgo de complejidad: requiere diseñar, implementar y mantener un flujo de verificación de identidad/parentesco que no existe hoy en ningún módulo de Club Pádel 04.
- Riesgo de fricción: un flujo de verificación parental real (no solo un checkbox) puede desincentivar el uso y generar carga de soporte.

### Impacto en producto
Alto — requiere una funcionalidad nueva completa (verificación parental), no cubierta por ningún documento ya mergeado del catálogo.

### Impacto en UX
Un flujo adicional de alta, con estados intermedios ("pendiente de verificación parental"), que no existe en ningún prototipo actual.

### Impacto en datos personales
Alto — implica tratar datos del tutor (contacto, posible verificación de identidad) además de los del menor, con una base jurídica y un plazo de retención propios, no definidos en ningún documento actual.

### Impacto en moderación
Mayor exigencia: la sección 18 de `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md` ya señala que la moderación de contenido de/sobre menores debería ser más estricta y rápida — no diseñado en detalle todavía.

### Impacto en soporte
Alto — gestión de incidencias de verificación parental fallida, tutores que quieren revocar el consentimiento, etc.

### Impacto en futuras integraciones
Bloquea la integración real hasta que exista el flujo de verificación — no se puede "activar a medias".

## 5. Opción C — Permitir menores en clubes concretos bajo responsabilidad operativa del club

**Descripción:** el club (no la Agencia IA/SaaS) asume la responsabilidad de verificar la edad y el consentimiento parental fuera de la plataforma (p. ej. como parte de su alta de socio ya existente en papel/presencial), y la plataforma solo activa la capa social para esos perfiles marcados como "verificado por el club".

### Riesgos
- Riesgo legal de responsabilidad compartida mal definida: si el club certifica algo que no verificó realmente, la plataforma podría considerarse corresponsable si no exige evidencia — **este es exactamente el tipo de pregunta que debe resolver el abogado/DPO, no este documento** (ver checklist de preguntas, sección 14).
- Riesgo de inconsistencia entre clubes: cada club podría aplicar un criterio distinto, generando un producto con garantías desiguales según el club.
- Menor riesgo de complejidad técnica que la Opción B (no hay que construir un flujo de verificación propio), pero mayor riesgo legal si el reparto de responsabilidad no queda documentado en el contrato con cada club.

### Impacto en producto
Medio — requiere un campo/flag "verificado por el club" y un proceso administrativo (probablemente `STAFF`/`ADMIN` del club marcando el perfil), no un flujo de usuario nuevo.

### Impacto en UX
Bajo para el menor/tutor (la gestión ocurre fuera de la app); medio para `STAFF`/`ADMIN` (nueva responsabilidad administrativa).

### Impacto en datos personales
Medio — la plataforma no trata directamente los datos de verificación (quedan en el club), pero sí almacena el resultado ("verificado: sí/no") — a definir con el abogado/DPO si eso es suficiente o si la plataforma necesita alguna evidencia mínima.

### Impacto en moderación
Igual que la Opción B — mismo requisito de moderación reforzada para menores, sin diseño detallado todavía.

### Impacto en soporte
Medio — principalmente disputas sobre si un club verificó correctamente o no.

### Impacto en futuras integraciones
Viable a medio plazo, pero requiere antes un acuerdo contractual claro de responsabilidad con cada club — **fuera del alcance técnico de este equipo**.

## 6. Recomendación MVP

**Opción A (no permitir menores en fase inicial)** es la recomendación de este documento para el primer lanzamiento de Comunidad Pádel 04, por ser la única de las tres que no depende de decisiones legales/contractuales aún no tomadas ni de funcionalidad nueva no diseñada. Las Opciones B y C quedan documentadas como evolución futura, no descartadas, sujetas a validación legal específica antes de considerarse de nuevo.

Esta recomendación es de producto, no jurídica — el abogado/DPO puede confirmarla, matizarla o rechazarla; este documento no la impone como definitiva.

## 7. Checklist para abogado/DPO

Ver documento dedicado `CHECKLIST_REVISION_LEGAL_EXTERNA_COMUNIDAD_PADEL_04.md` (mismo directorio) — no se duplica aquí para evitar que ambos documentos diverjan con el tiempo.

## 8. Preguntas concretas para revisión legal externa

1. ¿Qué edad mínima debe exigirse para la Opción A, considerando la normativa española/UE aplicable a redes sociales y tratamiento de datos de menores (LOPDGDD, RGPD, y cualquier normativa sectorial aplicable al deporte/ocio)?
2. Si se optara por la Opción B en el futuro, ¿qué mecanismo de verificación parental se considera suficiente (checkbox, email, documento, un tercero especializado)?
3. En la Opción C, ¿qué evidencia mínima debería conservar la plataforma de que el club verificó la edad/consentimiento, para no asumir una responsabilidad que no le corresponde ni tampoco desentenderse por completo?
4. ¿El contrato actual entre la Agencia IA y cada club ya cubre el reparto de responsabilidad sobre datos de menores, o requiere una cláusula nueva antes de activar cualquier opción distinta de la A?
5. ¿Es necesaria una Evaluación de Impacto relativa a la Protección de Datos (EIPD/DPIA) formal antes de activar la capa social para cualquier perfil, independientemente de la edad, dado el volumen de datos sociales tratados (ver `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`)?
6. ¿Los 15 textos legales ya redactados como borrador (`TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`) requieren un aviso específico de menores más allá del ya incluido (texto 13), y ese aviso cambia según la opción A/B/C finalmente elegida?

## 9. Decisión recomendada antes de integrar en App.jsx

**No integrar ninguna función social real para menores hasta que el abogado/DPO responda al menos las preguntas 1 y 5 de la sección 8.** Mientras tanto, Comunidad Pádel 04 puede evaluarse como demo/mock interna (datos ficticios, sin usuarios reales, sin distinción de edad real porque no hay usuarios reales) — ver `MATRIZ_BLOQUEOS_NO_TECNICOS_COMUNIDAD_PADEL_04.md` para la justificación técnica exacta de por qué esto es seguro y qué NO sería seguro hacer con datos reales.

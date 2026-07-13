# Landing Copy — Plantilla

**Uso**: escribir el texto real de la landing sección a sección, en sincronía con el diseño de Figma (mismas secciones, mismo orden). Adaptar el lenguaje según la tabla de sector al final de este documento.

Negocio: _____________________
Sector: _____________________
Tono elegido (del brief/auditoría visual): _____________________

---

## 1. Hero

- Titular (máx. 10 palabras, beneficio directo, no descripción técnica):
- Subtítulo (1-2 frases, aclara el "cómo"):
- CTA principal (verbo de acción + resultado, ej. "Reserva tu pista en 30 segundos"):
- CTA secundario (opcional, menor compromiso, ej. "Ver cómo funciona"):

## 2. Problema

- Descripción del problema actual del cliente objetivo (2-4 frases, en su lenguaje, no en el nuestro):
- 2-3 síntomas concretos del problema (listas cortas, situaciones reconocibles):

## 3. Solución

- Qué ofrece el negocio como solución (1 párrafo corto):
- Cómo se conecta con el problema descrito arriba (frase de transición):

## 4. Beneficios

- Beneficio 1 (título + 1 frase):
- Beneficio 2 (título + 1 frase):
- Beneficio 3 (título + 1 frase):
- Beneficio 4 (opcional):
- Regla: beneficios, no características técnicas ("ahorras tiempo", no "sistema con backend en la nube").

## 5. Proceso

- Paso 1:
- Paso 2:
- Paso 3:
- (máximo 4 pasos — si el proceso real tiene más, simplificar para la landing)

## 6. Prueba / caso base

- Testimonio real si existe (nombre, negocio/rol si aplica, cita corta):
- Si no hay testimonio real todavía: caso base honesto ("primer cliente en la zona", "sistema probado en Club Pádel 04 y adaptado a tu sector") — nunca inventar cifras o testimonios falsos.

## 7. CTA (llamada a la acción repetida)

- Texto del CTA que se repite a media página y al final:
- Debe ser el mismo verbo/acción que el CTA del Hero, no uno distinto.

## 8. FAQ

- Pregunta 1 + respuesta corta (objeción de precio):
- Pregunta 2 + respuesta corta (objeción de tiempo de implementación):
- Pregunta 3 + respuesta corta (objeción de "¿esto es para negocios como el mío?"):
- Pregunta 4 (opcional, específica del sector):

## 9. Formulario

- Título del formulario (orientado a la acción, no genérico "Contacto"):
- Campos mínimos: nombre, negocio, teléfono o email, mensaje breve (no pedir más de 4-5 campos, cada campo extra reduce conversión):
- Texto de confirmación tras enviar:

---

## Cómo adaptar el lenguaje según sector

| Sector | Lenguaje / tono | Evitar |
|---|---|---|
| **Salud** (dental, fisio, fertilidad, clínica) | Cercano pero profesional, énfasis en confianza, privacidad y cuidado; evitar tecnicismos clínicos | Promesas de resultado médico, urgencia agresiva, lenguaje alarmista |
| **Legal** (abogados/gestoría) | Serio, directo, autoridad sin frialdad; énfasis en claridad de proceso y seguimiento del caso | Jerga legal excesiva, tono comercial agresivo |
| **Deporte** (club, gimnasio) | Enérgico, cercano, sentido de comunidad; llamadas a la acción dinámicas | Tono corporativo/frío, exceso de tecnicismos de producto |
| **Estética** (peluquería/estética) | Cercano, visual, aspiracional sin ser inalcanzable; apoyo fuerte en imagen | Prometer resultados exagerados, comparaciones que generen inseguridad |
| **Animales** (veterinaria) | Cálido, familiar, tranquilizador; lenguaje sencillo | Tecnicismos veterinarios, tono distante |
| **Servicios profesionales** (consultoría, gestoría, otros) | Directo, orientado a ahorro de tiempo/dinero, ejemplos concretos | Vaguedad, promesas sin base |
| **Negocio local genérico** | Cercano, de barrio, confianza personal, mención de la zona/localidad | Tono de "startup tech" desconectado de lo local |

---

## Checklist antes de implementar en `04_landing/src/`

- [ ] Todas las secciones tienen texto real (no placeholders "lorem ipsum")
- [ ] CTA del Hero y CTA repetido usan el mismo verbo/acción
- [ ] FAQ cubre precio, tiempo de implementación y "es para mi negocio"
- [ ] Ningún testimonio o cifra inventada
- [ ] Tono revisado contra la tabla de sector
- [ ] Formulario con máximo 5 campos

# Brand System — Plantilla

**Uso**: se rellena después de `AUDITORIA_VISUAL_NEGOCIO_TEMPLATE.md`. Es el sistema visual que después se traduce a Figma (`04_landing/figma/FIGMA_SPEC_TEMPLATE.md`) y a código (`04_landing/src/`).

Negocio: _____________________
Sector: _____________________
Decisión base: ( ) Respetar marca existente  ( ) Crear marca nueva

---

## 1. Paleta principal

- Color primario (hex): _______ — uso: CTA, títulos destacados, elementos de marca
- Color secundario (hex): _______ — uso: acentos, iconos, estados
- Color neutro oscuro (hex): _______ — uso: texto principal
- Color neutro claro (hex): _______ — uso: fondos, tarjetas

## 2. Paleta secundaria / estados

- Éxito (hex): _______
- Aviso (hex): _______
- Error (hex): _______
- Enlace/interactivo (si distinto del primario) (hex): _______

## 3. Uso de fondo claro/oscuro

- ¿La landing es de base clara u oscura? (recomendado: clara para sectores salud/confianza; oscura solo si el sector y el cliente objetivo lo justifican, ej. gimnasio premium)
- Contraste mínimo texto/fondo: AA de WCAG (4.5:1 para texto normal) — comprobar antes de cerrar la paleta.

## 4. Tipografía recomendada

- Tipografía de títulos: (Google Fonts gratuita, ej. "Poppins", "Playfair Display", "Inter")
- Tipografía de cuerpo: (legible, ej. "Inter", "Source Sans 3")
- Jerarquía: H1 / H2 / H3 / body / caption — tamaños relativos, no fijar px hasta implementación.

## 5. Botones

- Botón primario: color de fondo, color de texto, radio de esquina, estado hover.
- Botón secundario: outline o fondo neutro.
- Botón terciario/enlace: solo texto con subrayado o color de acento.
- Regla: nunca más de un botón primario visible por sección.

## 6. Tarjetas

- Fondo, borde o sombra, radio de esquina, padding interno.
- Uso: servicios, testimonios, planes de precio.

## 7. Iconos

- Estilo: lineal / relleno / duotono — elegir uno y mantenerlo en toda la landing.
- Fuente de iconos gratuita recomendada (ej. Lucide, Phosphor, Heroicons).
- Uso de color: monocromo con el color primario, o duotono con primario+secundario.

## 8. Imágenes

- Estilo fotográfico objetivo (realista/local vs. producida/premium).
- Tratamiento (color natural, overlay de color de marca, blanco y negro con acento).
- Fuente: fotos propias del negocio (prioridad) > banco gratuito coherente con el sector (Unsplash, Pexels) > ilustración si no hay fotografía disponible.

## 9. Estilo de formularios

- Inputs: borde, radio, estado focus con color de marca.
- Mensajes de error/validación: color de estado "error", texto claro y no técnico.
- CTA de envío: siempre botón primario, texto orientado a la acción del sector ("Reservar cita", "Pedir diagnóstico gratis", "Quiero mi demo").

## 10. Estilo de secciones

- Ancho máximo de contenido, espaciado vertical entre secciones (consistente en toda la página).
- Alternancia de fondo (claro/neutro) para separar secciones sin usar solo líneas divisorias.

## 11. Reglas visuales

- Un máximo de 2 tipografías en toda la landing.
- Un máximo de 4-5 colores activos (principal, secundario, 2 neutros, 1 de estado) fuera de la escala de grises.
- Toda imagen debe tener una razón de sector (no usar imágenes genéricas de "oficina de startup" para una peluquería o clínica).
- Los CTA deben repetirse cada 2-3 scrolls, no solo al final.

## 12. Qué evitar

- Copiar la paleta verde/negro de Club Pádel 04 sin justificación de marca.
- Usar más de un estilo de icono a la vez.
- Mezclar tono premium con fotografía de stock de baja calidad (rompe la confianza más que no tener foto).
- Textos largos en el hero — el sistema visual debe soportar mensajes cortos y directos.

## 13. Cómo adaptar si el negocio ya tiene marca

1. Extraer colores exactos del logo/materiales existentes (no aproximar a ojo — usar cuentagotas sobre el archivo real).
2. Mantener el logo intacto; construir la paleta secundaria y neutra alrededor de él.
3. Si la tipografía de marca no es apta para pantalla (ej. una fuente decorativa de logo), usarla solo en el logo/H1 puntual y elegir una tipografía funcional para el resto.
4. Documentar en este archivo qué se heredó tal cual y qué se creó nuevo, para que el cliente entienda que se respetó su marca.

---

## Checklist antes de pasar a Figma

- [ ] Paleta principal y secundaria con códigos hex cerrados
- [ ] Tipografías elegidas y disponibles gratis
- [ ] Estilo de botones, tarjetas e iconos definido
- [ ] Fuente de imágenes decidida
- [ ] Reglas visuales documentadas (qué hacer y qué evitar)
- [ ] Confirmado si se respeta marca existente o se crea nueva, y por qué

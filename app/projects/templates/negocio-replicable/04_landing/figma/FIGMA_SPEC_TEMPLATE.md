# Figma Spec — Plantilla

**Uso**: guía para diseñar la landing en Figma (plan gratuito) a partir del `BRAND_SYSTEM_TEMPLATE.md` ya cerrado. No requiere Figma de pago — el plan free permite 3 archivos de diseño activos, suficiente para trabajar un negocio a la vez.

Negocio: _____________________

---

## 1. Instrucciones para diseñar en Figma gratis

1. Crear un archivo nuevo en Figma (plan Starter/gratis) llamado `landing-<slug-del-negocio>`.
2. Crear una página "Brand" con: paleta de color (swatches), tipografía (estilos de texto H1-H3-body-caption), botones, tarjetas, iconos — todo copiado desde `BRAND_SYSTEM_TEMPLATE.md`.
3. Crear una página "Landing Desktop" y una página "Landing Mobile" (frame 1440px y 375px respectivamente).
4. Usar Auto Layout en todos los frames de sección para que el diseño sea fácil de traducir a CSS/flexbox después.
5. Nombrar las secciones igual que en `04_landing/copy/LANDING_COPY_TEMPLATE.md` (Hero, Problema, Solución, Beneficios, Proceso, Prueba, CTA, FAQ, Formulario) — así el copy y el diseño quedan sincronizados 1:1.

## 2. Cómo adaptar colores

- Crear "Color styles" en Figma con los hex exactos del `BRAND_SYSTEM_TEMPLATE.md`, nombrados `primary`, `secondary`, `neutral-dark`, `neutral-light`, `success`, `warning`, `error`.
- No usar colores sueltos fuera de estos estilos — si hace falta un color nuevo, se añade primero al brand system, no directamente en el diseño.

## 3. Cómo adaptar tipografía

- Crear "Text styles" para H1, H2, H3, Body, Caption, Button — usando las tipografías gratuitas elegidas en el brand system.
- Si la fuente de marca no está en Google Fonts, buscar la alternativa gratuita más cercana antes de usar una fuente de pago.

## 4. Cómo adaptar iconos

- Usar un único set de iconos gratuito (Lucide, Phosphor o Heroicons vía plugin de Figma) coherente con el estilo elegido en el brand system.
- No mezclar sets de iconos distintos en la misma landing.

## 5. Cómo adaptar al sector

- Elegir 3-5 imágenes/ilustraciones representativas del sector para el Hero y la sección de Beneficios (fotos reales del negocio si existen; banco gratuito si no).
- Adaptar los iconos de la sección "Beneficios/Proceso" a acciones reales del sector (ej. "cita", "diagnóstico", "recordatorio" en salud; "reserva", "torneo", "ranking" en deporte; "presupuesto", "caso", "seguimiento" en legal).
- Evitar iconografía genérica de "app tech" (cohetes, gráficas abstractas) si el negocio es local y de confianza cercana — prioriza iconografía reconocible del sector.

## 6. Cómo respetar marca existente

- Si el negocio tiene logo, colocarlo en el header con espacio de seguridad (no deformar, no recolorear salvo versión monocromo oficial).
- Mantener el color primario de marca como color dominante del Hero y de los CTA, aunque el resto de la paleta sea nueva.

## 7. Cómo crear estilo SaaS sin perder identidad local

- Estructura de landing tipo SaaS (Hero claro + prueba social + beneficios + proceso + CTA repetido + FAQ) transmite modernidad y confianza.
- La identidad local se mantiene en: fotografía real, nombres de servicios reales, testimonios reales o creíbles, dirección/zona visible, tono de copy adaptado al sector (ver `04_landing/copy/LANDING_COPY_TEMPLATE.md`).
- No convertir el negocio en una landing de startup genérica: evitar mockups de "app" abstractos si el negocio es un local físico con clientes de proximidad — mostrar el local/servicio real siempre que sea posible.

## 8. Cómo diferenciar sectores en el mismo esqueleto de landing

| Sector | Qué cambia en el diseño |
|---|---|
| Clínica dental | Hero con foto de sonrisa/consulta, colores claros, iconos de salud, sección de confianza (colegiado, garantía) |
| Club deportivo | Hero dinámico con foto de instalación/partido, colores del club, sección de ranking/comunidad |
| Peluquería/estética | Hero con foto antes/después o ambiente del salón, tipografía más estilizada, galería visual destacada |
| Abogados | Hero sobrio, sin fotos de "stock corporativo" genérico si se puede evitar, énfasis en autoridad y casos resueltos |
| Veterinaria | Hero cálido con animales reales si hay fotos, colores cercanos, sección de confianza familiar |
| Negocio local genérico | Hero centrado en el problema cotidiano que resuelve, fotografía del local/equipo, tono cercano |

---

## Checklist antes de pasar a implementación (`04_landing/src/`)

- [ ] Archivo Figma creado con página Brand + Landing Desktop + Landing Mobile
- [ ] Color styles y text styles definidos (sin colores/fuentes sueltas)
- [ ] Secciones nombradas igual que el copy template
- [ ] Auto Layout aplicado en todas las secciones
- [ ] Revisión de coherencia sectorial (no parece landing genérica de otro sector)

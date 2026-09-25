# FACTORY — Experience Presets Reference

**Versión:** V1.7
**Módulo:** `fabrica-saas/core/dynamicExperience/presets.js`

---

## Catálogo completo

### `subtle`
Motion mínimo. Para clientes que requieren máxima sobriedad.
- Motion: `low` | Velocidad: `slow`
- Scroll: `['fade-in']`
- Hover: minimal | Card: none | Hero: fade
- Vídeo: none | Fallback: static
- **Uso:** Legal, clínicas muy formales, pacientes ansiosos

### `professional`
Estándar para negocios. Equilibrio entre dinamismo y profesionalidad.
- Motion: `low` | Velocidad: `normal`
- Scroll: `['fade-in', 'slide-up']`
- Hover: minimal | Card: subtle-lift | Hero: fade
- Vídeo: on-demand | Fallback: fade-only
- **Uso:** Consultas médicas, servicios profesionales

### `clinical`
Velocidad alta pero motion bajo. Para entornos sanitarios que necesitan
respuesta rápida sin distracciones.
- Motion: `low` | Velocidad: `fast`
- Scroll: `['fade-in', 'slide-up']`
- Hover: minimal | Card: subtle-lift | Hero: fade
- Vídeo: on-demand | Fallback: static
- **Uso:** Dental, clínicas, radiología

### `calm`
Movimiento suave y lento. Crea atmósfera de tranquilidad.
- Motion: `low` | Velocidad: `very-slow`
- Scroll: `['fade-in']`
- Hover: minimal | Card: subtle-lift | Hero: gradient-shift
- Vídeo: ambient-loop | Fallback: static
- **Uso:** Fisioterapia, psicología, fertilidad, bienestar

### `editorial`
Estilo revista. Revelados escalonados y tipografía protagonista.
- Motion: `medium` | Velocidad: `slow`
- Scroll: `['fade-in', 'slide-up', 'stagger-reveal']`
- Hover: moderate | Card: subtle-lift | Hero: slide-up
- Vídeo: on-demand | Fallback: fade-only
- **Uso:** Agencias, publicaciones, consultoras premium

### `luxury`
Lento y elegante. Parallax sutil, glow en cards.
- Motion: `medium` | Velocidad: `very-slow`
- Scroll: `['fade-in', 'slide-up', 'stagger-reveal', 'parallax-subtle']`
- Hover: moderate | Card: glow | Hero: gradient-shift
- Vídeo: ambient-loop | Fallback: fade-only
- **Uso:** Peluquería premium, estética, moda, interiorismo

### `friendly`
Cálido y dinámico. Stagger reveals y CTA llamativos.
- Motion: `medium` | Velocidad: `normal`
- Scroll: `['fade-in', 'slide-up', 'stagger-reveal']`
- Hover: moderate | Card: scale-up | Hero: slide-up
- Vídeo: on-demand | Fallback: fade-only
- **Uso:** Veterinaria, logopedia, clínicas pediátricas

### `energetic`
Alta energía. Counters animados, transiciones rápidas.
- Motion: `high` | Velocidad: `fast`
- Scroll: `['fade-in', 'slide-up', 'stagger-reveal', 'counter-on-visible']`
- Hover: deep | Card: scale-up | Hero: slide-up
- Vídeo: autoplay-silent | Fallback: fade-only
- **Uso:** Fitness, crossfit, centros deportivos

### `sports`
Deportivo. Vídeo en hero, stats animadas, progreso visible.
- Motion: `high` | Velocidad: `fast`
- Scroll: `['fade-in', 'slide-up', 'stagger-reveal', 'progress-on-scroll', 'counter-on-visible']`
- Hover: deep | Card: scale-up | Hero: video
- Vídeo: autoplay-silent | Fallback: minimal
- **Uso:** Clubs deportivos, gimnasios, equipos

### `tech-premium`
Tecnología de alto nivel. Sticky sections, counters, dashboard feel.
- Motion: `medium` | Velocidad: `fast`
- Scroll: `['fade-in', 'slide-up', 'stagger-reveal', 'sticky-section', 'counter-on-visible']`
- Hover: moderate | Card: subtle-lift | Hero: gradient-shift
- Vídeo: on-demand | Fallback: fade-only
- **Uso:** SaaS, agencias de tecnología, startups

### `immersive`
Totalmente envolvente. Parallax, sticky, tilt, vídeo.
- Motion: `high` | Velocidad: `slow`
- Scroll: `['fade-in', 'slide-up', 'stagger-reveal', 'parallax-subtle', 'sticky-section']`
- Hover: deep | Card: tilt | Hero: video
- Vídeo: autoplay-silent | Fallback: fade-only
- **Uso:** Luxury brands, experiencias premium, showrooms

---

## Asignación por vertical

| Vertical       | Preset default  | Motivo                              |
|----------------|-----------------|-------------------------------------|
| dental         | clinical        | Entorno sanitario, respuesta rápida |
| legal          | professional    | Autoridad, sobriedad                |
| physio         | calm            | Recuperación, tranquilidad          |
| fisioterapia   | calm            | Alias de physio                     |
| psychology     | calm            | Discreción, espacio mental          |
| speech-therapy | friendly        | Calidez, comunicación               |
| sports         | energetic       | Alta energía                        |
| veterinary     | friendly        | Cercanía, amor                      |
| hairdresser    | luxury          | Transformación, estilo              |
| beauty         | luxury          | Premium, bienestar                  |
| estetica       | luxury          | Alias de beauty                     |
| fertility      | calm            | Esperanza, delicadeza               |
| abogados       | professional    | Alias de legal                      |
| education      | professional    | Futuro vertical — arquitectura ready|

---

## Uso en manifest

```yaml
experience:
  preset: calm      # Nombre del preset
  motion: low       # Override de motionIntensity (opcional)
```

Si no se especifica preset, se usa el default del vertical.
Si el vertical no tiene mapping, se usa `professional`.

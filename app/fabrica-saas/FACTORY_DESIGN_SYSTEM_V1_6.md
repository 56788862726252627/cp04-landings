# FACTORY_DESIGN_SYSTEM_V1_6 — Sistema de Diseño Multisector

## Principio V1.6

El design system propio de la Fábrica es la identidad visual. shadcn/ui aporta la API de componentes, pero **no sus estilos por defecto** — los tokens del vertical siempre ganan.

## Arquitectura

```
fabrica-saas/
  core/
    branding/
      designSystem.js      ← tokens por vertical (10 verticales)
    ui/
      tokens.js            ← CSS vars shadcn-compatibles
      components.jsx       ← componentes con API shadcn, sin Tailwind
      index.js             ← re-export único
  AppShell.jsx             ← layout responsive (sidebar desktop, bottom nav mobile)
```

## 10 Verticales soportadas

| Vertical         | Primary     | Densidad     | Hero Style        | Sector icon |
|------------------|-------------|--------------|-------------------|-------------|
| `dental`         | `#0c7873`   | comfortable  | gradient-teal     | 🦷          |
| `legal`          | `#1e3a5f`   | compact      | dark-navy         | ⚖️          |
| `physio`         | `#0d9488`   | comfortable  | gradient-teal-light | 🏥        |
| `psychology`     | `#7c3aed`   | spacious     | warm-purple       | 🧠          |
| `speech-therapy` | `#0891b2`   | comfortable  | sky-wave          | 🗣️         |
| `sports`         | `#dc2626`   | compact      | dark-energy       | ⚽          |
| `veterinary`     | `#059669`   | comfortable  | nature-green      | 🐾          |
| `hairdresser`    | `#b45309`   | comfortable  | warm-amber        | ✂️          |
| `beauty`         | `#9d174d`   | spacious     | pink-gradient     | ✨          |
| `fertility`      | `#0e7490`   | spacious     | ocean-calm        | 🌸          |

**Backward compat aliases:** `fisioterapia` → `physio`, `estetica` → `beauty`, `abogados` → `legal`

## API del design system

```javascript
import {
  getTokens,           // (vertical, brandingOverride) → token object
  getVerticalTheme,    // alias de getTokens
  getVerticalSector,   // (vertical) → { icon, label, entity, booking }
  getVerticalStyle,    // (vertical) → { density, heroStyle, ctaStyle, ... }
  getSupportedVerticals, // () → string[]
  generateThemeCss,    // (tokens) → CSS string con custom properties
  VERTICAL_TOKENS,     // objeto completo de todos los tokens
} from '../../core/branding/designSystem.js';
```

## API de componentes shadcn-compatibles

```javascript
import {
  Button, Badge, Input, Textarea, Select, Label, Separator, Skeleton, Tooltip,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Alert, AlertTitle, AlertDescription,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '../../core/ui/index.js';
```

Misma API que shadcn/ui. Sin Tailwind. Sin dependencias externas.

## Tokens CSS (shadcn-compat)

Variables disponibles:
```css
--primary, --primary-foreground
--secondary, --secondary-foreground
--background, --foreground
--card, --card-foreground
--muted, --muted-foreground
--border, --input, --ring
--destructive, --destructive-foreground
--success, --warning, --info
--radius, --radius-sm, --radius-lg, --radius-full
--shadow-sm, --shadow-md, --shadow-lg
--font-sans, --font-mono
--transition
```

## Tokens por vertical extendidos V1.6

Cada vertical ahora incluye un objeto `style` con:
- `density` — compact | comfortable | spacious
- `iconStyle` — filled | outline | soft | bold
- `heroStyle` — nombre semántico del estilo de hero image
- `cardStyle` — elevated-border | flat-border | soft-shadow | sharp-border
- `ctaStyle` — rounded-solid | square-solid | pill-solid
- `sidebarStyle` — light-border | dark-navy | dark-strong | light-*
- `imageTreatment` — rounded-soft | sharp | circle-soft | rounded-large

```javascript
import { getVerticalStyle } from '../../core/branding/designSystem.js';
const style = getVerticalStyle('dental');
// → { density: 'comfortable', heroStyle: 'gradient-teal', ... }
```

## Generación CSS

```javascript
const tokens = getTokens('dental', { primaryColor: '#0c7873' });
const css    = generateThemeCss(tokens);
// → bloque :root con todos los custom properties
```

## Política: shadcn vs inline styles

| Contexto                      | Estrategia                                    |
|-------------------------------|-----------------------------------------------|
| Componentes nuevos en `core/` | Usar `core/ui/components.jsx` (shadcn API)    |
| Módulos generados en `output/`| Inline styles + ACCENT = tokens.colors.primary|
| AppShell                      | Inline styles + state responsive              |
| CSS global (`:root`)          | `generateThemeCss()` para inyectar en `<style>`|

## Override por cliente

```yaml
# En manifest-gen.yaml
branding:
  primaryColor: "#custom-hex"
  secondaryColor: "#custom-hex"
  accentColor: "#custom-hex"
design:
  vertical: dental
  density: compact
  style: flat-border
```

Luego: `getTokens('dental', manifest.branding)` aplica el override automáticamente.

## Añadir un nuevo vertical

1. Añadir entrada en `VERTICAL_TOKENS` en `designSystem.js`
2. Añadir a `V16_SUPPORTED_VERTICALS` en `v1.6Schema.js`
3. Añadir placeholder image config en `mediaEngine.js`
4. Añadir test en `v1.6-cases.test.mjs`
5. Documentar en este archivo

Tiempo estimado: ~30 minutos con TIER 1 (OpenCode + Ollama).

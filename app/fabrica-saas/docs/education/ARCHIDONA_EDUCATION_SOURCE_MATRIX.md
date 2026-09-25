# Matriz de Fuentes — Centros Educativos Archidona
# Fábrica SaaS — Investigación pre-implementación
# Fecha: 2026-08-29

## INSTRUCCIÓN DE USO

Columnas:
- **dato**: información educativa
- **etapa**: Primaria / ESO / Bachillerato / FP
- **centro**: IES José Navarro y Alba (IJNA) | IES Luis Barahona de Soto (ILBS) | Ambos
- **fuente**: origen de la información
- **estado**: VERIFIED | LEGAL_ONLY | UNVERIFIED | HISTORICAL

**REGLA CRÍTICA**: Estado LEGAL_ONLY significa que la normativa lo permite, pero no se ha confirmado que el centro concreto lo ofrezca actualmente.
**NUNCA convertir UNVERIFIED en hecho de la demo.**

---

## CENTRO 1: IES José Navarro y Alba

| dato | etapa | fuente | estado |
|------|-------|--------|--------|
| Imparte ESO | ESO | iesjosenavarroyalba.es (web oficial), búsqueda 2026 | VERIFIED |
| Imparte Bachillerato | Bachillerato | iesjosenavarroyalba.es, ciclosformativosfp.com | VERIFIED |
| Imparte FP (Ciclos Formativos) | FP | iesjosenavarroyalba.es/ciclos-2/, búsqueda 2026 | VERIFIED |
| Imparte FPB (FP Básica) | FP | iesjosenavarroyalba.es, búsqueda 2026 | VERIFIED |
| Ciclo Formativo: Gestión Administrativa | FP | ciclosformativosfp.com | VERIFIED |
| Ciclo Formativo: Instalaciones Eléctricas y Automáticas | FP | ciclosformativosfp.com | VERIFIED |
| Modalidades Bachillerato específicas | Bachillerato | No encontrado en búsqueda | UNVERIFIED |
| Número de grupos ESO | ESO | No verificado | UNVERIFIED |
| Optativas específicas ofertadas | ESO/Bach | No verificado | UNVERIFIED |
| Lengua extranjera L2 ofertada | Múltiples | No verificado | UNVERIFIED |

**Dirección verificada**: Avenida Llano de Pablo Picasso s/n, 29300, Archidona, Málaga.

---

## CENTRO 2: IES Luis Barahona de Soto

| dato | etapa | fuente | estado |
|------|-------|--------|--------|
| Imparte ESO | ESO | micole.net, buscadordecentros.com, búsqueda 2026 | VERIFIED |
| Imparte Bachillerato | Bachillerato | micole.net, búsqueda 2026 | VERIFIED |
| Más de 400 alumnos matriculados (ESO+Bach) | Múltiples | micole.net | VERIFIED |
| 42 profesores aproximadamente | - | micole.net | VERIFIED |
| Modalidad Bachillerato: Ciencias y Tecnología (presencial diurna) | Bachillerato | micole.net | VERIFIED |
| Modalidad Bachillerato: Humanidades y CC. Sociales (presencial diurna) | Bachillerato | micole.net | VERIFIED |
| NO imparte Artes (no confirmado) | Bachillerato | Inferido de ausencia en fuentes | UNVERIFIED |
| Edificio histórico (1794, BIC catalogado) | - | juntadeandalucia.es | VERIFIED |
| Optativas específicas | ESO/Bach | No verificado | UNVERIFIED |
| FP / ciclos | FP | No encontrado en búsqueda | UNVERIFIED |

**Dirección verificada**: Calle Carrera 37, Archidona.

---

## PARA LA DEMO EducaArchidona

La demo EducaArchidona es **genérica y ficticia**. No representa a ninguno de los dos centros. Utiliza la normativa verificada para estructurar correctamente las etapas y materias. Los datos ficticios del demo deben estar etiquetados como tales.

### Decisiones de diseño basadas en investigación verificada:
- Etapas representadas: Primaria (completa), ESO (completa), Bachillerato (1º y 2º)
- Modalidades Bachillerato en demo: Ciencias y Tecnología + Humanidades y CC.SS. (ambas VERIFIED en IES Luis Barahona)
- FP: arquitectura preparada pero NO desplegada en demo V1
- Materias ESO: basadas en Decreto 102/2023 (LEGAL)
- Materias Bachillerato: basadas en Decreto 103/2023 (LEGAL)

*Fábrica SaaS — Demo ficticia. No representa a ningún centro real sin verificación adicional.*

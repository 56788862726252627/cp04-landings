# FACTORY_LOCAL_AI — Runtime Local con Ollama + OpenCode

## Configuración actual

| Parámetro       | Valor                     |
|-----------------|---------------------------|
| Ollama versión  | 0.33.2                    |
| Modelo elegido  | `qwen2.5-coder:1.5b`      |
| Tamaño modelo   | 986 MB (Q4 quantized)     |
| RAM estimada    | ~1.2 GB en inferencia     |
| RAM disponible  | ~2.6 GB (aarch64 PRoot)   |
| Hardware fit    | ✓ Funcional (ajustado)    |
| OpenCode ver.   | 1.18.25                   |
| Host Ollama     | `http://127.0.0.1:11434`  |

## Modelo elegido: qwen2.5-coder:1.5b

**Por qué qwen2.5-coder:1.5b:**
- Especializado en código (Alibaba/Qwen)
- 1.5B parámetros Q4 → cabe en 2GB RAM con margen
- Buen rendimiento en generación repetitiva, búsqueda, boilerplate
- Licencia Apache 2.0 (libre para uso comercial)
- Coste: 0 €

**Limitaciones conocidas:**
- Contexto máximo: ~4096 tokens por defecto
- No apto para decisiones de arquitectura complejas → usar Claude (TIER 3)
- Inferencia CPU-only en aarch64 (sin GPU) → más lento que GPU (2–8 tok/s estimado)

## Comandos

### Arrancar Ollama

```bash
# En segundo plano
OLLAMA_HOST=127.0.0.1:11434 ollama serve &

# Verificar que está corriendo
curl http://127.0.0.1:11434/
# → "Ollama is running"
```

### Modelos disponibles

```bash
ollama list
# → NAME                  ID              SIZE
# → qwen2.5-coder:1.5b    d7372fd82851    986 MB
```

### Ejecutar OpenCode con modelo local

```bash
npm run factory:ai:local
# → Abre OpenCode con qwen2.5-coder:1.5b via Ollama
```

### Verificar disponibilidad

```bash
npm run factory:ai:check
# → "Local AI: AVAILABLE" o "Local AI: UNAVAILABLE"
```

### Parar Ollama

```bash
pkill -f "ollama serve"
# o simplemente cerrar el terminal
```

### Cambiar modelo

```bash
# Instalar modelo alternativo (si hay RAM suficiente)
ollama pull deepseek-r1:1.5b    # razonamiento, ~1GB
ollama pull phi4-mini:3.8b      # ~2.2GB — necesita liberar RAM

# Actualizar config en:
# fabrica-saas/.ai/opencode/config.json → "model": "ollama/nuevo-modelo"
```

### Volver a Claude

Simplemente usa Claude Code directamente (sin `npm run factory:ai:local`).
Claude siempre está disponible para TIER 3 y TIER 4.

## Hardware check (aarch64, PRoot-Distro)

```
RAM total:      7292 MB
RAM disponible: ~2600 MB (varía según procesos activos)
Arquitectura:   aarch64 (ARM64)
GPU:            Ninguna (CPU-only)
Disco libre:    ~91 GB
```

**Nota PRoot:** Ollama funciona en modo CPU-only en este entorno.  
Vulkan está habilitado en config pero sin GPU física no aplica.  
El modelo 1.5B es el máximo práctico sin afectar al sistema operativo base.

## Tabla de modelos recomendados por RAM disponible

| RAM disponible | Modelo recomendado         | Tamaño  |
|----------------|---------------------------|---------|
| < 1.5 GB       | No recomendado             | —       |
| 1.5–2.5 GB     | `qwen2.5-coder:0.5b`      | ~397 MB |
| 2.5–4 GB       | `qwen2.5-coder:1.5b` ✓    | ~986 MB |
| 4–8 GB         | `qwen2.5-coder:3b`        | ~1.9 GB |
| 8+ GB          | `qwen2.5-coder:7b`        | ~4.4 GB |

## Integración con la Factory

OpenCode configurado en `fabrica-saas/.ai/opencode/config.json`:
```json
{
  "provider": { "ollama": { "api": "http://127.0.0.1:11434/v1" } },
  "model": "ollama/qwen2.5-coder:1.5b",
  "autoshare": false
}
```

Ver política de uso: `fabrica-saas/.ai/opencode/POLICY.md`

## Flag de disponibilidad

El router `core/aiRouter.js` expone `checkLocalModelAvailable()` que consulta `GET /api/tags` en Ollama.  
`LOCAL_MODEL_AVAILABLE` efectivo se obtiene con:

```bash
npm run factory:ai:check
```

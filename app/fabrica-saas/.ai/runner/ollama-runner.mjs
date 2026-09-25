#!/usr/bin/env node
/**
 * ollama-runner — headless Ollama API runner for Fábrica SaaS
 * Uses Ollama /api/generate REST endpoint directly.
 * No TUI, no external connections, no credentials.
 *
 * Usage:
 *   node ollama-runner.mjs --prompt "analyze this" [options]
 *
 * Options:
 *   --prompt      Required. Task/question for the model.
 *   --model       Model name (default: qwen2.5-coder:1.5b)
 *   --context     Optional file path for context (read-only, scoped to fabrica-saas/)
 *   --max-tokens  Max tokens to generate (default: 300)
 *   --timeout     Timeout in seconds (default: 120)
 *   --host        Ollama host (default: 127.0.0.1:11434 — localhost only)
 *   --json        Output JSON with metrics
 *   --silent      Suppress headers, only print model response
 *
 * Exit codes:
 *   0 — success
 *   1 — error
 *   2 — Ollama unavailable
 *   3 — timeout
 *   4 — invalid arguments
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const FACTORY_ROOT = resolve(__dir, '../../');

// ─── Pure testable functions ───────────────────────────────────────────────

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

export function validateHost(host) {
  if (!host.startsWith('127.0.0.1') && !host.startsWith('localhost')) {
    return { valid: false, reason: `HOST must be localhost or 127.0.0.1. Got: ${host}` };
  }
  return { valid: true };
}

export function buildPrompt(contextText, prompt) {
  if (!contextText) return prompt;
  return `CONTEXT:\n---\n${contextText}\n---\n\nTASK: ${prompt}`;
}

export function truncateContext(text, maxChars = 8000) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n[...context truncated to ' + maxChars + ' chars...]';
}

export async function checkOllamaAvailable(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.models) && data.models.length > 0;
  } catch {
    return false;
  }
}

export async function runInference(baseUrl, model, prompt, maxTokens, timeoutSec) {
  const body = JSON.stringify({
    model,
    prompt,
    stream: true,
    options: { num_predict: maxTokens, temperature: 0.1 },
  });

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(timeoutSec * 1000),
  });

  if (!res.ok) throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);

  let fullResponse = '';
  let lastChunk = {};
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    for (const line of text.split('\n').filter(Boolean)) {
      try {
        const chunk = JSON.parse(line);
        fullResponse += chunk.response ?? '';
        if (chunk.done) lastChunk = chunk;
      } catch { /* skip malformed chunk */ }
    }
  }

  return { response: fullResponse, metrics: lastChunk };
}

// ─── CLI entrypoint ────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));

  if (!args.prompt) {
    process.stderr.write('Error: --prompt is required\n');
    process.stderr.write('Usage: node ollama-runner.mjs --prompt "task" [--context file] [--model name]\n');
    process.exit(4);
  }

  const MODEL     = args.model    ?? 'qwen2.5-coder:1.5b';
  const MAX_TOKS  = parseInt(args['max-tokens'] ?? '300', 10);
  const TIMEOUT_S = parseInt(args.timeout ?? '120', 10);
  const HOST      = args.host ?? '127.0.0.1:11434';
  const AS_JSON   = args.json === true;
  const SILENT    = args.silent === true;

  const hostCheck = validateHost(HOST);
  if (!hostCheck.valid) {
    process.stderr.write(`Error: ${hostCheck.reason}\n`);
    process.exit(4);
  }

  const BASE_URL = `http://${HOST}`;

  // Load context file (scoped to fabrica-saas/)
  let contextText = '';
  if (args.context) {
    const ctxPath = resolve(process.cwd(), args.context);
    if (!ctxPath.startsWith(FACTORY_ROOT)) {
      process.stderr.write(`Error: context file must be within fabrica-saas/. Got: ${ctxPath}\n`);
      process.exit(4);
    }
    if (!existsSync(ctxPath)) {
      process.stderr.write(`Error: context file not found: ${ctxPath}\n`);
      process.exit(1);
    }
    contextText = truncateContext(readFileSync(ctxPath, 'utf-8'));
  }

  const fullPrompt = buildPrompt(contextText, args.prompt);
  const start = Date.now();

  const available = await checkOllamaAvailable(BASE_URL);
  if (!available) {
    process.stderr.write(`Error: Ollama not available at ${BASE_URL}.\nStart it with: ollama serve\n`);
    process.exit(2);
  }

  if (!SILENT) {
    process.stderr.write(`[factory:ai:run] model=${MODEL} host=${HOST} max-tokens=${MAX_TOKS} timeout=${TIMEOUT_S}s\n`);
    if (contextText) process.stderr.write(`[factory:ai:run] context loaded: ${contextText.length} chars\n`);
  }

  let result;
  try {
    result = await runInference(BASE_URL, MODEL, fullPrompt, MAX_TOKS, TIMEOUT_S);
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      process.stderr.write(`Error: inference timed out after ${TIMEOUT_S}s\n`);
      process.exit(3);
    }
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  const elapsed = Date.now() - start;
  const m = result.metrics;
  const tokensGenerated = m.eval_count ?? 0;
  const tokensPrompt    = m.prompt_eval_count ?? 0;
  const durationSec     = m.total_duration ? (m.total_duration / 1e9).toFixed(2) : (elapsed / 1000).toFixed(2);
  const tokPerSec       = tokensGenerated > 0 && parseFloat(durationSec) > 0
    ? (tokensGenerated / parseFloat(durationSec)).toFixed(1)
    : null;

  if (AS_JSON) {
    process.stdout.write(JSON.stringify({
      response:         result.response,
      model:            MODEL,
      tokens_generated: tokensGenerated,
      tokens_prompt:    tokensPrompt,
      duration_sec:     parseFloat(durationSec),
      tok_per_sec:      tokPerSec ? parseFloat(tokPerSec) : null,
      wall_ms:          elapsed,
      claude_used:      false,
      host:             BASE_URL,
    }, null, 2) + '\n');
  } else {
    process.stdout.write(result.response + '\n');
    if (!SILENT) {
      process.stderr.write(`[factory:ai:run] done — ${tokensGenerated} tokens in ${durationSec}s` +
        (tokPerSec ? ` (${tokPerSec} tok/s)` : '') + '\n');
    }
  }
}

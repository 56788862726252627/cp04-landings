// App 3 · Prompt 3/6 — BrowserCaptureAdapter.
//
// Envuelve playwright-core (ya usado como herramienta de auditoría en
// toda esta sesión; añadido ahora como devDependency real, instalado
// en modo --offline desde la caché local de npm — 0 llamadas de red)
// para lanzar Chromium headless y tomar capturas reales. El binario de
// Chromium ya estaba cacheado en este entorno (`chromium-1228`); este
// adaptador lo localiza sin descargar nada nuevo.
//
// `launcher` es inyectable (por defecto, el propio `chromium` de
// playwright-core) — permite testear la lógica de resolución de rutas
// y el contrato de cp04Capture sin lanzar un navegador real en cada
// test unitario.

import { existsSync } from "node:fs";
import process from "node:process";

const CANDIDATE_EXECUTABLE_PATHS = Object.freeze([
  "/root/.cache/ms-playwright/chromium-1228/chrome-linux/chrome",
  "/root/.cache/ms-playwright/chromium-1140/chrome-linux/chrome",
]);

/** Busca un Chromium ya cacheado en el sistema, sin descargar nada. Devuelve null si no encuentra ninguno (nunca lanza). */
export function cp04ResolveChromiumExecutablePath(env = process.env) {
  if (env.CP04_CHROMIUM_EXECUTABLE_PATH && existsSync(env.CP04_CHROMIUM_EXECUTABLE_PATH)) {
    return env.CP04_CHROMIUM_EXECUTABLE_PATH;
  }
  for (const candidate of CANDIDATE_EXECUTABLE_PATHS) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export function cp04IsBrowserCaptureAvailable(env = process.env) {
  return cp04ResolveChromiumExecutablePath(env) !== null;
}

/**
 * @param {{launcher?: object, env?: object}} [options] - `launcher` debe exponer `.launch(opts)` como playwright-core's `chromium`.
 */
export function cp04CreateBrowserCaptureAdapter(options = {}) {
  const env = options.env || process.env;
  let launcherPromise;
  async function getLauncher() {
    if (options.launcher) return options.launcher;
    if (!launcherPromise) launcherPromise = import("playwright-core").then((mod) => mod.chromium);
    return launcherPromise;
  }

  let browser = null;
  async function ensureBrowser() {
    if (browser) return browser;
    const executablePath = cp04ResolveChromiumExecutablePath(env);
    if (!executablePath) {
      throw new Error("No se encontró ningún Chromium cacheado en este entorno (CP04_CHROMIUM_EXECUTABLE_PATH sin definir y ninguna ruta candidata existe).");
    }
    const launcher = await getLauncher();
    browser = await launcher.launch({ executablePath, args: ["--no-sandbox"] });
    return browser;
  }

  return {
    /**
     * @param {{url:string, viewport:{width:number,height:number,deviceScaleFactor?:number}, fullPage?:boolean, selector?:string, timeoutMs?:number}} request
     * @returns {{buffer:Buffer, actualWidth:number, actualHeight:number, scrollWidth:number}}
     */
    async capture(request) {
      const b = await ensureBrowser();
      const page = await b.newPage({
        viewport: { width: request.viewport.width, height: request.viewport.height },
        deviceScaleFactor: request.viewport.deviceScaleFactor || 1,
      });
      try {
        await page.goto(request.url, { waitUntil: "load", timeout: request.timeoutMs || 15000 });

        // Estabilización (Fase 4): fuentes, imágenes, sin animaciones —
        // nunca modifica los archivos de la app, solo el DOM ya cargado
        // en esta página de captura.
        await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
        await page.evaluate(() => document.fonts?.ready).catch(() => {});
        await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete)).catch(() => {});

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

        const target = request.selector ? page.locator(request.selector) : page;
        const buffer = await target.screenshot({ type: "png", fullPage: request.fullPage === true });

        return { buffer, actualWidth: request.viewport.width, actualHeight: request.viewport.height, scrollWidth };
      } finally {
        await page.close();
      }
    },

    async close() {
      if (browser) {
        await browser.close();
        browser = null;
      }
    },
  };
}

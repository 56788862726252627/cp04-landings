// App 3 · Prompt 4/6 — PptxPipeline.
//
// Punto de integración único de PPTX, reutilizado por PresentationPipeline
// (mismo deck `{title, slides}` que ya usa para markdown/html). Motor
// real: `binary/pptxEngine.js` (`pptxgenjs`, pura JS, sin red).

import { cp04GeneratePptxFromDeck } from "./binary/pptxEngine.js";

/**
 * @param {{title:string, slides:object[]}} deck
 * @returns {Promise<{status:"completed"|"failed", format:"pptx", buffer?:Buffer, slideCount?:number, reason?:string}>}
 */
export async function cp04GeneratePptx(deck) {
  if (!deck || !Array.isArray(deck.slides)) {
    return { status: "failed", format: "pptx", reason: "cp04GeneratePptx requiere deck.slides (presentación)" };
  }
  const result = await cp04GeneratePptxFromDeck(deck);
  return { ...result, format: "pptx" };
}

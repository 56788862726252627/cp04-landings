import { useEffect, useState } from 'react';

/**
 * Hook mejorado: Fallback robusto, scroll, cálculo y posicionamiento inteligente.
 */
export const useTutorialOrchestrator = (stepData, current, onNavigate) => {
  const [targetRect, setTargetRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (!stepData) return;

    let scrollTimeoutId = null;
    let rectTimeoutId = null;

    const executeStep = () => {
      // 1. Navegación
      if (stepData.targetModule && current !== stepData.targetModule) {
        onNavigate(stepData.targetModule);
      }

      // 2. Búsqueda con Fallback a #root
      scrollTimeoutId = setTimeout(() => {
        let el = document.querySelector(stepData.selector);
        if (!el) el = document.getElementById('root') || document.body;

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        rectTimeoutId = setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect({
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height,
            isFallback: !document.querySelector(stepData.selector)
          });
        }, 400);
      }, 600);
    };

    executeStep();

    // Si stepData/current cambian (o el componente se desmonta) antes de que
    // los timers disparen, se cancelan: evita que un setTargetRect tardío
    // pise el estado de un paso más reciente del tutorial.
    return () => {
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
      if (rectTimeoutId) clearTimeout(rectTimeoutId);
    };
  }, [stepData, current]);

  return targetRect;
};

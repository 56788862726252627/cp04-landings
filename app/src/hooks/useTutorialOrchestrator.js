import { useEffect, useState } from 'react';

/**
 * Hook mejorado: Fallback robusto, scroll, cálculo y posicionamiento inteligente.
 */
export const useTutorialOrchestrator = (stepData, current, onNavigate) => {
  const [targetRect, setTargetRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (!stepData) return;

    const executeStep = () => {
      // 1. Navegación
      if (stepData.targetModule && current !== stepData.targetModule) {
        onNavigate(stepData.targetModule);
      }

      // 2. Búsqueda con Fallback a #root
      setTimeout(() => {
        let el = document.querySelector(stepData.selector);
        if (!el) el = document.getElementById('root') || document.body;

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
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
  }, [stepData, current]);

  return targetRect;
};

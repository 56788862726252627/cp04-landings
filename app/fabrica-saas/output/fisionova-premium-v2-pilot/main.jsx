/**
 * FisioNova Premium V2 Pilot — Entry point
 * Demo comercial · Datos ficticios · NO producción
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FisioNovaPilotApp } from './FisioNovaPilotApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FisioNovaPilotApp />
  </StrictMode>
);

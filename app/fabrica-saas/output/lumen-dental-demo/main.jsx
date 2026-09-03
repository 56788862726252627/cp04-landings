/**
 * Entry point — Lumen Dental Showcase Demo
 * Fábrica SaaS V1.8 · NO_REAL_EXTERNAL_ACTION=SI
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LumenDentalPremiumApp } from './LumenDentalPremiumApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LumenDentalPremiumApp />
  </StrictMode>
);

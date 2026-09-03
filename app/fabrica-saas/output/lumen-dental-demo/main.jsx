/**
 * Entry point — Lumen Dental Showcase Demo
 * Fábrica SaaS V1.8 · NO_REAL_EXTERNAL_ACTION=SI
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LumenDentalShowcaseApp } from './LumenDentalShowcaseApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LumenDentalShowcaseApp />
  </StrictMode>
);

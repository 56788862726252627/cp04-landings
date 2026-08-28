import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AbogadosApp } from './AbogadosApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AbogadosApp />
  </StrictMode>
);

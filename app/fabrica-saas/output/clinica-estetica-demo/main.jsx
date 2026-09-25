import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EsteticaApp } from './EsteticaApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EsteticaApp />
  </StrictMode>
);

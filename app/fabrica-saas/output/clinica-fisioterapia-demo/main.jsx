import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PhysioApp } from './PhysioApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PhysioApp />
  </StrictMode>
);

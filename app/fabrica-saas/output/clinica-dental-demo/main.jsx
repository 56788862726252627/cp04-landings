import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DentalApp } from './DentalApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DentalApp />
  </StrictMode>
);

/**
 * OUTPUT · Clínica Estética Demo · App principal
 * Reutiliza CORE (AppShell). Mismo patrón que DentalApp y PhysioApp.
 * Sin secretos, sin llamadas externas, sin credenciales.
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
import { EsteticaChatbot } from './EsteticaChatbot.jsx';
import { EsteticaCrm } from './EsteticaCrm.jsx';
import { EsteticaRecovery } from './EsteticaRecovery.jsx';
import { EsteticaDashboard } from './EsteticaDashboard.jsx';

const BRANDING = {
  nombre: 'Clínica Estética Demo',
  inicial: 'E',
};

const TABS = [
  { id: 'chatbot',   label: 'Asistente IA',  icon: '🤖' },
  { id: 'crm',       label: 'CRM',            icon: '📋' },
  { id: 'recovery',  label: 'Recuperación',   icon: '🔄' },
  { id: 'dashboard', label: 'Dashboard',      icon: '📊' },
];

export function EsteticaApp() {
  const [activeTab, setActiveTab] = useState('chatbot');

  const renderTab = () => {
    switch (activeTab) {
      case 'chatbot':   return <EsteticaChatbot />;
      case 'crm':       return <EsteticaCrm />;
      case 'recovery':  return <EsteticaRecovery />;
      case 'dashboard': return <EsteticaDashboard />;
      default:          return <EsteticaChatbot />;
    }
  };

  return (
    <AppShell
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      branding={BRANDING}
    >
      {renderTab()}
    </AppShell>
  );
}

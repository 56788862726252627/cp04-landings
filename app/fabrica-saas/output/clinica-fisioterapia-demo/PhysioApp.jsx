/**
 * OUTPUT · Clínica Fisioterapia Demo · App principal
 * Reutiliza CORE (AppShell) + importa VERTICAL fisioterapia.
 * Mismo patrón que DentalApp: branding + tabs + renderizado condicional.
 * No importa ni exporta secretos, webhooks ni credenciales.
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
import { PhysioChatbot } from './PhysioChatbot.jsx';
import { PhysioCrm } from './PhysioCrm.jsx';
import { PhysioRecovery } from './PhysioRecovery.jsx';
import { PhysioDashboard } from './PhysioDashboard.jsx';

const BRANDING = {
  nombre: 'Clínica Fisioterapia Demo',
  inicial: 'F',
};

const TABS = [
  { id: 'chatbot',   label: 'Asistente IA',  icon: '🤖' },
  { id: 'crm',       label: 'CRM',            icon: '📋' },
  { id: 'recovery',  label: 'Recuperación',   icon: '🔄' },
  { id: 'dashboard', label: 'Dashboard',      icon: '📊' },
];

export function PhysioApp() {
  const [activeTab, setActiveTab] = useState('chatbot');

  const renderTab = () => {
    switch (activeTab) {
      case 'chatbot':   return <PhysioChatbot />;
      case 'crm':       return <PhysioCrm />;
      case 'recovery':  return <PhysioRecovery />;
      case 'dashboard': return <PhysioDashboard />;
      default:          return <PhysioChatbot />;
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

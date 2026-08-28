/**
 * OUTPUT · Clínica Dental Demo · App principal
 * Compone CORE (AppShell) + VERTICAL (dental) + CLIENTE (branding, módulos).
 * No importa ni exporta secretos, webhooks ni credenciales reales.
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
import { DentalChatbot } from './DentalChatbot.jsx';
import { DentalCrm } from './DentalCrm.jsx';
import { DentalRecovery } from './DentalRecovery.jsx';
import { DentalDashboard } from './DentalDashboard.jsx';

const BRANDING = {
  nombre: 'Clínica Dental Demo',
  inicial: 'D',
};

const TABS = [
  { id: 'chatbot',    label: 'Asistente IA',      icon: '🤖' },
  { id: 'crm',        label: 'CRM',                icon: '📋' },
  { id: 'recovery',   label: 'Recuperación',       icon: '🔄' },
  { id: 'dashboard',  label: 'Dashboard',           icon: '📊' },
];

export function DentalApp() {
  const [activeTab, setActiveTab] = useState('chatbot');

  const renderTab = () => {
    switch (activeTab) {
      case 'chatbot':   return <DentalChatbot />;
      case 'crm':       return <DentalCrm />;
      case 'recovery':  return <DentalRecovery />;
      case 'dashboard': return <DentalDashboard />;
      default:          return <DentalChatbot />;
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

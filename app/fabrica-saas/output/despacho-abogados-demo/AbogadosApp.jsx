/**
 * OUTPUT · Despacho Abogados Demo · App principal
 * Reutiliza CORE (AppShell). Mismo patrón que PhysioApp y EsteticaApp.
 * Sin secretos, sin llamadas externas, sin credenciales.
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
import { AbogadosChatbot } from './AbogadosChatbot.jsx';
import { AbogadosCrm } from './AbogadosCrm.jsx';
import { AbogadosRecovery } from './AbogadosRecovery.jsx';
import { AbogadosDashboard } from './AbogadosDashboard.jsx';

const BRANDING = {
  nombre: 'Despacho Abogados Demo',
  inicial: 'A',
};

const TABS = [
  { id: 'chatbot',   label: 'Asistente IA',  icon: '⚖️' },
  { id: 'crm',       label: 'Expedientes',   icon: '📋' },
  { id: 'recovery',  label: 'Recuperación',  icon: '🔄' },
  { id: 'dashboard', label: 'Dashboard',     icon: '📊' },
];

export function AbogadosApp() {
  const [activeTab, setActiveTab] = useState('chatbot');

  const renderTab = () => {
    switch (activeTab) {
      case 'chatbot':   return <AbogadosChatbot />;
      case 'crm':       return <AbogadosCrm />;
      case 'recovery':  return <AbogadosRecovery />;
      case 'dashboard': return <AbogadosDashboard />;
      default:          return <AbogadosChatbot />;
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

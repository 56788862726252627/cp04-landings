/**
 * OUTPUT GENERADO · Clínica Dental Málaga Demo · App Shell
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * NO editar manualmente — regenerar: npm run factory:create:clinica-dental-malaga-demo
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
import { ClinicaDentalMalagaDemoChatbot }       from './ClinicaDentalMalagaDemoChatbot.jsx';
import { ClinicaDentalMalagaDemoCrm }           from './ClinicaDentalMalagaDemoCrm.jsx';
import { ClinicaDentalMalagaDemoRecovery }      from './ClinicaDentalMalagaDemoRecovery.jsx';
import { ClinicaDentalMalagaDemoDashboard }     from './ClinicaDentalMalagaDemoDashboard.jsx';

const BRANDING = {
  nombre: "Clínica Dental Málaga Demo",
  inicial: "M",
  color: "#0d9488",
  tagline: "",
};

const TABS = [
  { id: 'chatbot',        label: 'Asistente IA',   icon: "🦷" },
  { id: 'crm',            label: 'Pacientes',      icon: '👥' },
  { id: 'recovery',       label: 'Leads',          icon: '🔄' },
  { id: 'dashboard',      label: 'Dashboard',      icon: '📊' },
];

export function ClinicaDentalMalagaDemoApp() {
  const [activeTab, setActiveTab] = useState("chatbot");
  const renderTab = () => {
    switch (activeTab) {
      case 'chatbot':       return <ClinicaDentalMalagaDemoChatbot />;
      case 'crm':           return <ClinicaDentalMalagaDemoCrm />;
      case 'recovery':      return <ClinicaDentalMalagaDemoRecovery />;
      case 'dashboard':     return <ClinicaDentalMalagaDemoDashboard />;
      default:              return null;
    }
  };
  return (
    <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} branding={BRANDING}>
      {renderTab()}
    </AppShell>
  );
}

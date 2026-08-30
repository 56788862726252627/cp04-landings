/**
 * OUTPUT GENERADO · EducaArchidona (Demo) · App Shell
 * Fabrica SaaS V1.8 · Education Vertical
 * Demo comercial · Datos 100% ficticios · NO produccion
 */
import { useState } from 'react';
import { AppShell } from '../../core/AppShell.jsx';
import { EducaArchidonaLanding }          from './EducaArchidonaLanding.jsx';
import { EducaArchidonaDashboardAlumno }  from './EducaArchidonaDashboardAlumno.jsx';
import { EducaArchidonaClases }           from './EducaArchidonaClases.jsx';
import { EducaArchidonaEjercicios }       from './EducaArchidonaEjercicios.jsx';
import { EducaArchidonaProgreso }         from './EducaArchidonaProgreso.jsx';
import { EducaArchidonaTutorIA }          from './EducaArchidonaTutorIA.jsx';
import { EducaArchidonaCalendario }       from './EducaArchidonaCalendario.jsx';
import { EducaArchidonaDashboardProfesor } from './EducaArchidonaDashboardProfesor.jsx';
import { EducaArchidonaDashboardFamilia } from './EducaArchidonaDashboardFamilia.jsx';
import { EducaArchidonaAdmin }            from './EducaArchidonaAdmin.jsx';

const BRANDING = {
  nombre:  'EducaArchidona',
  inicial: 'EA',
  color:   '#1d4ed8',
  tagline: 'Aprende mas, avanza mejor',
};

const ROLES = [
  { id: 'alumno',   label: 'Alumno',   icon: '🧑‍🎓' },
  { id: 'profesor', label: 'Profesor', icon: '👩‍🏫' },
  { id: 'familia',  label: 'Familia',  icon: '👨‍👩‍👧' },
  { id: 'admin',    label: 'Admin',    icon: '⚙️' },
];

const TABS_BY_ROLE = {
  alumno: [
    { id: 'inicio',    label: 'Inicio',    icon: '🎓' },
    { id: 'aula',      label: 'Mi Aula',   icon: '📊' },
    { id: 'clases',    label: 'Clases',    icon: '📚' },
    { id: 'ejercicios',label: 'Ejercicios',icon: '✏️' },
    { id: 'progreso',  label: 'Progreso',  icon: '📈' },
    { id: 'tutor_ia',  label: 'Tutor IA',  icon: '🤖' },
    { id: 'calendario',label: 'Calendario',icon: '📅' },
  ],
  profesor: [
    { id: 'inicio',    label: 'Inicio',    icon: '🎓' },
    { id: 'mi_grupo',  label: 'Mi Grupo',  icon: '👩‍🏫' },
    { id: 'clases',    label: 'Clases',    icon: '📚' },
    { id: 'calendario',label: 'Calendario',icon: '📅' },
  ],
  familia: [
    { id: 'inicio',    label: 'Inicio',    icon: '🎓' },
    { id: 'familia',   label: 'Familia',   icon: '👨‍👩‍👧' },
    { id: 'progreso',  label: 'Progreso',  icon: '📈' },
    { id: 'calendario',label: 'Calendario',icon: '📅' },
  ],
  admin: [
    { id: 'inicio',    label: 'Inicio',    icon: '🎓' },
    { id: 'admin',     label: 'Admin',     icon: '⚙️' },
  ],
};

export function EducaArchidonaApp() {
  const [activeRole, setActiveRole] = useState('alumno');
  const [activeTab,  setActiveTab]  = useState('inicio');

  const handleRoleChange = (roleId) => {
    setActiveRole(roleId);
    setActiveTab('inicio');
  };

  const handleTabChange = (tab) => setActiveTab(tab);

  const renderTab = () => {
    if (activeTab === 'inicio') return <EducaArchidonaLanding />;
    switch (activeRole) {
      case 'alumno':
        if (activeTab === 'aula')       return <EducaArchidonaDashboardAlumno />;
        if (activeTab === 'clases')     return <EducaArchidonaClases />;
        if (activeTab === 'ejercicios') return <EducaArchidonaEjercicios />;
        if (activeTab === 'progreso')   return <EducaArchidonaProgreso />;
        if (activeTab === 'tutor_ia')   return <EducaArchidonaTutorIA />;
        if (activeTab === 'calendario') return <EducaArchidonaCalendario />;
        break;
      case 'profesor':
        if (activeTab === 'mi_grupo')   return <EducaArchidonaDashboardProfesor />;
        if (activeTab === 'clases')     return <EducaArchidonaClases />;
        if (activeTab === 'calendario') return <EducaArchidonaCalendario />;
        break;
      case 'familia':
        if (activeTab === 'familia')    return <EducaArchidonaDashboardFamilia />;
        if (activeTab === 'progreso')   return <EducaArchidonaProgreso />;
        if (activeTab === 'calendario') return <EducaArchidonaCalendario />;
        break;
      case 'admin':
        if (activeTab === 'admin')      return <EducaArchidonaAdmin />;
        break;
    }
    return null;
  };

  const tabs = TABS_BY_ROLE[activeRole] || TABS_BY_ROLE.alumno;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Role Switcher */}
      <div style={{ background: '#1d4ed8', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#bfdbfe', fontSize: 12, marginRight: 4 }}>Vista:</span>
        {ROLES.map(r => (
          <button
            key={r.id}
            onClick={() => handleRoleChange(r.id)}
            style={{
              padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12,
              background: activeRole === r.id ? '#ffffff' : '#3b82f6',
              color:      activeRole === r.id ? '#1d4ed8'  : '#ffffff',
              fontWeight: activeRole === r.id ? 700 : 400,
            }}
            aria-pressed={activeRole === r.id}
          >
            {r.icon} {r.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: '#bfdbfe', fontSize: 11 }}>
          Demo · Datos ficticios
        </span>
      </div>

      <AppShell
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        branding={BRANDING}
      >
        {renderTab()}
      </AppShell>
    </div>
  );
}

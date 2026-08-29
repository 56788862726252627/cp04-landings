/**
 * OUTPUT GENERADO · Clínica Dental Aurora (Demo) · Datos demo
 * Generado por Fábrica SaaS V1.5 · create-client.mjs
 * Datos 100% ficticios. No representan personas ni casos reales.
 * No usar en producción. No incluir datos personales reales.
 */

export const MOCK_SEDES = [
  {
    "id": "aurora-centro",
    "nombre": "Aurora Centro (ficticio)",
    "horario": "L-V 09:00-20:00, S 09:00-14:00"
  },
  {
    "id": "aurora-norte",
    "nombre": "Aurora Norte (ficticio)",
    "horario": "L-V 10:00-19:00"
  }
];

export const MOCK_PROFESIONALES = [
  {
    "id": "prof-001",
    "nombre": "Dra. Martínez Ruiz (ficticio)",
    "especialidad": "Ortodoncia"
  },
  {
    "id": "prof-002",
    "nombre": "Dr. García Sánchez (ficticio)",
    "especialidad": "Implantes"
  },
  {
    "id": "prof-003",
    "nombre": "Dra. López Torres (ficticio)",
    "especialidad": "Endodoncia"
  },
  {
    "id": "cualquiera",
    "nombre": "Primer profesional disponible",
    "especialidad": null
  }
];

export const MOCK_SLOTS = [
  {
    "id": "slot-001",
    "fecha": "2026-09-15 (ficticio)",
    "hora": "09:00",
    "profesionalId": "prof-001",
    "profesional": "Dra. Martínez Ruiz (ficticio)",
    "sede": "Aurora Centro (ficticio)",
    "disponible": true
  },
  {
    "id": "slot-002",
    "fecha": "2026-09-15 (ficticio)",
    "hora": "10:30",
    "profesionalId": "prof-002",
    "profesional": "Dr. García Sánchez (ficticio)",
    "sede": "Aurora Norte (ficticio)",
    "disponible": true
  },
  {
    "id": "slot-003",
    "fecha": "2026-09-16 (ficticio)",
    "hora": "11:00",
    "profesionalId": "prof-003",
    "profesional": "Dra. López Torres (ficticio)",
    "sede": "Aurora Centro (ficticio)",
    "disponible": true
  }
];

export const MOCK_CLIENTES = [
  {
    "id": "pac-001",
    "nombre": "Paciente Ejemplo Uno (ficticio)",
    "email": "paciente1@demo.ficticio",
    "telefono": "+34 600 000 001 (ficticio)",
    "tratamiento_interes": "Ortodoncia",
    "estado": "activo",
    "origen": "web"
  },
  {
    "id": "pac-002",
    "nombre": "Paciente Ejemplo Dos (ficticio)",
    "email": "paciente2@demo.ficticio",
    "telefono": "+34 600 000 002 (ficticio)",
    "tratamiento_interes": "Implantes",
    "estado": "en_tratamiento",
    "origen": "referido"
  },
  {
    "id": "pac-003",
    "nombre": "Paciente Ejemplo Tres (ficticio)",
    "email": "paciente3@demo.ficticio",
    "telefono": "+34 600 000 003 (ficticio)",
    "tratamiento_interes": "Blanqueamiento",
    "estado": "nuevo",
    "origen": "google"
  }
];

export const MOCK_LEADS_ABANDONO = [
  {
    "id": "lead-001",
    "nombre": "Lead Ejemplo Uno (ficticio)",
    "email": "lead1@demo.ficticio",
    "tratamiento": "Ortodoncia invisible",
    "dias_inactivo": 12,
    "estado": "en_proceso",
    "accion_sugerida": "Enviar recordatorio con oferta de primera cita gratuita",
    "fuente": "web"
  },
  {
    "id": "lead-002",
    "nombre": "Lead Ejemplo Dos (ficticio)",
    "email": "lead2@demo.ficticio",
    "tratamiento": "Implante dental",
    "dias_inactivo": 21,
    "estado": "en_proceso",
    "accion_sugerida": "Llamada de seguimiento personalizado con Dr. García",
    "fuente": "referido"
  },
  {
    "id": "lead-003",
    "nombre": "Lead Ejemplo Tres (ficticio)",
    "email": "lead3@demo.ficticio",
    "tratamiento": "Blanqueamiento",
    "dias_inactivo": 5,
    "estado": "en_proceso",
    "accion_sugerida": "Envío de información de precios y financiación",
    "fuente": "instagram"
  }
];

export const MOCK_METRICAS = {
  "consultas_mes": 0,
  "tasa_conversion": 0,
  "valor_pipeline": "0 € (ficticio)",
  "ingresos_mes": "0 € (ficticio)",
  "citas_hoy": 12,
  "nuevos_pacientes": 8,
  "por_sede": [
    {
      "sede": "(ficticio)",
      "consultas": 10
    },
    {
      "sede": "(ficticio)",
      "consultas": 10
    }
  ]
};

export const MOCK_TRATAMIENTOS = [
  { id: 'trat-001', categoria: 'General', nombre: 'Revisión y limpieza', descripcion: 'Revisión bucodental completa con higiene profesional', duracion: '60 min', precio_desde: '45 €', icono: '🪥', destacado: true },
  { id: 'trat-002', categoria: 'Ortodoncia', nombre: 'Brackets metálicos', descripcion: 'Ortodoncia fija tradicional de alta precisión', duracion: '24 meses', precio_desde: '2.400 €', icono: '🦷', destacado: true },
  { id: 'trat-003', categoria: 'Ortodoncia', nombre: 'Alineadores invisibles', descripcion: 'Ortodoncia invisible con férulas termoformadas', duracion: '12-18 meses', precio_desde: '3.200 €', icono: '😁', destacado: true },
  { id: 'trat-004', categoria: 'Implantes', nombre: 'Implante unitario', descripcion: 'Implante de titanio con corona cerámica', duracion: '3-6 meses', precio_desde: '1.800 €', icono: '🔩', destacado: true },
  { id: 'trat-005', categoria: 'Implantes', nombre: 'Implantes múltiples', descripcion: 'Rehabilitación completa con implantes', duracion: '6-12 meses', precio_desde: '8.500 €', icono: '💪', destacado: false },
  { id: 'trat-006', categoria: 'Estética', nombre: 'Blanqueamiento dental', descripcion: 'Blanqueamiento LED en clínica con resultado inmediato', duracion: '90 min', precio_desde: '280 €', icono: '✨', destacado: true },
  { id: 'trat-007', categoria: 'Estética', nombre: 'Carillas de porcelana', descripcion: 'Láminas de porcelana ultrafinas para sonrisa perfecta', duracion: '2 sesiones', precio_desde: '450 €/u', icono: '💎', destacado: false },
  { id: 'trat-008', categoria: 'Periodoncia', nombre: 'Tratamiento periodontal', descripcion: 'Tratamiento de encías y tejidos de soporte dental', duracion: '2-4 sesiones', precio_desde: '350 €', icono: '🩺', destacado: false },
  { id: 'trat-009', categoria: 'Periodoncia', nombre: 'Cirugía periodontal', descripcion: 'Intervención quirúrgica para enfermedad periodontal avanzada', duracion: '90 min', precio_desde: '600 €', icono: '🏥', destacado: false },
  { id: 'trat-010', categoria: 'General', nombre: 'Endodoncia', descripcion: 'Tratamiento de conductos para salvar la pieza dental', duracion: '2-3 sesiones', precio_desde: '320 €', icono: '💉', destacado: false },
  { id: 'trat-011', categoria: 'General', nombre: 'Empaste dental', descripcion: 'Obturación con composite de última generación', duracion: '45 min', precio_desde: '80 €', icono: '🔧', destacado: false },
  { id: 'trat-012', categoria: 'Estética', nombre: 'Diseño de sonrisa', descripcion: 'Planificación digital completa de tu sonrisa ideal', duracion: '60 min', precio_desde: '150 €', icono: '🎨', destacado: true },
];

export const MOCK_PRESUPUESTOS = [
  { id: 'pres-001', paciente: 'Ana García Martínez (ficticio)', tratamiento: 'Ortodoncia con alineadores', importe: '3.200 €', estado: 'aceptado', fecha: '2026-08-15', profesional: 'Dra. Martínez Ruiz', sede: 'Aurora Centro' },
  { id: 'pres-002', paciente: 'Carlos López Pérez (ficticio)', tratamiento: 'Implante unitario x2', importe: '3.600 €', estado: 'enviado', fecha: '2026-08-20', profesional: 'Dr. García Sánchez', sede: 'Aurora Norte' },
  { id: 'pres-003', paciente: 'María Rodríguez Silva (ficticio)', tratamiento: 'Blanqueamiento + carillas', importe: '2.100 €', estado: 'borrador', fecha: '2026-08-22', profesional: 'Dra. López Torres', sede: 'Aurora Centro' },
  { id: 'pres-004', paciente: 'Juan Fernández Ruiz (ficticio)', tratamiento: 'Revisión + limpieza anual', importe: '90 €', estado: 'completado', fecha: '2026-08-10', profesional: 'Dra. Martínez Ruiz', sede: 'Aurora Centro' },
  { id: 'pres-005', paciente: 'Laura Sánchez Torres (ficticio)', tratamiento: 'Endodoncia molar + corona', importe: '780 €', estado: 'aceptado', fecha: '2026-08-18', profesional: 'Dr. García Sánchez', sede: 'Aurora Norte' },
  { id: 'pres-006', paciente: 'Pedro Moreno Díaz (ficticio)', tratamiento: 'Brackets metálicos adultos', importe: '2.600 €', estado: 'enviado', fecha: '2026-08-25', profesional: 'Dra. López Torres', sede: 'Aurora Centro' },
];

export const MOCK_AGENDA = [
  { id: 'cita-001', paciente: 'Ana García Martínez (ficticio)', tratamiento: 'Control ortodoncia', profesional: 'Dra. Martínez Ruiz', hora: '09:00', duracion: '30 min', estado: 'confirmada', sede: 'Aurora Centro' },
  { id: 'cita-002', paciente: 'Carlos López Pérez (ficticio)', tratamiento: 'Colocación implante fase 1', profesional: 'Dr. García Sánchez', hora: '10:00', duracion: '90 min', estado: 'confirmada', sede: 'Aurora Norte' },
  { id: 'cita-003', paciente: 'María Rodríguez Silva (ficticio)', tratamiento: 'Blanqueamiento LED', profesional: 'Dra. López Torres', hora: '11:30', duracion: '90 min', estado: 'pendiente', sede: 'Aurora Centro' },
  { id: 'cita-004', paciente: 'Nuevo paciente (ficticio)', tratamiento: 'Primera visita y diagnóstico', profesional: 'Dra. Martínez Ruiz', hora: '13:00', duracion: '60 min', estado: 'pendiente', sede: 'Aurora Centro' },
  { id: 'cita-005', paciente: 'Laura Sánchez Torres (ficticio)', tratamiento: 'Endodoncia sesión 2', profesional: 'Dr. García Sánchez', hora: '15:00', duracion: '60 min', estado: 'confirmada', sede: 'Aurora Norte' },
  { id: 'cita-006', paciente: 'Pedro Moreno Díaz (ficticio)', tratamiento: 'Revisión y toma de medidas', profesional: 'Dra. López Torres', hora: '16:30', duracion: '45 min', estado: 'cancelada', sede: 'Aurora Centro' },
  { id: 'cita-007', paciente: 'Elena Vázquez Mora (ficticio)', tratamiento: 'Limpieza bucal semestral', profesional: 'Dra. Martínez Ruiz', hora: '17:30', duracion: '60 min', estado: 'confirmada', sede: 'Aurora Centro' },
  { id: 'cita-008', paciente: 'Roberto Castro Gil (ficticio)', tratamiento: 'Control post-implante', profesional: 'Dr. García Sánchez', hora: '18:30', duracion: '30 min', estado: 'pendiente', sede: 'Aurora Norte' },
];

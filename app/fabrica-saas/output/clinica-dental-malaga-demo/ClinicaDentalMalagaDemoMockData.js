/**
 * OUTPUT GENERADO · Clínica Dental Málaga Demo · Datos demo
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * Datos 100% ficticios. No representan personas ni casos reales.
 * No usar en producción. No incluir datos personales reales.
 */

export const MOCK_SEDES = [
  {
    "id": "centro",
    "nombre": "Clínica Dental Málaga Centro (ficticio)",
    "horario": "L-V 09:00-20:00, S 09:00-14:00"
  },
  {
    "id": "norte",
    "nombre": "Clínica Dental Málaga Norte (ficticio)",
    "horario": "L-V 10:00-19:00"
  }
];

export const MOCK_PROFESIONALES = [
  {
    "id": "dr-garcia",
    "nombre": "Dr. García Ruiz (ficticio)",
    "especialidad": "Ortodoncia"
  },
  {
    "id": "dra-perez",
    "nombre": "Dra. Pérez Sánchez (ficticia)",
    "especialidad": "Implantología"
  },
  {
    "id": "dr-martinez",
    "nombre": "Dr. Martínez López (ficticio)",
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
    "id": "s001",
    "fecha": "2026-09-02 (ficticio)",
    "hora": "10:00",
    "sede": "Clínica Dental Málaga Centro (ficticio)",
    "profesional": "Dr. García Ruiz (ficticio)",
    "disponible": true
  },
  {
    "id": "s002",
    "fecha": "2026-09-02 (ficticio)",
    "hora": "16:30",
    "sede": "Clínica Dental Málaga Norte (ficticio)",
    "profesional": "Dra. Pérez Sánchez (ficticia)",
    "disponible": true
  },
  {
    "id": "s003",
    "fecha": "2026-09-03 (ficticio)",
    "hora": "11:00",
    "sede": "Clínica Dental Málaga Centro (ficticio)",
    "profesional": "Dr. Martínez López (ficticio)",
    "disponible": true
  },
  {
    "id": "s004",
    "fecha": "2026-09-04 (ficticio)",
    "hora": "17:00",
    "sede": "Clínica Dental Málaga Norte (ficticio)",
    "profesional": "Dr. García Ruiz (ficticio)",
    "disponible": false
  }
];

export const MOCK_CLIENTES = [
  {
    "id": "c001",
    "nombre": "Lucía Morales Ruiz (ficticia)",
    "email": "lucia.m@demo.ficticio",
    "telefono": "600 000 041",
    "tratamiento_interes": "Ortodoncia Damon",
    "estado": "en_tratamiento",
    "sesiones_completadas": 4,
    "sesiones_restantes": 6,
    "origen": "Instagram (ficticio)"
  },
  {
    "id": "c002",
    "nombre": "José Manuel Torres López (ficticio)",
    "email": "jose.t@demo.ficticio",
    "telefono": "600 000 042",
    "tratamiento_interes": "Implante dental",
    "estado": "pendiente_cita",
    "sesiones_completadas": 1,
    "sesiones_restantes": 2,
    "origen": "Google (ficticio)"
  },
  {
    "id": "c003",
    "nombre": "Carmen Delgado Vega (ficticia)",
    "email": "carmen.d@demo.ficticio",
    "telefono": "600 000 043",
    "tratamiento_interes": "Blanqueamiento + Carillas",
    "estado": "nuevo",
    "sesiones_completadas": 0,
    "sesiones_restantes": 3,
    "origen": "Referido (ficticio)"
  },
  {
    "id": "c004",
    "nombre": "Andrés Fernández Gil (ficticio)",
    "email": "andres.f@demo.ficticio",
    "telefono": "600 000 044",
    "tratamiento_interes": "Endodoncia",
    "estado": "completado",
    "sesiones_completadas": 3,
    "sesiones_restantes": 0,
    "origen": "Web (ficticio)"
  }
];

export const MOCK_LEADS_ABANDONO = [
  {
    "id": "l001",
    "nombre": "Rosa Campos Serrano (ficticia)",
    "email": "rosa.c@demo.ficticio",
    "telefono": "600 000 051",
    "tratamiento": "Blanqueamiento dental",
    "dias_inactivo": 5,
    "accion_sugerida": "Recordatorio con promoción de agosto (ficticio)",
    "estado": "en_proceso"
  },
  {
    "id": "l002",
    "nombre": "Alberto Moreno Díaz (ficticio)",
    "email": "alberto.m@demo.ficticio",
    "telefono": "600 000 052",
    "tratamiento": "Ortodoncia invisible",
    "dias_inactivo": 12,
    "accion_sugerida": "Envío de caso de éxito similar (ficticio)",
    "estado": "en_proceso"
  },
  {
    "id": "l003",
    "nombre": "Elena Gutiérrez Ramos (ficticia)",
    "email": "elena.g@demo.ficticio",
    "telefono": "600 000 053",
    "tratamiento": "Implante unitario",
    "dias_inactivo": 3,
    "accion_sugerida": "Llamada de seguimiento (ficticio)",
    "estado": "recuperado"
  }
];

export const MOCK_METRICAS = {
  "consultas_mes": 34,
  "tasa_conversion": 61,
  "valor_pipeline": "21.400 € (ficticio)",
  "ingresos_mes": "11.200 € (ficticio)",
  "por_sede": [
    {
      "sede": "(ficticio)",
      "consultas": 17
    },
    {
      "sede": "(ficticio)",
      "consultas": 17
    }
  ]
};

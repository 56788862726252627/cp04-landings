// Generado por Fábrica SaaS · Generator v1
// Fuente: manifest del cliente "Clínica Dental Demo"
// NO EDITAR MANUALMENTE — regenerar con: npm run factory:generate
// Datos ficticios. No conectado a sistemas reales.

export const RUNTIME_CONFIG = {
  "cliente": "Clínica Dental Demo",
  "vertical": "dental",
  "modo_demo": true,
  "branding": {
    "nombre_visible": "Clínica Dental Demo",
    "inicial": "D",
    "estilo": "sanitario premium, limpio, moderno",
    "copiar_marca_real": false
  },
  "modulos": [
    "chatbot_ia",
    "crm",
    "reservas",
    "recuperacion_leads",
    "dashboard"
  ],
  "sedes": [
    {
      "id": "centro",
      "nombre": "Sede Centro",
      "horario": "L-V 09:00-20:00"
    },
    {
      "id": "norte",
      "nombre": "Sede Norte",
      "horario": "L-V 10:00-21:00"
    },
    {
      "id": "playa",
      "nombre": "Sede Playa",
      "horario": "L-S 09:00-18:00"
    }
  ],
  "roles": [
    "admin",
    "recepcion",
    "profesional"
  ],
  "vertical_config": {
    "intenciones": [
      "primera_visita",
      "implantes_cirugia",
      "ortodoncia",
      "estetica",
      "urgencia",
      "consulta_general"
    ],
    "financiacion_en": [
      "implantes_cirugia",
      "ortodoncia",
      "estetica"
    ],
    "seguridad_clinica": {
      "diagnostico": false,
      "prescripcion": false,
      "consejo_medico": false,
      "derivar_a_profesional_si_sensible": true
    }
  },
  "integraciones": {
    "reales": false,
    "email": false,
    "whatsapp": false,
    "sms": false,
    "hubspot": false,
    "calendario": false,
    "pagos": false
  },
  "mock": {
    "obligatorio": true,
    "pacientes": 5,
    "citas": true,
    "crm": true,
    "metricas": true
  },
  "casos_demo": [
    "implantes_cirugia_financiacion",
    "primera_visita",
    "fuera_de_horario",
    "abandono_sin_reserva",
    "consulta_clinica_sensible"
  ],
  "calidad": {
    "responsive": [
      "mobile",
      "tablet",
      "desktop"
    ],
    "tests": true,
    "build": true,
    "lint": true,
    "no_secretos": true,
    "no_deploy": true,
    "no_contacto_externo": true
  }
};

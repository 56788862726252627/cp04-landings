export function getDemoActionMessage(actionType = "general") {
  const messages = {
    reserva: "Reserva simulada correctamente. No se ha creado ninguna reserva real.",
    cancelacion: "Cancelación demo registrada. No se ha cancelado ninguna reserva real.",
    reprogramacion: "Reprogramación demo registrada. No se ha modificado ninguna reserva real.",
    pago: "Pago desactivado en demo. No se ha realizado ningún cargo.",
    whatsapp: "WhatsApp Business desactivado en demo. No se ha enviado ningún mensaje real.",
    email: "Email demo simulado. No se ha enviado ningún correo real salvo configuración controlada.",
    admin: "Panel administrador demo con datos ficticios. No muestra datos reales de ningún club.",
    soporte: "Estado del sistema simulado. No se muestran herramientas internas ni tokens.",
    general: "Acción demo simulada. No se han modificado datos reales.",
  };

  return messages[actionType] || messages.general;
}

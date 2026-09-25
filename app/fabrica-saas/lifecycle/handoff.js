/**
 * Handoff Process
 * Standard technical and client handoff after delivery.
 */

export const HANDOFF_VERSION = '1.0.0';

/**
 * @param {Object} deliveryManifest - from generateDeliveryManifest()
 * @param {Object} scope            - ClientScope
 * @param {Object} onboarding       - validated onboarding
 * @returns {Object} HandoffPackage
 */
// eslint-disable-next-line no-unused-vars
export function generateHandoff(deliveryManifest = {}, scope = {}, onboarding = {}) {
  const data = onboarding.data ?? onboarding;

  const trainingChecklist = [
    { item: 'Demo del panel de administración (30 min)',          done: false },
    { item: 'Explicación del sistema de reservas',                done: false },
    { item: 'Cómo añadir/editar clientes',                       done: false },
    { item: 'Cómo revisar y confirmar reservas',                  done: false },
    { item: 'Configuración básica de notificaciones',             done: false },
    { item: 'Acceso al dashboard Make para ver automatizaciones', done: false },
    { item: 'Preguntas y respuestas del cliente',                 done: false },
  ];

  const acceptanceChecklist = [
    { item: 'Cliente ha revisado el panel de administración',   done: false },
    { item: 'Cliente ha confirmado que el booking funciona',    done: false },
    { item: 'Cliente ha verificado las notificaciones',         done: false },
    { item: 'Cliente acepta las limitaciones conocidas',        done: false },
    { item: 'Plan de soporte explicado y aceptado',             done: false },
    { item: 'Credenciales de terceros gestionadas por cliente', done: false },
  ];

  const pendingClientActions = [
    'Confirmar dominio y DNS definitivos.',
    'Activar y testar todas las cuentas de terceros necesarias.',
    'Completar contenido definitivo (textos, fotos, logo).',
    'Designar un responsable técnico interno para primera línea de soporte.',
  ];

  return {
    handoffType: 'CLIENT_HANDOFF',
    disclaimer:  'El handoff no implica la firma de ningún contrato. Los acuerdos de soporte se documentan por separado.',
    version:     HANDOFF_VERSION,

    businessName: data.businessName ?? deliveryManifest.projectSummary?.businessName,
    tier:         deliveryManifest.projectSummary?.tier ?? 'PRO',

    technicalHandoff: {
      repositoryNotes: 'El código fuente puede transferirse al cliente si se acuerda en contrato.',
      hostingTransfer: 'Cloudflare Pages — el cliente puede asumir la cuenta si lo solicita.',
      databaseOwner:   'El cliente gestiona su cuenta Supabase directamente.',
      automationsOwner:'Las automatizaciones Make son propiedad del cliente.',
      credentialPolicy:'NINGUNA credencial de producción se almacena en sistemas de la agencia.',
    },

    clientHandoff: {
      deliveryManifest,
      credentialsNeeded:    deliveryManifest.credentialsNeeded ?? [],
      dataOwnership:        'Todos los datos del negocio pertenecen al cliente.',
      maintenanceSelection: deliveryManifest.maintenancePlan,
    },

    trainingChecklist,
    acceptanceChecklist,
    pendingClientActions,

    supportContact: {
      channel:      'email',
      note:         'El soporte incluido en el paquete se gestiona por email. Tiempos de respuesta según plan de mantenimiento.',
    },

    handoffComplete: false,
  };
}

/**
 * Marks handoff as complete when all acceptance items are done.
 */
export function completeHandoff(handoff = {}) {
  const allAccepted = (handoff.acceptanceChecklist ?? []).every(c => c.done);
  const allTrained  = (handoff.trainingChecklist ?? []).every(c => c.done);

  return {
    ...handoff,
    handoffComplete:  allAccepted && allTrained,
    completedAt:      allAccepted && allTrained ? new Date().toISOString().split('T')[0] : null,
    blockers:         [
      ...(allAccepted ? [] : ['Acceptance checklist not fully completed']),
      ...(allTrained  ? [] : ['Training checklist not fully completed']),
    ],
  };
}

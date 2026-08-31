/**
 * Lifecycle Registry — Paso D
 * Exports all 18 lifecycle modules.
 */

export { LIFECYCLE_STATES, STATE_DEFINITIONS, transition, getStateDefinition, listStates } from '../lifecycle/clientLifecycleModel.js';
export { REQUIRED_FIELDS, validateOnboarding, FIELD_STATUS as ONBOARDING_FIELD_STATUS }    from '../lifecycle/onboardingSchema.js';
export { QUALIFICATION_DECISIONS, qualifyLead }                                             from '../lifecycle/qualificationEngine.js';
export { diagnoseBusiness }                                                                 from '../lifecycle/diagnosticEngine.js';
export { REQ_TYPES, REQ_PRIORITIES, buildRequirements }                                    from '../lifecycle/requirementsEngine.js';
export { buildClientScope }                                                                 from '../lifecycle/scopeBuilder.js';
export { onboardingToProposal }                                                             from '../lifecycle/proposalPipeline.js';
export { APPROVAL_DECISIONS, createApproval, isApprovalBlockingProduction }                from '../lifecycle/approvalModel.js';
export { productionReady }                                                                  from '../lifecycle/productionReadinessGate.js';
export { buildClientProductionBrief }                                                       from '../lifecycle/factoryHandoff.js';
export { TRACK_STATUS, TRACK_COMPONENTS, createProductionTracking, updateComponentStatus, isReadyForQA, isReadyForDelivery } from '../lifecycle/productionTracking.js';
export { CR_TYPES, CR_STATUS, createChangeRequest, listCRTypes }                           from '../lifecycle/changeRequests.js';
export { deliveryReady }                                                                    from '../lifecycle/deliveryReadiness.js';
export { generateDeliveryManifest }                                                         from '../lifecycle/deliveryManifest.js';
export { generateHandoff, completeHandoff }                                                 from '../lifecycle/handoff.js';
export { SUPPORT_DURATION_DAYS, SUPPORT_TICKET_TYPES, createSupportWindow, classifyTicket } from '../lifecycle/supportWindow.js';
export { CLOSEOUT_STATUS, closeClientProject }                                              from '../lifecycle/clientCloseout.js';
export { runClientLifecycle }                                                               from '../lifecycle/lifecycleRunner.js';

export const LIFECYCLE_REGISTRY_VERSION = '1.0.0';
export const PASO_D_STATUS = '100_PERCENT';

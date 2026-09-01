// Response Planner — ADV-03
// planAgentResponse(): orquesta todos los motores. Sin llamada LLM real.

import { resolveIntent } from './intentModel.js';
import { resolveConversationStage } from './conversationStages.js';
import { determineResponseLength } from './responseLengthEngine.js';
import { resolveAgentTone } from './toneEngine.js';
import { resolveNextBestAction } from './nextBestAction.js';
import { shouldEscalateToHuman } from './escalationEngine.js';
import { detectObjectionType } from './objectionEngine.js';

/**
 * Plan how an agent should respond to a user message.
 * Deterministic — no LLM call, no side effects.
 *
 * input: {
 *   message:       string   — raw user message
 *   agentType:     string
 *   vertical:      string
 *   channel:       string
 *   turnCount:     number
 *   currentStage:  string
 *   context:       {}       — optional: { userEmotion, riskLevel, intentHistory }
 * }
 */
export function planAgentResponse(input = {}) {
  const {
    message      = '',
    agentType    = 'CHAT',
    vertical     = 'DEFAULT',
    channel      = 'WEB_CHAT',
    turnCount    = 0,
    currentStage = 'GREETING',
    context      = {},
  } = input;

  // 1. Intent
  const intentResult = resolveIntent(message);
  const intent = intentResult.intent;

  // 2. Objection check
  const hasObjection = intent === 'OBJECTION' || detectObjectionType(message) !== 'OTHER';

  // 3. Conversation stage
  const priceAsked       = intent === 'PRICE';
  const bookingRequested = intent === 'BOOKING';
  const readyToAct       = intent === 'PURCHASE_INTENT';
  const userSaidGoodbye  = /\b(adiós|hasta luego|bye|chao|nos vemos)\b/i.test(message);

  const stageResult = resolveConversationStage({
    intent,
    turnCount,
    hasObjection,
    readyToAct,
    userSaidGoodbye,
    priceAsked,
    bookingRequested,
    currentStage,
  });

  // 4. Response length
  const lengthResult = determineResponseLength({
    channel,
    intent,
    conversationStage: stageResult.stage,
    turnCount,
    userMessageLength: message.length,
  });

  // 5. Tone
  const toneResult = resolveAgentTone({
    agentType,
    vertical,
    clientEmotion: context.userEmotion,
    riskLevel:     context.riskLevel,
  });

  // 6. Knowledge needed
  const knowledgeNeeded = resolveKnowledgeNeeded(intent);

  // 7. Tool needed
  const toolNeeded = resolveToolNeeded(intent);

  // 8. Next best action
  const nbaResult = resolveNextBestAction({
    intent,
    conversationStage: stageResult.stage,
    agentType,
    escalationNeeded: false,
    hasObjection,
    readyToBook:    bookingRequested || readyToAct,
  });

  // 9. Escalation check
  const escalationResult = shouldEscalateToHuman({
    userRequestedHuman: intent === 'HUMAN_REQUEST',
    riskLevel:          context.riskLevel ?? 'LOW',
    failedAttempts:     context.repeatedFailures ?? 0,
    sentimentScore:     context.sentimentScore ?? 0,
    vertical,
    requestType:        intent === 'COMPLAINT' ? 'COMPLAINT' : 'INFORMATION',
  });

  // 10. Response guidance
  const responseGuidance = buildResponseGuidance({
    stageResult, toneResult, lengthResult,
    nbaResult, escalationResult, channel,
  });

  return Object.freeze({
    intent,
    intentConfidence:   intentResult.confidence,
    conversationStage:  stageResult.stage,
    responseLength:     lengthResult.length,
    maxWords:           lengthResult.maxWords,
    tone:               toneResult.primary,
    knowledgeNeeded,
    toolNeeded,
    nextBestAction:     nbaResult.action,
    escalationNeeded:   escalationResult.shouldEscalate,
    responseGuidance,
    planVersion:        '1.0.0',
    isReal:             false,
  });
}

function resolveKnowledgeNeeded(intent) {
  const needsKnowledge = ['INFORMATION', 'PRICE', 'AVAILABILITY', 'SUPPORT'];
  if (needsKnowledge.includes(intent)) {
    return Object.freeze(['BUSINESS_CONTEXT', 'SERVICE_CATALOG', 'FAQ']);
  }
  return Object.freeze(['BUSINESS_CONTEXT']);
}

function resolveToolNeeded(intent) {
  if (intent === 'BOOKING' || intent === 'AVAILABILITY') return 'CHECK_AVAILABILITY';
  if (intent === 'CANCELLATION') return 'CANCEL_BOOKING';
  if (intent === 'HUMAN_REQUEST') return 'TRANSFER_HUMAN';
  return null;
}

function buildResponseGuidance({ stageResult, toneResult, lengthResult, nbaResult, escalationResult, channel }) {
  const hints = [];

  if (escalationResult.shouldEscalate) {
    hints.push(`ESCALATE: ${escalationResult.handoffMessage}`);
  }
  hints.push(`STAGE: ${stageResult.stage} — ${stageResult.isValidTransition ? 'valid transition' : 'forced'}`);
  hints.push(`TONE: ${toneResult.descriptor ?? toneResult.primary}`);
  hints.push(`LENGTH: ${lengthResult.hint ?? lengthResult.length} (max ${lengthResult.maxWords}w)`);
  hints.push(`NEXT: ${nbaResult.softCTA ?? nbaResult.action}`);
  if (channel === 'WHATSAPP') hints.push('FORMAT: no markdown, plain text only');
  if (channel === 'VOICE')    hints.push('FORMAT: spoken sentences only, no lists');

  return Object.freeze(hints);
}

export const RESPONSE_PLANNER_VERSION = '1.0.0';

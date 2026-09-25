// Good Workflow Fixtures — ADV-17 (30+ success scenarios, fixture/simulation only)

export const GOOD_WORKFLOW_FIXTURES = Object.freeze([
  // === BOOKING WORKFLOWS ===
  {
    id:       'wf-booking-001',
    name:     'Simple FAQ → Book',
    team:     'BOOKING',
    steps:    Object.freeze(['CHAT_QUALIFY', 'CHECK_AVAILABILITY', 'CONFIRM_BOOKING']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-booking-002',
    name:     'Booking with conflict resolution',
    team:     'BOOKING',
    steps:    Object.freeze(['CHAT_QUALIFY', 'CONFLICT_DETECTED', 'OFFER_ALTERNATIVES', 'CONFIRM_BOOKING']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-booking-003',
    name:     'Booking for group (parallel slot check)',
    team:     'BOOKING',
    steps:    Object.freeze(['CHAT_QUALIFY', 'PARALLEL_SLOT_CHECK', 'CONFIRM_BOOKING']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === LEAD WORKFLOWS ===
  {
    id:       'wf-lead-001',
    name:     'Lead qualify → sales handoff',
    team:     'SALES',
    steps:    Object.freeze(['LEAD_CAPTURE', 'LEAD_QUALIFY', 'LEAD_SCORE', 'SALES_HANDOFF', 'CRM_UPDATE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-lead-002',
    name:     'Lead disqualified early',
    team:     'SALES',
    steps:    Object.freeze(['LEAD_CAPTURE', 'LEAD_QUALIFY', 'DISQUALIFY']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-lead-003',
    name:     'Parallel lead enrichment',
    team:     'SALES',
    steps:    Object.freeze(['LEAD_CAPTURE', 'PARALLEL_ENRICHMENT', 'LEAD_SCORE', 'SALES_HANDOFF']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === SUPPORT WORKFLOWS ===
  {
    id:       'wf-support-001',
    name:     'FAQ resolved without escalation',
    team:     'SUPPORT',
    steps:    Object.freeze(['RECEIVE_TICKET', 'CLASSIFY', 'RESOLVE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-support-002',
    name:     'Ticket escalated to human',
    team:     'SUPPORT',
    steps:    Object.freeze(['RECEIVE_TICKET', 'CLASSIFY', 'ATTEMPT_RESOLVE', 'HUMAN_ESCALATION']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-support-003',
    name:     'Reprogramming request handled',
    team:     'SUPPORT',
    steps:    Object.freeze(['RECEIVE_TICKET', 'IDENTIFY_BOOKING', 'REPROGRAMMING_PROPOSAL', 'CONFIRM']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === CONTENT WORKFLOWS ===
  {
    id:       'wf-content-001',
    name:     'Blog post: research → draft → review',
    team:     'CONTENT',
    steps:    Object.freeze(['RESEARCH', 'DRAFT', 'QA_REVIEW', 'FINALIZE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-content-002',
    name:     'Social post batch: parallel generation',
    team:     'CONTENT',
    steps:    Object.freeze(['BRIEF', 'PARALLEL_GENERATE_POSTS', 'QA_REVIEW', 'SCHEDULE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-content-003',
    name:     'Video script → media production',
    team:     'CONTENT',
    steps:    Object.freeze(['RESEARCH', 'SCRIPT_DRAFT', 'MEDIA_PRODUCE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === OPERATIONS WORKFLOWS ===
  {
    id:       'wf-ops-001',
    name:     'Weekly business health check',
    team:     'OPERATIONS',
    steps:    Object.freeze(['DATA_GATHER', 'PARALLEL_ANALYSIS', 'QA_VERIFY', 'REPORT']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-ops-002',
    name:     'CRM audit and deduplication',
    team:     'OPERATIONS',
    steps:    Object.freeze(['CRM_EXPORT', 'DEDUPLICATE', 'QA_VERIFY', 'CRM_UPDATE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-ops-003',
    name:     'Onboarding new business client',
    team:     'OPERATIONS',
    steps:    Object.freeze(['INTAKE_FORM', 'SETUP_RECORDS', 'CONFIGURE_AUTOMATION', 'VERIFY']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === SUPERVISOR WORKFLOWS ===
  {
    id:       'wf-supervisor-001',
    name:     'Supervisor delegates and aggregates results',
    team:     'SALES',
    steps:    Object.freeze(['DECOMPOSE_OBJECTIVE', 'DELEGATE_3_AGENTS', 'AGGREGATE_RESULTS', 'QUALITY_GATE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-supervisor-002',
    name:     'Supervisor stops loop on conflict',
    team:     'SALES',
    steps:    Object.freeze(['DECOMPOSE_OBJECTIVE', 'AGENT_CONFLICT', 'SUPERVISOR_RESOLVES', 'RESUME']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-supervisor-003',
    name:     'Supervisor requests human approval for Ads',
    team:     'CONTENT',
    steps:    Object.freeze(['PLAN_ADS', 'SUPERVISOR_BLOCKS', 'HUMAN_APPROVAL_REQUESTED']),
    outcome:  'WAITING_HUMAN',
    isReal:   false,
  },

  // === HANDOFF WORKFLOWS ===
  {
    id:       'wf-handoff-001',
    name:     'Chat → Booking handoff (quality pass)',
    team:     'BOOKING',
    steps:    Object.freeze(['CHAT_INTAKE', 'HANDOFF_EVALUATE', 'BOOKING_AGENT_TAKES_OVER']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-handoff-002',
    name:     'Lead → Sales → CRM sequential handoff',
    team:     'SALES',
    steps:    Object.freeze(['LEAD_QUALIFY', 'LEAD_TO_SALES_HANDOFF', 'SALES_PITCH', 'SALES_TO_CRM_HANDOFF', 'CRM_UPDATE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-handoff-003',
    name:     'Support → Human handoff (clear context)',
    team:     'SUPPORT',
    steps:    Object.freeze(['SUPPORT_ATTEMPT', 'HANDOFF_EVALUATE', 'SUPPORT_TO_HUMAN']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === PARALLEL EXECUTION ===
  {
    id:       'wf-parallel-001',
    name:     'Parallel research tasks (safe)',
    team:     'CONTENT',
    steps:    Object.freeze(['DECOMPOSE', 'PARALLEL_RESEARCH_3', 'AGGREGATE', 'DRAFT']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-parallel-002',
    name:     'Sequential CRM writes (coordinator enforces order)',
    team:     'OPERATIONS',
    steps:    Object.freeze(['ACQUIRE_LOCK', 'WRITE_1', 'RELEASE_LOCK', 'ACQUIRE_LOCK', 'WRITE_2', 'RELEASE_LOCK']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === CHECKPOINT & RECOVERY ===
  {
    id:       'wf-recovery-001',
    name:     'Resume from checkpoint after transient failure',
    team:     'SALES',
    steps:    Object.freeze(['STEP_1', 'CHECKPOINT', 'TRANSIENT_FAILURE', 'RESUME_FROM_CHECKPOINT', 'COMPLETE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-recovery-002',
    name:     'Agent replaced after repeated failure',
    team:     'SUPPORT',
    steps:    Object.freeze(['AGENT_FAILS', 'RECOVERY_POLICY_REPLACE', 'REPLACEMENT_AGENT_COMPLETES']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === QUALITY GATE ===
  {
    id:       'wf-quality-001',
    name:     'Workflow passes quality gate (score ≥ 90)',
    team:     'SALES',
    steps:    Object.freeze(['COMPLETE_WORKFLOW', 'QUALITY_SCORE_COMPUTE', 'GATE_PASS']),
    outcome:  'COMPLETED',
    qualityScore: 94,
    isReal:   false,
  },
  {
    id:       'wf-quality-002',
    name:     'Critic reviews and improves output',
    team:     'CONTENT',
    steps:    Object.freeze(['DRAFT', 'CRITIC_REVIEW', 'REVISION', 'FINAL_PASS']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === MEMORY / CONTEXT ===
  {
    id:       'wf-memory-001',
    name:     'Shared context: business facts preserved across agents',
    team:     'SALES',
    steps:    Object.freeze(['SET_BUSINESS_FACTS', 'AGENT_A_READS', 'AGENT_B_READS', 'AGGREGATE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
  {
    id:       'wf-memory-002',
    name:     'Private scratch never leaked across agents',
    team:     'SALES',
    steps:    Object.freeze(['AGENT_A_WRITES_SCRATCH', 'AGENT_B_READ_BLOCKED', 'COMPLETE']),
    outcome:  'COMPLETED',
    isReal:   false,
  },

  // === V1 FALLBACK ===
  {
    id:       'wf-v1-001',
    name:     'V1 fallback for simple FAQ (multiagent not needed)',
    team:     'GENERAL_ASSISTANT',
    steps:    Object.freeze(['ASSESS_COMPLEXITY', 'ROUTE_TO_V1', 'V1_HANDLES']),
    outcome:  'COMPLETED',
    isReal:   false,
  },
]);

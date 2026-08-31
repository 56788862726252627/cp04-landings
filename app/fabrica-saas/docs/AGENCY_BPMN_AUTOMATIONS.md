# BPMN Automation Flow

## Lanes
- Business Trigger (CLIENT_OWNER): trigger
- Make (AUTOMATION_SPECIALIST): validate, execute, error handling, output, complete
- Human Review (PROJECT_MANAGER): review invalid inputs or errors

## Flow
Trigger → Validate → [valid: Execute] [invalid: Human Review → Execute] → [success: Output → Complete] [error: Error Handling → Retry/Human Review]

## Error Handling
- If retry: back to Execute
- If no retry: Human Review → FAILED end
- If output invalid: back to Error Handling

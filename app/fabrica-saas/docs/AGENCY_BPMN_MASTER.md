# BPMN Master — Agency IA

## Models
| ID | Name | SOP Ref | Pools |
|----|------|---------|-------|
| BPMN_AGENCY_MAIN | Agency Full Pipeline | AGENCY_SOP_FULL_PIPELINE | 1 (7 lanes) |
| BPMN_CLIENT | Client ↔ Agency Flow | CLIENT_SOP | 2 (client + agency) |
| BPMN_FACTORY | Factory Product Generation | FACTORY_PRODUCT_GENERATION | 1 (6 lanes) |
| BPMN_AUTOMATION | Automation Execution Flow | AUTOMATION_LIFECYCLE | 1 (4 lanes) |
| BPMN_INCIDENT | Incident Management Flow | INCIDENT_MANAGEMENT | 1 (5 lanes) |

## Element Types Supported
- bpmn:StartEvent
- bpmn:EndEvent
- bpmn:Task
- bpmn:ServiceTask
- bpmn:UserTask
- bpmn:ManualTask
- bpmn:ExclusiveGateway (XOR)
- bpmn:ParallelGateway
- bpmn:SequenceFlow

## Export Formats
- JSON (native)
- Mermaid flowchart
- BPMN-like XML (simplified, not full BPMN 2.0 XSD)

## Note
Export to full BPMN 2.0 XSD-compliant XML requires dedicated tool (Camunda, etc).
Current XML export is BPMN-compatible model, documented as simplified.

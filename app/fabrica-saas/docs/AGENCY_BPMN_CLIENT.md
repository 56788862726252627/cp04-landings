# BPMN Client Flow

## Pools
### Pool: Cliente
- Lane CLIENT_OWNER: inquiry → submit → proposal_review → decision → acceptance → training
- Lane CLIENT_USER: support ticket

### Pool: Agencia
- Lane Commercial: intake → qualification → proposal → revision
- Lane Project Manager: discovery → delivery → handoff
- Lane Support: ticket resolution
- Lane Agency Owner: closeout

## Key Gateways
- gw_client_approves: accept / reject / revise (max 2 rounds)

## Flows
Lead intake → Qualification → Discovery → Proposal → [Accept/Reject/Revise] → Delivery → Acceptance → Handoff → Training → Support → Closeout

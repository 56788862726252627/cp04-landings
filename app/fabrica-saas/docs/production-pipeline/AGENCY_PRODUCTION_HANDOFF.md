# Production Handoff

ADV-04 — Delivering to the client

## Handoff package includes

- Final URL (preview / staging / production)
- Role summary (who has access to what)
- Admin instructions
- Support route
- Maintenance plan reference
- Known limitations (incomplete integrations, manual steps pending)
- Rollback info (how to revert if needed)
- Health status at handoff
- Release version + commit SHA

## Manual integrations pending

Handoff explicitly lists integrations that could not be automated:
- WhatsApp Business (requires Meta approval)
- Stripe Live (requires billing activation)
- Custom domain (requires DNS setup)

These are listed in `handoff.manualPending` — not hidden.

## Principle

Never declare production complete if:
- URL not verified
- Critical QA failing
- Health status DEGRADED or UNKNOWN
- Rollback not available

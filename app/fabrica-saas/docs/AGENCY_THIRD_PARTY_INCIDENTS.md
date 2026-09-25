# Third-Party Incident Ownership

**Module**: `maintenance/thirdPartyIncidents.js`

## Ownership Categories (4)

| Ownership | When | Agency Action |
|-----------|------|--------------|
| AGENCY_OWNED | Custom code, deployment config, CI/CD | Activate incident protocol |
| CLIENT_OWNED | Client credentials, domain registrar | Inform + support client |
| THIRD_PARTY_OWNED | Stripe, OpenAI, Make.com, Supabase, Cloudflare | Monitor status page; communicate to client |
| SHARED | Agency layer + third-party platform both involved | Joint investigation |

## Classification Keywords

**Third-party**: stripe, openai, anthropic, supabase, cloudflare, make.com, zapier, twilio, whatsapp, sendgrid, vercel, netlify, airtable

**Client-owned**: client content, client credentials, domain registrar, client account, client password

**Agency-owned**: codebase, deployment config, custom code, agency, build, ci/cd, worker

## API

```js
classifyOwnership(description, category?)
// Returns { ownership, category, detectedKeywords, agencyAction }

createThirdPartyIncidentReport({ title, description, affectedService, statusPageUrl, workaround })
// Returns { valid, reportId, title, description, classification, ... }
```

## Notes
- Disclaimer: Classification is an operational guide. Does not limit liability.
- Agency always investigates as default if no keywords match.

# SaaS Factory Operating Standard

## Social Media media pipeline — permanent operating rule

1. Prioritize a zero-service-cost pipeline for image, audio and video generation. Do not require paid subscriptions, paid API calls or paid credits to keep the core workflow operational.
2. External tools may be used only when their current free tier is verified. Never assume a third-party service will remain free forever; if its free conditions change, replace it before using paid capacity.
3. Prefer local/open tooling for reproducibility: ChatGPT for creative direction/assets where available and FFmpeg/local processing for video assembly.
4. **Video audio rule:** create videos **completely silent by default: no music, no voice-over, no narration, no sound effects and no other audio track**. Only add audio when the user explicitly asks for a specific named song. In that case, confirm that the workflow can use that song lawfully and technically before adding it. This rule overrides any previous default involving generated music, synthetic speech or other audio.
5. **Master quality rule:** preserve the exact master file for social publishing. Do not downscale resolution, reduce frame quality, lower bitrate, create a `tiny` derivative, recompress, transcode or otherwise apply any lossy transformation merely to make transport easier. The downloadable tablet copy, durable GitHub copy and file handed by Make to the social network must originate from the same master bytes whenever the platform allows it. Prefer durable public-URL transfer of the master over Base64 when Base64 would force truncation or degradation. A social network may still perform its own unavoidable server-side transcoding; never describe that external transcoding as controllable by the factory.
6. **Platform-format adaptation rule:** create or select a platform-native derivative before upload when the destination format differs from the master. For YouTube, normal videos default to **16:9 horizontal at 1920×1080** and Shorts default to **9:16 vertical at 1080×1920**. When a 4K master exists, use **3840×2160** for horizontal video and **2160×3840** for vertical video. `auto` mode follows the content type (`video` → 16:9, `short` → 9:16); explicit horizontal/vertical overrides are permitted. Do not stretch media. Prefer composition, crop, blurred/background fill or branded re-layout that preserves important content.
7. **YouTube resolution rule:** `Publicación Social Directa` must expose `1080p` and `4k`. The payload should preserve dedicated URLs for 1080p horizontal, 1080p vertical, 4K horizontal and 4K vertical derivatives when available. If a format-specific URL is absent, the branch may fall back to the durable master URL; never claim 4K unless the uploaded file itself is verified as 3840×2160 or 2160×3840.
8. **YouTube privacy rule:** `Publicación Social Directa` must expose `unlisted`, `private` and `public`. `unlisted` is the default for technical validation. A public upload or any operation that creates public content is a real publication and must never be triggered without the required explicit one-time confirmation immediately before execution.
9. **YouTube metadata rule:** use category `Sports` for Club Pádel 04 unless a future item clearly belongs elsewhere; set `madeForKids=false` for ordinary club content; set the altered/synthetic-media flag according to the actual asset, including realistic AI-generated scenes that did not occur.
10. **YouTube post-processing rule:** after a successful upload, the Hub may optionally apply a custom thumbnail and/or add the new video to a playlist. These actions must run only when their corresponding input is non-empty. Empty optional values must result in a clean no-op, not an error.
11. **YouTube scheduling rule:** future publishing uses `privacyStatus=private` plus `publishAt` in ISO 8601. Treat this as a future public publication and apply the same explicit one-time publication warning before creating the scheduled item. Validate the returned `publishAt`, and for tests delete or cancel the temporary scheduled item before it goes public.
12. **YouTube captions rule:** captions are supported through the official YouTube Data API using OAuth scopes `youtube`/`youtube.force-ssl`. The Make YouTube universal module can reach the upload endpoint with relative path `../upload/youtube/v3/captions`; multipart SRT upload, list, download and delete must be tested on private/non-public test videos before production use.
13. **YouTube comments rule:** comment monitoring and replies require the extended OAuth connection. Test the polling trigger with a newly-created comment after establishing the trigger cursor; avoid assuming an empty first polling cycle means failure.
14. **YouTube Live rule:** do not claim Live readiness until the channel itself is enabled by YouTube. Once enabled, validate private broadcast creation, stream creation, binding, state reads and cleanup. Do not transition a broadcast to a public live state without the explicit publication warning.
15. **YouTube validation matrix:** before declaring the integration complete, validate end-to-end through `Publicación Social Directa -> Social Media & Ads Hub -> YouTube` at least: automatic 16:9 video, automatic 9:16 Short, forced horizontal override, forced vertical override, 1080p, 4K horizontal, 4K vertical, `unlisted`, `private`, long-form upload over 15 minutes, fallback from platform-specific URL to master URL, safe rejection/no-op of unsupported YouTube payloads (`image`, `text`, non-YouTube content types in auto mode), `draft` gating with all networks selected, dynamic made-for-kids/synthetic flags, scheduling, custom thumbnail, playlist assignment, comments, captions, safe delete of temporary video, and Live lifecycle once the channel is enabled.
16. For social-network connection tests, create purpose-built media for the exact test instead of reusing unrelated assets.
17. Keep a downloadable copy for tablet/mobile use and a durable project copy in GitHub under `public/social/` whenever binary upload is available through the working environment. If binary upload is not available programmatically, require only the minimum manual upload step and continue automation from there.
18. Production route: `ChatGPT / app -> Publicación Social Directa -> Social Media & Ads Hub -> network-specific branch`.
19. Media payloads must preserve: approval status, target-network booleans, media type, content type, text, title, description, filename, platform privacy, platform format mode, requested resolution and either a durable public URL or binary-safe transport. When platform-specific derivatives exist, preserve horizontal/vertical and 1080p/4K URLs so the destination branch can select the correct variant.
20. Before every real social post, explicitly warn that it will publish for real and execute only once. Never rerun a multi-network payload after one branch already succeeded; retry only the failed network.
21. Validate each network separately for text, image and video where supported, record execution status and returned post/share ID, and avoid duplicate production posts.
22. This standard should be reused by the SaaS factory for new client projects, adapting branding, accounts, roles and network permissions without copying client-specific credentials or secrets.

## YouTube validation status — Club Pádel 04 — 2026-09-06

### Uploading and format adaptation

- ✅ Automatic standard video -> horizontal 16:9 at 1080p.
- ✅ Automatic Short -> vertical 9:16 at 1080p.
- ✅ Forced horizontal override.
- ✅ Forced vertical override.
- ✅ Horizontal 4K verified by YouTube at 3840×2160.
- ✅ Vertical 4K verified by YouTube at 2160×3840.
- ✅ Privacy modes `unlisted`, `private` and `public` validated.
- ✅ Long-form upload over 15 minutes validated at 16:01 with processing succeeded.
- ✅ Fallback from missing platform-specific derivative URL to durable `media_url` validated.
- ✅ Unsupported YouTube payloads (`image`, `text`, incompatible auto content types) no-op safely without upload.
- ✅ Draft gating validated with all network booleans selected: no network posted.
- ✅ Public test executed exactly once after explicit publication warning; only the YouTube branch ran. Public Video ID: `gOd7gfn37jQ`.
- ✅ OAuth extended connection `10580025` verified against Club Pádel 04 channel `UCjVskmMzmmwsCuTFYq2Miiw` with scopes `youtube`, `youtube.force-ssl`, `youtube.upload`.

### Metadata, scheduling and post-processing

- ✅ Dynamic `madeForKids` and `containsSyntheticMedia` validated end-to-end.
- ✅ `publishAt` validated end-to-end from `Publicación Social Directa` through Hub to YouTube. Temporary scheduled video `rC-dzFFf8Rc` returned the exact requested `publishAt` and was deleted before publication.
- ✅ Custom thumbnail persisted in the production Hub and was executed successfully after upload.
- ✅ Playlist assignment persisted in the production Hub and was executed successfully after upload.
- ✅ Production post-processing test: Direct execution `5f3c1f7f75774c98969b1ed36d148ee4`, Hub execution `9bef4fb619be4579b36c26bd0404b3c6`, private video `ksYKnJtMxCU`; modules upload -> thumbnail download -> thumbnail set -> playlist add all succeeded. Temporary video and playlist were deleted after validation.
- ✅ Optional thumbnail/playlist filters use non-empty checks so blank optional inputs cleanly no-op.
- ✅ Safe video deletion tested successfully with a temporary video and then re-read as absent.

### Comments and captions

- ✅ Extended OAuth removed prior insufficient-scope failures.
- ✅ Read/list comments via API.
- ✅ Native `Watch New Comments` trigger validated after cursor initialization; it detected the new test comment `Ugzy6G9fbzwl6gtzEyF4AaABAg`.
- ✅ Reply-to-comment validated; Make returned reply ID `UgyhOKid4LO3EsfGG4h4AaABAg.AaPUpt27iCQAaPVYmbitfG`.
- ✅ Test comments created for trigger validation were deleted after testing.
- ✅ Captions list validated.
- ✅ SRT caption upload via multipart official API validated; caption reached `status=serving`.
- ✅ Caption download as SRT validated.
- ✅ Caption deletion validated.

### Channel management

- ✅ Channel identity, description, country and languages read/validated.
- ✅ Channel details update module validated without changing intended identity.
- ✅ Banner update validated with an accepted 2048×1152 PNG after correcting the too-small 512×288 variant.
- ✅ Long uploads are enabled for the channel.

### Features not exposed as normal creation endpoints in the official Data API

- 🟡 Premieres: no dedicated Premiere creation/transition resource is exposed in the current YouTube Data API reference; do not claim automated Premiere creation unless YouTube adds an official supported endpoint.
- 🟡 Community posts: no supported Community-post creation resource is exposed in the current YouTube Data API reference; do not automate by browser scraping as part of the core factory.
- 🟡 Cards and end screens: YouTube Analytics/Reporting exposes their performance metrics, but the standard Data API does not expose normal creation/edit endpoints for them; treat creation as Studio-only unless the official API changes.
- 🟡 Memberships, merch and monetization-specific controls depend on eligibility/product APIs and are outside the normal channel publishing workflow unless the client account is eligible and an official endpoint exists.

### Remaining external gate

- ⏳ YouTube Live activation was requested on 2026-09-06 around 09:17 Europe/Madrid. YouTube Studio displayed a ~24-hour activation countdown.
- ⏳ A scheduled condition check has been created for 2026-09-07 beginning at 09:25 Europe/Madrid and will retry hourly for a limited window. Once Live is enabled, the final private broadcast/stream/bind/read/cleanup validation must run automatically without starting a public live broadcast.

Until that external YouTube activation gate clears, all currently executable YouTube publishing, metadata, post-processing, comment, caption, playlist, thumbnail, channel-management and cleanup tests are complete. The integration should not be labeled globally 100% complete until the private Live lifecycle validation also passes.

## SaaS Factory social-network onboarding and continuous-improvement rule

1. **Network-by-network onboarding order:** finish one social network to the maximum supported level before moving to the next. For each network, first create the official account/profile, then complete branding and public profile data, then connect OAuth/API credentials to Make, then integrate and validate `Publicación Social Directa` and `Social Media & Ads Hub`, and only after all required networks are stable connect the social layer to the client application.
2. **Create and personalize before automation:** never start the Make OAuth/integration step until the network account has the intended project identity, handle/name, logo/avatar, cover/banner when supported, description/bio, website/contact/location fields when appropriate, language/region settings and any required business/professional mode.
3. **Application integration comes last:** the reusable production chain is `Project app -> Publicación Social Directa -> Social Media & Ads Hub -> network-specific branch`. During network onboarding, test from Direct/Hub first. Connect the client-facing application only after every selected network has been created, personalized, authenticated and regression-tested.
4. **Autonomous preparation rule:** before asking the user to do anything manually, inspect the current Make scenarios and project standard. Perform safe non-destructive preparation, schema changes, branch creation, filters, mappings, tests with drafts/private/unlisted content and documentation autonomously whenever the connected tools permit it. Ask the user only for unavoidable actions such as account creation, MFA, OAuth consent, platform verification or a public-post confirmation.
5. **No premature public tests:** use drafts, private/unlisted visibility or non-publishing API reads whenever possible. A real public publication requires the one-time explicit warning immediately before the action.
6. **Per-network completion matrix:** validate every content type and operation that the platform officially supports and that is useful to the project. Classify unsupported platform features explicitly instead of pretending they are missing implementation work.
7. **Continuous factory improvement:** every issue, workaround, new field, platform limitation, safety rule, media adaptation, OAuth lesson, regression check or successful production pattern discovered in one client/project must be evaluated for reuse and incorporated into this standard when generic. Future SaaS projects inherit the improved process, while client-specific IDs, credentials, secrets and branding never propagate.
8. **Current Club Pádel 04 sequence after YouTube:** proceed with **X** next because its branch already exists in `Social Media & Ads Hub` as a pending-authentication placeholder. Complete the X profile identity/branding first; only then authorize X in Make and replace/extend the placeholder with the supported X publishing modules and validation matrix. After X, continue with the next remaining network (TikTok, then Threads, unless platform availability, project priority or account eligibility makes another order more appropriate).
9. **Deferred-gate rule:** when a platform has a time-based external gate (for example YouTube Live activation), persist the pending validation and continue productively with the next network instead of blocking the factory. Resume the gated validation once the external condition clears, without duplicating prior successful tests.

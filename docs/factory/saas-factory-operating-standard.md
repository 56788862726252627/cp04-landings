# SaaS Factory Operating Standard

## Social Media media pipeline — permanent operating rule

1. Prioritize a zero-service-cost pipeline for image, audio and video generation. Do not require paid subscriptions, paid API calls or paid credits to keep the core workflow operational.
2. External tools may be used only when their current free tier is verified. Never assume a third-party service will remain free forever; if its free conditions change, replace it before using paid capacity.
3. Prefer local/open tooling for reproducibility: ChatGPT for creative direction/assets where available and FFmpeg/local processing for video assembly.
4. **Video audio rule:** create videos **completely silent by default: no music, no voice-over, no narration, no sound effects and no other audio track**. Only add audio when the user explicitly asks for a specific named song. In that case, confirm that the workflow can use that song lawfully and technically before adding it. This rule overrides any previous default involving generated music, synthetic speech or other audio.
5. **Master quality rule:** preserve the exact master file for social publishing. Do not downscale resolution, reduce frame quality, lower bitrate, create a `tiny` derivative, recompress, transcode or otherwise apply any lossy transformation merely to make transport easier. The downloadable tablet copy, durable GitHub copy and file handed by Make to the social network must originate from the same master bytes whenever the platform allows it. Prefer durable public-URL transfer of the master over Base64 when Base64 would force truncation or degradation. A social network may still perform its own unavoidable server-side transcoding; never describe that external transcoding as controllable by the factory.
6. For social-network connection tests, create purpose-built media for the exact test instead of reusing unrelated assets.
7. Keep a downloadable copy for tablet/mobile use and a durable project copy in GitHub under `public/social/` whenever binary upload is available through the working environment. If binary upload is not available programmatically, require only the minimum manual upload step and continue automation from there.
8. Production route: `ChatGPT / app -> Publicación Social Directa -> Social Media & Ads Hub -> network-specific branch`.
9. Media payloads must preserve: approval status, target-network booleans, media type, content type, text, title, description, filename and either a durable public URL or binary-safe transport.
10. Before every real social post, explicitly warn that it will publish for real and execute only once. Never rerun a multi-network payload after one branch already succeeded; retry only the failed network.
11. Validate each network separately for text, image and video where supported, record execution status and returned post/share ID, and avoid duplicate production posts.
12. This standard should be reused by the SaaS factory for new client projects, adapting branding, accounts, roles and network permissions without copying client-specific credentials or secrets.

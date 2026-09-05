# SaaS Factory Operating Standard

## Social Media media pipeline — permanent operating rule

1. Prioritize a zero-service-cost pipeline for image, audio and video generation. Do not require paid subscriptions, paid API calls or paid credits to keep the core workflow operational.
2. External tools may be used only when their current free tier is verified. Never assume a third-party service will remain free forever; if its free conditions change, replace it before using paid capacity.
3. Prefer local/open tooling for reproducibility: ChatGPT for creative direction/assets where available and FFmpeg/local processing for video assembly.
4. **Video audio rule:** create videos **without music by default**. Do not add background music, soundtrack or synthetic music unless the user explicitly names a specific song to use. If a specific song is requested, confirm that the workflow can use it lawfully and technically before adding it. This rule overrides any previous default of generating original background music.
5. For social-network connection tests, create purpose-built media for the exact test instead of reusing unrelated assets.
6. Keep a downloadable copy for tablet/mobile use and a durable project copy in GitHub under `public/social/` whenever binary upload is available through the working environment. If binary upload is not available programmatically, require only the minimum manual upload step and continue automation from there.
7. Production route: `ChatGPT / app -> Publicación Social Directa -> Social Media & Ads Hub -> network-specific branch`.
8. Media payloads must preserve: approval status, target-network booleans, media type, content type, text, title, description, filename and either a durable public URL or binary-safe transport.
9. Before every real social post, explicitly warn that it will publish for real and execute only once. Never rerun a multi-network payload after one branch already succeeded; retry only the failed network.
10. Validate each network separately for text, image and video where supported, record execution status and returned post/share ID, and avoid duplicate production posts.
11. This standard should be reused by the SaaS factory for new client projects, adapting branding, accounts, roles and network permissions without copying client-specific credentials or secrets.

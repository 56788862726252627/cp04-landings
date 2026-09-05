# SaaS Factory Operating Standard

## Social Media media pipeline — permanent operating rule

1. Prioritize a zero-service-cost pipeline for image, audio and video generation. Do not require paid subscriptions, paid API calls or paid credits to keep the core workflow operational.
2. External tools may be used only when their current free tier is verified. Never assume a third-party service will remain free forever; if its free conditions change, replace it before using paid capacity.
3. Prefer local/open tooling for reproducibility: ChatGPT for creative direction/assets where available, FFmpeg/local processing for video assembly and original royalty-free audio generated locally when appropriate.
4. For social-network connection tests, create purpose-built media for the exact test instead of reusing unrelated assets.
5. Keep a downloadable copy for tablet/mobile use and a durable project copy in GitHub under `public/social/` whenever binary upload is available through the working environment. If binary upload is not available programmatically, require only the minimum manual upload step and continue automation from there.
6. Production route: `ChatGPT / app -> Publicación Social Directa -> Social Media & Ads Hub -> network-specific branch`.
7. Media payloads must preserve: approval status, target-network booleans, media type, content type, text, title, description, filename and either a durable public URL or binary-safe transport.
8. Before every real social post, explicitly warn that it will publish for real and execute only once. Never rerun a multi-network payload after one branch already succeeded; retry only the failed network.
9. Validate each network separately for text, image and video where supported, record execution status and returned post/share ID, and avoid duplicate production posts.
10. This standard should be reused by the SaaS factory for new client projects, adapting branding, accounts, roles and network permissions without copying client-specific credentials or secrets.

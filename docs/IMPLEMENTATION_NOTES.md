# RIVS interaction proof / review notes

**Visual basis:** two user-supplied reference videos of a furnished-room transformation and moving architectural camera. Both informed the authored interaction; neither video is deployed.

**Choreography:** 0–12% empty shell; 12–41% independently staged furniture placement; 49–68% deconstruction/second arrangement; 69–86% perspective camera travel toward the furnishings; 86–100% return toward wide composition and consultation. Scrolling is native, reversible, and not hijacked.

**Acceptance risks:** Objects are procedurally styled CSS geometry, not source 3D render assets; photographic materials and physically correct shadows are not yet provided. CSS parallax and camera scaling cannot fully equal the lens-specific reference clip. A production-quality render pipeline is required for photorealistic fidelity.

**Accessibility:** content section after the pinned scene; escape via skip link; keyboard-accessible native dialog; desktop/mobile CSS layouts; reduced-motion and save-data alternative; no autoplay or sourced video footage.

**Validation:** JavaScript passed `node --check` and the markup parsed with Python HTMLParser in the local development session. A Chromium browser was blocked by the runtime administrator for local URLs, so responsive and animation screenshots are not yet verified. A Vercel READY status is not a substitute for device QA.

# RIVS — Real 3D Art Direction & Production Gate

## Decision
Replace the current portrait video-driven homepage and the prior simulated CSS 3D with a **genuine, sharp, full-screen 3D architectural interior**. Current videos are motion references only. Do not stretch, sharpen, interpolate, or repurpose the low-resolution portrait video as a desktop hero. No third-party end-card branding.

### User experience
The room is the homepage. The visitor can understand the space before a motion sequence starts. A native page scroll controls an editorial interior journey: empty architecture → furniture assembled → lived-in room → deliberate camera move through materials → concise contact CTA. Keep one minimal RIVS identity treatment and one primary action. Remove all developer terminology, viewport numbers, progress percentages, technical jargon and unnecessary labels from the customer-facing UI. Respect UX, AX, DX as quality criteria, not customer-facing labels.

### Asset quality gate
**Do not ship primitive approximations or illustrated-looking furniture.** Need an original authored coherent room shell (walls, openings, ceiling, floor, built-in details) and furniture assets that match the same camera, scale, lighting, materials and aesthetic direction:
- glTF/GLB meshes with realistic geometry, appropriate UV mapping, baked AO/normal/roughness where valuable
- coherent colour management and physically based materials, consistent with brand
- authored photometric/area lighting, indirect fill, contact shadows, correct occlusion
- high-resolution desktop art direction (landscape) and a separately composed mobile camera, rather than cropping a portrait source
- license provenance for every model / texture / environment map; CC0 Poly Haven assets can support the scene, but independently sourced furniture alone does not create a convincing interior
- test visual similarity to the user's two reference videos for empty state, furniture entrance and spatial walkthrough, without copying branded footage

Suggested source examples (verify model and license before use):
- https://polyhaven.com/a/modern_arm_chair_01
- https://polyhaven.com/a/sofa_02
- https://polyhaven.com/a/mid_century_lounge_chair

### Runtime
Use Three.js + React Three Fiber (stable React-compatible release) for true mesh rendering, glTF loaders, authored camera transforms and scroll interpolation; avoid fake CSS-only perspective marketed as 3D. Use on-demand rendering / capped device pixel ratio / compressed assets and texture sizes matched to device. Maintain 60fps target where feasible without blurring or plastic-smoothing; prioritize a consistent 30+ fps mobile before adding secondary effects.

Rendering strategy for cinematic fidelity: a **hybrid** is acceptable — actual 3D scene for depth and interactive camera; prerendered original 4K/2K frames for computationally expensive architectural transitions when a phone cannot render them reliably. Never ship a portrait 696-pixel-wide reference as a full-bleed desktop film.

### Accessibility, performance, availability
- Mobile camera must fit the room, not crop key furniture, and controls must be touch operable.
- Reduced-motion / low-data users receive a sharp, properly composed still image and essential navigation.
- Provide loading/progress feedback in human language and an honest recovery state for unavailable WebGL/models.
- Avoid unbounded shadows, SSAO and post-processing that make the page soft or blurry.
- Preserve functional enquiry and semantic DOM outside WebGL. The current preview is a copy-to-clipboard enquiry, not a live submission endpoint.
- Ensure usable 320px and 390px states and desktop 1440px / 1920px compositions.

### Visual acceptance before new Vercel release
1. Save and inspect first, mid-assembly, completed, camera-travel and exit frames in an actual browser.
2. Confirm models have visible authentic geometry, realistic shadows and material texture at native desktop resolution.
3. Verify scrolling backward reverses animation, does not clip furnishings or trap the page.
4. Check mobile camera crop and device-pixel ratio, including slow-network fallback.
5. Confirm no third-party brand names appear in the visuals and all media licenses are recorded.
6. Compare every visual state with the intended source-video choreography. Reject stylized, cartoon-like models or generic hero illustrations.
7. Do **not** replace the current review URL or merge to `main` until a faithful scene meets the visual bar.

## Current state
**Production specification only.** A new fully modeled high-fidelity 3D scene has not been created or approved. The prior Vercel deployments remain video-based; they must not be described as the real-3D implementation.

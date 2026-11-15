# RIVS — Immersive Rebuild Specification

Status: **REBUILD REQUIRED — previous preview rejected**. This document supersedes the layout direction of PR #1. It does not claim an implementation or an approved design.

## Reference videos, observed visual behaviour

Reference A: *From Klickpin.com — 596375175700922351…mp4* (approx. 15.8 s). Starts in a bare naturally illuminated white room with wood floor. A volume appears, furniture and art arrive as separate objects; the room forms a furnished vintage arrangement. Furnishings lift and dismantle in coordinated 3D-looking motion, reassemble as a cooler minimal living room, then transform again to a warmer layered interior. The room shell remains visually stable during most assembly. At the end, the composition returns to the empty room. The essence is **object-level appearance, transformation, deconstruction, and reassembly**, not a crossfade between photographs.

Reference B: *From Klickpin.com — Cozy garden wedding decor ideas…mp4* (approx. 12.7 s, despite filename, imagery depicts contemporary interior). The camera travels laterally and forward through a warm interior. Wide establishing shots alternate with foreground passes, controlled motion blur, and brief detail studies including tables and a lamp. The essence is **camera travel and material exploration**, not a scroll-triggered opacity reveal.

Reference videos are supplied for visual analysis. Do **not** redistribute third-party footage or derivative extracted frames on a public site without documented rights.

## Rejected build decisions

- Two-column text-heavy hero: rejects the space as protagonist.
- Oversized slogan and editorial manifesto before the immersive scene.
- Existing photo-swap as the alleged room assembly.
- Small rotating panels/cut-corner film frame pretending to be a 3D world.
- Conventional tiled portfolio cards as the primary experience.
- Layered nav chrome, decorative grain, generic arrow icons and effects that compete for attention.
- Mobile sequence that automatically loops without scroll correspondence.

## New experience thesis

The visitor enters an architectural space; **scrolling is the director**. Room objects assemble, pause, deconstruct, and reassemble. The viewer then travels through the finished space to discover lighting, texture and craftsmanship. Navigation and next actions remain usable on top of the scene in a restrained Apple-like translucent treatment. The page feels like inhabiting an interior, not reading a sales page.

## Scene choreography (one continuous spatial story)

The timeline below describes *scroll progress*, not chronological seconds; final scene durations should be tuned visually.

1. **0–12% | Establish empty room**: a full-viewport architectural room with stable floor and walls, plausible daylight, no full-size headline obscuring the scene. Tiny RIVS mark, minimum navigation, unobtrusive scroll cue. Distinct visual depth must be obvious.
2. **12–37% | Compose the room**: furnishings enter as independently identifiable layers; visible depth, parallax, rotation and settling. Shadows and occlusion match the final arrangement. Furniture never simply fades across two complete photographs. Hold the completed space.
3. **37–56% | Reimagine**: selected objects separate and rearrange. Preserve room camera continuity and architecture as furniture changes. Use deliberate pauses; no chaotic random motion.
4. **56–79% | Enter the interior**: camera travels forward/laterally; foreground objects pass relative to the background. Include a focused material/detail beat with enough dwell time to appreciate the shot.
5. **79–91% | New space handoff**: perspective-aligned transition, not an abrupt rectangle or section divider. Another project appears only once the first scene resolves.
6. **91–100% | Consultation**: minimal ending with a credible enquiry action and clear next step.

Project stories may appear as contextual glass labels *within* these scenes. Avoid invented completed client projects, metrics and client reviews.

## Asset and technical contract

- **Do not imply CSS alone can reconstruct photorealistic interiors from flattened video**. To achieve Reference A quality, plan original or licensed layered visual assets with alpha masks, coordinated shadows, and ideally source 3D renders or a frame sequence with a camera/depth pass. Photorealistic transformation needs more than an animated JPEG.
- Obtain or create landscape 16:9 (desktop) and portrait 9:16 (mobile) deliverables for the **same scene**, rather than cropping a portrait reference to full desktop width.
- Preferred implementation: pinned, **scroll-scrubbed** scene using GSAP ScrollTrigger or equivalent RAF-controlled progress with robust refresh/resizing. Transparent layers can use CSS 3D transforms and individual timelines; a licensed original frame sequence is acceptable for complex occlusion or realistic camera motion.
- For camera travel, use viewpoint-dependent layers, authored 3D assets or frame-accurate rendered camera animation. Do not call a static image scale or entire-panel rotation a believable interior flythrough.
- Liquid Glass is **UI only**: compact nav, sparse captions and consultation action, tuned blur and contrast with fallback; the room occupies the primary visual field.
- Performance: responsive 100dvh/100svh pinned scene, adaptive media sizes, lazy-load subsequent scenes, preload just the active scene, no excess continuous GPU effects. On Save-Data or reduced-motion, provide a coherent finished-room state and accessible sequential content. Prefer mobile camera simplification rather than broken scroll control.
- Preserve native scrolling, text contrast, keyboard access, back/forward navigation, and touch interaction. The enquiry action must either work end-to-end or explicitly say it is a prototype.

## Visual acceptance criteria — mandatory before another approval request

1. Compare first, middle, fully composed, deconstruction, detail and exit states against both source videos, side by side.
2. At desktop and 390px mobile, the primary scene should occupy the full viewport without a split-site layout or giant headline overlay.
3. Scrub forward and backward with scroll; transformations should be reversible and stable.
4. At least two actual independent object motion layers should be visible (not only one flat image changing scale). For photo-real fidelity, use the original layered asset pipeline.
5. Scene-to-scene transitions retain visual continuity and feel intentional, not like regular sections.
6. Check 320px, 390px, tablet, 1440px, large text, slow CPU/network, touch and reduced-motion. Test visual frames, not only build/syntax success.
7. No public shipping of the reference clips without rights verification.
8. Verify live deployment *including* CSS/JS/media loading; a READY build is not proof of visual fidelity.

## Release gate

Leave PR #1 as draft, and do not merge the current design. Produce a faithful interaction proof with properly authored media and inspect it against the videos before deploying a replacement review build. Keep existing preview as an archived rejected concept, not as evidence of completion.

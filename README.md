# RIVS — A spatial experience

A scroll-directed, room-first concept for an interior design brand. The website holds one immersive architectural scene through a native-scroll sequence: empty room, individually animated furniture, deconstruction, reassembly, camera movement, then an enquiry.

## Preview run

Open `index.html` from a local static server (for example `python -m http.server 4173`). No dependencies or build tools are required. The scene works without the external font; it uses `DM Sans` and `Instrument Serif` with local fallbacks.

## Motion / design implementation

- Individually animated DOM/CSS furniture assemblies with custom shaded geometry: rug, sofa, chair, coffee table, books, art, plant and lamp.
- Reversible scroll-progress animation with stagger, float, deconstruct, reform and camera dolly, using native scrolling and a single RAF.
- Full-viewport scenic presentation, compact glass controls, progressive enhancement and touch layouts.
- Reduced motion, save-data fallback, keyboard-accessible enquiry dialog with copyable brief. No submission backend exists.

## Fidelity and media limitations

This is a custom browser-generated CSS 3D / 2.5D **interaction proof**, not a photorealistic interior or a final production portfolio. The third-party reference footage was **not** published, extracted, hosted or copied into the deployed build. To match the photorealistic reference, supply licensed scene-matched asset layers or original 3D models and camera renders. The brand identity and text are provisional. No client commissions, reviews or awards are claimed.

## Release gate

This is a review branch. The first conventional site draft is superseded and should not be merged; further asset fidelity, browser testing, accessibility and performance work are required before production.

# RIVS — Immersive Interior Design Concept

A cinematic, responsive interior-design website prototype featuring architectural depth, a CSS 3D scroll scene, Apple-inspired frosted-glass surfaces and editorial content.

This is a **working concept**, not the final public brand website. The name RIVS is taken provisionally from the repository name. Copy, contact details, projects, testimonials and portfolio imagery must be approved by the studio.

## Run locally

No build tools or packages are required:

```bash
python -m http.server 4173
```

Open `http://localhost:4173`.

For a Vercel preview, import `biobizzle/rivs`, choose the static project framework and use repository root as the output directory. Avoid multiple production builds until the visual direction has been reviewed.

## What is implemented

- Full-screen editorial architecture hero with configurable background footage hook
- A desktop pinned sequence with CSS 3D perspective, depth planes and scroll-driven chapter changes
- Three architectural image states for a functional demonstration of the transformation, even without licensed footage
- A responsive image gallery with native project detail dialogs
- Frosted-glass floating navigation and responsive mobile menu
- A project enquiry brief that **copies** content to the clipboard; it does not send or store customer information
- Keyboard access, reduced-motion mode, lazy images and a lighter mobile scene

## Image and footage policy

The two Pinterest/Klickpin videos used as visual references were **not included** in this public repository because public redistribution and commercial reuse rights were not confirmed. Their extracted frames are likewise excluded.

Until the studio supplies its own licensed photography and renders, the concept uses remote Unsplash demonstration photographs. They should be replaced by approved original brand imagery, stored and optimized with the website.

To activate licensed local footage:

1. Add two approved and compressed MP4s to `media/architectural-camera.mp4` and `media/room-transformation.mp4` in a private approved media workflow. The repo currently ignores `media/`.
2. In `index.html`, change the corresponding video attributes from `data-source` to `src`.
3. The interface will play hero footage and scrub transformation footage on desktop, provided the video can be efficiently sought. On mobile the main scene remains non-pinned.
4. Check physical devices and performance before publishing; do not assume equivalent behavior across browsers and video formats.

Full 3D furniture geometry would require original layered renders, WebGL models or custom scene assets; this prototype uses CSS 3D planes and changing architectural images, not modeled furniture.

## Source files

- `index.html` — semantic page, copy, gallery, dialogs
- `style.css` — responsive layouts, visual tokens, glass surfaces, CSS 3D
- `script.js` — scroll choreography, fallback chapters, dialogs, accessibility
- `favicon.svg` — temporary project symbol
- `vercel.json` — static hosting configuration

## Before production release

Confirm RIVS brand details, approved project material and licenses, functional contact delivery and anti-spam, privacy and legal pages, SEO metadata, performance budgets, real-device touch and scrolling QA, keyboard contrast and screen-reader testing. No backend or analytics have been connected.

## Development rule

Use feature branches and preview builds. Review the site before merging changes into `main`. The initial default branch is an initialization commit only.

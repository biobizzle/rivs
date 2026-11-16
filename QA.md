# RIVS 3D Preview — Review Checklist

## Automated checks to run

- `npm run check` validates the asset fetcher syntax.
- `npm run build` fetches verified CC0 furniture textures and bundles React/Three via Vite.
- `npm run preview` verifies navigation to `index.html`, `assets/*.js`, and `models/**` (image MIME, glTF JSON, and texture paths).

## Visual acceptance (not satisfied by build success)

- Check an actual browser at 390 and 1440 pixels, and verify both wall and floor are sharp.
- Empty room, object assembly, completed room, separation, final reassembly, and camera travel must look continuous.
- Actual furniture geometry and materials should remain detailed up close. Reject silhouettes, flat photos or an unfinished scene.
- No room elements clipped at narrow screen widths; independent mobile camera.
- Reverse scroll must reverse the furniture entrance and camera move.
- Reduced-motion/Save-Data must preserve enquiry access with a static fallback.
- Exercise keyboard navigation, escape-to-close dialog, focus visibility, and form copy flow.
- Verify no third-party branding or interface labels referring to software/tools.
- Smoke test network disconnect and low-end GPU; react error state must appear if assets fail.

## Release state

This source is a new implementation and requires visual acceptance before `main` is changed. A successful Vercel READY state alone is not proof of visual fidelity.

# RIVS — Real 3D Interior Experience

A real, scene-based architectural website for RIVS. Uses **React, Three.js, React Three Fiber** and a build-time Poly Haven asset pipeline. The homepage is a furnished three-dimensional room, not a video or a CSS image rotation.

## Experience

- Native scroll controls furniture entering a room, rearranging, and the camera travelling through the interior.
- Polished plaster, tiled oak floor, window frame, curtain, gallery wall, rug, warm lighting and coherent furniture scale.
- Desktop fills the viewport. Mobile gets a separate, wider camera framing and lower rendering budget.
- An accessible contact dialog prepares a copyable project enquiry; there is no message-delivery backend.
- Reduced-motion, Save-Data and no-WebGL get a static scene with functional contact and navigation.

## Run

```sh
npm install
npm run prepare:assets
npm run dev
```

Build uses `npm run build` and fetches selected **CC0 Poly Haven** models to `public/models`, which are excluded from Git. Vercel builds self-host these files under the deploy output, so client rendering is not reliant on fetching the Poly Haven API at runtime.

## Rights and provenance

- Models: `sofa_03` (Fran Calvente), `modern_arm_chair_01` (Vibrant Nordic), `modern_coffee_table_01` (Amin), `potted_plant_02` (Rico Cilliers). **CC0 1.0**, via https://polyhaven.com/ .
- The build-time API requires a unique User-Agent and public credit; this file fulfils the source credit and the interface includes a link to Poly Haven only in the project docs, rather than the customer-facing experience. Confirm service Terms of Use if reused commercially.
- Room shell, texture generation, scroll timeline, interface and layout are new RIVS work. No third-party video frames or branding are included.

## Review gate

This preview is not a licensed client portfolio and no completed client projects are claimed. Verify the source models are downloaded, sharp, correctly oriented and visually coherent, and inspect mobile/camera states in an actual browser before merging to main or calling it final.

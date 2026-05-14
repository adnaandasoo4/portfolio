# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint over `.js`/`.jsx`. Configured with `--max-warnings 0`, so any warning fails the lint.

There is no test runner configured in `package.json`.

## Architecture

Single-page React portfolio. `src/App.jsx` composes the page as a vertical stack of section components (`Hero`, `About`, `Experience`, `Tech`, `Works`, `Contact`) plus a `StarsCanvas` background. Navigation is anchor-based — section IDs come from the wrapper HOC, not from React Router (though `BrowserRouter` is mounted at the root).

A few patterns are load-bearing and worth understanding before editing:

**SectionWrapper HOC (`src/hoc/SectionWrapper.jsx`)** — every page section is exported wrapped by this HOC. It injects the outer `<motion.section>`, the shared horizontal/vertical padding from `src/styles.js`, a `viewport={{ once: true, amount: 0.25 }}` reveal trigger, and the `<span id={idName}>` anchor used by the navbar. New sections must follow the same `export default SectionWrapper(MyComponent, "anchor-id")` pattern or they'll lose padding, reveal animation, and anchor scrolling.

**Content is data-driven from `src/constants/index.js`** — sections like `Experience`, `Tech`, `Works`, and the About cards iterate over arrays defined in this single constants file (services, technologies, experiences, testimonials, projects). To add/edit portfolio content (a new job, project, or tech icon), edit the array in `constants/index.js`, not JSX inside the section components.

**Asset barrel (`src/assets/index.js`)** — `constants/index.js` imports image references by name from this barrel; new assets must be added to the barrel before they can be referenced from constants.

**Motion variants are centralized (`src/utils/motion.js`)** — `textVariant`, `fadeIn`, `zoomIn`, `slideIn`, `staggerContainer`. Components import these rather than defining variants inline. Reuse these rather than authoring new ad-hoc variants.

**Style helpers (`src/styles.js`)** — `styles.heroHeadText`, `styles.sectionHeadText`, `styles.sectionSubText`, `styles.padding`, etc., are the canonical tailwind class strings for headings/padding across sections. Use them for consistency. Custom theme tokens (`primary`, `secondary`, `tertiary`, `black-100`, etc.) are defined in `tailwind.config.js`.

**3D canvases (`src/components/canvas/`)** — `Earth`, `Ball`, `Computers`, `Stars`. Each follows the same shape: a scene component (lights + `<primitive>` from `useGLTF` or shader mesh) wrapped in a `<Canvas>` with `<Suspense fallback={<CanvasLoader />}>` and `<Preload all />`. `Computers.jsx` additionally swaps geometry based on a `matchMedia("(max-width: 500px)")` listener — mirror this pattern when adding responsive 3D content. GLTF models live in `public/desktop_pc/` and `public/planet/` and are loaded by relative path (`./desktop_pc/scene.gltf`).

**Contact form (`src/components/Contact.jsx`)** uses `@emailjs/browser` with the EmailJS service ID, template ID, and public key hardcoded in the component. If these need to rotate, replace inline — there is no env-var wiring set up.

# /works page rework — typographic index design

**Date:** 2026-05-21
**Scope:** Replace the alternating image-left/image-right layout in `src/components/AllWorks.jsx` with an editorial-playful typographic index. Apply light cohesion tweaks to `src/components/SelectedWork.jsx`.
**Out of scope:** The home-page horizontal pinned carousel layout, the per-project detail page, the Hero/About/Experience/Tech/Process/Contact sections, navigation, and routing.

---

## 1. Problem

`/works` (`AllWorks.jsx`) renders the 5 projects as a stacked list with image and meta alternating sides every other row (the "editorial zebra"). It reads as a generic portfolio template — there is no distinctive motion or composition, and the layout's center of mass is the cover images, not the work itself.

The goal is to push `/works` toward an awwwards-caliber editorial-playful feel: type-led, motion-rich on interaction, low-noise on the page. Coherence with the home page and per-project pages must be preserved.

## 2. Solution at a glance

`/works` becomes a single typographic index. The page is composed of:

1. A display title (`Works`) using the same Cabinet Grotesk treatment as the home Hero and per-project titles, with a letter-mask reveal on mount.
2. A 5-row stacked list. Each row is a `<Link>` containing the project's index, name (display-size), and `year · services` meta.
3. The existing `Contact` footer.

The carrier is the name. Cover images appear as a single shared preview that floats next to the cursor on desktop, glides between rows on a smooth lerp, and crossfades its `src` as the hovered row changes. Non-hovered rows dim. No layout shifts.

On mobile (< 768px), each row inlines its thumbnail beneath the name — the cursor preview does not exist on touch.

## 3. Page architecture

```
<main>                                     bg-paper, text-ink, full width
  ┌─ display title block ─────────────────┐  max-w-screen-2xl, px-6 sm:px-16,
  │  Works                                │  pt-32 sm:pt-40, pb-16
  └───────────────────────────────────────┘
  ┌─ project index list ──────────────────┐  same inner rail, pb-24
  │  01 ── PROJECT ONE ─── 2025 · WEB     │
  │  02 ── PROJECT TWO ─── 2025 · BRAND   │  hairline border between rows,
  │  03 ── PROJECT THREE ── 2024 · APP    │  one above the first row
  │  04 ── PROJECT FOUR ── 2024 · WEB     │
  │  05 ── PROJECT FIVE ── 2024 · OPS     │
  └───────────────────────────────────────┘
  ┌─ Contact (reused as-is) ──────────────┐
  └───────────────────────────────────────┘

  Floating cursor preview (desktop, position: fixed)
  ─ single shared element, lerp-follows mouse
  ─ src is hovered row's coverImage; crossfades on row change
  ─ hidden when no row is hovered
```

No `SectionWrapper` (this is a route page, not a homepage section). No small mono section labels above the title. The display title is the single page header — matching the per-project page pattern.

## 4. The row

### 4.1 Desktop layout (≥ 768px)

A row is a single horizontal band with three regions:

- **Index** (`01` … `05`) — left-anchored, `font-mono text-xs uppercase tracking-widest text-muted`. Padded out from the row's left edge so it sits in the page rail's left margin.
- **Name** — Cabinet Grotesk display: `font-weight: 700`, `font-size: clamp(48px, 7vw, 112px)`, `letter-spacing: -0.02em`, `line-height: 1`, `text-transform: uppercase`. Sits in the row's main column, left-aligned next to the index with breathing room.
- **Year · Services** — right-anchored on desktop, `font-mono text-xs uppercase tracking-widest text-muted`. Format: `{year} · {services.join(", ")}` — e.g. `2025 · WEB, BRAND`. The middle `·` separates year from the services list; services are comma-separated within their group.

Vertical padding: ~`clamp(20px, 3vw, 36px)` top and bottom, so the row height tracks the name's display size.

A `border-edge` 1px hairline sits above every row (a `border-t` on the row itself), and a final hairline closes the bottom of the last row (a `border-b` on the list container).

Whole row is a `<Link to={\`/works/${slug}\`}>` with `aria-label="Open {name}, {year}"` and `data-cursor="open project"`. The numeric index span is `aria-hidden="true"` — decorative, not meaningful for SR users.

### 4.2 Mobile layout (< 768px)

Same row, restructured to a vertical stack:

- Index (`01`) at top, small mono.
- Name beneath, display type, smaller cap: `font-size: clamp(32px, 9vw, 56px)`.
- Cover thumbnail beneath the name: `w-full`, `aspect-ratio: 16 / 10`, no border. If `coverImage` is null, the same typographic fallback used by the home tile (`{number} / {total}` mono + display-cased name centered in a `bg-edge` block).
- `Year · Services` mono line at the bottom of the row.

Vertical gap between rows widens to ~`64px` on mobile. The thumbnail provides enough visual separation; the inter-row hairline above each row is retained.

Whole row remains a single `<Link>`; tapping anywhere navigates.

## 5. Cursor-follow preview (desktop only)

### 5.1 Visual

A single `<div>` rendered at the bottom of the list component (one per page, not one per row). When visible, it shows the hovered project's `coverImage` (or the same typographic fallback as the home tile if `coverImage` is null) as a small landscape rectangle:

- Width: `clamp(240px, 22vw, 360px)`.
- `aspect-ratio: 16 / 10`.
- No border, no shadow, no caption. The image alone.

The element is `position: fixed`, `pointer-events: none`, `z-index` above the rows but below the navbar and `CustomCursor`. `will-change: transform, opacity`.

### 5.2 Position (mouse follow)

A `requestAnimationFrame` loop in `AllWorks` lerps the preview's translated position toward the current mouse position:

```
current.x += (target.x - current.x) * 0.18
current.y += (target.y - current.y) * 0.18
```

`0.18` produces the smooth-glide feel; tune in implementation if it feels off. The target is updated by a `mousemove` listener at `window` level with an offset of `+24px right, +24px down` from the cursor (so the image trails, not sits under). Clamp `current.x` and `current.y` so the preview never clips off the viewport edges.

The `requestAnimationFrame` loop runs only when at least one row is being hovered; on `mouseleave` of the list, the loop cancels and the preview fades out.

### 5.3 Source swap (row change)

When `hoveredIdx` changes from one valid index to another, the preview crossfades its image: `opacity 1 → 0 → 1` over ~180ms total (90ms out, swap `src`, 90ms in). The position keeps gliding during the swap — the preview does not reset.

Preload: on mount, instantiate `new Image()` for every `coverImage` so the swap is instant on first hover. With 5 projects this is trivial.

### 5.4 Row dim behavior

When `hoveredIdx !== null`, every row except the hovered one transitions its `opacity` to `0.35` over ~200ms. The hovered row stays at `opacity: 1`. On `mouseleave` of the list, all rows return to `opacity: 1`.

No other layout-affecting transforms — no scale, no translate, no font-weight change. Only opacity moves on the rows; only the preview element moves spatially.

## 6. Page intro & reveals

### 6.1 Title letter-mask reveal

On mount, each character of `Works` reveals via a vertical mask:

- Each letter wrapped in a `<span>` with `overflow: hidden` and `display: inline-block`.
- An inner `<span>` for the glyph itself starts at `transform: translateY(100%)` and animates to `translateY(0)`.
- Per-letter stagger: 30ms.
- Duration: 600ms per letter.
- Easing: `cubic-bezier(0.65, 0, 0.35, 1)` (the site's standard).

This is sibling vocabulary to the `View all works ↗` letter-wave on `SelectedWork.jsx` (which is hover-driven, top-half-up + bottom-half-up). The /works title is mount-driven and single-direction (bottom-up only). The shared vocabulary makes the home → /works transition feel like the same word's motion settling on the new page.

### 6.2 Row reveals

Row reveals start at ~`600ms` after mount (after the title's last letter has begun its rise), so the title is mostly settled before the rows begin. Each row reveals in sequence:

1. The hairline border-top grows left-to-right (`scaleX: 0 → 1`, `transform-origin: left`, ~400ms, same easing).
2. As the hairline finishes, the row's content (index, name, year/services) fades up: `opacity 0 → 1` + `translateY(20px → 0)` over ~500ms.

Per-row stagger: ~80ms after the previous row. With 5 rows the entire reveal is well under 2 seconds.

Implementation uses the existing `revealVariant` and `staggerContainer` helpers from `src/utils/motion.js` (already used in `AllWorks.jsx` today). The hairline grow is a small additional variant — either an inline `motion.div` with `scaleX` keyframes, or a tiny new variant added to `motion.js`. Pick the path with less surface area; lean toward inline since it's used in one place.

### 6.3 No scrolljacking

The page reads top-to-bottom at native scroll speed (Lenis smooth scroll, but no pinning, no scrubs). Motion lives in: title reveal, row reveals, cursor preview, row dim. That is the complete motion budget.

## 7. Reduced-motion fallback (`prefers-reduced-motion: reduce`)

- Title letters appear in their final position with no slide-up — a single `opacity 0 → 1` fade over ~200ms instead.
- Row reveals: opacity fade only (no translate-y, no hairline grow — hairline appears at full width).
- Cursor preview is disabled entirely. Replaced by an inline thumbnail behavior: hovering a row reveals a small landscape thumb (`clamp(200px, 18vw, 280px)`, `aspect-ratio: 16 / 10`) positioned at the right side of the row content (between the name and the year/services meta), with a simple `opacity 0 → 1` transition (~180ms). No `requestAnimationFrame`, no `mousemove` tracking.
- Row dim still applies (it's opacity-only, harmless under reduced motion).

The reduced-motion path is functionally equivalent — you can still see every project's cover image by hovering — just without the motion.

## 8. Accessibility

- Each row is a single `<Link>` with `aria-label="Open {name}, {year}"`.
- Numeric index (`01`) marked `aria-hidden="true"`.
- The list uses `<ul role="list">` (Tailwind's reset removes the implicit role, so we add it back explicitly).
- Focus state: the row's `border-top` hairline thickens to 2px and changes to `bg-ink` (from 1px `bg-edge`); the name color becomes `text-ink` (it's already `text-ink` at base, so this is a no-op there — but the border is the focus indicator).
- Color is never the only signal — the border thickness change carries the focus state.
- Cursor preview never blocks interaction (`pointer-events: none`) and is decorative — not announced.

## 9. Cohesion tweaks to home (`SelectedWork.jsx`)

Two lexical changes — no layout or motion edits.

1. **Tile `data-cursor`:** change from `"check out my work"` to `"open project"`. Aligns with the per-row cursor on /works. One verb across both pages.
2. **`View all works` `data-cursor`:** add `data-cursor="open the index"`. The transition home → /works reads as `open the index` → big `Works` title settles on screen — verbal continuity with the visual continuity.

The horizontal pinned carousel, the hover preview clip-path, the progress bar, and the section heading are all unchanged.

## 10. Component & file changes

### `src/components/AllWorks.jsx` — substantial rewrite

The current file (180 lines) becomes a smaller, more focused component:

- Drop the `<ul>` of alternating-side `<motion.li>` rows.
- Add: `hoveredIdx` state, preview element, mouse listener `useEffect`, rAF loop `useEffect`, image preload `useEffect`.
- Render: display title block (with letter-mask reveal), the `<ul>` of typographic rows, the `<Contact />` footer, and the floating preview element (one per page).

If the file approaches ~250 lines, factor the floating preview into a small sibling component `WorksCursorPreview.jsx` in the same directory. Hold off on factoring until the rewrite is sitting in front of you and you can judge whether it earns its own file.

### `src/components/SelectedWork.jsx` — minimal edits

- Tile `<Link>` `data-cursor` value change (1 line).
- "View all works" `<Link>` adds `data-cursor="open the index"` (1 attribute).

### `src/utils/motion.js` — possibly one new variant

If the hairline-grow reveal becomes ugly inline, factor it into a small `lineGrowVariant`. Otherwise leave `motion.js` alone.

### No changes expected to:
- `src/constants/index.js` — `projects[]` schema is already sufficient (`slug`, `name`, `year`, `services`, `coverImage`).
- `src/App.jsx`, routing, the navbar.
- `ProjectDetail.jsx`.
- Tailwind config, design tokens.
- The cursor system (`CustomCursor.jsx`) — `data-cursor` text label continues to work independently of the image preview.

## 11. Testing checklist

Manual verification, in this order:

1. **Page renders without console errors** on first navigation to `/works` (cold) and on hot-reload.
2. **Title reveal** plays once on mount; doesn't replay on tab refocus.
3. **Row hover (desktop)** — preview appears, glides smoothly, swaps between rows with crossfade; other rows dim; no layout shift; cursor label shows "open project".
4. **Cursor preview stays inside viewport** when the mouse approaches edges.
5. **Click a row** — navigates to `/works/{slug}`. `ScrollOnRouteChange` resets to top of project detail.
6. **Back to /works** — title reveal does not replay on back navigation (page is remounted, so it will replay — confirm that's acceptable; if not, gate with a session flag).
7. **Mobile (< 768px)** — rows stack vertically, each shows its thumbnail, taps navigate; no preview element renders.
8. **Reduced motion** (DevTools → emulate `prefers-reduced-motion: reduce`) — no slide-ups, inline thumb on row hover, no rAF loop running.
9. **Keyboard** — Tab moves through rows in order; focus indicator visible (thick `bg-ink` border-top); Enter navigates.
10. **Screen reader** — each row announces as a link with the `aria-label`; indices are not announced.
11. **`npm run lint`** passes with `--max-warnings 0`.
12. **`npm run build`** completes without errors.

## 12. Open follow-ups (deferred)

- If the page needs a stronger "issue feel" later, a future iteration can add a single mono closer line (`End of index — 05 / 05`) below the list. Skipped now per the no-small-headers direction.
- If `projects[]` grows past ~8 entries, the typographic-index pattern still works but the page becomes tall; revisit with a vertical-scroll-reveal pattern at that point.
- If the row dim under hover feels too aggressive at 0.35, tune in implementation (range 0.3–0.5).

---

**Approval:** design walked through section by section in conversation 2026-05-21; user approved each section and authorized writing the spec.

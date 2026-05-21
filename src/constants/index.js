import {
  SiReact,
  SiTypescript,
  SiFramer,
  SiTailwindcss,
  SiVite,
  SiSupabase,
  SiVercel,
  SiFigma,
} from "react-icons/si";
import { NextjsWordmark, GsapWordmark } from "../components/icons/TechLogos";

// Nav links. Three kinds the navbar knows how to handle:
//
//   "anchor"     — always smooth-scroll to `#id` on the CURRENT page.
//                  Used by `contact` because the Contact component is
//                  rendered at the bottom of every route, so the anchor
//                  always exists.
//
//   "hybrid"     — on the home route, smooth-scroll to `#id`. On any
//                  other route, navigate to `to`. Used by `work`: home
//                  visitors land on the featured-work section, anyone
//                  off-home lands on the full /works index.
//
//   "navAnchor"  — always lands on home's `#id` section. On home, just
//                  scrolls. On any other route, navigates to "/" with a
//                  `scrollTo` state, and Home reads it to scroll the
//                  section into view. If `triggersPreloader: true`, the
//                  navbar also asks App to replay the preloader so the
//                  navigation feels like a fresh page load.
export const navLinks = [
  {
    kind: "navAnchor",
    id: "experience",
    title: "experience",
    triggersPreloader: true,
  },
  { kind: "route", to: "/works", title: "works" },
  { kind: "anchor", id: "contact", title: "contact" },
];

// Tech stack rendered by <Tech /> as a bento-style grid (Zubiate / itsjay.us style):
// top row = 3 primary tools rendered in larger cells, bottom row = 7 supporting
// tools in smaller cells. `primary: true` opts an entry into the top row.
// Mirrors the itsjay.us stack 1:1 — same brands, same monochrome Simple Icons logos.
// `wordmark: true` entries are wide logotype SVGs (Next.js / GSAP). Tech.jsx
// reads the flag and sizes those cells with `h-X w-auto` instead of the
// square `h-X w-X` it applies to the brand-mark icons.
const technologies = [
  { name: "React",       Icon: SiReact,         primary: true,                  url: "https://react.dev/" },
  { name: "Next.js",     Icon: NextjsWordmark,  primary: true, wordmark: true,  url: "https://nextjs.org/" },
  { name: "TypeScript",  Icon: SiTypescript,    primary: true,                  url: "https://www.typescriptlang.org/" },
  { name: "GSAP",        Icon: GsapWordmark,                   wordmark: true,  url: "https://gsap.com/" },
  { name: "Motion",      Icon: SiFramer,                                        url: "https://motion.dev/" },
  { name: "Tailwind",    Icon: SiTailwindcss,                                   url: "https://tailwindcss.com/" },
  { name: "Vite",        Icon: SiVite,                                          url: "https://vitejs.dev/" },
  { name: "Supabase",    Icon: SiSupabase,                                      url: "https://supabase.com/" },
  { name: "Vercel",      Icon: SiVercel,                                        url: "https://vercel.com/" },
  { name: "Figma",       Icon: SiFigma,                                         url: "https://www.figma.com/" },
];

const experiences = [
  {
    title: "Freelance Web Developer",
    company_name: "UI / UX clients",
    date: "Jun 2019 — Jan 2020",
    description:
      "Built and maintained React-based marketing sites and small web apps for design-led clients. Owned the engineering side end-to-end — scoping, implementation, browser QA, and handoff.",
  },
  {
    title: "Software Engineer Intern",
    company_name: "Fannie Mae",
    date: "Jun 2021 — Aug 2021",
    description:
      "Shipped internal React components on a financial-services platform team. Pair-programmed with senior engineers and presented final work to the broader org.",
  },
  {
    title: "Full Stack Developer",
    company_name: "Fannie Mae",
    date: "Jul 2023 — Aug 2025",
    description:
      "Owned frontend and full-stack work on data-heavy compliance dashboards. Day-to-day: React, TypeScript, Node, and shipping features that go through change-management review.",
  },
  {
    title: "Software Engineer",
    company_name: "CareFirst BlueCross BlueShield",
    date: "Dec 2025 — Present",
    description:
      "Placeholder — describe scope, stack, and notable shipped work here. Likely React/TypeScript on healthcare-platform engineering; replace with the real one-paragraph summary when ready.",
  },
];

// Placeholder cover screenshots in /public/work/. Five awwwards-style site
// screenshots used as stand-ins until real project covers replace them.
// To swap one out, drop a new file at the same path (or change the path
// here) — Tech.jsx and SelectedWork.jsx both consume `coverImage` directly.
// Each project carries enough metadata to drive both the Selected Work
// carousel tile and the per-project detail page at /works/:slug.
//   slug         — kebab-case identifier; the URL segment for the detail page
//   year         — display year shown in the detail-page metadata grid
//   services     — short list of disciplines, rendered as a `/`-separated
//                  string under the Services label on the detail page
//   description  — single paragraph; shown both on the tile hover card and
//                  in the long-form body on the detail page
//   techStack    — tag list shown on the tile hover card
//   coverImage   — desktop screenshot used for the tile background AND
//                  the desktop hero image on the detail page
//   mobileImages — paths for the two phone-frame screenshots rendered
//                  side-by-side on the detail page. Empty array → the
//                  detail page renders labeled placeholder boxes instead.
//   liveUrl      — external link surfaced by the detail page's "Live
//                  Website ↗" CTA (null hides the button)
//   sourceUrl    — same idea for the "View Source ↗" CTA
const projects = [
  {
    slug: "compliance-dashboard",
    name: "Compliance",
    year: "2024",
    services: ["Web Development", "Data Visualization"],
    description:
      "Internal financial-services dashboard for change-management review. React + TypeScript on a backend team's data feed.",
    techStack: ["React", "TypeScript", "Node", "PostgreSQL"],
    coverImage: "/work/compliance-dashboard.jpg",
    mobileImages: [],
    liveUrl: null,
    sourceUrl: null,
  },
  {
    slug: "portfolio-v2",
    name: "Portfolio v2",
    year: "2026",
    services: ["Web Design", "Web Development", "Motion"],
    description:
      "This site. Typographic redesign with GSAP pinned scroll, Lenis smooth-scroll, Framer Motion reveals, and a custom theme system.",
    techStack: ["React", "Vite", "GSAP", "Lenis", "Tailwind"],
    coverImage: "/work/portfolio-v2.jpg",
    mobileImages: [],
    liveUrl: "https://adnaandasoo.com",
    sourceUrl: "https://github.com/adnaandasoo4/portfolio",
  },
  {
    slug: "design-system-explorer",
    name: "Design System",
    year: "2025",
    services: ["Web Development", "Tooling"],
    description:
      "Browser-based playground for a component library — live token previews, prop controls, and copyable usage snippets.",
    techStack: ["React", "TypeScript", "Tailwind", "MDX"],
    coverImage: "/work/design-system-explorer.jpg",
    mobileImages: [],
    liveUrl: null,
    sourceUrl: null,
  },
  {
    slug: "motion-library",
    name: "Motion Library",
    year: "2025",
    services: ["Web Development", "Motion"],
    description:
      "Reusable React hooks + components for scroll-driven and gesture-driven UI. Designed for production performance at 60fps.",
    techStack: ["React", "GSAP", "Motion", "TypeScript"],
    coverImage: "/work/motion-library.jpg",
    mobileImages: [],
    liveUrl: null,
    sourceUrl: null,
  },
  {
    slug: "realtime-editor",
    name: "Realtime Editor",
    year: "2024",
    services: ["Web Development", "Realtime Systems"],
    description:
      "Collaborative document editor with CRDT-based operational transforms and WebRTC peer sync. Sub-50ms cursor latency across regions.",
    techStack: ["React", "TypeScript", "WebRTC", "Y.js"],
    coverImage: "/work/realtime-editor.jpg",
    mobileImages: [],
    liveUrl: null,
    sourceUrl: null,
  },
];

export { technologies, experiences, projects };

// ----------------------------------------------------------------------------
// New exports introduced by Phase 0 of the v2 redesign.
// These are consumed by section components that get rewritten in Phase 1+.
// Placeholder content is in place; real content lands during each phase's
// content gate (see docs/superpowers/specs/2026-05-12-portfolio-redesign-design.md §5).
// ----------------------------------------------------------------------------

// Buzzword reel rendered by BuzzwordMarquee between the Experience and Tech
// sections. Mix of tech, craft, and product-thinking terms. The marquee
// duplicates this list once internally for seamless looping, so this is the
// single source.
export const buzzwords = [
  "Motion",
  "Scroll-driven UI",
  "WebGL",
  "Design systems",
  "Frontend craft",
  "TypeScript",
  "Performance",
  "Accessibility",
  "Creative dev",
  "Micro-interactions",
  "0→1 product work",
  "Systems thinking",
  "Animation polish",
  "Component architecture",
];

export const socials = [
  { name: "Email", url: "mailto:adnaandasoo@gmail.com" },
  { name: "GitHub", url: "https://github.com/adnaandasoo4" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/adnaan-dasoo/" },
  { name: "Instagram", url: "https://www.instagram.com/adnaan.dasoo/" },
];

export const hero = {
  // Big WebGL display word at the bottom of the section.
  name: "ADNAAN",
  // Two-line mono kicker rendered top-right at the same scale as the
  // SUERO reference's "DIGITAL DESIGN STUDIO / WEBFLOW PREMIUM PARTNER".
  kicker: ["Software Engineer", "Creative Developer"],
  // Vertical label under the animated scroll-stream indicator.
  scrollPrompt: "Scroll",
  // Top-left live clock. `timeZone` is an IANA zone passed to
  // Intl.DateTimeFormat so the displayed time always reflects the author's
  // local time regardless of the visitor's locale.
  locale: {
    label: "Baltimore — Local",
    timeZone: "America/New_York",
  },
};

// Temporary experiment flag — when true, every section's small mono
// "01 — Section" label is suppressed so the page can be evaluated without
// section headers. Flip to false to restore the labels in one place.
export const HIDE_SECTION_LABELS = true;

// Process section — five stages of the design process rendered as large
// stacked display rows on the right and a content slot on the left that
// fills with the hovered stage's description + framed identity card.
// Inspired by the ethansuero.com client-list set piece, repurposed for a
// design-process narrative. The framed card shows the stage number in
// Clash Display with the stage name and tool stack beneath.
export const designProcess = {
  label: "02 — Process",
  stages: [
    {
      number: "01",
      name: "Discovery",
      description:
        "First conversation. Understand the brand, audience, constraints, and what 'great' looks like. The goal at this stage is alignment, not solutions.",
      tools: ["Notion", "Loom", "Figjam"],
    },
    {
      number: "02",
      name: "Strategy",
      description:
        "Define the shape of the project. Sitemap, content priorities, success criteria. Decide what the work needs to do before we worry about what it looks like.",
      tools: ["Figjam", "Whimsical", "Notion"],
    },
    {
      number: "03",
      name: "Design",
      description:
        "Sketch, type system, color, motion language. Iterate fast in low fidelity, then commit to high fidelity once the system is settled.",
      tools: ["Figma", "Cabinet Grotesk", "After Effects"],
    },
    {
      number: "04",
      name: "Development",
      description:
        "Build the design into production code. Reusable components, motion that respects performance, accessibility on by default.",
      tools: ["React", "Vite", "Tailwind", "Framer Motion"],
    },
    {
      number: "05",
      name: "Launch",
      description:
        "Ship, measure, and hand over. Deploy with monitoring in place, write the docs, make sure the team can keep moving.",
      tools: ["Vercel", "GitHub Actions", "Plausible"],
    },
  ],
};

export const footer = {
  // Small mono label rendered above the display CTA.
  kicker: "Get in touch",
  // CTA renders on two lines. `headlineLead` (line 1) is static; on link hover
  // `headlineHighlight` (line 2) turns the accent color and its trailing arrow
  // nudges up-right. Its last word stays on the same line as the arrow via
  // whitespace-nowrap in the component.
  headlineLead: "Got an idea?",
  headlineHighlight: "Let's build it",
  email: "adnaandasoo@gmail.com",
  location: "Baltimore · GMT-5",
  copyright: "© 2026 Adnaan Dasoo · Software Engineer",
};

export const manifesto = {
  // Small uppercase mono label rendered above the intro. The em-dash is U+2014.
  label: "01 — About",
  // Intro is an array of segments rather than a single string so individual
  // keywords can carry their own color. Segments with `highlight: true` render
  // in slate-gray; the rest inherit the paragraph's ink color.
  intro: [
    { text: "I build interactive experiences that feel " },
    { text: "intentional", highlight: true },
    { text: ". Every hover, scroll, and transition earns its keep. Playful motion? " },
    { text: "Obsessed", highlight: true },
    { text: ". Performance? Non-negotiable. The tiny details nobody asked for? Those are the best part." },
  ],
};

export const experience = {
  // Small uppercase mono label. Order matches the nav bar:
  // 01 Manifesto, 02 Experience, 03 Tech, 04 Selected Work.
  label: "02 — Experience",
  // Big display heading rendered in Clash Display above the experience accordion.
  // Independent of HIDE_SECTION_LABELS — matches the Tech and Selected Work
  // headings for consistent section-top treatment.
  heading: "Experience",
};

export const tech = {
  // Small uppercase mono label. Order matches the nav bar:
  // 01 Manifesto, 02 Experience, 03 Tech, 04 Selected Work.
  label: "03 — Stack",
  // Big display heading rendered in Clash Display above the bento grid. Independent
  // of HIDE_SECTION_LABELS — section numbers come and go; this stays.
  heading: "Tech Stack",
};

export const selectedWork = {
  // Small uppercase mono label rendered on the left of the section header.
  label: "04 — Featured Work",
  // Big display heading rendered in Clash Display above the horizontal carousel.
  // Independent of HIDE_SECTION_LABELS.
  heading: "Selected Work",
};

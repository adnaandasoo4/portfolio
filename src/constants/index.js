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

// Nav anchors. `id` is the in-page anchor (must match the SectionWrapper id
// for that component); `title` is the label rendered in the Navbar + footer.
// The label/anchor mismatch on "work" is intentional: the Experience component
// historically registered itself at #work, while the user-facing nav reserves
// the "work" label for the Selected Work / projects section.
export const navLinks = [
  { id: "work",     title: "experience" }, // → Experience section
  { id: "projects", title: "work" },        // → Selected Work section
  { id: "contact",  title: "contact" },     // → Footer
];

// Tech stack rendered by <Tech /> as a bento-style grid (Zubiate / itsjay.us style):
// top row = 3 primary tools rendered in larger cells, bottom row = 7 supporting
// tools in smaller cells. `primary: true` opts an entry into the top row.
// Mirrors the itsjay.us stack 1:1 — same brands, same monochrome Simple Icons logos.
// `wordmark: true` entries are wide logotype SVGs (Next.js / GSAP). Tech.jsx
// reads the flag and sizes those cells with `h-X w-auto` instead of the
// square `h-X w-X` it applies to the brand-mark icons.
const technologies = [
  { name: "React",       Icon: SiReact,         primary: true },
  { name: "Next.js",     Icon: NextjsWordmark,  primary: true, wordmark: true },
  { name: "TypeScript",  Icon: SiTypescript,    primary: true },
  { name: "GSAP",        Icon: GsapWordmark,    wordmark: true },
  { name: "Motion",      Icon: SiFramer },
  { name: "Tailwind",    Icon: SiTailwindcss },
  { name: "Vite",        Icon: SiVite },
  { name: "Supabase",    Icon: SiSupabase },
  { name: "Vercel",      Icon: SiVercel },
  { name: "Figma",       Icon: SiFigma },
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
const projects = [
  {
    name: "Compliance Dashboard",
    description:
      "Internal financial-services dashboard for change-management review. React + TypeScript on a backend team's data feed.",
    techStack: ["React", "TypeScript", "Node", "PostgreSQL"],
    coverImage: "/work/compliance-dashboard.png",
    liveUrl: null,
    sourceUrl: null,
  },
  {
    name: "Portfolio v2",
    description:
      "This site. Typographic redesign with GSAP pinned scroll, Lenis smooth-scroll, Framer Motion reveals, and a custom theme system.",
    techStack: ["React", "Vite", "GSAP", "Lenis", "Tailwind"],
    coverImage: "/work/portfolio-v2.png",
    liveUrl: "https://github.com/adnaandasoo4/portfolio",
    sourceUrl: "https://github.com/adnaandasoo4/portfolio",
  },
  {
    name: "Design System Explorer",
    description:
      "Browser-based playground for a component library — live token previews, prop controls, and copyable usage snippets.",
    techStack: ["React", "TypeScript", "Tailwind", "MDX"],
    coverImage: "/work/design-system-explorer.png",
    liveUrl: null,
    sourceUrl: null,
  },
  {
    name: "Motion Library",
    description:
      "Reusable React hooks + components for scroll-driven and gesture-driven UI. Designed for production performance at 60fps.",
    techStack: ["React", "GSAP", "Motion", "TypeScript"],
    coverImage: "/work/motion-library.png",
    liveUrl: null,
    sourceUrl: null,
  },
  {
    name: "Realtime Editor",
    description:
      "Collaborative document editor with CRDT-based operational transforms and WebRTC peer sync. Sub-50ms cursor latency across regions.",
    techStack: ["React", "TypeScript", "WebRTC", "Y.js"],
    coverImage: "/work/realtime-editor.png",
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

export const manifestoBullets = [
  "Motion",
  "Scroll-driven UI",
  "WebGL",
  "Design systems",
];

export const socials = [
  { name: "Email", url: "mailto:adnaandasoo@gmail.com" },
  { name: "GitHub", url: "https://github.com/adnaandasoo4" },
];

export const now = {
  label: "Now",
  body: "Currently building portfolio.v2 — shipping motion-led case studies for selected work.",
};

export const hero = {
  // Target string for HeroDecoder. \n is treated as a line break.
  name: "ADNAAN\nDASOO",
  subtitle: "Frontend · Creative Developer",
  location: "Atlanta · GMT-5",
  availability: "Available for work",
};

export const footer = {
  // The CTA renders as two phrases. `headlineLead` is the first part, no hover
  // effect. `headlineHighlight` turns the accent color on link hover, and its
  // last word stays on the same line as the trailing arrow (whitespace-nowrap
  // in the component).
  headlineLead: "Say hi!",
  headlineHighlight: "Let's talk",
  email: "adnaandasoo@gmail.com",
  location: "Atlanta · GMT-5",
  copyright: "© 2026 Adnaan Dasoo · Frontend Developer",
  // Giant wordmark anchored to the bottom of the footer. Rendered twice — a
  // muted "ghost" copy offset upward behind a solid copy — for the double-shadow
  // effect inspired by ethansuero.com.
  wordmark: "ADNAAN DASOO",
};

export const manifesto = {
  // Small uppercase mono label rendered above the intro. The em-dash is U+2014.
  label: "01 — Index",
  // Two-sentence intro, rendered at display weight. Edit anytime — components
  // re-render automatically. Keep under ~60ch for line-length comfort.
  intro:
    "Frontend engineer focused on motion, scroll-driven interfaces, and craft-level UI. I care about how software feels — restraint, rhythm, and the moments that surprise.",
};

export const experience = {
  // Small uppercase mono label. Order matches the nav bar:
  // 01 Manifesto, 02 Experience, 03 Tech, 04 Selected Work.
  label: "02 — Experience",
};

export const tech = {
  // Small uppercase mono label. Order matches the nav bar:
  // 01 Manifesto, 02 Experience, 03 Tech, 04 Selected Work.
  label: "03 — Stack",
};

export const selectedWork = {
  // Small uppercase mono label rendered on the left of the section header.
  // The big centered title is hardcoded as "Featured Work" in SelectedWork.jsx.
  label: "04 — Featured Work",
};

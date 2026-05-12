import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiNodedotjs,
  SiMongodb,
  SiThreedotjs,
  SiGit,
  SiFigma,
  SiDocker,
} from "react-icons/si";

export const navLinks = [
  {
    id: "about",
    title: "about",
  },
  {
    id: "work",
    title: "experience",
  },
  {
    id: "projects",
    title: "projects",
  },
];

const technologies = [
  { name: "HTML 5", Icon: SiHtml5 },
  { name: "CSS 3", Icon: SiCss },
  { name: "JavaScript", Icon: SiJavascript },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "React JS", Icon: SiReact },
  { name: "Redux Toolkit", Icon: SiRedux },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "Node JS", Icon: SiNodedotjs },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "Three JS", Icon: SiThreedotjs },
  { name: "Git", Icon: SiGit },
  { name: "Figma", Icon: SiFigma },
  { name: "Docker", Icon: SiDocker },
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
    date: "Jul 2023 — Present",
    description:
      "Owning frontend and full-stack work on data-heavy compliance dashboards. Day-to-day: React, TypeScript, Node, and shipping features that go through change-management review.",
  },
];

const projects = [
  {
    name: "Compliance Dashboard",
    description:
      "Internal financial-services dashboard for change-management review. React + TypeScript on a backend team's data feed.",
    techStack: ["React", "TypeScript", "Node", "PostgreSQL"],
    coverImage: null,
    liveUrl: null,
    sourceUrl: null,
  },
  {
    name: "Portfolio v2",
    description:
      "This site. Typographic redesign with GSAP pinned scroll, Lenis smooth-scroll, Framer Motion reveals, and a custom theme system.",
    techStack: ["React", "Vite", "GSAP", "Lenis", "Tailwind"],
    coverImage: null,
    liveUrl: "https://github.com/adnaandasoo4/portfolio",
    sourceUrl: "https://github.com/adnaandasoo4/portfolio",
  },
  {
    name: "Design System Explorer",
    description:
      "Browser-based playground for a component library — live token previews, prop controls, and copyable usage snippets.",
    techStack: ["React", "TypeScript", "Tailwind", "MDX"],
    coverImage: null,
    liveUrl: null,
    sourceUrl: null,
  },
  {
    name: "Motion Library",
    description:
      "Reusable React hooks + components for scroll-driven and gesture-driven UI. Designed for production performance at 60fps.",
    techStack: ["React", "GSAP", "Motion", "TypeScript"],
    coverImage: null,
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

export const personalityPills = [
  "GSAP",
  "React",
  "WebGL",
  "Design Engineering",
  "Good vibes",
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
  // The arrow ↗ is appended by the JSX, don't include it in the string.
  headline: "Say hi! Let's talk",
  email: "adnaandasoo@gmail.com",
  location: "Atlanta · GMT-5",
  copyright: "© 2026 Adnaan Dasoo · Frontend Developer",
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
  // Small uppercase mono label rendered above the slide track. Order matches
  // the nav bar: 01 Manifesto, 02 Experience, 03 Tech, 04 Selected Work.
  label: "04 — Selected Work",
};

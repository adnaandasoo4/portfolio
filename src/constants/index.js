import {
  mobile,
  backend,
  creator,
  web,
  meta,
  starbucks,
  tesla,
  carrent,
  jobit,
  tripguide,
} from "../assets";

import {
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiNodedotjs,
  SiMongodb,
  SiThreejs,
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

const services = [
  {
    title: "Fullstack Developer",
    icon: web,
  },
  {
    title: "Web Developer",
    icon: mobile,
  },
  {
    title: "React Developer",
    icon: backend,
  },
  {
    title: "UI / UX Enthusiast",
    icon: creator,
  },
];

const technologies = [
  { name: "HTML 5", Icon: SiHtml5 },
  { name: "CSS 3", Icon: SiCss3 },
  { name: "JavaScript", Icon: SiJavascript },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "React JS", Icon: SiReact },
  { name: "Redux Toolkit", Icon: SiRedux },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "Node JS", Icon: SiNodedotjs },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "Three JS", Icon: SiThreejs },
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
    name: "Car Rent",
    description:
      "Web-based platform that allows users to search, book, and manage car rentals from various providers, providing a convenient and efficient solution for transportation needs.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "mongodb",
        color: "green-text-gradient",
      },
      {
        name: "tailwind",
        color: "pink-text-gradient",
      },
    ],
    image: carrent,
    source_code_link: "https://github.com/",
  },
  {
    name: "Job IT",
    description:
      "Web application that enables users to search for job openings, view estimated salary ranges for positions, and locate available jobs based on their current location.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "restapi",
        color: "green-text-gradient",
      },
      {
        name: "scss",
        color: "pink-text-gradient",
      },
    ],
    image: jobit,
    source_code_link: "https://github.com/",
  },
  {
    name: "Trip Guide",
    description:
      "A comprehensive travel booking platform that allows users to book flights, hotels, and rental cars, and offers curated recommendations for popular destinations.",
    tags: [
      {
        name: "nextjs",
        color: "blue-text-gradient",
      },
      {
        name: "supabase",
        color: "green-text-gradient",
      },
      {
        name: "css",
        color: "pink-text-gradient",
      },
    ],
    image: tripguide,
    source_code_link: "https://github.com/",
  },
];

export { services, technologies, experiences, projects };

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
  // Small uppercase mono label rendered above the role list. Numbering follows
  // the spec — Manifesto is 01, Selected Work (Phase 5) is 02, Experience is 03,
  // Tech (Phase 4) is 04. The "02" gap is intentional mid-transition.
  label: "03 — Experience",
};

export const tech = {
  // Small uppercase mono label for the section header. Section number follows
  // the spec — Hero (no label), Manifesto 01, Selected Work 02 (Phase 5),
  // Experience 03, Tech 04.
  label: "04 — Stack",
};

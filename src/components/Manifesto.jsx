import { motion } from "framer-motion";
import { manifesto, manifestoBullets } from "../constants";
import { SectionWrapper } from "../hoc";
import { revealVariant as reveal } from "../utils/motion";

function Manifesto() {
  return (
    <div className="flex flex-col gap-10 py-24">
      {/* Section number + label */}
      <motion.span
        variants={reveal}
        custom={0}
        className="font-mono text-[10px] uppercase tracking-widest text-muted"
      >
        {manifesto.label}
      </motion.span>

      {/* Intro paragraph in display weight */}
      <motion.p
        variants={reveal}
        custom={0.1}
        className="text-ink"
        style={{
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 56px)",
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          maxWidth: "60ch",
        }}
      >
        {manifesto.intro}
      </motion.p>

      {/* Skill / value pills */}
      <motion.ul
        variants={reveal}
        custom={0.25}
        className="flex flex-wrap gap-2"
      >
        {manifestoBullets.map((bullet, i) => (
          <motion.li
            key={bullet}
            variants={reveal}
            custom={0.3 + i * 0.05}
            className="rounded-full border border-edge px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
          >
            {bullet}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default SectionWrapper(Manifesto, "about");

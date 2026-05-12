import { motion } from "framer-motion";
import { tech, technologies } from "../constants";
import { SectionWrapper } from "../hoc";
import { revealVariant as reveal } from "../utils/motion";

function Tech() {
  return (
    <div className="flex flex-col gap-10 py-24">
      <motion.span
        variants={reveal}
        custom={0}
        className="font-mono text-[10px] uppercase tracking-widest text-muted"
      >
        {tech.label}
      </motion.span>

      {/*
        Grid lines trick: the <ul> has bg-edge and gap-px. Each cell has bg-paper.
        The 1px gaps reveal the tinted bg-edge underneath, producing dividing lines
        between cells that flip color with the theme. An outer 1px border closes
        the rectangle.
      */}
      <motion.ul
        variants={reveal}
        custom={0.1}
        className="grid grid-cols-2 gap-px border border-edge bg-edge sm:grid-cols-3 md:grid-cols-4"
      >
        {technologies.map(({ name, Icon }, i) => (
          <motion.li
            key={name}
            variants={reveal}
            custom={0.15 + i * 0.03}
            className="flex aspect-square flex-col items-center justify-center gap-3 bg-paper p-4 text-ink"
          >
            <Icon className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true" />
            <span className="text-center font-mono text-[9px] uppercase tracking-widest text-muted">
              {name}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default SectionWrapper(Tech, "tech");

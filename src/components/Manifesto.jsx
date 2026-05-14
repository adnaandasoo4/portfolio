import { motion } from "framer-motion";
import { manifesto } from "../constants";
import { SectionWrapper } from "../hoc";
import { revealVariant as reveal } from "../utils/motion";

function Manifesto() {
  return (
    <div className="flex flex-col gap-10 py-24">
      <motion.span
        variants={reveal}
        custom={0}
        className="font-mono text-xs uppercase tracking-widest text-muted"
      >
        {manifesto.label}
      </motion.span>

      {/* Intro paragraph in display weight. Iterates segments so the
          highlight keywords (intentional / obsessed) render in slate-gray
          against the ink paragraph. */}
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
        {manifesto.intro.map((seg, i) => (
          <span
            key={i}
            className={seg.highlight ? "text-slate-500" : undefined}
          >
            {seg.text}
          </span>
        ))}
      </motion.p>
    </div>
  );
}

const ManifestoSection = SectionWrapper(Manifesto, "about");
export default ManifestoSection;

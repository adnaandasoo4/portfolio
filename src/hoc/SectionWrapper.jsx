import { motion } from "framer-motion";

import { staggerContainer } from "../utils/motion";

/**
 * Wraps a section component with the shared motion + padding shell.
 *
 * @param {React.ComponentType} Component
 * @param {string} idName - anchor id for in-page navigation
 * @param {object} [options]
 * @param {boolean} [options.scrollTriggered=false] - When true, this section opts out
 *   of Framer Motion reveal variants because the inner component drives its own
 *   GSAP ScrollTrigger animations (used by SelectedWork). The outer <section> is
 *   still rendered, just without the FM viewport reveal.
 * @param {boolean} [options.fullBleed=false] - When true, drops `max-w-7xl mx-auto`
 *   and the shared horizontal/vertical padding so the section can span the full
 *   viewport. Used by SelectedWork whose slides are `w-screen` each.
 */
const SectionWrapper = (Component, idName, options) => {
  const { scrollTriggered = false, fullBleed = false } = options ?? {};

  return function HOC() {
    const motionProps = scrollTriggered
      ? {}
      : {
          variants: staggerContainer(),
          initial: "hidden",
          whileInView: "show",
          viewport: { once: true, amount: 0.25 },
        };

    const className = fullBleed
      ? "relative z-0"
      : "sm:px-16 px-6 sm:py-16 py-10 max-w-7xl mx-auto relative z-0";

    return (
      <motion.section {...motionProps} className={className}>
        <span className='hash-span' id={idName}>
          &nbsp;
        </span>

        <Component />
      </motion.section>
    );
  };
};

export default SectionWrapper;

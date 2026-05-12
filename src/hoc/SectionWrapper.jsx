import { motion } from "framer-motion";

import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

/**
 * Wraps a section component with the shared motion + padding shell.
 *
 * @param {React.ComponentType} Component
 * @param {string} idName - anchor id for in-page navigation
 * @param {object} [options]
 * @param {boolean} [options.scrollTriggered=false] - When true, this section opts out
 *   of Framer Motion reveal variants because the inner component drives its own
 *   GSAP ScrollTrigger animations (used by SelectedWork in a later phase). The
 *   outer <section> is still rendered, just without the FM viewport reveal.
 */
const SectionWrapper = (Component, idName, options) => {
  const { scrollTriggered = false } = options ?? {};

  return function HOC() {
    const motionProps = scrollTriggered
      ? {}
      : {
          variants: staggerContainer(),
          initial: "hidden",
          whileInView: "show",
          viewport: { once: true, amount: 0.25 },
        };

    return (
      <motion.section
        {...motionProps}
        className={`${styles.padding} max-w-7xl mx-auto relative z-0`}
      >
        <span className='hash-span' id={idName}>
          &nbsp;
        </span>

        <Component />
      </motion.section>
    );
  };
};

export default SectionWrapper;

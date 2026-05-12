export const staggerContainer = (staggerChildren, delayChildren) => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delayChildren || 0,
      },
    },
  };
};

// Shared reveal-on-scroll variant used by Manifesto, Experience, and future
// typographic sections. `custom` is interpreted as a delay (seconds), so each
// motion child can stagger itself without parent stagger config.
export const easeStandard = [0.65, 0, 0.35, 1];

export const revealVariant = {
  hidden: { opacity: 0, y: 12 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeStandard, delay },
  }),
};

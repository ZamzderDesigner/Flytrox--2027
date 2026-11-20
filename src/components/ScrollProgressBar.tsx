import { motion, useScroll, useSpring } from 'motion/react';

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 34,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-0 top-0 bottom-0 z-40 hidden w-1 bg-black/5 lg:block"
    >
      <motion.div
        className="h-full w-full origin-top bg-[#0E5A28]"
        style={{ scaleY: smoothProgress }}
      />
    </div>
  );
}

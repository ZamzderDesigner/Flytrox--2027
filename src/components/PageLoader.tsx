import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FlytroxLogo } from './FlytroxLogo';

interface PageLoaderProps {
  onComplete: () => void;
}

export function PageLoader({ onComplete }: PageLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return true;
  });

  useEffect(() => {
    if (!visible) {
      onComplete();
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 720;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setVisible(false);
          onComplete();
        }, 120);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="flytrox-preloader"
          initial={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0D1512] text-white"
          aria-label="Loading Flytrox Tours & Travels"
          role="status"
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-6"
          >
            <FlytroxLogo variant="light" size="lg" />
            {/* Vertical Top-to-Bottom Progress Line */}
            <div className="relative h-28 w-[3px] overflow-hidden rounded-full bg-white/15">
              <div
                className="absolute inset-x-0 top-0 origin-top bg-[#18863F] transition-transform duration-75"
                style={{
                  height: '100%',
                  transform: `scaleY(${progress / 100})`,
                }}
              />
            </div>
            <span className="font-mono text-xs tracking-widest text-emerald-300 tabular-nums">
              {progress}%
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

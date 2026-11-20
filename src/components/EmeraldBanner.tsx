import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface EmeraldBannerProps {
  eyebrow?: string;
  headline: string;
  ctaLabel: string;
  href?: string;
  onAction?: () => void;
}

export function EmeraldBanner({
  eyebrow,
  headline,
  ctaLabel,
  href,
  onAction,
}: EmeraldBannerProps) {
  const buttonClasses =
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-7 py-3 text-sm font-bold tracking-wide text-white transition-all duration-150 hover:bg-white hover:text-[#0E5A28] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  return (
    <section className="bg-[#0E5A28] py-12 sm:py-14 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8"
      >
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight uppercase text-white sm:text-3xl">
            {headline}
          </h2>
        </div>

        {href ? (
          <a href={href} className={buttonClasses}>
            <span>{ctaLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <button type="button" onClick={onAction} className={buttonClasses}>
            <span>{ctaLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </motion.div>
    </section>
  );
}

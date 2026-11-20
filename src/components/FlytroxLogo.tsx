interface FlytroxLogoProps {
  variant?: 'dark' | 'light';
  size?: 'default' | 'lg';
  className?: string;
}

const LOGO_SRC = '/assets/aistudio/Poly_Line_a30d16bc.jpg';

/**
 * Flytrox official geometric emblem paired with clean single-line wordmark.
 */
export function FlytroxLogo({
  variant = 'dark',
  size = 'default',
  className = '',
}: FlytroxLogoProps) {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#0D1512]';
  const boxSize = size === 'lg' ? 'h-12 w-12 rounded-xl' : 'h-9 w-9 rounded-lg';

  return (
    <span
      className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none ${className}`}
    >
      <span
        className={`relative inline-flex ${boxSize} shrink-0 items-center justify-center overflow-hidden ${
          isLight
            ? 'bg-white shadow-xs ring-1 ring-white/20'
            : 'bg-white'
        }`}
      >
        <img
          src={LOGO_SRC}
          alt="Flytrox logo"
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover origin-[58.5%_46.5%] scale-[2.85] -translate-x-[8.5%] translate-y-[3.5%] ${
            isLight ? '' : 'mix-blend-multiply'
          }`}
        />
      </span>
      <span
        className={`${
          size === 'lg' ? 'text-xl' : 'text-lg'
        } font-extrabold tracking-[0.06em] uppercase ${textColor}`}
      >
        FLYTROX
      </span>
    </span>
  );
}

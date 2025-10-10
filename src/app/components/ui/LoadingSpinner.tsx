import { useId } from "react";

type SpinnerVariant = 'primary' | 'secondary' | 'neutral' | 'danger' | 'success';
type SpinnerStyle = 'gradient' | 'dashed';
type LabelPosition = 'below' | 'sr-only';

type SpinnerProps = {
  size?: number;           // diameter px
  stroke?: number;         // stroke width
  className?: string;
  label?: string;          // accessible label text
  variant?: SpinnerVariant;
  withTrack?: boolean;     // show the faded background circle
  labelPosition?: LabelPosition;
  glass?: boolean;         // adds subtle glassy backdrop container
  speedMs?: number;        // custom spin speed (default 800ms)
  styleType?: SpinnerStyle;// visual style
};

// Color mapping for variants (fallback to primary)
const VARIANT_COLORS: Record<SpinnerVariant, { from: string; to: string }> = {
  primary: { from: '#0F67B1', to: '#53A0FD' },
  secondary: { from: '#6366F1', to: '#A855F7' },
  neutral: { from: '#6B7280', to: '#9CA3AF' },
  danger: { from: '#DC2626', to: '#F87171' },
  success: { from: '#059669', to: '#34D399' }
};

export function LoadingSpinner({
  size = 40,
  stroke = 4,
  className = "",
  label = "Memuat...",
  variant = 'primary',
  withTrack = true,
  labelPosition = 'sr-only',
  glass = false,
  speedMs = 800
  , styleType = 'gradient'
}: SpinnerProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = useId().replace(/:/g, '_') + '_grad';
  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.primary;

  // DASHED STYLE (simple CSS ring) ---------------------------------------
  if (styleType === 'dashed') {
    const colorMap: Record<SpinnerVariant, string> = {
      primary: 'border-[#0F67B1]',
      secondary: 'border-[#6366F1]',
      neutral: 'border-gray-500',
      danger: 'border-red-500',
      success: 'border-emerald-500'
    };
    const clr = colorMap[variant];
    return (
      <div
        className={`inline-flex flex-col items-center justify-center ${glass ? 'rounded-xl border border-white/20 bg-white/30 backdrop-blur px-4 py-3 shadow-sm dark:bg-gray-800/40 dark:border-gray-700/40' : ''} ${className}`}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div
          style={{ width: size, height: size, borderWidth: stroke }}
          className={`animate-spin rounded-full border-dashed ${clr} border-t-transparent`}
        />
        {labelPosition === 'below' ? (
          <span className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wide">{label}</span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </div>
    );
  }

  // GRADIENT STYLE (default) ---------------------------------------------
  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${glass ? 'rounded-xl border border-white/20 bg-white/30 backdrop-blur px-4 py-3 shadow-sm dark:bg-gray-800/40 dark:border-gray-700/40' : ''} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg
        style={{ animationDuration: `${speedMs}ms` }}
        className="animate-spin"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        {withTrack && (
          <circle
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-gray-200 dark:text-gray-700"
          />
        )}
        <circle
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          style={{
            transformOrigin: '50% 50%'
          }}
        />
      </svg>
      {labelPosition === 'below' ? (
        <span className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wide">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}

export function FullPageLoader({ label = "Memuat...", spinnerSize = 56, variant = 'primary', styleType = 'dashed', glass = false }: { label?: string; spinnerSize?: number; variant?: SpinnerVariant; styleType?: SpinnerStyle; glass?: boolean }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size={spinnerSize} label={label} variant={variant} labelPosition="below" glass={glass} styleType={styleType} />
    </div>
  );
}

// Overlay loader (full-screen) ---------------------------------------------
export function OverlayLoader({
  label = 'Memuat data...',
  variant = 'primary',
  spinnerSize = 56,
  backdrop = true,
  styleType = 'dashed'
}: { label?: string; variant?: SpinnerVariant; spinnerSize?: number; backdrop?: boolean; styleType?: SpinnerStyle }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${backdrop ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm' : ''}`} role="status" aria-label={label}>
      <LoadingSpinner
        size={spinnerSize}
        variant={variant}
        label={label}
        labelPosition="below"
        styleType={styleType}
        glass={!backdrop}
      />
    </div>
  );
}

export default function SpinnerLoader({ label = 'Memuat data', colorClass = 'border-blue-500', pulse = true }: { label?: string; colorClass?: string; pulse?: boolean }) {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white dark:bg-gray-900">
      <div className={`flex flex-col items-center gap-4 ${pulse ? 'animate-pulse' : ''}`}>
        <div className={`w-10 h-10 border-4 ${colorClass} border-dashed rounded-full animate-spin border-t-transparent`} />
        <p className="text-gray-700 dark:text-gray-300 text-sm">{label}</p>
      </div>
    </div>
  );
}

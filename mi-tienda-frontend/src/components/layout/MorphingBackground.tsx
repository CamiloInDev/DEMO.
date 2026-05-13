export function MorphingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden" aria-hidden="true">
      <svg className="absolute left-0 top-0 h-full w-full opacity-30" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(42, 96%, 40%)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(42, 96%, 40%)" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(42, 96%, 50%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(42, 96%, 40%)" stopOpacity="0.02" />
          </linearGradient>
          <filter id="liquid">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
        <g filter="url(#liquid)">
          <ellipse cx="200" cy="150" rx="350" ry="250" fill="url(#g1)">
            <animateTransform attributeName="transform" type="translate" values="0,0;80,40;0,0" dur="12s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="900" cy="500" rx="300" ry="200" fill="url(#g2)">
            <animateTransform attributeName="transform" type="translate" values="0,0;-60,30;0,0" dur="10s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="600" cy="300" rx="200" ry="180" fill="url(#g1)">
            <animateTransform attributeName="transform" type="translate" values="0,0;40,-50;0,0" dur="14s" repeatCount="indefinite" />
          </ellipse>
        </g>
      </svg>
      <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  )
}

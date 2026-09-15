import { motion } from 'framer-motion'

export interface DonutDatum {
  color: string
  value: number
  label?: string
}

interface DonutChartProps {
  data: DonutDatum[]
  size?: number
  centerLabel?: string
  centerSub?: string
  strokeWidth?: number
}

export function DonutChart({
  data,
  size = 150,
  centerLabel,
  centerSub,
  strokeWidth = 16,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) {
    return (
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - strokeWidth / 2}
            fill="none"
            stroke="rgba(128,128,140,0.12)"
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    )
  }

  const radius = size / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const segments = data.map((d, i) => {
    const priorFraction = data.slice(0, i).reduce((sum, x) => sum + x.value, 0) / total
    return {
      ...d,
      length: (d.value / total) * circumference,
      offset: priorFraction * circumference,
    }
  })

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Диаграмма структуры расходов"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(128,128,140,0.12)"
          strokeWidth={strokeWidth}
        />
        {segments.map((d, i) => (
          <motion.circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${d.length} ${circumference - d.length}`}
            strokeDashoffset={-d.offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          />
        ))}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-sm font-bold tabular-nums text-text-primary dark:text-dark-text">
            {centerLabel}
          </span>
          {centerSub && (
            <span className="text-[10px] text-text-secondary dark:text-dark-text-secondary">
              {centerSub}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
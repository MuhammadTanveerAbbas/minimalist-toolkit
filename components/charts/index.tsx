import { cn } from "@/lib/utils"

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

export interface BarDatum {
  label: string
  value: number
  color?: string
  hint?: string
}

/**
 * Horizontal bar chart. Labels sit outside the bars so long category
 * names never get clipped, and the value is always readable.
 */
export function BarChart({
  data,
  className,
  max,
  showValues = true,
  formatValue,
}: {
  data: BarDatum[]
  className?: string
  max?: number
  showValues?: boolean
  formatValue?: (value: number) => string
}) {
  const peak = max ?? Math.max(1, ...data.map((d) => d.value))

  if (data.length === 0) return null

  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {data.map((item, index) => {
        const pct = peak > 0 ? (item.value / peak) * 100 : 0
        return (
          <li key={item.label} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="truncate text-xs text-muted-foreground" title={item.hint ?? item.label}>
              {item.label}
            </span>
            {showValues ? (
              <span className="text-xs font-medium tabular-nums text-foreground">
                {formatValue ? formatValue(item.value) : item.value}
              </span>
            ) : null}
            <div className="col-span-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full origin-left transition-[width] duration-700 ease-out"
                style={{
                  width: `${Math.max(pct, item.value > 0 ? 2 : 0)}%`,
                  backgroundColor: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
                  animation: `bar-grow 700ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms both`,
                }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Sparkline for compact trend display.
 */
export function Sparkline({
  values,
  className,
  color = "var(--chart-1)",
  height = 40,
}: {
  values: number[]
  className?: string
  color?: string
  height?: number
}) {
  if (values.length < 2) return null

  const width = 100
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = width / (values.length - 1)

  const points = values.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * (height - 4) - 2
    return [x, y] as const
  })

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ")
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full overflow-visible", className)}
      style={{ height }}
      aria-hidden="true"
    >
      <path d={area} fill={color} opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r={2.5}
        fill={color}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/**
 * Donut chart with a centred total. Rendered as SVG arcs so it stays crisp
 * at any size and needs no charting dependency.
 */
export function DonutChart({
  data,
  className,
  size = 160,
  thickness = 18,
  centerLabel,
  centerValue,
}: {
  data: BarDatum[]
  className?: string
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string | number
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total <= 0) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-full border-2 border-dashed border-border", className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    )
  }

  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  // Precompute each segment's dash and offset so nothing is mutated during
  // render.
  const segments = data.reduce<
    { label: string; color: string; dash: number; offset: number }[]
  >((acc, item, index) => {
    const fraction = item.value / total
    const dash = fraction * circumference
    const previous = acc.length > 0 ? acc[acc.length - 1] : null
    const offset = previous ? previous.offset + previous.dash : 0
    acc.push({
      label: item.label,
      color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
      dash,
      offset,
    })
    return acc
  }, [])

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label="Distribution chart">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={thickness}
            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="butt"
            style={{
              transition:
                "stroke-dasharray 700ms cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        ))}
      </svg>
      {centerValue !== undefined ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-semibold tabular-nums tracking-tight">{centerValue}</span>
          {centerLabel ? (
            <span className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">{centerLabel}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Area chart with gridlines and axis labels. Designed for the landing page
 * showcase and the dashboard analytics panel.
 */
export function AreaChart({
  data,
  className,
  height = 220,
  color = "var(--chart-1)",
  formatValue,
}: {
  data: { label: string; value: number }[]
  className?: string
  height?: number
  color?: string
  formatValue?: (value: number) => string
}) {
  if (data.length < 2) return null

  const width = 600
  const padTop = 16
  const padBottom = 26
  const padLeft = 40
  const padRight = 8
  const innerW = width - padLeft - padRight
  const innerH = height - padTop - padBottom

  const max = Math.max(...data.map((d) => d.value)) || 1
  const step = innerW / (data.length - 1)

  const points = data.map((d, i) => {
    const x = padLeft + i * step
    const y = padTop + innerH - (d.value / max) * innerH
    return { x, y, ...d }
  })

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const area = `${line} L${points[points.length - 1].x.toFixed(1)},${(padTop + innerH).toFixed(1)} L${points[0].x.toFixed(1)},${(padTop + innerH).toFixed(1)} Z`

  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Trend chart"
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {gridLines.map((g) => {
          const y = padTop + innerH - g * innerH
          const value = max * g
          return (
            <g key={g}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={y}
                y2={y}
                stroke="var(--chart-grid)"
                strokeWidth={1}
                strokeDasharray={g === 0 ? undefined : "3 4"}
              />
              <text
                x={padLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {formatValue ? formatValue(value) : Math.round(value)}
              </text>
            </g>
          )
        })}

        <path d={area} fill="url(#area-fill)" />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={p.label + i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="var(--card)" stroke={color} strokeWidth={2} />
            {i % Math.ceil(data.length / 6) === 0 || i === points.length - 1 ? (
              <text x={p.x} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {p.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  )
}

/**
 * Stacked comparison bar used to contrast two options.
 */
export function ComparisonBar({
  options,
  className,
  formatValue,
}: {
  options: { label: string; value: number; color?: string }[]
  className?: string
  formatValue?: (value: number) => string
}) {
  const max = Math.max(1, ...options.map((o) => o.value))
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((option, i) => (
        <div key={option.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-medium">{option.label}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatValue ? formatValue(option.value) : option.value}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${(option.value / max) * 100}%`,
                backgroundColor: option.color ?? CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

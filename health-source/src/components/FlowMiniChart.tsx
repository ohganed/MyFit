import type { FlowDay } from '../features/life'

type Metric = 'sleepHours' | 'mealCount' | 'workoutCount' | 'energy' | 'weightKg'

type Props = {
  data: FlowDay[]
  metric: Metric
  title: string
  unit: string
  color: string
  type?: 'line' | 'bar'
}

export default function FlowMiniChart({
  data,
  metric,
  title,
  unit,
  color,
  type = 'line',
}: Props) {
  const values = data.map(d => d[metric])
  const valid = values.filter((v): v is number => v !== null && Number.isFinite(v))

  const latest = [...values].reverse().find((v): v is number => v !== null && Number.isFinite(v))

  const width = 300
  const height = 90
  const padding = 8

  const min = valid.length ? Math.min(...valid) : 0
  const max = valid.length ? Math.max(...valid) : 1
  const range = max - min || 1

  const x = (i: number) =>
    padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2)

  const y = (v: number) =>
    height - padding - ((v - min) / range) * (height - padding * 2)

  const segments: string[] = []
  let current: string[] = []

  values.forEach((value, i) => {
    if (value === null || !Number.isFinite(value)) {
      if (current.length) segments.push(current.join(' '))
      current = []
    } else {
      current.push(`${current.length ? 'L' : 'M'} ${x(i)} ${y(value)}`)
    }
  })

  if (current.length) segments.push(current.join(' '))

  return (
    <article className="flow-mini-card">
      <div className="flow-mini-header">
        <span>{title}</span>
        <strong>{latest === undefined ? '未記録' : `${latest} ${unit}`}</strong>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${title}の過去21日間の記録`}
        preserveAspectRatio="none"
      >
        {type === 'line' ? (
          <>
            {segments.map((path, i) => (
              <path
                key={i}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {values.map((value, i) =>
              value !== null && Number.isFinite(value) ? (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(value)}
                  r="2.5"
                  fill={color}
                />
              ) : null
            )}
          </>
        ) : (
          values.map((value, i) =>
            value !== null && Number.isFinite(value) ? (
              <rect
                key={i}
                x={x(i) - 4}
                y={y(value)}
                width="8"
                height={Math.max(height - padding - y(value), 1)}
                rx="2"
                fill={color}
              />
            ) : null
          )
        )}
      </svg>

      <div className="flow-mini-footer">
        <span>21日前</span>
        <span>今日</span>
      </div>
    </article>
  )
}

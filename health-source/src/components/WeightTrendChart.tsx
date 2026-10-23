type TrendPoint = {
  dateKey: string
  weightKg: number
}

type MovingAveragePoint = {
  dateKey: string
  weightKg: number
  dayCount: number
}

type WeightTrendChartProps = {
  data: TrendPoint[]
  movingAverageData?: MovingAveragePoint[]
}

function WeightTrendChart({
  data,
  movingAverageData = [],
}: WeightTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="weight-chart-empty">
        まだグラフに表示できるデータがありません
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="weight-chart-single">
        <div className="weight-chart-single-dot" />

        <strong>
          {data[0].weightKg.toFixed(1)}
          <small> kg</small>
        </strong>

        <span>
          {new Date(
            `${data[0].dateKey}T00:00:00`,
          ).toLocaleDateString(
            'ja-JP',
            {
              month: 'numeric',
              day: 'numeric',
            },
          )}
        </span>

        <p>
          2日目から変化を線で表示します
        </p>
      </div>
    )
  }

  const width = 600
  const height = 220

  const paddingLeft = 38
  const paddingRight = 18
  const paddingTop = 24
  const paddingBottom = 34

  const values =
    data.map(
      (point) => point.weightKg,
    )

  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)

  const range =
    Math.max(
      rawMax - rawMin,
      1,
    )

  const min =
    rawMin - range * 0.25

  const max =
    rawMax + range * 0.25

  const chartWidth =
    width -
    paddingLeft -
    paddingRight

  const chartHeight =
    height -
    paddingTop -
    paddingBottom

  const points =
    data.map(
      (point, index) => {
        const x =
          paddingLeft +
          (index /
            (data.length - 1)) *
            chartWidth

        const y =
          paddingTop +
          ((max -
            point.weightKg) /
            (max - min)) *
            chartHeight

        return {
          ...point,
          x,
          y,
        }
      },
    )

  const polyline =
    points
      .map(
        (point) =>
          `${point.x},${point.y}`,
      )
      .join(' ')

  const movingAveragePoints =
    movingAverageData
      .filter((point) =>
        data.some(
          (item) =>
            item.dateKey ===
            point.dateKey,
        ),
      )
      .map((point) => {
        const index =
          data.findIndex(
            (item) =>
              item.dateKey ===
              point.dateKey,
          )

        const x =
          paddingLeft +
          (index /
            (data.length - 1)) *
            chartWidth

        const y =
          paddingTop +
          ((max -
            point.weightKg) /
            (max - min)) *
            chartHeight

        return {
          ...point,
          x,
          y,
        }
      })

  const movingAveragePolyline =
    movingAveragePoints
      .map(
        (point) =>
          `${point.x},${point.y}`,
      )
      .join(' ')

  const first = data[0]
  const last =
    data[data.length - 1]

  const change =
    last.weightKg -
    first.weightKg

  const trendLabel =
    Math.abs(change) < 0.2
      ? 'ほぼ横ばい'
      : change < 0
        ? '減少傾向'
        : '増加傾向'

  return (
    <div className="weight-chart">
      <div className="weight-chart-summary">
        <div>
          <span>期間変化</span>
          <p className="weight-trend-label">
            {trendLabel}
          </p>
        </div>

        <strong>
          {change > 0 ? '+' : ''}
          {change.toFixed(1)}
          <small> kg</small>
        </strong>
      </div>

      <div className="weight-trend-values">
        <div>
          <span>開始</span>
          <strong>
            {first.weightKg.toFixed(1)}
            <small> kg</small>
          </strong>
        </div>

        <div>
          <span>最新</span>
          <strong>
            {last.weightKg.toFixed(1)}
            <small> kg</small>
          </strong>
        </div>
      </div>

      <svg
        className="weight-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="体重トレンドグラフ"
      >
        {[0, 0.5, 1].map(
          (ratio) => {
            const y =
              paddingTop +
              ratio *
                chartHeight

            return (
              <line
                key={ratio}
                x1={paddingLeft}
                x2={
                  width -
                  paddingRight
                }
                y1={y}
                y2={y}
                className="weight-chart-grid"
              />
            )
          },
        )}

        <polyline
          points={polyline}
          className="weight-chart-line"
        />

        {movingAveragePoints.length >= 2 && (
          <polyline
            points={movingAveragePolyline}
            className="weight-chart-average-line"
          />
        )}

        {points.map(
          (point) => (
            <circle
              key={point.dateKey}
              cx={point.x}
              cy={point.y}
              r="5"
              className="weight-chart-point"
            />
          ),
        )}

        <text
          x={paddingLeft}
          y={height - 8}
          className="weight-chart-label"
        >
          {new Date(
            `${first.dateKey}T00:00:00`,
          ).toLocaleDateString(
            'ja-JP',
            {
              month: 'numeric',
              day: 'numeric',
            },
          )}
        </text>

        <text
          x={
            width -
            paddingRight
          }
          y={height - 8}
          textAnchor="end"
          className="weight-chart-label"
        >
          {new Date(
            `${last.dateKey}T00:00:00`,
          ).toLocaleDateString(
            'ja-JP',
            {
              month: 'numeric',
              day: 'numeric',
            },
          )}
        </text>
      </svg>
    </div>
  )
}

export default WeightTrendChart

type TimingPoint = {
  dateKey: string
  weightKg: number
}

type TimingSeries = {
  timing:
    | 'after_waking'
    | 'morning_reset'
    | 'before_breakfast'
  points: TimingPoint[]
}

type WeightTimingTrendChartProps = {
  series: TimingSeries[]
}

const LABELS = {
  after_waking: '起床時',
  morning_reset: '朝のリセット後',
  before_breakfast: '朝食前',
} as const

function WeightTimingTrendChart({
  series,
}: WeightTimingTrendChartProps) {
  const allPoints =
    series.flatMap(
      (item) => item.points,
    )

  if (allPoints.length === 0) {
    return (
      <div className="weight-chart-empty">
        まだ3系列グラフに表示できるデータがありません
      </div>
    )
  }

  const width = 600
  const height = 240

  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 24
  const paddingBottom = 40

  const allDates =
    Array.from(
      new Set(
        allPoints.map(
          (point) =>
            point.dateKey,
        ),
      ),
    ).sort()

  const values =
    allPoints.map(
      (point) =>
        point.weightKg,
    )

  const rawMin =
    Math.min(...values)

  const rawMax =
    Math.max(...values)

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

  const getX = (
    dateKey: string,
  ) => {
    const index =
      allDates.indexOf(dateKey)

    if (allDates.length <= 1) {
      return (
        paddingLeft +
        chartWidth / 2
      )
    }

    return (
      paddingLeft +
      (index /
        (allDates.length - 1)) *
        chartWidth
    )
  }

  const getY = (
    weightKg: number,
  ) =>
    paddingTop +
    ((max - weightKg) /
      (max - min)) *
      chartHeight

  return (
    <div className="timing-chart">
      <div className="timing-chart-legend">
        {series.map(
          (item) => (
            <span
              key={item.timing}
              className={`timing-legend timing-${item.timing}`}
            >
              {LABELS[item.timing]}
            </span>
          ),
        )}
      </div>

      <svg
        className="weight-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="朝3回測定の体重推移"
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

        {series.map(
          (item) => {
            const points =
              item.points.map(
                (point) => ({
                  ...point,
                  x: getX(
                    point.dateKey,
                  ),
                  y: getY(
                    point.weightKg,
                  ),
                }),
              )

            const polyline =
              points
                .map(
                  (point) =>
                    `${point.x},${point.y}`,
                )
                .join(' ')

            return (
              <g key={item.timing}>
                {points.length >= 2 && (
                  <polyline
                    points={polyline}
                    className={`timing-chart-line timing-${item.timing}`}
                  />
                )}

                {points.map(
                  (point) => (
                    <circle
                      key={
                        point.dateKey
                      }
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      className={`timing-chart-point timing-${item.timing}`}
                    />
                  ),
                )}
              </g>
            )
          },
        )}

        {allDates.length > 0 && (
          <>
            <text
              x={paddingLeft}
              y={height - 9}
              className="weight-chart-label"
            >
              {new Date(
                `${allDates[0]}T00:00:00`,
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
              y={height - 9}
              textAnchor="end"
              className="weight-chart-label"
            >
              {new Date(
                `${allDates[
                  allDates.length - 1
                ]}T00:00:00`,
              ).toLocaleDateString(
                'ja-JP',
                {
                  month: 'numeric',
                  day: 'numeric',
                },
              )}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

export default WeightTimingTrendChart

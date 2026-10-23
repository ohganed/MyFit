import WeightTrendChart from './WeightTrendChart'
import WeightTimingTrendChart from './WeightTimingTrendChart'

import {
  getTimingLabel,
  type MovingAveragePoint,
  type TimingTrendSeries,
  type WeightTrendPoint,
} from '../features/weight/weightAnalysis'

type WeightTrendSectionProps = {
  trendDays: 7 | 30
  onTrendDaysChange: (
    days: 7 | 30,
  ) => void
  trendData: WeightTrendPoint[]
  movingAverageData: MovingAveragePoint[]
  timingTrendData: TimingTrendSeries[]
}

function WeightTrendSection({
  trendDays,
  onTrendDaysChange,
  trendData,
  movingAverageData,
  timingTrendData,
}: WeightTrendSectionProps) {
  return (
    <section className="weight-trend-card">
      <div className="weight-trend-heading">
        <div>
          <p className="weight-average-eyebrow">
            TREND
          </p>

          <h3>体重トレンド</h3>
        </div>

        <div className="trend-range-switch">
          <button
            type="button"
            className={
              trendDays === 7
                ? 'trend-range-button active'
                : 'trend-range-button'
            }
            onClick={() =>
              onTrendDaysChange(7)
            }
          >
            7日
          </button>

          <button
            type="button"
            className={
              trendDays === 30
                ? 'trend-range-button active'
                : 'trend-range-button'
            }
            onClick={() =>
              onTrendDaysChange(30)
            }
          >
            30日
          </button>
        </div>
      </div>

      <p className="trend-data-count">
        {trendData.length}日分のデータ
      </p>

      <WeightTrendChart
        data={trendData}
        movingAverageData={
          movingAverageData
        }
      />

      <WeightTimingTrendChart
        series={timingTrendData}
      />

      <div className="timing-trend-summary">
        {timingTrendData.map(
          (series) => (
            <div key={series.timing}>
              <span>
                {getTimingLabel(
                  series.timing,
                )}
              </span>

              <strong>
                {series.points.length}
                <small> 日</small>
              </strong>
            </div>
          ),
        )}
      </div>
    </section>
  )
}

export default WeightTrendSection

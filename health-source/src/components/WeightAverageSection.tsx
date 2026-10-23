import type {
  MovingAverageTrend,
  PeriodAverageStats,
  WeeklyWeightTrend,
} from '../features/weight/weightAnalysis'

type WeightAverageSectionProps = {
  sevenDayStats: PeriodAverageStats
  movingAverageTrend: MovingAverageTrend
  weeklyWeightTrend: WeeklyWeightTrend
  differenceFromAverage: number | null
}

function WeightAverageSection({
  sevenDayStats,
  movingAverageTrend,
  weeklyWeightTrend,
  differenceFromAverage,
}: WeightAverageSectionProps) {
  return (
    <section className="weight-average-card">
      <div>
        <p className="weight-average-eyebrow">
          LAST 7 DAYS
        </p>

        <h3>直近7日平均</h3>
      </div>

      <div className="weight-average-value">
        {sevenDayStats.average !== null ? (
          <>
            <strong>
              {sevenDayStats.average.toFixed(1)}
            </strong>
            <span>kg</span>
          </>
        ) : (
          <strong>--.-</strong>
        )}
      </div>

      <p className="weight-average-note">
        {sevenDayStats.dayCount > 0
          ? `${sevenDayStats.dayCount}日分の基準体重から計算`
          : 'まだ計算できる記録がありません'}
      </p>

      {movingAverageTrend.latest !== null && (
        <div className="weight-moving-trend">
          <span>移動平均トレンド</span>

          <div>
            <strong>
              {movingAverageTrend.latest.toFixed(1)}
              <small> kg</small>
            </strong>

            <em>
              {movingAverageTrend.direction === 'down'
                ? '↘ 下降'
                : movingAverageTrend.direction === 'up'
                  ? '↗ 上昇'
                  : movingAverageTrend.direction === 'stable'
                    ? '→ 横ばい'
                    : 'データ蓄積中'}
            </em>
          </div>
        </div>
      )}

      <div className="weight-weekly-pace">
        <span>最近のペース</span>

        <strong>
          {weeklyWeightTrend.changePerWeek !== null
            ? `${
                weeklyWeightTrend.changePerWeek > 0
                  ? '+'
                  : ''
              }${weeklyWeightTrend.changePerWeek.toFixed(1)} kg / 週`
            : 'データ蓄積中'}
        </strong>
      </div>

      {differenceFromAverage !== null && (
        <div className="weight-average-difference">
          <span>今日と7日平均との差</span>

          <strong>
            {differenceFromAverage > 0
              ? '+'
              : ''}
            {differenceFromAverage.toFixed(1)}
            <small> kg</small>
          </strong>
        </div>
      )}
    </section>
  )
}

export default WeightAverageSection

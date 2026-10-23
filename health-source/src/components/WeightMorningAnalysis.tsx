type MorningStats = {
  range: number | null
  count: number
}

type MorningDifferences = {
  wakingToReset: number
  resetToBreakfast: number
  total: number
}

type WeightMorningAnalysisProps = {
  baselineKg: number
  differenceFromYesterday: number | null
  stats: MorningStats
  differences: MorningDifferences | null
}

function WeightMorningAnalysis({
  baselineKg,
  differenceFromYesterday,
  stats,
  differences,
}: WeightMorningAnalysisProps) {
  return (
    <section className="morning-weight-analysis">
      <div>
        <p className="weight-average-eyebrow">
          MORNING MEASUREMENTS
        </p>

        <h3>今朝の測定</h3>
      </div>

      <div className="morning-weight-stats">
        <div>
          <span>測定</span>
          <strong>
            {stats.count}
            <small> / 3 回</small>
          </strong>
        </div>

        <div>
          <span>朝の変動幅</span>
          <strong>
            {stats.range !== null
              ? stats.range.toFixed(1)
              : '--.-'}
            <small> kg</small>
          </strong>
        </div>

        <div>
          <span>今日の基準</span>
          <strong>
            {baselineKg.toFixed(1)}
            <small> kg</small>
          </strong>
        </div>

        <div>
          <span>昨日比</span>
          <strong>
            {differenceFromYesterday !== null
              ? `${
                  differenceFromYesterday > 0
                    ? '+'
                    : ''
                }${differenceFromYesterday.toFixed(1)}`
              : '—'}

            {differenceFromYesterday !== null && (
              <small> kg</small>
            )}
          </strong>
        </div>
      </div>

      {stats.count < 3 && (
        <p className="morning-weight-note">
          3回そろうと今朝の変動を完全に比較できます。
        </p>
      )}

      {differences && (
        <div className="morning-difference-panel">
          <div>
            <span>
              起床時 → リセット後
            </span>

            <strong>
              {differences.wakingToReset > 0
                ? '+'
                : ''}
              {differences.wakingToReset.toFixed(1)}
              <small> kg</small>
            </strong>
          </div>

          <div>
            <span>
              リセット後 → 朝食前
            </span>

            <strong>
              {differences.resetToBreakfast > 0
                ? '+'
                : ''}
              {differences.resetToBreakfast.toFixed(1)}
              <small> kg</small>
            </strong>
          </div>

          <div>
            <span>
              朝全体の変動幅
            </span>

            <strong>
              {differences.total.toFixed(1)}
              <small> kg</small>
            </strong>
          </div>
        </div>
      )}
    </section>
  )
}

export default WeightMorningAnalysis

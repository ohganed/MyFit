import {
  useEffect,
  useState,
} from 'react'

import {
  fetchWeightRecords,
} from '../api/weightApi'

import {
  loadWeightGoalKg,
  loadWeightStartKg,
  saveWeightGoalKg,
  saveWeightStartKg,
} from '../storage/weightGoalStorage'

import {
  getDailyBaseline,
  groupWeightRecordsByDay,
  type WeeklyWeightTrend,
} from '../features/weight/weightAnalysis'

type WeightGoalCardProps = {
  weeklyWeightTrend: WeeklyWeightTrend
}

function WeightGoalCard({
  weeklyWeightTrend,
}: WeightGoalCardProps) {
  const [goalKg, setGoalKg] =
    useState(
      () =>
        loadWeightGoalKg(),
    )

  const [startKg, setStartKg] =
    useState<number | null>(
      () =>
        loadWeightStartKg(),
    )

  const [latestKg, setLatestKg] =
    useState<number | null>(null)

  useEffect(() => {
    fetchWeightRecords()
      .then((records) => {
        const groups =
          groupWeightRecordsByDay(
            records,
          )

        const latestGroup =
          groups[0]

        if (!latestGroup) {
          return
        }

        const baseline =
          getDailyBaseline(
            latestGroup.records,
          )

        if (!baseline) {
          return
        }

        setLatestKg(
          baseline.weightKg,
        )

        if (startKg === null) {
          setStartKg(
            baseline.weightKg,
          )

          saveWeightStartKg(
            baseline.weightKg,
          )
        }
      })
      .catch(() => {
        // 表示用なので失敗時は何もしない
      })
  }, [startKg])

  const remaining =
    latestKg !== null && goalKg !== null
      ? Math.abs(latestKg - goalKg)
      : null

  const progress =
    goalKg !== null &&
    startKg !== null &&
    latestKg !== null &&
    startKg !== goalKg
      ? Math.max(
          0,
          Math.min(
            100,
            (
              (startKg - latestKg) /
              (startKg - goalKg)
            ) * 100,
          ),
        )
      : 0

  return (
    <section className="weight-goal-card">
      <div className="weight-goal-heading">
        <div>
          <p className="weight-average-eyebrow">
            WEIGHT GOAL
          </p>

          <h3>目標体重</h3>
        </div>

        <label className="weight-goal-input">
          <input
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={goalKg ?? ''}
            placeholder="未設定"
            aria-label="目標体重"
            onChange={(event) => {
              const next =
                Number(
                  event.target.value,
                )

              if (
                Number.isFinite(next) &&
                next > 0
              ) {
                setGoalKg(next)
                saveWeightGoalKg(next)
              }
            }}
          />

          <span>kg</span>
        </label>
      </div>

      <div className="weight-goal-start">
        <span>開始時体重</span>

        <label className="weight-goal-input">
          <input
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={
              startKg ?? ''
            }
            onChange={(event) => {
              const next =
                Number(
                  event.target.value,
                )

              if (
                Number.isFinite(next) &&
                next > 0
              ) {
                setStartKg(next)
                saveWeightStartKg(next)
              }
            }}
          />

          <span>kg</span>
        </label>
      </div>

      {goalKg !== null && latestKg !== null &&
        startKg !== null && (
          <div className="weight-goal-progress">
            <div className="weight-goal-progress-heading">
              <span>達成率</span>

              <strong>
                {progress.toFixed(0)}
                <small> %</small>
              </strong>
            </div>

            <div className="weight-goal-progress-track">
              <div
                className="weight-goal-progress-fill"
                style={{
                  width:
                    `${progress}%`,
                }}
              />
            </div>

            <div className="weight-goal-progress-labels">
              <span>
                開始 {startKg.toFixed(1)}
              </span>

              <span>
                現在 {latestKg.toFixed(1)}
              </span>

              <span>
                目標 {goalKg === null ? '未設定' : goalKg.toFixed(1)}
              </span>
            </div>
          </div>
        )}

      <div className="weight-goal-pace">
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

        {goalKg !== null && latestKg !== null && weeklyWeightTrend.direction !==
          'insufficient' && (
          <small>
            {weeklyWeightTrend.direction === 'stable'
              ? 'ほぼ横ばい'
              : (weeklyWeightTrend.direction === 'down' && latestKg > goalKg) ||
                  (weeklyWeightTrend.direction === 'up' && latestKg < goalKg)
                ? '目標方向'
                : '目標から離れる方向'}
          </small>
        )}
      </div>

      <div className="weight-goal-stats">
        <div>
          <span>現在</span>

          <strong>
            {latestKg !== null
              ? latestKg.toFixed(1)
              : '--.-'}
            <small> kg</small>
          </strong>
        </div>

        <div>
          <span>目標</span>

          <strong>
            {goalKg === null ? '未設定' : goalKg.toFixed(1)}
            <small> kg</small>
          </strong>
        </div>

        <div>
          <span>あと</span>

          <strong>
            {remaining !== null
              ? Math.max(
                  remaining,
                  0,
                ).toFixed(1)
              : '--.-'}
            <small> kg</small>
          </strong>
        </div>
      </div>
    </section>
  )
}

export default WeightGoalCard

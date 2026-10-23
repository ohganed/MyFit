import type { WorkoutRecord } from '../storage/workoutStorage'
import {
  calculateWeeklyMuscleScores,
  muscleScoreToLevel,
  type MuscleRegion,
} from '../features/muscle/muscleMap'

type Props = {
  history: WorkoutRecord[]
}

function WeeklyMuscleMap({ history }: Props) {
  const scores = calculateWeeklyMuscleScores(history)

  const level = (muscle: MuscleRegion) =>
    muscleScoreToLevel(scores[muscle])

  return (
    <section className="muscle-map">
      <header className="muscle-map-header">
        <div>
          <p className="muscle-map-eyebrow">
            WHOLE BODY COVERAGE
          </p>
          <h2>過去7日間の筋肉マップ</h2>
        </div>

        <span className="muscle-map-estimate">
          運動記録から推定
        </span>
      </header>

      <div className="muscle-map-bodies">
        <div className="muscle-body">
          <span>前面</span>

          <svg
            viewBox="0 0 180 420"
            role="img"
            aria-label="身体前面の筋肉活動"
          >
            <circle
              className="muscle-silhouette"
              cx="90"
              cy="35"
              r="24"
            />

            <rect
              className="muscle-silhouette"
              x="72"
              y="58"
              width="36"
              height="28"
              rx="14"
            />

            <path
              className={`muscle-region level-${level('shoulders')}`}
              d="M48 90 Q90 65 132 90 L119 125 L61 125 Z"
            />

            <path
              className={`muscle-region level-${level('chest')}`}
              d="M62 100 Q90 88 118 100 L114 151 Q90 164 66 151 Z"
            />

            <path
              className={`muscle-region level-${level('abs')}`}
              d="M72 155 L108 155 L112 235 L68 235 Z"
            />

            <path
              className={`muscle-region level-${level('obliques')}`}
              d="M58 151 L72 155 L68 235 L53 216 Z"
            />

            <path
              className={`muscle-region level-${level('obliques')}`}
              d="M122 151 L108 155 L112 235 L127 216 Z"
            />

            <path
              className={`muscle-region level-${level('biceps')}`}
              d="M47 112 L62 118 L52 190 L35 184 Z"
            />

            <path
              className={`muscle-region level-${level('biceps')}`}
              d="M133 112 L118 118 L128 190 L145 184 Z"
            />

            <path
              className={`muscle-region level-${level('forearms')}`}
              d="M35 188 L52 194 L42 252 L25 248 Z"
            />

            <path
              className={`muscle-region level-${level('forearms')}`}
              d="M145 188 L128 194 L138 252 L155 248 Z"
            />

            <path
              className={`muscle-region level-${level('quads')}`}
              d="M62 238 L88 238 L82 335 L55 335 Z"
            />

            <path
              className={`muscle-region level-${level('quads')}`}
              d="M118 238 L92 238 L98 335 L125 335 Z"
            />

            <path
              className={`muscle-region level-${level('calves')}`}
              d="M57 340 L81 340 L76 405 L60 405 Z"
            />

            <path
              className={`muscle-region level-${level('calves')}`}
              d="M123 340 L99 340 L104 405 L120 405 Z"
            />
          </svg>
        </div>

        <div className="muscle-body">
          <span>背面</span>

          <svg
            viewBox="0 0 180 420"
            role="img"
            aria-label="身体背面の筋肉活動"
          >
            <circle
              className="muscle-silhouette"
              cx="90"
              cy="35"
              r="24"
            />

            <rect
              className="muscle-silhouette"
              x="72"
              y="58"
              width="36"
              height="28"
              rx="14"
            />

            <path
              className={`muscle-region level-${level('upperBack')}`}
              d="M48 90 Q90 67 132 90 L116 145 L64 145 Z"
            />

            <path
              className={`muscle-region level-${level('lats')}`}
              d="M61 130 L82 142 L78 225 L52 205 Z"
            />

            <path
              className={`muscle-region level-${level('lats')}`}
              d="M119 130 L98 142 L102 225 L128 205 Z"
            />

            <path
              className={`muscle-region level-${level('lowerBack')}`}
              d="M79 148 L101 148 L108 230 L72 230 Z"
            />

            <path
              className={`muscle-region level-${level('triceps')}`}
              d="M47 112 L62 118 L52 190 L35 184 Z"
            />

            <path
              className={`muscle-region level-${level('triceps')}`}
              d="M133 112 L118 118 L128 190 L145 184 Z"
            />

            <path
              className={`muscle-region level-${level('glutes')}`}
              d="M58 230 Q90 215 122 230 L116 278 Q90 294 64 278 Z"
            />

            <path
              className={`muscle-region level-${level('hamstrings')}`}
              d="M62 280 L88 280 L82 340 L55 340 Z"
            />

            <path
              className={`muscle-region level-${level('hamstrings')}`}
              d="M118 280 L92 280 L98 340 L125 340 Z"
            />

            <path
              className={`muscle-region level-${level('calves')}`}
              d="M57 342 L81 342 L76 405 L60 405 Z"
            />

            <path
              className={`muscle-region level-${level('calves')}`}
              d="M123 342 L99 342 L104 405 L120 405 Z"
            />
          </svg>
        </div>
      </div>

      <div className="muscle-map-legend">
        <span><i className="level-3" />よく使った</span>
        <span><i className="level-2" />使った</span>
        <span><i className="level-1" />少し使った</span>
        <span><i className="level-0" />記録なし</span>
      </div>

      <p className="muscle-map-note">
        筋肉の色はトレーニング記録から推定した使用傾向です。
        実際の筋活動を測定したものではありません。
      </p>
    </section>
  )
}

export default WeeklyMuscleMap

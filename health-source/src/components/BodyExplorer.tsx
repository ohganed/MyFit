import { useMemo, useState } from 'react'

import BodyFigure from './BodyFigure'
import {
  bodyweightExercises,
  type ExerciseCategory,
} from '../features/body-explorer/exerciseMap'

import {
  muscles,
  type BodySide,
  type MuscleDefinition,
  type MuscleDepth,
} from '../features/body-explorer/anatomy'

const categoryLabels: Record<ExerciseCategory, string> = {
  strength: '筋力',
  stability: '安定性',
  control: '動作制御',
  mobility: '可動性',
}

const depthLabels: Record<MuscleDepth, string> = {
  surface: '表層',
  intermediate: '中間層',
  deep: '深層',
}

const roleLabels = {
  'prime-mover': '主に動かす',
  synergist: '動きを助ける',
  stabilizer: '安定させる',
  controller: '動きを制御する',
}

type FigureSide = Extract<BodySide, 'front' | 'back'>
type FigureDepth = Extract<MuscleDepth, 'surface' | 'deep'>

export default function BodyExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [exploreMode, setExploreMode] =
    useState<'muscles' | 'exercises'>('muscles')
  const [selectedExerciseId, setSelectedExerciseId] =
    useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [side, setSide] = useState<FigureSide>('front')
  const [depth, setDepth] = useState<FigureDepth>('surface')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return muscles

    return muscles.filter((muscle) =>
      muscle.nameJa.includes(q) ||
      muscle.nameEn.toLowerCase().includes(q)
    )
  }, [query])

  const selected: MuscleDefinition | undefined =
    muscles.find((muscle) => muscle.id === selectedId)

  const selectedExercise = bodyweightExercises.find(
    (exercise) => exercise.id === selectedExerciseId
  )

  return (
    <section className="body-explorer">
      <header className="body-explorer-header">
        <p className="body-explorer-eyebrow">BODY EXPLORER</p>
        <h2>身体を発見する</h2>
        <p>
          人体図を触って、身体を動かし、安定させ、
          制御している筋肉を探索してみましょう。
        </p>
      </header>

      {!selected && (
        <div className="body-figure-toggle" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={exploreMode === 'muscles' ? 'active' : ''}
            onClick={() => {
              setExploreMode('muscles')
              setSelectedExerciseId(null)
            }}
          >
            筋肉から探す
          </button>
          <button
            type="button"
            className={exploreMode === 'exercises' ? 'active' : ''}
            onClick={() => setExploreMode('exercises')}
          >
            運動から探す
          </button>
        </div>
      )}

      {!selected && exploreMode === 'exercises' && (
        <div className="body-explorer-list">
          {selectedExercise ? (
            <article className="muscle-detail">
              <button
                type="button"
                className="muscle-detail-back"
                onClick={() => setSelectedExerciseId(null)}
              >
                ← 運動一覧へ戻る
              </button>

              <h3>{selectedExercise.nameJa}</h3>
              <p>{selectedExercise.nameEn}</p>
              <p>{categoryLabels[selectedExercise.category]}</p>

              <div className="body-figure-controls">
                <div className="body-figure-toggle">
                  <button
                    type="button"
                    className={side === 'front' ? 'active' : ''}
                    onClick={() => setSide('front')}
                  >
                    前面
                  </button>
                  <button
                    type="button"
                    className={side === 'back' ? 'active' : ''}
                    onClick={() => setSide('back')}
                  >
                    背面
                  </button>
                </div>

                <div className="body-figure-toggle">
                  <button
                    type="button"
                    className={depth === 'surface' ? 'active' : ''}
                    onClick={() => setDepth('surface')}
                  >
                    表層
                  </button>
                  <button
                    type="button"
                    className={depth === 'deep' ? 'active' : ''}
                    onClick={() => setDepth('deep')}
                  >
                    深層
                  </button>
                </div>
              </div>

              <BodyFigure
                side={side}
                depth={depth}
                selectedId={null}
                onSelectMuscle={setSelectedId}
                exerciseRoles={Object.fromEntries(
                  selectedExercise.muscleLinks.map((link) => [
                    link.muscleId,
                    link.role,
                  ])
                )}
              />

              <div className="exercise-role-legend">
                <span>🔴 主動筋</span>
                <span>🟠 協働筋</span>
                <span>🔵 安定化筋</span>
                <span>🟣 制御筋</span>
              </div>

              <p className="body-figure-hint">
                図は試験用の参考表示です。登録された筋肉のうち、
                図形が用意されているものだけを色分けしています。
              </p>

              <h4>関係する筋肉</h4>

              {selectedExercise.muscleLinks.map((link) => {
                const muscle = muscles.find(
                  (item) => item.id === link.muscleId
                )

                if (!muscle) return null

                return (
                  <button
                    key={link.muscleId}
                    type="button"
                    onClick={() => setSelectedId(muscle.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <strong>{muscle.nameJa}</strong>
                    <span style={{ display: 'block' }}>
                      {muscle.nameEn}
                    </span>
                    <small>{roleLabels[link.role]}</small>
                  </button>
                )
              })}

              <p className="muscle-estimate-note">
                標準的な動作を想定した筋肉の役割です。
                実際の筋活動を測定したものではありません。
              </p>
            </article>
          ) : (
            <>
              <p>{bodyweightExercises.length} exercises</p>
              {bodyweightExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => setSelectedExerciseId(exercise.id)}
                >
                  <strong>{exercise.nameJa}</strong>
                  <span>{exercise.nameEn}</span>
                  <small>{categoryLabels[exercise.category]}</small>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {!selected && exploreMode === 'muscles' && (
        <>
          <div className="body-figure-controls">
            <div className="body-figure-toggle">
              <button
                type="button"
                className={side === 'front' ? 'active' : ''}
                onClick={() => setSide('front')}
              >
                前面
              </button>

              <button
                type="button"
                className={side === 'back' ? 'active' : ''}
                onClick={() => setSide('back')}
              >
                背面
              </button>
            </div>

            <div className="body-figure-toggle">
              <button
                type="button"
                className={depth === 'surface' ? 'active' : ''}
                onClick={() => setDepth('surface')}
              >
                表層
              </button>

              <button
                type="button"
                className={depth === 'deep' ? 'active' : ''}
                onClick={() => setDepth('deep')}
              >
                深層
              </button>
            </div>
          </div>

          <BodyFigure
            side={side}
            depth={depth}
            selectedId={selectedId}
            onSelectMuscle={setSelectedId}
          />

          <p className="body-figure-hint">
            対応する筋肉の部分をタップすると、その筋肉を探索できます。
          </p>

          <input
            className="body-explorer-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="筋肉を検索　例：前鋸筋 / Serratus"
          />

          <div className="body-explorer-count">
            {filtered.length} muscles
          </div>

          <div className="body-explorer-list">
            {filtered.map((muscle) => (
              <button
                key={muscle.id}
                type="button"
                onClick={() => setSelectedId(muscle.id)}
              >
                <strong>{muscle.nameJa}</strong>
                <span>{muscle.nameEn}</span>
                <small>{depthLabels[muscle.depth]}</small>
              </button>
            ))}
          </div>
        </>
      )}

      {selected && (
        <article className="muscle-detail">
          <button
            className="muscle-detail-back"
            type="button"
            onClick={() => setSelectedId(null)}
          >
            ← 人体図へ戻る
          </button>

          <p className="body-explorer-eyebrow">
            {depthLabels[selected.depth]}
          </p>

          <h3>{selected.nameJa}</h3>
          <p className="muscle-detail-en">{selected.nameEn}</p>

          <div className="muscle-role-list">
            {selected.roles.map((role) => (
              <span key={role}>{roleLabels[role]}</span>
            ))}
          </div>

          <section>
            <h4>この筋肉は何をしている？</h4>
            {selected.functions.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </section>

          {selected.feelIt && (
            <section className="feel-it-card">
              <span>FEEL IT</span>
              <h4>少し動かしてみる</h4>
              <p>{selected.feelIt.instruction}</p>
              <strong>{selected.feelIt.focus}</strong>
              <small>
                痛みや強い違和感がある場合は行わないでください。
              </small>
            </section>
          )}

          <p className="muscle-estimate-note">
            運動記録からの推定：
            {selected.workoutEstimable === 'yes'
              ? '比較的対応しやすい'
              : selected.workoutEstimable === 'limited'
                ? '限定的'
                : '推定対象外'}
          </p>
        </article>
      )}
    </section>
  )
}

import { useRef, useState } from 'react'

import {
  loadExercises,
  type Exercise,
  type MeasurementType,
} from '../storage/exerciseStorage'

import {
  saveWorkoutRecord,
  type WorkoutRecord,
  type WorkoutSet,
} from '../storage/workoutStorage'

type WorkoutFormProps = {
  history: WorkoutRecord[]
  historyCount: number
  onHistoryChange: (
    history: WorkoutRecord[],
  ) => void
  onWorkoutSaved: () => void
  initialCategory?: Exercise['category']
  initialExerciseId?: string
}

const exercises = loadExercises()

const CATEGORY_LABELS = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  core: 'Core',
} as const

function WorkoutForm({
  history,
  historyCount,
  onHistoryChange,
  onWorkoutSaved,
  initialCategory = 'push',
  initialExerciseId,
}: WorkoutFormProps) {
  const nextSetId = useRef(4)

  const [selectedCategory, setSelectedCategory] =
    useState<Exercise['category']>(
      initialCategory,
    )

  const categoryExercises = exercises.filter(
    (exercise) =>
      exercise.category === selectedCategory,
  )

  const [selectedExerciseId, setSelectedExerciseId] =
    useState(
      initialExerciseId ??
        exercises.find(
          (exercise) =>
            exercise.category ===
            initialCategory,
        )?.id ??
        '',
    )

  const selectedExercise =
    exercises.find(
      (exercise) =>
        exercise.id === selectedExerciseId,
    ) ?? categoryExercises[0]

  const [sets, setSets] = useState<WorkoutSet[]>([
    {
      id: 'temporary-set-1',
      weight: '',
      reps: '',
      durationSeconds: '',
      addedWeight: '',
      assistanceWeight: '',
    },
    {
      id: 'temporary-set-2',
      weight: '',
      reps: '',
      durationSeconds: '',
      addedWeight: '',
      assistanceWeight: '',
    },
    {
      id: 'temporary-set-3',
      weight: '',
      reps: '',
      durationSeconds: '',
      addedWeight: '',
      assistanceWeight: '',
    },
  ])

  const [saveMessage, setSaveMessage] =
    useState('')

  const previousRecord = selectedExercise
    ? history.find(
        (record) =>
          record.exerciseId ===
            selectedExercise.id ||
          record.exerciseName ===
            selectedExercise.name,
      )
    : undefined

  const copyPreviousSets = () => {
    if (!previousRecord) {
      return
    }

    const copiedSets =
      previousRecord.sets.map((set) => ({
        ...set,
        id: createTemporarySetId(),
      }))

    setSets(copiedSets)
    setSaveMessage(
      '前回の内容を入力欄へコピーしました',
    )
  }

  const createTemporarySetId = (): string => {
    const id =
      `temporary-set-${nextSetId.current}`

    nextSetId.current += 1

    return id
  }

  const createEmptySet = (): WorkoutSet => ({
    id: createTemporarySetId(),
    weight: '',
    reps: '',
    durationSeconds: '',
    addedWeight: '',
    assistanceWeight: '',
  })

  const createEmptySets = (): WorkoutSet[] => [
    createEmptySet(),
    createEmptySet(),
    createEmptySet(),
  ]

  const changeCategory = (
    category: Exercise['category'],
  ) => {
    setSelectedCategory(category)

    const firstExercise = exercises.find(
      (exercise) =>
        exercise.category === category,
    )

    setSelectedExerciseId(
      firstExercise?.id ?? '',
    )

    setSets(createEmptySets())
    setSaveMessage('')
  }

  const changeExercise = (
    exerciseId: string,
  ) => {
    setSelectedExerciseId(exerciseId)
    setSets(createEmptySets())
    setSaveMessage('')
  }

  const updateSet = (
    id: string,
    field:
      | 'weight'
      | 'reps'
      | 'durationSeconds'
      | 'addedWeight'
      | 'assistanceWeight',
    value: string,
  ) => {
    setSets((currentSets) =>
      currentSets.map((set) =>
        set.id === id
          ? { ...set, [field]: value }
          : set,
      ),
    )
  }

  const addSet = () => {
    setSets((currentSets) => [
      ...currentSets,
      createEmptySet(),
    ])
  }

  const hasCompletedValue = (
    set: WorkoutSet,
    measurementType: MeasurementType,
  ): boolean => {
    switch (measurementType) {
      case 'weight-reps':
        return Boolean(set.weight || set.reps)

      case 'reps':
        return Boolean(set.reps)

      case 'duration':
        return Boolean(set.durationSeconds)

      case 'bodyweight-added-weight':
        return Boolean(
          set.addedWeight || set.reps,
        )

      case 'assisted-reps':
        return Boolean(
          set.assistanceWeight || set.reps,
        )
    }
  }

  const saveWorkout = () => {
    if (!selectedExercise) {
      setSaveMessage(
        '種目を選択してください',
      )
      return
    }

    const completedSets = sets.filter(
      (set) =>
        hasCompletedValue(
          set,
          selectedExercise.measurementType,
        ),
    )

    if (completedSets.length === 0) {
      setSaveMessage(
        '記録を入力してください',
      )
      return
    }

    const updatedHistory =
      saveWorkoutRecord({
        routineName:
          CATEGORY_LABELS[selectedCategory],
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        sets: completedSets,
      })

    onHistoryChange(updatedHistory)

    setSaveMessage(
      `${selectedExercise.name}を保存しました`,
    )

    setSets(createEmptySets())
    onWorkoutSaved()
  }

  const formatPreviousSet = (
    set: WorkoutSet,
    measurementType: MeasurementType,
  ): string => {
    switch (measurementType) {
      case 'weight-reps':
        return `${set.weight || '—'}kg × ${
          set.reps || '—'
        }回`

      case 'reps':
        return `${set.reps || '—'}回`

      case 'duration':
        return `${
          set.durationSeconds || '—'
        }秒`

      case 'bodyweight-added-weight':
        return `＋${
          set.addedWeight || '0'
        }kg × ${set.reps || '—'}回`

      case 'assisted-reps':
        return `補助 ${
          set.assistanceWeight || '—'
        }kg × ${set.reps || '—'}回`
    }
  }

  const renderSetInputs = (
    set: WorkoutSet,
  ) => {
    if (!selectedExercise) {
      return null
    }

    switch (selectedExercise.measurementType) {
      case 'weight-reps':
        return (
          <>
            <label className="input-group">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={set.weight ?? ''}
                onChange={(event) =>
                  updateSet(
                    set.id,
                    'weight',
                    event.target.value,
                  )
                }
              />
              <span>kg</span>
            </label>

            <label className="input-group">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={set.reps ?? ''}
                onChange={(event) =>
                  updateSet(
                    set.id,
                    'reps',
                    event.target.value,
                  )
                }
              />
              <span>回</span>
            </label>
          </>
        )

      case 'reps':
        return (
          <label className="input-group single-input">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="0"
              value={set.reps ?? ''}
              onChange={(event) =>
                updateSet(
                  set.id,
                  'reps',
                  event.target.value,
                )
              }
            />
            <span>回</span>
          </label>
        )

      case 'duration':
        return (
          <label className="input-group single-input">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="0"
              value={
                set.durationSeconds ?? ''
              }
              onChange={(event) =>
                updateSet(
                  set.id,
                  'durationSeconds',
                  event.target.value,
                )
              }
            />
            <span>秒</span>
          </label>
        )

      case 'bodyweight-added-weight':
        return (
          <>
            <label className="input-group">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={
                  set.addedWeight ?? ''
                }
                onChange={(event) =>
                  updateSet(
                    set.id,
                    'addedWeight',
                    event.target.value,
                  )
                }
              />
              <span>追加kg</span>
            </label>

            <label className="input-group">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={set.reps ?? ''}
                onChange={(event) =>
                  updateSet(
                    set.id,
                    'reps',
                    event.target.value,
                  )
                }
              />
              <span>回</span>
            </label>
          </>
        )

      case 'assisted-reps':
        return (
          <>
            <label className="input-group">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={
                  set.assistanceWeight ?? ''
                }
                onChange={(event) =>
                  updateSet(
                    set.id,
                    'assistanceWeight',
                    event.target.value,
                  )
                }
              />
              <span>補助kg</span>
            </label>

            <label className="input-group">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={set.reps ?? ''}
                onChange={(event) =>
                  updateSet(
                    set.id,
                    'reps',
                    event.target.value,
                  )
                }
              />
              <span>回</span>
            </label>
          </>
        )
    }
  }

  return (
    <>
      <p className="record-count">
        保存済み記録：{historyCount}件
      </p>

      <section className="workout-card">
        <label className="exercise-label">
          トレーニング分類
        </label>

        <select
          className="exercise-name"
          value={selectedCategory}
          onChange={(event) =>
            changeCategory(
              event.target
                .value as Exercise['category'],
            )
          }
        >
          <option value="push">Push</option>
          <option value="pull">Pull</option>
          <option value="legs">Legs</option>
          <option value="core">Core</option>
        </select>

        <label className="exercise-label exercise-label-spaced">
          種目
        </label>

        <select
          className="exercise-name"
          value={selectedExercise?.id ?? ''}
          onChange={(event) =>
            changeExercise(
              event.target.value,
            )
          }
        >
          {categoryExercises.map(
            (exercise) => (
              <option
                value={exercise.id}
                key={exercise.id}
              >
                {exercise.name}
              </option>
            ),
          )}
        </select>

        {selectedExercise && (
          <div className="exercise-info">
            <p>
              場所：
              {selectedExercise.locations.join(
                '・',
              )}
            </p>

            <p>
              器具：
              {selectedExercise.equipment
                .length > 0
                ? selectedExercise.equipment.join(
                    '・',
                  )
                : '器具なし'}
            </p>
          </div>
        )}

        {previousRecord && selectedExercise && (
        <section className="previous-record-card">
          <div className="previous-record-heading">
            <div>
              <p className="previous-record-eyebrow">
                PREVIOUS
              </p>

              <h3>前回の記録</h3>
            </div>

            <time>
              {new Date(
                previousRecord.savedAt,
              ).toLocaleDateString(
                'ja-JP',
                {
                  month: 'numeric',
                  day: 'numeric',
                },
              )}
            </time>
          </div>

          <div className="previous-set-list">
            {previousRecord.sets.map(
              (set, index) => (
                <div
                  className="previous-set-row"
                  key={set.id}
                >
                  <span>
                    SET {index + 1}
                  </span>

                  <strong>
                    {formatPreviousSet(
                      set,
                      selectedExercise
                        .measurementType,
                    )}
                  </strong>
                </div>
              ),
            )}
          </div>

          <button
            className="copy-previous-button"
            type="button"
            onClick={copyPreviousSets}
          >
            前回の内容をコピー
          </button>
        </section>
      )}

      <div className="sets-list">
          {sets.map((set, index) => (
            <div
              className="set-row"
              key={set.id}
            >
              <div className="set-number">
                {index + 1}
              </div>

              {renderSetInputs(set)}
            </div>
          ))}
        </div>

        <button
          className="add-button"
          type="button"
          onClick={addSet}
        >
          ＋ セットを追加
        </button>
      </section>

      <button
        className="save-button"
        type="button"
        onClick={saveWorkout}
      >
        今日の記録を保存
      </button>

      {saveMessage && (
        <p
          className="save-message"
          role="status"
        >
          {saveMessage}
        </p>
      )}
    </>
  )
}

export default WorkoutForm

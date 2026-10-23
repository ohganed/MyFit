import type { WorkoutRecord } from '../../storage/workoutStorage'

export type MuscleRegion =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'upperBack'
  | 'lats'
  | 'lowerBack'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'adductors'
  | 'calves'

export type MuscleLevel = 0 | 1 | 2 | 3

type Activation =
  Partial<Record<MuscleRegion, number>>

const exerciseMuscles: Record<string, Activation> = {
  'push-up': {
    chest: 3,
    triceps: 2,
    shoulders: 2,
    abs: 1,
  },

  'bodyweight-squat': {
    quads: 3,
    glutes: 3,
    adductors: 2,
    hamstrings: 1,
    abs: 1,
  },

  squat: {
    quads: 3,
    glutes: 3,
    adductors: 2,
    hamstrings: 1,
    lowerBack: 1,
  },

  'pull-up': {
    lats: 3,
    biceps: 2,
    upperBack: 2,
    forearms: 2,
    abs: 1,
  },

  plank: {
    abs: 3,
    obliques: 2,
    shoulders: 1,
    glutes: 1,
  },
}

export function getExerciseMuscles(
  record: WorkoutRecord,
): Activation {
  if (!record.exerciseId) {
    return {}
  }

  return exerciseMuscles[record.exerciseId] ?? {}
}

const muscleRegions: MuscleRegion[] = [
  'chest',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'upperBack',
  'lats',
  'lowerBack',
  'abs',
  'obliques',
  'glutes',
  'quads',
  'hamstrings',
  'adductors',
  'calves',
]

export type MuscleScores =
  Record<MuscleRegion, number>

export function calculateWeeklyMuscleScores(
  history: WorkoutRecord[],
  now = new Date(),
): MuscleScores {
  const scores = Object.fromEntries(
    muscleRegions.map((muscle) => [muscle, 0]),
  ) as MuscleScores

  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 6)

  history.forEach((record) => {
    const savedAt = new Date(record.savedAt)

    if (
      Number.isNaN(savedAt.getTime()) ||
      savedAt < start ||
      savedAt > now
    ) {
      return
    }

    const activation =
      getExerciseMuscles(record)

    const setFactor = Math.max(
      1,
      Math.min(record.sets.length, 4),
    )

    muscleRegions.forEach((muscle) => {
      scores[muscle] +=
        (activation[muscle] ?? 0) * setFactor
    })
  })

  return scores
}

export function muscleScoreToLevel(
  score: number,
): MuscleLevel {
  if (score === 0) return 0
  if (score <= 4) return 1
  if (score <= 10) return 2
  return 3
}

export const muscleLabels: Record<MuscleRegion, string> = {
  chest: '胸',
  shoulders: '肩',
  biceps: '上腕二頭筋',
  triceps: '上腕三頭筋',
  forearms: '前腕',
  upperBack: '上背部',
  lats: '広背筋',
  lowerBack: '腰背部',
  abs: '腹部',
  obliques: '腹斜筋',
  glutes: '臀部',
  quads: '大腿四頭筋',
  hamstrings: 'ハムストリング',
  adductors: '内転筋',
  calves: 'ふくらはぎ',
}

export function getWeeklyMuscleCoverage(
  history: WorkoutRecord[],
) {
  const scores = calculateWeeklyMuscleScores(history)

  const muscles = muscleRegions.map((muscle) => ({
    muscle,
    label: muscleLabels[muscle],
    score: scores[muscle],
    level: muscleScoreToLevel(scores[muscle]),
  }))

  return {
    wellUsed: muscles.filter(
      (item) => item.level >= 2,
    ),
    lightlyUsed: muscles.filter(
      (item) => item.level === 1,
    ),
    unused: muscles.filter(
      (item) => item.level === 0,
    ),
  }
}

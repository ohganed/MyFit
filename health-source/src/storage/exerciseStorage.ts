export type ExerciseCategory =
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'

export type MeasurementType =
  | 'weight-reps'
  | 'reps'
  | 'duration'
  | 'bodyweight-added-weight'
  | 'assisted-reps'

export type ExerciseLocation =
  | 'home'
  | 'gym'
  | 'anywhere'

export type Exercise = {
  id: string
  name: string
  category: ExerciseCategory
  measurementType: MeasurementType
  equipment: string[]
  locations: ExerciseLocation[]
}

const STORAGE_KEY = 'myfit-exercises'

const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: 'bench-press',
    name: 'ベンチプレス',
    category: 'push',
    measurementType: 'weight-reps',
    equipment: ['バーベル', 'ベンチ'],
    locations: ['gym'],
  },
  {
    id: 'dumbbell-press',
    name: 'ダンベルプレス',
    category: 'push',
    measurementType: 'weight-reps',
    equipment: ['ダンベル', 'ベンチ'],
    locations: ['home', 'gym'],
  },
  {
    id: 'shoulder-press',
    name: 'ショルダープレス',
    category: 'push',
    measurementType: 'weight-reps',
    equipment: ['ダンベル'],
    locations: ['home', 'gym'],
  },
  {
    id: 'push-up',
    name: '腕立て伏せ',
    category: 'push',
    measurementType: 'reps',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'knee-push-up',
    name: '膝つき腕立て伏せ',
    category: 'push',
    measurementType: 'reps',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'pike-push-up',
    name: 'パイクプッシュアップ',
    category: 'push',
    measurementType: 'reps',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'dips',
    name: 'ディップス',
    category: 'push',
    measurementType: 'reps',
    equipment: ['ディップスバー'],
    locations: ['home', 'gym'],
  },
  {
    id: 'weighted-dips',
    name: '加重ディップス',
    category: 'push',
    measurementType: 'bodyweight-added-weight',
    equipment: ['ディップスバー', '追加重量'],
    locations: ['home', 'gym'],
  },
  {
    id: 'deadlift',
    name: 'デッドリフト',
    category: 'pull',
    measurementType: 'weight-reps',
    equipment: ['バーベル'],
    locations: ['gym'],
  },
  {
    id: 'lat-pulldown',
    name: 'ラットプルダウン',
    category: 'pull',
    measurementType: 'weight-reps',
    equipment: ['マシン'],
    locations: ['gym'],
  },
  {
    id: 'dumbbell-row',
    name: 'ダンベルロー',
    category: 'pull',
    measurementType: 'weight-reps',
    equipment: ['ダンベル'],
    locations: ['home', 'gym'],
  },
  {
    id: 'resistance-band-row',
    name: 'チューブロー',
    category: 'pull',
    measurementType: 'reps',
    equipment: ['トレーニングチューブ'],
    locations: ['home', 'anywhere'],
  },
  {
    id: 'pull-up',
    name: '懸垂',
    category: 'pull',
    measurementType: 'reps',
    equipment: ['懸垂バー'],
    locations: ['home', 'gym'],
  },
  {
    id: 'weighted-pull-up',
    name: '加重懸垂',
    category: 'pull',
    measurementType: 'bodyweight-added-weight',
    equipment: ['懸垂バー', '追加重量'],
    locations: ['home', 'gym'],
  },
  {
    id: 'assisted-pull-up',
    name: 'アシスト懸垂',
    category: 'pull',
    measurementType: 'assisted-reps',
    equipment: ['補助バンドまたはマシン'],
    locations: ['home', 'gym'],
  },
  {
    id: 'squat',
    name: 'スクワット',
    category: 'legs',
    measurementType: 'weight-reps',
    equipment: ['バーベル'],
    locations: ['gym'],
  },
  {
    id: 'bodyweight-squat',
    name: '自重スクワット',
    category: 'legs',
    measurementType: 'reps',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'bulgarian-split-squat',
    name: 'ブルガリアンスクワット',
    category: 'legs',
    measurementType: 'reps',
    equipment: ['椅子またはベンチ'],
    locations: ['home', 'gym'],
  },
  {
    id: 'lunge',
    name: 'ランジ',
    category: 'legs',
    measurementType: 'reps',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'leg-press',
    name: 'レッグプレス',
    category: 'legs',
    measurementType: 'weight-reps',
    equipment: ['マシン'],
    locations: ['gym'],
  },
  {
    id: 'hip-bridge',
    name: 'ヒップリフト',
    category: 'legs',
    measurementType: 'reps',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'calf-raise',
    name: 'カーフレイズ',
    category: 'legs',
    measurementType: 'reps',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'wall-sit',
    name: 'ウォールシット',
    category: 'legs',
    measurementType: 'duration',
    equipment: ['壁'],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'plank',
    name: 'プランク',
    category: 'core',
    measurementType: 'duration',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'side-plank',
    name: 'サイドプランク',
    category: 'core',
    measurementType: 'duration',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
  {
    id: 'crunch',
    name: 'クランチ',
    category: 'core',
    measurementType: 'reps',
    equipment: [],
    locations: ['home', 'gym', 'anywhere'],
  },
]

function isExercise(value: unknown): value is Exercise {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false
  }

  const exercise = value as Partial<Exercise>

  return (
    typeof exercise.id === 'string' &&
    typeof exercise.name === 'string' &&
    typeof exercise.category === 'string' &&
    typeof exercise.measurementType === 'string' &&
    Array.isArray(exercise.equipment) &&
    Array.isArray(exercise.locations)
  )
}

export function loadExercises(): Exercise[] {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)

    if (!savedData) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_EXERCISES),
      )

      return DEFAULT_EXERCISES
    }

    const parsedData: unknown = JSON.parse(savedData)

    if (!Array.isArray(parsedData)) {
      return DEFAULT_EXERCISES
    }

    const validExercises = parsedData.filter(isExercise)

    if (validExercises.length === 0) {
      return DEFAULT_EXERCISES
    }

    return validExercises
  } catch {
    return DEFAULT_EXERCISES
  }
}

export function saveExercises(
  exercises: Exercise[],
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(exercises),
  )
}

export function findExerciseById(
  exerciseId: string,
): Exercise | undefined {
  return loadExercises().find(
    (exercise) => exercise.id === exerciseId,
  )
}

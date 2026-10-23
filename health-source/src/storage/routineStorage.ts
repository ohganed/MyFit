export type TrainingRoutine = {
  id: string
  name: string
  exerciseNames: string[]
}

const STORAGE_KEY = 'myfit-training-routines'

const DEFAULT_ROUTINES: TrainingRoutine[] = [
  {
    id: 'push',
    name: 'Push',
    exerciseNames: [
      'ベンチプレス',
      'ダンベルプレス',
      'ショルダープレス',
      'サイドレイズ',
      'トライセプスプッシュダウン',
    ],
  },
  {
    id: 'pull',
    name: 'Pull',
    exerciseNames: [
      'デッドリフト',
      'ラットプルダウン',
      'シーテッドロー',
      'ダンベルロー',
      'アームカール',
    ],
  },
  {
    id: 'legs',
    name: 'Legs',
    exerciseNames: [
      'スクワット',
      'レッグプレス',
      'ブルガリアンスクワット',
      'レッグカール',
      'カーフレイズ',
    ],
  },
]

export function loadTrainingRoutines(): TrainingRoutine[] {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)

    if (!savedData) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_ROUTINES),
      )

      return DEFAULT_ROUTINES
    }

    const parsedData: unknown = JSON.parse(savedData)

    if (!Array.isArray(parsedData)) {
      return DEFAULT_ROUTINES
    }

    return parsedData as TrainingRoutine[]
  } catch {
    return DEFAULT_ROUTINES
  }
}

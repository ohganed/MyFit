import type { MuscleRole } from './anatomy'
import { muscles } from './anatomy'

export type ExerciseCategory =
  | 'strength'
  | 'stability'
  | 'control'
  | 'mobility'

export interface ExerciseMuscle {
  muscleId: string
  role: MuscleRole
}

export interface BodyweightExercise {
  id: string
  nameJa: string
  nameEn: string
  category: ExerciseCategory
  muscleLinks: ExerciseMuscle[]
}

const P = (muscleId: string): ExerciseMuscle => ({
  muscleId,
  role: 'prime-mover',
})

const S = (muscleId: string): ExerciseMuscle => ({
  muscleId,
  role: 'synergist',
})

const T = (muscleId: string): ExerciseMuscle => ({
  muscleId,
  role: 'stabilizer',
})

const C = (muscleId: string): ExerciseMuscle => ({
  muscleId,
  role: 'controller',
})

/**
 * Standard-form movement estimates.
 * Roles may change with technique and movement phase.
 * These links do not represent measured muscle activation.
 */
export const bodyweightExercises: BodyweightExercise[] = [
  {
    id: 'squat',
    nameJa: 'スクワット',
    nameEn: 'Squat',
    category: 'strength',
    muscleLinks: [
      P('gluteus-maximus'),
      P('vastus-lateralis'),
      P('vastus-medialis'),
      P('vastus-intermedius'),
      S('adductor-magnus'),
      T('erector-spinae'),
    ],
  },
  {
    id: 'split-squat',
    nameJa: 'スプリットスクワット',
    nameEn: 'Split Squat',
    category: 'strength',
    muscleLinks: [
      P('gluteus-maximus'),
      P('vastus-lateralis'),
      P('vastus-medialis'),
      T('gluteus-medius'),
    ],
  },
  {
    id: 'reverse-lunge',
    nameJa: 'リバースランジ',
    nameEn: 'Reverse Lunge',
    category: 'strength',
    muscleLinks: [
      P('gluteus-maximus'),
      P('vastus-lateralis'),
      S('adductor-magnus'),
      T('gluteus-medius'),
    ],
  },
  {
    id: 'hip-hinge',
    nameJa: 'ヒップヒンジ',
    nameEn: 'Hip Hinge',
    category: 'control',
    muscleLinks: [
      P('gluteus-maximus'),
      P('biceps-femoris-long-head'),
      P('semitendinosus'),
      S('semimembranosus'),
      T('erector-spinae'),
    ],
  },
  {
    id: 'glute-bridge',
    nameJa: 'グルートブリッジ',
    nameEn: 'Glute Bridge',
    category: 'strength',
    muscleLinks: [
      P('gluteus-maximus'),
      S('biceps-femoris-long-head'),
      T('transversus-abdominis'),
    ],
  },
  {
    id: 'push-up',
    nameJa: '腕立て伏せ',
    nameEn: 'Push-up',
    category: 'strength',
    muscleLinks: [
      P('pectoralis-major'),
      P('triceps-brachii'),
      P('anterior-deltoid'),
      S('serratus-anterior'),
      T('rectus-abdominis'),
      T('transversus-abdominis'),
    ],
  },
  {
    id: 'wall-push-up',
    nameJa: '壁腕立て伏せ',
    nameEn: 'Wall Push-up',
    category: 'strength',
    muscleLinks: [
      P('pectoralis-major'),
      P('triceps-brachii'),
      P('anterior-deltoid'),
      S('serratus-anterior'),
    ],
  },
  {
    id: 'pike-push-up',
    nameJa: 'パイクプッシュアップ',
    nameEn: 'Pike Push-up',
    category: 'strength',
    muscleLinks: [
      P('anterior-deltoid'),
      P('triceps-brachii'),
      S('upper-trapezius'),
      S('serratus-anterior'),
    ],
  },
  {
    id: 'scapular-push-up',
    nameJa: '肩甲骨プッシュアップ',
    nameEn: 'Scapular Push-up',
    category: 'control',
    muscleLinks: [
      P('serratus-anterior'),
      T('triceps-brachii'),
      T('transversus-abdominis'),
    ],
  },
  {
    id: 'wall-slide',
    nameJa: 'ウォールスライド',
    nameEn: 'Wall Slide',
    category: 'mobility',
    muscleLinks: [
      C('serratus-anterior'),
      C('lower-trapezius'),
      S('upper-trapezius'),
    ],
  },
  {
    id: 'plank',
    nameJa: 'プランク',
    nameEn: 'Plank',
    category: 'stability',
    muscleLinks: [
      T('rectus-abdominis'),
      T('transversus-abdominis'),
      T('external-oblique'),
      T('gluteus-maximus'),
    ],
  },
  {
    id: 'side-plank',
    nameJa: 'サイドプランク',
    nameEn: 'Side Plank',
    category: 'stability',
    muscleLinks: [
      T('external-oblique'),
      T('internal-oblique'),
      T('quadratus-lumborum'),
      T('gluteus-medius'),
    ],
  },
  {
    id: 'dead-bug',
    nameJa: 'デッドバグ',
    nameEn: 'Dead Bug',
    category: 'control',
    muscleLinks: [
      C('transversus-abdominis'),
      C('rectus-abdominis'),
      T('internal-oblique'),
    ],
  },
  {
    id: 'bird-dog',
    nameJa: 'バードドッグ',
    nameEn: 'Bird Dog',
    category: 'control',
    muscleLinks: [
      C('multifidus'),
      T('erector-spinae'),
      T('gluteus-maximus'),
      T('transversus-abdominis'),
    ],
  },
  {
    id: 'reverse-plank',
    nameJa: 'リバースプランク',
    nameEn: 'Reverse Plank',
    category: 'stability',
    muscleLinks: [
      T('gluteus-maximus'),
      T('erector-spinae'),
      T('posterior-deltoid'),
      T('triceps-brachii'),
    ],
  },
  {
    id: 'single-leg-stand',
    nameJa: '片脚立ち',
    nameEn: 'Single-leg Stand',
    category: 'stability',
    muscleLinks: [
      T('gluteus-medius'),
      T('gluteus-minimus'),
      C('tibialis-posterior'),
      C('fibularis-longus'),
    ],
  },
  {
    id: 'clamshell',
    nameJa: 'クラムシェル',
    nameEn: 'Clamshell',
    category: 'strength',
    muscleLinks: [
      P('gluteus-medius'),
      S('gluteus-maximus'),
      S('piriformis'),
    ],
  },
  {
    id: 'side-leg-raise',
    nameJa: '横向き脚上げ',
    nameEn: 'Side Leg Raise',
    category: 'strength',
    muscleLinks: [
      P('gluteus-medius'),
      P('gluteus-minimus'),
      S('tensor-fasciae-latae'),
    ],
  },
  {
    id: 'hip-airplane',
    nameJa: 'ヒップエアプレーン',
    nameEn: 'Hip Airplane',
    category: 'control',
    muscleLinks: [
      C('gluteus-medius'),
      C('gluteus-maximus'),
      T('multifidus'),
      T('quadratus-lumborum'),
    ],
  },
  {
    id: 'calf-raise',
    nameJa: 'カーフレイズ',
    nameEn: 'Calf Raise',
    category: 'strength',
    muscleLinks: [
      P('gastrocnemius'),
      P('soleus'),
      T('tibialis-posterior'),
    ],
  },
  {
    id: 'tibialis-raise',
    nameJa: 'つま先上げ',
    nameEn: 'Tibialis Raise',
    category: 'strength',
    muscleLinks: [
      P('tibialis-anterior'),
      S('extensor-hallucis-longus'),
      S('extensor-digitorum-longus'),
    ],
  },
  {
    id: 'short-foot',
    nameJa: 'ショートフット',
    nameEn: 'Short Foot',
    category: 'control',
    muscleLinks: [
      C('abductor-hallucis'),
      C('flexor-digitorum-brevis'),
      T('quadratus-plantae'),
    ],
  },
  {
    id: 'toe-spreading',
    nameJa: '足指を広げる運動',
    nameEn: 'Toe Spreading',
    category: 'control',
    muscleLinks: [
      C('dorsal-interossei-foot'),
      C('abductor-hallucis'),
      C('abductor-digiti-minimi-foot'),
    ],
  },
  {
    id: 'bear-crawl',
    nameJa: 'ベアクロール',
    nameEn: 'Bear Crawl',
    category: 'control',
    muscleLinks: [
      T('serratus-anterior'),
      T('transversus-abdominis'),
      C('gluteus-maximus'),
      C('anterior-deltoid'),
    ],
  },
  {
    id: 'crab-walk',
    nameJa: 'クラブウォーク',
    nameEn: 'Crab Walk',
    category: 'control',
    muscleLinks: [
      T('posterior-deltoid'),
      T('triceps-brachii'),
      C('gluteus-maximus'),
      T('erector-spinae'),
    ],
  },
  {
    id: 'mountain-climber',
    nameJa: 'マウンテンクライマー',
    nameEn: 'Mountain Climber',
    category: 'control',
    muscleLinks: [
      C('psoas-major'),
      C('iliacus'),
      T('rectus-abdominis'),
      T('serratus-anterior'),
    ],
  },
  {
    id: 'thoracic-rotation',
    nameJa: '胸椎回旋',
    nameEn: 'Thoracic Rotation',
    category: 'mobility',
    muscleLinks: [
      C('external-oblique'),
      C('internal-oblique'),
      C('rotatores'),
      C('multifidus'),
    ],
  },
  {
    id: 'y-t-w',
    nameJa: 'Y・T・W運動',
    nameEn: 'Y-T-W',
    category: 'control',
    muscleLinks: [
      C('middle-trapezius'),
      C('lower-trapezius'),
      C('rhomboids'),
      C('infraspinatus'),
    ],
  },
]

export function validateExerciseMuscleLinks(): string[] {
  const knownIds = new Set(muscles.map((muscle) => muscle.id))
  const errors: string[] = []
  const exerciseIds = new Set<string>()

  for (const exercise of bodyweightExercises) {
    if (exerciseIds.has(exercise.id)) {
      errors.push(`Duplicate exercise ID: ${exercise.id}`)
    }
    exerciseIds.add(exercise.id)

    for (const link of exercise.muscleLinks) {
      if (!knownIds.has(link.muscleId)) {
        errors.push(
          `Unknown muscle ID: ${exercise.id} -> ${link.muscleId}`,
        )
      }
    }
  }

  return errors
}

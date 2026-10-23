import { shoulderMuscles } from './anatomy/shoulder'
import { trunkMuscles } from './anatomy/trunk'
import { armHandMuscles } from './anatomy/armHand'
import { hipMuscles } from './anatomy/hip'
import { thighMuscles } from './anatomy/thigh'
import { lowerLegFootMuscles } from './anatomy/lowerLegFoot'

export type BodySide = 'front' | 'back' | 'side' | 'deep'

export type MuscleDepth =
  | 'surface'
  | 'intermediate'
  | 'deep'

export type MuscleRole =
  | 'prime-mover'
  | 'synergist'
  | 'stabilizer'
  | 'controller'

export type BodyRegion =
  | 'neck'
  | 'shoulder'
  | 'chest'
  | 'upper-arm'
  | 'forearm'
  | 'hand'
  | 'upper-back'
  | 'lower-back'
  | 'core'
  | 'hip'
  | 'glute'
  | 'thigh'
  | 'lower-leg'
  | 'foot'

export interface MuscleDefinition {
  id: string
  nameJa: string
  nameEn: string
  regions: BodyRegion[]
  visibleFrom: BodySide[]
  depth: MuscleDepth
  laterality: 'left-right' | 'midline'

  discoverable?: boolean
  workoutEstimable?: 'yes' | 'limited' | 'no'

  roles: MuscleRole[]

  functions: string[]
  movements: string[]

  feelIt?: {
    instruction: string
    focus: string
  }
}

export const muscles: MuscleDefinition[] = [
  ...shoulderMuscles,
  ...trunkMuscles,
  ...armHandMuscles,
  ...hipMuscles,
  ...thighMuscles,
  ...lowerLegFootMuscles,
]

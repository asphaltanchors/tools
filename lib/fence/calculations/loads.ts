// ABOUTME: Load calculation engine for fence posts using ASCE 7 standards
// ABOUTME: Computes wind loads, dead loads, and factored combinations

import { FENCE_TYPES, type FenceTypeKey } from "../fence-types"
import { calculateWindLoad, type ExposureCategory } from "../wind"

export interface LoadCalculationInput {
  fenceType: FenceTypeKey
  fenceHeight: number
  postSpacing: number
  windSpeed: number
  exposureCategory: ExposureCategory
}

export interface LoadCalculationResult {
  windLoad: number
  deadLoad: number
  totalLoad: number
  velocityPressure: number
  windMoment: number
  factoredWindMoment: number
}

export const computeLoadsForPost = ({
  fenceType,
  fenceHeight,
  postSpacing,
  windSpeed,
  exposureCategory,
}: LoadCalculationInput): LoadCalculationResult => {
  const fence = FENCE_TYPES[fenceType]
  if (!fence) {
    throw new Error(`Unknown fence type: ${fenceType}`)
  }

  const { velocityPressure, appliedLoad } = calculateWindLoad({
    windSpeed,
    exposureCategory,
    height: fenceHeight,
    width: postSpacing,
    shapeCoefficient: fence.windCoeff,
  })

  const deadLoad = fence.deadLoad * fenceHeight * (postSpacing / 8)
  const windLoad = appliedLoad
  const totalLoad = 1.2 * deadLoad + 1.6 * windLoad

  const leverArmFt = fenceHeight / 2
  const windMoment = windLoad * leverArmFt * 12 // lb-in
  const factoredWindMoment = 1.6 * windMoment

  return { windLoad, deadLoad, totalLoad, velocityPressure, windMoment, factoredWindMoment }
}

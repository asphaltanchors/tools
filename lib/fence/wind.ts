// ABOUTME: Wind load calculation utilities and exposure category definitions
// ABOUTME: Implements ASCE 7 wind load standards with exposure factors

export const WIND_LOAD_FACTORS = {
  residential: 0.85,
  commercial: 1.0,
  industrial: 1.15,
  coastal: 1.15,
} as const

export type ExposureCategory = keyof typeof WIND_LOAD_FACTORS

interface WindLoadInput {
  windSpeed: number
  exposureCategory: ExposureCategory
  height: number
  width: number
  shapeCoefficient: number
}

export interface WindLoadResult {
  velocityPressure: number
  appliedLoad: number
}

export const calculateWindLoad = ({
  windSpeed,
  exposureCategory,
  height,
  width,
  shapeCoefficient,
}: WindLoadInput): WindLoadResult => {
  const exposureFactor = WIND_LOAD_FACTORS[exposureCategory]
  const velocityPressure = 0.00256 * exposureFactor * Math.pow(windSpeed, 2)
  const appliedLoad = velocityPressure * shapeCoefficient * height * width

  return { velocityPressure, appliedLoad }
}

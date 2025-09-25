// ABOUTME: Safety factor evaluation and rating assignment functions
// ABOUTME: Converts numeric safety factors to qualitative ratings

import type { SafetyRating } from "./types"

export const getSafetyRating = (safetyFactor: number): SafetyRating => {
  if (safetyFactor < 1.5) return "inadequate"
  if (safetyFactor < 2) return "adequate"
  if (safetyFactor < 3) return "good"
  return "excellent"
}

// ABOUTME: Mathematical utility functions for fence calculations
// ABOUTME: Provides clamping, rounding, and other numeric operations

export const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min
  if (value > max) return max
  return value
}

export const roundTo = (value: number, decimals = 2): number => {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

// ABOUTME: Input validation and parsing utilities for fence calculator forms
// ABOUTME: Handles form state management and input validation logic

import type { AdhesiveType } from "../adhesives"
import type { ExposureCategory } from "../wind"
import type { FenceTypeKey } from "../fence-types"

export interface FenceCalculatorFormState {
  fenceHeight: string
  postSpacing: string
  fenceType: string
  windSpeed: string
  exposureCategory: string
  adhesiveType: string
  basePlateLength: string
  basePlateWidth: string
  holeInsetFromEdge: string
}

export interface ParsedFenceCalculatorInputs {
  fenceHeight: number
  postSpacing: number
  windSpeed: number
  basePlateLength: number
  basePlateWidth: number
  holeInset: number
  fenceType: FenceTypeKey
  exposureCategory: ExposureCategory
  adhesiveType: AdhesiveType | string
}

export interface ValidationError {
  field: keyof FenceCalculatorFormState | "form"
  message: string
}

const withinRange = (value: number, min: number, max: number): boolean => value >= min && value <= max

export const parseFenceInputs = (
  inputs: FenceCalculatorFormState,
): { parsed?: ParsedFenceCalculatorInputs; errors: ValidationError[] } => {
  const errors: ValidationError[] = []

  const fenceHeight = Number.parseFloat(inputs.fenceHeight)
  const postSpacing = Number.parseFloat(inputs.postSpacing)
  const windSpeed = Number.parseFloat(inputs.windSpeed)
  const basePlateLength = Number.parseFloat(inputs.basePlateLength)
  const basePlateWidth = Number.parseFloat(inputs.basePlateWidth)
  const holeInset = Number.parseFloat(inputs.holeInsetFromEdge)

  const requiredFields: Array<keyof FenceCalculatorFormState> = [
    "fenceType",
    "adhesiveType",
    "fenceHeight",
    "postSpacing",
    "windSpeed",
    "exposureCategory",
    "basePlateLength",
    "basePlateWidth",
    "holeInsetFromEdge",
  ]

  requiredFields.forEach((field) => {
    if (!inputs[field]) {
      errors.push({ field, message: "This field is required." })
    }
  })

  if (!Number.isFinite(fenceHeight) || fenceHeight <= 0) {
    errors.push({ field: "fenceHeight", message: "Fence height must be a positive number." })
  }

  if (!Number.isFinite(postSpacing) || postSpacing <= 0) {
    errors.push({ field: "postSpacing", message: "Post spacing must be a positive number." })
  }

  if (!Number.isFinite(windSpeed) || windSpeed <= 0) {
    errors.push({ field: "windSpeed", message: "Wind speed must be a positive number." })
  }

  if (!Number.isFinite(basePlateLength) || basePlateLength <= 0) {
    errors.push({ field: "basePlateLength", message: "Baseplate length must be a positive number." })
  }

  if (!Number.isFinite(basePlateWidth) || basePlateWidth <= 0) {
    errors.push({ field: "basePlateWidth", message: "Baseplate width must be a positive number." })
  }

  if (!Number.isFinite(holeInset) || holeInset <= 0) {
    errors.push({ field: "holeInsetFromEdge", message: "Hole inset must be a positive number." })
  }

  if (errors.length === 0) {
    if (!withinRange(fenceHeight, 3, 20)) {
      errors.push({ field: "fenceHeight", message: "Fence height must be between 3 and 20 feet." })
    }
    if (!withinRange(postSpacing, 4, 12)) {
      errors.push({ field: "postSpacing", message: "Post spacing must be between 4 and 12 feet." })
    }
    if (!withinRange(windSpeed, 70, 200)) {
      errors.push({ field: "windSpeed", message: "Wind speed must be between 70 and 200 mph." })
    }
    if (!withinRange(basePlateLength, 4, 24)) {
      errors.push({ field: "basePlateLength", message: "Baseplate length must be between 4 and 24 inches." })
    }
    if (!withinRange(basePlateWidth, 4, 24)) {
      errors.push({ field: "basePlateWidth", message: "Baseplate width must be between 4 and 24 inches." })
    }

    const maxInset = Math.min(basePlateLength, basePlateWidth) / 2
    if (!withinRange(holeInset, 0.5, maxInset)) {
      errors.push({
        field: "holeInsetFromEdge",
        message: `Hole inset must be between 0.5 and ${maxInset.toFixed(2)} inches.`,
      })
    }
  }

  if (errors.length > 0) {
    return { errors }
  }

  return {
    errors,
    parsed: {
      fenceHeight,
      postSpacing,
      windSpeed,
      basePlateLength,
      basePlateWidth,
      holeInset,
      fenceType: inputs.fenceType as FenceTypeKey,
      exposureCategory: inputs.exposureCategory as ExposureCategory,
      adhesiveType: inputs.adhesiveType,
    },
  }
}

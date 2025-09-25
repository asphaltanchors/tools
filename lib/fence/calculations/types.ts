// ABOUTME: Type definitions for fence calculation results and safety ratings
// ABOUTME: Defines interfaces for calculation outputs and baseplate specifications

import type { AnchorType } from "../anchors"

export type SafetyRating = "inadequate" | "adequate" | "good" | "excellent"

export interface BasePlateSummary {
  anchors: number
  sizeLabel: string
  holeSpacing: number
  edgeDistance: number
  minAnchor?: AnchorType
}

export interface CalculationResult {
  anchorType: AnchorType
  quantity: number
  anchorsPerPost: number
  totalPosts: number
  safetyFactor: number
  windLoad: number
  deadLoad: number
  totalLoad: number
  isAdequate: boolean
  safetyRating: SafetyRating
  basePlateInfo: BasePlateSummary
  price?: number
  groupEfficiency: number
  groupNotes: string[]
  maxAnchorDemand: number
  governingAngle: number
  activeAnchors: number
  effectiveAnchors: number
}

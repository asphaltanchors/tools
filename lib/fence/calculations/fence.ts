// ABOUTME: Main fence anchor calculation engine combining all analysis components
// ABOUTME: Orchestrates load calculations, group effects, and safety evaluations

import { ANCHOR_CAPACITIES, type AnchorType } from "../anchors"
import { getAdhesiveFactor } from "../adhesives"
import { getHoleLayout } from "../baseplates"
import type { ParsedFenceCalculatorInputs } from "./input"
import { analyseAnchorGroup, describeGroupNotes } from "./group-effects"
import { computeLoadsForPost } from "./loads"
import { getSafetyRating } from "./safety"
import type { CalculationResult } from "./types"

interface CalculationOptions {
  anchorCounts?: number[]
  minimumSafetyFactor?: number
}

const DEFAULT_ANCHOR_COUNTS = [2, 4]
const DEFAULT_MIN_SAFETY_FACTOR = 1.5

export const calculateFenceAnchors = (
  inputs: ParsedFenceCalculatorInputs,
  options: CalculationOptions = {},
): CalculationResult[] => {
  const anchorCounts = options.anchorCounts ?? DEFAULT_ANCHOR_COUNTS
  const minSafetyFactor = options.minimumSafetyFactor ?? DEFAULT_MIN_SAFETY_FACTOR

  const loads = computeLoadsForPost({
    fenceType: inputs.fenceType,
    fenceHeight: inputs.fenceHeight,
    postSpacing: inputs.postSpacing,
    windSpeed: inputs.windSpeed,
    exposureCategory: inputs.exposureCategory,
  })

  const adhesiveFactor = getAdhesiveFactor(inputs.adhesiveType)
  const holeLayout = getHoleLayout({
    basePlateLength: inputs.basePlateLength,
    basePlateWidth: inputs.basePlateWidth,
    holeInset: inputs.holeInset,
  })

  const results: CalculationResult[] = []

  Object.entries(ANCHOR_CAPACITIES).forEach(([type, capacity]) => {
    const anchorType = type as AnchorType
    const upratedPullout = capacity.pullout * adhesiveFactor

    anchorCounts.forEach((anchorCount) => {
      const analysis = analyseAnchorGroup({
        anchorCount,
        spacingX: holeLayout.spacingX,
        spacingY: holeLayout.spacingY,
        embedment: capacity.embedment,
        factoredMoment: loads.factoredWindMoment,
      })

      if (analysis.efficiency <= 0) {
        return
      }

      const capacityPerAnchor = upratedPullout * analysis.efficiency
      const effectiveAnchors = Math.max(analysis.activeAnchors, 1)
      const totalCapacity = capacityPerAnchor * effectiveAnchors
      const safetyFactor = loads.totalLoad > 0 ? totalCapacity / loads.totalLoad : Number.POSITIVE_INFINITY

      const isAdequate = safetyFactor >= minSafetyFactor
      const notes = describeGroupNotes(anchorType, analysis)

      results.push({
        anchorType,
        quantity: anchorCount,
        anchorsPerPost: anchorCount,
        totalPosts: 1,
        safetyFactor,
        windLoad: loads.windLoad,
        deadLoad: loads.deadLoad,
        totalLoad: loads.totalLoad,
        isAdequate,
        safetyRating: getSafetyRating(safetyFactor),
        basePlateInfo: {
          anchors: anchorCount,
          sizeLabel: `${inputs.basePlateLength}"×${inputs.basePlateWidth}"`,
          holeSpacing: analysis.governingSpacing,
          edgeDistance: Math.min(holeLayout.edgeDistanceX, holeLayout.edgeDistanceY),
        },
        groupEfficiency: analysis.efficiency,
        groupNotes: notes,
        maxAnchorDemand: analysis.maxTension,
        governingAngle: analysis.governingAngle,
        activeAnchors: analysis.activeAnchors,
        effectiveAnchors,
      })
    })
  })

  return results.sort((a, b) => b.safetyFactor - a.safetyFactor)
}

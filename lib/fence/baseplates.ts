// ABOUTME: Baseplate configuration utilities and hole layout calculations
// ABOUTME: Manages anchor hole spacing and edge distance calculations

import type { AnchorType } from "./anchors"

export interface BasePlateConfiguration {
  size: string
  anchors: number
  holeSpacing: number
  minAnchor: AnchorType
}

export const BASEPLATE_CONFIGS: Record<"small" | "medium" | "large" | "heavy", BasePlateConfiguration> = {
  small: { size: '6"x6"', anchors: 2, holeSpacing: 4, minAnchor: "SP10" },
  medium: { size: '8"x8"', anchors: 4, holeSpacing: 5.5, minAnchor: "SP12" },
  large: { size: '10"x10"', anchors: 4, holeSpacing: 7, minAnchor: "SP12" },
  heavy: { size: '12"x12"', anchors: 4, holeSpacing: 8.5, minAnchor: "SP18" },
}

export interface HoleLayoutInput {
  basePlateLength: number
  basePlateWidth: number
  holeInset: number
}

export interface HoleLayout {
  spacingX: number
  spacingY: number
  edgeDistanceX: number
  edgeDistanceY: number
}

export const getHoleLayout = ({ basePlateLength, basePlateWidth, holeInset }: HoleLayoutInput): HoleLayout => {
  const spacingX = basePlateLength - 2 * holeInset
  const spacingY = basePlateWidth - 2 * holeInset

  return {
    spacingX,
    spacingY,
    edgeDistanceX: holeInset,
    edgeDistanceY: holeInset,
  }
}

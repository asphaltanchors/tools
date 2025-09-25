// ABOUTME: Advanced anchor group analysis with spacing efficiency calculations
// ABOUTME: Implements group interaction effects and wind directionality analysis

import type { AnchorType } from "../anchors"

export interface GroupAnalysisInput {
  anchorCount: number
  spacingX: number
  spacingY: number
  embedment: number
  factoredMoment: number
  uplift?: number
  anglesDeg?: number[]
}

export interface GroupAnalysisResult {
  efficiency: number
  governingSpacing: number
  governingAngle: number
  tensions: number[]
  maxTension: number
  activeAnchors: number
  notes: string[]
}

interface Vec2 {
  x: number
  y: number
}

const DEFAULT_ANGLES = [0, 45, 90]
const TOLERANCE = 1e-6

const toRadians = (deg: number): number => (deg * Math.PI) / 180

const rotateMoment = (Mx: number, My: number, angleDeg: number): { Mx: number; My: number } => {
  if (angleDeg === 0) return { Mx, My }
  const theta = toRadians(angleDeg)
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  return {
    Mx: cos * Mx - sin * My,
    My: sin * Mx + cos * My,
  }
}

const boltTensions = (coords: Vec2[], U: number, Mx: number, My: number): number[] => {
  const base = U / coords.length
  const sumR2 = coords.reduce((acc, { x, y }) => acc + x * x + y * y, 0) || 1e-6

  return coords.map(({ x, y }) => {
    const tension = base + (Mx * y - My * x) / sumR2
    return tension > TOLERANCE ? tension : 0
  })
}

const minActiveSpacing = (coords: Vec2[], tensions: number[]): number => {
  const active = tensions
    .map((tension, index) => ({ tension, index }))
    .filter(({ tension }) => tension > TOLERANCE)

  if (active.length <= 1) return Number.POSITIVE_INFINITY

  let minSpacing = Number.POSITIVE_INFINITY

  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const coordA = coords[active[i].index]
      const coordB = coords[active[j].index]
      const spacing = Math.hypot(coordA.x - coordB.x, coordA.y - coordB.y)
      if (spacing < minSpacing) {
        minSpacing = spacing
      }
    }
  }

  return minSpacing
}

const spacingEfficiency = (anchorCount: number, spacing: number, embedment: number): number => {
  const minimumEfficiency = anchorCount === 2 ? 0.5 : 0.4

  if (!Number.isFinite(spacing) || spacing <= 0) return minimumEfficiency

  const minSpacing = 2.5
  const idealSpacing = 11

  if (spacing <= minSpacing) {
    return minimumEfficiency
  }

  const spacingScore = Math.min((spacing - minSpacing) / (idealSpacing - minSpacing), 1)

  const base = anchorCount === 2 ? 0.55 : 0.35
  const spacingContribution = anchorCount === 2 ? 0.45 : 0.55

  const embedFactor = embedment >= 10 ? 1 : embedment >= 8 ? 0.95 : embedment >= 6 ? 0.9 : 0.85

  const efficiency = (base + spacingContribution * spacingScore) * embedFactor

  return Math.min(1, Math.max(minimumEfficiency, efficiency))
}

const generateCoordinates = (anchorCount: number, spacingX: number, spacingY: number): Vec2[] => {
  const halfX = spacingX / 2
  const halfY = spacingY / 2

  if (anchorCount === 2) {
    if (spacingY >= spacingX) {
      return [
        { x: 0, y: halfY },
        { x: 0, y: -halfY },
      ]
    }
    return [
      { x: halfX, y: 0 },
      { x: -halfX, y: 0 },
    ]
  }

  return [
    { x: -halfX, y: -halfY },
    { x: halfX, y: -halfY },
    { x: halfX, y: halfY },
    { x: -halfX, y: halfY },
  ]
}

const determineBaseMoment = (anchorCount: number, spacingX: number, spacingY: number, factoredMoment: number) => {
  if (anchorCount === 2) {
    if (spacingY >= spacingX) {
      return { Mx: factoredMoment, My: 0, orientation: "y" as const }
    }
    return { Mx: 0, My: factoredMoment, orientation: "x" as const }
  }

  return { Mx: factoredMoment, My: 0, orientation: "y" as const }
}

export const analyseAnchorGroup = ({
  anchorCount,
  spacingX,
  spacingY,
  embedment,
  factoredMoment,
  uplift = 0,
  anglesDeg,
}: GroupAnalysisInput): GroupAnalysisResult => {
  const coords = generateCoordinates(anchorCount, spacingX, spacingY)
  const angles = anglesDeg && anglesDeg.length > 0 ? anglesDeg : DEFAULT_ANGLES

  const baseMoment = determineBaseMoment(anchorCount, spacingX, spacingY, factoredMoment)

  let governingSpacing = Number.POSITIVE_INFINITY
  let maxTension = 0
  let governingAngle = 0
  let governingTensions: number[] = []

  const notes: string[] = []

  angles.forEach((angle) => {
    const { Mx, My } = rotateMoment(baseMoment.Mx, baseMoment.My, angle)
    const tensions = boltTensions(coords, uplift, Mx, My)
    const spacing = minActiveSpacing(coords, tensions)
    const localMax = Math.max(...tensions)

    if (localMax > maxTension + TOLERANCE || governingTensions.length === 0) {
      maxTension = localMax
      governingSpacing = spacing
      governingAngle = angle
      governingTensions = tensions
    }
  })

  if (!Number.isFinite(governingSpacing)) {
    governingSpacing = Math.min(spacingX, spacingY)
  }

  const activeAnchors = governingTensions.filter((tension) => tension > TOLERANCE).length
  const efficiency = spacingEfficiency(Math.max(activeAnchors, 2), governingSpacing, embedment)

  if (governingAngle > 0) {
    notes.push(`Worst-case occurs with wind rotated roughly ${governingAngle.toFixed(0)}° to the baseplate.`)
  }
  if (activeAnchors <= 1) {
    notes.push("Moment resolves primarily into a single anchor; treat as a single-anchor check.")
  }

  if (efficiency < 0.95) {
    notes.push("Group interaction reduces effective pull-out; consider larger spacing or embedment.")
  }

  return {
    efficiency,
    governingSpacing,
    governingAngle,
    tensions: governingTensions,
    maxTension,
    activeAnchors,
    notes,
  }
}

export const describeGroupNotes = (
  anchorType: AnchorType,
  analysis: GroupAnalysisResult,
): string[] => {
  const extra: string[] = []
  if (analysis.maxTension <= TOLERANCE) {
    extra.push(`${anchorType} anchors remain in compression under the analysed wind case.`)
  }
  return [...analysis.notes, ...extra]
}

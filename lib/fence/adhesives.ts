// ABOUTME: Adhesive system specifications and uprating factors for anchor calculations
// ABOUTME: Defines EPX2/EPX3 properties and strength multipliers

export type AdhesiveType = "EPX2" | "EPX3"

export interface AdhesiveProperties {
  name: string
  upratingFactor: number
  notes?: string
}

export const ADHESIVE_PROPERTIES: Record<AdhesiveType, AdhesiveProperties> = {
  EPX2: {
    name: "EPX2",
    upratingFactor: 1.0,
    notes: "Standard acrylic grout with baseline performance.",
  },
  EPX3: {
    name: "EPX3",
    upratingFactor: 1.4,
    notes: "High-performance epoxy grout with increased pull-out strength.",
  },
}

export const getAdhesiveFactor = (adhesiveType: AdhesiveType | string): number => {
  const properties = ADHESIVE_PROPERTIES[adhesiveType as AdhesiveType]
  return properties?.upratingFactor ?? 1.0
}

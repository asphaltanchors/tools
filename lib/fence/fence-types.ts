// ABOUTME: Fence type definitions with wind coefficients and presets
// ABOUTME: Contains material properties and common configuration templates

import { BASEPLATE_CONFIGS } from "./baseplates"
import { WIND_LOAD_FACTORS } from "./wind"

export type FenceTypeKey = "chain_link" | "steel_picket" | "aluminum" | "vinyl" | "wood_privacy"

export interface FenceTypeDefinition {
  windCoeff: number
  deadLoad: number
  basePlate: keyof typeof BASEPLATE_CONFIGS
  description: string
}

export const FENCE_TYPES: Record<FenceTypeKey, FenceTypeDefinition> = {
  chain_link: { windCoeff: 0.85, deadLoad: 2.5, basePlate: "small", description: "Chain Link (Cf = 0.85)" },
  steel_picket: { windCoeff: 1.0, deadLoad: 6.0, basePlate: "medium", description: "Steel Picket (Cf = 1.0)" },
  aluminum: { windCoeff: 1.1, deadLoad: 3.5, basePlate: "small", description: "Aluminum (Cf = 1.1)" },
  vinyl: { windCoeff: 1.3, deadLoad: 4.0, basePlate: "small", description: "Vinyl (Cf = 1.3)" },
  wood_privacy: { windCoeff: 1.4, deadLoad: 8.0, basePlate: "medium", description: "Wood Privacy (Cf = 1.4)" },
}

export interface FencePreset {
  name: string
  description: string
  fenceHeight: string
  fenceType: FenceTypeKey
  postSpacing: string
  windSpeed: string
  exposureCategory: keyof typeof WIND_LOAD_FACTORS
  adhesiveType: string
  basePlateLength: string
  basePlateWidth: string
  holeInsetFromEdge: string
}

export const FENCE_PRESETS: Record<string, FencePreset> = {
  residential_privacy: {
    name: "Residential Privacy Fence",
    description: "6ft wood privacy fence, typical suburban installation",
    fenceHeight: "6",
    fenceType: "wood_privacy",
    postSpacing: "8",
    windSpeed: "90",
    exposureCategory: "residential",
    adhesiveType: "EPX2",
    basePlateLength: "8",
    basePlateWidth: "8",
    holeInsetFromEdge: "1.5",
  },
  backyard_chain_link: {
    name: "Backyard Chain Link",
    description: "4ft chain link for pet containment, residential area",
    fenceHeight: "4",
    fenceType: "chain_link",
    postSpacing: "8",
    windSpeed: "85",
    exposureCategory: "residential",
    adhesiveType: "EPX2",
    basePlateLength: "6",
    basePlateWidth: "6",
    holeInsetFromEdge: "1.25",
  },
  commercial_security: {
    name: "Commercial Security Fence",
    description: "8ft chain link with higher wind loads, commercial property",
    fenceHeight: "8",
    fenceType: "chain_link",
    postSpacing: "6",
    windSpeed: "105",
    exposureCategory: "commercial",
    adhesiveType: "EPX3",
    basePlateLength: "10",
    basePlateWidth: "10",
    holeInsetFromEdge: "2",
  },
  pool_safety: {
    name: "Pool Safety Fence",
    description: "4ft aluminum fence around pool area, code compliant",
    fenceHeight: "4",
    fenceType: "aluminum",
    postSpacing: "6",
    windSpeed: "90",
    exposureCategory: "residential",
    adhesiveType: "EPX2",
    basePlateLength: "6",
    basePlateWidth: "6",
    holeInsetFromEdge: "1.25",
  },
  industrial_perimeter: {
    name: "Industrial Perimeter",
    description: "10ft chain link for industrial facility, high wind exposure",
    fenceHeight: "10",
    fenceType: "chain_link",
    postSpacing: "8",
    windSpeed: "120",
    exposureCategory: "industrial",
    adhesiveType: "EPX3",
    basePlateLength: "12",
    basePlateWidth: "12",
    holeInsetFromEdge: "2.5",
  },
  coastal_vinyl: {
    name: "Coastal Vinyl Fence",
    description: "6ft vinyl privacy fence, coastal high-wind area",
    fenceHeight: "6",
    fenceType: "vinyl",
    postSpacing: "6",
    windSpeed: "110",
    exposureCategory: "coastal",
    adhesiveType: "EPX3",
    basePlateLength: "10",
    basePlateWidth: "10",
    holeInsetFromEdge: "2",
  },
}

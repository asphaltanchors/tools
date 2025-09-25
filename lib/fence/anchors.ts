// ABOUTME: Anchor specifications and capacity definitions for fence post calculations
// ABOUTME: Contains SP10, SP12, SP18, SP58 anchor types with pullout/shear ratings

export type AnchorType = "SP10" | "SP12" | "SP18" | "SP58"

export interface AnchorCapacity {
  pullout: number
  shear: number
  name: string
  variantID: string
  embedment: number
}

export const ANCHOR_CAPACITIES: Record<AnchorType, AnchorCapacity> = {
  SP10: {
    pullout: 1500,
    shear: 750,
    name: 'SP10 (3/8" x 6")',
    variantID: "gid://shopify/ProductVariant/50641218535744",
    embedment: 6,
  },
  SP12: {
    pullout: 2000,
    shear: 1000,
    name: 'SP12 (3/8" x 12")',
    variantID: "gid://shopify/ProductVariant/50680137777472",
    embedment: 12,
  },
  SP18: {
    pullout: 2500,
    shear: 1200,
    name: 'SP18 (7/16" x 12")',
    variantID: "gid://shopify/ProductVariant/50673850319168",
    embedment: 12,
  },
  SP58: {
    pullout: 5000,
    shear: 2500,
    name: 'SP58 (5/8" x 10")',
    variantID: "gid://shopify/ProductVariant/50680141054272",
    embedment: 10,
  },
}

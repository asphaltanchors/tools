// ABOUTME: Shopify integration for anchor pricing and cart functionality
// ABOUTME: Handles price fetching and cart URL generation for anchor purchases

import { ANCHOR_CAPACITIES, type AnchorType } from "./anchors"

interface ShopifyPriceNode {
  id: string
  price?: {
    amount: string
  }
}

interface PriceResponse {
  data?: {
    nodes?: ShopifyPriceNode[]
  }
}

export const fetchAnchorPrices = async (): Promise<Record<AnchorType, number>> => {
  const variantIds = Object.values(ANCHOR_CAPACITIES).map((anchor) => anchor.variantID)
  const response = await fetch("/api/price", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantIds }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch prices: ${response.status}`)
  }

  const payload = (await response.json()) as PriceResponse
  const priceMap: Partial<Record<AnchorType, number>> = {}

  payload.data?.nodes?.forEach((node) => {
    if (!node?.price?.amount) return
    const anchorEntry = Object.entries(ANCHOR_CAPACITIES).find(([, anchor]) => anchor.variantID === node.id)
    if (!anchorEntry) return
    const [anchorKey] = anchorEntry
    priceMap[anchorKey as AnchorType] = Number.parseFloat(node.price.amount)
  })

  return priceMap as Record<AnchorType, number>
}

export const buildCartUrl = (anchorType: AnchorType, totalAnchors: number): string => {
  const variantID = ANCHOR_CAPACITIES[anchorType].variantID.split("/").pop()
  const quantity = Math.ceil(totalAnchors / 6)
  return `https://asphaltanchors.com/cart/${variantID}:${quantity}`
}

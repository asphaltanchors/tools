// ABOUTME: Shopify Storefront API integration for anchor pricing
// ABOUTME: Fetches current pricing for anchor variants using GraphQL

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { variantIds } = await req.json()

    if (!variantIds || !Array.isArray(variantIds)) {
      return NextResponse.json({ error: "Invalid variant IDs" }, { status: 400 })
    }

    const query = `
      query GetVariantPrices($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ProductVariant {
            id
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    `

    const response = await fetch(`https://asphaltanchors.myshopify.com/api/2025-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({
        query,
        variables: { ids: variantIds },
      }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Price fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 })
  }
}

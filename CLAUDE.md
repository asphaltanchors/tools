# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **pallet-calc**, an AAC Pallet Calculator - a Next.js 15 application that calculates pallet requirements for shipping different product types. The app uses a technical calculator aesthetic and provides detailed palletization calculations including single-SKU and mixed-SKU modes.

## Development Commands

- **Development server**: `npm run dev` (uses Next.js with Turbopack)
- **Production build**: `npm run build` (uses Next.js with Turbopack)
- **Start production**: `npm start`
- **Linting**: `npm run lint` (ESLint with Next.js configuration)
- **Type checking**: Use `npx tsc --noEmit` for TypeScript validation

## Architecture

### Core Application Structure
- **Next.js App Router**: Uses the `app/` directory with `layout.tsx` and `page.tsx`
- **Single-page application**: All functionality is contained in the main page component
- **Client-side rendering**: Main page uses `"use client"` directive

### Data Models & Business Logic (lib/)
- **`lib/products.ts`**: Product catalog with case dimensions, weights, and pallet constraints
- **`lib/pallets.ts`**: Pallet specifications (GMA 48×40, 48×48) with dimensions and capacity limits
- **`lib/pallet.ts`**: Core palletization algorithm that calculates optimal pallet layouts

### Key Business Logic
The `calculatePalletBreakdown` function in `lib/pallet.ts` is the heart of the application:
- Calculates how products fit on pallets based on case dimensions vs pallet footprint
- Supports both single-SKU pallets and mixed-SKU pallets with partial layer optimization
- Considers height constraints, weight limits, and stacking rules
- Returns detailed breakdown including pallet count, weights, and layer information

### Component Architecture
- **Main calculator interface**: Single large component in `app/page.tsx`
- **UI components**: Uses shadcn/ui components (Select, Button) from `components/ui/`
- **Styling**: Tailwind CSS with technical/industrial design theme using monospace fonts

### State Management
- React `useState` for form state (line items, pallet selection, mixing mode)
- Calculated results are stored in component state and re-computed on demand
- No external state management library - all state is local to the main component

## Development Notes

### Product Data
Products are defined with:
- Case dimensions (length × width × height in inches)
- Case weight in pounds
- Optional manual overrides for cases per layer and max layers
- The algorithm automatically calculates optimal case arrangement on pallet footprint

### Pallet Algorithm
The palletization logic handles:
- **Geometric fitting**: Calculates how many cases fit per layer based on dimensions
- **Height constraints**: Respects maximum load height minus pallet base height
- **Mixed pallets**: When enabled, optimizes partial layers across different products
- **Weight calculation**: Includes product weight + pallet tare weight

### UI/UX Design
- Technical calculator aesthetic with monospace fonts and industrial styling
- Real-time capacity display shows cases/layer, max layers, and total capacity
- Detailed results table with breakdown by product and pallet-by-pallet view
- Form validation ensures at least one product quantity before calculation
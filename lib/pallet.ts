import { PalletSpec } from "./pallets";
import { Product } from "./products";

export type ProductSelectionInput = {
  product: Product;
  quantityCases: number;
};

export type ProductCapacity = {
  casesPerLayer: number;
  maxLayers: number;
  casesPerPallet: number;
  fullPalletHeightIn: number;
};

export type ProductPartialLayer = {
  cases: number;
  heightIn: number;
  palletId: number;
};

export type ProductPalletBreakdown = {
  product: Product;
  casesRequested: number;
  capacity: ProductCapacity;
  palletsInvolved: number;
  fullLayers: number;
  partialLayers: ProductPartialLayer[];
  totalWeightLb: number;
  unallocatedCases: number;
};

export type PalletProductAllocation = {
  product: Product;
  capacity: ProductCapacity;
  fullLayers: number;
  casesFromFullLayers: number;
  partialCases: number;
  partialHeightIn: number | null;
  totalCases: number;
};

export type PalletDetail = {
  id: number;
  heightIn: number;
  totalWeightLb: number;
  totalCases: number;
  products: PalletProductAllocation[];
};

export type PalletizationSummary = {
  totalPallets: number;
  totalWeightLb: number;
  tallestPalletHeightIn: number;
};

const deriveCapacity = (product: Product, pallet: PalletSpec): ProductCapacity => {
  const { caseDimensionsIn } = product;
  const { footprintIn, baseHeightIn, maxLoadHeightIn } = pallet;

  const orientationA =
    Math.floor(footprintIn.length / caseDimensionsIn.length) *
    Math.floor(footprintIn.width / caseDimensionsIn.width);
  const orientationB =
    Math.floor(footprintIn.length / caseDimensionsIn.width) *
    Math.floor(footprintIn.width / caseDimensionsIn.length);
  const geometryCasesPerLayer = Math.max(orientationA, orientationB, 0);
  const manualLimit = product.cartonsPerLayer ?? geometryCasesPerLayer;
  const casesPerLayer = Math.max(
    0,
    Math.min(geometryCasesPerLayer, Math.floor(manualLimit)),
  );

  const maxLayersByHeight = Math.max(
    0,
    Math.floor(
      (maxLoadHeightIn - baseHeightIn) / Math.max(caseDimensionsIn.height, 1),
    ),
  );

  const maxLayers = Math.max(
    0,
    Math.min(
      maxLayersByHeight,
      product.maxLayers ?? maxLayersByHeight,
    ),
  );

  const casesPerPallet = casesPerLayer * maxLayers;
  const fullPalletHeightIn = Math.ceil(
    baseHeightIn + maxLayers * caseDimensionsIn.height,
  );

  return {
    casesPerLayer,
    maxLayers,
    casesPerPallet,
    fullPalletHeightIn,
  };
};

export const getProductCapacity = deriveCapacity;
export const calculatePalletBreakdown = (
  selection: ProductSelectionInput[],
  pallet: PalletSpec,
  options?: {
    allowMixing?: boolean;
  },
): {
  breakdowns: ProductPalletBreakdown[];
  pallets: PalletDetail[];
  summary: PalletizationSummary;
} => {
  const allowMixing = options?.allowMixing ?? false;

  type PalletLoad = {
    id: number;
    height: number;
    weightLb: number;
    perProductLayers: Map<string, number>;
    fullLayerCounts: Map<string, number>;
    partialLayer?: {
      entries: Array<{
        productId: string;
        cases: number;
        casesPerLayer: number;
        caseHeight: number;
      }>;
      usage: number;
      height: number;
    };
  };

  type Allocation = {
    product: Product;
    capacity: ProductCapacity;
    casesRequested: number;
    fullLayersRemaining: number;
    partialCases: number;
    palletsInvolved: Set<number>;
    fullLayersAssigned: number;
    partialAssignments: Array<{ palletId: number; cases: number }>;
    totalWeightLb: number;
    unallocatedCases: number;
  };

  const allocations: Allocation[] = [];
  const allocationByProductId = new Map<string, Allocation>();
  const capacityByProductId = new Map<string, ProductCapacity>();

  for (const { product, quantityCases } of selection) {
    if (quantityCases <= 0) {
      continue;
    }

    const capacity = deriveCapacity(product, pallet);
    const casesPerLayer = capacity.casesPerLayer;
    const fullLayers = casesPerLayer > 0
      ? Math.floor(quantityCases / casesPerLayer)
      : 0;
    const partialCases = casesPerLayer > 0
      ? quantityCases % casesPerLayer
      : quantityCases;

    const allocation: Allocation = {
      product,
      capacity,
      casesRequested: quantityCases,
      fullLayersRemaining: fullLayers,
      partialCases,
      palletsInvolved: new Set<number>(),
      fullLayersAssigned: 0,
      partialAssignments: [],
      totalWeightLb: 0,
      unallocatedCases: 0,
    };

    allocations.push(allocation);
    allocationByProductId.set(product.id, allocation);
    capacityByProductId.set(product.id, capacity);
  }

  if (allocations.length === 0) {
    return {
      breakdowns: [],
      pallets: [],
      summary: { totalPallets: 0, totalWeightLb: 0, tallestPalletHeightIn: 0 },
    };
  }

  const pallets: PalletLoad[] = [];
  let palletIdCounter = 1;

  const createPallet = (): PalletLoad => {
    const palletLoad: PalletLoad = {
      id: palletIdCounter++,
      height: pallet.baseHeightIn,
      weightLb: pallet.tareWeightLb,
      perProductLayers: new Map(),
      fullLayerCounts: new Map(),
    };
    pallets.push(palletLoad);
    return palletLoad;
  };

  const findPalletForFullLayer = (
    allocation: Allocation,
  ): PalletLoad | null => {
    const { product, capacity } = allocation;
    const layerHeight = product.caseDimensionsIn.height;

    let best: { pallet: PalletLoad; remainingHeight: number } | null = null;

    for (const palletLoad of pallets) {
      if (palletLoad.partialLayer) {
        continue;
      }

      if (
        !allowMixing &&
        palletLoad.perProductLayers.size > 0 &&
        !palletLoad.perProductLayers.has(product.id)
      ) {
        continue;
      }

      const productLayers = palletLoad.perProductLayers.get(product.id) ?? 0;
      if (capacity.maxLayers > 0 && productLayers >= capacity.maxLayers) {
        continue;
      }

      const nextHeight = palletLoad.height + layerHeight;
      if (nextHeight > pallet.maxLoadHeightIn) {
        continue;
      }

      const remainingHeight = pallet.maxLoadHeightIn - nextHeight;
      if (!best || remainingHeight < best.remainingHeight) {
        best = { pallet: palletLoad, remainingHeight };
      }
    }

    return best?.pallet ?? null;
  };

  const placeFullLayer = (allocation: Allocation, palletLoad: PalletLoad) => {
    const { product, capacity } = allocation;
    const layerHeight = product.caseDimensionsIn.height;

    palletLoad.height += layerHeight;
    palletLoad.weightLb += capacity.casesPerLayer * product.caseWeightLb;

    const currentLayers = palletLoad.perProductLayers.get(product.id) ?? 0;
    palletLoad.perProductLayers.set(product.id, currentLayers + 1);
    const currentFullLayers = palletLoad.fullLayerCounts.get(product.id) ?? 0;
    palletLoad.fullLayerCounts.set(product.id, currentFullLayers + 1);

    allocation.fullLayersRemaining -= 1;
    allocation.fullLayersAssigned += 1;
    allocation.totalWeightLb += capacity.casesPerLayer * product.caseWeightLb;
    allocation.palletsInvolved.add(palletLoad.id);
  };

  for (const allocation of allocations) {
    const { product, capacity } = allocation;
    const layerHeight = product.caseDimensionsIn.height;

    if (capacity.casesPerLayer <= 0 || capacity.maxLayers <= 0) {
      allocation.unallocatedCases = allocation.casesRequested;
      allocation.fullLayersRemaining = 0;
      allocation.partialCases = 0;
      continue;
    }

    if (pallet.baseHeightIn + layerHeight > pallet.maxLoadHeightIn) {
      allocation.unallocatedCases = allocation.casesRequested;
      allocation.fullLayersRemaining = 0;
      allocation.partialCases = 0;
      continue;
    }

    while (allocation.fullLayersRemaining > 0) {
      const targetPallet = findPalletForFullLayer(allocation);
      const palletLoad = targetPallet ?? createPallet();

      if (!targetPallet && palletLoad.height + layerHeight > pallet.maxLoadHeightIn) {
        allocation.unallocatedCases += capacity.casesPerLayer * allocation.fullLayersRemaining;
        allocation.fullLayersRemaining = 0;
        break;
      }

      placeFullLayer(allocation, palletLoad);
    }
  }

  const tryPlacePartial = (
    allocation: Allocation,
    cases: number,
  ): boolean => {
    const { product, capacity } = allocation;
    const layerHeight = product.caseDimensionsIn.height;
    const caseWeight = product.caseWeightLb;
    const casesPerLayer = capacity.casesPerLayer;

    for (const palletLoad of pallets) {
      const currentLayers = palletLoad.perProductLayers.get(product.id) ?? 0;
      if (capacity.maxLayers > 0 && currentLayers >= capacity.maxLayers) {
        continue;
      }

      if (
        !allowMixing &&
        palletLoad.perProductLayers.size > 0 &&
        !palletLoad.perProductLayers.has(product.id)
      ) {
        continue;
      }

      if (!palletLoad.partialLayer) {
        const nextHeight = palletLoad.height + layerHeight;
        if (nextHeight > pallet.maxLoadHeightIn) {
          continue;
        }

        palletLoad.partialLayer = {
          entries: [
            {
              productId: product.id,
              cases,
              casesPerLayer,
              caseHeight: layerHeight,
            },
          ],
          usage: casesPerLayer > 0 ? cases / casesPerLayer : 1,
          height: layerHeight,
        };
        palletLoad.height = nextHeight;
        palletLoad.weightLb += cases * caseWeight;
        palletLoad.perProductLayers.set(product.id, currentLayers + 1);

        allocation.partialAssignments.push({ palletId: palletLoad.id, cases });
        allocation.totalWeightLb += cases * caseWeight;
        allocation.palletsInvolved.add(palletLoad.id);
        return true;
      }

      const partial = palletLoad.partialLayer;
      if (partial.entries.some((entry) => entry.productId === product.id)) {
        continue;
      }

      if (!allowMixing) {
        continue;
      }

      const nextUsage = casesPerLayer > 0
        ? partial.usage + cases / casesPerLayer
        : partial.usage + 1;
      if (nextUsage > 1 + 1e-6) {
        continue;
      }

      const currentPartialHeight = partial.height;
      const newPartialHeight = Math.max(currentPartialHeight, layerHeight);
      const heightWithoutPartial = palletLoad.height - currentPartialHeight;
      const prospectiveHeight = heightWithoutPartial + newPartialHeight;
      if (prospectiveHeight > pallet.maxLoadHeightIn) {
        continue;
      }

      partial.entries.push({
        productId: product.id,
        cases,
        casesPerLayer,
        caseHeight: layerHeight,
      });
      partial.usage = nextUsage;
      partial.height = newPartialHeight;
      palletLoad.height = prospectiveHeight;
      palletLoad.weightLb += cases * caseWeight;
      palletLoad.perProductLayers.set(product.id, currentLayers + 1);

      allocation.partialAssignments.push({ palletId: palletLoad.id, cases });
      allocation.totalWeightLb += cases * caseWeight;
      allocation.palletsInvolved.add(palletLoad.id);
      return true;
    }

    return false;
  };

  for (const allocation of allocations) {
    const { capacity, partialCases, product } = allocation;
    if (partialCases <= 0) {
      continue;
    }

    if (capacity.casesPerLayer <= 0 || capacity.maxLayers <= 0) {
      allocation.unallocatedCases += partialCases;
      continue;
    }

    if (pallet.baseHeightIn + product.caseDimensionsIn.height > pallet.maxLoadHeightIn) {
      allocation.unallocatedCases += partialCases;
      continue;
    }

    const placed = tryPlacePartial(allocation, partialCases);
    if (!placed) {
      const newPallet = createPallet();
      if (newPallet.height + product.caseDimensionsIn.height > pallet.maxLoadHeightIn) {
        allocation.unallocatedCases += partialCases;
        continue;
      }

      const success = tryPlacePartial(allocation, partialCases);
      if (!success) {
        allocation.unallocatedCases += partialCases;
      }
    }
  }

  const palletDetails: PalletDetail[] = pallets.map((palletLoad) => {
    const productIds = new Set<string>();
    for (const productId of palletLoad.perProductLayers.keys()) {
      productIds.add(productId);
    }
    if (palletLoad.partialLayer) {
      for (const entry of palletLoad.partialLayer.entries) {
        productIds.add(entry.productId);
      }
    }

    const products: PalletProductAllocation[] = Array.from(productIds)
      .map((productId) => {
        const allocation = allocationByProductId.get(productId);
        if (!allocation) {
          return null;
        }
        const capacity = capacityByProductId.get(productId) ?? allocation.capacity;
        const fullLayers = palletLoad.fullLayerCounts.get(productId) ?? 0;
        const casesFromFullLayers = fullLayers * capacity.casesPerLayer;

        const partialEntry = palletLoad.partialLayer?.entries.find(
          (entry) => entry.productId === productId,
        );
        const partialCases = partialEntry?.cases ?? 0;
        const partialHeightIn = partialEntry
          ? Math.ceil(palletLoad.partialLayer?.height ?? 0)
          : null;
        const totalCases = casesFromFullLayers + partialCases;

        if (totalCases === 0) {
          return null;
        }

        return {
          product: allocation.product,
          capacity,
          fullLayers,
          casesFromFullLayers,
          partialCases,
          partialHeightIn,
          totalCases,
        } satisfies PalletProductAllocation;
      })
      .filter((entry): entry is PalletProductAllocation => Boolean(entry));

    const totalCases = products.reduce((acc, entry) => acc + entry.totalCases, 0);

    return {
      id: palletLoad.id,
      heightIn: Math.ceil(palletLoad.height),
      totalWeightLb: palletLoad.weightLb,
      totalCases,
      products,
    } satisfies PalletDetail;
  });

  const partialLayersByProduct = new Map<string, ProductPartialLayer[]>();
  for (const palletLoad of pallets) {
    if (!palletLoad.partialLayer) {
      continue;
    }

    for (const entry of palletLoad.partialLayer.entries) {
      if (!partialLayersByProduct.has(entry.productId)) {
        partialLayersByProduct.set(entry.productId, []);
      }
      partialLayersByProduct.get(entry.productId)?.push({
        cases: entry.cases,
        heightIn: Math.ceil(palletLoad.partialLayer.height),
        palletId: palletLoad.id,
      });
    }
  }

  const breakdowns: ProductPalletBreakdown[] = allocations.map((allocation) => {
    const { capacity } = allocation;
    const totalAssignedCases =
      allocation.fullLayersAssigned * capacity.casesPerLayer +
      allocation.partialAssignments.reduce((acc, item) => acc + item.cases, 0);
    const unallocated = Math.max(
      0,
      allocation.casesRequested - totalAssignedCases,
    );
    allocation.unallocatedCases = Math.max(
      allocation.unallocatedCases,
      unallocated,
    );

    const partialLayers = partialLayersByProduct.get(allocation.product.id) ?? [];

    return {
      product: allocation.product,
      casesRequested: allocation.casesRequested,
      capacity,
      palletsInvolved: allocation.palletsInvolved.size,
      fullLayers: allocation.fullLayersAssigned,
      partialLayers,
      totalWeightLb: allocation.totalWeightLb,
      unallocatedCases: allocation.unallocatedCases,
    } satisfies ProductPalletBreakdown;
  });

  const totalPallets = palletDetails.length;
  const totalWeightLb = palletDetails.reduce((acc, load) => acc + load.totalWeightLb, 0);
  const tallestPalletHeightIn = palletDetails.reduce(
    (acc, load) => Math.max(acc, load.heightIn),
    0,
  );

  return {
    breakdowns,
    pallets: palletDetails,
    summary: {
      totalPallets,
      totalWeightLb,
      tallestPalletHeightIn,
    },
  };
};

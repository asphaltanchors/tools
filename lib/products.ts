export type Product = {
  id: string;
  name: string;
  sku: string;
  caseWeightLb: number;
  caseDimensionsIn: {
    length: number;
    width: number;
    height: number;
  };
  cartonsPerLayer?: number;
  maxLayers?: number;
  notes?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "sp10",
    name: "Asphalt Anchors SP10",
    sku: "SP10L",
    caseWeightLb: 18.37,
    caseDimensionsIn: { length: 13.4, width: 8.3, height: 8 },
    cartonsPerLayer: 15,
    maxLayers: 7,
  },
  {
    id: "sp12",
    name: "Asphalt Anchors SP12",
    sku: "SP12L",
    caseWeightLb: 30.58,
    caseDimensionsIn: { length: 14.4, width: 13.4, height: 8 },
    cartonsPerLayer: 9,
    maxLayers: 7,
  },
  {
    id: "sp18",
    name: "Asphalt Anchors SP18",
    sku: "SP18L",
    caseWeightLb: 35.42,
    caseDimensionsIn: { length: 14.6, width: 14, height: 8.3 },
    cartonsPerLayer: 9,
    maxLayers: 7,
  },
  {
    id: "sp58",
    name: "Asphalt Anchors SP58",
    sku: "SP58L",
    caseWeightLb: 38.5,
    caseDimensionsIn: { length: 15.7, width: 13, height: 7.9 },
    cartonsPerLayer: 100,
    maxLayers: 100,
  },
  {
    id: "ak4",
    name: "Asphalt Anchors AK-4",
    sku: "AK4",
    caseWeightLb: 48,
    caseDimensionsIn: { length: 18, width: 17, height: 14 },
    cartonsPerLayer: 4,
    maxLayers: 7,
  },
  {
    id: "eak4",
    name: "Asphalt Anchors eAK-4",
    sku: "eAK4",
    caseWeightLb: 50,
    caseDimensionsIn: { length: 18, width: 14, height: 12 },
    cartonsPerLayer: 6,
    maxLayers: 7,
  },
  {
    id: "epx2t",
    name: "EPX2 10lb Tub",
    sku: "epx2-tub",
    caseWeightLb: 44,
    caseDimensionsIn: { length: 17, width: 17, height: 6 },
    cartonsPerLayer: 100,
    maxLayers: 100,
  },
];

export const DEFAULT_PRODUCT_ID = PRODUCTS[0]?.id ?? "";

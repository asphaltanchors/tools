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
  // cartonsPerLayer?: number;
  // maxLayers?: number;
  notes?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "sp10l",
    name: "SP10 Case",
    sku: "01-6310.72L",
    caseWeightLb: 17,
    caseDimensionsIn: { length: 13.4, width: 8.26, height: 8 },
    // cartonsPerLayer: 15,
    // maxLayers: 99,
  },
  {
    id: "sp12l",
    name: "SP12 Case",
    sku: "01-6315.???",
    caseWeightLb: 30.2,
    caseDimensionsIn: { length: 14.4, width: 13.4, height: 8 },
    // cartonsPerLayer: 9,
    // maxLayers: 7,
  },
  {
    id: "sp18",
    name: "SP18",
    sku: "01-6318.???",
    caseWeightLb: 38.6,
    caseDimensionsIn: { length: 14.6, width: 14, height: 8.3 },
    // cartonsPerLayer: 9,
    // maxLayers: 7,
  },
  {
    id: "sp58",
    name: "SP58",
    sku: "01-6358.???",
    caseWeightLb: 41.1,
    caseDimensionsIn: { length: 15.7, width: 13, height: 7.9 },
    // cartonsPerLayer: 100,
    // maxLayers: 100,
  },
  {
    id: "ak4",
    name: "AK-4",
    sku: "AK4",
    caseWeightLb: 48,
    caseDimensionsIn: { length: 18, width: 17, height: 14 },
    // cartonsPerLayer: 4,
    // maxLayers: 7,
  },
  {
    id: "eak4",
    name: "eAK-4",
    sku: "eAK4",
    caseWeightLb: 50,
    caseDimensionsIn: { length: 18, width: 14, height: 12 },
    // cartonsPerLayer: 6,
    // maxLayers: 7,
  },
  {
    id: "epx2t",
    name: "EPX2 10lb Tub",
    sku: "epx2-tub",
    caseWeightLb: 44,
    caseDimensionsIn: { length: 17, width: 17, height: 6 },
    // cartonsPerLayer: 100,
    // maxLayers: 100,
  },
];

export const DEFAULT_PRODUCT_ID = PRODUCTS[0]?.id ?? "";

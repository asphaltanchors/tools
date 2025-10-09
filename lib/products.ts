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
  // {
  //   id: "sp10l",
  //   name: "SP10 Case",
  //   sku: "01-6310.72L",
  //   caseWeightLb: 17,
  //   caseDimensionsIn: { length: 13.4, width: 8.26, height: 8 },
  // },
  {
    id: "sp10k",
    name: "SP10 Case 9 6-Packs",
    sku: "01-6310.38K",
    caseWeightLb: 18.2,
    caseDimensionsIn: { length: 13.4, width: 8.26, height: 8 },
  },
  {
    id: "sp12k",
    name: "SP12 Case 9 6-Packs",
    sku: "01-6315.38K",
    caseWeightLb: 31,
    caseDimensionsIn: { length: 14.4, width: 13.4, height: 8 },
  },
  {
    id: "sp18k",
    name: "SP18 Case 9 6-Packs",
    sku: "01-6318.71K",
    caseWeightLb: 36,
    caseDimensionsIn: { length: 14.6, width: 14, height: 8.4 },
  },
  {
    id: "sp58k",
    name: "SP58 Case 6 6-Packs",
    sku: "01-6358.58K",
    caseWeightLb: 41.1,
    caseDimensionsIn: { length: 18, width: 16, height: 8.5 },
  },
  {
    id: "ak4",
    name: "AK-4 12 Kits",
    sku: "01-7010",
    caseWeightLb: 48,
    caseDimensionsIn: { length: 18, width: 17, height: 14 },
  },
  {
    id: "eak4",
    name: "eAK-4 10 Kits",
    sku: "01-7013",
    caseWeightLb: 50,
    caseDimensionsIn: { length: 18, width: 14, height: 12 },
  },
  {
    id: "epx2t",
    name: "EPX2 10lb 4-Tub",
    sku: "82-5002.010",
    caseWeightLb: 44,
    caseDimensionsIn: { length: 17, width: 17, height: 6 },
  },
  {
    id: "epx3t",
    name: "EPX3 Case 12 Cartridges",
    sku: "82-6002",
    caseWeightLb: 24,
    caseDimensionsIn: { length: 9, width: 6, height: 12 },
  },
  {
    id: "epx2bags",
    name: "EPX2 Case 6x6-12oz bags",
    sku: "82-5002.K",
    caseWeightLb: 36,
    caseDimensionsIn: { length: 13, width: 10, height: 10 },
  },
];

export const DEFAULT_PRODUCT_ID = PRODUCTS[0]?.id ?? "";

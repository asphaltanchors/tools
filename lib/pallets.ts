export type PalletSpec = {
  id: string;
  name: string;
  footprintIn: {
    length: number;
    width: number;
  };
  baseHeightIn: number;
  maxLoadHeightIn: number;
  tareWeightLb: number;
  notes?: string;
};

export const PALLET_SPECS: PalletSpec[] = [
  {
    id: "gma-48x40",
    name: "GMA 48 × 40",
    footprintIn: { length: 48, width: 40 },
    baseHeightIn: 5.5,
    maxLoadHeightIn: 60,
    tareWeightLb: 40,
    notes: "Standard four-way entry pallet.",
  },
  {
    id: "gma-48x48",
    name: "GMA 48 × 48",
    footprintIn: { length: 48, width: 48 },
    baseHeightIn: 5.5,
    maxLoadHeightIn: 60,
    tareWeightLb: 45,
    notes: "Use for square footprint loads.",
  },
  {
    id: "euro-1200x1000",
    name: "EURO 1200 × 1000",
    footprintIn: { length: 47.2, width: 39.4 },
    baseHeightIn: 5.7,
    maxLoadHeightIn: 59,
    tareWeightLb: 50,
    notes: "Metric footprint; verify trailer clearance.",
  },
];

export const DEFAULT_PALLET_ID = PALLET_SPECS[0]?.id ?? "";

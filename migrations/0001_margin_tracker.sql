CREATE TABLE IF NOT EXISTS margin_products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  product_family TEXT,
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  hts_code TEXT,
  country_of_origin TEXT,
  pack_config TEXT,
  units_per_pack INTEGER NOT NULL DEFAULT 1,
  anchors_per_layer REAL,
  china_cost_cny REAL,
  vendor_cost_usd REAL,
  shipping_override_usd REAL,
  retail_price_usd REAL,
  active INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS margin_fx_rates (
  id TEXT PRIMARY KEY,
  effective_date TEXT NOT NULL,
  usd_cny REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_margin_fx_rates_effective_date
  ON margin_fx_rates (effective_date DESC);

CREATE TABLE IF NOT EXISTS margin_tariff_rates (
  id TEXT PRIMARY KEY,
  effective_date TEXT NOT NULL,
  hts_code TEXT NOT NULL,
  rate REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_margin_tariff_rates_lookup
  ON margin_tariff_rates (hts_code, effective_date DESC);

CREATE TABLE IF NOT EXISTS margin_shipments (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL,
  arrival_date TEXT NOT NULL,
  total_landed_cost_usd REAL NOT NULL,
  total_layers REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_margin_shipments_arrival_date
  ON margin_shipments (arrival_date DESC);

CREATE TABLE IF NOT EXISTS margin_shipment_lines (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL REFERENCES margin_shipments(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES margin_products(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  quantity_packs REAL,
  layers REAL,
  landed_cost_usd REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_margin_shipment_lines_shipment
  ON margin_shipment_lines (shipment_id);

CREATE TABLE IF NOT EXISTS margin_kit_components (
  id TEXT PRIMARY KEY,
  kit_product_id TEXT NOT NULL REFERENCES margin_products(id) ON DELETE CASCADE,
  component_product_id TEXT NOT NULL REFERENCES margin_products(id) ON DELETE CASCADE,
  quantity REAL NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (kit_product_id, component_product_id)
);

INSERT OR IGNORE INTO margin_fx_rates (id, effective_date, usd_cny, notes) VALUES
  ('fx-2025-01-01', '2025-01-01', 7.30, 'Spreadsheet seed'),
  ('fx-2025-06-01', '2025-06-01', 7.20, 'Spreadsheet seed'),
  ('fx-2026-01-01', '2026-01-01', 7.15, 'Spreadsheet seed'),
  ('fx-2026-05-01', '2026-05-01', 7.10, 'Spreadsheet seed');

INSERT OR IGNORE INTO margin_tariff_rates (id, effective_date, hts_code, rate, notes) VALUES
  ('tariff-7316-2025-01-01', '2025-01-01', '7316.00', 0.25, 'Section 301 sample'),
  ('tariff-7316-2026-05-01', '2026-05-01', '7316.00', 0.30, 'Current planning rate');

INSERT OR IGNORE INTO margin_shipments
  (id, reference, arrival_date, total_landed_cost_usd, total_layers, notes)
VALUES
  ('shipment-seed-2026-05', 'Seed shipment', '2026-05-01', 12000.00, 65.00, 'Spreadsheet seed: latest cost per layer');

INSERT OR IGNORE INTO margin_products
  (id, sku, name, category, product_family, hts_code, pack_config, units_per_pack, source)
VALUES
  ('sku-01-7625-k', '01-7625.K', 'AM625 6 pack', 'Anchor', 'AM625', '7316.00', '6-pack', 6, 'spreadsheet'),
  ('sku-01-7625-l', '01-7625.L', 'AM625 Metric 216 Pack', 'Anchor', 'AM625', '7316.00', '216-pack', 216, 'spreadsheet'),
  ('sku-01-6310-38k', '01-6310.38K', 'SP10-38K', 'Anchor', 'SP10', '7316.00', '9 x 6-pack case', 54, 'spreadsheet'),
  ('sku-01-6310-72l', '01-6310.72L', 'SP10-38L72', 'Anchor', 'SP10', '7316.00', '72-pack case', 72, 'spreadsheet'),
  ('sku-01-6310-3sk', '01-6310.3SK', 'SP10-38K 304', 'Anchor', 'SP10', '7316.00', '304 SS case', 54, 'spreadsheet'),
  ('sku-01-6310-m1k', '01-6310.M1K', 'SP10-M10', 'Anchor', 'SP10', '7316.00', 'Metric case', 54, 'spreadsheet'),
  ('sku-01-6310-1sk', '01-6310.1SK', 'SP10-M10 304', 'Anchor', 'SP10', '7316.00', 'Metric 304 SS case', 54, 'spreadsheet'),
  ('sku-01-6315-38k', '01-6315.38K', 'SP12-38K', 'Anchor', 'SP12', '7316.00', '9 x 6-pack case', 54, 'spreadsheet'),
  ('sku-01-6315-3sk', '01-6315.3SK', 'SP12-38K 304', 'Anchor', 'SP12', '7316.00', '304 SS case', 54, 'spreadsheet'),
  ('sku-01-6315-3sk-2', '01-6315.3SK-2', 'SP12-3SK-2', 'Anchor', 'SP12', '7316.00', '304 SS case', 54, 'spreadsheet'),
  ('sku-01-6315-m1k', '01-6315.M1K', 'SP12-M10', 'Anchor', 'SP12', '7316.00', 'Metric case', 54, 'spreadsheet'),
  ('sku-01-6315-1sk', '01-6315.1SK', 'SP12-M10 304', 'Anchor', 'SP12', '7316.00', 'Metric 304 SS case', 54, 'spreadsheet'),
  ('sku-01-6318-71k', '01-6318.71K', 'SP18-71K', 'Anchor', 'SP18', '7316.00', '9 x 6-pack case', 54, 'spreadsheet'),
  ('sku-01-6318-7sk', '01-6318.7SK', 'SP18-71K 304', 'Anchor', 'SP18', '7316.00', '304 SS case', 54, 'spreadsheet'),
  ('sku-01-6318-m2k', '01-6318.M2K', 'SP18-M12', 'Anchor', 'SP18', '7316.00', 'Metric case', 54, 'spreadsheet'),
  ('sku-01-6318-2sk', '01-6318.2SK', 'SP18-M12 304', 'Anchor', 'SP18', '7316.00', 'Metric 304 SS case', 54, 'spreadsheet'),
  ('sku-01-6358-58k', '01-6358.58K', 'SP58-58K', 'Anchor', 'SP58', '7316.00', '6 x 6-pack case', 36, 'spreadsheet'),
  ('sku-01-6358-5sk', '01-6358.5SK', 'SP58-58K 304', 'Anchor', 'SP58', '7316.00', '304 SS case', 36, 'spreadsheet'),
  ('sku-01-6358-5sk-2', '01-6358.5SK-2', 'SP58-5SK-2 304', 'Anchor', 'SP58', '7316.00', '304 SS case', 36, 'spreadsheet'),
  ('sku-01-6358-m6k', '01-6358.M6K', 'SP58-58K 316', 'Anchor', 'SP58', '7316.00', '316 SS case', 36, 'spreadsheet'),
  ('sku-01-6358-16k', '01-6358.16K', 'SP58-M16', 'Anchor', 'SP58', '7316.00', 'Metric case', 36, 'spreadsheet'),
  ('sku-01-6358-6sk', '01-6358.6SK', 'SP58-M16 304', 'Anchor', 'SP58', '7316.00', 'Metric 304 SS case', 36, 'spreadsheet'),
  ('sku-82-5002-k-ea', '82-5002.K-EA', 'EPX2 6-12oz bag (each)', 'Adhesive', 'EPX2', NULL, 'Each', 1, 'spreadsheet'),
  ('sku-82-5002-k', '82-5002.K', 'EPX2 Case 6x6-12oz bags', 'Adhesive', 'EPX2', NULL, '6-pack MC', 6, 'spreadsheet'),
  ('sku-adh-epx2tub2p5-ea', 'ADH-EPX2TUB2P5-EA', 'EPX2 2.5lb Tub (each)', 'Adhesive', 'EPX2', NULL, 'Each', 1, 'spreadsheet'),
  ('sku-adh-epx2tub2p5', 'ADH-EPX2TUB2P5', 'EPX2 2.5lb 6-Tub MC', 'Adhesive', 'EPX2', NULL, '6-tub MC', 6, 'spreadsheet'),
  ('sku-adh-epx2-tub10lb-ea', 'ADH-EPX2-TUB10LB-EA', 'EPX2 10lb Tub (each)', 'Adhesive', 'EPX2', NULL, 'Each', 1, 'spreadsheet'),
  ('sku-adh-epx2-tub10lb', 'ADH-EPX2-TUB10LB', 'EPX2 10lb 4-Tub MC', 'Adhesive', 'EPX2', NULL, '4-tub MC', 4, 'spreadsheet'),
  ('sku-82-6002-ea', '82-6002-EA', 'EPX3 Cartridge (each)', 'Adhesive', 'EPX3', NULL, 'Each', 1, 'spreadsheet'),
  ('sku-82-6002', '82-6002', 'EPX3 Case 12 Cartridges', 'Adhesive', 'EPX3', NULL, '12-pack MC', 12, 'spreadsheet'),
  ('sku-kit-sp10-epx2', 'KIT-SP10-EPX2', 'SP10 Anchor Kit (EPX2 bags)', 'Kit', 'SP10', NULL, 'Kit', 1, 'spreadsheet'),
  ('sku-kit-sp10-epx3', 'KIT-SP10-EPX3', 'SP10 Anchor Kit (EPX3 tube)', 'Kit', 'SP10', NULL, 'Kit', 1, 'spreadsheet');

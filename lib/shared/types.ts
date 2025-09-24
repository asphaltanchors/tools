// ABOUTME: Shared types used across multiple calculators in the application
// ABOUTME: Includes common interfaces for products, dimensions, and calculations

export interface Dimensions {
  length: number;
  width: number;
  height?: number;
}

export interface Weight {
  value: number;
  unit: 'lb' | 'kg';
}

export interface BaseProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
}

export interface CalculatorResult {
  success: boolean;
  summary: Record<string, any>;
  details?: any;
  errors?: string[];
}
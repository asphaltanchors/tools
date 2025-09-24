// ABOUTME: Server actions for generating ITF-14 and GS1-128/SSCC barcodes
// ABOUTME: Returns PNG data URLs for barcode rendering

'use server';

import bwipjs from 'bwip-js';

export type BarcodeType = 'ITF14' | 'GS1128' | 'CODE128';

export async function generateBarcodeAction(text: string, options?: {
  type?: BarcodeType;
  scale?: number;
  height?: number;
  includetext?: boolean;
  includeBearerBars?: boolean;
}) {
  try {
    // Clean and validate input
    const cleanText = text.replace(/\s/g, '');
    const barcodeType = options?.type || 'ITF14';

    // Validate based on barcode type
    if (barcodeType === 'ITF14') {
      if (!/^\d{14}$/.test(cleanText)) {
        return {
          success: false,
          error: 'ITF-14 requires exactly 14 digits'
        };
      }
    } else if (barcodeType === 'GS1128') {
      if (!/^\d{18}$/.test(cleanText)) {
        return {
          success: false,
          error: 'GS1-128/SSCC requires exactly 18 digits'
        };
      }
    } else if (barcodeType === 'CODE128') {
      // Code 128 can handle alphanumeric content, basic validation
      if (cleanText.length === 0 || cleanText.length > 80) {
        return {
          success: false,
          error: 'Code 128 text must be between 1-80 characters'
        };
      }
    }

    // Configure barcode options based on type
    const barcodeOptions: Record<string, unknown> = {
      text: cleanText,
      scale: options?.scale ?? 3,
      height: options?.height ?? 30,
      includetext: options?.includetext ?? true,
      textxalign: 'center',
      guardwhitespace: true,
    };

    if (barcodeType === 'ITF14') {
      barcodeOptions.bcid = 'itf14';
      // Bearer bars are mandatory for ITF-14 per GS1 specification
      // bwip-js enforces this automatically
    } else if (barcodeType === 'GS1128') {
      barcodeOptions.bcid = 'gs1-128';
      // For SSCC, format with application identifier (00)
      barcodeOptions.text = `(00)${cleanText}`;
      barcodeOptions.parsefnc = true; // Enable FNC1 parsing for GS1
    } else if (barcodeType === 'CODE128') {
      barcodeOptions.bcid = 'code128';
      barcodeOptions.text = cleanText; // Use original text for Code 128
    }

    // Generate SVG barcode
    const svg = await new Promise<string>((resolve, reject) => {
      bwipjs.toBuffer(
        barcodeOptions,
        (err: Error | null, png: Buffer) => {
          if (err) {
            reject(err);
          } else {
            // Convert to base64 PNG since SVG generation might not work reliably
            const base64 = png.toString('base64');
            resolve(`data:image/png;base64,${base64}`);
          }
        }
      );
    });

    return {
      success: true,
      barcode: svg,
      format: 'png',
      code: cleanText
    };

  } catch (error: unknown) {
    console.error('Barcode generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate barcode'
    };
  }
}

// Helper to calculate ITF-14 check digit
export async function calculateCheckDigit(code: string): Promise<string> {
  const digits = code.slice(0, 13);
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

// Helper to calculate SSCC check digit (GS1-128)
export async function calculateSSCCCheckDigit(code: string): Promise<string> {
  const digits = code.slice(0, 17);
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}
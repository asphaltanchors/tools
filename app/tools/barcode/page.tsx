// ABOUTME: ITF-14 and GS1-128/SSCC barcode generator with bearer bars
// ABOUTME: Generates industrial-grade barcodes with validation and download

"use client";

import { useState } from "react";
import Image from "next/image";
import { QrCode, Download, AlertCircle, Check, Package } from "lucide-react";
import { generateBarcodeAction, calculateCheckDigit, calculateSSCCCheckDigit, type BarcodeType } from "./actions";

export default function BarcodeGenerator() {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('CODE128');

  // Validate barcode based on type
  const validateBarcode = (value: string): boolean => {
    const cleaned = value.replace(/\s/g, "");

    if (barcodeType === 'ITF14') {
      if (cleaned.length !== 14) {
        setError("ITF-14 must be exactly 14 digits");
        return false;
      }
      if (!/^\d{14}$/.test(cleaned)) {
        setError("ITF-14 must contain only digits");
        return false;
      }
    } else if (barcodeType === 'GS1128') {
      if (cleaned.length !== 18) {
        setError("SSCC must be exactly 18 digits");
        return false;
      }
      if (!/^\d{18}$/.test(cleaned)) {
        setError("SSCC must contain only digits");
        return false;
      }
    } else if (barcodeType === 'CODE128') {
      if (cleaned.length === 0 || cleaned.length > 80) {
        setError("Code 128 must be between 1-80 characters");
        return false;
      }
    }

    setError("");
    return true;
  };

  // Generate barcode using server action
  const generateBarcode = async () => {
    const cleaned = inputValue.replace(/\s/g, "");

    if (!validateBarcode(cleaned)) {
      return;
    }

    setIsLoading(true);
    setError("");

    // Verify check digit for numeric barcode types only
    if (barcodeType === 'ITF14' || barcodeType === 'GS1128') {
      let providedCheck: string;
      let calculatedCheck: string;

      if (barcodeType === 'ITF14') {
        providedCheck = cleaned[13];
        calculatedCheck = await calculateCheckDigit(cleaned);
      } else {
        providedCheck = cleaned[17];
        calculatedCheck = await calculateSSCCCheckDigit(cleaned);
      }

      if (providedCheck !== calculatedCheck) {
        setError(`Warning: Check digit should be ${calculatedCheck}, but ${providedCheck} was provided`);
      }
    }

    try {
      // Call server action to generate barcode
      const result = await generateBarcodeAction(cleaned, {
        type: barcodeType
      });

      if (result.success && result.barcode) {
        setBarcodeImage(result.barcode);
        setGeneratedCode(result.code || cleaned);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error || "Failed to generate barcode");
        setBarcodeImage(null);
      }
    } catch (err) {
      console.error('Barcode generation error:', err);
      setError(`Error generating barcode: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setBarcodeImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Format input for display (add spaces for readability)
  const formatInput = (value: string) => {
    if (barcodeType === 'CODE128') {
      // No formatting for Code 128 - allow alphanumeric
      if (value.length <= 80) {
        setInputValue(value);
      }
      return;
    }

    const cleaned = value.replace(/\s/g, "");
    const maxLength = barcodeType === 'ITF14' ? 14 : 18;

    if (cleaned.length <= maxLength) {
      let formatted: string;

      if (barcodeType === 'ITF14') {
        // Format as: 0 1234567 89012 3
        formatted = cleaned
          .split("")
          .map((digit, i) => {
            if (i === 1 || i === 8 || i === 13) return ` ${digit}`;
            return digit;
          })
          .join("");
      } else {
        // Format SSCC as: 0 12345678 901234567 8
        formatted = cleaned
          .split("")
          .map((digit, i) => {
            if (i === 1 || i === 9 || i === 17) return ` ${digit}`;
            return digit;
          })
          .join("");
      }

      setInputValue(formatted);
    }
  };

  // Download barcode as image
  const downloadBarcode = () => {
    if (!barcodeImage) return;

    const link = document.createElement("a");
    const prefix = barcodeType === 'ITF14' ? 'ITF14' :
                   barcodeType === 'GS1128' ? 'SSCC' : 'CODE128';
    link.download = `${prefix}_${generatedCode}.png`;
    link.href = barcodeImage;
    link.click();
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="bg-white rounded-lg border-2 border-gray-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-mono text-black tracking-tight uppercase">
                {barcodeType === 'ITF14' ? 'ITF-14//GEN' : barcodeType === 'GS1128' ? 'GS1-128//GEN' : 'CODE128//GEN'}
              </h1>
              <p className="text-xs text-gray-600 font-mono mt-1 tracking-wider uppercase">
                {barcodeType === 'ITF14' ? 'GS1 Case Code Generator with Bearer Bars' :
                 barcodeType === 'GS1128' ? 'SSCC Serial Shipping Container Code Generator' :
                 'General Purpose Linear Barcode Generator'}
              </p>
            </div>
            <Package className="h-10 w-10 text-gray-400" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <section className="border-2 border-gray-900 bg-white rounded-lg shadow-sm">
            <div className="border-b-2 border-gray-900 px-4 py-3 bg-gray-50 rounded-t-lg">
              <h2 className="text-sm font-mono font-bold text-black uppercase tracking-wider">
                INPUT: {barcodeType === 'ITF14' ? 'ITF-14' : barcodeType === 'GS1128' ? 'GS1-128/SSCC' : 'CODE 128'} CODE
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Barcode Type
                </label>
                <select
                  value={barcodeType}
                  onChange={(e) => {
                    setBarcodeType(e.target.value as BarcodeType);
                    setInputValue("");
                    setError("");
                    setBarcodeImage(null);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded bg-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="CODE128">Code 128 (Alphanumeric)</option>
                  <option value="ITF14">ITF-14 (14 digits)</option>
                  <option value="GS1128">GS1-128/SSCC (18 digits)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-gray-700 uppercase tracking-wider mb-2">
                  {barcodeType === 'CODE128' ? 'Enter Text/Code' : `Enter ${barcodeType === 'ITF14' ? '14' : '18'}-Digit Code`}
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => formatInput(e.target.value)}
                  placeholder={barcodeType === 'CODE128' ? 'XYZ0190098' : barcodeType === 'ITF14' ? '0 1234567 89012 3' : '0 12345678 901234567 8'}
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded bg-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  maxLength={barcodeType === 'CODE128' ? 80 : barcodeType === 'ITF14' ? 17 : 21}
                />
                {error && (
                  <div className="mt-2 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <p className="text-xs font-mono text-red-600">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mt-2 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <p className="text-xs font-mono text-green-600">Barcode generated successfully!</p>
                  </div>
                )}
              </div>

              {barcodeType === 'ITF14' && (
                <div className="p-3 border border-gray-300 rounded bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider">
                      Bearer Bars
                    </h4>
                    <span className="text-xs font-mono font-bold text-green-600">REQUIRED</span>
                  </div>
                  <p className="text-xs font-mono text-gray-600">
                    Bearer bars are mandatory for ITF-14 per GS1 specifications to ensure print quality and scanning reliability.
                  </p>
                </div>
              )}

              <button
                onClick={generateBarcode}
                disabled={!inputValue ||
                  (barcodeType !== 'CODE128' && inputValue.replace(/\s/g, "").length !== (barcodeType === 'ITF14' ? 14 : 18)) ||
                  (barcodeType === 'CODE128' && (inputValue.length === 0 || inputValue.length > 80)) ||
                  isLoading}
                className="w-full bg-black text-white font-mono font-bold py-3 px-4 rounded uppercase tracking-wider hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "GENERATING..." : "GENERATE BARCODE"}
              </button>

              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <h3 className="text-xs font-mono font-bold text-gray-700 uppercase mb-2">
                  About {barcodeType === 'ITF14' ? 'ITF-14' : barcodeType === 'GS1128' ? 'GS1-128/SSCC' : 'Code 128'}
                </h3>
                <ul className="space-y-1 text-xs font-mono text-gray-600">
                  {barcodeType === 'ITF14' ? (
                    <>
                      <li>• 14-digit barcode for shipping containers</li>
                      <li>• Used for GS1 case codes and cartons</li>
                      <li>• Includes bearer bars for print quality</li>
                      <li>• Last digit is a check digit</li>
                    </>
                  ) : barcodeType === 'GS1128' ? (
                    <>
                      <li>• 18-digit SSCC for logistics tracking</li>
                      <li>• Serial Shipping Container Code</li>
                      <li>• Used for pallet and container identification</li>
                      <li>• Last digit is a check digit</li>
                    </>
                  ) : (
                    <>
                      <li>• Linear barcode for general purposes</li>
                      <li>• Supports letters, numbers, and symbols</li>
                      <li>• High data density and reliability</li>
                      <li>• Maximum 80 characters</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Output Section */}
          <section className="border-2 border-gray-900 bg-white rounded-lg shadow-sm">
            <div className="border-b-2 border-gray-900 px-4 py-3 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono font-bold text-black uppercase tracking-wider">
                  OUTPUT: GENERATED BARCODE
                </h2>
                {barcodeImage && (
                  <button
                    onClick={downloadBarcode}
                    className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded text-xs font-mono font-bold hover:bg-gray-900 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    DOWNLOAD
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center min-h-[300px] bg-white rounded border-2 border-dashed border-gray-300">
                {barcodeImage ? (
                  <div className="text-center">
                    <Image
                      src={barcodeImage}
                      alt="Generated ITF-14 Barcode"
                      width={400}
                      height={200}
                      className="max-w-full h-auto"
                      unoptimized
                    />
                    <p className="mt-4 text-xs font-mono text-gray-600">
                      Code: {generatedCode}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm font-mono text-gray-500">
                      Enter a code and click generate
                    </p>
                  </div>
                )}
              </div>

              {barcodeImage && (
                <div className="mt-4 space-y-2 border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-xs font-mono font-bold text-gray-700 uppercase">Barcode Details</h3>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="text-black font-bold">
                        {barcodeType === 'ITF14' ? 'ITF-14 (Interleaved 2 of 5)' :
                         barcodeType === 'GS1128' ? 'GS1-128 (Code 128)' : 'Code 128'}
                      </span>
                    </div>
                    {barcodeType === 'ITF14' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bearer Bars:</span>
                        <span className="text-black font-bold">Included (Required)</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check Digit:</span>
                      <span className="text-black font-bold">{generatedCode.slice(-1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
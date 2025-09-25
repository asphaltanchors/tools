// ABOUTME: Fence anchor calculator with advanced engineering analysis capabilities
// ABOUTME: Implements ASCE 7 wind loads, group effects, and safety factor evaluations

"use client";

import { useMemo, useState } from "react";
import { FenceIcon, Calculator, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import fence calculation modules
import { ANCHOR_CAPACITIES, type AnchorType } from "@/lib/fence/anchors";
import { ADHESIVE_PROPERTIES, type AdhesiveType } from "@/lib/fence/adhesives";
import {
  FENCE_TYPES,
  FENCE_PRESETS,
  type FenceTypeKey,
} from "@/lib/fence/fence-types";
import { WIND_LOAD_FACTORS } from "@/lib/fence/wind";
import { calculateFenceAnchors } from "@/lib/fence/calculations/fence";
import {
  parseFenceInputs,
  type FenceCalculatorFormState,
} from "@/lib/fence/calculations/input";
import type { CalculationResult } from "@/lib/fence/calculations/types";
import { roundTo } from "@/lib/fence/math";
import { buildCartUrl, fetchAnchorPrices } from "@/lib/fence/pricing";

const EXPOSURE_OPTIONS: Array<{
  value: keyof typeof WIND_LOAD_FACTORS;
  label: string;
  description: string;
}> = [
  {
    value: "residential",
    label: "Residential",
    description: "Suburban areas with trees and buildings (Exposure B)",
  },
  {
    value: "commercial",
    label: "Commercial",
    description: "Open terrain with scattered obstructions (Exposure C)",
  },
  {
    value: "industrial",
    label: "Industrial",
    description: "Flat, unobstructed areas and water surfaces (Exposure D)",
  },
  {
    value: "coastal",
    label: "Coastal/High Wind",
    description: "Flat, unobstructed coastal areas (Exposure D)",
  },
];

const ADHESIVE_OPTIONS: Array<{
  value: AdhesiveType;
  label: string;
  description?: string;
}> = Object.entries(ADHESIVE_PROPERTIES).map(([key, value]) => ({
  value: key as AdhesiveType,
  label: value.name,
  description: value.notes,
}));

const formatInches = (value: number) =>
  Number.isFinite(value) ? `${roundTo(value, 2)}"` : "N/A";

export default function FenceCalculator() {
  const [inputs, setInputs] = useState<FenceCalculatorFormState>({
    fenceHeight: "",
    postSpacing: "",
    fenceType: "",
    windSpeed: "",
    exposureCategory: "",
    adhesiveType: "",
    basePlateLength: "",
    basePlateWidth: "",
    holeInsetFromEdge: "",
  });

  const [totalLength, setTotalLength] = useState("");
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [prices, setPrices] = useState<Partial<Record<AnchorType, number>>>({});
  const [attempted, setAttempted] = useState(false);

  const primaryResult = results[0];

  const canCalculate = useMemo(() => {
    return Boolean(
      inputs.fenceHeight &&
        inputs.postSpacing &&
        inputs.fenceType &&
        inputs.windSpeed &&
        inputs.exposureCategory &&
        inputs.adhesiveType &&
        inputs.basePlateLength &&
        inputs.basePlateWidth &&
        inputs.holeInsetFromEdge,
    );
  }, [inputs]);

  const applyPreset = (presetKey: string) => {
    if (presetKey === "custom") {
      setSelectedPreset("custom");
      return;
    }

    const preset = FENCE_PRESETS[presetKey];
    if (!preset) return;

    setInputs({
      fenceHeight: preset.fenceHeight,
      fenceType: preset.fenceType,
      postSpacing: preset.postSpacing,
      windSpeed: preset.windSpeed,
      exposureCategory: preset.exposureCategory,
      adhesiveType: preset.adhesiveType,
      basePlateLength: preset.basePlateLength,
      basePlateWidth: preset.basePlateWidth,
      holeInsetFromEdge: preset.holeInsetFromEdge,
    });
    setSelectedPreset(presetKey);
  };

  const handleCalculate = async () => {
    setAttempted(true);
    setIsCalculating(true);
    setResults([]);

    const { parsed, errors } = parseFenceInputs(inputs);
    if (!parsed) {
      setIsCalculating(false);
      if (errors.length > 0) {
        alert(errors[0].message);
      }
      return;
    }

    try {
      const calculationResults = calculateFenceAnchors(parsed);
      setResults(calculationResults);

      // Fetch prices
      const priceMap = await fetchAnchorPrices();
      setPrices(priceMap);
    } catch (error) {
      console.error("Calculation failed:", error);
      alert("Calculation failed. Please check your inputs and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const getSafetyBadgeProps = (rating: CalculationResult["safetyRating"]) => {
    switch (rating) {
      case "adequate":
        return {
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
          text: "ADEQUATE",
        };
      case "good":
        return {
          className: "bg-green-100 text-green-800 border-green-300",
          text: "GOOD",
        };
      case "excellent":
        return {
          className: "bg-blue-100 text-blue-800 border-blue-300",
          text: "EXCELLENT",
        };
      default:
        return {
          className: "bg-red-100 text-red-800 border-red-300",
          text: "INADEQUATE",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="bg-white rounded-lg border-2 border-gray-900 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-mono text-black tracking-tight uppercase">
                FENCE//CALC
              </h1>
              <p className="text-xs text-gray-600 font-mono mt-1 tracking-wider uppercase">
                Advanced Anchor Calculator v1.0
              </p>
            </div>
            <FenceIcon className="h-10 w-10 text-gray-400" />
          </div>
        </header>

        <section className="border-2 border-gray-900 bg-white rounded-lg shadow-sm">
          <div className="border-b-2 border-gray-900 px-4 py-3 bg-gray-50">
            <h2 className="text-sm font-mono font-bold text-black uppercase tracking-wider">
              INPUT: PROJECT PARAMETERS
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Preset Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                Quick Start Presets
              </Label>
              <Select value={selectedPreset} onValueChange={applyPreset}>
                <SelectTrigger className="h-10 font-mono bg-white border-2 border-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900">
                  <SelectValue placeholder="SELECT PRESET OR CUSTOM">
                    {selectedPreset &&
                      selectedPreset !== "custom" &&
                      selectedPreset !== "" &&
                      FENCE_PRESETS[
                        selectedPreset as keyof typeof FENCE_PRESETS
                      ]?.name}
                    {selectedPreset === "custom" && "CUSTOM CONFIGURATION"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom" className="font-mono">
                    CUSTOM CONFIGURATION
                  </SelectItem>
                  {Object.entries(FENCE_PRESETS).map(([key, preset]) => (
                    <SelectItem key={key} value={key} className="font-mono">
                      <div className="space-y-1">
                        <div className="font-semibold">{preset.name}</div>
                        <div className="text-xs text-gray-600">
                          {preset.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Main Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fence Height */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                  Fence Height [FT]
                </Label>
                <Input
                  type="number"
                  placeholder="6"
                  value={inputs.fenceHeight}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      fenceHeight: e.target.value,
                    }))
                  }
                  className="h-10 font-mono bg-white border-2 border-gray-900 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900"
                />
              </div>

              {/* Post Spacing */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                  Post Spacing [FT]
                </Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={inputs.postSpacing}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      postSpacing: e.target.value,
                    }))
                  }
                  className="h-10 font-mono bg-white border-2 border-gray-900 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900"
                />
              </div>

              {/* Wind Speed */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                  Wind Speed [MPH]
                </Label>
                <Input
                  type="number"
                  placeholder="90"
                  value={inputs.windSpeed}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      windSpeed: e.target.value,
                    }))
                  }
                  className="h-10 font-mono bg-white border-2 border-gray-900 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fence Type */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                  Fence Type
                </Label>
                <Select
                  value={inputs.fenceType}
                  onValueChange={(value) =>
                    setInputs((prev) => ({ ...prev, fenceType: value }))
                  }
                >
                  <SelectTrigger className="h-10 font-mono bg-white border-2 border-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900">
                    <SelectValue placeholder="SELECT FENCE TYPE">
                      {inputs.fenceType &&
                        FENCE_TYPES[inputs.fenceType as FenceTypeKey]
                          ?.description}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FENCE_TYPES).map(([key, fence]) => (
                      <SelectItem key={key} value={key} className="font-mono">
                        <div className="space-y-1">
                          <div className="font-semibold">
                            {fence.description}
                          </div>
                          <div className="text-xs text-gray-600">
                            Wind Coefficient: {fence.windCoeff}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exposure Category */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                  Exposure Category
                </Label>
                <Select
                  value={inputs.exposureCategory}
                  onValueChange={(value) =>
                    setInputs((prev) => ({ ...prev, exposureCategory: value }))
                  }
                >
                  <SelectTrigger className="h-10 font-mono bg-white border-2 border-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900">
                    <SelectValue placeholder="SELECT EXPOSURE">
                      {inputs.exposureCategory &&
                        EXPOSURE_OPTIONS.find(
                          (opt) => opt.value === inputs.exposureCategory,
                        )?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {EXPOSURE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="font-mono"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-xs text-gray-600">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Baseplate Length */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                  Baseplate Length [IN]
                </Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={inputs.basePlateLength}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      basePlateLength: e.target.value,
                    }))
                  }
                  className="h-10 font-mono bg-white border-2 border-gray-900 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900"
                />
              </div>

              {/* Baseplate Width */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                  Baseplate Width [IN]
                </Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={inputs.basePlateWidth}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      basePlateWidth: e.target.value,
                    }))
                  }
                  className="h-10 font-mono bg-white border-2 border-gray-900 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900"
                />
              </div>

              {/* Hole Inset */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                  Hole Inset [IN]
                </Label>
                <Input
                  type="number"
                  placeholder="1.5"
                  value={inputs.holeInsetFromEdge}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      holeInsetFromEdge: e.target.value,
                    }))
                  }
                  className="h-10 font-mono bg-white border-2 border-gray-900 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Adhesive Type */}
            <div className="space-y-2">
              <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                Adhesive Type
              </Label>
              <Select
                value={inputs.adhesiveType}
                onValueChange={(value) =>
                  setInputs((prev) => ({ ...prev, adhesiveType: value }))
                }
              >
                <SelectTrigger className="h-10 font-mono bg-white border-2 border-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900">
                  <SelectValue placeholder="SELECT ADHESIVE">
                    {inputs.adhesiveType &&
                      ADHESIVE_OPTIONS.find(
                        (opt) => opt.value === inputs.adhesiveType,
                      )?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ADHESIVE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="font-mono"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-600">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              disabled={!canCalculate || isCalculating}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-mono font-bold uppercase tracking-wider border-2 border-gray-900"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating
                ? "CALCULATING..."
                : "CALCULATE ANCHOR REQUIREMENTS"}
            </Button>
          </div>
        </section>

        {/* Results Section */}
        <section className="border-2 border-gray-900 bg-white rounded-lg shadow-sm">
          <div className="border-b-2 border-gray-900 px-4 py-3 bg-gray-50">
            <h2 className="text-sm font-mono font-bold text-black uppercase tracking-wider">
              OUTPUT: CALCULATION RESULTS
            </h2>
          </div>
          <div className="p-6">
            {!attempted ? (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-mono text-sm uppercase tracking-wider">
                  Enter parameters and click calculate to see results
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-red-600">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="font-mono text-sm font-bold uppercase tracking-wider mb-2">
                  NO ADEQUATE SOLUTIONS FOUND
                </p>
                <p className="font-mono text-xs text-gray-600 uppercase tracking-wider">
                  Consider larger baseplate or stronger anchors
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Load Summary */}
                {primaryResult && (
                  <div className="bg-gray-50 border-2 border-gray-900 rounded-lg p-4">
                    <h3 className="text-xs font-mono font-bold text-black uppercase tracking-wider mb-3">
                      LOAD SUMMARY
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                      <div>
                        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                          Wind Load
                        </p>
                        <p className="text-sm font-mono font-bold text-black">
                          {Math.round(primaryResult.windLoad)} LBS
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                          Dead Load
                        </p>
                        <p className="text-sm font-mono font-bold text-black">
                          {Math.round(primaryResult.deadLoad)} LBS
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                          Total Load
                        </p>
                        <p className="text-sm font-mono font-bold text-black">
                          {Math.round(primaryResult.totalLoad)} LBS
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                          Baseplate
                        </p>
                        <p className="text-sm font-mono font-bold text-black">
                          {primaryResult.basePlateInfo.sizeLabel}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                          Hole Spacing
                        </p>
                        <p className="text-sm font-mono font-bold text-black">
                          {formatInches(
                            primaryResult.basePlateInfo.holeSpacing,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                          Edge Distance
                        </p>
                        <p className="text-sm font-mono font-bold text-black">
                          {formatInches(
                            primaryResult.basePlateInfo.edgeDistance,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Totals Input */}
                <div className="bg-gray-50 border-2 border-gray-900 rounded-lg p-4">
                  <h3 className="text-xs font-mono font-bold text-black uppercase tracking-wider mb-3">
                    PROJECT TOTALS (OPTIONAL)
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-gray-700 uppercase tracking-wider font-semibold">
                      Total Fence Length [FT]
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter total length for quantity calculations"
                      value={totalLength}
                      onChange={(e) => setTotalLength(e.target.value)}
                      className="h-10 font-mono bg-white border-2 border-gray-900 focus:ring-2 focus:ring-offset-1 focus:ring-gray-900"
                    />
                  </div>
                  {totalLength && Number.parseFloat(totalLength) > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                        <div>
                          <p className="text-xs text-gray-600 uppercase">
                            Total Posts Needed
                          </p>
                          <p className="font-bold text-black">
                            {Math.ceil(
                              Number.parseFloat(totalLength) /
                                Number.parseFloat(inputs.postSpacing || "8"),
                            ) + 1}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase">
                            Post Spacing
                          </p>
                          <p className="font-bold text-black">
                            {inputs.postSpacing || "8"} FT
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Anchor Solutions */}
                <div className="space-y-4">
                  {results
                    .filter((result) => result.isAdequate)
                    .map((result) => {
                      const badgeProps = getSafetyBadgeProps(
                        result.safetyRating,
                      );

                      return (
                        <div
                          key={`${result.anchorType}-${result.anchorsPerPost}`}
                          className="bg-gray-50 border-2 border-gray-900 rounded-lg p-6"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-mono font-bold text-black uppercase tracking-wider">
                              {ANCHOR_CAPACITIES[result.anchorType].name}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border-2 rounded ${badgeProps.className}`}
                            >
                              {badgeProps.text}
                            </span>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-4">
                            <div>
                              <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                                Anchors/Post
                              </p>
                              <p className="text-2xl font-mono font-bold text-black">
                                {result.anchorsPerPost}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                                Safety Factor
                              </p>
                              <p className="text-2xl font-mono font-bold text-black">
                                {result.safetyFactor.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                                Group Efficiency
                              </p>
                              <p className="text-2xl font-mono font-bold text-black">
                                {Math.round(result.groupEfficiency * 100)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-mono text-gray-600 uppercase tracking-wider mb-1">
                                Max Tension
                              </p>
                              <p className="text-2xl font-mono font-bold text-black">
                                {Math.round(result.maxAnchorDemand)}
                              </p>
                            </div>
                          </div>

                          {/* Technical Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm font-mono">
                            <div>
                              <p className="text-xs text-gray-600 uppercase mb-1">
                                Active Anchors
                              </p>
                              <p className="font-bold">
                                {result.activeAnchors}/{result.anchorsPerPost}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase mb-1">
                                Effective Anchors
                              </p>
                              <p className="font-bold">
                                {result.effectiveAnchors}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase mb-1">
                                Wind Angle
                              </p>
                              <p className="font-bold">
                                {Number.isFinite(result.governingAngle)
                                  ? `${roundTo(result.governingAngle, 0)}°`
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase mb-1">
                                Embedment
                              </p>
                              <p className="font-bold">
                                {ANCHOR_CAPACITIES[result.anchorType].embedment}
                                &quot;
                              </p>
                            </div>
                          </div>

                          {/* Project Totals & Pricing */}
                          {totalLength &&
                            Number.parseFloat(totalLength) > 0 && (
                              <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-mono font-bold text-green-800 uppercase tracking-wider">
                                    PROJECT REQUIREMENTS
                                  </h4>
                                  <div className="text-right">
                                    <p className="text-sm font-mono font-bold text-green-800">
                                      {(() => {
                                        const totalPosts =
                                          Math.ceil(
                                            Number.parseFloat(totalLength) /
                                              Number.parseFloat(
                                                inputs.postSpacing || "8",
                                              ),
                                          ) + 1;
                                        const totalAnchors =
                                          totalPosts * result.anchorsPerPost;
                                        return `${Math.ceil(totalAnchors / 6)} × 6-PACKS NEEDED`;
                                      })()}
                                    </p>
                                    <p className="text-xs font-mono text-green-600">
                                      {(() => {
                                        const totalPosts =
                                          Math.ceil(
                                            Number.parseFloat(totalLength) /
                                              Number.parseFloat(
                                                inputs.postSpacing || "8",
                                              ),
                                          ) + 1;
                                        const totalAnchors =
                                          totalPosts * result.anchorsPerPost;
                                        return `${totalAnchors} total anchors for ${totalPosts} posts`;
                                      })()}
                                    </p>
                                  </div>
                                </div>

                                {(() => {
                                  const totalPosts =
                                    Math.ceil(
                                      Number.parseFloat(totalLength) /
                                        Number.parseFloat(
                                          inputs.postSpacing || "8",
                                        ),
                                    ) + 1;
                                  const totalAnchors =
                                    totalPosts * result.anchorsPerPost;
                                  const unitPrice = prices[result.anchorType];

                                  return (
                                    <>
                                      {typeof unitPrice === "number" && (
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="text-sm font-mono font-bold text-green-800 uppercase">
                                            Total Cost:
                                          </span>
                                          <span className="text-xl font-mono font-bold text-green-800">
                                            $
                                            {(
                                              unitPrice *
                                              Math.ceil(totalAnchors / 6)
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                      )}

                                      <Button
                                        onClick={() =>
                                          window.open(
                                            buildCartUrl(
                                              result.anchorType,
                                              totalAnchors,
                                            ),
                                            "_blank",
                                          )
                                        }
                                        className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-mono font-bold uppercase tracking-wider border-2 border-green-700"
                                      >
                                        ADD TO CART -{" "}
                                        {Math.ceil(totalAnchors / 6)} × 6-PACKS
                                      </Button>
                                    </>
                                  );
                                })()}
                              </div>
                            )}

                          {/* Notes */}
                          {result.groupNotes.length > 0 && (
                            <div className="mt-4 p-3 bg-white border border-gray-300 rounded">
                              <p className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Engineering Notes:
                              </p>
                              {result.groupNotes.map((note, index) => (
                                <p
                                  key={index}
                                  className="text-xs font-mono text-gray-600 mb-1"
                                >
                                  • {note}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Engineering Notes */}
                <div className="bg-gray-50 border-2 border-gray-900 rounded-lg p-4">
                  <h3 className="text-xs font-mono font-bold text-black uppercase tracking-wider mb-3">
                    ENGINEERING COMPLIANCE
                  </h3>
                  <div className="text-xs font-mono text-gray-600 space-y-1">
                    <p>• Calculations based on ASCE 7 wind load standards</p>
                    <p>• LRFD load combinations applied (1.2D + 1.6W)</p>
                    <p>
                      • Wind directionality factor (Kd) included in exposure
                      categories
                    </p>
                    <p>
                      • Group interaction effects considered for anchor spacing
                    </p>
                    <p>
                      • Chain link coefficient accounts for ~50% porosity per
                      CLFMI standards
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

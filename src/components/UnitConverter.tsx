import React, { useState } from "react";
import { Scale, RefreshCw, Clipboard, Check, ChevronRight, Calculator, Ruler, Thermometer, Box, Landmark } from "lucide-react";

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number; // convert to root base
  fromBase: (v: number) => number; // convert from root base
}

type CategoryId = "length" | "weight" | "temperature" | "volume" | "area";

export default function UnitConverter() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("length");
  const [activeValue, setActiveValue] = useState<number>(1);
  const [activeUnitId, setActiveUnitId] = useState<string>("m");
  const [copiedUnitId, setCopiedUnitId] = useState<string | null>(null);

  // Conversion definitions
  const categories: Record<CategoryId, { name: string; icon: any; units: UnitDef[] }> = {
    length: {
      name: "Length & Space",
      icon: Ruler,
      units: [
        { id: "m", name: "Metres", symbol: "m", toBase: (v) => v, fromBase: (v) => v },
        { id: "km", name: "Kilometres", symbol: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        { id: "cm", name: "Centimetres", symbol: "cm", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
        { id: "mm", name: "Millimetres", symbol: "mm", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { id: "in", name: "Inches", symbol: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
        { id: "ft", name: "Feet", symbol: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
        { id: "yd", name: "Yards", symbol: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
        { id: "mi", name: "Miles", symbol: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      ],
    },
    weight: {
      name: "Weight & Mass",
      icon: Scale,
      units: [
        { id: "kg", name: "Kilograms", symbol: "kg", toBase: (v) => v, fromBase: (v) => v },
        { id: "g", name: "Grams", symbol: "g", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { id: "mg", name: "Milligrams", symbol: "mg", toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
        { id: "lb", name: "Pounds", symbol: "lbs", toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
        { id: "oz", name: "Ounces", symbol: "oz", toBase: (v) => v * 0.028349523, fromBase: (v) => v / 0.028349523 },
        { id: "ton", name: "Metric Tons", symbol: "t", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      ],
    },
    temperature: {
      name: "Temperatures",
      icon: Thermometer,
      units: [
        { id: "C", name: "Celsius", symbol: "°C", toBase: (v) => v, fromBase: (v) => v },
        { id: "F", name: "Fahrenheit", symbol: "°F", toBase: (v) => (v - 32) * 5/9, fromBase: (v) => (v * 9/5) + 32 },
        { id: "K", name: "Kelvin", symbol: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
      ],
    },
    volume: {
      name: "Volume Capacities",
      icon: Box,
      units: [
        { id: "L", name: "Litres", symbol: "L", toBase: (v) => v, fromBase: (v) => v },
        { id: "ml", name: "Millilitres", symbol: "mL", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
        { id: "gal", name: "Gallons (US)", symbol: "gal", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
        { id: "cup", name: "Cups (US)", symbol: "cups", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
        { id: "m3", name: "Cubic Metres", symbol: "m³", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      ],
    },
    area: {
      name: "Area Coordinates",
      icon: Landmark,
      units: [
        { id: "m2", name: "Square Metres", symbol: "m²", toBase: (v) => v, fromBase: (v) => v },
        { id: "km2", name: "Square Kilometres", symbol: "km²", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
        { id: "ft2", name: "Square Feet", symbol: "ft²", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
        { id: "ac", name: "Acres", symbol: "ac", toBase: (v) => v * 4046.856, fromBase: (v) => v / 4046.856 },
        { id: "ha", name: "Hectares", symbol: "ha", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      ],
    },
  };

  const getComputedValue = (targetUnit: UnitDef) => {
    const currentCategory = categories[activeCategory];
    const sourceUnit = currentCategory.units.find((u) => u.id === activeUnitId);
    
    if (!sourceUnit) return 0;

    // Convert activeValue from sourceUnit to base
    const baseValue = sourceUnit.toBase(activeValue);

    // Convert baseValue to targetUnit
    const result = targetUnit.fromBase(baseValue);

    // Round formatting
    if (Math.abs(result) < 0.0001) {
      return Number(result.toExponential(4));
    }
    return Number(result.toFixed(5).replace(/\.?0+$/, ""));
  };

  const handleUnitValueChange = (unitId: string, valStr: string) => {
    const parsed = parseFloat(valStr);
    setActiveUnitId(unitId);
    setActiveValue(isNaN(parsed) ? 0 : parsed);
  };

  const handleCopyValue = (unitId: string, formulaVal: number) => {
    navigator.clipboard.writeText(String(formulaVal));
    setCopiedUnitId(unitId);
    setTimeout(() => setCopiedUnitId(null), 1500);
  };

  const currentCategoryData = categories[activeCategory];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <Calculator className="w-5 h-5" />
            </span>
            Equivalents Units Matrix
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Convert standard units seamlessly. Modify any value below to trigger real-time equivalent mesh calculations.
          </p>
        </div>
      </div>

      {/* Category Selection Bar */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
        {Object.entries(categories).map(([catId, item]) => {
          const IconComponent = item.icon;
          const isSelected = activeCategory === catId;
          return (
            <button
              key={catId}
              type="button"
              onClick={() => {
                setActiveCategory(catId as any);
                // Assign first unit as active trigger
                const targetDef = item.units[0];
                setActiveUnitId(targetDef.id);
                setActiveValue(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                isSelected
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Ratios Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {currentCategoryData.units.map((unit) => {
          const isSourceInput = activeUnitId === unit.id;
          const displayValue = isSourceInput ? activeValue : getComputedValue(unit);

          return (
            <div
              key={unit.id}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSourceInput
                  ? "border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/10 shadow-sm"
                  : "border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest truncate max-w-[130px]" title={unit.name}>
                  {unit.name}
                </span>
                <span className="font-mono text-xs font-extrabold text-cyan-500 bg-cyan-50 dark:bg-cyan-950/35 px-1.5 py-0.5 rounded">
                  {unit.symbol}
                </span>
              </div>

              <div className="relative mt-1">
                <input
                  type="number"
                  value={displayValue}
                  onChange={(e) => handleUnitValueChange(unit.id, e.target.value)}
                  className="w-full text-base font-mono font-bold bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-zinc-50 pr-8 p-0"
                />

                <button
                  type="button"
                  onClick={() => handleCopyValue(unit.id, displayValue)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition"
                  title="Copy unit value ratio"
                >
                  {copiedUnitId === unit.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clipboard className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula guide */}
      <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 text-[10px] text-gray-500 dark:text-zinc-400 flex items-center justify-between leading-relaxed">
        <div className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
          <span>Active matrix origin: <strong>{categories[activeCategory].units.find(u => u.id === activeUnitId)?.name}</strong> standard calibration scale.</span>
        </div>
        <span className="font-mono text-[9px] text-gray-400 hover:scale-105 transition cursor-pointer">
          [100% Client-Side Calculus Accuracy]
        </span>
      </div>
    </div>
  );
}

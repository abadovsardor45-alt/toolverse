import React, { useState, useEffect, useRef } from "react";
import { Palette, Lock, Unlock, Copy, Check, Sparkles, RefreshCw, Upload, Image, Compass } from "lucide-react";

interface ColorItem {
  hex: string;
  isLocked: boolean;
  name?: string;
}

export default function ColorPaletteCreator() {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  // AI Mood palette state
  const [mood, setMood] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState("");

  // Canvas extractor state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize with a beautiful set of 5 random pastel/neo-brutalist colors
  useEffect(() => {
    generateRandomPalette();

    // Listen to spacebar to lock/generate colors
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        generateRandomPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRandomHex = () => {
    const chars = "0123456789ABCDEF";
    let hex = "#";
    for (let i = 0; i < 6; i++) {
      hex += chars[Math.floor(Math.random() * 16)];
    }
    return hex;
  };

  const generateRandomPalette = () => {
    setColors((prev) => {
      // If empty or initial
      if (prev.length === 0) {
        return Array.from({ length: 5 }, () => ({
          hex: getRandomHex(),
          isLocked: false,
        }));
      }
      return prev.map((item) =>
        item.isLocked ? item : { ...item, hex: getRandomHex() }
      );
    });
  };

  const toggleLock = (index: number) => {
    setColors((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isLocked: !item.isLocked } : item
      )
    );
  };

  const copyHex = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setCopiedHex(hex);
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedHex(null);
    }, 1500);
  };

  // call server-side endpoint for AI suggest
  const generateAiPalette = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;

    setIsAiLoading(true);
    setAiTip("");

    try {
      const res = await fetch("/api/gemini/palette-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      if (!res.ok) throw new Error("API call failed");
      const data = await res.json();

      if (data && data.colors) {
        setColors(
          data.colors.map((c: any) => ({
            hex: c.hex.startsWith("#") ? c.hex : `#${c.hex}`,
            isLocked: false,
            name: c.name,
          }))
        );
        if (data.stylingTip) {
          setAiTip(data.stylingTip);
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback
      generateRandomPalette();
    } finally {
      setIsAiLoading(false);
    }
  };

  // Image extract canvas mechanism
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      const img = new window.Image();
      img.onload = () => {
        extractColorsFromImage(img);
      };
      img.src = url;
    }
  };

  const extractColorsFromImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, 150, 150);
    
    // Sample 5 coordinates to get unique visual colors across the canvas
    const samplePoints = [
      { x: 30, y: 30 },
      { x: 120, y: 30 },
      { x: 75, y: 75 },
      { x: 30, y: 120 },
      { x: 120, y: 120 }
    ];

    const extractedColors = samplePoints.map((pt) => {
      const pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      const rgbToHex = (r: number, g: number, b: number) => {
        return "#" + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        }).join("");
      };
      return {
        hex: rgbToHex(pixel[0], pixel[1], pixel[2]).toUpperCase(),
        isLocked: false,
        name: `Pixel sampled`
      };
    });

    setColors(extractedColors);
  };

  // Check brightness for white versus dark copy contrasts
  const isLightColor = (hex: string) => {
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // ITU-R BT.709
    return luma > 155;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
              <Palette className="w-5 h-5 animate-spin-slow" />
            </span>
            Color Palette Workshop
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Generate stunning cohesive color systems. Build templates, lock desired keys, upload brand images to extract pixels, or ask AI for creative schemes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            type="file"
            id="image-color-picker"
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("image-color-picker")?.click()}
            className="text-xs px-3 py-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" /> Extract from Photo
          </button>

          <button
            type="button"
            onClick={generateRandomPalette}
            className="text-xs px-3 py-1.5 bg-pink-600 hover:bg-pink-505 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Generate (Space)
          </button>
        </div>
      </div>

      {/* Primary Palette Board */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 h-48 sm:h-64 rounded-xl overflow-hidden shadow-inner border border-gray-100 dark:border-zinc-800">
        {colors.map((color, index) => {
          const lightText = isLightColor(color.hex);
          return (
            <div
              key={index}
              className="relative p-4 flex flex-col justify-end group transition-all duration-300 transform hover:scale-[1.01]"
              style={{ backgroundColor: color.hex }}
            >
              {/* Overlay elements */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition duration-200">
                <button
                  type="button"
                  onClick={() => toggleLock(index)}
                  className={`p-1.5 rounded shadow ${
                    lightText 
                      ? "bg-zinc-950/10 hover:bg-zinc-950/20 text-zinc-900" 
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                  title={color.isLocked ? "Unlock color column" : "Lock color column"}
                >
                  {color.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* HEX text click trigger */}
              <button
                type="button"
                onClick={() => copyHex(color.hex, index)}
                className={`text-left w-full rounded focus:outline-none ${
                  lightText ? "text-zinc-900" : "text-white"
                }`}
              >
                {color.name && (
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-75 truncate max-w-[100px]">
                    {color.name}
                  </p>
                )}
                <span className="font-mono text-base font-extrabold tracking-wider flex items-center gap-1">
                  {color.hex}
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-green-500 bg-white dark:bg-zinc-950 p-0.5 rounded-full" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-60 transition" />
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {copiedHex && (
        <div className="text-center">
          <span className="inline-block text-[10px] bg-green-500 text-white rounded-full px-3 py-1 font-semibold animate-bounce">
            Copied Hex Color Code: {copiedHex}!
          </span>
        </div>
      )}

      {/* Auxiliary interactive forms */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        {/* Gemini AI Powered Palette Generator */}
        <div className="md:col-span-6 p-5 border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-pink-500 bg-pink-50 dark:bg-pink-950/20 px-2 py-0.5 rounded inline-flex items-center gap-1 w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Gemini Spark Curations
          </h3>

          <form onSubmit={generateAiPalette} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Describe your project, app, or canvas theme mood:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="e.g., retro 80s arcade, coffee cozy shop, neon digital synthwave"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-850 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !mood.trim()}
                  className="px-3 py-2 bg-pink-600 hover:bg-pink-505 text-white font-semibold text-xs rounded-lg hover:shadow transition disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                >
                  {isAiLoading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5" /> Suggest
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {aiTip && (
            <div className="p-3 bg-amber-50/50 dark:bg-zinc-800/20 border border-amber-100 dark:border-zinc-800 text-[10px] text-zinc-650 dark:text-zinc-400 italic">
              ✨ <strong>Designer advice:</strong> {aiTip}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <span>Try topics:</span>
            {["Desert Sage", "Neon Cyberpunk", "Muted Pastel"].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setMood(topic)}
                className="hover:text-pink-500 hover:underline"
              >
                "{topic}"
              </button>
            ))}
          </div>
        </div>

        {/* Photo Color extractor state display */}
        <div className="md:col-span-6 p-5 border border-gray-105 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-xl flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-pink-500" /> Photo Extraction Monitor
            </h3>
            {imagePreview ? (
              <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                Sampling vector points inside image buffer canvas onto the active color palette. Upload a different photo to sample new shades.
              </p>
            ) : (
              <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                Do you have a beautiful design image? Upload your photo file, and our canvas will sample pixel coordinates to extract matching colors instantly!
              </p>
            )}
          </div>

          <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Pre-sampler representation"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("image-color-picker")?.click()}
                  className="absolute inset-0 bg-black/60 text-white text-[9px] opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold transition"
                >
                  Change Photo
                </button>
              </>
            ) : (
              <Palette className="w-6 h-6 stroke-1 text-gray-300 dark:text-zinc-700" />
            )}

            {/* Micro layout SAMPLER canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { Scissors, Check, Sliders, Download, Sparkles, Wand2, Eye } from "lucide-react";

export default function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [processedImageUrl, setProcessedImageUrl] = useState("");
  const [chromaColor, setChromaColor] = useState({ r: 255, g: 255, b: 255 }); // Defaults to White (#ffffff)
  const [tolerance, setTolerance] = useState(40); // Sensitivity
  const [feather, setFeather] = useState(2); // Border smoothing radius
  const [isProcessing, setIsProcessing] = useState(false);
  const [visualMode, setVisualMode] = useState<"checkerboard" | "dark" | "light">("checkerboard");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Trigger processing whenever parameters change
  useEffect(() => {
    if (originalImageUrl) {
      processImage();
    }
  }, [originalImageUrl, chromaColor, tolerance, feather]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const loadFile = (srcFile: File) => {
    if (!srcFile.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    setFile(srcFile);
    setProcessedImageUrl("");

    const url = URL.createObjectURL(srcFile);
    setOriginalImageUrl(url);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      // Create a temporary canvas to get the raw un-manipulated image pixel to copy its color correctly
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      const img = imageRef.current;
      if (tempCtx && img) {
        tempCtx.drawImage(img, 0, 0);
        const pixel = tempCtx.getImageData(x, y, 1, 1).data;
        setChromaColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      }
    } catch (err) {
      console.error("Failed to pick pixel color", err);
    }
  };

  const processImage = () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    setIsProcessing(true);

    // Wait a brief tick for render threads
    setTimeout(() => {
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const targetR = chromaColor.r;
      const targetG = chromaColor.g;
      const targetB = chromaColor.b;
      
      const parsedTolerance = tolerance * 1.5; // Scale tolerance range linearly
      const featherFactor = Math.max(1, feather);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Euclidean color distance
        const distance = Math.sqrt(
          (r - targetR) * (r - targetR) +
          (g - targetG) * (g - targetG) +
          (b - targetB) * (b - targetB)
        );

        if (distance < parsedTolerance) {
          // Inside tolerance, punch alpha transparency
          data[i+3] = 0;
        } else if (distance < parsedTolerance + featherFactor * 10) {
          // Feathering transition boundaries
          const diff = distance - parsedTolerance;
          const ratio = diff / (featherFactor * 10);
          data[i+3] = Math.round(ratio * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedImageUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    }, 100);
  };

  // Preset background picker handler
  const selectCommonHex = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    setChromaColor({ r, g, b });
  };

  const handleDownload = () => {
    if (!processedImageUrl) return;
    const downloadLink = document.createElement("a");
    const nameWithoutExt = file?.name.substring(0, file.name.lastIndexOf(".")) || "transparent_subject";
    downloadLink.download = `${nameWithoutExt}_no_bg.png`;
    downloadLink.href = processedImageUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const getCommonHexLabel = () => {
    const componentToHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${componentToHex(chromaColor.r)}${componentToHex(chromaColor.g)}${componentToHex(chromaColor.b)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Scissors className="w-5 h-5 animate-pulse" />
            </span>
            Chroma Key Backdrop Remover
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Remove background backdrops instantly. Click any color in the monitor, or select a preset to make that color transparent.
          </p>
        </div>
        {file && (
          <button 
            type="button"
            onClick={() => {
              setFile(null);
              setOriginalImageUrl("");
              setProcessedImageUrl("");
            }}
            className="text-xs px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-medium transition"
          >
            Clear Canvas
          </button>
        )}
      </div>

      {!file ? (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl py-12 px-4 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-zinc-900/50 transition-all duration-200 flex flex-col items-center group"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400 mb-4 group-hover:scale-110 transition duration-300">
            <Scissors className="w-10 h-10" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-zinc-200 text-base">Drag & drop your backdrop image</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs mt-2">
            For best results, upload images with consistent solid backgrounds (white, green screens, or grey backdrops).
          </p>
          <button 
            type="button"
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition"
          >
            Import Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-4 animate-fade-in">
            <div className="p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Parameters
              </h3>

              {/* Selected color display */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">Target Backdrop Color</span>
                  <span className="font-mono text-zinc-500 font-bold">{getCommonHexLabel()}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-inner border border-gray-200 dark:border-zinc-700 flex-shrink-0"
                    style={{ backgroundColor: `rgb(${chromaColor.r}, ${chromaColor.g}, ${chromaColor.b})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400">Selected coordinate channels:</p>
                    <p className="text-xs font-mono text-gray-700 dark:text-zinc-300 font-semibold truncate">
                      RGB({chromaColor.r}, {chromaColor.g}, {chromaColor.b})
                    </p>
                  </div>
                </div>

                {/* Quick select presets */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] text-gray-400 block">Preset Backdrops:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { hex: "#ffffff", label: "White" },
                      { hex: "#00ff00", label: "Green" },
                      { hex: "#000000", label: "Black" },
                      { hex: "#f3f4f6", label: "Grey" },
                      { hex: "#3b82f6", label: "Blue" }
                    ].map((p) => {
                      const isSelected = getCommonHexLabel() === p.hex.toUpperCase();
                      return (
                        <button
                          key={p.hex}
                          type="button"
                          onClick={() => selectCommonHex(p.hex)}
                          className={`px-2 py-1 text-[10px] rounded border font-semibold transition-all flex items-center gap-1 ${
                            isSelected 
                              ? "bg-indigo-500 border-indigo-500 text-white" 
                              : "border-gray-150 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full border border-gray-100" style={{ backgroundColor: p.hex }} />
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tolerance Sensitivity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">Tolerance (Key Sensitivity)</span>
                  <span className="font-mono text-indigo-500 font-bold">{tolerance}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={tolerance}
                  onChange={(e) => setTolerance(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[9px] text-gray-400 dark:text-zinc-500 leading-relaxed">
                  Increase sensitivity if residual backdrop elements remain; reduce it if foreground subjects are leaking transparent.
                </p>
              </div>

              {/* Feathering edge slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">Feathering (Edge Softness)</span>
                  <span className="font-mono text-indigo-500 font-bold">{feather} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={feather}
                  onChange={(e) => setFeather(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[9px] text-gray-400 dark:text-zinc-500 leading-relaxed">
                  Applies anti-aliasing to smooth pixelated visual boundaries.
                </p>
              </div>

              {/* Download output */}
              {processedImageUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Save Transparent PNG
                </button>
              )}
            </div>

            {/* Instruction Banner */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-indigo-50/30 dark:bg-zinc-950/20 text-[10px] text-gray-500 dark:text-zinc-400 flex gap-2.5 leading-relaxed">
              <Wand2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-bold text-gray-700 dark:text-zinc-300">Pro-Tip Color Selection:</p>
                <p className="mt-0.5">Simply click directly on any color in the left monitor image below to instantly sample that color code and adjust transparency bounds in real-time!</p>
              </div>
            </div>
          </div>

          {/* Monitors Canvas view */}
          <div className="lg:col-span-8 space-y-4">
            {/* Visual background checker selection */}
            <div className="flex items-center justify-between border border-gray-100 dark:border-zinc-800 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900/80">
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Backdrop Transparency Monitor
              </span>
              <div className="flex items-center gap-1.5">
                {(["checkerboard", "dark", "light"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setVisualMode(mode)}
                    className={`px-2 py-1 text-[9px] font-semibold border rounded transition capitalize ${
                      visualMode === mode
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-600 dark:text-indigo-400"
                        : "border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid display comparing original & extracted outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Screen */}
              <div className="border border-gray-150 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
                <div className="px-3.5 py-2 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 text-[10px] font-bold text-gray-500 dark:text-zinc-400 flex justify-between items-center">
                  <span>Source Screen (Click to pick color)</span>
                  <span className="text-[9px] text-indigo-500 italic">Eye Dropper Ready</span>
                </div>
                <div className="p-4 flex-1 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/10 min-h-[220px]">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="max-h-[200px] rounded-lg shadow-sm border border-gray-150 dark:border-zinc-800 object-contain cursor-crosshair hover:opacity-90 max-w-full"
                  />
                  {/* Invisible Image target for pixel mapping */}
                  <img
                    ref={imageRef}
                    src={originalImageUrl}
                    onLoad={processImage}
                    alt="Source invisible"
                    className="hidden"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Processed output Screen */}
              <div className="border border-gray-150 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
                <div className="px-3.5 py-2 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 text-[10px] font-bold text-gray-500 dark:text-zinc-400 flex justify-between items-center">
                  <span>Mask Output Result</span>
                  {isProcessing && <span className="text-[9px] font-mono text-indigo-500 animate-pulse">Alpha-punching...</span>}
                </div>
                
                <div className={`p-4 flex-1 flex items-center justify-center min-h-[220px] relative ${
                  visualMode === "checkerboard" 
                    ? "bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-white dark:bg-zinc-900" 
                    : visualMode === "dark" 
                      ? "bg-zinc-950" 
                      : "bg-white"
                }`}>
                  {processedImageUrl ? (
                    <div className="text-center relative">
                      <img
                        src={processedImageUrl}
                        alt="Background removed display preview"
                        className="max-h-[200px] object-contain mx-auto"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 animate-pulse">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 dark:text-zinc-500 space-y-1.5">
                      <Sparkles className="w-8 h-8 mx-auto animate-pulse stroke-1" />
                      <p className="text-[10px]">Processing transparency mask...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

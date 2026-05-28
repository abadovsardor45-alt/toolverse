import React, { useState, useRef } from "react";
import { Image, Download, Check, Sparkles, Sliders, Play, HardDrive } from "lucide-react";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<"png" | "jpeg" | "webp" | "bmp">("png");
  const [quality, setQuality] = useState<number>(0.9);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string>("");
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert("Please upload a valid image file.");
      return;
    }
    setFile(srcFile);
    setConvertedUrl("");
    setConvertedSize(0);

    const url = URL.createObjectURL(srcFile);
    setPreviewUrl(url);

    // Get original image dimensions
    const img = new window.Image();
    img.onload = () => {
      setDimensions({ w: img.width, h: img.height });
    };
    img.src = url;
  };

  const triggerConversion = () => {
    if (!file || !previewUrl) return;
    setIsConverting(true);

    setTimeout(() => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          setIsConverting(false);
          alert("Could not process image on canvas");
          return;
        }

        // Handle alpha transparent background fill for jpeg conversions
        if (targetFormat === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeTypes = {
          png: "image/png",
          jpeg: "image/jpeg",
          webp: "image/webp",
          bmp: "image/bmp"
        };

        const targetMime = mimeTypes[targetFormat] || "image/png";

        // Convert can only handle quality settings on jpeg/webp
        const actualQuality = (targetFormat === "jpeg" || targetFormat === "webp") ? quality : undefined;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setConvertedUrl(url);
              setConvertedSize(blob.size);
            }
            setIsConverting(false);
          },
          targetMime,
          actualQuality
        );
      };
      
      img.src = previewUrl;
    }, 600);
  };

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const downloadLink = document.createElement("a");
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    downloadLink.download = `${nameWithoutExt}.${targetFormat}`;
    downloadLink.href = convertedUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const resetAll = () => {
    setFile(null);
    setPreviewUrl("");
    setConvertedUrl("");
    setConvertedSize(0);
    setDimensions(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Image className="w-5 h-5" />
            </span>
            Offline Image Converter
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Convert standard image files instantly to PNG, JPG, WebP, or BMP directly on your browser canvas with adjustable quality thresholds.
          </p>
        </div>
        {file && (
          <button 
            onClick={resetAll}
            className="text-xs px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-medium transition"
          >
            Clear Upload
          </button>
        )}
      </div>

      {!file ? (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl py-12 px-4 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-zinc-900/50 transition-all duration-200 flex flex-col items-center group"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400 mb-4 group-hover:scale-110 transition duration-300">
            <Image className="w-10 h-10" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-zinc-200 text-base">Drag & drop your source image here</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs mt-2">
            Supports HEIC, PNG, JPG, WebP, GIF, SVG or BMP formats.
          </p>
          <button 
            type="button"
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition animate-fade-in"
          >
            Locate Local Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-4 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Parameters
              </h3>

              {/* Format selection */}
              <div className="space-y-2 mb-5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                  Select Output Format
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["png", "jpeg", "webp", "bmp"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        setTargetFormat(fmt);
                        setConvertedUrl("");
                      }}
                      className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition text-center capitalize ${
                        targetFormat === fmt
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 bg-transparent"
                      }`}
                    >
                      {fmt === "jpeg" ? "JPG" : fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider */}
              {(targetFormat === "jpeg" || targetFormat === "webp") && (
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700 dark:text-zinc-300">Compression Quality</span>
                    <span className="font-mono text-blue-500 font-bold">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseFloat(e.target.value));
                      setConvertedUrl("");
                    }}
                    className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                    Lowering quality increases compression ratio, reducing file sizes for fast web loads.
                  </p>
                </div>
              )}

              {/* Convert Trigger */}
              {!convertedUrl ? (
                <button
                  type="button"
                  onClick={triggerConversion}
                  disabled={isConverting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Converting Pixels...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Compress & Convert
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold text-xs rounded-lg transition shadow flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Converted File
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setConvertedUrl("")}
                    className="w-full py-2 bg-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-400 text-[10px] text-center"
                  >
                    Configure Different Format
                  </button>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 text-xs text-gray-500 dark:text-zinc-400 space-y-3">
              <h4 className="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-gray-400" /> Space Metrics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800">
                  <p className="text-[10px] text-gray-400">Original Size</p>
                  <p className="font-mono font-bold text-gray-700 dark:text-zinc-300">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="p-2 rounded bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800">
                  <p className="text-[10px] text-gray-400">Converted Size</p>
                  <p className="font-mono font-bold text-blue-500">
                    {convertedSize ? `${(convertedSize / 1024).toFixed(1)} KB` : "Pending..."}
                  </p>
                </div>
              </div>
              {convertedSize > 0 && (
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  {convertedSize < file.size ? (
                    <span>Reduced size by <strong className="text-green-500">{((1 - convertedSize / file.size) * 100).toFixed(0)}%</strong>!</span>
                  ) : (
                    <span>High quality scale preserved.</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Interactive display */}
          <div className="lg:col-span-8 flex flex-col border border-gray-100 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden min-h-[350px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">File Canvas Monitor</span>
              {dimensions && (
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  {dimensions.w} × {dimensions.h} px
                </span>
              )}
            </div>

            <div className="flex-1 p-6 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/20">
              {convertedUrl ? (
                <div className="text-center space-y-3 relative group max-w-sm">
                  <img
                    src={convertedUrl}
                    alt="Converted output preview"
                    className="max-h-[240px] rounded-lg shadow-md border border-gray-250 dark:border-zinc-800 object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  <div className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 px-2.5 py-1 rounded-full font-bold">
                    <Check className="w-3.5 h-3.5" /> Output Ready for Download
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 max-w-sm">
                  <img
                    src={previewUrl}
                    alt="Original custom preview"
                    className="max-h-[240px] rounded-lg shadow border border-gray-200 dark:border-zinc-800/80 object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-[11px] text-gray-400">Original upload image. Use options in the left side navigation to start conversion.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

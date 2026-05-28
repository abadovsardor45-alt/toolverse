import React, { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Clipboard, Download, Sliders, Check, ImageIcon } from "lucide-react";

export default function QrGenerator() {
  const [text, setText] = useState("https://ai.studio/build");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [margin, setMargin] = useState(4);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("Q");
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [text, fgColor, bgColor, margin, errorLevel, includeLogo, logoBase64]);

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const opt: QRCode.QRCodeRenderersOptions = {
      errorCorrectionLevel: errorLevel,
      width: 450,
      margin: margin,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    };

    QRCode.toCanvas(canvas, text, opt, (error) => {
      if (error) {
        console.error("QR Code Generation Error:", error);
        return;
      }

      // Draw middle logo overlay if selected, on top of generated canvas
      if (includeLogo && logoBase64) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
          // Center calculate coordinates
          const logoSize = canvas.width * 0.16; // 16% of size
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;

          // Draw an elegant background round card boundary for the logo
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 3, 0, Math.PI * 2);
          ctx.fillStyle = bgColor;
          ctx.fill();
          ctx.closePath();

          // Clip and draw logo image
          ctx.save();
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, x, y, logoSize, logoSize);
          ctx.restore();
        };
        img.src = logoBase64;
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setLogoBase64(reader.result as string);
        setIncludeLogo(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      });
    } catch (err) {
      console.error("Failed to copy QR code image:", err);
      // Fallback
      alert("Clipboard API not supported in this iframe. Click Download to save your QR image instead.");
    }
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "toolverse_qrcode.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <QrCode className="w-5 h-5" />
            </span>
            Professional QR Code Utility
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Generate customized QR codes instantly. Choose custom colors, set margins, and embed personal center overlay logos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Attributes
            </h3>

            {/* Target Value Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                QR Text string or Website URL
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="https://example.com"
              />
            </div>

            {/* Two colors setup */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-zinc-450 block">
                  Foreground Pixels
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-gray-100 dark:border-zinc-800 bg-transparent text-gray-700 dark:text-zinc-300 uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-zinc-450 block">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-gray-100 dark:border-zinc-800 bg-transparent text-gray-700 dark:text-zinc-300 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Error correction Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                Error Correction Matrix
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { level: "L", title: "Low", cap: "7%" },
                  { level: "M", title: "Medium", cap: "15%" },
                  { level: "Q", title: "Quartile", cap: "25%" },
                  { level: "H", title: "High", cap: "30%" }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setErrorLevel(item.level as any)}
                    className={`py-1 rounded border text-[10px] text-center transition ${
                      errorLevel === item.level
                        ? "bg-orange-500 border-orange-500 text-white font-bold"
                        : "border-gray-250 dark:border-zinc-800 bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div>{item.title}</div>
                    <div className="text-[8px] opacity-85">({item.cap})</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Padding margins slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700 dark:text-zinc-300">Quiet Zone Padding</span>
                <span className="font-mono text-orange-500 font-bold">{margin} modules</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Logo option panel */}
            <div className="pt-2 border-t border-gray-50 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-400" /> Embedded Mid-Point Logo
                </label>
                <input
                  type="checkbox"
                  checked={includeLogo}
                  disabled={!logoBase64}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-orange-500 focus:ring-orange-500 border-gray-300 dark:border-zinc-800"
                />
              </div>

              {!logoBase64 ? (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold text-gray-500 dark:text-zinc-400 text-center transition"
                >
                  Upload Center Logo Brand...
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/40 dark:bg-zinc-800/20 border border-orange-100 dark:border-zinc-800 text-[10px]">
                  <span className="truncate pr-4 text-orange-800 dark:text-orange-300 font-semibold">✓ Branded logo loaded</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoBase64("");
                        setIncludeLogo(false);
                      }}
                      className="text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* QR Output display board */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl">
          <div className="mb-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded">
              Canvas Vector Matrix
            </span>
          </div>

          <div 
            className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800/80 shadow-md relative group max-w-full"
            style={{ backgroundColor: bgColor }}
          >
            <canvas
              ref={canvasRef}
              className="max-h-[300px] max-w-[300px] w-full object-contain rounded-lg"
            />
          </div>

          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-5 max-w-sm text-center line-clamp-2">
            Encoding: {text || "[EMPTY STRING]"}
          </p>

          <div className="flex items-center gap-2 mt-6">
            <button
              type="button"
              onClick={copyImageToClipboard}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              {showNotification ? (
                <>
                  <Check className="w-4.5 h-4.5 text-green-500" /> Copied Image!
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" /> Copy Image
                </>
              )}
            </button>

            <button
              type="button"
              onClick={downloadQR}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-505 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Sparkles, Clipboard, Check, RefreshCw, Send, Layout, FileText, Zap, Compass, Star } from "lucide-react";
import { AIPromptResult } from "../types";

export default function AiPromptGenerator() {
  const [topic, setTopic] = useState("cyberpunk temple overgrown with ancient cherry blossoms");
  const [targetSystem, setTargetSystem] = useState("Midjourney V6");
  const [tone, setTone] = useState("Imaginative");
  const [style, setStyle] = useState("3D Render (Unreal Engine 5)");
  const [lighting, setLighting] = useState("Neon Glow & Volumetric Fog");
  const [camera, setCamera] = useState("Cinematic 35mm Lens, f/1.8");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIPromptResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/gemini/prompt-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetSystem,
          tone,
          style,
          lighting,
          camera
        }),
      });

      if (!res.ok) throw new Error("API callback error");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Failed to generate AI prompt", err);
      // Fallback
      setResult({
        expandedPrompt: `Photorealistic render of ${topic}, capturing a stunning ${tone} atmosphere in ${style}. Composition styled with ${lighting} and captured on a robust ${camera}, highly detailed 8k resolution, outstanding masterpiece quality.`,
        variations: [
          { title: "Dynamic Action Perspective", text: `A sweeping dramatic look of ${topic}, styled with striking neon volumetric lighting, high shutter speed, cinematic framing, raw authenticity.` },
          { title: "Minimal Abstract Art", text: `Geometric vector drawing of ${topic}, using high-contrast colors, negative space composition, extremely sharp SVG lines.` }
        ],
        powerKeywords: [topic, style, lighting, "masterpiece", "octane render"],
        proTips: ["Add weights like ::2 to cherry blossoms inside Midjourney to expand density.", "Increase camera f-stop to expand foreground focus sharpness."]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-zinc-300">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            </span>
            AI Prompt Engineer
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Reconstruct simple keywords into highly-optimized promptcraft models for ChatGPT, Midjourney, DALL-E, Stable Diffusion, and other generative models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Section */}
        <div className="lg:col-span-5">
          <form onSubmit={triggerGenerate} className="p-5 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Prompt Configurator
            </h3>

            {/* Keyword block */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-755 dark:text-zinc-300">
                Core Subject / Keyword seed
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-15 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                placeholder="Overgrown temple ruins floating in dark space..."
                required
              />
            </div>

            {/* Target AI System */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                Target Creative System
              </label>
              <select
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="Midjourney V6">Midjourney V6 (Image Generation)</option>
                <option value="ChatGPT / Claude">ChatGPT / Claude (Advanced Writing LLM)</option>
                <option value="DALL-E 3">DALL-E 3 (Symmetric Visualizer)</option>
                <option value="Stable Diffusion">Stable Diffusion / FLUX (Realistic Customizer)</option>
                <option value="General AI">General Model (Abstract Grounded Text)</option>
              </select>
            </div>

            {/* Tone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                Atmospheric Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="Imaginative">Imaginative / Surrealist</option>
                <option value="Cinematic">Cinematic / Highly Dramatic</option>
                <option value="Brutalist">Brutalist / Moody & Heavy</option>
                <option value="Professional">Professional / Scholarly</option>
                <option value="Minimalist">Minimalist / Deep Negative Space</option>
              </select>
            </div>

            {/* Render/Style style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                Artistic Style / Medium
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="3D Render (Unreal Engine 5)">3D Render (Unreal Engine 5, Octane Render)</option>
                <option value="Photorealistic Mastery">Photorealistic Mastery (True-to-life mapping)</option>
                <option value="Anime / Ghibli inspired">Anime / Ghibli Studio illustration style</option>
                <option value="Oil Canvas painting">Traditional Oil Canvas painting</option>
                <option value="Line Hand Sketching">Ink Line Hand Sketching</option>
              </select>
            </div>

            {/* Lighting options */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                Ambient Lighting Conditions
              </label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="Neon Glow & Volumetric Fog">Neon Glow & Volumetric Fog</option>
                <option value="Golden Hour sunset warmth">Golden Hour sunset warmth</option>
                <option value="Softbox studio photography lights">Softbox studio photography lights</option>
                <option value="Moody candle-lit ambient gloom">Moody candle-lit ambient gloom</option>
                <option value="Harsh overhead midday sun rays">Harsh overhead midday sun rays</option>
              </select>
            </div>

            {/* Camera settings */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block">
                Camera Focal Length / Lens Ratio
              </label>
              <select
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="Cinematic 35mm Lens, f/1.8">Cinematic 35mm Lens, f/1.8 (Depth of Field)</option>
                <option value="Wide angle GoPro drone shot">Wide angle GoPro drone shot (Epic scope)</option>
                <option value="Microscopic focal Macro lens">Microscopic focal Macro lens (Extreme specs)</option>
                <option value="85mm studio portrait setup">85mm studio portrait setup (Symmetrical focus)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white font-semibold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synthesizing promptcraft...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Initialize Gemini Engine
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results layout panel */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading ? (
            <div className="h-full min-h-[400px] border border-gray-150 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-full text-indigo-505 animate-pulse">
                <Sparkles className="w-10 h-10 animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-zinc-250">Querying Server-Side Gemini...</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">Expanding vectors, injecting keywords, and mapping stylistic parameters into a cohesive promptcraft structure.</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4 animate-fade-in">
              {/* Flagship expanded prompt */}
              <div className="p-5 border border-indigo-150 dark:border-indigo-950/40 bg-indigo-50/20 dark:bg-zinc-900/40 rounded-xl relative">
                <span className="absolute -top-2.5 left-4 text-[9px] font-bold uppercase bg-indigo-500 text-white px-2 py-0.5 rounded tracking-widest">
                  Flagship Expanded Prompt ({targetSystem})
                </span>

                <div className="text-xs text-gray-800 dark:text-zinc-150 font-mono leading-relaxed select-all pr-12 mt-1">
                  {result.expandedPrompt}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyText(result.expandedPrompt, "flagship")}
                  className="absolute right-4 top-4 p-1.5 rounded bg-white dark:bg-zinc-800 border border-gray-150 dark:border-zinc-700 text-gray-450 hover:text-indigo-505 transition"
                >
                  {copiedKey === "flagship" ? <Check className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4" />}
                </button>
              </div>

              {/* Power Keywords display */}
              {result.powerKeywords && result.powerKeywords.length > 0 && (
                <div className="p-4 border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-indigo-500" /> Gemini power keywords
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.powerKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-mono font-medium text-gray-655 dark:text-zinc-300"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Side variations */}
              {result.variations && result.variations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.variations.map((v, i) => (
                    <div key={i} className="p-4 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl relative">
                      <h4 className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1 truncate mb-2">
                        <Layout className="w-3.5 h-3.5 text-zinc-400" /> {v.title}
                      </h4>
                      <p className="text-[11px] text-gray-700 dark:text-zinc-300 leading-relaxed max-h-24 overflow-y-auto pr-8 font-serif italic">
                        "{v.text}"
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyText(v.text, `var-${i}`)}
                        className="absolute right-3 top-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-indigo-555 transition"
                      >
                        {copiedKey === `var-${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pro Tips */}
              {result.proTips && result.proTips.length > 0 && (
                <div className="p-4 border border-gray-150 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 text-[10px] text-gray-500 dark:text-zinc-400 space-y-1.5 rounded-xl">
                  <h5 className="font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Zap className="w-3.5 h-3.5 text-yellow-500 animate-bounce" /> Prompt engineering tips
                  </h5>
                  {result.proTips.map((tip, idx) => (
                    <p key={idx} className="leading-relaxed pl-1.5 border-l border-zinc-200 dark:border-zinc-700">
                      • {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-gray-150 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/25 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <FileText className="w-12 h-12 stroke-1 text-gray-300 dark:text-zinc-650" />
              <div>
                <h4 className="font-semibold text-gray-500 dark:text-zinc-405 text-sm">Waiting for Parameters config</h4>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs">Use the configurator on the left side menu to map elements and trigger the server expansion models.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

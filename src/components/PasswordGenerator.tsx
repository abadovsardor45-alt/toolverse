import React, { useState, useEffect } from "react";
import { Key, Copy, Check, RefreshCw, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [hidePassword, setHidePassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generatePassword(false); // Generate initially without playing sound
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar]);

  // Tactile mechanical sound synthesizer using clean browser Web Audio oscillators
  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context block safely ignored
    }
  };

  const generatePassword = (playSound = true) => {
    if (playSound) playTickSound();

    let chars = "";
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";

    if (excludeSimilar) {
      // Exclude characters like i, l, 1, L, o, 0, O
      chars = chars.replace(/[il1Lo0O|I]/g, "");
    }

    if (!chars) {
      setPassword("Select at least one option");
      return;
    }

    let result = "";
    const charArray = chars.split("");
    for (let i = 0; i < length; i++) {
      const rnd = Math.floor(Math.random() * charArray.length);
      result += charArray[rnd];
    }
    setPassword(result);
    setCopied(false);
  };

  const handleCopy = () => {
    if (password === "Select at least one option") return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const calculateStrength = () => {
    let score = 0;
    if (password.length > 8) score += 1;
    if (password.length > 12) score += 1;
    if (password.length > 18) score += 1;
    
    // Check varieties
    let variations = 0;
    if (/[a-z]/.test(password)) variations++;
    if (/[A-Z]/.test(password)) variations++;
    if (/[0-9]/.test(password)) variations++;
    if (/[^a-zA-Z0-9]/.test(password)) variations++;
    
    score += Math.floor(variations / 2);

    if (score <= 1) return { label: "Very Weak", color: "bg-red-500", text: "text-red-500", percent: "25%" };
    if (score === 2) return { label: "Weak Security", color: "bg-orange-500", text: "text-orange-500", percent: "45%" };
    if (score === 3) return { label: "Moderate Protection", color: "bg-yellow-500", text: "text-yellow-500", percent: "65%" };
    if (score === 4) return { label: "Highly Secure", color: "bg-green-500", text: "text-green-500", percent: "85%" };
    return { label: "Military-Grade Unbreakable", color: "bg-emerald-500", text: "text-emerald-500", percent: "100%" };
  };

  const strength = calculateStrength();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Key className="w-5 h-5" />
            </span>
            Military-Grade Password Tool
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Generate complex non-custodial passwords locally. High options customizability, entropy levels checking, and tactile interactions.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Output deck container */}
        <div className="p-4 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 relative">
          <div className="flex items-center justify-between">
            <div className={`text-base font-mono font-bold select-all overflow-x-auto whitespace-pre pr-12 min-h-[1.5rem] tracking-wider ${
              hidePassword ? "blur-md select-none pointer-events-none" : "text-gray-900 dark:text-zinc-100"
            }`}>
              {password}
            </div>
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHidePassword(!hidePassword)}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-zinc-850 text-gray-400 hover:text-gray-600 font-medium transition"
                title={hidePassword ? "Reveal characters" : "Obscure password"}
              >
                {hidePassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-zinc-850 text-gray-400 hover:text-emerald-500 font-medium transition"
                title="Copy secure password"
              >
                {copied ? <Check className="w-4.5 h-4.5 text-green-500" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Strength indicators */}
        <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Entropy Strength:
            </span>
            <span className={`font-bold ${strength.text}`}>{strength.label}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
              style={{ width: strength.percent }}
            />
          </div>
        </div>

        {/* Configurations grid */}
        <div className="p-5 rounded-xl border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-5">
          {/* Length selection slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-700 dark:text-zinc-300">Password Length</span>
              <span className="font-mono text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                {length} characters
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-gray-50 dark:border-zinc-800/80">
            <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-3">
              Included Character Matrices
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Checkboxes */}
              {[
                { state: includeUpper, setter: setIncludeUpper, label: "Uppercase Letters (A-Z)" },
                { state: includeLower, setter: setIncludeLower, label: "Lowercase Letters (a-z)" },
                { state: includeNumbers, setter: setIncludeNumbers, label: "Numbers (0-9)" },
                { state: includeSymbols, setter: setIncludeSymbols, label: "Special Symbols (!@#$%...)" },
              ].map((c, i) => (
                <label key={i} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={c.state}
                    onChange={(e) => c.setter(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 dark:border-zinc-700 bg-transparent"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          {/* Exclude Similar Character Option */}
          <div className="pt-4 border-t border-gray-50 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 text-xs text-gray-650 dark:text-zinc-350 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeSimilar}
                onChange={(e) => setExcludeSimilar(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-emerald-500 focus:ring-emerald-500 border-gray-300 dark:border-zinc-700 bg-transparent"
              />
              Avoid Similar Characters (e.g. 1 & l, o & 0)
            </label>
          </div>

          <button
            type="button"
            onClick={() => generatePassword(true)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-505 text-white font-semibold text-xs rounded-lg transition shadow flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Force Regenerate
          </button>
        </div>

        {/* Safety Disclaimer */}
        <div className="text-center">
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 fill-current" />
            Zero network requests: All operations are conducted locally in your sandboxed browser thread.
          </p>
        </div>
      </div>
    </div>
  );
}

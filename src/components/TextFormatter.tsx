import React, { useState } from "react";
import { CaseSensitive, Clipboard, Check, RefreshCw, Eraser, Search, Clock, FileText, FileSpreadsheet } from "lucide-react";

export default function TextFormatter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Find & Replace state
  const [findWord, setFindWord] = useState("");
  const [replaceWord, setReplaceWord] = useState("");

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCaseChange = (mode: "upper" | "lower" | "title" | "sentence" | "slug" | "trim") => {
    if (!text) return;

    let res = text;
    if (mode === "upper") {
      res = text.toUpperCase();
    } else if (mode === "lower") {
      res = text.toLowerCase();
    } else if (mode === "title") {
      res = text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else if (mode === "sentence") {
      res = text
        .split(". ")
        .map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1))
        .join(". ");
    } else if (mode === "slug") {
      res = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    } else if (mode === "trim") {
      res = text.trim().replace(/\s+/g, " ");
    }

    setText(res);
  };

  const handleFindReplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findWord) return;
    // Simple global replace
    const escaped = findWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); // escape regex chars
    const regex = new RegExp(escaped, "g");
    const updated = text.replace(regex, replaceWord);
    setText(updated);
  };

  const clearText = () => {
    setText("");
  };

  // Metrics
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const lineCount = text.split("\n").filter(Boolean).length;
  const readTimeSeconds = Math.ceil((wordCount / 200) * 60); // Average 200 Words Per Minute (WPM)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <CaseSensitive className="w-5 h-5" />
            </span>
            Text Formatter & Copywriter Deck
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Reformat characters case structure instantly. Slugify URLs, run find/replace tasks, purge spaces, and monitor complete typography metrics.
          </p>
        </div>
        {text && (
          <button 
            type="button"
            onClick={clearText}
            className="text-xs px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-450 dark:text-zinc-400 font-medium transition flex items-center gap-1"
          >
            <Eraser className="w-3.5 h-3.5" /> Clear Text
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Screen */}
        <div className="lg:col-span-8 flex flex-col border border-gray-150 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden min-h-[350px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
            <span className="text-xs font-semibold text-gray-755 dark:text-zinc-300">Copywriter Sandbox</span>
            {text && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-zinc-550 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 text-[11px] font-semibold border border-gray-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                Copy Converted
              </button>
            )}
          </div>
          <div className="flex-1 p-4 relative">
            <textarea
              className="w-full h-full min-h-[280px] bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-850 dark:text-zinc-50 text-sm font-sans resize-none"
              placeholder="Paste or write your raw content here to get started with formatting..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>

        {/* Action controls screen */}
        <div className="lg:col-span-4 space-y-4">
          {/* Case options card */}
          <div className="p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Case conversions</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "UPPERCASE", id: "upper" },
                { label: "lowercase", id: "lower" },
                { label: "Title Case", id: "title" },
                { label: "Sentence Case", id: "sentence" },
                { label: "url-slugify", id: "slug" },
                { label: "Trim Spaces", id: "trim" }
              ].map((act) => (
                <button
                  key={act.id}
                  type="button"
                  disabled={!text}
                  onClick={() => handleCaseChange(act.id as any)}
                  className="py-2 px-1 text-[11px] font-semibold rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-gray-50 dark:hover:bg-zinc-850 text-gray-700 dark:text-zinc-300 capitalize text-center transition disabled:opacity-40"
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          {/* Find and Replace card */}
          <div className="p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-teal-555" /> Find & Replace
            </h3>
            
            <form onSubmit={handleFindReplace} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Find word"
                  value={findWord}
                  onChange={(e) => setFindWord(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-800 dark:text-zinc-100 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Replace with"
                  value={replaceWord}
                  onChange={(e) => setReplaceWord(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-zinc-800 bg-transparent text-gray-800 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!text || !findWord}
                className="w-full py-1.5 bg-teal-600 hover:bg-teal-505 text-white font-semibold text-xs rounded-lg transition shadow-sm disabled:opacity-40"
              >
                Execute Substitution
              </button>
            </form>
          </div>

          {/* Quick Stats list */}
          <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/25 text-[11px] text-gray-500 dark:text-zinc-400 space-y-3">
            <h4 className="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> Typography Stats
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850">
                <span className="text-[10px] text-gray-400">Total Characters</span>
                <p className="font-mono font-bold text-gray-800 dark:text-zinc-200 mt-0.5">{charCount}</p>
              </div>
              <div className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850">
                <span className="text-[10px] text-gray-400">Words count</span>
                <p className="font-mono font-bold text-gray-850 dark:text-zinc-150 mt-0.5">{wordCount}</p>
              </div>
              <div className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850">
                <span className="text-[10px] text-gray-400">Lines • Sentences</span>
                <p className="font-mono font-bold text-gray-700 dark:text-zinc-300 mt-0.5">
                  {lineCount} • {sentenceCount}
                </p>
              </div>
              <div className="p-1.5 rounded bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850">
                <span className="text-[10px] text-gray-400">Read Estimates</span>
                <p className="font-mono font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                  {readTimeSeconds < 60 ? `${readTimeSeconds}s` : `${Math.ceil(readTimeSeconds / 60)} min`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

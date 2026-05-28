import React, { useState, useEffect } from "react";
import { FileCode, Clipboard, Check, RefreshCw, Layers, ShieldAlert, Sparkles, ChevronRight, ChevronDown } from "lucide-react";

// Recursive Collapsible Tree Viewer helper
interface JsonNodeProps {
  value: any;
  name?: string | number;
  depth: number;
  key?: string | number;
}

function JsonTreeNode({ value, name, depth }: JsonNodeProps) {
  const [collapsed, setCollapsed] = useState(false);

  const isObject = value !== null && typeof value === "object";
  const indentStyle = { paddingLeft: `${depth * 14}px` };

  if (!isObject) {
    let scalarValue = String(value);
    let valClass = "text-amber-600 dark:text-amber-400";

    if (typeof value === "string") {
      scalarValue = `"${value}"`;
      valClass = "text-green-600 dark:text-green-400";
    } else if (typeof value === "number") {
      valClass = "text-blue-500 dark:text-blue-400 font-bold";
    } else if (typeof value === "boolean") {
      valClass = "text-purple-600 dark:text-purple-400 font-bold";
    } else if (value === null) {
      valClass = "text-gray-400 font-bold";
    }

    return (
      <div style={indentStyle} className="text-xs font-mono py-0.5 select-text">
        {name !== undefined && <span className="text-zinc-500 dark:text-zinc-400 mr-1">"{name}":</span>}
        <span className={valClass}>{scalarValue}</span>
      </div>
    );
  }

  const keys = Object.keys(value);
  const isArray = Array.isArray(value);
  const openingBracket = isArray ? "[" : "{";
  const closingBracket = isArray ? "]" : "}";

  return (
    <div className="text-xs font-mono py-0.5">
      <div 
        style={indentStyle} 
        className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/60 rounded select-none py-0.5 text-zinc-700 dark:text-zinc-300"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="text-zinc-400 flex-shrink-0 mr-0.5">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
        {name !== undefined && <span className="text-zinc-500 dark:text-zinc-400 mr-1">"{name}":</span>}
        <span className="text-zinc-400 font-bold">
          {openingBracket}
          {collapsed && <span className="text-[10px] text-gray-400 font-normal px-1">... {keys.length} items ...</span>}
          {collapsed && closingBracket}
        </span>
      </div>

      {!collapsed && (
        <div className="space-y-0.5">
          {keys.map((k) => (
            <JsonTreeNode key={k} name={isArray ? Number(k) : k} value={value[k]} depth={depth + 1} />
          ))}
          <div style={indentStyle} className="text-zinc-400 font-bold select-none pl-4 pt-0.5">
            {closingBracket}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JsonFormatter() {
  const [inputText, setInputText] = useState('{\n  "name": "ToolVerse",\n  "version": "1.0.0",\n  "active": true,\n  "supportedTools": [\n    "PDF to Word",\n    "Image Converter",\n    "QR Generator"\n  ],\n  "metrics": {\n    "performanceRating": 9.9,\n    "userSatisfaction": "100%"\n  }\n}');
  const [indents, setIndents] = useState<2 | 4>(2);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedObject, setParsedObject] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    validateAndFormat(false);
  }, [inputText, indents]);

  const validateAndFormat = (beautify = true) => {
    if (!inputText.trim()) {
      setParseError(null);
      setParsedObject(null);
      return;
    }

    try {
      const obj = JSON.parse(inputText);
      setParsedObject(obj);
      setParseError(null);

      if (beautify) {
        setInputText(JSON.stringify(obj, null, indents));
      }
    } catch (err: any) {
      setParseError(err.message || "Invalid JSON syntax structure");
    }
  };

  const handleBeautify = () => {
    validateAndFormat(true);
  };

  const handleMinify = () => {
    try {
      const obj = JSON.parse(inputText);
      setParsedObject(obj);
      setParseError(null);
      setInputText(JSON.stringify(obj));
    } catch (err: any) {
      setParseError(err.message || "Invalid JSON syntax structure");
    }
  };

  const handleCopy = () => {
    if (parseError) return;
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearEditor = () => {
    setInputText("");
    setParsedObject(null);
    setParseError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-150 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-800">
              <FileCode className="w-5 h-5 text-gray-600 dark:text-zinc-300" />
            </span>
            Developers JSON Architect
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Format, indit, minify, validate, and navigate nested JSON trees cleanly with standard vector nodes folding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {inputText && (
            <button 
              type="button"
              onClick={clearEditor}
              className="text-xs px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 font-semibold transition"
            >
              Reset Space
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Formatter controls */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="border border-gray-150 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Editor Workspace</span>
              
              <div className="flex items-center gap-2">
                <select
                  value={indents}
                  onChange={(e) => setIndents(Number(e.target.value) as any)}
                  className="text-[10px] px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 text-gray-600 dark:text-zinc-300 rounded font-semibold"
                >
                  <option value={2}>2 Spaces Indent</option>
                  <option value={4}>4 Spaces Indent</option>
                </select>

                <button
                  type="button"
                  onClick={handleBeautify}
                  className="text-[10px] px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded font-bold transition"
                >
                  Indit Size
                </button>

                <button
                  type="button"
                  onClick={handleMinify}
                  className="text-[10px] px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded font-bold transition"
                >
                  Minify Space
                </button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <textarea
                className="w-full h-full min-h-[280px] bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-800 dark:text-zinc-50 text-xs font-mono resize-none leading-relaxed"
                placeholder="Paste your unformatted JSON stream directly in this workbench..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          </div>

          {/* Syntax check footer */}
          {parseError ? (
            <div className="p-3.5 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-xl text-red-655 dark:text-red-400 text-xs flex items-start gap-2 animate-pulse">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Syntax validation fail error</p>
                <p className="text-[10px] text-red-500 font-mono mt-0.5">{parseError}</p>
              </div>
            </div>
          ) : parsedObject ? (
            <div className="p-3.5 bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl text-green-700 dark:text-green-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4.5 h-4.5 text-green-500 p-0.5 bg-green-100 dark:bg-green-900 rounded-full" />
                <span className="font-semibold text-[11px]">Valid JSON Structure detected. Tree nodes mapped successfully!</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white rounded font-bold transition"
              >
                {copied ? "Copied Indit!" : "Copy Formatted"}
              </button>
            </div>
          ) : null}
        </div>

        {/* Dynamic Nested Node Tree */}
        <div className="lg:col-span-5 flex flex-col border border-gray-150 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20 overflow-hidden min-h-[350px]">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center justify-between bg-white dark:bg-zinc-900/80">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-zinc-455" /> Map Node Explorer
            </span>
            <span className="text-[10px] text-gray-400">Interactive Click-to-Fold</span>
          </div>

          <div className="flex-1 p-5 overflow-auto bg-white/40 dark:bg-zinc-950/10">
            {parsedObject ? (
              <div className="text-zinc-800 dark:text-zinc-200">
                <JsonTreeNode value={parsedObject} depth={0} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-zinc-500">
                <Sparkles className="w-8 h-8 mb-2 stroke-1 text-gray-300 dark:text-zinc-650" />
                <p className="text-[11px]">Enter valid JSON structure on the workbench to populate the map node tree view Explorer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

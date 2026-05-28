import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  FileText, Image, Scissors, QrCode, Key, Palette, 
  CaseSensitive, FileCode, Calculator, Sparkles,
  Layers, Search, ArrowLeft, Wrench, Menu, X, 
  ArrowUpRight, Bookmark, Heart, Zap, Award, CheckCircle2
} from "lucide-react";

// Import modular workbench components
import PdfToWord from "./components/PdfToWord";
import ImageConverter from "./components/ImageConverter";
import BackgroundRemover from "./components/BackgroundRemover";
import QrGenerator from "./components/QrGenerator";
import PasswordGenerator from "./components/PasswordGenerator";
import ColorPaletteCreator from "./components/ColorPaletteCreator";
import TextFormatter from "./components/TextFormatter";
import JsonFormatter from "./components/JsonFormatter";
import UnitConverter from "./components/UnitConverter";
import AiPromptGenerator from "./components/AiPromptGenerator";

import { ToolCategory, ToolMeta } from "./types";

const ALL_TOOLS: ToolMeta[] = [
  {
    id: "ai-prompt",
    name: "AI Prompt Generator",
    description: "Expand keywords into structured pro prompts for Midjourney, ChatGPT, DALL-E & Stable Diffusion.",
    category: "ai",
    iconName: "ai-prompt",
    isAIPowered: true,
    badge: "AI"
  },
  {
    id: "palette-creator",
    name: "Color Palette creator",
    description: "Generate aesthetic palettes with random seeding, direct image pixel sampling, or AI mood suggestions.",
    category: "image",
    iconName: "palette-creator",
    badge: "Trending"
  },
  {
    id: "bg-remover",
    name: "Background remover",
    description: "Erase backdrops instantly with canvas chroma extraction, tolerance sliding, and edge feathering.",
    category: "image",
    iconName: "bg-remover",
    badge: "Popular"
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Reconstruct layers in standard PDF vectors, run OCR parsing text, and export to MS Word compatible files.",
    category: "document",
    iconName: "pdf-to-word",
    badge: "New"
  },
  {
    id: "image-converter",
    name: "Image converter",
    description: "Convert formats locally (PNG, JPEG, WebP, BMP) with interactive quality thresholds controls.",
    category: "image",
    iconName: "image-converter",
  },
  {
    id: "password-generator",
    name: "Password generator",
    description: "Synthesize high-entropy secure strings completely offline with sound ticks and strength analysis.",
    category: "utility",
    iconName: "password-generator",
  },
  {
    id: "qr-generator",
    name: "QR Code utility",
    description: "Design pixel-perfect customizable QR codes with colored dots overlays and center brand logo embeddings.",
    category: "developer",
    iconName: "qr-generator",
    badge: "Trending"
  },
  {
    id: "text-formatter",
    name: "Text formatter",
    description: "Modify character casing (UPPER, slugify), strip extra margins, and view average read-time stats.",
    category: "utility",
    iconName: "text-formatter",
  },
  {
    id: "json-formatter",
    name: "JSON formatter",
    description: "Lint JSON strings with live validation checks, minifying options, and structured collapsible map trees.",
    category: "developer",
    iconName: "json-formatter",
  },
  {
    id: "unit-converter",
    name: "Equivalent unit converter",
    description: "Compute equivalents across Length, Area, Weight, Volume, and Temp matrices in real-time.",
    category: "utility",
    iconName: "unit-converter",
  }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heartedTools, setHeartedTools] = useState<Record<string, boolean>>({});

  // Render icons manually based on IDs for 100% robust TS builds
  const renderIcon = (id: string, className: string) => {
    switch (id) {
      case "pdf-to-word": return <FileText className={className} />;
      case "image-converter": return <Image className={className} />;
      case "bg-remover": return <Scissors className={className} />;
      case "qr-generator": return <QrCode className={className} />;
      case "password-generator": return <Key className={className} />;
      case "palette-creator": return <Palette className={className} />;
      case "text-formatter": return <CaseSensitive className={className} />;
      case "json-formatter": return <FileCode className={className} />;
      case "unit-converter": return <Calculator className={className} />;
      case "ai-prompt": return <Sparkles className={className} />;
      default: return <Wrench className={className} />;
    }
  };

  const getCategoryColor = (cat: ToolCategory) => {
    switch (cat) {
      case "ai": return "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400";
      case "document": return "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400";
      case "image": return "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-400";
      case "developer": return "bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-850 dark:border-zinc-800 dark:text-zinc-300";
      default: return "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-900 dark:text-teal-400";
    }
  };

  const categories = [
    { id: "all", label: "All Utilities", icon: Layers },
    { id: "ai", label: "Gemini AI tools", icon: Sparkles },
    { id: "document", label: "Doc & PDF converters", icon: FileText },
    { id: "image", label: "Graphics & Palettes", icon: Image },
    { id: "developer", label: "Developers sandbox", icon: FileCode },
    { id: "utility", label: "Unit conversions", icon: Calculator }
  ];

  const filteredTools = useMemo(() => {
    let result = ALL_TOOLS;
    
    if (activeCategory !== "all") {
      result = result.filter(tool => tool.category === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(query) || 
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [activeCategory, searchQuery]);

  // Trending & Recommended tools lists
  const trendingTools = useMemo(() => {
    return ALL_TOOLS.filter(t => t.badge === "Trending" || t.badge === "AI");
  }, []);

  const mostUsedTools = useMemo(() => {
    return ALL_TOOLS.filter(t => t.badge === "Popular" || !t.badge).slice(0, 4);
  }, []);

  const selectedTool = ALL_TOOLS.find(t => t.id === selectedToolId);

  const toggleHeart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartedTools(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-600 selection:text-white flex flex-col">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-805">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setSelectedToolId(null)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                ToolVerse
              </span>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest pl-0.5 leading-none">Global Tool suite</p>
            </div>
          </div>

          {/* Quick Search inside center navigation (desktop) */}
          {!selectedToolId && (
            <div className="hidden md:flex items-center gap-2 max-w-sm w-full relative">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for 500+ tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-zinc-900 border-none rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-450 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Secured Sandbox
            </span>
            <button className="hidden lg:inline-block text-xs font-semibold text-slate-600 hover:text-indigo-600 transition">
              Documentation
            </button>
            <button className="hidden sm:inline-block bg-slate-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-750 px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow-sm">
              Get Premium
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg sm:hidden hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-350"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Categories overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-white dark:bg-[#09090b] sm:hidden animate-fade-in flex flex-col p-4 border-b border-gray-100 dark:border-zinc-800 overflow-y-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2 block">
            Category filters
          </span>
          <div className="space-y-1">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as any);
                    setMobileMenuOpen(false);
                    setSelectedToolId(null);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                    activeCategory === cat.id
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400"
                      : "text-gray-600 dark:text-zinc-300 hover:bg-gray-50"
                  }`}
                >
                  <CatIcon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex gap-8 w-full">
        
        {/* Left Side Sidebar - Desktop only */}
        {!selectedToolId && (
          <aside className="hidden sm:block w-60 flex-shrink-0 space-y-6">
            <div className="sticky top-24 space-y-5">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-550 block">
                  Categories
                </span>
                
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = activeCategory === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id as any);
                          setSelectedToolId(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                          isSelected
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100/70 dark:hover:bg-zinc-850/50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CatIcon className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-500"}`} />
                          <span>{cat.label}</span>
                        </div>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mini telemetry and system rules card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/10 text-[10px] text-slate-500 dark:text-zinc-450 leading-relaxed space-y-2">
                <p className="font-bold text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600" /> Platform Metrics
                </p>
                <p>• Engineered with a sandboxed full-stack process matrix.</p>
                <p>• Server-side API layers handle prompt compilation safely.</p>
                <p>• Full offline processing fallback where applicable.</p>
              </div>

              {/* Rivera Premium member profile box */}
              <div className="border-t border-slate-200 dark:border-zinc-800 pt-4">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                    AR
                  </div>
                  <div className="text-xs leading-none font-semibold text-slate-800 dark:text-zinc-300">
                    Alex Rivera
                    <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-1 font-normal">Premium Sandbox</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Core dynamic content workbench / grid layout */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {!selectedToolId ? (
              // Main Dashboard view
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-10"
              >
                {/* Hero section */}
                <section className="relative p-8 sm:p-10 rounded-3xl bg-indigo-600 text-white overflow-hidden shadow-lg shadow-indigo-100 dark:shadow-none">
                  {/* Decorative background grid matrix lines or elegant bubble shapes */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 -mr-16 -mt-16 animate-pulse-slow"></div>
                  <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse-slow"></div>
                  
                  <div className="relative space-y-5 max-w-xl z-20">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-100 bg-indigo-550 border border-indigo-400 px-2.5 py-1 rounded-full shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" /> Professional Engine Active
                    </span>
                    <h1 className="text-3xl sm:text-4.5xl font-extrabold tracking-tight leading-none text-white">
                      What would you like to build?
                    </h1>
                    <p className="text-xs text-indigo-100 leading-relaxed font-normal">
                      Quickly convert, generate, and format anything. Your all-in-one toolbox for digital productivity, powered by localized browser parsers and server-side Gemini intelligence.
                    </p>

                    {/* Left Action buttons from Design HTML */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setActiveCategory("all"); setSelectedToolId(null); }}
                        className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-50 transition duration-200 cursor-pointer"
                      >
                        Explore all tools
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveCategory("ai"); }}
                        className="bg-indigo-500 bg-opacity-40 border border-indigo-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-50 transition duration-200"
                      >
                        AI Prompts
                      </button>
                    </div>
                  </div>
                </section>

                {/* Trending grid layout */}
                {activeCategory === "all" && !searchQuery.trim() && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-550 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600" /> Spotlight & Trending Tools
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trendingTools.map(tool => (
                        <div
                          key={tool.id}
                          onClick={() => setSelectedToolId(tool.id)}
                          className="p-6 border border-slate-200 dark:border-zinc-805 bg-white dark:bg-zinc-900 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-850 hover:shadow-md hover:shadow-indigo-50/10 dark:hover:shadow-none transition duration-200 cursor-pointer flex gap-4"
                        >
                          <div className={`p-3 rounded-xl flex-shrink-0 h-11 w-11 flex items-center justify-center ${getCategoryColor(tool.category)}`}>
                            {renderIcon(tool.iconName, "w-5 h-5")}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm truncate">{tool.name}</h3>
                              <span className="text-[8px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {tool.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed font-normal">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Main filtered/Search tools grid */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-550">
                      {searchQuery.trim() ? `Search Results (${filteredTools.length})` : `${activeCategory === "all" ? "A-Z Service Catalog" : categories.find(c => c.id === activeCategory)?.label}`}
                    </h2>
                  </div>

                  {filteredTools.length === 0 ? (
                    <div className="text-center py-12 p-4 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
                      <Layers className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700 mb-2 stroke-1" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-zinc-450">No tools match your query.</p>
                      <button 
                        onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                        className="mt-4 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white text-[11px] font-semibold rounded-lg shadow-sm"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTools.map((tool) => {
                        const isHearted = !!heartedTools[tool.id];
                        return (
                          <div
                            key={tool.id}
                            onClick={() => setSelectedToolId(tool.id)}
                            className="p-5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-805 transition duration-200 cursor-pointer flex flex-col justify-between group h-48 shadow-sm hover:shadow-md"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <div className={`p-2.5 rounded-lg flex items-center justify-center ${getCategoryColor(tool.category)}`}>
                                  {renderIcon(tool.iconName, "w-4.5 h-4.5")}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {tool.badge && (
                                    <span className="text-[8px] font-extrabold bg-slate-100 dark:bg-zinc-805 px-1.5 py-0.5 rounded text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                                      {tool.badge}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => toggleHeart(tool.id, e)}
                                    className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-805 transition ${
                                      isHearted ? "text-red-500" : "text-slate-300 dark:text-zinc-650 hover:text-red-400"
                                    }`}
                                  >
                                    <Heart className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                </div>
                              </div>

                              <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-xs mt-3 flex items-center gap-1">
                                {tool.name}
                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-slate-400" />
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                                {tool.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-zinc-850/60 mt-2">
                              {tool.isAIPowered ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-505 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded">
                                  <Sparkles className="w-2.5 h-2.5 text-indigo-555" /> Gemini AI
                                </span>
                              ) : (
                                <span className="inline-block text-[9px] text-gray-400 dark:text-zinc-500 capitalize">
                                  {tool.category} Utility
                                </span>
                              )}
                              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                                Launch workspace
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Most Used Tools horizontal layout block */}
                {activeCategory === "all" && !searchQuery.trim() && (
                  <section className="space-y-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-550 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-600" /> Fast Launch Utilities
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                      {mostUsedTools.map((tool) => (
                        <div
                          key={tool.id}
                          onClick={() => setSelectedToolId(tool.id)}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-850/60 border border-transparent hover:border-gray-100 dark:hover:border-zinc-800 rounded-xl cursor-pointer transition text-center space-y-2 group"
                        >
                          <div className={`p-2 rounded-lg inline-flex items-center justify-center ${getCategoryColor(tool.category)}`}>
                            {renderIcon(tool.iconName, "w-4 h-4")}
                          </div>
                          <h4 className="font-bold text-[11px] text-gray-800 dark:text-zinc-200 group-hover:text-indigo-505 truncate" title={tool.name}>
                            {tool.name}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </motion.div>
            ) : (
              // Immersive Focused Workspace component container
              <motion.div
                key="workspace"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                {/* Workspace Headers */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedToolId(null)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                  </button>
                  
                  {selectedTool && (
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-zinc-805 px-2.5 py-1 rounded border border-slate-200 dark:border-zinc-700">
                      Module: {selectedTool.id} • Offline Active
                    </span>
                  )}
                </div>

                {/* Direct mount corresponding components */}
                <div className="bg-white dark:bg-zinc-900/65 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  {selectedToolId === "pdf-to-word" && <PdfToWord />}
                  {selectedToolId === "image-converter" && <ImageConverter />}
                  {selectedToolId === "bg-remover" && <BackgroundRemover />}
                  {selectedToolId === "qr-generator" && <QrGenerator />}
                  {selectedToolId === "password-generator" && <PasswordGenerator />}
                  {selectedToolId === "palette-creator" && <ColorPaletteCreator />}
                  {selectedToolId === "text-formatter" && <TextFormatter />}
                  {selectedToolId === "json-formatter" && <JsonFormatter />}
                  {selectedToolId === "unit-converter" && <UnitConverter />}
                  {selectedToolId === "ai-prompt" && <AiPromptGenerator />}
                </div>

                {/* Floating safety indicator */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 bg-white dark:bg-zinc-900/30 p-4 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs">
                  <span>Conducted in localized secure browser processes.</span>
                  <span>ToolVerse v1.0.0</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer Design */}
      <footer className="mt-auto bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-850/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-slate-700 dark:text-zinc-300">ToolVerse</span>
            <span>| © 2026 Ultimate Workspace. All tools sandboxed offline.</span>
          </div>

          <div className="flex gap-4">
            <a href="#github" className="hover:text-indigo-600 dark:hover:text-zinc-350 hover:underline">Vercel Inspired</a>
            <a href="#canva" className="hover:text-indigo-600 dark:hover:text-zinc-350 hover:underline">Canva Styled</a>
            <a href="#google" className="hover:text-indigo-600 dark:hover:text-zinc-350 hover:underline">Google Performance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

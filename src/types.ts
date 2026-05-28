export type ToolCategory = "all" | "ai" | "document" | "image" | "developer" | "utility";

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  iconName: string; // Dynamic icon reference
  badge?: "AI" | "Popular" | "Trending" | "New";
  isAIPowered?: boolean;
}

export interface AIPromptResult {
  expandedPrompt: string;
  variations: Array<{ title: string; text: string }>;
  powerKeywords: string[];
  proTips: string[];
  isSimulated?: boolean;
  message?: string;
}

export interface AICohesiveColor {
  hex: string;
  name: string;
  role: string;
  isLocked?: boolean;
}

export interface AIPaletteResult {
  colors: AICohesiveColor[];
  stylingTip: string;
  isSimulated?: boolean;
}

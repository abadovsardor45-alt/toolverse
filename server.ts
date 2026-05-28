import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Gemini SDK lazily to prevent crashing on startup when KEY is absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Check api status
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: "ok", geminiKeyConfigured: hasKey });
});

// Endpoint 1: Gemini AI Prompt Generator
app.post("/api/gemini/prompt-builder", async (req, res) => {
  try {
    const { topic, targetSystem, tone, style, lighting, camera } = req.body;

    if (!topic) {
      res.status(400).json({ error: "Topic is required" });
      return;
    }

    try {
      const gClient = getGeminiClient();

      const systemPrompt = `You are a professional prompt engineer for AI systems. Your goal is to expand a simple user keyword/topic into a highly detailed, optimized, and effective prompt for the chosen target AI model/system. 
Provide a clean JSON response structured with prompt variants, tips, and keywords. Do not include markdown wraps around the JSON block. Must be raw valid JSON.`;

      const promptMsg = `Expand the following concept into three distinct highly-professional prompt variations.
Concept: "${topic}"
Target Model/System: ${targetSystem || "General AI"}
Tone: ${tone || "Professional"}
Style: ${style || "Default / Aesthetic"}
Lighting: ${lighting || "Natural"}
Camera/Render style: ${camera || "Not specified"}

Return raw JSON with exactly this format:
{
  "expandedPrompt": "A single comprehensive flagship prompt",
  "variations": [
    { "title": "Variant A", "text": "Text of variant A" },
    { "title": "Variant B", "text": "Text of variant B" }
  ],
  "powerKeywords": ["word1", "word2", "word3"],
  "proTips": ["Tip 1 on how to adjust parameters", "Tip 2 on negative keywords or styling"]
}
Limit output to raw JSON. No markdown blocks like \`\`\`json ... \`\`\`. Start with { and end with }`;

      const response = await gClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "";
      // Strip out markdown code block if model added it despite system instruction
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanText);
      res.json(parsed);

    } catch (apiErr: any) {
      console.error("Gemini API error:", apiErr);
      
      // Safe fallback prompt builder if API key is not set or fails
      // This ensures a 100% functional user experience regardless of configuration state
      const simulatedResponse = {
        expandedPrompt: `[Local Build Fallback] Create a stunning ${style || "aesthetic"} rendering of ${topic}, capturing a distinct ${tone || "vivid"} mood. Styled utilizing ${lighting || "cinematic"} lighting with ${camera || "photorealistic details"} rendering, composition 8k resolution, Unreal Engine 5 design quality, highly-detailed.`,
        variations: [
          { 
            title: "Cinematic Aesthetic", 
            text: `Close-up capture of ${topic}, styled with gorgeous ${lighting || "dramatic lighting"}, rich atmospheric depth, shot on 35mm lens, f/1.8, warm palette, high-contrast, masterwork.` 
          },
          { 
            title: "Minimalist / Modernist", 
            text: `A clean, elegant, flat-vector illustration of ${topic}. Conceptual layout matching modern Vercel + Canva inspired vector artwork, clean geometric lines, high negative space.` 
          }
        ],
        powerKeywords: [topic, style || "illustration", lighting || "cinematic", "highly detailed", "minimalist", "clean vector"],
        proTips: [
          "Try adding negative keywords like 'blurry, distorted, gradient background' to improve result fidelity.",
          "Adjust the lighting config in ToolVerse to 'Volumetric golden hour' for highly immersive results."
        ],
        isSimulated: true,
        message: apiErr?.message || "Using smart fallback generator"
      };
      res.json(simulatedResponse);
    }

  } catch (err: any) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: "Failed to generate prompt", details: err.message });
  }
});

// Endpoint 2: AI Palette Suggestion
app.post("/api/gemini/palette-suggest", async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood) {
      res.status(400).json({ error: "Mood/description is required" });
      return;
    }

    try {
      const gClient = getGeminiClient();
      const systemPrompt = `You are a professional web designer and palette specialist. Return raw JSON describing a customized color palette corresponding to the describes mood.`;

      const promptMsg = `Create a matching color palette for: "${mood}"
Return raw JSON with exactly this format:
{
  "colors": [
    { "hex": "#123456", "name": "Primary Dark", "role": "Dominant background accent" },
    { "hex": "#abcdef", "name": "Secondary Soft", "role": "Card styling/secondary" },
    { "hex": "#fe1234", "name": "Action Pop", "role": "Buttons and call to action accents" }
  ],
  "stylingTip": "Use Primary Dark as the main text backdrop with secondary accents."
}
Return EXACTLY 5 cohesive colors in the array. Ensure hex codes are valid. Start with { and end with }`;

      const response = await gClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "";
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanText);
      res.json(parsed);

    } catch (apiErr: any) {
      console.error("Gemini API error (palette):", apiErr);
      
      // Local fallback generation
      const fallbacks: Record<string, string[]> = {
        cyberpunk: ["#0f172a", "#f43f5e", "#06b6d4", "#a855f7", "#1e293b"],
        aurora: ["#022c22", "#10b981", "#3b82f6", "#a855f7", "#0f172a"],
        sunset: ["#1c1917", "#f43f5e", "#f59e0b", "#e11d48", "#292524"],
        minimal: ["#fafafa", "#18181b", "#71717a", "#d4d4d8", "#ffffff"],
        creative: ["#4f46e5", "#06b6d4", "#ec4899", "#f59e0b", "#1e1b4b"]
      };

      const selectedColors = fallbacks[mood.toLowerCase()] || ["#312e81", "#4f46e5", "#06b6d4", "#ec4899", "#f43f5e"];
      
      const names = ["Dominant Theme", "Co-Accent", "Subtle Highlight", "Action Glow", "Muted Backdrop"];
      const roles = ["Main theme container", "Supporting elements", "Highlight borders", "Active interaction keys", "Soft background shading"];
      
      const responseColors = selectedColors.map((hex, idx) => ({
        hex,
        name: names[idx] || `Tone ${idx + 1}`,
        role: roles[idx] || "Generic UI element"
      }));

      res.json({
        colors: responseColors,
        stylingTip: "Utilize Dominant Theme paired with supporting highlights to implement a high-contrast premium layout.",
        isSimulated: true
      });
    }

  } catch (err: any) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: "Failed to suggest palette", details: err.message });
  }
});

// Vite/Static asset serving setup
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server mounted in Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ToolVerse Server listening at http://localhost:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error("Vite setup error:", err);
});

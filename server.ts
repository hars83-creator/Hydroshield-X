/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize server-side Gemini client with telemetric user-agent header
  const geminiApiKey = process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API: AI Research Assistant Proxy Endpoint
  app.post("/api/assistant", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!geminiApiKey) {
        return res.status(200).json({
          text: "System Alert: `GEMINI_API_KEY` is not configured in secrets. Please set your key in Settings > Secrets to enable live Gemini interactions.",
        });
      }

      // Instruct model
      const systemInstruction = 
        "You are HydroShield-X AI Scientific Research assistant, built by top materials researchers. " +
        "You specialize in hydrophobic coating formulations, corrosion kinetics, Young-Dupre contact angles, ASTM salt spray chamering, " +
        "and PCB electronics moisture risk models. Provide clear, professional, markdown summaries directly answering user structural queries. " +
        "Be concise, informative, and precise.";

      // Build chat input
      const prompt = `System Instruction:\n${systemInstruction}\n\nUser Message: ${message}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [prompt],
      });

      res.json({ text: response.text || "Consultation complete. Ready for next query." });
    } catch (err: any) {
      console.error("Gemini Assistant Failure:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // Client SPA static & Hot-reload handler routing
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode static serves
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HYDROSHIELD-X REST CORE] server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server Startup Failure:", err);
});

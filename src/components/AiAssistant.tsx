/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Send, Bot, User, Brain, HelpCircle, Loader } from "lucide-react";

export default function AiAssistant() {
  const [messages, setMessages] = useState<
    { sender: "assistant" | "user"; text: string }[]
  >([
    {
      sender: "assistant",
      text: "Greetings. I am the HydroShield-X AI Material Research Assistant. Ask me anything about superhydrophobic coatings, Young-Dupre contact angles, ASTM B117 accelerated fog parameters, or PCB digital twins.",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sampleChips = [
    "What is the physical Cassie-Baxter wetting state?",
    "Compare Parylene C vs PDMS hydrophobic coatings.",
    "Explain Butler-Volmer electrochemical corrosion equations.",
    "How does the ASTM B117 foggy spray chamber operate?",
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Append user message
    const updatedMessages = [...messages, { sender: "user" as const, text: textToSend }];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      // Query server-side api route proxying Gemini
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: "assistant" as const, text: data.text || "Consultation complete." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "assistant" as const, text: "System Alert: Connection to AI server failed. Please ensure dev-server is online." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            AI Scientific Research Assistant
          </h2>
          <p className="text-slate-400 mt-1">
            GEMINI-POWERED COGNITIVE KNOWLEDGE COUPLER
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-[460px]">
        {/* Chat Feed Column. Col span 8 */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden h-full">
          {/* Messages block */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto select-text">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 leading-relaxed text-[11px] ${
                  msg.sender === "user" ? "justify-end text-right" : "justify-start text-left"
                }`}
              >
                {msg.sender === "assistant" && (
                  <div className="w-7 h-7 bg-cyan-950 text-cyan-400 border border-cyan-500/10 rounded-full flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-lg max-w-[85%] border ${
                    msg.sender === "user"
                      ? "bg-slate-950 border-slate-800 text-slate-200"
                      : "bg-cyan-950/15 border-cyan-500/10 text-cyan-100/90"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-mono text-xs">{msg.text}</pre>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 bg-slate-800 text-slate-300 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-cyan-400 font-bold text-[10px] pl-10">
                <Loader className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini Core digesting physical constants...</span>
              </div>
            )}
          </div>

          {/* Prompt chips suggestions */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
            <span className="text-[9px] text-slate-500 uppercase block mb-2 font-bold tracking-widest pl-1">
              Select Preset Materials Query:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-full bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-bold text-left block max-w-full truncate"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* User input box */}
          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask high-fidelity material formulation details..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-4 py-2.5 outline-none font-sans font-medium text-slate-200 placeholder-slate-500 focus:border-cyan-500/50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <Send className="w-4 h-4 text-slate-950" />
                SEND
              </button>
            </form>
          </div>
        </div>

        {/* Info panel sidebar. Col span 4 */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4 h-full">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1.5 border-b border-slate-800 flex items-center gap-1.5">
              <Brain className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              Gemini model Specs
            </h3>

            <div className="space-y-3 leading-relaxed text-slate-400">
              <p>
                Our AI Assistant is running on the fast, low-latency <strong>gemini-3.5-flash</strong> model.
              </p>
              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-1.5">
                <div className="text-[9.5px] text-slate-500 uppercase font-bold text-cyan-400">Knowledge bounds:</div>
                <ul className="space-y-1 text-[9px] list-disc pl-4 text-slate-400">
                  <li>Inhibited Ionic Diffusion barriers</li>
                  <li>Wenzel vs Cassie thermodynamic transitions</li>
                  <li>Impedance semicircular arcs</li>
                  <li>Corrosive SO₂ & NaCl electrolyte salts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

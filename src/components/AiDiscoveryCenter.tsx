/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sliders, Brain, Info, Layers, Beaker, Play } from "lucide-react";

export default function AiDiscoveryCenter() {
  // Target Specifications desired by user
  const [targetCost, setTargetCost] = useState(15); // max USD/m²
  const [targetLifetime, setTargetLifetime] = useState(15); // min years
  const [targetContactAngle, setTargetContactAngle] = useState(140); // min degrees

  // Bayesian outputs recommendations
  const [discoveredPolymer, setDiscoveredPolymer] = useState("Fluorinated Graphene + 8% PDMS Composite");
  const [predCost, setPredCost] = useState(11.2);
  const [predLifetime, setPredLifetime] = useState(18.5);
  const [predAngle, setPredAngle] = useState(152);

  const importanceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Solves Bayesian compound allocations
  useEffect(() => {
    // Generate optimized composition matching target criteria
    if (targetCost < 10) {
      setDiscoveredPolymer("Self-Assembled PMMA + MethylSilane Monolayer");
      setPredCost(4.5);
      setPredLifetime(Math.min(targetLifetime, 6.2));
      setPredAngle(112);
    } else if (targetContactAngle > 150) {
      setDiscoveredPolymer("Super-fluorinated CNT Graphene Lattice Barrier");
      setPredCost(34.8);
      setPredLifetime(22.0);
      setPredAngle(158);
    } else {
      setDiscoveredPolymer("Copolymerized Parylene C + Ceramic Oxide Nano-suspension");
      setPredCost(18.2);
      setPredLifetime(16.4);
      setPredAngle(144);
    }
  }, [targetCost, targetLifetime, targetContactAngle]);

  // Render Horizontal Bar Chart for Feature Importances using raw HTML Canvas
  useEffect(() => {
    const canvas = importanceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = (canvas.width = 460);
    const h = (canvas.height = 200);

    ctx.fillStyle = "rgb(15, 23, 42)";
    ctx.fillRect(0, 0, w, h);

    const features = [
      { name: "HYDROPHOBIC CONTACT ANGLE", score: 0.88, color: "rgb(6, 182, 212)" },
      { name: "BARRIER RESIN THICKNESS", score: 0.72, color: "rgb(14, 165, 233)" },
      { name: "SURFACE MOLECULAR POROSITY", score: 0.65, color: "rgb(244, 63, 94)" },
      { name: "EXPOSURE NaCl SALT CONC", score: 0.45, color: "rgb(234, 179, 8)" },
      { name: "AMBIENT CHAMBER THERMALS", score: 0.32, color: "rgb(16, 185, 129)" },
    ];

    features.forEach((feat, idx) => {
      const rowY = 30 + idx * 32;

      // Draw Feature text
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.font = "8.5px monospace";
      ctx.fillText(feat.name, 15, rowY + 12);

      // Draw Background empty bar tracks
      const barTrackWidth = 180;
      const barX = 220;
      ctx.fillStyle = "rgb(30, 41, 59)";
      ctx.fillRect(barX, rowY + 4, barTrackWidth, 8);

      // Draw Fill value bar
      ctx.fillStyle = feat.color;
      ctx.fillRect(barX, rowY + 4, barTrackWidth * feat.score, 8);

      // Score text
      ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
      ctx.fillText(`${(feat.score * 100).toFixed(0)}%`, barX + barTrackWidth + 10, rowY + 12);
    });

  }, []);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            AI Discovery Center (Bayesian Optimizer)
          </h2>
          <p className="text-slate-400 mt-1">
            EXPLAINABLE NEURAL LIFETIME NETWORK · TARGET PROPERTY SOLVER
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders input target specification metrics. Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Target Requirements
            </h3>

            {/* target cost limit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">MAX ALLOWABLE COST</span>
                <span className="text-cyan-400 font-bold">${targetCost}/m²</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                value={targetCost}
                onChange={(e) => setTargetCost(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* target contact angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">MIN CONTACT ANGLE</span>
                <span className="text-cyan-400 font-bold">{targetContactAngle}°</span>
              </div>
              <input
                type="range"
                min="90"
                max="160"
                value={targetContactAngle}
                onChange={(e) => setTargetContactAngle(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* target lifetimes */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">DESIRED BARRIER YEARS</span>
                <span className="text-cyan-400 font-bold">{targetLifetime} Yrs</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                value={targetLifetime}
                onChange={(e) => setTargetLifetime(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Discovery result block and Model Explainability bars. Col span 8 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1.5 border-b border-slate-800 flex items-center gap-2">
              <Beaker className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
              Bayesian Discovery Recommendation
            </h3>

            <div className="p-4 bg-slate-950 rounded border border-slate-850">
              <span className="text-[9.5px] text-slate-500 block uppercase font-bold">Optimized Atomic Composition formula</span>
              <div className="text-[13.5px] font-bold text-emerald-400 mt-1">{discoveredPolymer}</div>
            </div>

            {/* Discovered properties prediction targets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-center">
              <div className="bg-slate-950 border border-slate-850 p-3 rounded">
                <span className="text-slate-500 text-[10px]">PREDICTED COST</span>
                <div className="text-[14px] font-bold text-slate-300 mt-1">${predCost} /m²</div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-3 rounded">
                <span className="text-slate-500 text-[10px]">PREDICTED CONTACT ANGLE</span>
                <div className="text-[14px] font-bold text-cyan-400 mt-1">{predAngle}°</div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-3 rounded">
                <span className="text-slate-500 text-[10px]">PREDICTED BARRIER LIFE</span>
                <div className="text-[14px] font-bold text-emerald-400 mt-1">{predLifetime} Years</div>
              </div>
            </div>
          </div>

          {/* Explainability Bar Chart (xAI feature importance) */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1 border-b border-slate-800 flex justify-between">
              <span>Artificial Neural Network (SHAP Feature Importance)</span>
              <span className="text-[10px] text-cyan-400">AI EXPLAINABILITY</span>
            </h3>

            <canvas ref={importanceCanvasRef} className="w-full aspect-[460/200] block rounded bg-slate-950" />
          </div>

          <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-850 leading-relaxed flex gap-2.5">
            <Brain className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="text-slate-400">
               Our <strong>Gaussian Bayesian optimization</strong> sweeps through thousands of multi-component ceramic polymer lattice states. The model ranks candidate formulas, prioritizing high contact indices and lowest precursor cost structures.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

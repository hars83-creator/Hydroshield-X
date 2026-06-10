/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sliders, Sun, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

export default function SelfHealingLab() {
  const [activationType, setActivationType] = useState<"thermal" | "uv" | "moisture">("uv");
  const [temperature, setTemperature] = useState(25); // °C
  const [uvIntensity, setUvIntensity] = useState(5.0); // mW/cm²
  const [capsulePercent, setCapsulePercent] = useState(0.08); // Microcapsules concentration 0-0.2
  const [scratchedDepth, setScratchedDepth] = useState(15.0); // microns

  const [isRunning, setIsRunning] = useState(false);
  const [closurePercent, setClosurePercent] = useState(0);
  const [tensileRecovery, setTensileRecovery] = useState(0);

  const crackCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Solves recovery statistics
  useEffect(() => {
    // Healing kinetics calculations (W_heal)
    // Increases with uv (if uv activation) or temperature (if thermal) and microcapsule % density
    const tempK = temperature + 273.15;
    const boltz = Math.exp(-1500 / (8.314 * tempK));

    let activationEfficiency = 1.0;
    if (activationType === "uv") {
      activationEfficiency = uvIntensity / 5.0;
    } else if (activationType === "thermal") {
      activationEfficiency = boltz * 4.2;
    } else {
      activationEfficiency = 0.6; // background moisture activation is slower
    }

    const calculatedClosure = Math.min(100, Math.round(capsulePercent * 650 * activationEfficiency));
    const calculatedTensile = Math.min(100, Math.round(calculatedClosure * 0.92));

    setClosurePercent(calculatedClosure);
    setTensileRecovery(calculatedTensile);
  }, [activationType, temperature, uvIntensity, capsulePercent, scratchedDepth]);

  // Handle real-time closure animation on copper crack trace canvas
  useEffect(() => {
    const canvas = crackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = (canvas.width = 460);
    const h = (canvas.height = 180);

    let frameId: number;
    let localFrame = 0;

    const tickCrack = () => {
      ctx.fillStyle = "rgb(15, 23, 42)";
      ctx.fillRect(0, 0, w, h);

      // Draw two adjacent protective green coating layer blocks
      ctx.fillStyle = "rgba(16, 185, 129, 0.25)"; // green film
      // Left block
      ctx.fillRect(0, 20, w / 2 - 20, h - 40);
      // Right block
      ctx.fillRect(w / 2 + 20, 20, w / 2 - 20, h - 40);

      // Draw shiny copper substrate plate under coating scratch
      ctx.fillStyle = "rgb(184, 115, 51)";
      ctx.fillRect(w / 2 - 20, 20, 40, h - 40);

      // The scratched crack channel (drawn as a dark fissure line)
      // When animation plays (closurePercent), the crack width physically narrows
      // representing polymer micro-capsule resin overflow
      const healingProgressFactor = isRunning ? Math.min(1.0, localFrame / 100) : 0;
      const healedClosureRatio = (closurePercent / 100) * healingProgressFactor;

      const baseCrackWidth = 24;
      const currentCrackWidth = Math.max(0, baseCrackWidth * (1 - healedClosureRatio));

      // Draw crack gap
      ctx.fillStyle = "rgb(10, 15, 30)";
      ctx.fillRect(w / 2 - currentCrackWidth / 2, 20, currentCrackWidth, h - 40);

      // Draw micro-capsules suspended in coating
      ctx.fillStyle = "rgba(6, 182, 212, 0.75)";
      const numCaps = Math.round(capsulePercent * 100);
      for (let i = 0; i < numCaps; i++) {
        // Left suspended
        const lx = (i * 37) % (w / 2 - 35);
        const ly = (i * 29) % (h - 60) + 30;
        ctx.beginPath();
        ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Right suspended
        const rx = w / 2 + 35 + ((i * 41) % (w / 2 - 50));
        ctx.beginPath();
        ctx.arc(rx, ly, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // If healing active, draw glowing resin healing lines flowing into center crack channel
      if (isRunning && currentCrackWidth > 0) {
        ctx.strokeStyle = "rgba(14, 165, 233, 0.6)";
        ctx.lineWidth = 1.5;
        // flow lines
        ctx.beginPath();
        ctx.moveTo(w / 2 - baseCrackWidth / 2, h / 2 - 30);
        ctx.lineTo(w / 2 - currentCrackWidth / 2, h / 2);
        ctx.lineTo(w / 2 - baseCrackWidth / 2, h / 2 + 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w / 2 + baseCrackWidth / 2, h / 2 - 30);
        ctx.lineTo(w / 2 + currentCrackWidth / 2, h / 2);
        ctx.lineTo(w / 2 + baseCrackWidth / 2, h / 2 + 30);
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
      ctx.font = "8.5px monospace";
      ctx.fillText("MICRO-CAPSULES (ENCAPSULATED POLYMERS)", 20, h - 10);
      ctx.fillText(`SCRATCHED VOLUME CHASM TYPE: FISSURE ${scratchedDepth}µm`, 140, 14);

      if (isRunning && localFrame < 100) {
        localFrame += 1.5;
      }

      frameId = requestAnimationFrame(tickCrack);
    };

    tickCrack();

    return () => cancelAnimationFrame(frameId);
  }, [isRunning, closurePercent, capsulePercent, scratchedDepth]);

  const startHealingSimulation = () => {
    setIsRunning(true);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Self-Healing Lab
          </h2>
          <p className="text-slate-400 mt-1">
             crack CLOSURE KINETICS · ENCUPSELATED DYNAMIC ELASTOMER HEALING MATRIX
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders panel. Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Catalyst Modifier
            </h3>

            {/* Microcapsule density */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">MICROCAPSULE LOAD %</span>
                <span className="text-cyan-400 font-bold">{(capsulePercent * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.20"
                step="0.01"
                value={capsulePercent}
                onChange={(e) => setCapsulePercent(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* scratch depth */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">SCRATCH WIDTH CHASM</span>
                <span className="text-cyan-400 font-bold">{scratchedDepth} µm</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={scratchedDepth}
                onChange={(e) => setScratchedDepth(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Trigger selectors */}
            <div>
              <label className="text-[9.5px] text-slate-400 block mb-1">ACTIVATION ENERGY MODE</label>
              <div className="grid grid-cols-3 gap-2">
                {["uv", "thermal", "moisture"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActivationType(type as any)}
                    className={`py-1.5 rounded text-[10px] uppercase font-bold border transition-all ${
                      activationType === type
                        ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/30"
                        : "bg-slate-950 border-slate-850 text-slate-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional UV intensity slider */}
            {activationType === "uv" ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">UV LIGHT INTENSITY</span>
                  <span className="text-cyan-400 font-bold">{uvIntensity} mW/cm²</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.1"
                  value={uvIntensity}
                  onChange={(e) => setUvIntensity(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            ) : activationType === "thermal" ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">ACTIVATION TEMPERATURE</span>
                  <span className="text-cyan-400 font-bold">{temperature} °C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Crack closure viewer and info statistics panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Simulation status controller */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex justify-between items-center gap-4">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Dynamic restoration solver kinetics</span>
              <span className="text-xs font-bold text-slate-200">
                Lattice state: <span className={isRunning ? "text-cyan-400 animate-pulse" : "text-slate-400"}>{isRunning ? "FLOWING POLYMER RESINS" : "SCRATCH DETECTED"}</span>
              </span>
            </div>
            <button
              onClick={startHealingSimulation}
              disabled={isRunning}
              className="px-5 py-2.5 bg-cyan-600 text-slate-950 font-bold rounded flex items-center gap-2 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-xs"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              TRIGGER LOCAL SELF-HEALING
            </button>
          </div>

          {/* Crack Closure dynamic viewport canvas */}
          <div className="relative">
            <canvas ref={crackCanvasRef} className="w-full aspect-[460/180] block rounded-lg border border-slate-800 shadow-inner" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-850 p-4 rounded flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[10px]">CRACK CLOSURE DEGREE</span>
                <div className="text-base font-bold text-emerald-400 mt-1">
                  {isRunning ? `${closurePercent}%` : "0% (Scratch open)"}
                </div>
              </div>
              <span className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">REDUCING RESIN</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-4 rounded flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[10px]">ULTIMATE HARDNESS RECOVERY</span>
                <div className="text-base font-bold text-cyan-400 mt-1">
                  {isRunning ? `${tensileRecovery}% Recovery` : "Defective state"}
                </div>
              </div>
              <span className="p-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold">RESTORING TENSILE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

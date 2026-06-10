/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sliders, Zap, Info, Loader2 } from "lucide-react";

export default function SaltFogChamber() {
  const [naclPercent, setNaclPercent] = useState(5.0); // Standard ASTM B117 is 5%
  const [chamberTemp, setChamberTemp] = useState(35); // Standard B117 is 35°C
  const [sprayHours, setSprayHours] = useState(240); // standard hours
  const [specimenCoated, setSpecimenCoated] = useState("parylene");

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Accelerated outputs
  const [severityRank, setSeverityRank] = useState("Severe");
  const [coastalEquivalentYears, setCoastalEquivalentYears] = useState(3.4);

  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Accelerated Field weathering calculator
  useEffect(() => {
    // Accelerated Corrosion severity index base
    // Outdoor coastal marine atmospheric weathering factor = approx 1 hour in ASTM B117 fog matches 12.5 hours in outdoor Florida marine costal environment
    const accelerationRatio = 12.5;
    const equivalentFieldHours = sprayHours * accelerationRatio * (naclPercent / 5) * (chamberTemp / 35);
    const equivalentYears = equivalentFieldHours / 8760; // 8760 hours/yr
    setCoastalEquivalentYears(+equivalentYears.toFixed(2));

    // Severity rank
    if (sprayHours > 500) setSeverityRank("Extreme");
    else if (sprayHours > 168) setSeverityRank("Severe");
    else if (sprayHours > 48) setSeverityRank("Moderate");
    else setSeverityRank("Mild");
  }, [naclPercent, chamberTemp, sprayHours]);

  // Animated mist particles inside chamber representing spray nozzle
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = (canvas.width = 460);
    const h = (canvas.height = 200);

    let frameId: number;

    const particles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number }[] = [];

    const tickChamber = () => {
      // Background chamber lining
      ctx.fillStyle = "rgb(15, 23, 42)";
      ctx.fillRect(0, 0, w, h);

      // Draw metallic specimen rack
      ctx.strokeStyle = "rgba(71, 85, 105, 0.6)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(120, h - 35);
      ctx.lineTo(w - 120, h - 35);
      ctx.stroke();

      // Slanted specimen coupon
      ctx.strokeStyle = "rgba(148, 163, 184, 0.9)";
      ctx.fillStyle = "rgb(30, 41, 59)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Draw slanted rectangular sheet coupon at 15 degrees per ASTM standard
      ctx.moveTo(w / 2 - 60, h / 2 - 15);
      ctx.lineTo(w / 2 + 60, h / 2 - 35);
      ctx.lineTo(w / 2 + 45, h / 2 + 55);
      ctx.lineTo(w / 2 - 75, h / 2 + 75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // If running, draw atomizing nozzle mist fog spraying
      if (isRunning) {
        // Generate fog particles from top-left spray tower
        if (particles.length < 35 && Math.random() < 0.35) {
          particles.push({
            x: 20,
            y: 30,
            vx: Math.random() * 2.5 + 2.0, // strong spray drift
            vy: Math.random() * 1.5 + 0.5,
            radius: Math.random() * 8 + 4,
            alpha: 0.65,
          });
        }

        particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.008; // fade away

          // Draw foggy mist cloud
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 254, 255, ${p.alpha})`; // cyan white mist
          ctx.fill();

          if (p.alpha <= 0 || p.x > w || p.y > h) {
            particles.splice(idx, 1);
          }
        });

        // Glowing red heater element at bottom
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
        ctx.lineWidth = 2;
        ctx.strokeRect(30, h - 25, w - 60, 15);
        ctx.fillRect(30, h - 25, w - 60, 15);
      }

      // Nozzle structure illustration
      ctx.fillStyle = "rgb(100, 116, 139)";
      ctx.fillRect(0, 20, 30, 20);
      ctx.strokeStyle = "rgb(71, 85, 105)";
      ctx.strokeRect(0, 20, 30, 20);

      // Label
      ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
      ctx.font = "9px monospace";
      ctx.fillText("ASTM B117 ATOMIZING NOZZLE", 35, 30);
      ctx.fillText("SPECIMEN RACK SUPPORT (15° TILT)", 150, h - 14);

      frameId = requestAnimationFrame(tickChamber);
    };

    tickChamber();

    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);

  const handleStartChamber = () => {
    setIsRunning(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsRunning(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            ASTM B117 Salt Fog Chamber
          </h2>
          <p className="text-slate-400 mt-1">
            CONFORMAL SPECIMEN TESTING · CORRELATING ACCELERATED HOURS TO ENVIRONMENTAL COAST LINE EXPOSURES
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders panel. Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Chamber Parameters
            </h3>

            {/* NaCl concentration */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">NaCl SALT PERCENT</span>
                <span className="text-cyan-400 font-bold">{naclPercent}% NaCl</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={naclPercent}
                onChange={(e) => setNaclPercent(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Chamber temp */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">CHAMBER TEMPERATURE</span>
                <span className="text-cyan-400 font-bold">{chamberTemp} °C</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={chamberTemp}
                onChange={(e) => setChamberTemp(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Duration hours */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">SPRAY EXPOSURE HOURS</span>
                <span className="text-cyan-400 font-bold">{sprayHours} Hours</span>
              </div>
              <input
                type="range"
                min="24"
                max="1000"
                step="24"
                value={sprayHours}
                onChange={(e) => setSprayHours(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Specimen type */}
            <div>
              <label className="text-[9.5px] text-slate-400 block mb-1">SPECIMEN SUBSTRATE COATING</label>
              <select
                value={specimenCoated}
                onChange={(e) => setSpecimenCoated(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 outline-none font-bold text-cyan-400"
              >
                <option value="none">[BARE COPPER SHIELDS]</option>
                <option value="graphene">Graphene Single Atom sheet</option>
                <option value="parylene">Dielectric Conformal Parylene C</option>
                <option value="pdms">Organosilicone PDMS elastomer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Fog Chamber simulation and outputs. Col span 8 */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls gate button */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex justify-between items-center gap-4">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">ASTM B117 Salt Fog Chamber status</span>
              <span className="text-xs font-bold text-slate-200">
                Chamber element state: <span className={isRunning ? "text-cyan-400 animate-pulse" : "text-slate-400"}>{isRunning ? "ATOMIZING MIST CORE" : "STANDBY"}</span>
              </span>
            </div>
            <button
              onClick={handleStartChamber}
              disabled={isRunning}
              className="px-5 py-2.5 bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-bold rounded flex items-center gap-2 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-xs"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Zap className="w-4 h-4 fill-slate-950" />}
              IGNITE ATOMIZER CHAMBER
            </button>
          </div>

          {/* Progress bar info */}
          {isRunning && (
            <div className="space-y-1 bg-slate-900/50 p-4 border border-cyan-500/15 rounded">
              <span className="text-[10px] text-cyan-400 font-bold">ATMOSPHERIC SALT MIST BLOWER... {progress}%</span>
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Canvas Render visual mapping */}
          <div className="relative">
            <canvas ref={fogCanvasRef} className="w-full aspect-[460/200] block rounded-lg border border-slate-800 shadow-inner" />
          </div>

          {/* Output factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 hover:bg-slate-900/40 p-4 rounded border border-slate-850 flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[10px]">COASTAL FIELD EQUIVALENT LIFETIME</span>
                <div className="text-[14px] font-bold text-emerald-400 mt-1">{coastalEquivalentYears} Years</div>
              </div>
              <span className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">ASTM G85 COMPLIANT</span>
            </div>

            <div className="bg-slate-950 hover:bg-slate-900/40 p-4 rounded border border-slate-850 flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[10px]">CORROSION CORROSIVITY CATEGORY</span>
                <div className="text-[14px] font-extrabold text-slate-200 mt-1 uppercase">{severityRank} (C4-C5 CLASS)</div>
              </div>
              <span className="p-2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold font-mono">ISO 9223 ACC</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-850 leading-relaxed flex gap-2.5">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="text-slate-400">
              <strong>ASTM B117 Chamber Correlation:</strong> Cyclic salt fog testing accelerates standard outdoor weathering by an average factor of <strong>10x - 15x</strong> depending on temperature and salt concentrations. Utilizing 5% aerosol sprays creates high-density chlorine electrolyte deposits which verify whether conformal resins sustain dielectric properties.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

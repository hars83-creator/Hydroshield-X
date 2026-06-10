/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Flame, Shield, Info, Sliders, RefreshCw } from "lucide-react";

export default function DropletLab() {
  // Preset types
  const [substratePreset, setSubstratePreset] = useState<"super" | "hydrophobic" | "wetting">("super");
  const [surfaceTension, setSurfaceTension] = useState(72.8); // mN/m (value of water standard)
  const [tiltAngle, setTiltAngle] = useState(12); // degrees tilt of the substrate table
  const [cohesionForce, setCohesionForce] = useState(0.85); // inter-particle cohesion

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [contactAngle, setContactAngle] = useState(155);

  // Re-calculate math model contact angle based on preset parameters
  useEffect(() => {
    if (substratePreset === "super") {
      setContactAngle(Math.round(155 + (surfaceTension - 72.8) * 0.2));
    } else if (substratePreset === "hydrophobic") {
      setContactAngle(Math.round(105 + (surfaceTension - 72.8) * 0.4));
    } else {
      setContactAngle(Math.round(45 + (surfaceTension - 72.8) * 0.9));
    }
  }, [substratePreset, surfaceTension]);

  // Interactive drop trigger variables
  const [dropTrigger, setDropTrigger] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const w = (canvas.width = 520);
    const h = (canvas.height = 320);

    // Particle nodes for droplet dynamics simulation (SPH-like system)
    let particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    let isDropping = false;

    const spawnDroplet = () => {
      particles = [];
      const dX = w / 2 - 40;
      const dY = 30;
      // Creates a spherical cluster of co-existing fluid particles
      for (let r = 0; r < 24; r += 5) {
        const numInRing = r === 0 ? 1 : Math.round(r * 2);
        for (let i = 0; i < numInRing; i++) {
          const angle = (i / numInRing) * Math.PI * 2;
          particles.push({
            x: dX + Math.cos(angle) * r + (Math.random() - 0.5) * 1.5,
            y: dY + Math.sin(angle) * r + (Math.random() - 0.5) * 1.5,
            vx: 0,
            vy: 2.2, // falling starting velocity
            radius: 1.5,
          });
        }
      }
      isDropping = true;
    };

    if (dropTrigger > 0) {
      spawnDroplet();
    }

    const radTilt = (tiltAngle * Math.PI) / 180;

    const tick = () => {
      // Clear with dark void
      ctx.fillStyle = "rgb(10, 15, 30)";
      ctx.fillRect(0, 0, w, h);

      // Draw slanted substrate table line base
      // Table pivot centered around middle
      const tableX1 = 40;
      const tableY1 = h / 2 + Math.sin(radTilt) * 180 + 35;
      const tableX2 = w - 40;
      const tableY2 = h / 2 - Math.sin(radTilt) * 180 + 35;

      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tableX1, tableY1);
      ctx.lineTo(tableX2, tableY2);
      ctx.stroke();

      // Microstructured layer under table (Cassie-Baxter air pockets)
      if (substratePreset === "super") {
        ctx.strokeStyle = "rgba(6, 182, 212, 0.45)";
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.moveTo(tableX1, tableY1 - 5);
        ctx.lineTo(tableX2, tableY2 - 5);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Substrate Labels
      ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
      ctx.font = "9px monospace";
      ctx.fillText(`SUBSTRATE TILT: ${tiltAngle}°`, tableX1, tableY1 + 18);

      // Physic solver loops for particles
      if (isDropping && particles.length > 0) {
        // Gravity vector
        const gx = 0;
        const gy = 0.22; // gravity strength

        // Inter-particle pressure cohesion indices
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          p1.vy += gy;
          p1.vx += gx;

          // Simple viscosity and cohesion loops keeping drop together
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 18) {
              const force = (18 - dist) * 0.015 * cohesionForce;
              // Attraction to pull them into spherical drop
              p1.vx += (dx / dist) * force;
              p1.vy += (dy / dist) * force;
              p2.vx -= (dx / dist) * force;
              p2.vy -= (dy / dist) * force;
            }
          }
        }

        // Apply velocities & boundaries with substrate plate
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          // Intersect with slanted substrate line equation
          // Parameter along slope
          const dxLine = tableX2 - tableX1;
          const dyLine = tableY2 - tableY1;
          const lineLen = Math.sqrt(dxLine * dxLine + dyLine * dyLine);
          const u = ((p.x - tableX1) * dxLine + (p.y - tableY1) * dyLine) / (lineLen * lineLen);

          if (u >= 0 && u <= 1) {
            // Find closest projection point on slanted substrate
            const projX = tableX1 + u * dxLine;
            const projY = tableY1 + u * dyLine;
            const distToSurface = Math.sqrt(Math.pow(p.x - projX, 2) + Math.pow(p.y - projY, 2));

            // Collision check! If water particle dips below plate surface boundary
            if (p.y >= projY - 6) {
              p.y = projY - 6;

              // Sliding or bouncing vector resolve
              const normalX = -dyLine / lineLen;
              const normalY = dxLine / lineLen;

              // Reflection rebound vector
              const dotProduct = p.vx * normalX + p.vy * normalY;

              if (substratePreset === "super") {
                // High bounce + instant slide down the slope (Roll-off)
                p.vx = (p.vx - 2 * dotProduct * normalX) * 0.85 + dxLine * 0.005;
                p.vy = (p.vy - 2 * dotProduct * normalY) * 0.85 + dyLine * 0.005;
              } else if (substratePreset === "hydrophobic") {
                // Moderate slide down the slope, almost no bounce
                p.vx = (p.vx - 2 * dotProduct * normalX) * 0.2 + dxLine * 0.002;
                p.vy = (p.vy - 2 * dotProduct * normalY) * 0.2 + dyLine * 0.002;
              } else {
                // Hydrophilic Wetting: sticky film, completely flattened, spreads along slope
                p.vx = (p.vx * 0.1) + dxLine * 0.0001;
                p.vy = (p.vy * 0.1) + dyLine * 0.0001;
              }
            }
          }

          // Render fluid particle
          ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Optional droplet outer envelope boundary curve path
        ctx.strokeStyle = "rgba(14, 165, 233, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        particles.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else if (idx % 3 === 0) ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Cassie-Baxter pocket air illustration on superhydrophobic substrate
      if (substratePreset === "super") {
        ctx.fillStyle = "rgba(34, 211, 238, 0.2)";
        ctx.font = "9px monospace";
        ctx.fillText("CASSIE-BAXTER TRAPPED AIR POCKETS", w / 2 - 100, h - 20);
      } else if (substratePreset === "hydrophobic") {
        ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
        ctx.font = "9px monospace";
        ctx.fillText("PARTIAL SUBSTRATE COHESIVE CONTACT (WENZEL STATE)", w / 2 - 120, h - 20);
      } else {
        ctx.fillStyle = "rgba(244, 63, 94, 0.4)";
        ctx.font = "9px monospace";
        ctx.fillText("COMPLETE SURFACE WETTING (0° CONTACT THRESHOLD)", w / 2 - 120, h - 20);
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => cancelAnimationFrame(animId);
  }, [dropTrigger, substratePreset, tiltAngle, cohesionForce, surfaceTension]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Superhydrophobic Droplet Lab
          </h2>
          <p className="text-slate-400 mt-1">
            SMOOTH FLUID SPH SOLVER · CONTACT ANGLE GEOMETRY & WETTING MECHANICS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parameters sliders */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2.5 border-b border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Dynamic Substrate presets
            </h3>

            {/* Presets Button selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 block pb-1">SUBSTRATE MICRO-TEXTURE Presets</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setSubstratePreset("super")}
                  className={`p-3 rounded border text-left flex justify-between items-center ${
                    substratePreset === "super"
                      ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-300"
                      : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  <div>
                    <span className="font-bold text-[11px] block">SUPERHYDROPHOBIC (Cassie)</span>
                    <span className="text-[9px] text-slate-500 font-normal">Contact angle &gt; 150° · Hyper roll-off</span>
                  </div>
                  <span className="text-[10px] font-bold">155°</span>
                </button>

                <button
                  onClick={() => setSubstratePreset("hydrophobic")}
                  className={`p-3 rounded border text-left flex justify-between items-center ${
                    substratePreset === "hydrophobic"
                      ? "bg-purple-950/20 border-purple-500/40 text-purple-300"
                      : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  <div>
                    <span className="font-bold text-[11px] block">HYDROPHOBIC (Wenzel state)</span>
                    <span className="text-[9px] text-slate-500 font-normal">Contact angle ~105° · Partial wetting</span>
                  </div>
                  <span className="text-[10px] font-bold">105°</span>
                </button>

                <button
                  onClick={() => setSubstratePreset("wetting")}
                  className={`p-3 rounded border text-left flex justify-between items-center ${
                    substratePreset === "wetting"
                      ? "bg-rose-950/20 border-rose-500/40 text-rose-300"
                      : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                  }`}
                >
                  <div>
                    <span className="font-bold text-[11px] block">HYDROPHILIC (Wetting)</span>
                    <span className="text-[9px] text-slate-500 font-normal">Contact angle &lt; 50° · Liquid film spreading</span>
                  </div>
                  <span className="text-[10px] font-bold">45°</span>
                </button>
              </div>
            </div>

            {/* Tilt Angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">SUBSTRATE TILT ANGLE</span>
                <span className="text-cyan-400 font-bold">{tiltAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                value={tiltAngle}
                onChange={(e) => setTiltAngle(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Surface Tension */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">SURFACE TENSION STRENGTH</span>
                <span className="text-cyan-400 font-bold">{surfaceTension} mN/m</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="0.5"
                value={surfaceTension}
                onChange={(e) => setSurfaceTension(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Fluid cohesive scaling */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">COHESIVE PARTICLE VISCOSITY</span>
                <span className="text-cyan-400 font-bold">{cohesionForce} factor</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={cohesionForce}
                onChange={(e) => setCohesionForce(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Fluid SPH Physics Live space */}
        <div className="lg:col-span-8 space-y-4">
          {/* Action trigger button panel */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex justify-between items-center gap-4">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Young-Dupre equation solver</span>
              <span className="text-xs font-bold text-slate-200">Wetting adhesive state: <span className="text-slate-400 uppercase">{substratePreset}</span></span>
            </div>
            <button
              onClick={() => setDropTrigger((prev) => prev + 1)}
              className="px-5 py-2.5 bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-bold rounded flex items-center gap-2 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-xs"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              RELEASE WATER DROPLET
            </button>
          </div>

          {/* Interactive Physics Canvas */}
          <div className="relative">
            <canvas ref={canvasRef} className="w-full aspect-[520/320] block rounded-lg border border-slate-800 bg-slate-950 shadow-inner" />
          </div>

          {/* Physics Solver readouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="bg-slate-950 border border-slate-850 p-3 rounded">
              <span className="text-slate-500 text-[10px]">CONTACT ANGLE (θ)</span>
              <div className="text-base font-bold text-emerald-400 mt-1">{contactAngle}°</div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Youngs boundary eq. resolve</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3 rounded">
              <span className="text-slate-500 text-[10px]">ADHESION ENERGY (mN/m)</span>
              <div className="text-base font-bold text-slate-300 mt-1">
                {(surfaceTension * (1 + Math.cos((contactAngle * Math.PI) / 180))).toFixed(1)}
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">W_adhesion = γ_LV * (1 + cos θ)</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3 rounded">
              <span className="text-slate-500 text-[10px]">SLIDING THRESHOLD</span>
              <div className="text-base font-bold text-cyan-400 mt-1">
                {substratePreset === "super" ? "< 5°" : substratePreset === "hydrophobic" ? "~18°" : "> 40°"}
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Roll-off tilt margin limits</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-850 leading-relaxed flex gap-2.5">
            <Info className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="text-slate-400">
              <strong>SPH Engine Mechanics:</strong> Droplet roll-off is calculated in real-time. In <em>Superhydrophobic (Cassie) presets</em>, the high contact angle (θ &gt; 150°) and micro air pockets eliminate sliding surface shear friction, causing the water particles to bounce elastically and roll off instantly at very subtle tilt margins.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

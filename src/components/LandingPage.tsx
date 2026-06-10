/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from "react";
import { ShieldCheck, ArrowRight, Layers, Sparkles, Database, Activity, Cpu } from "lucide-react";

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = 550);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = 550;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes representing micro PCB copper components
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; color: string }[] = [];
    for (let i = 0; i < 45; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? "rgba(6, 182, 212, 0.4)" : "rgba(16, 185, 129, 0.4)",
      });
    }

    // Water droplets falling onto a protective boundary layer
    const droplets: { x: number; y: number; vy: number; vx: number; radius: number; state: "falling" | "rebounding" }[] = [];

    const draw = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Draw horizontal protective shield barrier representing deep polymer coatings
      const shieldY = height * 0.72;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, shieldY);
      ctx.lineTo(width, shieldY);
      ctx.stroke();

      // Ambient geometric grid
      ctx.strokeStyle = "rgba(51, 65, 85, 0.1)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 1. Draw connecting PCB lattice network
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > shieldY - 5) node.vy *= -1; // Keep nodes below/around the environment

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connect nodes within a key distance
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.12 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Generate and update rain/droplet particle physics
      if (Math.random() < 0.12 && droplets.length < 15) {
        droplets.push({
          x: Math.random() * width,
          y: 0,
          vy: Math.random() * 3 + 3,
          vx: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 3.5 + 2,
          state: "falling",
        });
      }

      for (let i = droplets.length - 1; i >= 0; i--) {
        const drop = droplets[i];
        drop.x += drop.vx;
        drop.y += drop.vy;

        // Bounce perfectly on the hydrophobic shield (Cassie-Baxter superhydrophobic bounce)
        if (drop.state === "falling" && drop.y >= shieldY) {
          drop.y = shieldY - 2;
          drop.vy = -Math.abs(drop.vy) * 0.75; // high elastic rebound
          drop.vx += (Math.random() - 0.5) * 3; // slide or roll off sideways
          drop.state = "rebounding";
        } else if (drop.state === "rebounding" && drop.vy < 0) {
          drop.vy += 0.2; // gravity pulls back down
        } else if (drop.state === "rebounding" && drop.vy >= 0) {
          drop.y += drop.vy;
          drop.vy += 0.2;
        }

        // Render water drop
        ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ripple representation on shield
        if (Math.abs(drop.y - shieldY) < 3.5) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(drop.x, shieldY, drop.radius * 2, drop.radius * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Out of boundaries check
        if (drop.y > height + 20 || drop.x < -20 || drop.x > width + 20) {
          droplets.splice(i, 1);
        }
      }

      // Draw motherboard schematic layers
      ctx.font = "10px monospace";
      ctx.fillStyle = "rgba(6, 182, 212, 0.3)";
      ctx.fillText("SHIELD MATRIX: ACTIVE", 25, 40);
      ctx.fillText("CORROSION DISPERSION SOLVER", 25, 60);
      ctx.fillText("LATTICE NANO-BOUNDS: 99.87%", width - 180, 40);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Navbar Section */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-mono text-sm font-bold tracking-wider text-slate-200">
            HYDROSHIELD-X
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onLaunch}
            className="px-4 py-1.5 rounded-md border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 font-mono text-xs hover:bg-cyan-950/40 transition-all font-bold"
          >
            Terminal Login
          </button>
        </div>
      </nav>

      {/* Hero Visual Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center pt-8 px-4">
        {/* Dynamic Canvas Backing */}
        <div className="absolute inset-0 w-full h-[550px] z-0 pointer-events-none opacity-40 select-none">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Hero Copy overlay */}
        <div className="max-w-4xl text-center z-10 space-y-6 select-none select-text">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-900/95 border border-slate-800 text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-widest leading-none">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            AI-POWERED MATERIALS ENGINEERING DIGITAL TWINPLATFORM
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-100 to-cyan-400">
            HydroShield-X
          </h1>

          <p className="text-sm md:text-base text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed">
            A high-fidelity materials simulation environment integrating **molecular hydrophobic modeling**,
            **electrochemical Tafel solvers**, **3D pitting corrosion growth metrics**, and **AI-driven materials discovery**
            for enterprise electronics reliability and aerospace survivability design.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={onLaunch}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-cyan-500 text-slate-950 font-mono text-sm font-bold flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-[0_0_20px_0_rgba(6,182,212,0.4)]"
            >
              LAUNCH THE DIGITAL TWIN PLATFORM
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={onLaunch}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-sm text-slate-300 hover:bg-slate-850 hover:text-slate-100 transition-all"
            >
              MATERIALS DATABASE
            </button>
          </div>
        </div>
      </div>

      {/* Research Grid Info Sections */}
      <div className="bg-slate-950 border-t border-slate-900/60 py-12 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800/80 hover:border-cyan-500/20 transition-all">
            <div className="p-2 w-fit rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">COATING DESIGNER</h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Synthesize and inspect composite layers at nanometer scale. Calculates cost, adhesion index, and moisture barrier properties instantly.
            </p>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800/80 hover:border-cyan-500/20 transition-all">
            <div className="p-2 w-fit rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">EIS & TAFEL PLOTTER</h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Solves and displays polarization sweeps, Nyquist geometries, and Bode curves using the Butler-Volmer kinetics solver.
            </p>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800/80 hover:border-cyan-500/20 transition-all">
            <div className="p-2 w-fit rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">PCB ROTATIONAL TWIN</h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Detects high risk condensation boundaries, dust leakage currents, and salt fog accelerated failure factors on custom board schematic coordinates.
            </p>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800/80 hover:border-cyan-500/20 transition-all">
            <div className="p-2 w-fit rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">BAYESIAN DISCOVERY</h3>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Uses genetic optimization models to synthesize brand-new candidate alloy matrices complying with cost and environmental limits.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="py-4 text-center text-[10px] text-slate-600 border-t border-slate-900 bg-slate-950 font-mono">
        © 2026 HYDROSHIELD-X LABS INC · ADVANCED MATERIALS SIMULATION PLATFORM DECK
      </footer>
    </div>
  );
}

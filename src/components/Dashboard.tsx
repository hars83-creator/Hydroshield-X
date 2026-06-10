/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Award,
  Layers,
  ThermometerSnowflake,
  Brain,
  ShieldCheck,
  TrendingDown,
  LineChart,
  TableProperties
} from "lucide-react";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  // Live simulated BME280/DHT22 sensors
  const [sensors, setSensors] = useState({
    temp: 24.5,
    humidity: 55.2,
    nacl: 0.12,
    leakageCurrent: 82.5,
    vibration: 0.02
  });

  // Recent reports log
  const [reports, setReports] = useState([
    { id: "REP001", scope: "Fighter Jet Avionics Conformal Coating Seal Beta", status: "Certified", date: "2026-06-08" },
    { id: "REP002", scope: "Lithium Ion Battery Shield Pitting Probability Scan", status: "Approved", date: "2026-06-09" },
    { id: "REP003", scope: "Advanced Graphene-Oxide Composite Permeation Matrix", status: "Processing", date: "2026-06-10" }
  ]);

  const [simRunning, setSimRunning] = useState(3);

  // Update periodic sensor telemetry data
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => ({
        temp: +(prev.temp + (Math.random() - 0.5) * 0.4).toFixed(2),
        humidity: +(prev.humidity + (Math.random() - 0.5) * 0.8).toFixed(2),
        nacl: +(Math.max(0.01, prev.nacl + (Math.random() - 0.5) * 0.01)).toFixed(3),
        leakageCurrent: +(Math.max(10, prev.leakageCurrent + (Math.random() - 0.5) * 4.5)).toFixed(1),
        vibration: +(Math.max(0, prev.vibration + (Math.random() - 0.5) * 0.005)).toFixed(3)
      }));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Canvas drawing for Corrosion Trends & Lifetime curve
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const reliabilityCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    drawTrendChart();
    drawReliabilityChart();
  }, [sensors]);

  const drawTrendChart = () => {
    const canvas = trendCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
    ctx.fillRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 40; i < w; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h - 25);
      ctx.stroke();
    }
    for (let i = 20; i < h - 20; i += 30) {
      ctx.beginPath();
      ctx.moveTo(25, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // Graph Line 1: Corrosion Loss on Uncoated copper (mm/year acceleration)
    ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 30; x < w; x++) {
      const xPct = (x - 30) / (w - 30);
      // logarithmic or exponential corrosion curves
      const yVal = h - 25 - (Math.pow(xPct, 1.3) * (h - 60)) - (Math.sin(xPct * 12) * 5);
      if (x === 30) ctx.moveTo(x, yVal);
      else ctx.lineTo(x, yVal);
    }
    ctx.stroke();

    // Graph Line 2: Corrosion Loss on HydroShield coated Copper (extremely flat protection)
    ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 30; x < w; x++) {
      const xPct = (x - 30) / (w - 30);
      const yVal = h - 25 - (Math.pow(xPct, 0.8) * 20) - (Math.sin(xPct * 5) * 2);
      if (x === 30) ctx.moveTo(x, yVal);
      else ctx.lineTo(x, yVal);
    }
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "9px monospace";
    ctx.fillText("0 hr", 23, h - 10);
    ctx.fillText("500 hr", w / 2 - 15, h - 10);
    ctx.fillText("1000 hr", w - 45, h - 10);
    ctx.fillText("Corrosion Penetration mm", 32, 14);
  };

  const drawReliabilityChart = () => {
    const canvas = reliabilityCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 40; i < w; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h - 25);
      ctx.stroke();
    }
    for (let i = 20; i < h - 20; i += 30) {
      ctx.beginPath();
      ctx.moveTo(25, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // Draw Weibull Survival curve (reliability index)
    // R(t) = exp(-(t/eta)^beta)
    ctx.strokeStyle = "rgba(6, 182, 212, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const beta = 1.6;
    const eta = 0.7; // characteristic life scale
    for (let x = 30; x < w; x++) {
      const t = (x - 30) / (w - 30);
      const survival = Math.exp(-Math.pow(t / eta, beta));
      const yVal = h - 25 - survival * (h - 55);
      if (x === 30) ctx.moveTo(x, yVal);
      else ctx.lineTo(x, yVal);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "9px monospace";
    ctx.fillText("Years: 0", 23, h - 10);
    ctx.fillText("10 yrs", w / 2 - 15, h - 10);
    ctx.fillText("20 yrs", w - 45, h - 10);
    ctx.fillText("Probability of Survival R(t)", 32, 14);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-6rem)] text-[#e0e6ed] relative tech-grid-dense">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1a1f2e]">
        <div>
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2 uppercase tracking-tight">
            <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse shadow-[0_0_8px_#00f2ff]" />
            Control Center Dashboard
          </h2>
          <p className="text-[10px] text-[#64748b] font-mono mt-1 tracking-wider uppercase">
            DIGITAL TWIN CENTRAL INTERFACE · MONITORING 11 CLOUDSOLVER PIPELINES
          </p>
        </div>
        <div className="bg-[#0a0d14] border border-[#1a1f2e] px-3 py-1.5 rounded-sm flex items-center gap-3">
          <div className="text-[10px] font-mono text-right">
            <div className="text-[#64748b]">SESSION TIMEOUT:</div>
            <div className="text-[#00f2ff] font-bold">23H 59M 58S [LIVE_SYNC]</div>
          </div>
        </div>
      </div>

      {/* Grid Key Stats Core Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        {/* Stat 1 */}
        <div className="bg-[#111827] p-4 rounded-sm border border-[#1a1f2e] flex justify-between items-center group hover:border-[#00f2ff]/30 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider">ACTIVE PROJECTS</span>
            <div className="text-lg font-bold text-white">14 Active</div>
            <span className="text-[9px] text-[#00f2ff] font-bold">98.2% Completion</span>
          </div>
          <div className="bg-[#05070a] p-2.5 rounded-sm text-[#00f2ff] border border-[#1a1f2e] group-hover:scale-105 transition-transform duration-200">
            <Activity className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#111827] p-4 rounded-sm border border-[#1a1f2e] flex justify-between items-center group hover:border-[#00ff9d]/30 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider">NUMERICAL SIMS</span>
            <div className="text-lg font-bold text-white">{simRunning} Processing</div>
            <span className="text-[9px] text-[#00ff9d] font-bold">SPH + FE Transient</span>
          </div>
          <div className="bg-[#05070a] p-2.5 rounded-sm text-[#00ff9d] border border-[#1a1f2e] group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#111827] p-4 rounded-sm border border-[#1a1f2e] flex justify-between items-center group hover:border-[#0066ff]/30 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider">MATERIALS STORED</span>
            <div className="text-lg font-bold text-white">11 Nanotech</div>
            <span className="text-[9px] text-[#94a3b8]">Carbon, Polymers & Oxides</span>
          </div>
          <div className="bg-[#05070a] p-2.5 rounded-sm text-[#0066ff] border border-[#1a1f2e] group-hover:scale-105 transition-transform duration-200">
            <TableProperties className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#111827] p-4 rounded-sm border border-[#1a1f2e] flex justify-between items-center group hover:border-[#ff8c00]/30 transition-all">
          <div className="space-y-1">
            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider">AI ESTIMATES ACC</span>
            <div className="text-lg font-bold text-white">99.45% Acc</div>
            <span className="text-[9px] text-[#ff8c00] font-bold">Bayesian Confidence</span>
          </div>
          <div className="bg-[#05070a] p-2.5 rounded-sm text-[#ff8c00] border border-[#1a1f2e] group-hover:scale-105 transition-transform duration-200">
            <Brain className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Corrosion penetration */}
        <div className="bg-[#0a0d14]/85 p-5 rounded-sm border border-[#1a1f2e] flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#1a1f2e] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold font-mono text-white flex items-center gap-1.5 uppercase">
                <LineChart className="w-4 h-4 text-[#ff4e00]" />
                ASTM B117 / Salt Spray Degradation
              </h3>
              <p className="text-[9.5px] text-[#64748b] font-mono mt-0.5 font-normal">Penetration kinetics of untreated copper vs Graphene-SiO₂ shield alloy.</p>
            </div>
            <span className="bg-[#ff4e00]/10 text-[#ff4e00] px-2 py-0.5 rounded-sm text-[9px] border border-[#ff4e00]/25 font-mono font-bold uppercase tracking-widest text-[8.5px]">LIVE SOLVER</span>
          </div>
          <canvas ref={trendCanvasRef} width={450} height={180} className="w-full h-40 rounded-sm bg-[#05070a] border border-[#1a1f2e]" />
          <div className="flex justify-end gap-4 mt-3 font-mono text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 bg-[#ff4e00] rounded-sm" />
              <span className="text-[#94a3b8]">Bare Copper trace</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 bg-[#00ff9d] rounded-sm" />
              <span className="text-[#00ff9d]">HydroShield Protected</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Survival Reliability curve */}
        <div className="bg-[#0a0d14]/85 p-5 rounded-sm border border-[#1a1f2e] flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#1a1f2e] pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold font-mono text-white flex items-center gap-1.5 uppercase">
                <LineChart className="w-4 h-4 text-[#00f2ff]" />
                Cumulative Survival Curve R(t)
              </h3>
              <p className="text-[9.5px] text-[#64748b] font-mono mt-0.5 font-normal">Weibull reliability calculation modeling moisture barrier lifetime degradation.</p>
            </div>
            <span className="bg-[#00f2ff]/10 text-[#00f2ff] px-2 py-0.5 rounded-sm text-[9px] border border-[#00f2ff]/25 font-mono font-bold uppercase tracking-widest text-[8.5px]">WEIBULL RUNNER</span>
          </div>
          <canvas ref={reliabilityCanvasRef} width={450} height={180} className="w-full h-40 rounded-sm bg-[#05070a] border border-[#1a1f2e]" />
          <div className="flex justify-end gap-4 mt-3 font-mono text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 bg-[#00f2ff] rounded-sm" />
              <span className="text-[#00f2ff]">Estimated Reliability R(t)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sensors & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Recent Reports: Columns 8 */}
        <div className="lg:col-span-8 bg-[#0a0d14]/85 p-5 rounded-sm border border-[#1a1f2e]">
          <div className="flex justify-between items-center border-b border-[#1a1f2e] pb-3 mb-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-500" />
              Certification Logs & Analytical Solves
            </h3>
            <button onClick={() => onNavigate("reports")} className="text-[10px] text-[#00f2ff] hover:underline font-bold uppercase">
              View All Reports →
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="grid grid-cols-12 gap-2 text-[#64748b] font-bold bg-[#05070a] p-2 rounded-sm border border-[#1a1f2e] uppercase text-[9px]">
              <span className="col-span-2">REPORT #</span>
              <span className="col-span-6">SCOPE</span>
              <span className="col-span-2">STATUS</span>
              <span className="col-span-2 text-right">DATE</span>
            </div>
            {reports.map(rep => (
              <div key={rep.id} className="grid grid-cols-12 gap-2 p-2 bg-[#111827]/40 rounded-sm hover:bg-[#111827] border border-[#1a1f2e]/60 transition-all items-center">
                <span className="col-span-2 text-[#00f2ff] font-bold text-[10px]">{rep.id}</span>
                <span className="col-span-6 text-[#94a3b8] truncate text-[10.5px]">{rep.scope}</span>
                <span className="col-span-2">
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] shrink-0 font-bold uppercase ${
                    rep.status === "Certified" ? "bg-emerald-950/40 text-[#00ff9d] border border-emerald-500/25" :
                    rep.status === "Approved" ? "bg-cyan-950/40 text-[#00f2ff] border border-[#00f2ff]/25" : "bg-amber-950/40 text-[#ff8c00] border border-amber-500/25"
                  }`}>
                    {rep.status}
                  </span>
                </span>
                <span className="col-span-2 text-right text-[#64748b] text-[10px]">{rep.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ambient Esp32/BmeData: Columns 4 */}
        <div className="lg:col-span-4 bg-[#0a0d14]/85 p-5 rounded-sm border border-[#1a1f2e] flex flex-col justify-between">
          <div className="border-b border-[#1a1f2e] pb-3 mb-4 flex justify-between items-center">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <ThermometerSnowflake className="w-4 h-4 text-[#00ff9d] animate-pulse" />
              Receptor Telemetry
            </h3>
            <span className="w-1.5 h-1.5 bg-[#00ff9d] rounded-full animate-pulse shadow-[0_0_6px_#00ff9d]" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-[#05070a] p-2 rounded-sm border border-[#1a1f2e] font-mono">
              <span className="text-[#64748b] text-[10px] uppercase font-bold">ESP32 RECEPTOR_01</span>
              <span className="text-[#00ff9d] font-bold text-[12px] tabular-nums">{sensors.temp} °C</span>
            </div>
            <div className="flex justify-between items-center bg-[#05070a] p-2 rounded-sm border border-[#1a1f2e] font-mono">
              <span className="text-[#64748b] text-[10px] uppercase font-bold">BME280 REL_HUMIDITY</span>
              <span className="text-[#00f2ff] font-bold text-[12px] tabular-nums">{sensors.humidity} %</span>
            </div>
            <div className="flex justify-between items-center bg-[#05070a] p-2 rounded-sm border border-[#1a1f2e] font-mono">
              <span className="text-[#64748b] text-[10px] uppercase font-bold">NaCl CONCENTRATION</span>
              <span className="text-amber-500 font-bold text-[12px] tabular-nums">{sensors.nacl} %</span>
            </div>
            <div className="flex justify-between items-center bg-[#05070a] p-2 rounded-sm border border-[#1a1f2e] font-mono">
              <span className="text-[#64748b] text-[10px] uppercase font-bold">COPPER LEAKAGE</span>
              <span className="text-[#ff4e00] font-bold text-[12px] tabular-nums">{sensors.leakageCurrent} nA</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate("sensors")}
            className="mt-3.5 w-full py-2 bg-[#1b2330] hover:bg-[#253042] border border-[#1a1f2e] text-[#94a3b8] hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-sm transition-all"
          >
            Launch Receptor Hub →
          </button>
        </div>
      </div>
    </div>
  );
}

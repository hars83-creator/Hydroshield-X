/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sliders, Thermometer, Wind, ShieldAlert, Cpu, Layers } from "lucide-react";

export default function ThermalContaminationLab() {
  // Thermal Inputs
  const [cpuPower, setCpuPower] = useState(45); // Watts
  const [gpuPower, setGpuPower] = useState(65); // Watts
  const [vrmPower, setVrmPower] = useState(15); // Watts
  const [airFlow, setAirFlow] = useState(2.5); // m/s
  const [relativeHumidity, setRelativeHumidity] = useState(82); // % RH

  // Contamination Inputs
  const [dustParticulates, setDustParticulates] = useState(12.0); // µg/cm²
  const [hydrophobicShield, setHydrophobicShield] = useState("ceramics");

  // Output calculations
  const [dewPoint, setDewPoint] = useState(21.4);
  const [condensationRisk, setCondensationRisk] = useState("High");
  const [leakageCurrent, setLeakageCurrent] = useState(24.5); // nA

  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Math equations for Dew point and leakage
  useEffect(() => {
    // Magnus-Tetens Equation for Dew Point (approximate)
    const T = 24.5; // Ambient temperature standard
    const RH = relativeHumidity;
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * T) / (b + T) + Math.log(RH / 100);
    const calculatedDewPoint = (b * alpha) / (a - alpha);
    setDewPoint(+calculatedDewPoint.toFixed(1));

    // Condensation Risk check: if ambient surface temperature is near dewpoint
    // Let's assume cold surface components run around 20°C if high fan flow cooling is active
    const estSurfaceTemp = 24.5 - airFlow * 2.2;
    const gap = estSurfaceTemp - calculatedDewPoint;

    if (gap <= 1.0) setCondensationRisk("Critical");
    else if (gap <= 3.5) setCondensationRisk("High");
    else setCondensationRisk("Low");

    // Leakage current calculated based on humidity wetting + dust particulate conductance
    // Pure water is insulative, but dust salt deposits create severe conductive electrolyte films
    const dustImpedanceReduction = dustParticulates * 8.5;
    const humidityCond = Math.exp((RH - 50) / 15);
    const bareLeakage = (dustImpedanceReduction + 2.5) * humidityCond;

    // Conformal hydrophobic barrier reduces dust-moisture wetting contact
    let shieldingFactor = 1.0;
    if (hydrophobicShield === "ceramics") shieldingFactor = 0.001; // extreme protection
    else if (hydrophobicShield === "parylene") shieldingFactor = 0.005;
    else if (hydrophobicShield === "pdms") shieldingFactor = 0.08;
    else if (hydrophobicShield === "none") shieldingFactor = 1.0;

    const finalLeakage = bareLeakage * shieldingFactor;
    setLeakageCurrent(+finalLeakage.toFixed(2));
  }, [cpuPower, gpuPower, vrmPower, airFlow, relativeHumidity, dustParticulates, hydrophobicShield]);

  // Renders real-time 2D thermal distribution grids based on Power inputs
  useEffect(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Clear board
    ctx.fillStyle = "rgb(15, 23, 42)";
    ctx.fillRect(0, 0, w, h);

    // Grid coordinates
    const gridCols = 20;
    const gridRows = 10;
    const tW = w / gridCols;
    const tH = h / gridRows;

    // Solve local temperatures at grid cells using a quick relaxation hot conduction grid
    const tempGrid = Array.from({ length: gridRows }, () => Array(gridCols).fill(24.5)); // Ambient start

    // Inject Heat Sources (CPU, GPU, VRM hot zones)
    // CPU Source (center left)
    const cpuR = 4;
    const cpuC = 6;
    tempGrid[cpuR][cpuC] = 24.5 + cpuPower * 1.25 - airFlow * 2.5;

    // GPU Source (center right)
    const gpuR = 5;
    const gpuC = 135 / tW; // mapping
    const gpuC_col = 14;
    tempGrid[gpuR][gpuC_col] = 24.5 + gpuPower * 1.1 - airFlow * 2.8;

    // VRM Source (top boundary)
    tempGrid[2][5] = 24.5 + vrmPower * 1.8 - airFlow * 1.8;

    // Apply 2 iteration thermal relaxation spreading for blur gradient effect
    for (let k = 0; k < 2; k++) {
      for (let r = 1; r < gridRows - 1; r++) {
        for (let c = 1; c < gridCols - 1; c++) {
          tempGrid[r][c] = (tempGrid[r][c] * 2 + tempGrid[r - 1][c] + tempGrid[r + 1][c] + tempGrid[r][c - 1] + tempGrid[r][c + 1]) / 6;
        }
      }
    }

    // Paint Grid with Thermo colors (blue to red)
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const val = tempGrid[r][c];
        // Blue (24°C) up to glowing red (90°C)
        const heatPct = Math.min(1.0, Math.max(0, (val - 24) / 60));
        const redValue = Math.round(59 + heatPct * 196);
        const greenValue = Math.round(130 * (1 - heatPct) + heatPct * 30);
        const blueValue = Math.round(246 * (1 - heatPct) + heatPct * 10);

        ctx.fillStyle = `rgb(${redValue}, ${greenValue}, ${blueValue})`;
        ctx.fillRect(c * tW, r * tH, tW - 1, tH - 1);
      }
    }

    // Circle components labels overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.arc(cpuC * tW + tW / 2, cpuR * tH + tH / 2, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [cpuPower, gpuPower, vrmPower, airFlow]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Thermal & Contamination Engine
          </h2>
          <p className="text-slate-400 mt-1">
            CONJUGATE HEAT TRANSFER SOLVER · DUST ION CORROSION CONTAMINANT ANALYZER
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parameters sliders. Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2.5 border-b border-slate-800 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-rose-400 animate-pulse" />
              Thermal Conjugating
            </h3>

            {/* Slider inputs */}
            <div className="space-y-3">
              {/* CPU Power */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">CPU LOAD POWER</span>
                  <span className="text-cyan-400 font-bold">{cpuPower} Watts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={cpuPower}
                  onChange={(e) => setCpuPower(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* GPU Power */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">GPU LOAD POWER</span>
                  <span className="text-cyan-400 font-bold">{gpuPower} Watts</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="250"
                  value={gpuPower}
                  onChange={(e) => setGpuPower(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* VRM Power */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">VRM REGULATOR LOAD</span>
                  <span className="text-cyan-400 font-bold">{vrmPower} Watts</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="45"
                  value={vrmPower}
                  onChange={(e) => setVrmPower(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Airflow flow rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">CONVECTIVE FAN AIRFLOW</span>
                  <span className="text-cyan-400 font-bold">{airFlow} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={airFlow}
                  onChange={(e) => setAirFlow(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-teal-400" />
              Contamination & Shield
            </h3>

            <div className="space-y-3">
              {/* Relative Humidity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">AMBIENT HUMIDITY</span>
                  <span className="text-cyan-400 font-bold">{relativeHumidity}% RH</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={relativeHumidity}
                  onChange={(e) => setRelativeHumidity(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Dust deposits */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">DUST DEPOSITS</span>
                  <span className="text-cyan-400 font-bold">{dustParticulates} µg/cm²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={dustParticulates}
                  onChange={(e) => setDustParticulates(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Shield type */}
              <div>
                <label className="text-[9px] text-slate-400 block mb-1">CONFORMAL CORE SHIELD</label>
                <select
                  value={hydrophobicShield}
                  onChange={(e) => setHydrophobicShield(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 outline-none text-[11px] font-bold text-cyan-400"
                >
                  <option value="none">[NO SHIELD - BARE SOLDER INTERFACE]</option>
                  <option value="pdms">Hydrophobic PDMS coating</option>
                  <option value="parylene">Dielectric Parylene C film</option>
                  <option value="ceramics">Hydrophobic SuperAlumina (Al₂O₃)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Thermal heatmap canvas & details. Col span 8 */}
        <div className="lg:col-span-8 space-y-6">
          {/* Alarms and warning box */}
          {condensationRisk === "Critical" ? (
            <div className="p-4 bg-rose-950/20 text-rose-400 rounded-lg border border-rose-500/25 flex gap-3 items-center animate-pulse">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold block text-rose-300">THERMAL ALERT: CRITICAL DEW-POINT CONDENSATION ZONE!</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Ambient temperature is below dewpoint. Water vapor will condense instantly on bare VRM/CPU solder joints, promoting catastrophic leakage currents.</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-950/15 text-emerald-400 rounded-lg border border-emerald-500/20 flex gap-3 items-center">
              <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block text-emerald-300">SYSTEM THERMALS EXCELLENT: NO LIQUID DEW DETECTED</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Convective fan flows prevent surface metal areas from dropping near dew point thresholds.</span>
              </div>
            </div>
          )}

          {/* Thermal Distribution Heatmap */}
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1 border-b border-slate-800 mb-2 flex justify-between">
              <span>Semiconductor Heat Dissipation Gradient map</span>
              <span className="text-[10px] text-rose-400">CONJUGATE COUPLER</span>
            </h3>

            <canvas ref={heatmapCanvasRef} width={480} height={200} className="w-full h-48 rounded bg-slate-950 border border-slate-850 shadow-inner" />
          </div>

          {/* Digital Output values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-center">
            <div className="bg-slate-950 border border-slate-850 p-3 rounded">
              <span className="text-slate-500 text-[10px]">DEW POINT TEMPERATURE</span>
              <div className="text-base font-bold text-cyan-400 mt-1">{dewPoint} °C</div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Atmospheric condensation index</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3 rounded">
              <span className="text-slate-500 text-[10px]">CONDENSATION RISK</span>
              <div className={`text-base font-extrabold mt-1 uppercase ${condensationRisk === "Critical" ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                {condensationRisk} RISK
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Humidity dew proximity</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3 rounded">
              <span className="text-slate-500 text-[10px]">LEAKAGE CURRENT MEASURED</span>
              <div className={`text-base font-bold mt-1 ${leakageCurrent > 50 ? "text-rose-400" : "text-emerald-400"}`}>
                {leakageCurrent} nA
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Ionic dust conductance level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sliders, RefreshCw, Layers, TrendingUp, Info } from "lucide-react";

export default function ElectrochemicalLab() {
  // Kinetic parameters
  const [exchangeCurrent, setExchangeCurrent] = useState(1e-6); // A/cm²
  const [tafelAnodic, setTafelAnodic] = useState(0.12); // V/decade
  const [tafelCathodic, setTafelCathodic] = useState(0.12); // V/decade
  const [solutionResistance, setSolutionResistance] = useState(12); // Ohm
  const [chargeTransferResistance, setChargeTransferResistance] = useState(250); // Ohm
  const [doubleLayerCapacitance, setDoubleLayerCapacitance] = useState(15); // µF

  // Plot Canvases
  const nyquistCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tafelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    drawNyquistCurve();
    drawTafelPolarization();
    drawBodePlot();
  }, [exchangeCurrent, tafelAnodic, tafelCathodic, solutionResistance, chargeTransferResistance, doubleLayerCapacitance]);

  // Solver 1: Nyquist plot circular impedance loop
  const drawNyquistCurve = () => {
    const canvas = nyquistCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgb(10, 15, 30)";
    ctx.fillRect(0, 0, w, h);

    // Draw coordinate grids
    ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 40; i < w; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h - 30);
      ctx.stroke();
    }
    for (let i = 30; i < h - 30; i += 30) {
      ctx.beginPath();
      ctx.moveTo(35, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // Solve and plot impedance semicircle R_s + R_ct loop
    // Z_real = R_s + R_ct / (1 + w²*C²*R_ct²)
    // Z_imag = w*C*R_ct² / (1 + w²*C²*R_ct²)
    ctx.strokeStyle = "rgb(6, 182, 212)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    // Mapping coefficients
    const scaleX = (w - 60) / (solutionResistance + chargeTransferResistance + 50);
    const scaleY = (h - 60) / (chargeTransferResistance / 2 + 50);

    // Logarithmic frequency sweep (Hz)
    const frequencies = Array.from({ length: 150 }, (_, i) => Math.pow(10, -1 + (i / 150) * 6));

    frequencies.forEach((f, idx) => {
      const omega = 2 * Math.PI * f;
      const C = doubleLayerCapacitance * 1e-6;
      const R_s = solutionResistance;
      const R_ct = chargeTransferResistance;

      const den = 1 + Math.pow(omega * C * R_ct, 2);
      const zReal = R_s + R_ct / den;
      const zImag = (omega * C * Math.pow(R_ct, 2)) / den; // -Z'' imaginary component

      // Map to canvas coordinate grid
      const cx = 40 + zReal * scaleX;
      const cy = h - 35 - zImag * scaleY;

      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Labels
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "9px monospace";
    ctx.fillText("Z' Real (Ω)", w - 75, h - 12);
    ctx.fillText("-Z'' Imag (Ω)", 42, 14);
    ctx.fillText(`${solutionResistance} Ω`, 40 + solutionResistance * scaleX - 10, h - 12);
    ctx.fillText(`${solutionResistance + chargeTransferResistance} Ω`, 40 + (solutionResistance + chargeTransferResistance) * scaleX - 25, h - 12);
  };

  // Solver 2: Tafel polarization curve log(i) vs Overpotential
  const drawTafelPolarization = () => {
    const canvas = tafelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgb(10, 15, 30)";
    ctx.fillRect(0, 0, w, h);

    // Draw coordinate grids
    ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 40; i < w; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h - 30);
      ctx.stroke();
    }
    for (let i = 30; i < h - 30; i += 30) {
      ctx.beginPath();
      ctx.moveTo(35, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // Butler Volmer current: i = i0 * [exp(eta/beta_a) - exp(-eta/beta_c)]
    ctx.strokeStyle = "rgb(244, 63, 94)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const overpotentialSweep = Array.from({ length: 150 }, (_, i) => -0.4 + (i / 150) * 0.8); // -0.4V to +0.4V

    overpotentialSweep.forEach((eta, idx) => {
      // Butler Volmer
      const termAnodic = Math.exp((2.3 * eta) / tafelAnodic);
      const termCathodic = Math.exp((-2.3 * eta) / tafelCathodic);
      const currentDensity = exchangeCurrent * (termAnodic - termCathodic);

      // Log scale for current density (A/cm²)
      const logI = Math.log10(Math.max(1e-10, Math.abs(currentDensity)));

      // Map: LogI sweep typically spans -10 to -2
      const cx = 40 + ((eta + 0.4) / 0.8) * (w - 60);
      const cy = h - 35 - ((logI + 10) / 8) * (h - 60);

      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Axis label
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "9px monospace";
    ctx.fillText("Overpotential η (V vs SHE)", w / 3, h - 12);
    ctx.fillText("Log Current |i| (A/cm²)", 42, 14);
  };

  // Solver 3: Bode frequency impedance plot
  const drawBodePlot = () => {
    const canvas = bodeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgb(10, 15, 30)";
    ctx.fillRect(0, 0, w, h);

    // Draw coordinate grids
    ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 40; i < w; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h - 30);
      ctx.stroke();
    }
    for (let i = 30; i < h - 30; i += 30) {
      ctx.beginPath();
      ctx.moveTo(35, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // Bode total impedance magnitude |Z| vs Frequency f (log log scale)
    ctx.strokeStyle = "rgb(16, 185, 129)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const frequencies = Array.from({ length: 150 }, (_, i) => Math.pow(10, -1 + (i / 150) * 6)); // 0.1 Hz to 100 kHz

    frequencies.forEach((f, idx) => {
      const omega = 2 * Math.PI * f;
      const C = doubleLayerCapacitance * 1e-6;
      const R_s = solutionResistance;
      const R_ct = chargeTransferResistance;

      // Z(omega) equivalent parallel RC network series Rs
      const den = 1 + Math.pow(omega * C * R_ct, 2);
      const zReal = R_s + R_ct / den;
      const zImag = (omega * C * Math.pow(R_ct, 2)) / den;
      const magZ = Math.sqrt(zReal * zReal + zImag * zImag);

      // Map frequency (log10 f from -1 to 5)
      const logF = Math.log10(f);
      const cx = 40 + ((logF + 1) / 6) * (w - 60);

      // Map logZ (from log(R_s) down to log(R_s + R_ct))
      const logZ = Math.log10(magZ);
      // Span 0 to 4 (1 ohm to 10,000 ohm)
      const cy = h - 35 - (logZ / 4) * (h - 60);

      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Axis label
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "9px monospace";
    ctx.fillText("Frequency Log(f) (Hz)", w / 3, h - 12);
    ctx.fillText("Impedance Log|Z| (Ω)", 42, 14);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Electrochemical Workstation
          </h2>
          <p className="text-slate-400 mt-1">
            BUTLER-VOLMER RESOLVER · POLARIZATION Tafel PLOTTER & IMPEDANCE FREQUENCY SPECTROMETER
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Parameter controllers: Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2.5 border-b border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-rose-400" />
              Kinetic Parameters
            </h3>

            {/* exchange current log10 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-bold">EXCHANGE CURRENT DENSITY</span>
                <span className="text-pink-400 uppercase">{exchangeCurrent.toExponential(1)} A/cm²</span>
              </div>
              <input
                type="range"
                min="-8"
                max="-3"
                step="1"
                value={Math.log10(exchangeCurrent)}
                onChange={(e) => setExchangeCurrent(Math.pow(10, Number(e.target.value)))}
                className="w-full accent-pink-400"
              />
            </div>

            {/* Tafel anodic */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">TAFEL ANODIC SLOPE (βa)</span>
                <span className="text-cyan-400 font-bold">{tafelAnodic} V/dec</span>
              </div>
              <input
                type="range"
                min="0.03"
                max="0.30"
                step="0.01"
                value={tafelAnodic}
                onChange={(e) => setTafelAnodic(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Tafel cathodic */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">TAFEL CATHODIC SLOPE (βc)</span>
                <span className="text-cyan-400 font-bold">{tafelCathodic} V/dec</span>
              </div>
              <input
                type="range"
                min="0.03"
                max="0.30"
                step="0.01"
                value={tafelCathodic}
                onChange={(e) => setTafelCathodic(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Electrolyte solution Rs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">SOLUTION RESISTANCE (Rs)</span>
                <span className="text-cyan-400 font-bold">{solutionResistance} Ω</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={solutionResistance}
                onChange={(e) => setSolutionResistance(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Charge transfer Rct */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400 font-bold">CHARGE TRANSFER RES. (Rct)</span>
                <span className="text-cyan-400 font-bold">{chargeTransferResistance} Ω</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                value={chargeTransferResistance}
                onChange={(e) => setChargeTransferResistance(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Double layer cap */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">DOUBLE LAYER CAPACITANCE (Cdl)</span>
                <span className="text-cyan-400 font-bold">{doubleLayerCapacitance} µF</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={doubleLayerCapacitance}
                onChange={(e) => setDoubleLayerCapacitance(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Right Plot Workspace: Col span 8 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Semicirlce Nyquist */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1 border-b border-slate-800 flex justify-between">
                <span>Nyquist Spectrum (Cole-Cole plot)</span>
                <span className="text-[10px] text-cyan-400">EIS loop</span>
              </h3>
              <canvas ref={nyquistCanvasRef} width={380} height={210} className="w-full aspect-[380/210] rounded bg-slate-950 border border-slate-850" />
            </div>

            {/* Tafel Pol */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1 border-b border-slate-800 flex justify-between">
                <span>Tafel Polarisation Sweep</span>
                <span className="text-[10px] text-purple-400">corrosion kinetic</span>
              </h3>
              <canvas ref={tafelCanvasRef} width={380} height={210} className="w-full aspect-[380/210] rounded bg-slate-950 border border-slate-850" />
            </div>

            {/* Bode Plot */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-3 col-span-1 md:col-span-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1 border-b border-slate-800 flex justify-between">
                <span>Bode Magnitude Frequency Spectrum</span>
                <span className="text-[10px] text-emerald-400">Total Impedance |Z|</span>
              </h3>
              <canvas ref={bodeCanvasRef} width={760} height={200} className="w-full h-44 rounded bg-slate-950 border border-slate-850" />
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-850 leading-relaxed flex gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span className="text-slate-400">
              <strong>Electrochemical EIS Solvers:</strong> When hydrophobic barriers conform perfectly around metal grids, they block electrolyte conduction paths. This raises <strong>Charge Transfer Resistance (Rct)</strong>, pushing the Nyquist Cole-Cole semicircle radius outward, indicating robust prevention of electrochemical corrosion kinetics.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

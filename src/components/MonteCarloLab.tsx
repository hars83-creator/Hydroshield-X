/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sliders, RefreshCw, BarChart2, CheckCircle2, TrendingUp, Info } from "lucide-react";

export default function MonteCarloLab() {
  const [batchSize, setBatchSize] = useState(1000); // 100 - 5000 specimens
  const [varianceSigma, setVarianceSigma] = useState(2.2); // years variance deviation
  const [targetYears, setTargetYears] = useState(10); // threshold year benchmark

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Solved statistical outputs
  const [mttf, setMttf] = useState(14.8); // Mean Time To Failure
  const [worstCaseLife, setWorstCaseLife] = useState(8.2);
  const [yieldPercent, setYieldPercent] = useState(94.5);

  const bellCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gaussian statistical math solvers
  useEffect(() => {
    // Generate simulated MTTF base based on variance sigma
    // Mean centers around 14.5 years for a good parylene coating
    const meanLife = 14.6;
    setMttf(meanLife);

    // Worst-case life (3-sigma lower limit)
    const worst = Math.max(1.5, +(meanLife - 3 * (varianceSigma / 2)).toFixed(1));
    setWorstCaseLife(worst);

    // Cumulative normal distribution function for failure risk before targetYears:
    // Z = (targetYears - meanLife) / sigma
    const zScore = (targetYears - meanLife) / (varianceSigma / 2);
    // Standard approximation of erf for normal CDF
    const tVal = 1 / (1 + 0.2316419 * Math.abs(zScore));
    const dVal = 0.3989423 * Math.exp(-zScore * zScore / 2);
    const probFail = dVal * tVal * (0.3193815 + tVal * (-0.3565638 + tVal * (1.781478 + tVal * (-1.821256 + 1.330274 * tVal))));

    let finalYield = 0;
    if (zScore < 0) {
      finalYield = (1 - probFail) * 100;
    } else {
      finalYield = probFail * 100;
    }

    setYieldPercent(+finalYield.toFixed(1));
  }, [batchSize, varianceSigma, targetYears]);

  // Handle live calculation loops & render the normal bell curve diagram
  useEffect(() => {
    const canvas = bellCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = (canvas.width = 480);
    const h = (canvas.height = 200);

    ctx.fillStyle = "rgb(10, 15, 30)";
    ctx.fillRect(0, 0, w, h);

    // Coordinates grid and axis lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(35, h - 30);
    ctx.lineTo(w - 20, h - 30);
    ctx.stroke();

    // Normal probability bell bellCurve: y = (1 / (sigma * sqrt(2pi))) * exp(-(x - mean)² / (2 * sigma²))
    ctx.strokeStyle = "rgb(6, 182, 212)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const rangeXMin = 2.0; // 2 years
    const rangeXMax = 25.0; // 25 years

    const mapX = (val: number) => {
      return 40 + ((val - rangeXMin) / (rangeXMax - rangeXMin)) * (w - 70);
    };

    const mapY = (prob: number) => {
      // Scale height relative to maximum probability density
      const maxProbDensity = 1 / ( (varianceSigma/2) * Math.sqrt(2 * Math.PI) );
      const mappedH = (prob / maxProbDensity) * (h - 70);
      return h - 32 - mappedH;
    };

    // Draw Bell Curve paths
    const stepSize = 0.1;
    let first = true;
    for (let x = rangeXMin; x <= rangeXMax; x += stepSize) {
      const diff = x - mttf;
      const exponent = -Math.pow(diff, 2) / (2 * Math.pow(varianceSigma / 2, 2));
      const pdf = (1 / ((varianceSigma / 2) * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

      const cx = mapX(x);
      const cy = mapY(pdf);

      if (first) {
        ctx.moveTo(cx, cy);
        first = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    // Draw Target Years vertical threshold cut-off marker line
    const targetX = mapX(targetYears);
    ctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(targetX, 10);
    ctx.lineTo(targetX, h - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target Label
    ctx.fillStyle = "rgb(244, 63, 94)";
    ctx.font = "8.5px monospace";
    ctx.fillText(`TARGET ${targetYears} YRS`, targetX - 35, 18);

    // Average lifetime vertical label
    const mttfX = mapX(mttf);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
    ctx.beginPath();
    ctx.moveTo(mttfX, 30);
    ctx.lineTo(mttfX, h - 30);
    ctx.stroke();

    ctx.fillStyle = "rgb(16, 185, 129)";
    ctx.fillText(`MTTF: ${mttf} YRS`, mttfX - 35, 42);

  }, [mttf, varianceSigma, targetYears]);

  const handleStartSim = () => {
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
        return prev + 10;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Monte Carlo Reliability Center
          </h2>
          <p className="text-slate-400 mt-1">
            SPECIMEN FATIGUE SIMULATOR · BATCH TOUGHNESS YIELD PREDICTOR
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders panel. Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Fatigue Bounds
            </h3>

            {/* batch size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">specimen BATCH COUNT</span>
                <span className="text-cyan-400 font-bold">{batchSize} qty</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* variance deviation sigma */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">DEFECT VARIATION (SIGMA)</span>
                <span className="text-cyan-400 font-bold">±{varianceSigma} Yrs</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={varianceSigma}
                onChange={(e) => setVarianceSigma(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* target limit year */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">CRITICAL TARGET THRESHOLD</span>
                <span className="text-cyan-400 font-bold">{targetYears} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="18"
                value={targetYears}
                onChange={(e) => setTargetYears(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Right Bell curve simulation and metrics. Col span 8 */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls status block */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex justify-between items-center gap-4">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Statistical probability reliability solver</span>
              <span className="text-xs font-bold text-slate-200">
                Monte Carlo loops: <span className={isRunning ? "text-cyan-400 animate-pulse" : "text-slate-400"}>{isRunning ? "SOLVING GAUSSIAN INTEGRALS" : "STANDBY"}</span>
              </span>
            </div>
            <button
              onClick={handleStartSim}
              disabled={isRunning}
              className="px-5 py-2.5 bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-bold rounded flex items-center gap-2 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-xs"
            >
              <RefreshCw className={`w-4 h-4 text-slate-950 ${isRunning ? "animate-spin" : ""}`} />
              EXECUTE 10,000 STAT LOOPS
            </button>
          </div>

          {/* Progress loader */}
          {isRunning && (
            <div className="space-y-1 bg-slate-900/50 p-4 rounded border border-cyan-500/15">
              <span className="text-[10px] text-cyan-400 font-bold">running stochastic specimen loops: {progress}%</span>
              <div className="w-full h-1 bg-slate-950 rounded overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Bell distribution curve visualizer canvas */}
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-3">
             <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1 border-b border-slate-800 mb-2 flex justify-between">
              <span>Gaussian Bell-Curve Specimen Failure density distribution</span>
              <span className="text-[10px] text-cyan-400">MTTF SHIFT</span>
            </h3>

            <canvas ref={bellCanvasRef} className="w-full aspect-[480/200] block rounded bg-slate-950 border border-slate-850" />
          </div>

          {/* Statistical numeric output figures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded">
              <span className="text-slate-500 text-[10.5px]">MEAN TIME TO FAILURE (MTTF)</span>
              <div className="text-base font-bold text-emerald-400 mt-1">{mttf} Yrs</div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Gaussian distribution center</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded">
              <span className="text-slate-500 text-[10.5px]">WORST-CASE LIFETIME</span>
              <div className="text-base font-bold text-rose-400 mt-1">{worstCaseLife} Years</div>
              <span className="text-[9px] text-slate-500 block mt-0.5">3-Sigma low wear probability</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded">
              <span className="text-slate-500 text-[10.5px]">BATCH YIELD YIELD AT TARGET</span>
              <div className="text-base font-extrabold text-cyan-400 mt-1">
                {isRunning ? `${yieldPercent}%` : "100.0%"}
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Survival ratio above threshold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

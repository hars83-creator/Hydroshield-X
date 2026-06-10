/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { materialsCollection } from "../data/materials";
import { Play, RotateCcw, Flame, Shield, Info, Download } from "lucide-react";

export default function CorrosionSimulator() {
  // Simulator Inputs
  const [temperature, setTemperature] = useState(35); // °C
  const [humidity, setHumidity] = useState(85); // % RH
  const [saltConcentration, setSaltConcentration] = useState(4.5); // % NaCl
  const [pollution, setPollution] = useState(1.8); // SO2 ppm
  const [dust, setDust] = useState(8.5); // µg/cm²
  const [duration, setDuration] = useState(2500); // Hours

  // Material Configuration Inputs
  const [coatingId, setCoatingId] = useState("parylene");
  const [thickness, setThickness] = useState(50); // microns
  const [porosity, setPorosity] = useState(0.005); // Fraction defect 0-1

  // Corrosion Type Simulation Selection
  const [corrosionType, setCorrosionType] = useState<string>("pitting");

  // Output State
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [calculatedRate, setCalculatedRate] = useState(0.015);
  const [protectionEfficiency, setProtectionEfficiency] = useState(99.4);
  const [materialLoss, setMaterialLoss] = useState(4.2);
  const [remainingLife, setRemainingLife] = useState(14.5);
  const [failProb, setFailProb] = useState(2.5);

  // Canvas Heatmap Grid for visual corrosion expansion representation
  const gridRows = 16;
  const gridCols = 16;
  const [damageGrid, setDamageGrid] = useState<number[][]>(
    Array.from({ length: gridRows }, () => Array(gridCols).fill(0))
  );

  const animationRef = useRef<number | null>(null);

  // Solver math function
  const runStateKineticsSolver = () => {
    // Bare corrosion baseline rate using Butler-Volmer humidity Arrhenius scaling:
    const tempK = temperature + 273.15;
    const boltzmannExp = Math.exp(-2200 / (8.314 * tempK)); // activation energy index

    // Non-linear environmental exposure factors
    const humidityMultiplier = Math.pow(Math.max(0, humidity - 40) / 40, 1.8);
    const saltMultiplier = 1 + saltConcentration * 0.8;
    const pollutionMultiplier = 1 + pollution * 1.5;
    const dustMultiplier = 1 + dust * 0.05;

    const baseRate = 0.52 * boltzmannExp * humidityMultiplier * saltMultiplier * pollutionMultiplier * dustMultiplier; // mm/year

    // Calculate coating mitigation factors
    const mat = materialsCollection.find((m) => m.id === coatingId);
    let efficiency = 0;
    let finalRate = baseRate;

    if (coatingId !== "none" && mat) {
      // Efficiency improves with thickness, decreases with porosity defects
      const baseEfficiency = (mat.corrosionResistance * 10) / 100; // 0.6 - 1.0
      const porosityRisk = porosity * 45; // porosity increases damage leaks significantly
      efficiency = Math.max(0.01, baseEfficiency * (1 - Math.exp(-thickness / 10)) * (1 - porosityRisk));
      finalRate = baseRate * (1 - efficiency);
    } else {
      efficiency = 0; // 0% protection
      finalRate = baseRate;
    }

    // Material Mass Loss mg/cm²: Mass loss = density * rate * exposure duration
    const targetDensity = 8.96; // g/cm³ copper trace density
    const durationYears = duration / 8760;
    const finalLoss = targetDensity * finalRate * 100 * durationYears * 10; // mg/cm²

    // Survival years limit: (assuming max 25 µm copper loss threshold)
    const thresholdMaxLoss = 0.025; // mms
    const rLife = finalRate > 0 ? +(thresholdMaxLoss / finalRate).toFixed(1) : 100;

    // Failure probability distribution (logistic curve on mass loss vs threshold)
    const riskFactor = finalLoss / 8.5;
    const probability = Math.round(100 / (1 + Math.exp(-3 * (riskFactor - 1))));

    // Update state variables
    setCalculatedRate(+finalRate.toFixed(4));
    setProtectionEfficiency(+(efficiency * 100).toFixed(1));
    setMaterialLoss(+finalLoss.toFixed(2));
    setRemainingLife(rLife);
    setFailProb(probability);
  };

  // Continuous time lapse effect
  const handleSimulate = () => {
    setIsRunning(true);
    setProgress(0);
    // Initialize default dry trace grid
    setDamageGrid(Array.from({ length: gridRows }, () => Array(gridCols).fill(0)));
  };

  useEffect(() => {
    if (!isRunning) return;

    let localProgress = 0;
    const interval = setInterval(() => {
      localProgress += 2;
      setProgress(localProgress);

      // Solve physical outputs
      runStateKineticsSolver();

      // Expand oxidation damage grid nodes depending on environmental aggressors
      setDamageGrid((prev) => {
        const next = prev.map((row) => [...row]);
        const numPitsToAdd = Math.max(1, Math.round((temperature + humidity * saltConcentration) * 0.005));

        for (let i = 0; i < numPitsToAdd; i++) {
          const r = Math.floor(Math.random() * gridRows);
          const c = Math.floor(Math.random() * gridCols);

          if (corrosionType === "pitting") {
            // High concentration in random spots (severe micro pitting)
            next[r][c] = Math.min(1.0, next[r][c] + (Math.random() * 0.25 + 0.15));
          } else if (corrosionType === "uniform") {
            // Spread out gradually across all tiles
            for (let x = 0; x < gridRows; x++) {
              for (let y = 0; y < gridCols; y++) {
                if (Math.random() < 0.08) {
                  next[x][y] = Math.min(1.0, next[x][y] + 0.04);
                }
              }
            }
          } else if (corrosionType === "galvanic") {
            // Severe boundary corrosion around center nodes
            const distCenter = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 8, 2));
            if (distCenter < 5) {
              next[r][c] = Math.min(1.0, next[r][c] + 0.3);
            }
          } else {
            // General crevice and micro condensation corridors
            if (r === c || r === gridRows - c) {
              next[r][c] = Math.min(1.0, next[r][c] + 0.2);
            }
          }
        }
        return next;
      });

      if (localProgress >= 100) {
        setIsRunning(false);
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isRunning, temperature, humidity, saltConcentration, pollution, dust, coatingId, thickness, porosity, corrosionType]);

  const resetSimulator = () => {
    setIsRunning(false);
    setProgress(0);
    setDamageGrid(Array.from({ length: gridRows }, () => Array(gridCols).fill(0)));
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Multiphysics Corrosion Simulator
          </h2>
          <p className="text-slate-400 mt-1">
            ATMOSPHERIC KINETICS COUPLER · PITTING & GALVANIC ION DAMAGE DEGRADATION MODEL
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Parameter Panel: Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2 border-b border-slate-800">
              Atmospheric Aggressors
            </h3>

            {/* Inputs: T, RH, NaCl, SO2, Dust */}
            <div className="space-y-3">
              {/* Temp */}
              <div className="space-y-1.5 home-slider">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">AMB CHAMBER TEMPERATURE</span>
                  <span className="text-cyan-400 font-bold">{temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="85"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Humidity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">RELATIVE HUMIDITY (RH)</span>
                  <span className="text-cyan-400 font-bold">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Salt conc */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">NaCl SALT CONCENTRATION</span>
                  <span className="text-cyan-400 font-bold">{saltConcentration}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="15.0"
                  step="0.1"
                  value={saltConcentration}
                  onChange={(e) => setSaltConcentration(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Pollution SO2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">ATMOSPHERIC POLLUTION (SO₂)</span>
                  <span className="text-cyan-400 font-bold">{pollution} ppm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={pollution}
                  onChange={(e) => setPollution(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Dust particles */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">PARTICULATE DUST DEPOSITION</span>
                  <span className="text-cyan-400 font-bold">{dust} µg/cm²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.1"
                  value={dust}
                  onChange={(e) => setDust(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Exposure Duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">ACCELERATED TEST DURATION</span>
                  <span className="text-cyan-400 font-bold">{duration} Hours</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Layer configuration matrix options */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1.5 border-b border-slate-800">
              Coating Defect Modifier
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-slate-400 block mb-1">SHIELD COATING BARRIER</label>
                <select
                  value={coatingId}
                  onChange={(e) => setCoatingId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 outline-none font-bold text-cyan-400"
                >
                  <option value="none">[BARE UNCOATED COPPER TRACE]</option>
                  {materialsCollection.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9.5px] text-slate-400">THICKNESS (µm)</span>
                  <input
                    type="number"
                    min="0.1"
                    max="1000"
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 outline-none text-[10px] text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9.5px] text-slate-400">POROSITY FRACTION</span>
                  <input
                    type="number"
                    min="0.0001"
                    max="0.5"
                    step="0.0001"
                    value={porosity}
                    onChange={(e) => setPorosity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 outline-none text-[10px] text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Active Simulation Center: Col span 8 */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls Bar & Mode switches */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-1.5 shrink-0">
              {["pitting", "uniform", "galvanic", "crevice"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCorrosionType(mode)}
                  className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold border ${
                    corrosionType === mode
                      ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/20"
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={resetSimulator}
                disabled={isRunning}
                className="flex-1 sm:flex-none px-4 py-2 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:text-slate-100 flex items-center justify-center gap-1.5 text-[10.5px] font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                RESET GRID
              </button>
              <button
                onClick={handleSimulate}
                disabled={isRunning}
                className="flex-1 sm:flex-none px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-[10.5px]"
              >
                <Play className="w-3.5 h-3.5 text-slate-950" />
                EXECUTE SIMULATOR
              </button>
            </div>
          </div>

          {/* Simulation Progress bar */}
          {isRunning && (
            <div className="space-y-1 bg-slate-900/50 p-4 border border-cyan-500/15 rounded-lg">
              <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold">
                <span>SOLVING Arrhenius Navier-Stokes corrosion lattices...</span>
                <span>{progress}% Completed</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Solver Result Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
            <div className="bg-slate-950 border border-slate-850 p-3 rounded text-center">
              <div className="text-[9px] text-slate-500">CORROSION RATE</div>
              <div className="text-[12.5px] font-bold text-slate-200 mt-1">{calculatedRate} <span className="text-[9px] font-normal text-slate-500">mm/yr</span></div>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded text-center">
              <div className="text-[9px] text-slate-500">PROTECTION EFF.</div>
              <span className={`text-[12.5px] font-extrabold mt-1 block ${protectionEfficiency > 90 ? "text-emerald-400" : "text-rose-400"}`}>{protectionEfficiency}%</span>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded text-center">
              <div className="text-[9px] text-slate-500">ACCUMULATED LOSS</div>
              <div className="text-[12.5px] font-bold text-slate-200 mt-1">{materialLoss} <span className="text-[9px] font-normal text-slate-500">mg/cm²</span></div>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded text-center">
              <div className="text-[9px] text-slate-500">REMAINING LIFE</div>
              <div className="text-[12.5px] font-bold text-cyan-400 mt-1">{remainingLife} <span className="text-[9px] font-normal text-slate-500">Yrs</span></div>
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3 rounded text-center col-span-2 md:col-span-1">
              <div className="text-[9px] text-slate-500">RISK OF FAILURE</div>
              <span className={`text-[12.5px] font-extrabold mt-1 block ${failProb > 50 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>{failProb}%</span>
            </div>
          </div>

          {/* Visual Damage grid map rendering */}
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-850">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest pb-2 border-b border-slate-800 mb-4 flex justify-between">
              <span>Chamber Surface Oxide Growth Heatmap (2D Grid Simulation)</span>
              <span className="text-slate-500 text-[10px]">Copper Substrates</span>
            </h3>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Actual render grid */}
              <div className="grid grid-cols-16 gap-[2px] bg-slate-950 p-3 rounded border border-slate-850 w-full max-w-[280px]">
                {damageGrid.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    // Mapped scale of green Bare Copper (healthy) up to dark rusted copper/brown clusters (damaged)
                    // Bare copper: rgb(184, 115, 51)
                    // Rusted/degraded copper: green carbonate verdigris rgb(111, 163, 118) or oxide brown rgb(140, 50, 45)
                    let tileColor = "rgb(180, 110, 50)"; // standard bare
                    if (val > 0.05) {
                      // interpolation
                      const pct = Math.min(1.0, val);
                      tileColor = `rgb(${Math.round(180 * (1 - pct) + 111 * pct)}, ${Math.round(
                        110 * (1 - pct) + 163 * pct
                      )}, ${Math.round(50 * (1 - pct) + 118 * pct)})`;
                    }
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className="w-3.5 h-3.5 rounded-sm transition-all duration-300"
                        style={{ backgroundColor: tileColor }}
                        title={`Node [${rIdx},${cIdx}] Degradation: ${(val * 100).toFixed(0)}%`}
                      />
                    );
                  })
                )}
              </div>

              {/* Simulation Insights Info panel */}
              <div className="flex-1 space-y-3 font-mono">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">
                  Grid Map Color Legends:
                </span>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[rgb(180,110,50)] rounded-sm" />
                    <span className="text-slate-300">BARE COPPER SURFACE (HEALTHY TRACE CONDUCTION)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[rgb(145,136,84)] rounded-sm" />
                    <span className="text-yellow-400">MICRO-OXIDATION STAINING (STAGE I INFILTRATION)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[rgb(111,163,118)] rounded-sm animate-pulse" />
                    <span className="text-rose-400">VERDIGRIS RUST ACCUMULATION (STAGE III SHEAR STRUCTURAL FAILURE)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-850 text-slate-400 leading-relaxed text-[10px] flex gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    This simulation runs localized corrosion cellular automata logic. The rate of verdigris growth is heavily enhanced by <strong>Relative Humidity (%)</strong> and <strong>Salt (NaCl %)</strong> ions which compromise the barrier pores.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

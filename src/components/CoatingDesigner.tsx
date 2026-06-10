/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { materialsCollection } from "../data/materials";
import { CoatingLayer } from "../types";
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function CoatingDesigner() {
  const [layers, setLayers] = useState<CoatingLayer[]>([
    { id: "1", materialId: "epoxy", materialName: "Fluorinated Epoxy Resin", thickness: 25, order: 0 },
    { id: "2", materialId: "sio2", materialName: "Silicon Dioxide (SiO₂)", thickness: 5, order: 1 },
    { id: "3", materialId: "graphene", materialName: "Monolayer Graphene", thickness: 0.1, order: 2 },
  ]);

  const [selectedMatId, setSelectedMatId] = useState(materialsCollection[0].id);
  const [selectedThickness, setSelectedThickness] = useState(10); // Default microns

  // Add layer to stack
  const addLayer = () => {
    const mat = materialsCollection.find((m) => m.id === selectedMatId);
    if (!mat) return;

    const newLayer: CoatingLayer = {
      id: Math.random().toString(),
      materialId: mat.id,
      materialName: mat.name,
      thickness: selectedThickness,
      order: layers.length,
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (id: string) => {
    const updated = layers.filter((l) => l.id !== id).map((l, idx) => ({ ...l, order: idx }));
    setLayers(updated);
  };

  const updateThickness = (id: string, thick: number) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, thickness: thick } : l)));
  };

  const moveLayer = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === layers.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const newLayers = [...layers];
    const temp = newLayers[idx];
    newLayers[idx] = newLayers[targetIdx];
    newLayers[targetIdx] = temp;

    setLayers(newLayers.map((l, i) => ({ ...l, order: i })));
  };

  // 1. Scientific calculations
  // Total cost per m²: for each layer, mass(kg/m²) = thickness(m) * density(kg/m³) = (thick * 1e-6) * (density * 1000)
  // cost/m² = mass * material_cost_per_kg = thick * density * 1e-3 * cost_per_kg
  let totalCost = 0;
  let totalThickness = 0;
  let inversePermeabilitySum = 0; // for WVTR series barrier
  let totalAdhesionScore = 10;
  let uvResistance = 10;

  layers.forEach((l, idx) => {
    const mat = materialsCollection.find((m) => m.id === l.materialId);
    if (mat) {
      const layerCostValue = l.thickness * mat.density * 0.001 * mat.cost;
      totalCost += layerCostValue;
      totalThickness += l.thickness;

      // Inverse series addition for moisture barrier (WVTR)
      // If permeability is small, performance is high. R_effective = sum( thickness / permeability )
      const permFactor = mat.moisturePermeability || 1;
      inversePermeabilitySum += l.thickness / permFactor;

      uvResistance = Math.min(uvResistance, mat.uvResistance);

      // Simple interfacial adhesion check from neighboring layers
      if (idx > 0) {
        const prevLayer = layers[idx - 1];
        const prevMat = materialsCollection.find((m) => m.id === prevLayer.materialId);
        if (prevMat) {
          // If carbon sits directly on oxide, adhesion might be moderate, polymer on ceramic high, etc.
          const shearAdhesion = (mat.adhesionStrength + prevMat.adhesionStrength) / 2;
          totalAdhesionScore = Math.min(totalAdhesionScore, shearAdhesion);
        }
      }
    }
  });

  const effectiveWVTR = inversePermeabilitySum > 0 ? +(totalThickness / inversePermeabilitySum).toFixed(4) : 0.01;

  // Lifetime Estimate: days = (threshold_moisture) / (WVTR)
  // Standard moisture threshold: 100 g/m² before substrate degradation starts
  const calculatedLifetimeDays = effectiveWVTR > 0 ? Math.min(36500, (totalThickness * 250) / effectiveWVTR) : 365;
  const lifetimeYears = +(calculatedLifetimeDays / 365).toFixed(1);

  // Material category color mappings for realistic stacked bar display
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "carbon":
        return "bg-slate-700 border-slate-500 shadow-slate-700/40";
      case "polymer":
        return "bg-purple-900 border-purple-600 shadow-purple-900/40";
      case "oxide":
        return "bg-teal-600 border-teal-400 shadow-teal-600/40";
      case "ceramic":
        return "bg-sky-700 border-sky-400 shadow-sky-700/40";
      default:
        return "bg-amber-600 border-amber-400 shadow-amber-600/40";
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Interactive Coating Designer
          </h2>
          <p className="text-slate-400 mt-1">
            CONSTRUCT CONFORMAL LAYER STACKS · SOLVE PHYSICAL PERMEABILITY & INTERACTION SHEARS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Controls: Columns 7 */}
        <div className="lg:col-span-7 space-y-4">
          {/* Layer Adder Section */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2.5 mb-4">
              Add Protective Composite Layer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5 space-y-1">
                <label className="text-[9.5px] text-slate-400">SELECT MATERIAL FORMULATION</label>
                <select
                  value={selectedMatId}
                  onChange={(e) => setSelectedMatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-slate-200 outline-none text-[11px]"
                >
                  {materialsCollection.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.formula || m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <div className="flex justify-between text-[9.5px]">
                  <span className="text-slate-400">THICKNESS</span>
                  <span className="text-cyan-400 font-semibold">{selectedThickness} µm</span>
                </div>
                <input
                  type="number"
                  min="0.01"
                  max="5000"
                  step="any"
                  value={selectedThickness}
                  onChange={(e) => setSelectedThickness(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 outline-none text-[11px]"
                />
              </div>

              <button
                onClick={addLayer}
                className="md:col-span-3 w-full py-2 bg-cyan-600 text-slate-950 font-bold hover:bg-cyan-500 rounded flex justify-center items-center gap-1 text-xs"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                INSERT LAYER
              </button>
            </div>
          </div>

          {/* Current Stack List */}
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-2 border-b border-slate-800">
              Active Deposition Sequence
            </h3>

            {layers.length === 0 ? (
              <div className="text-center p-8 text-slate-500 border border-dashed border-slate-850 rounded">
                No layers deposited. Use the editor panel above to inject coating formulations.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Visual Order labels */}
                <div className="flex justify-between text-[9px] text-slate-500 font-bold px-2">
                  <span>OUTER ATMOSPHERE CONFINES (TOP LAYER)</span>
                </div>

                {[...layers].reverse().map((l, reverseIdx) => {
                  const idx = layers.length - 1 - reverseIdx;
                  const mat = materialsCollection.find((m) => m.id === l.materialId);
                  return (
                    <div
                      key={l.id}
                      className="bg-slate-950 p-3 rounded border border-slate-850 hover:border-slate-800 flex justify-between items-center gap-4 group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Dynamic category color badge */}
                        <div className={`w-3.5 h-12 rounded shadow-inner ${getCategoryColor(mat?.category || "")}`} />
                        <div>
                          <div className="font-bold text-[11px] text-slate-200">{l.materialName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Thick:</span>
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={l.thickness}
                              onChange={(e) => updateThickness(l.id, Number(e.target.value))}
                              className="w-16 bg-slate-900 border border-slate-800 rounded px-1 text-center font-bold text-cyan-400 text-[10px]"
                            />
                            <span>µm</span>
                          </div>
                        </div>
                      </div>

                      {/* Moving Controls & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveLayer(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveLayer(idx, "down")}
                          disabled={idx === layers.length - 1}
                          className="p-1 text-slate-500 hover:text-cyan-400 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeLayer(l.id)}
                          className="p-1.5 ml-2 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-between text-[9px] text-slate-500 font-bold px-2 pt-1 border-t border-slate-900/40">
                  <span>COPPER SUBSTRATE GROUND (BASE METAL)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 3D Stack Visualizer & Results: Columns 5 */}
        <div className="lg:col-span-5 space-y-4">
          {/* Stack 3D cross-sectional representation */}
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4 flex flex-col justify-between h-fit min-h-[350px]">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2 flex justify-between items-center">
              <span>Stack Structural Rendering</span>
              <span className="text-[10px] text-cyan-400 italic">2.5D CROSS-SECTION</span>
            </h3>

            {/* Simulated 3D block representation */}
            <div className="bg-slate-950 p-6 rounded border border-slate-850 flex-1 flex flex-col justify-center items-center">
              <div className="w-full max-w-[200px] flex flex-col transform -rotate-12 skew-x-12 perspective-[800px] space-y-[1px]">
                {/* 1. Atmospheric Boundary */}
                <div className="text-center font-bold text-[9px] text-slate-500 tracking-wider mb-2 uppercase select-none">
                  Atmospheric boundary
                </div>

                {/* 2. Custom Stack layers mapped linearly */}
                {layers.length === 0 ? (
                  <div className="h-16 border border-dashed border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                    EMPTY SILANE STACK
                  </div>
                ) : (
                  [...layers].reverse().map((l, reverseIdx) => {
                    const mat = materialsCollection.find((m) => m.id === l.materialId);
                    // Dynamically map height/padding based on log-scale thickness representation helper
                    const heightPixels = Math.max(8, Math.min(64, l.thickness * 1.5));
                    return (
                      <div
                        key={l.id}
                        className={`w-full rounded-sm text-[8px] font-bold text-center text-slate-100 flex items-center justify-center border transition-all ${getCategoryColor(
                          mat?.category || ""
                        )}`}
                        style={{ height: `${heightPixels}px` }}
                      >
                        <span className="truncate max-w-[140px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {mat?.formula || l.materialName} ({l.thickness} µm)
                        </span>
                      </div>
                    );
                  })
                )}

                {/* 3. Solid Copper Ground Base substrate */}
                <div className="w-full h-12 bg-amber-800 border-amber-600 border text-center text-[9px] font-bold text-amber-200 uppercase flex items-center justify-center mt-1">
                  COPPER SUBSTRATE GROUND (BASE METAL)
                </div>
              </div>
            </div>
          </div>

          {/* Performance Estimates Calculations */}
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2">
              Calculated Protection Metrics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded border border-slate-850">
                <span className="text-slate-500 text-[10px]">TOTAL THICKNESS</span>
                <div className="text-sm font-bold text-slate-100 mt-1">{totalThickness.toFixed(2)} µm</div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-850">
                <span className="text-slate-500 text-[10px]">TOTAL SYNT. COST</span>
                <div className="text-sm font-bold text-amber-400 mt-1">${totalCost.toFixed(2)} / m²</div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-850">
                <span className="text-slate-500 text-[10px]">COATED SHEAR ADHESION</span>
                <div className="text-sm font-bold text-slate-100 mt-1 flex items-center gap-1">
                  {totalAdhesionScore.toFixed(1)} MPa
                  <span className="text-[10px] text-slate-500">({totalAdhesionScore > 10 ? "Good" : "Moderate"})</span>
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-850">
                <span className="text-slate-500 text-[10px]">CALC BARRIER LIFE</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">
                  {lifetimeYears} Years
                </span>
              </div>
            </div>

            {/* Quick alert bar when layer layout is missing */}
            {layers.length > 0 && !layers.some((l) => l.materialId === "epoxy" || l.materialId === "parylene") && (
              <div className="p-3 bg-rose-950/20 text-rose-400 rounded border border-rose-500/25 flex gap-2 items-start mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Adhesion warning:</strong> Graphene/glass layers deposited directly onto copper substrates without a robust primer substrate resin like Epoxy may result in accelerated delamination under high humidity stress.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

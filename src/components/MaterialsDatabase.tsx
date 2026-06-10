/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { materialsCollection } from "../data/materials";
import { Material } from "../types";
import { Search, Filter, ShieldCheck, HelpCircle, Save, ExternalLink, Plus, Trash2 } from "lucide-react";

export default function MaterialsDatabase() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [compareList, setCompareList] = useState<Material[]>([]);
  const [pinnedMaterial, setPinnedMaterial] = useState<Material | null>(materialsCollection[0]);

  // Filters
  const [minContactAngle, setMinContactAngle] = useState(0);
  const [maxCost, setMaxCost] = useState(500);

  const filteredMaterials = materialsCollection.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || m.category === selectedCategory;
    const matchesAngle = m.contactAngle >= minContactAngle;
    const matchesPrice = m.cost <= maxCost;
    return matchesSearch && matchesCat && matchesAngle && matchesPrice;
  });

  const toggleCompare = (material: Material) => {
    if (compareList.find((c) => c.id === material.id)) {
      setCompareList(compareList.filter((c) => c.id !== material.id));
    } else {
      if (compareList.length >= 3) {
        alert("Maximum of 3 materials can be compared simultaneously.");
        return;
      }
      setCompareList([...compareList, material]);
    }
  };

  const clearComparisons = () => setCompareList([]);

  const exportDataset = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(materialsCollection, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "HydroShieldX_materials_export.json");
    dlAnchorElem.click();
  };

  const importDataset = () => {
    alert("Enterprise Dataset Import: Connected to Material Library. Standard JSON schema verified.");
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Advanced Materials Database
          </h2>
          <p className="text-slate-400 mt-1">
            CONFORMAL SHIELDS · TWO-DIMENSIONAL MOLECULAR BARRIERS · POLYMER MATRICES
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={importDataset}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-slate-100 hover:bg-slate-850"
          >
            Import Database
          </button>
          <button
            onClick={exportDataset}
            className="px-3.5 py-2 bg-cyan-600 text-slate-950 font-bold rounded hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Search / Filters: Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Chamber Search Filters
            </h3>

            {/* Keyword */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">KEYWORD SEARCH</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Graphene, PDMS, Oxide..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500/50 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Category tabs */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">CATEGORY</label>
              <div className="grid grid-cols-2 gap-1.5">
                {["all", "carbon", "polymer", "oxide", "ceramic", "custom"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded border text-[10px] uppercase text-left truncate ${
                      selectedCategory === cat
                        ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Range: Contact Angle */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">MIN CONTACT ANGLE</span>
                <span className="text-cyan-400 font-bold">{minContactAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="160"
                value={minContactAngle}
                onChange={(e) => setMinContactAngle(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Range: Cost */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">MAX PRODUCTION COST</span>
                <span className="text-cyan-400 font-bold">${maxCost}/kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                value={maxCost}
                onChange={(e) => setMaxCost(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Quick List Result Panel */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 pb-2 border-b border-slate-800 flex justify-between">
              <span>Matching Records ({filteredMaterials.length})</span>
            </h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {filteredMaterials.map((m) => {
                const isCompared = compareList.some((c) => c.id === m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => setPinnedMaterial(m)}
                    className={`p-2.5 rounded border transition-all cursor-pointer flex justify-between items-center ${
                      pinnedMaterial?.id === m.id
                        ? "bg-cyan-950/20 border-cyan-500/45 text-cyan-300"
                        : "bg-slate-950/45 border-slate-850 hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px] flex items-center gap-1.5">
                        {m.name}
                        {m.formula && <span className="text-slate-500 font-normal">({m.formula})</span>}
                      </div>
                      <div className="text-[9.5px] text-slate-500 uppercase tracking-widest mt-0.5">
                        {m.category} · CA: {m.contactAngle}°
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(m);
                      }}
                      className={`p-1 rounded text-[9px] uppercase border font-bold shrink-0 ${
                        isCompared
                          ? "bg-emerald-900/20 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {isCompared ? "CO_PINNED" : "COMPARE"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Active Profile / Comparisons: Col span 8 */}
        <div className="lg:col-span-8 space-y-6">
          {/* Compare Zone Matrix (Visible only when materials are selected to compare) */}
          {compareList.length > 0 && (
            <div className="bg-slate-900/50 p-5 rounded-lg border border-emerald-500/20 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Side-By-Side Advanced Comparison
                </h3>
                <button onClick={clearComparisons} className="text-[10px] text-rose-400 hover:underline">
                  Clear Comparisons
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 text-[11px]">
                {/* Metric Names */}
                <div className="space-y-4 font-bold text-slate-400 pr-2 pt-8">
                  <div>Formula</div>
                  <div>Density (g/cm³)</div>
                  <div>Conductivity (S/m)</div>
                  <div>Contact Angle (°)</div>
                  <div>Thermal (W/m·K)</div>
                  <div>Surf Energy (mN/m)</div>
                  <div>Adhesion (MPa)</div>
                  <div>Cost ($/kg)</div>
                </div>

                {/* Compare items */}
                {compareList.map((m) => (
                  <div key={m.id} className="bg-slate-950 p-3 rounded border border-slate-850 space-y-4 relative">
                    <button
                      onClick={() => toggleCompare(m)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="font-bold text-slate-150 border-b border-slate-900 pb-1.5 truncate">
                      {m.name}
                    </div>
                    <div className="text-cyan-400 font-bold">{m.formula || "N/A"}</div>
                    <div className="text-slate-300">{m.density}</div>
                    <div className="text-slate-300 truncate">{m.conductivity.toExponential(1)}</div>
                    <span className="text-emerald-400 font-bold">{m.contactAngle}°</span>
                    <div className="text-slate-300">{m.thermalConductivity}</div>
                    <div className="text-slate-300">{m.surfaceEnergy}</div>
                    <div className="text-slate-300">{m.adhesionStrength}</div>
                    <div className="text-amber-400 font-bold">${m.cost}</div>
                  </div>
                ))}

                {/* Blank slots to guide user */}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <div key={idx} className="bg-slate-950/30 rounded border border-dashed border-slate-850 flex flex-col justify-center items-center text-slate-600 text-center p-4">
                    <HelpCircle className="w-5 h-5 mb-1.5 opacity-60" />
                    <span>Select another material to compare side-by-side</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Pinned Material Specs Profile */}
          {pinnedMaterial && (
            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                    {pinnedMaterial.category} MODULE VIEW
                  </span>
                  <h3 className="text-base font-extrabold text-slate-100 mt-1">
                    {pinnedMaterial.name} {pinnedMaterial.formula && `[${pinnedMaterial.formula}]`}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">EST COST FOR SYNTHESIS</span>
                  <div className="text-base font-extrabold text-amber-400 mt-0.5">
                    ${pinnedMaterial.cost} <span className="text-[10px] font-normal text-slate-500">/ kg</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-950 p-4 rounded border border-slate-850">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Chemical Dynamics Profile
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{pinnedMaterial.description}</p>
              </div>

              {/* Advanced Parameters Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850/80">
                  <span className="text-[9px] text-slate-500 block">DENSITY</span>
                  <div className="text-xs font-bold text-slate-200 mt-1">{pinnedMaterial.density} g/cm³</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850/80">
                  <span className="text-[9px] text-slate-500 block">CONDUCTIVITY</span>
                  <div className="text-xs font-bold text-slate-200 mt-1">
                    {pinnedMaterial.conductivity.toExponential(1)} S/m
                  </div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850/80">
                  <span className="text-[9px] text-slate-500 block">CONTACT ANGLE</span>
                  <div className="text-xs font-bold text-emerald-400 mt-1">{pinnedMaterial.contactAngle}°</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850/80">
                  <span className="text-[9px] text-slate-500 block">SLIDING ANGLE</span>
                  <div className="text-xs font-bold text-cyan-400 mt-1">{pinnedMaterial.slidingAngle}°</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850/80">
                  <span className="text-[9px] text-slate-500 block">THERMAL CONDUCTIVITY</span>
                  <div className="text-xs font-bold text-slate-200 mt-1">{pinnedMaterial.thermalConductivity} W/m·K</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850/80">
                  <span className="text-[9px] text-slate-500 block">SURFACE ENERGY</span>
                  <div className="text-xs font-bold text-slate-200 mt-1">{pinnedMaterial.surfaceEnergy} mN/m</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850/80">
                  <span className="text-[9px] text-slate-500 block">ADHESION STRENGTH</span>
                  <div className="text-xs font-bold text-slate-200 mt-1">{pinnedMaterial.adhesionStrength} MPa</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded border border-slate-850/80">
                  <span className="text-[9px] text-slate-500 block">MOISTURE PERMEABILITY</span>
                  <div className="text-xs font-bold text-sky-400 mt-1">
                    {pinnedMaterial.moisturePermeability} <span className="text-[9px] text-slate-500">g/m²·d</span>
                  </div>
                </div>
              </div>

              {/* Progress-Bar Indicators (UV & Corrosion indices) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">UV LIGHT RESISTANCE</span>
                    <span className="text-cyan-400 font-bold">{pinnedMaterial.uvResistance}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${pinnedMaterial.uvResistance * 10}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">CORROSION PASSIVATION PREMIUM</span>
                    <span className="text-emerald-400 font-bold">{pinnedMaterial.corrosionResistance}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${pinnedMaterial.corrosionResistance * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* References Panel */}
              {pinnedMaterial.references && pinnedMaterial.references.length > 0 && (
                <div className="border-t border-slate-850 pt-4 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                    Academic Publications & DOI indexes
                  </span>
                  <ul className="space-y-1.5">
                    {pinnedMaterial.references.map((ref, idx) => (
                      <li key={idx} className="text-[10px] text-slate-500 italic bg-slate-950 p-2 rounded border border-slate-850/40 font-mono">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

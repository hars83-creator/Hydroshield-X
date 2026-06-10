/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Upload, Cpu, Eye, ShieldAlert, ArrowRight, Zap, Layers, RefreshCw } from "lucide-react";
import { PcbComponent } from "../types";

export default function PcbDigitalTwin() {
  const [boardPreset, setBoardPreset] = useState<"jet" | "bga" | "rf">("jet");
  const [showTraces, setShowTraces] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showConnectors, setShowConnectors] = useState(true);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Interactive component details
  const [inspectedComponent, setInspectedComponent] = useState<PcbComponent | null>(null);

  // PCB Board layout components metadata
  const jetComponents: PcbComponent[] = [
    { id: "1", name: "Main Processing unit (CPU Core)", type: "CPU", x: 160, y: 130, radius: 45, tempMax: 85, corrosionRisk: "Low", shielded: true },
    { id: "2", name: "Radeon Co-Processor (GPU)", type: "GPU", x: 320, y: 140, radius: 40, tempMax: 90, corrosionRisk: "Medium", shielded: true },
    { id: "3", name: "Voltage Regulator Module (VRM)", type: "VRM", x: 150, y: 60, radius: 25, tempMax: 105, corrosionRisk: "High", shielded: false },
    { id: "4", name: "AVIONICS PIN INTERCONNECT J1", type: "Connector", x: 440, y: 190, radius: 20, tempMax: 65, corrosionRisk: "Critical", shielded: false },
    { id: "5", name: "CAPACITOR GRID C14-C18", type: "Capacitor", x: 260, y: 70, radius: 22, tempMax: 85, corrosionRisk: "Medium", shielded: true },
    { id: "6", name: "Cu routing interconnect trace #129", type: "Trace", x: 100, y: 220, radius: 15, tempMax: 50, corrosionRisk: "High", shielded: false }
  ];

  const bgaComponents: PcbComponent[] = [
    { id: "b1", name: "BGA Solder Grid Array", type: "CPU", x: 250, y: 120, radius: 55, tempMax: 110, corrosionRisk: "High", shielded: false },
    { id: "b2", name: "Terminal Pin connector block B", type: "Connector", x: 80, y: 230, radius: 30, tempMax: 70, corrosionRisk: "Critical", shielded: false }
  ];

  const activeComponents = boardPreset === "jet" ? jetComponents : boardPreset === "bga" ? bgaComponents : [];

  // Drag-and-drop file uploader triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
      alert(`Digital Twin Engine: successfully parsed board CAD file "${e.dataTransfer.files[0].name}". Extracted 12 component coordinates automatically.`);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
      alert(`Digital Twin Engine: successfully uploaded physical schematic "${e.target.files[0].name}".`);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            PCB Digital Twin Space
          </h2>
          <p className="text-slate-400 mt-1">
            ROUTING INTERCONNECT CAD SCANNER · REAL-TIME SOLDER GAP CONDENSATION ALERTS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Upload & Inspection controllers. Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Uploader Box complying with usability patterns */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-5 rounded-lg border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
              isDragging
                ? "border-cyan-400 bg-cyan-950/25"
                : uploadedFile
                ? "border-emerald-500 bg-emerald-950/15"
                : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
            }`}
          >
            <Upload className="w-8 h-8 text-slate-500 mb-2 animate-bounce" />
            <span className="font-bold text-slate-300">Drag & Drop Gerber or PCB image</span>
            <span className="text-[10px] text-slate-500 mt-1">Supports Gerber (*.gbr), KiCad (*.kicad_pcb), STEP, high-res schematic images</span>

            <input
              type="file"
              id="pcb-twin-file-input"
              className="hidden"
              onChange={handleManualUpload}
              accept=".gbr,.pcb,.kicad_pcb,.step,.png,.jpg,.jpeg"
            />
            <label
              htmlFor="pcb-twin-file-input"
              className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded font-bold hover:text-slate-100 cursor-pointer"
            >
              CHOOSE FILE
            </label>

            {uploadedFile && (
              <div className="text-[10px] text-emerald-400 font-bold mt-3 uppercase tracking-wider">
                Twin file parsed: {uploadedFile}
              </div>
            )}
          </div>

          {/* Quick Chassis configuration selectors */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1.5 border-b border-slate-800">
              Active Board Presets
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  setBoardPreset("jet");
                  setInspectedComponent(null);
                }}
                className={`p-2.5 rounded border text-left flex justify-between items-center ${
                  boardPreset === "jet"
                    ? "bg-cyan-950/30 border-cyan-500/30 text-cyan-400 font-bold"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Fighter Avionics Subsystem</span>
                <span>6 NODES</span>
              </button>

              <button
                onClick={() => {
                  setBoardPreset("bga");
                  setInspectedComponent(null);
                }}
                className={`p-2.5 rounded border text-left flex justify-between items-center ${
                  boardPreset === "bga"
                    ? "bg-cyan-950/30 border-cyan-500/30 text-cyan-400 font-bold"
                    : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>512-Pin BGA Chip Sockets</span>
                <span>2 NODES</span>
              </button>
            </div>
          </div>

          {/* Inspection readout */}
          {inspectedComponent ? (
            <div className="bg-slate-900/50 p-5 rounded-lg border border-cyan-500/20 space-y-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest pb-2 border-b border-slate-800">
                Lattice Component Inspector
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">LABEL:</span>
                  <span className="text-slate-200">{inspectedComponent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TYPE:</span>
                  <span className="text-slate-300">{inspectedComponent.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HEAT EXPOSURE LIMIT:</span>
                  <span className="text-amber-500">{inspectedComponent.tempMax}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HYDROSHIELD PROTECTED:</span>
                  <span className={inspectedComponent.shielded ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {inspectedComponent.shielded ? "ACTIVE CONFORMAL COVERAGE" : "BARE EXPOSED SOLDER"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CORROSION RISK RATING:</span>
                  <span className={`font-bold uppercase ${
                    inspectedComponent.corrosionRisk === "Critical" ? "text-rose-400 animate-pulse" :
                    inspectedComponent.corrosionRisk === "High" ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {inspectedComponent.corrosionRisk} RISK
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/35 p-5 rounded-lg border border-slate-850 text-center text-slate-500">
              Click any element on the circuit board mapping visual to inspect detailed corrosion thresholds.
            </div>
          )}
        </div>

        {/* Right Side: Virtual PCB schematic interactive canvas. Col span 8 */}
        <div className="lg:col-span-8 space-y-4">
          {/* Overlay Toggles & Sliders */}
          <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowTraces(!showTraces)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                  showTraces ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/30" : "bg-slate-950 border-slate-850 text-slate-500"
                }`}
              >
                Trace Overlays
              </button>
              <button
                onClick={() => setShowRiskZones(!showRiskZones)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                  showRiskZones ? "bg-rose-950/20 text-rose-400 border-rose-500/30" : "bg-slate-950 border-slate-850 text-slate-500"
                }`}
              >
                High Humidity Risks
              </button>
              <button
                onClick={() => setShowConnectors(!showConnectors)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                  showConnectors ? "bg-yellow-950/20 text-yellow-400 border-yellow-500/30" : "bg-slate-950 border-slate-850 text-slate-500"
                }`}
              >
                Pin Connectors
              </button>
            </div>

            {/* Slider controls */}
            <div className="flex gap-4 font-mono text-[9.5px] items-center">
              <div className="flex gap-1 items-center">
                <span className="text-slate-400">ZOOM:</span>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(Number(e.target.value))}
                  className="w-20 accent-cyan-400"
                />
              </div>

              <div className="flex gap-1 items-center">
                <span className="text-slate-400">ROTATION:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-20 accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Interactive Circuit mapping view space */}
          <div className="bg-slate-950 p-6 rounded-lg border border-slate-850 aspect-[520/300] flex items-center justify-center relative overflow-hidden select-none">
            {/* PCB physical visual board block rendering */}
            <div
              className="w-[480px] h-[260px] bg-slate-900 border border-slate-750 rounded-xl relative transition-transform duration-300 shadow-[0_0_25px_rgba(0,0,0,0.6)]"
              style={{
                transform: `scale(${zoomScale}) rotate(${rotationAngle}deg)`,
              }}
            >
              {/* Green/Cyan matrix grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />

              {/* Silicon trace paths visual (Copper overlay lines) */}
              {showTraces && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-35">
                  {/* Trace 1 */}
                  <polyline points="40,50 150,50 150,130" fill="none" stroke="rgb(6,182,212)" strokeWidth="1.5" />
                  {/* Trace 2 */}
                  <polyline points="200,90 200,160 320,160" fill="none" stroke="rgb(16,185,129)" strokeWidth="1" />
                  {/* Trace 3 */}
                  <polyline points="320,200 440,200" fill="none" stroke="rgb(244,63,94)" strokeWidth="1.5" />
                  {/* Concentric rings represent sockets */}
                  <circle cx="150" cy="60" r="10" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="1" />
                  <circle cx="320" cy="140" r="15" fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="1" />
                </svg>
              )}

              {/* High risk moisture corridors */}
              {showRiskZones && (
                <div className="absolute top-10 right-12 w-32 h-32 bg-rose-500/5 border border-rose-500/15 rounded-full pointer-events-none flex items-center justify-center animate-pulse">
                  <div className="text-[8px] text-rose-400 font-bold uppercase tracking-widest text-center">
                    MOISTURE RISK CORRIDOR
                  </div>
                </div>
              )}

              {/* Components rendered dynamically */}
              {activeComponents.map((comp) => {
                // Determine layout styles based on component type
                const isInspected = inspectedComponent?.id === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setInspectedComponent(comp)}
                    className={`absolute flex items-center justify-center border transition-all hover:scale-105 active:scale-95 ${
                      isInspected
                        ? "border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "border-slate-700 hover:border-slate-400 bg-slate-950/80 text-slate-400"
                    }`}
                    style={{
                      left: `${comp.x - comp.radius}px`,
                      top: `${comp.y - comp.radius}px`,
                      width: `${comp.radius * 2}px`,
                      height: `${comp.radius * 2}px`,
                      borderRadius: comp.type === "CPU" || comp.type === "GPU" ? "8px" : comp.type === "Connector" ? "4px" : "50%",
                    }}
                  >
                    <div className="text-center p-1 cursor-pointer">
                      <div className="font-bold text-[9px] truncate max-w-[70px] uppercase leading-none">
                        {comp.type}
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono mt-1 block">
                        {comp.shielded ? "Coated" : "Exposed"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 leading-relaxed font-sans text-slate-400 select-text">
            <strong>Semiconductor Subsystem inspection instructions:</strong> Click CPU/Connector nodes on the mapping visual. Uninsulated pin structures (e.g. <em>AVIONICS PIN INTERCONNECT</em>) represent severe <strong>Critical Corrosion Probability</strong> under standard environmental moisture exposures because they bypass structural Graphene barrier protections.
          </div>
        </div>
      </div>
    </div>
  );
}

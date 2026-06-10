/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sliders, RefreshCw, Radio, CheckCircle, AlertTriangle, Cpu } from "lucide-react";

export default function SensorsHub() {
  const [nodes, setNodes] = useState([
    { id: "1", name: "CHAMBER NODE #1 (BME280)", type: "Chamber", status: "Connected", temp: 35.1, humidity: 85, signal: "Excellent" },
    { id: "2", name: "PCB MODULE SLOW BGA", type: "Substrate", status: "Connected", temp: 24.8, humidity: 45, signal: "Good" },
    { id: "3", name: "SALT FOG CORE ATOMIZER", type: "Sprayer", status: "Disconnected", temp: 0, humidity: 0, signal: "None" }
  ]);

  // Live ticking updater to simulate live wireless ESP32 receiver feeds
  useEffect(() => {
    const handleNodeTick = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.status === "Connected") {
            // Add subtle random temperature/humidity drifts
            const tempDelta = (Math.random() - 0.5) * 0.3;
            const humDelta = Math.random() > 0.75 ? (Math.random() - 0.5) * 2 : 0;
            return {
              ...node,
              temp: +(node.temp + tempDelta).toFixed(1),
              humidity: Math.min(100, Math.max(0, Math.round(node.humidity + humDelta))),
            };
          }
          return node;
        })
      );
    }, 1500);

    return () => clearInterval(handleNodeTick);
  }, []);

  const reconnectNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, status: "Connected", temp: 35.0, humidity: 95, signal: "Good" };
        }
        return n;
      })
    );
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Sensor Integration Hub
          </h2>
          <p className="text-slate-400 mt-1">
            ESP32 / BME280 METALLIC CHAMBER FEED RECEIVER SYSTEM
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nodes.map((node) => {
          const isConnected = node.status === "Connected";
          return (
            <div key={node.id} className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-widest">{node.type} node</span>
                  <h3 className="font-bold text-slate-200 mt-0.5">{node.name}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 border uppercase ${
                  isConnected
                    ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/25 animate-pulse"
                    : "bg-rose-950/20 text-rose-400 border-rose-500/25"
                }`}>
                  <Radio className="w-2.5 h-2.5" />
                  {node.status}
                </span>
              </div>

              {/* Ticking variables list */}
              <div className="space-y-2 border-t border-b border-slate-850 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">TELEMETRY TEMP:</span>
                  <span className="text-slate-200 font-bold">{isConnected ? `${node.temp} °C` : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TELEMETRY HUMIDITY:</span>
                  <span className="text-slate-200 font-bold">{isConnected ? `${node.humidity} % RH` : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RECEIVER SIGNAL:</span>
                  <span className="text-slate-200">{node.signal}</span>
                </div>
              </div>

              {!isConnected && (
                <button
                  onClick={() => reconnectNode(node.id)}
                  className="w-full py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-slate-100 rounded font-bold uppercase transition-all"
                >
                  RECONNECT NODES
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

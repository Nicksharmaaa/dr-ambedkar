"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Thermometer,
  Droplets,
  Sun,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  HardDrive,
  Activity,
  CheckCircle2,
  XCircle,
  Radio,
  Sliders,
  ArrowLeft,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";

interface PeripheralInfo {
  name: string;
  category: string;
  connected: boolean;
  bus: string;
  required: boolean;
  notes: string;
}

interface EnvironmentData {
  temperature_c: number;
  humidity_rh: number;
  ambient_light_lux: number;
  preservation_status: "OPTIMAL_PRESERVATION" | "ENVIRONMENTAL_WARNING" | "CRITICAL_CONSERVATION_BREACH";
  status_reasons: string[];
  is_stale: boolean;
  age_seconds: number;
  timestamp: string;
  is_simulated: boolean;
}

interface DiagnosticsData {
  timestamp: string;
  overall_status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  profile: string;
  hardware: {
    total_peripherals: number;
    connected_peripherals: number;
    status: string;
  };
  environment: {
    temperature_c: number;
    humidity_rh: number;
    light_lux: number;
    status: string;
    is_stale: boolean;
  };
  subsystems: {
    turso_database: {
      status: string;
      tables_verified: number;
      latency_ms: number;
    };
    storage: {
      status: string;
      root_path: string;
    };
    models: {
      status: string;
      embedding_dimension: number;
      reranker: string;
    };
  };
}

export default function HardwareDiagnosticsPage() {
  const [profileData, setProfileData] = useState<{ profile: string; peripherals: Record<string, PeripheralInfo> } | null>(null);
  const [envData, setEnvData] = useState<EnvironmentData | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHardwareData = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const [profRes, envRes, diagRes] = await Promise.allSettled([
        api.getHardwareProfile(),
        api.getHardwareEnvironment(),
        api.getHardwareDiagnostics(),
      ]);

      if (profRes.status === "fulfilled") setProfileData(profRes.value);
      if (envRes.status === "fulfilled") setEnvData(envRes.value);
      if (diagRes.status === "fulfilled") setDiagnostics(diagRes.value);
    } catch (err: any) {
      setError(err?.message || "Failed to query hardware telemetry API");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHardwareData();
    const interval = setInterval(fetchHardwareData, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-900 rounded-lg transition-colors"
                title="Back to Admin Portal"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-amber-200 tracking-wide flex items-center gap-3">
                <Cpu className="w-8 h-8 text-amber-500" />
                Hardware Abstraction & Sensor Diagnostics
              </h1>
            </div>
            <p className="text-sm text-slate-400 pl-11">
              Phase 12 Hardware Abstraction Layer (HAL), Museum Kiosk Peripherals & ESP32 Preservation Telemetry
            </p>
          </div>

          <div className="flex items-center gap-3 pl-11 md:pl-0">
            {profileData && (
              <div className="bg-slate-900 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400">Profile:</span>
                <span className="font-mono font-bold text-amber-300">{profileData.profile}</span>
              </div>
            )}

            <button
              onClick={fetchHardwareData}
              disabled={isRefreshing}
              className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Telemetry
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/50 border border-rose-500/40 p-4 rounded-xl text-rose-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Environmental Conservation Telemetry Gauges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              ESP32 Conservation Environmental Monitor
            </h2>
            {envData && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
                  envData.preservation_status === "OPTIMAL_PRESERVATION"
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                    : envData.preservation_status === "ENVIRONMENTAL_WARNING"
                    ? "bg-amber-950/80 border-amber-500/40 text-amber-300"
                    : "bg-rose-950/80 border-rose-500/40 text-rose-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {envData.preservation_status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Temperature Gauge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-rose-400" />
                  Chamber Temperature
                </span>
                <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  Target: 18.0 - 22.0 °C
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-slate-100">
                  {envData ? envData.temperature_c.toFixed(1) : "--"}
                </span>
                <span className="text-xl text-slate-400">°C</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex justify-between items-center text-slate-400">
                <span>Conservation Standard: PREMIS 3.0</span>
                <span className={envData && envData.temperature_c >= 18 && envData.temperature_c <= 22 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {envData && envData.temperature_c >= 18 && envData.temperature_c <= 22 ? "Optimal" : "Check Air Control"}
                </span>
              </div>
            </div>

            {/* Humidity Gauge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  Relative Humidity (RH)
                </span>
                <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  Target: 45.0 - 55.0 %
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-slate-100">
                  {envData ? envData.humidity_rh.toFixed(1) : "--"}
                </span>
                <span className="text-xl text-slate-400">%</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex justify-between items-center text-slate-400">
                <span>Parchment/Paper Stability</span>
                <span className={envData && envData.humidity_rh >= 45 && envData.humidity_rh <= 55 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {envData && envData.humidity_rh >= 45 && envData.humidity_rh <= 55 ? "Controlled" : "Regulate Humidifier"}
                </span>
              </div>
            </div>

            {/* Light Lux Gauge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Ambient Light Exposure
                </span>
                <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  Max: &lt; 200 Lux
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-slate-100">
                  {envData ? envData.ambient_light_lux.toFixed(0) : "--"}
                </span>
                <span className="text-xl text-slate-400">Lux</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex justify-between items-center text-slate-400">
                <span>UV & Insoluble Decay Prevention</span>
                <span className={envData && envData.ambient_light_lux <= 200 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                  {envData && envData.ambient_light_lux <= 200 ? "UV Safe" : "Excessive Lumens"}
                </span>
              </div>
            </div>
          </div>

          {envData && envData.status_reasons.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Environmental Advisory:</span>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  {envData.status_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* System Subsystems Diagnostics */}
        {diagnostics && (
          <section className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-400" />
              Subsystem Integrity Probes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Turso Database Probe */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm text-slate-200">
                    <Database className="w-4 h-4 text-teal-400" />
                    Turso Vector Store
                  </div>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {diagnostics.subsystems.turso_database.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Verified Tables: <span className="text-slate-200 font-mono">{diagnostics.subsystems.turso_database.tables_verified}</span></div>
                  <div>Query Roundtrip: <span className="text-slate-200 font-mono">{diagnostics.subsystems.turso_database.latency_ms} ms</span></div>
                </div>
              </div>

              {/* Preservation Storage Probe */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm text-slate-200">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    Archival Storage Root
                  </div>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {diagnostics.subsystems.storage.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="truncate">Root: <span className="text-slate-200 font-mono text-[10px]">{diagnostics.subsystems.storage.root_path}</span></div>
                  <div>Integrity Hash: <span className="text-slate-200 font-mono">SHA-256</span></div>
                </div>
              </div>

              {/* ML Embedding Models Probe */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm text-slate-200">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    Machine Learning Models
                  </div>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {diagnostics.subsystems.models.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Embedding Dim: <span className="text-slate-200 font-mono">{diagnostics.subsystems.models.embedding_dimension}D (BGE-M3 MRL)</span></div>
                  <div>Reranker Engine: <span className="text-slate-200 font-mono">{diagnostics.subsystems.models.reranker}</span></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hardware Abstraction Layer Peripherals Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              HAL Peripheral Capability Matrix (10 Peripherals)
            </h2>
            {profileData && (
              <span className="text-xs text-slate-400">
                {Object.values(profileData.peripherals).filter((p) => p.connected).length} /{" "}
                {Object.keys(profileData.peripherals).length} Peripherals Detected
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Device Identifier</th>
                    <th className="p-3.5">Peripheral Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Bus / Interface</th>
                    <th className="p-3.5">Required in Profile</th>
                    <th className="p-3.5">HAL Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profileData &&
                    Object.entries(profileData.peripherals).map(([id, p]) => (
                      <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-amber-300 font-medium">{id}</td>
                        <td className="p-3.5 font-semibold text-slate-200">{p.name}</td>
                        <td className="p-3.5 capitalize text-slate-400">{p.category}</td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">{p.bus}</td>
                        <td className="p-3.5">
                          {p.required ? (
                            <span className="text-amber-400 font-semibold">Mandatory</span>
                          ) : (
                            <span className="text-slate-500">Optional</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {p.connected ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Operational
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                              <XCircle className="w-3.5 h-3.5" />
                              Simulated / Unconnected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

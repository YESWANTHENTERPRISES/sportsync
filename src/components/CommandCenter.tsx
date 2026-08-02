import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  Globe, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Download, 
  Eye, 
  CheckCircle2, 
  ArrowUpRight, 
  Zap
} from 'lucide-react';
import { 
  AlexandriaGlobalStats, 
  ForensicTraceEvent, 
  SystemMetricTimeSeries, 
  TenantOrganization 
} from '../types/sportsync';

interface CommandCenterProps {
  stats: AlexandriaGlobalStats;
  tenants: TenantOrganization[];
  forensicTraces: ForensicTraceEvent[];
  timeSeries: SystemMetricTimeSeries[];
  selectedTenant: TenantOrganization | 'ALL';
  onInspectTrace: (trace: ForensicTraceEvent) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenExportModal: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  stats,
  tenants,
  forensicTraces,
  timeSeries,
  selectedTenant,
  onInspectTrace,
  onNavigateToTab,
  onOpenExportModal,
}) => {
  const [rotatingKeys, setRotatingKeys] = useState(false);
  const [rotatedMessage, setRotatedMessage] = useState<string | null>(null);

  const handleRotateAllKeys = () => {
    setRotatingKeys(true);
    setTimeout(() => {
      setRotatingKeys(false);
      setRotatedMessage('Rotated Widevine & FairPlay broadcast keys across 14 tenants successfully.');
      setTimeout(() => setRotatedMessage(null), 5000);
    }, 900);
  };

  const currentTenants = selectedTenant === 'ALL'
    ? tenants
    : tenants.filter(t => t.id === selectedTenant.id);

  const totalConcurrentViewers = currentTenants.reduce((sum, t) => sum + t.activeStreams, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Scope Banner & Notification */}
      {rotatedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{rotatedMessage}</span>
          </div>
          <button 
            onClick={() => setRotatedMessage(null)}
            className="text-emerald-400 hover:text-white font-mono text-[11px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Top Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Media Partners
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-3xl font-heading font-bold text-white mt-2 flex items-baseline gap-1.5">
            {selectedTenant === 'ALL' ? stats.totalActiveTenants : 1}
            <span className="text-xs font-normal text-emerald-400">Tenants</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{(totalConcurrentViewers / 1000000).toFixed(2)}M concurrent watermark streams</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition"></div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Rights Catalog
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              EMEA / APAC / US
            </span>
          </div>
          <div className="text-3xl font-heading font-bold text-white mt-2 flex items-baseline gap-1.5">
            {selectedTenant === 'ALL' ? stats.totalRightsCatalog : 42}
            <span className="text-xs font-normal text-blue-400">Licenses</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span>$2.4B total protected broadcast value</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition"></div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              DRM Security Status
            </div>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-emerald-400 mt-2">
            {stats.uptime99}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            Widevine L1 • FairPlay • PlayReady
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition"></div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Forensic Leak Trace
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-semibold">
              SUB-SECOND
            </span>
          </div>
          <div className="text-3xl font-heading font-bold text-amber-400 mt-2">
            &lt; 1.2s
          </div>
          <div className="text-xs text-slate-400 mt-2">
            A/B Payload & Invisible Spread Spectrum
          </div>
        </div>
      </div>

      {/* Main Row: Chart & Forensic Leak Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24h DRM & Watermark Telemetry Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                24-Hour DRM & Live Watermark Stream Telemetry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time concurrent viewers with sub-second AB watermark payload injections
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Watermark Streams (M)
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Bandwidth (Tbps)
              </span>
            </div>
          </div>

          {/* SVG Bar / Area Telemetry Visualization */}
          <div className="h-60 w-full relative flex items-end justify-between pt-8 px-2 border-b border-slate-800">
            {timeSeries.map((point, index) => {
              // Calculate relative height percentage
              const streamHeight = Math.min(100, Math.round((point.watermarkStreams / 5000000) * 90));
              const bwHeight = Math.min(100, Math.round((point.bandwidthTbps / 100) * 75));

              return (
                <div 
                  key={index} 
                  className="flex flex-col items-center flex-1 group relative h-full justify-end px-1.5"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-950 border border-slate-700 rounded-lg p-2.5 shadow-2xl z-20 text-xs whitespace-nowrap">
                    <div className="text-slate-400 font-semibold">{point.time} UTC Telemetry</div>
                    <div className="text-emerald-400 font-mono">
                      {(point.watermarkStreams / 1000000).toFixed(2)}M Active Streams
                    </div>
                    <div className="text-blue-400 font-mono">
                      {point.bandwidthTbps} Tbps Backbone
                    </div>
                    <div className="text-amber-400 font-mono">
                      {point.drmEnforcements} DRM Revocations
                    </div>
                  </div>

                  {/* Dual Bar Column */}
                  <div className="w-full max-w-[44px] flex items-end justify-center gap-1.5 h-full">
                    {/* Emerald bar: watermarkStreams */}
                    <div 
                      style={{ height: `${streamHeight}%` }}
                      className="w-full bg-gradient-to-t from-emerald-500/80 to-emerald-400 rounded-t transition-all duration-300 group-hover:brightness-110"
                    ></div>
                    {/* Blue bar: bandwidthTbps */}
                    <div 
                      style={{ height: `${bwHeight}%` }}
                      className="w-full bg-gradient-to-t from-blue-500/60 to-blue-400/80 rounded-t transition-all duration-300 group-hover:brightness-110"
                    ></div>
                  </div>

                  {/* Time X Label */}
                  <span className="text-[11px] font-mono text-slate-400 mt-2">
                    {point.time}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
            <span>Watermark injection latency across 14 tenant clusters: <strong className="text-white">0.12ms</strong></span>
            <button
              onClick={() => onNavigateToTab('forensics')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Open Forensics Leak Tracer <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Forensic Stream Leak Alerts */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Live Forensic Leak Feed
                </h3>
                <p className="text-xs text-slate-400">
                  Automated AB watermark tracing
                </p>
              </div>
              <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                LIVE 4 Traces
              </span>
            </div>

            <div className="space-y-3">
              {forensicTraces.slice(0, 3).map((trace) => (
                <div 
                  key={trace.id}
                  onClick={() => onInspectTrace(trace)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white truncate max-w-[170px]">
                      {trace.streamTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {trace.timestamp}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    URL: {trace.detectedUrlOrSource}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-xs">
                    <span className="text-emerald-400 font-mono text-[11px]">
                      {trace.watermarkPayloadId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      trace.actionTaken === 'Stream Revoked' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {trace.actionTaken} ({trace.confidenceScore}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total 24h Revocations: <strong className="text-white">18,450</strong></span>
            <button
              onClick={() => onNavigateToTab('forensics')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              View Full Audit Log →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Active Tenants & Quick Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tenant Regional Distribution */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Tenant Regional SLA & Watermarking Quotas
            </h3>
            <button
              onClick={() => onNavigateToTab('tenants')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Manage Partner Tenants →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tenants.map((tenant) => {
              const quotaPercent = Math.min(100, Math.round((tenant.activeStreams / tenant.maxConcurrentQuota) * 100));
              return (
                <div key={tenant.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-white">{tenant.name}</div>
                      <div className="text-xs text-slate-400">{tenant.region} • <span className="text-emerald-400">{tenant.slaTier}</span></div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {tenant.status}
                    </span>
                  </div>

                  {/* Quota bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Concurrent Watermark Streams:</span>
                      <span className="text-white font-mono font-semibold">
                        {(tenant.activeStreams / 1000).toFixed(0)}K / {(tenant.maxConcurrentQuota / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${quotaPercent}%` }}
                        className={`h-full rounded-full transition-all ${
                          quotaPercent > 85 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>Policy: <strong className="text-slate-300">{tenant.watermarkPolicy}</strong></span>
                    <span>30d Rotations: <strong className="text-emerald-400">{tenant.drmKeyRotations30d}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Action Command Desk */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Quick Command Action Desk
            </h3>
            <p className="text-xs text-slate-400">
              Execute global DRM controls across all 14 broadcast tenants.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleRotateAllKeys}
                disabled={rotatingKeys}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className={`w-4 h-4 text-emerald-400 ${rotatingKeys ? 'animate-spin' : ''}`} />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                      Rotate All Broadcast Keys
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Widevine L1 & FairPlay AES-256
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">RUN</span>
              </button>

              <button
                onClick={() => onNavigateToTab('rights-matrix')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition">
                      Inspect Alexandria Rights Matrix
                    </div>
                    <div className="text-[10px] text-slate-500">
                      UEFA, Formula 1, NBA Finals, Wimbledon
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                onClick={onOpenExportModal}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition">
                      Download Standalone ZIP Template
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Self-contained HTML + React Source (.zip)
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">ZIP</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Alexandria Rights Engine</span>
            <span className="font-mono text-emerald-400">v4.8-PROD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

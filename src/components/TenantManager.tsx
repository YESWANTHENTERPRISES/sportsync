import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Globe, 
  CheckCircle2, 
  Lock, 
  Sliders, 
  X,
  Radio
} from 'lucide-react';
import { TenantOrganization, Region, SLATier } from '../types/sportsync';

interface TenantManagerProps {
  tenants: TenantOrganization[];
  onAddTenant: (tenant: TenantOrganization) => void;
}

export const TenantManager: React.FC<TenantManagerProps> = ({
  tenants,
  onAddTenant,
}) => {
  const [rotatedId, setRotatedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState<Region>('Global');
  const [slaTier, setSlaTier] = useState<SLATier>('Enterprise Platinum');
  const [quota, setQuota] = useState(1500000);
  const [watermarkPolicy, setWatermarkPolicy] = useState<'AB_Payload_4K' | 'Forensic_Dynamic_ID' | 'Invisible_SpreadSpectrum'>('AB_Payload_4K');

  const handleRotateKey = (tenantId: string) => {
    setRotatedId(tenantId);
    setTimeout(() => setRotatedId(null), 3000);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const newTenant: TenantOrganization = {
      id: `tenant-${code.toLowerCase()}-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      region,
      slaTier,
      activeStreams: Math.floor(Math.random() * 300000) + 100000,
      maxConcurrentQuota: quota,
      drmKeyRotations30d: 1,
      status: 'Online',
      lastAudit: new Date().toISOString(),
      watermarkPolicy
    };

    onAddTenant(newTenant);
    setName('');
    setCode('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Tenant & Organization Administration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-tenant media partners, assign API quotas, inspect SLA tiers, and control AB watermarking policies.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Media Partner</span>
        </button>
      </div>

      {/* Grid of Tenants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tenants.map((t) => {
          const quotaPercent = Math.min(100, Math.round((t.activeStreams / t.maxConcurrentQuota) * 100));
          const isRotated = rotatedId === t.id;

          return (
            <div 
              key={t.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                      {t.code}
                    </span>
                    <h3 className="font-heading font-bold text-base text-white mt-1">
                      {t.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {t.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
                    {t.region}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-400 font-semibold">{t.slaTier}</span>
                </div>

                {/* Quota Progress */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Concurrent Watermark Quota:</span>
                    <span className="text-white font-mono font-semibold">
                      {(t.activeStreams / 1000).toFixed(0)}K / {(t.maxConcurrentQuota / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${quotaPercent}%` }}
                      className={`h-full rounded-full transition-all ${
                        quotaPercent > 85 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Policies & Rotations */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">AB Watermark Profile:</span>
                    <span className="text-emerald-400 font-mono font-semibold">{t.watermarkPolicy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">30-Day Key Rotations:</span>
                    <span className="text-white font-mono">{t.drmKeyRotations30d} rotations</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRotateKey(t.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  isRotated
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isRotated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>DRM Keys Rotated!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Rotate Widevine / FairPlay Key</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Provision Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Provision New Media Partner Tenant
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pacific Rim Broadcasting Corp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Tenant Code (3-4 chars) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. PRBC"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Broadcast Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as Region)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Global">Global</option>
                    <option value="EMEA">EMEA</option>
                    <option value="APAC">APAC</option>
                    <option value="North America">North America</option>
                    <option value="LATAM">LATAM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    SLA Tier
                  </label>
                  <select
                    value={slaTier}
                    onChange={(e) => setSlaTier(e.target.value as SLATier)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Enterprise Platinum">Enterprise Platinum</option>
                    <option value="Enterprise Gold">Enterprise Gold</option>
                    <option value="Standard Broadcast">Standard Broadcast</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Watermarking Profile
                  </label>
                  <select
                    value={watermarkPolicy}
                    onChange={(e) => setWatermarkPolicy(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AB_Payload_4K">AB_Payload_4K</option>
                    <option value="Forensic_Dynamic_ID">Forensic_Dynamic_ID</option>
                    <option value="Invisible_SpreadSpectrum">Invisible_SpreadSpectrum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Concurrent Watermark Quota: {(quota / 1000).toFixed(0)}K Viewers
                </label>
                <input
                  type="range"
                  min={500000}
                  max={3000000}
                  step={100000}
                  value={quota}
                  onChange={(e) => setQuota(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Provision Tenant Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

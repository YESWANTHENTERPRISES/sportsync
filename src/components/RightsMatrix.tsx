import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Shield, 
  Globe, 
  Lock, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  Radio,
  FileText
} from 'lucide-react';
import { 
  MediaRight, 
  SportCategory, 
  Region, 
  LicenseStatus, 
  TenantOrganization 
} from '../types/sportsync';

interface RightsMatrixProps {
  rights: MediaRight[];
  tenants: TenantOrganization[];
  selectedTenant: TenantOrganization | 'ALL';
}

export const RightsMatrix: React.FC<RightsMatrixProps> = ({
  rights,
  tenants,
  selectedTenant,
}) => {
  const [sportFilter, setSportFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectModalRight, setInspectModalRight] = useState<MediaRight | null>(null);
  const [countryCheck, setCountryCheck] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Filtered rights
  const filteredRights = useMemo(() => {
    return rights.filter((r) => {
      if (selectedTenant !== 'ALL' && r.holderTenantId !== selectedTenant.id) return false;
      if (sportFilter !== 'ALL' && r.sport !== sportFilter) return false;
      if (regionFilter !== 'ALL' && r.region !== regionFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchHolder = r.holderTenantName.toLowerCase().includes(q);
        const matchSport = r.sport.toLowerCase().includes(q);
        const matchKey = r.keyId.toLowerCase().includes(q);
        if (!matchTitle && !matchHolder && !matchSport && !matchKey) return false;
      }
      return true;
    });
  }, [rights, selectedTenant, sportFilter, regionFilter, statusFilter, searchQuery]);

  const allSports: SportCategory[] = [
    'Football', 'Motorsport', 'Basketball', 'Tennis', 'Cricket', 'Combat Sports'
  ];
  const allRegions: Region[] = ['Global', 'EMEA', 'APAC', 'North America', 'LATAM'];
  const allStatuses: LicenseStatus[] = ['Active', 'Expiring Soon', 'Exclusive', 'Embargoed'];

  const totalContractValue = filteredRights.reduce((sum, r) => sum + r.contractValueUsd, 0);

  const isCountryBlacklisted = (countryName: string, blackoutTerritories: string[]): boolean => {
    if (!countryName.trim()) return false;
    const q = countryName.trim().toLowerCase();
    return blackoutTerritories.some((b) => b.toLowerCase().includes(q));
  };

  const handleCopyManifest = (right: MediaRight) => {
    const manifest = {
      licenseId: right.id,
      broadcastPackage: right.title,
      drmEncryption: right.drmEncryption,
      watermarkProfile: right.watermarkProfile,
      keyId: right.keyId,
      holderTenant: right.holderTenantName,
      blackoutTerritories: right.blackoutTerritories,
      timestamp: new Date().toISOString()
    };
    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title & Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2.5">
              <span>Alexandria Rights Matrix</span>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {filteredRights.length} Licenses
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tenant broadcast licensing catalog with territorial blackout rules and DRM key enforcement.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-slate-400">Filtered Value:</span>
              <span className="text-emerald-400 font-mono font-bold">
                ${(totalContractValue / 1000000).toFixed(0)}M USD
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UEFA, F1, NBA, Widevine key..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Sport Filter */}
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Sports Categories</option>
            {allSports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All Broadcast Regions</option>
            {allRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="ALL">All License Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Broadcast Package & Sport</th>
                <th className="py-3.5 px-5">Tenant Holder</th>
                <th className="py-3.5 px-5">Region & Season</th>
                <th className="py-3.5 px-5">Resolution & DRM</th>
                <th className="py-3.5 px-5">Watermark Profile</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredRights.map((right) => (
                <tr 
                  key={right.id} 
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => setInspectModalRight(right)}
                >
                  <td className="py-4 px-5">
                    <div className="font-semibold text-white group-hover:text-emerald-400 transition">
                      {right.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                        {right.sport}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Key: {right.keyId}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-medium text-slate-200">
                    <div className="text-xs">{right.holderTenantName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">${(right.contractValueUsd / 1000000).toFixed(0)}M contract</div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                      {right.region}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">{right.season}</div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-mono text-xs text-white">{right.maxResolution}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span className="truncate max-w-[140px]">{right.drmEncryption}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                      {right.watermarkProfile.split(' ')[0]}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      right.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : right.status === 'Expiring Soon'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {right.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectModalRight(right);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRights.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No sports rights matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect License & DRM Modal */}
      {inspectModalRight && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  {inspectModalRight.sport} • {inspectModalRight.region}
                </span>
                <h3 className="font-heading font-bold text-xl text-white mt-1">
                  {inspectModalRight.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tenant Holder: <strong className="text-slate-200">{inspectModalRight.holderTenantName}</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectModalRight(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Max Broadcast Resolution</div>
                <div className="text-white font-mono font-bold text-sm mt-1">{inspectModalRight.maxResolution}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">Contract Value</div>
                <div className="text-emerald-400 font-mono font-bold text-sm mt-1">
                  ${(inspectModalRight.contractValueUsd / 1000000).toFixed(1)} Million USD
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">License Window</div>
                <div className="text-slate-200 font-mono mt-1">
                  {inspectModalRight.validFrom} to {inspectModalRight.validUntil}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">DRM Key ID</div>
                <div className="text-blue-400 font-mono mt-1">{inspectModalRight.keyId}</div>
              </div>
            </div>

            {/* DRM Encryption & Watermark Profile */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  DRM Security & Watermark Profile
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ACTIVE ENFORCEMENT
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Encryption Layer:</span>
                  <span className="text-white font-mono font-semibold">{inspectModalRight.drmEncryption}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">AB Watermark Profile:</span>
                  <span className="text-emerald-400 font-mono font-semibold">{inspectModalRight.watermarkProfile}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Active Concurrent Viewers:</span>
                  <span className="text-white font-mono">{inspectModalRight.currentActiveViewers.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Territorial Blackout Simulator */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-400" />
                Territorial Blackout Enforcement Simulator
              </div>
              <p className="text-xs text-slate-400">
                Blacklisted territories for this license:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {inspectModalRight.blackoutTerritories.length > 0 ? (
                  inspectModalRight.blackoutTerritories.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold">
                    No Blackout Zones • Worldwide Broadcast Allowed
                  </span>
                )}
              </div>

              {/* Instant tester input */}
              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Type any Country/Territory to test instant DRM access:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={countryCheck}
                    onChange={(e) => setCountryCheck(e.target.value)}
                    placeholder="e.g. Russia, UK, Germany, Brazil..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  {countryCheck && (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono ${
                      isCountryBlacklisted(countryCheck, inspectModalRight.blackoutTerritories)
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {isCountryBlacklisted(countryCheck, inspectModalRight.blackoutTerritories)
                        ? 'BLACKOUT / BLOCKED'
                        : 'STREAM AUTHORIZED'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopyManifest(inspectModalRight)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>{copiedKey ? 'Manifest Copied!' : 'Copy DRM Manifest JSON'}</span>
              </button>

              <button
                onClick={() => setInspectModalRight(null)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-xs transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

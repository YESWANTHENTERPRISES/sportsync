export type SportCategory = 'Football' | 'Motorsport' | 'Basketball' | 'Tennis' | 'Cricket' | 'Rugby' | 'Golf' | 'Combat Sports';

export type Region = 'Global' | 'EMEA' | 'APAC' | 'LATAM' | 'North America' | 'MENA';

export type LicenseStatus = 'Active' | 'Expiring Soon' | 'Exclusive' | 'Embargoed' | 'Revoked';

export type SLATier = 'Enterprise Platinum' | 'Enterprise Gold' | 'Standard Broadcast' | 'Syndication Partner';

export interface TenantOrganization {
  id: string;
  name: string;
  code: string;
  region: Region;
  slaTier: SLATier;
  activeStreams: number;
  maxConcurrentQuota: number;
  drmKeyRotations30d: number;
  status: 'Online' | 'Warning' | 'Maintenance';
  lastAudit: string;
  watermarkPolicy: 'AB_Payload_4K' | 'Forensic_Dynamic_ID' | 'Invisible_SpreadSpectrum';
}

export interface MediaRight {
  id: string;
  title: string;
  sport: SportCategory;
  season: string;
  region: Region;
  holderTenantId: string;
  holderTenantName: string;
  status: LicenseStatus;
  validFrom: string;
  validUntil: string;
  maxResolution: '4K HDR10+' | '1080p60' | '8K VR Multi-Cam' | '4K UHD';
  drmEncryption: 'Widevine L1 + PlayReady + FairPlay' | 'Widevine L1 + FairPlay' | 'Hardware-Backed AES-256';
  watermarkEnabled: boolean;
  watermarkProfile: string;
  blackoutTerritories: string[];
  concurrentViewersCap: number;
  currentActiveViewers: number;
  contractValueUsd: number;
  keyId: string;
}

export interface ForensicTraceEvent {
  id: string;
  timestamp: string;
  streamTitle: string;
  detectedUrlOrSource: string;
  watermarkPayloadId: string;
  suspectedTenantId: string;
  suspectedTenantName: string;
  suspectedSubscriberId: string;
  ipAddress: string;
  locationRegion: string;
  confidenceScore: number;
  actionTaken: 'Monitored' | 'Warning Issued' | 'Stream Revoked' | 'DRM Key Blacklisted';
}

export interface SystemMetricTimeSeries {
  time: string;
  watermarkStreams: number;
  drmEnforcements: number;
  bandwidthTbps: number;
}

export interface AlexandriaGlobalStats {
  totalActiveTenants: number;
  totalRightsCatalog: number;
  concurrentWatermarkStreams: number;
  globalDrmEnforcements24h: number;
  storageFootprintPb: number;
  uptime99: string;
}

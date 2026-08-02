import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { MOCK_MEDIA_RIGHTS, MOCK_TENANTS, MOCK_FORENSIC_TRACES } from '../data/mockData';

export const generateStandaloneHtmlTemplate = (): string => {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SportSync Alexandria - DRM & Rights Management Command Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              emerald: '#10b981',
              blue: '#3b82f6',
              dark: '#090d16',
              card: '#0f172a',
              border: '#1e293b'
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            heading: ['Space Grotesk', 'system-ui', 'sans-serif']
          }
        }
      }
    };
  </script>
  <style>
    body { background-color: #090d16; color: #f8fafc; font-family: 'Inter', sans-serif; }
    h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; }
    .glow-emerald { box-shadow: 0 0 25px -5px rgba(16, 185, 129, 0.25); }
    .glow-blue { box-shadow: 0 0 25px -5px rgba(59, 130, 246, 0.25); }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <!-- Top Navbar -->
  <header class="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-heading font-bold text-lg">
          SX
        </div>
        <div>
          <span class="font-heading font-bold text-lg tracking-tight text-white">SportSync <span class="text-emerald-400">Alexandria</span></span>
          <span class="block text-[10px] uppercase tracking-wider text-slate-400">Enterprise DRM & Rights Matrix</span>
        </div>
      </div>
      <!-- Organization Switcher -->
      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="font-medium text-white">Global Sports Media Group</span>
        <span class="text-slate-500">|</span>
        <span class="text-emerald-400 font-mono">Alexandria Core v4.8</span>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-4">
      <div class="hidden lg:flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400">
        <span>Active DRM Enforcements:</span>
        <span class="text-emerald-400 font-mono font-semibold">18,450 / 24h</span>
      </div>
      <button onclick="alert('Exporting standalone DRM audit log...')" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-500/20">
        Export Audit Report
      </button>
    </div>
  </header>

  <!-- Main Grid Content -->
  <main class="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
    <!-- Hero KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Media Partners</div>
        <div class="text-3xl font-heading font-bold text-white mt-1">14 <span class="text-xs font-normal text-emerald-400">Tenants</span></div>
        <div class="text-xs text-slate-400 mt-2">1.84M concurrent watermark streams</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Rights Catalog</div>
        <div class="text-3xl font-heading font-bold text-white mt-1">342 <span class="text-xs font-normal text-blue-400">Licenses</span></div>
        <div class="text-xs text-slate-400 mt-2">$2.4B total protected broadcast value</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">DRM Security Status</div>
        <div class="text-3xl font-heading font-bold text-emerald-400 mt-1">99.998%</div>
        <div class="text-xs text-slate-400 mt-2">Widevine L1 + FairPlay + PlayReady</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Forensic Leak Detection</div>
        <div class="text-3xl font-heading font-bold text-amber-400 mt-1">&lt; 1.2s</div>
        <div class="text-xs text-slate-400 mt-2">A/B Payload & Spread Spectrum</div>
      </div>
    </div>

    <!-- Rights Matrix Sample Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 class="font-heading font-bold text-lg text-white">Alexandria Rights Matrix (Sample)</h2>
        <span class="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">Live Catalog</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th class="py-3 px-6">Broadcast Package / Event</th>
              <th class="py-3 px-6">Sport</th>
              <th class="py-3 px-6">Tenant Holder</th>
              <th class="py-3 px-6">Resolution & DRM</th>
              <th class="py-3 px-6">Watermark</th>
              <th class="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 text-slate-300">
            <tr class="hover:bg-slate-800/50">
              <td class="py-4 px-6 font-medium text-white">2026 UEFA Premier European Broadcast Package</td>
              <td class="py-4 px-6"><span class="px-2 py-1 rounded bg-slate-800 text-xs">Football</span></td>
              <td class="py-4 px-6 text-emerald-400">Premier European League Network</td>
              <td class="py-4 px-6 font-mono text-xs">4K HDR10+ | L1+FairPlay</td>
              <td class="py-4 px-6"><span class="text-xs text-emerald-400">AB_Payload_4K</span></td>
              <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">Active</span></td>
            </tr>
            <tr class="hover:bg-slate-800/50">
              <td class="py-4 px-6 font-medium text-white">Formula 1 World Championship 2026–2028 - Live 4K HDR</td>
              <td class="py-4 px-6"><span class="px-2 py-1 rounded bg-slate-800 text-xs">Motorsport</span></td>
              <td class="py-4 px-6 text-blue-400">Global Sports Media Group</td>
              <td class="py-4 px-6 font-mono text-xs">4K HDR10+ | Widevine L1</td>
              <td class="py-4 px-6"><span class="text-xs text-emerald-400">Forensic_Dynamic</span></td>
              <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">Active</span></td>
            </tr>
            <tr class="hover:bg-slate-800/50">
              <td class="py-4 px-6 font-medium text-white">NBA Finals Courtside 8K VR & Multi-Cam Feed</td>
              <td class="py-4 px-6"><span class="px-2 py-1 rounded bg-slate-800 text-xs">Basketball</span></td>
              <td class="py-4 px-6 text-purple-400">North American Syndication Hub</td>
              <td class="py-4 px-6 font-mono text-xs">8K VR | Hardware AES-256</td>
              <td class="py-4 px-6"><span class="text-xs text-emerald-400">SpreadSpectrum</span></td>
              <td class="py-4 px-6"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</body>
</html>`;
};

export const downloadStandaloneHtml = () => {
  const htmlContent = generateStandaloneHtmlTemplate();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  saveAs(blob, 'SportSync-Alexandria-Standalone-Template.html');
};

export const downloadProjectZip = async () => {
  const zip = new JSZip();

  // Root files
  zip.file('README.md', `# SportSync Alexandria - Enterprise Sports DRM & Rights Management Platform

This package contains the complete standalone template and React source code for SportSync Alexandria.

## Files included:
- \`SportSync-Alexandria-Standalone-Template.html\` - Ready-to-use standalone HTML/Tailwind template
- \`src/\` - TypeScript React source code with types, mock datasets, and UI components
- \`package.json\` - Dependencies and build configuration
`);

  zip.file('SportSync-Alexandria-Standalone-Template.html', generateStandaloneHtmlTemplate());

  zip.file('package.json', JSON.stringify({
    name: 'sportsync-alexandria',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'lucide-react': '^0.546.0',
      'file-saver': '^2.0.5',
      jszip: '^3.10.1'
    }
  }, null, 2));

  // Add data folder
  const dataFolder = zip.folder('src/data');
  dataFolder?.file('mockData.json', JSON.stringify({
    tenants: MOCK_TENANTS,
    mediaRights: MOCK_MEDIA_RIGHTS,
    forensicTraces: MOCK_FORENSIC_TRACES
  }, null, 2));

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'SportSync-Alexandria-Template-Bundle.zip');
};

import { registerPlugin, Capacitor } from '@capacitor/core';
import type { AppInfo, FileInfo } from '../types/models';

export interface DeviceScannerPlugin {
  scanApps(): Promise<{ apps: any[] }>;
  scanFiles(): Promise<{ files: any[] }>;
}

const NativeScanner = registerPlugin<DeviceScannerPlugin>('DeviceScanner');

const WebMockScanner: DeviceScannerPlugin = {
  scanApps: async () => {
    return {
      apps: [
        { id: 'com.mock.app1', name: 'Instagram (Web)', sizeBytes: 150000000, installedAt: Date.now() - 86400000, lastUsedAt: Date.now() },
        { id: 'com.mock.app2', name: 'PUBG (Web)', sizeBytes: 850000000, installedAt: Date.now() - 864000000, lastUsedAt: Date.now() - 400000000 },
      ]
    };
  },
  scanFiles: async () => {
    return {
      files: [
        { id: 'f1', name: 'vacation.jpg', path: '/mock/vacation.jpg', sizeBytes: 3500000, lastModified: Date.now() - 100000, type: 'image' },
        { id: 'f2', name: 'vacation_copy.jpg', path: '/mock/vacation_copy.jpg', sizeBytes: 3500000, lastModified: Date.now() - 100000, type: 'image' },
      ]
    };
  }
};

const internalScanner = Capacitor.isNativePlatform() ? NativeScanner : WebMockScanner;

const DeviceScanner = {
  scanApps: async (): Promise<{ apps: AppInfo[] }> => {
    const { apps } = await internalScanner.scanApps();
    const mapped = apps.map((a: any, i) => ({
      id: a.id,
      name: a.name,
      packageName: a.id,
      versionName: "1.0",
      glyph: "📱",
      color: "bg-blue-500",
      sizeBytes: a.sizeBytes || 0,
      isSystemCritical: false,
      installedAtDaysAgo: Math.floor((Date.now() - (a.installedAt || Date.now())) / 86400000),
      lastUsedDaysAgo: a.lastUsedAt ? Math.floor((Date.now() - a.lastUsedAt) / 86400000) : null,
      usageAvailable: true,
      category: "occasionally_used",
      opensPerWeek: 5
    } as AppInfo));
    return { apps: mapped };
  },
  scanFiles: async (): Promise<{ files: FileInfo[] }> => {
    const { files } = await internalScanner.scanFiles();
    const mapped = files.map((f: any, i) => ({
      id: f.id,
      name: f.name,
      path: f.path,
      sizeBytes: f.sizeBytes || 0,
      category: f.type || "other",
      mimeType: "application/octet-stream",
      modifiedDaysAgo: Math.floor((Date.now() - (f.lastModified || Date.now())) / 86400000),
      isInDownloads: f.path?.includes("Download") || false,
      contentHash: f.name + "_" + f.sizeBytes,
    } as FileInfo));
    return { files: mapped };
  }
};

export default DeviceScanner;

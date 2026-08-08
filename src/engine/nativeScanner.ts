import { registerPlugin } from '@capacitor/core';
import type { AppInfo, FileInfo } from '../types/models';

export interface DeviceScannerPlugin {
  scanApps(): Promise<{ apps: AppInfo[] }>;
  scanFiles(): Promise<{ files: FileInfo[] }>;
}

const DeviceScanner = registerPlugin<DeviceScannerPlugin>('DeviceScanner');

export default DeviceScanner;

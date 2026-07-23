export interface SessionData {
  deviceId: string;
  vaultId: string;
  deviceName: string;
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  platform: string;
  appVersion: string;
  firstSeen: number;
  lastSeen: number;
  trustedDevice: boolean;
  status: 'active' | 'revoked';
  sessionToken: string;
}

export interface SessionRepository {
  init(): Promise<void>;
  upsertSession(data: SessionData): Promise<void>;
  getSession(deviceId: string): Promise<SessionData | null>;
  upsertSession(data: SessionData): Promise<void>;
  getSessionsByVaultId(vaultId: string): Promise<SessionData[]>;
  getSessionStatus(deviceId: string): Promise<string | null>;
  updateSessionStatus(deviceId: string, status: 'active' | 'revoked'): Promise<void>;
  updateSessionLastSeen(deviceId: string, lastSeen: number): Promise<void>;
  renameSession(deviceId: string, deviceName: string): Promise<void>;
}

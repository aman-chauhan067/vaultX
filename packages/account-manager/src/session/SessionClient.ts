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
}

export class SessionClient {
  private readonly baseUrl: string;
  private intervalId: NodeJS.Timeout | null = null;
  private sessionToken: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  public setSessionToken(token: string) {
    this.sessionToken = token;
  }

  public getSessionToken(): string | null {
    return this.sessionToken;
  }

  private getAuthHeaders(deviceId: string) {
    if (!this.sessionToken) throw new Error('Session token missing');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.sessionToken}`,
      'x-device-id': deviceId
    };
  }

  public async registerSession(data: SessionData): Promise<string | undefined> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to register session');
      const resData = await response.json();
      if (resData.sessionToken) {
        this.setSessionToken(resData.sessionToken);
        return resData.sessionToken;
      }
    } catch (e) {
      console.warn('[SessionClient] Failed to register session', e);
    }
  }

  public async getSessions(vaultId: string, deviceId: string): Promise<SessionData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/vault/${vaultId}`, {
        headers: this.getAuthHeaders(deviceId)
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      return data.sessions;
    } catch (e) {
      console.warn('[SessionClient] Failed to fetch sessions', e);
      return [];
    }
  }

  public async revokeSession(deviceId: string, targetDeviceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${targetDeviceId}/revoke`, {
        method: 'POST',
        headers: this.getAuthHeaders(deviceId)
      });
      if (!response.ok) throw new Error('Failed to revoke session');
    } catch (e) {
      console.warn('[SessionClient] Failed to revoke session', e);
    }
  }

  public async renameSession(
    deviceId: string,
    targetDeviceId: string,
    deviceName: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${targetDeviceId}/name`, {
        method: 'PUT',
        headers: this.getAuthHeaders(deviceId),
        body: JSON.stringify({ deviceName })
      });
      if (!response.ok) throw new Error('Failed to rename session');
    } catch (e) {
      console.warn('[SessionClient] Failed to rename session', e);
    }
  }

  public startPolling(deviceId: string, onRevoked: () => void, intervalMs: number = 10000) {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/sessions/${deviceId}/status`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.status === 'revoked') {
          this.stopPolling();
          onRevoked();
        }
      } catch (e) {
        // Silently fail on network error, keep polling
      }
    }, intervalMs);
  }

  public stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

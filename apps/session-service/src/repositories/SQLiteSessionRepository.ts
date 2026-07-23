import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { SessionData, SessionRepository } from './SessionRepository';

export class SQLiteSessionRepository implements SessionRepository {
  private dbPath: string;
  private db!: Database;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async init(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        deviceId TEXT PRIMARY KEY,
        vaultId TEXT NOT NULL,
        deviceName TEXT,
        browser TEXT,
        browserVersion TEXT,
        operatingSystem TEXT,
        platform TEXT,
        appVersion TEXT,
        firstSeen INTEGER,
        lastSeen INTEGER,
        trustedDevice INTEGER,
        status TEXT DEFAULT 'active',
        sessionToken TEXT NOT NULL
      );
    `);
  }

  async upsertSession(data: SessionData): Promise<void> {
    await this.db.run(
      `INSERT INTO sessions (
        deviceId, vaultId, deviceName, browser, browserVersion, operatingSystem, platform, appVersion, firstSeen, lastSeen, trustedDevice, status, sessionToken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(deviceId) DO UPDATE SET 
        lastSeen = excluded.lastSeen,
        status = 'active',
        sessionToken = excluded.sessionToken,
        deviceName = excluded.deviceName,
        browserVersion = excluded.browserVersion,
        operatingSystem = excluded.operatingSystem,
        appVersion = excluded.appVersion`,
      [
        data.deviceId,
        data.vaultId,
        data.deviceName,
        data.browser,
        data.browserVersion,
        data.operatingSystem,
        data.platform,
        data.appVersion,
        data.firstSeen,
        data.lastSeen,
        data.trustedDevice ? 1 : 0,
        data.status,
        data.sessionToken
      ]
    );
  }

  async getSession(deviceId: string): Promise<SessionData | null> {
    const row = await this.db.get(`SELECT * FROM sessions WHERE deviceId = ?`, [deviceId]);
    if (!row) return null;
    return { ...row, trustedDevice: !!row.trustedDevice } as SessionData;
  }

  async getSessionsByVaultId(vaultId: string): Promise<SessionData[]> {
    const rows = await this.db.all(
      `SELECT * FROM sessions WHERE vaultId = ? ORDER BY lastSeen DESC`,
      [vaultId]
    );
    return rows.map((r) => ({
      ...r,
      trustedDevice: !!r.trustedDevice
    })) as SessionData[];
  }

  async getSessionStatus(deviceId: string): Promise<string | null> {
    const row = await this.db.get(`SELECT status FROM sessions WHERE deviceId = ?`, [deviceId]);
    return row ? row.status : null;
  }

  async updateSessionStatus(deviceId: string, status: 'active' | 'revoked'): Promise<void> {
    await this.db.run(`UPDATE sessions SET status = ? WHERE deviceId = ?`, [status, deviceId]);
  }

  async updateSessionLastSeen(deviceId: string, lastSeen: number): Promise<void> {
    await this.db.run(`UPDATE sessions SET lastSeen = ? WHERE deviceId = ?`, [lastSeen, deviceId]);
  }

  async renameSession(deviceId: string, deviceName: string): Promise<void> {
    await this.db.run(`UPDATE sessions SET deviceName = ? WHERE deviceId = ?`, [
      deviceName,
      deviceId
    ]);
  }
}

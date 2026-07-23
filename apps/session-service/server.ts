import express from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { SQLiteSessionRepository } from './src/repositories/SQLiteSessionRepository';
import { SessionData } from './src/repositories/SessionRepository';

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'sessions.db');
const repository = new SQLiteSessionRepository(DB_PATH);

// Auth Middleware
async function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    return res.status(400).json({ error: 'Missing x-device-id header' });
  }

  const session = await repository.getSession(deviceId);
  if (!session || session.sessionToken !== token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Attach session to request for downstream use
  (req as any).session = session;
  next();
}

// Register or update a session
app.post('/sessions', async (req, res) => {
  const {
    deviceId,
    vaultId,
    deviceName,
    browser,
    browserVersion,
    operatingSystem,
    platform,
    appVersion
  } = req.body;
  if (!deviceId || !vaultId) {
    return res.status(400).json({ error: 'deviceId and vaultId are required' });
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const now = Date.now();

  const existing = await repository.getSession(deviceId);

  const sessionData: SessionData = {
    deviceId,
    vaultId,
    deviceName: deviceName || 'Unknown Device',
    browser: browser || 'Unknown',
    browserVersion: browserVersion || 'Unknown',
    operatingSystem: operatingSystem || 'Unknown',
    platform: platform || 'Web',
    appVersion: appVersion || '1.0.0',
    firstSeen: existing ? existing.firstSeen : now,
    lastSeen: now,
    trustedDevice: existing ? existing.trustedDevice : false,
    status: 'active',
    sessionToken
  };

  await repository.upsertSession(sessionData);
  res.json({ success: true, sessionToken });
});

// Get all sessions for a vault (Requires Auth)
app.get('/sessions/vault/:vaultId', authenticate, async (req, res) => {
  const { vaultId } = req.params;
  const currentSession = (req as any).session as SessionData;

  if (currentSession.vaultId !== vaultId) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Cannot access sessions for a different vault' });
  }

  const sessions = await repository.getSessionsByVaultId(vaultId);
  // Strip session tokens before returning
  const safeSessions = sessions.map(({ sessionToken, ...rest }) => rest);
  res.json({ sessions: safeSessions });
});

// Revoke a session (Requires Auth)
app.post('/sessions/:targetDeviceId/revoke', authenticate, async (req, res) => {
  const { targetDeviceId } = req.params;
  const currentSession = (req as any).session as SessionData;

  const targetSession = await repository.getSession(targetDeviceId);
  if (!targetSession) {
    return res.status(404).json({ error: 'Target session not found' });
  }

  if (targetSession.vaultId !== currentSession.vaultId) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Cannot revoke session from a different vault' });
  }

  await repository.updateSessionStatus(targetDeviceId, 'revoked');
  res.json({ success: true });
});

// Rename a session (Requires Auth)
app.put('/sessions/:targetDeviceId/name', authenticate, async (req, res) => {
  const { targetDeviceId } = req.params;
  const { deviceName } = req.body;
  const currentSession = (req as any).session as SessionData;

  const targetSession = await repository.getSession(targetDeviceId);
  if (!targetSession) {
    return res.status(404).json({ error: 'Target session not found' });
  }

  if (targetSession.vaultId !== currentSession.vaultId) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Cannot rename session from a different vault' });
  }

  await repository.renameSession(targetDeviceId, deviceName);
  res.json({ success: true });
});

// Check session status (for polling, uses Auth but fails softly if revoked)
app.get('/sessions/:deviceId/status', async (req, res) => {
  const { deviceId } = req.params;
  const status = await repository.getSessionStatus(deviceId);

  if (!status) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (status === 'active') {
    await repository.updateSessionLastSeen(deviceId, Date.now());
  }

  res.json({ status });
});

const PORT = process.env.PORT || 3001;
repository
  .init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Session service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start DB', err);
  });

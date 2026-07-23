export interface SessionTransport {
  start(deviceId: string, onRevoked: () => void): void;
  stop(): void;
}

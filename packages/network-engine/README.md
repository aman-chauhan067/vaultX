# VaultX Network Engine

The Network Engine is responsible for purely stateless blockchain communication. It provides robust, fault-tolerant RPC connectivity isolated away from the internal mathematical Wallet Engine or Keyring states.

## Architecture

This package operates entirely independently of React or any specific storage mechanism.

### Chain Registry

Contains static identifiers, standard RPC URLs, currency decimals, and protocol support flags (like EIP-1559 and ENS) for major networks (Ethereum, Polygon, Base, Arbitrum, Optimism, BNB, Avalanche).

### RPC Failover Strategy

We do not rely on a single RPC endpoint. The `RpcPool` automatically tests latency and monitors failures. If an RPC request fails 3 times, it is temporarily blacklisted. The request will automatically be routed round-robin to the next available healthy RPC URL in the active pool.

### Health Monitoring

The `HealthMonitor` intercepts RPC errors, grades them, and emits typed events (`RPCFailed`, `RPCRecovered`, `LatencyUpdated`) so that any UI layer can accurately render network bars and connection status completely asynchronously.

### Provider Lifecycle

The `ProviderManager` exposes a strictly controlled API. Only one chain is "Active" at a time across the entire VaultX context. Switching chains instantly purges previous active pools, emitting a `ProviderDisconnected` event on the old chain, and bootstrapping a `ProviderConnected` event on the newly requested chain.

### Future Interoperability

Because it is architected with strict event interfaces, bridging this engine directly to WalletConnect v2 or injected `window.ethereum` APIs requires simply extending `ProviderManager` to intercept EIP-1193 requests and forwarding them to our internal `RpcPool`.

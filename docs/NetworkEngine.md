# Network Engine

The `@vaultx/network-engine` is responsible for all external interactions with EVM blockchains.

## RPC Abstraction

Instead of hardcoding single endpoints, the Network Engine abstracts the concept of a "Network" (e.g., Ethereum Mainnet, Polygon). A Network has a Chain ID, currency symbol, block explorer URL, and a list of RPC endpoints.

It provides the `ethers.js` `JsonRpcProvider` instances to the rest of the application.

## Chain Registry

VaultX comes pre-configured with a default registry of popular EVM chains. Users can add custom networks manually. The engine ensures that Chain IDs match the expected network configurations to prevent replay attacks.

## Network Switching

The engine orchestrates network switches. When a dApp requests `wallet_switchEthereumChain`, the engine validates the request, prompts the user via the UI, and if approved, hot-swaps the active provider for the entire application.

## Failover

To ensure reliability, the Network Engine can manage multiple RPC endpoints per chain. If a primary RPC endpoint becomes unresponsive, the engine can seamlessly fall back to secondary endpoints, ensuring that balance queries and transaction broadcasting remain operational.

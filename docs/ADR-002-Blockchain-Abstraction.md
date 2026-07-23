# ADR-002: Blockchain Abstraction Layer (BAL)

## 1. Status

**Approved** (Architecture Freeze Phase 2)

## 2. Context

VaultX is designed to be a long-lasting, highly resilient wallet architecture. A common pitfall in Web3 frontend architecture is tightly coupling business logic to a specific library like `ethers.js` or `viem`.

If `ethers.js` introduces breaking changes, goes unmaintained, or if the project decides to migrate to a more performant alternative (like `viem` or a native Rust WASM layer), a heavily coupled codebase requires a total rewrite of every package (Signers, Contracts, UI hooks, etc.).

## 3. Decision

We are introducing `@vaultx/blockchain-core`, which acts as the **Blockchain Abstraction Layer (BAL)**.

This layer completely encapsulates `ethers.js`.

- **No package outside of `blockchain-core` is allowed to import `ethers`.**
- External packages interact exclusively with framework-independent TypeScript interfaces (`IProvider`, `ISigner`, `ITransaction`, etc.).

## 4. Implementation Details

The `BlockchainFactory` class is exposed as the primary dependency injection root.
Instead of calling `new ethers.JsonRpcProvider()`, the `network-engine` and `transaction-engine` will call `BlockchainFactory.createProvider()`.

Internally, `blockchain-core` maps standard interface requests (`getBlock`, `sendTransaction`, `signMessage`) to the underlying Ethers implementation (`EthersProviderAdapter`, `EthersSignerAdapter`).

## 5. Migration Strategy

If we ever need to replace `ethers.js` with `viem`:

1. We implement `ViemProviderAdapter` and `ViemSignerAdapter` conforming strictly to `IProvider` and `ISigner`.
2. We swap the internal return values in `BlockchainFactory`.
3. **Zero changes** are required in `@vaultx/wallet-engine`, `@vaultx/network-engine`, `@vaultx/transaction-engine`, or `@vaultx/web`.

## 6. Consequences

**Pros:**

- Total vendor lock-in elimination.
- Much easier mocking for unit tests (we can easily create a `MockProviderAdapter` that implements `IProvider`).
- Prevents UI developers from relying on non-standard Ethers quirks.

**Cons:**

- We must manually maintain mapping interfaces for complex Ethereum types (like FeeData or TransactionReceipts).
- Slight instantiation overhead when adapting types.

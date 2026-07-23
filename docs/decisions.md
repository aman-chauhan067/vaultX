# VaultX Decision Log

## ADR-001: pnpm workspace monorepo

**Decision:** Use pnpm workspaces for applications and reusable packages.

**Rationale:** It produces a compact lockfile, strict dependency graph, fast installs, and straightforward extraction of a wallet engine or mobile shared package later.

## ADR-002: non-custodial first

**Decision:** Do not generate, store, or handle private keys in the Phase 1 browser app.

**Rationale:** Browser key custody is a major security boundary. The product should first establish adapter ports and bring a dedicated audited wallet engine only after a specific custody model is selected.

## ADR-003: ethers.js v6

**Decision:** Use ethers.js v6 behind an EIP-1193 adapter boundary.

**Rationale:** ethers has strong TypeScript support and v6 provides modern provider primitives. The adapter prevents it from leaking into presentation modules.

## ADR-004: OpenZeppelin access controls

**Decision:** Use OpenZeppelin `AccessControl`, `Pausable`, and `ReentrancyGuard` for the example protocol contract.

**Rationale:** These well-known primitives reduce avoidable implementation risk. Their use does not replace an independent audit before production deployment.

## ADR-005: public-only Vite configuration

**Decision:** Restrict browser environment variables to non-sensitive configuration.

**Rationale:** Vite statically exposes `VITE_` values to browser bundles. Secrets require server-side infrastructure and must never use this namespace.

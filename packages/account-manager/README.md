# VaultX Account Manager

The Account Manager acts as the high-level orchestrator for VaultX. It bridges the gap between the purely mathematical `wallet-engine`, the secure encryption of `keyring`, and the front-end user experience, maintaining strict boundary isolations.

## Architecture

This package operates entirely independently of React or any specific storage mechanism. It provides an `AccountManager` controller that is instantiated with a `StorageInterface`. This dependency injection allows the manager to run inside a browser (`localStorage`), a mobile app (`SecureStorage`), or a node environment (`MemoryStorage`).

### Session Lifecycle

The `AccountManager` wraps the underlying `KeyringController`. It introduces:

1. **Time-based Auto Locking**: A configurable timer that automatically locks the `keyring` (wiping secrets from memory) after a period of inactivity.
2. **Ping**: Any internal unlock operations automatically ping the session, deferring the auto-lock.

### Storage Abstraction

By depending strictly on `StorageInterface` rather than `window.localStorage`, the entire module becomes portable and highly testable. The data stored is the heavily encrypted AES-256-GCM `EncryptedVaultData` string. No plaintext is ever serialized.

### Future Mobile Compatibility

Because this module is purely TypeScript with injected storage, migrating from Web to React Native is simply a matter of providing an `AsyncStorage` or `Keychain` implementation of `StorageInterface`.

### Migration Strategy

The serialized vault payloads contain a `version` attribute in their metadata. The Account Manager natively prepares the architecture for future `migration` scripts that can inspect older versions of `EncryptedVaultData` and upgrade them to newer encryption schemas before unlocking.

# VaultX Keyring

The VaultX Keyring provides a highly secure, authenticated encryption layer for the wallet-engine, acting as the deterministic source of truth for persistent vault storage.

## Cryptography

### Why AES-256-GCM?

AES (Advanced Encryption Standard) is the industry standard for symmetric encryption.
GCM (Galois/Counter Mode) provides **Authenticated Encryption with Associated Data (AEAD)**. This means it encrypts the data AND computes an authentication tag. If the ciphertext is tampered with, the decryption fails immediately before attempting to parse the result, neutralizing many chosen-ciphertext attacks (e.g., padding oracle attacks).

### Why Salts Exist?

Salts prevent pre-computed dictionary attacks and rainbow tables by ensuring that the exact same password generates a completely different encryption key each time a vault is created.

### Why IVs (Initialization Vectors) Exist?

An IV ensures that encrypting the exact same data twice produces completely different ciphertexts. For AES-GCM, reusing an IV with the same key breaks the security of the encryption entirely, which is why we use a strongly randomized 96-bit IV via `crypto.getRandomValues`.

### PBKDF2 (Password-Based Key Derivation Function 2)

We utilize PBKDF2-HMAC-SHA256 with an OWASP-recommended iteration count (600,000+). This deliberately slows down the key derivation process to make brute-force attacks computationally infeasible while still taking less than a second on modern user devices.

## Threat Model

**In Scope:**

- Malicious extensions or scripts attempting to read LocalStorage/IndexedDB while the vault is locked.
- Stolen device scenarios where the attacker possesses the encrypted vault payload but not the user's password.
- Offline brute force attacks against the ciphertext (mitigated via PBKDF2 iterations).

**Out of Scope (Security Assumptions):**

- Full device compromise with active keylogger: An attacker with a keylogger can steal the master password upon unlock.
- Memory dumping while the vault is unlocked: V8 garbage collection behavior prevents us from absolutely guaranteeing zero-footprint memory scrubbing, though we attempt `fill(0)` where possible.

## Modules

- `controllers/`: The main `KeyringController` class that bridges wallet engine state with storage.
- `encryption/`: AES-256-GCM primitives.
- `password/`: PBKDF2 Web Crypto API implementation.
- `storage/`: Serialization and format structures.
- `utils/`: Memory and buffer management utilities.

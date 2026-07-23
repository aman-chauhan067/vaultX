# Transaction Engine

The `@vaultx/transaction-engine` manages the complete lifecycle of a transaction from intent to confirmation on the blockchain.

## Transaction Lifecycle

1. **Draft**: A transaction request is received (either from the UI "Send" flow or an external dApp via `eth_sendTransaction`).
2. **Populate**: The engine fetches the current nonce for the account and estimates the required gas limit and gas price.
3. **Approval**: The fully populated transaction is presented to the user.
4. **Sign**: The user approves, and the payload is sent to the Keyring for cryptographic signing.
5. **Broadcast**: The signed payload is submitted to the network RPC.
6. **Confirm**: The engine monitors the mempool/chain for the transaction receipt.

## Gas Estimation

The engine uses `eth_estimateGas` via the Network Engine to determine the compute cost of the transaction. For EIP-1559 networks, it calculates the optimal `maxFeePerGas` and `maxPriorityFeePerGas` to ensure timely inclusion without overpaying.

## Signing

The Transaction Engine prepares the standard raw transaction payload (including Chain ID to prevent replays) and requests a signature. It does not perform the elliptic curve math itself, delegating that to the secure Keyring boundary.

## Broadcasting

Once signed, the engine broadcasts the raw hex string using `eth_sendRawTransaction`. It handles potential RPC errors (e.g., nonce too low, insufficient funds) and translates them into user-friendly error messages.

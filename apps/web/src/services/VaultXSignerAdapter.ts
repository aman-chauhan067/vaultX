import type { ISigner, IProvider, ITransaction } from '@vaultx/blockchain-core';
import type { KeyringController } from '@vaultx/keyring';

export class VaultXSignerAdapter implements ISigner {
  private keyringController: KeyringController;
  private walletId: string;
  private address: string;
  private provider: IProvider | null;

  constructor(
    keyringController: KeyringController,
    walletId: string,
    address: string,
    provider: IProvider | null = null
  ) {
    this.keyringController = keyringController;
    this.walletId = walletId;
    this.address = address;
    this.provider = provider;
  }

  public async getAddress(): Promise<string> {
    return this.address;
  }

  public async signMessage(message: string | Uint8Array): Promise<string> {
    return this.keyringController.signMessage(this.walletId, message);
  }

  public async signTypedData(
    domain: Record<string, unknown>,
    types: Record<string, unknown[]>,
    value: Record<string, unknown>
  ): Promise<string> {
    return this.keyringController.signTypedData(this.walletId, domain, types, value);
  }

  public async signTransaction(transaction: Partial<ITransaction>): Promise<string> {
    return this.keyringController.signTransaction(this.walletId, transaction);
  }

  public getProvider(): IProvider | null {
    return this.provider;
  }

  public connect(provider: IProvider): ISigner {
    return new VaultXSignerAdapter(this.keyringController, this.walletId, this.address, provider);
  }
}

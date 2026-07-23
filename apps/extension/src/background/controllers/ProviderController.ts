import { VaultXService } from '@vaultx/web/src/services/VaultXService.js';
import { EventController } from './EventController.js';

export class ProviderController {
  public static initialize(): void {
    const service = VaultXService.getInstance();

    // Subscribe to internal state changes to broadcast to tabs
    service.accountManager.events.on('WalletUnlocked', () => {
      const activeWallet = service.accountManager.getActiveWallet();
      if (activeWallet) {
        EventController.emitAccountsChanged([activeWallet.address]);
      }
    });

    service.accountManager.events.on('WalletLocked', () => {
      EventController.emitAccountsChanged([]);
    });

    service.networkEngine.events.on('ChainChanged', (chainId: number) => {
      EventController.emitChainChanged(`0x${chainId.toString(16)}`);
    });
  }

  public static getActiveAccount(): string | null {
    const activeWallet = VaultXService.getInstance().accountManager.getActiveWallet();
    return activeWallet ? activeWallet.address : null;
  }

  public static getActiveChainId(): number {
    return VaultXService.getInstance().networkEngine.getActiveChainId() || 1;
  }
}

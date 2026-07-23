export class EventController {
  /**
   * Broadcasts an event to all connected content scripts
   */
  public static broadcastToTabs(eventName: string, payload: any): void {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          try {
            chrome.tabs
              .sendMessage(tab.id, {
                target: 'VAULTX_CONTENT_SCRIPT',
                type: 'EVENT',
                eventName,
                payload
              })
              .catch(() => {
                // Tab might not have content script injected yet, ignore.
              });
          } catch {
            // Ignore messaging errors
          }
        }
      });
    });
  }

  /**
   * Specifically broadcasts accountsChanged
   */
  public static emitAccountsChanged(accounts: string[]): void {
    this.broadcastToTabs('accountsChanged', accounts);
  }

  /**
   * Specifically broadcasts chainChanged
   */
  public static emitChainChanged(chainIdHex: string): void {
    this.broadcastToTabs('chainChanged', chainIdHex);
  }
}

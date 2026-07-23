export class WindowController {
  private static activeWindowId: number | null = null;

  public static async spawnPopup(route: string): Promise<void> {
    // If a window is already active, focus it
    if (this.activeWindowId !== null) {
      try {
        const win = await chrome.windows.get(this.activeWindowId);
        if (win && win.id) {
          await chrome.windows.update(win.id, { focused: true });
          return;
        }
      } catch (err) {
        // Window probably closed manually
        this.activeWindowId = null;
      }
    }

    // Determine the URL based on HashRouter path
    const url = chrome.runtime.getURL(`index.html#${route}`);

    // Create a new centered popup window
    const width = 360;
    const height = 620;

    // We are in a service worker, so window is not available.
    // Just use a fixed position or Chrome's defaults.
    const left = 100;
    const top = 100;

    const popup = await chrome.windows.create({
      url,
      type: 'popup',
      width,
      height,
      left,
      top,
      focused: true
    });

    if (popup && popup.id) {
      this.activeWindowId = popup.id;

      // Listen for window close
      chrome.windows.onRemoved.addListener(this.onWindowRemoved);
    }
  }

  private static onWindowRemoved = (windowId: number) => {
    if (windowId === WindowController.activeWindowId) {
      WindowController.activeWindowId = null;
      chrome.windows.onRemoved.removeListener(WindowController.onWindowRemoved);
    }
  };
}

export class ExtensionStorage {
  /**
   * Reads a value from chrome.storage.local
   */
  public static async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          console.error(`VaultX Storage Error: ${chrome.runtime.lastError.message}`);
          resolve(defaultValue);
          return;
        }
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  }

  /**
   * Writes a value to chrome.storage.local
   */
  public static async set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          console.error(`VaultX Storage Error: ${chrome.runtime.lastError.message}`);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Removes a value from chrome.storage.local
   */
  public static async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Clears all extension storage
   */
  public static async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
}

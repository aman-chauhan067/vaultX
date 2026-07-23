export const isExtensionEnvironment = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
};

export const extensionSendMessage = (message: any, callback?: (response: any) => void): void => {
  if (!isExtensionEnvironment()) {
    console.warn('[Extension Environment] Not in extension. Ignoring sendMessage:', message);
    if (callback) callback({ success: false, error: 'Not in extension environment' });
    return;
  }

  if (callback) {
    chrome.runtime.sendMessage(message, callback);
  } else {
    chrome.runtime.sendMessage(message);
  }
};

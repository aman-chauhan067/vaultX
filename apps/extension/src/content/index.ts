// Content Script
// Bridges communication securely between the injected page script and the background worker.

const VAULTX_INJECTED = 'VAULTX_INJECTED_SCRIPT';
const VAULTX_CONTENT = 'VAULTX_CONTENT_SCRIPT';

const targetOrigin = ['null', 'file://'].includes(window.location.origin)
  ? '*'
  : window.location.origin;

// Listen for events from background to forward to injected script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'EVENT') {
    window.postMessage(
      {
        target: VAULTX_INJECTED,
        type: 'EVENT',
        eventName: msg.eventName,
        payload: msg.payload
      },
      targetOrigin
    );
  }

  // Handle pushed responses when the SW was restarted and sendResponse is gone
  if (msg.type === 'VAULTX_PUSH_RESPONSE') {
    window.postMessage(
      {
        target: VAULTX_INJECTED,
        id: msg.id,
        payload: msg.payload
      },
      targetOrigin
    );
  }
});

// Listen for messages from the injected provider
window.addEventListener('message', (event) => {
  // 1. Validate origin (must be same window)
  if (
    event.source !== window ||
    (event.origin !== window.location.origin &&
      event.origin !== 'null' &&
      event.origin !== 'file://')
  )
    return;

  // 2. Validate target
  if (event.data && event.data.target === VAULTX_CONTENT) {
    const { id, payload } = event.data;

    // Forward to background via chrome.runtime.sendMessage
    chrome.runtime.sendMessage(payload, (response) => {
      if (chrome.runtime.lastError) {
        window.postMessage(
          {
            target: VAULTX_INJECTED,
            id,
            payload: { success: false, error: chrome.runtime.lastError.message }
          },
          targetOrigin
        );
        return;
      }

      // Forward response back to injected
      window.postMessage(
        {
          target: VAULTX_INJECTED,
          id,
          payload: response
        },
        targetOrigin
      );
    });
  }
});

function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.setAttribute('src', chrome.runtime.getURL('injected.js'));
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    console.error('VaultX: Provider injection failed.', error);
  }
}

injectScript();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'REPLAY_REQUEST') {
    const { request } = message;

    const headers = new Headers();
    const forbidden = ['host', 'connection', 'content-length', 'origin', 'referer', 'accept-encoding', 'user-agent'];
    
    if (request.requestHeaders) {
      request.requestHeaders.forEach((h: { name: string, value: string }) => {
        try {
          if (!h.name.startsWith(':') && !forbidden.includes(h.name.toLowerCase())) {
            headers.append(h.name, h.value);
          }
        } catch (e) {
          console.warn(`Failed to append header ${h.name}:`, e);
        }
      });
    }

    const init: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.postData && request.postData.text && request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.postData.text;
    }

    fetch(request.url, init)
      .then(async (res) => {
        const body = await res.text();
        sendResponse({ success: true, status: res.status, body });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }
});

console.log('APIInspector Background Script Running with Replay support.');
